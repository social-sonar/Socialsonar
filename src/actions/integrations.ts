'use server'

import nextauth from '@/auth'
import prisma from '@/db'
import {
  pullAndSyncGoogleContacts,
  restoreContactsInGoogle,
} from '@/lib/data/common'
import {
  backupFileData,
  CustomSession,
  GoogleContactMainResponse,
  GoogleResponse,
} from '@/lib/definitions'
import { refreshToken } from '@/lib/utils/google'

import { getSession } from '../lib/utils/common'
import { GoogleAccount, Prisma } from '@prisma/client'
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
    throw new Error('Google Account not found')
  }

  const googleAccount = userGoogleAccount.googleAccount

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URL,
  )

  oauth2Client.setCredentials({ access_token: googleAccount.accessToken })

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
      throw error
    }
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

  const response = await fetchGoogleContacts(googleAccountId)

  if (response.data) {
    pullAndSyncGoogleContacts(response.data, session.user.id, googleAccountId)
    return {}
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
    } as backupFileData
  }
}