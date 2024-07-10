'use server'

import * as Sentry from '@sentry/nextjs'
import prisma from '@/db'
import {
  pullAndSyncGoogleContacts,
  restoreContactsInGoogle,
} from '@/lib/data/common'
import {
  BackupFileData,
  GoogleContactMainResponse,
  GoogleResponse,
} from '@/lib/definitions'
import { refreshToken } from '@/lib/utils/google'

import { getSession } from '../../../lib/utils/common'
import { GaxiosResponse } from 'gaxios'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'

type PeopleRequestResult = {
  syncToken: string
  data: GoogleResponse[]
}
export const requestPeopleAPI = async (
  oauth2Client: OAuth2Client,
  syncToken?: string | null,
): Promise<PeopleRequestResult> => {
  let data: GoogleResponse[] = []
  let nextPageToken: string | undefined | null = ''
  let response: GaxiosResponse<GoogleContactMainResponse>

  const people = google.people({
    version: 'v1',
    auth: oauth2Client,
  })
  do {
    try {
      response = await people.people.connections.list({
        resourceName: 'people/me',
        pageToken: nextPageToken,
        sortOrder: 'LAST_MODIFIED_DESCENDING',
        pageSize: 1000,
        personFields:
          'names,emailAddresses,addresses,phoneNumbers,photos,organizations,occupations,birthdays',
        requestSyncToken: true,
        syncToken: syncToken ?? undefined,
      })
    } catch (error) {
      console.log('[Google sync] Making a full sync')
      response = await people.people.connections.list({
        resourceName: 'people/me',
        pageToken: nextPageToken,
        sortOrder: 'LAST_MODIFIED_DESCENDING',
        pageSize: 1000,
        personFields:
          'names,emailAddresses,addresses,phoneNumbers,photos,organizations,occupations,birthdays',
      })
    }
    data.push(...(response.data.connections! || []))
    nextPageToken = response.data.nextPageToken
  } while (nextPageToken)

  return { syncToken: response.data.nextSyncToken!, data }
}
async function fetchGoogleContacts(
  googleAccountId: string,
  ignoreSyncToken = false,
) {
  const session = await getSession()

  const userId = session.user.id

  const userGoogleAccount = await prisma.userGoogleAccount.findFirst({
    where: {
      googleAccountId,
      userId,
    },
    include: {
      googleAccount: true,
    },
  })

  if (!userGoogleAccount) {
    throw new Error(`Google Account not found ${googleAccountId}`)
  }

  const googleAccount = userGoogleAccount.googleAccount

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URL,
  )

  oauth2Client.setCredentials({
    access_token: googleAccount.accessToken,
    refresh_token: googleAccount.refreshToken,
  })

  // Fetch the user's Google Contacts
  let response: PeopleRequestResult
  try {
    response = await requestPeopleAPI(
      oauth2Client,
      ignoreSyncToken ? null : googleAccount.token,
    )
  } catch (error: unknown) {
    try {
      await refreshToken(googleAccount, oauth2Client)
      response = await requestPeopleAPI(
        oauth2Client,
        ignoreSyncToken ? null : googleAccount.token,
      )
    } catch (error: unknown) {
      console.error('catched error 2 level', error)

      throw error
    }
    console.error('catched error 1 level', error)
  }

  if (!ignoreSyncToken) {
    await prisma.googleAccount.update({
      where: {
        id: googleAccountId,
      },
      data: {
        token: response.syncToken,
      },
    })
  }

  return response
}
export async function pullGoogleContacts(googleAccountId: string) {
  const session = await getSession()

  try {
    const response = await fetchGoogleContacts(googleAccountId)
    if (response.data) {
      return {
        data: pullAndSyncGoogleContacts(
          response.data,
          session.user.id,
          googleAccountId,
        ),
      }
    } else {
      Sentry.captureException(response)
      console.error('unhandled error', response)

      return { msg: 'error from google syncing' }
    }
  } catch (error) {
    Sentry.captureException(error)
    console.error(error)

    return { msg: 'error from google syncing' }
  }
}
export const requestGmailAPI = async (
  oauth2Client: OAuth2Client,
): Promise<Array<INameEmailArray | null>> => {
  let nextPageToken: string | undefined | null = ''

  let dataArray: any[] = []

  const gmail = google.gmail({
    version: 'v1',
    auth: oauth2Client,
  })

  const messageListResponse = await gmail.users.messages.list({
    userId: 'me',
    pageToken: nextPageToken,
    maxResults: 10, //TODO: Make it dinamic
  })

  if (messageListResponse.data && messageListResponse.data.messages) {
    for (let i = 0; i < messageListResponse.data.messages.length; i++) {
      const messageId = messageListResponse.data.messages[i].id

      if (messageId) {
        const emailData = await gmail.users.messages.get({
          userId: 'me',
          id: messageId,
        })

        emailData.data.payload?.headers?.forEach((headerObj) => {
          if (
            headerObj.name === 'From' &&
            !dataArray.includes(headerObj.value)
          ) {
            dataArray.push(headerObj.value)
          }

          if (headerObj.name === 'To') {
            const toArraySplit = headerObj.value?.split(',') || []

            for (let j = 0; j < toArraySplit?.length; j++) {
              if (!dataArray.includes(toArraySplit[j])) {
                dataArray.push(toArraySplit[j])
              }
            }
          }
        })
      }
    }
  }

  const nameEmailPattern = /^(?:"?([^"]*)"?\s)?<([^>]+)>$/
  const nameEmailArray = dataArray.map((item) => {
    const match = item.match(nameEmailPattern)
    return match ? { name: match[1]?.trim() || '', email: match[2] } : null
  })

  return nameEmailArray
}

