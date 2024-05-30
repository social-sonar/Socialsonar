'use server'

import nextauth from '@/auth'
import prisma from '@/db'
import { syncGoogleContacts } from '@/lib/data/common'
import {
  CustomSession,
  GoogleContactMainResponse,
  GoogleResponse,
} from '@/lib/definitions'
import { GoogleAccount } from '@prisma/client'
import { GaxiosResponse } from 'gaxios'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { redirect } from 'next/navigation'

type PeopleRequestResult = {
  syncToken: string
  data: GoogleResponse[]
}

const refreshToken = async (
  googleAccountSession: GoogleAccount,
  oauth2Client: OAuth2Client,
) => {
  oauth2Client.setCredentials({
    refresh_token: googleAccountSession.refreshToken,
  })
  const { credentials } = await oauth2Client.refreshAccessToken()
  googleAccountSession.accessToken = credentials.access_token!
  oauth2Client.setCredentials({
    access_token: googleAccountSession.accessToken,
  })
  prisma.googleAccount.update({
    data: {
      accessToken: googleAccountSession.accessToken,
      refreshToken: googleAccountSession.refreshToken,
    },
    where: {
      id: googleAccountSession.id,
    },
  })
}

const requestPeopleAPI = async (
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

export async function fetchGoogleContacts(googleAccountId: string) {
  const session = (await nextauth.auth()) as CustomSession

  const userId = session.user.id

  const userGoogleAccount = await prisma.userGoogleAccount.findFirst({
    where: {
      googleAccountId,
      userId: session.user.id,
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
    response = await requestPeopleAPI(oauth2Client, googleAccount.token)
  } catch (error: unknown) {
    try {
      await refreshToken(googleAccount, oauth2Client)
      response = await requestPeopleAPI(oauth2Client, googleAccount.token)
    } catch (error: unknown) {
      throw error
    }
  }
  await prisma.googleAccount.update({
    where: {
      id: googleAccountId,
    },
    data: {
      token: response.syncToken,
    },
  })

  if (response.data) {
    syncGoogleContacts(response.data, userId, googleAccountId)
    return
  }
  // redirect('/contacts-list')
}