interface INameEmailArray {
  name: string
  email: string
}

const processAddGmailContactToDB = async (
  nameEmailArray: Array<INameEmailArray | null>,
  userId: string,
  googleAccountId: string,
  userEmail: string | null | undefined,
) => {
  for (let i = 0; i < nameEmailArray.length; i++) {
    const element = nameEmailArray[i]

    if (element && element.email !== userEmail) {
      const resp = await prisma.contact.findFirst({
        where: { name: element.name },
      })

      if (!resp) {
        const newContact = await prisma.contact.create({
          data: {
            name: element.name,
            nickName: null,
            birthday: null,
            userId: userId,
            googleAccountId,
          },
        })

        let emailId: number
        const existEmail = await prisma.email.findFirst({
          where: { address: element.email },
        })

        if (!existEmail) {
          const emailResult = await prisma.email.create({
            data: { address: element.email },
          })
          emailId = emailResult.id
        } else {
          emailId = existEmail.id
        }

        await prisma.contactEmail.create({
          data: {
            contactId: newContact.id,
            emailId,
          },
        })
      }
    }
  }
}
async function fetchGmailContacts(googleAccountId: string) {
  const session = await getSession()

  const userId = session.user.id

  const userGoogleAccount = await prisma.userGoogleAccount.findFirst({
    where: {
      googleAccountId,
      userId,
    },
    include: {
      googleAccount: true,
    },
  })

  if (!userGoogleAccount) {
    throw new Error(`Google Account not found ${googleAccountId}`)
  }

  const googleAccount = userGoogleAccount.googleAccount

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URL,
  )

  oauth2Client.setCredentials({ access_token: googleAccount.accessToken })

  // Fetch the user's Google Contacts
  let response: Array<INameEmailArray | null>
  try {
    response = await requestGmailAPI(oauth2Client)
  } catch (error: unknown) {
    try {
      await refreshToken(googleAccount, oauth2Client)
      response = await requestGmailAPI(oauth2Client)
    } catch (error: unknown) {
      console.error('catched error 2 level', error)

      throw error
    }
    console.error('catched error 1 level', error)
  }

  await processAddGmailContactToDB(
    response,
    userId,
    googleAccountId,
    session.user.email,
  )

  return response
}
export async function pullGmailContacts(googleAccountId: string) {
  try {
    const response = await fetchGmailContacts(googleAccountId)
    return response
  } catch (error) {
    Sentry.captureException(error)
    console.error(error)

    return { msg: 'error from Gmail syncing' }
  }
}

export async function prepareBackup(googleAccountId: string) {
  const session = await getSession()
  const response = await fetchGoogleContacts(googleAccountId, true)
  if (response.data) {
    const responseText = JSON.stringify({
      data: response.data,
      googleAccountId,
    })

    const encondedText = Buffer.from(responseText, 'utf8').toString('base64')

    const userGoogleAccount = await prisma.userGoogleAccount.findFirst({
      where: {
        googleAccountId: googleAccountId,
        userId: session.user.id,
      },
      select: {
        googleAccount: {
          select: {
            email: true,
          },
        },
      },
    })

    return {
      email: userGoogleAccount?.googleAccount.email,
      data: encondedText,
      date: new Date(),
      user: session.user.name,
    } as BackupFileData
  }
}

export async function restoreBackup(data: string) {
  const decodedText = Buffer.from(data, 'base64').toString('utf8')
  const backupData = JSON.parse(decodedText)

  const googleAccount = await prisma.googleAccount.findFirst({
    where: {
      id: backupData.googleAccountId,
    },
  })

  return restoreContactsInGoogle(googleAccount!, backupData.data)
}
