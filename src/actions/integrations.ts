'use server'

import nextauth from '@/auth'
import prisma from '@/db'
import { syncGoogleContacts } from '@/lib/data/common'
import { CustomSession, GoogleContactMainResponse, GoogleResponse } from '@/lib/definitions'
import { GaxiosResponse } from 'gaxios'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { redirect } from 'next/navigation'

type PeopleRequestResult = {
  syncToken: string
  data: GoogleResponse[]
}

const refreshToken = async (session: CustomSession, oauth2Client: OAuth2Client) => {
  oauth2Client.setCredentials({ refresh_token: session.refreshToken })
  const { credentials } = await oauth2Client.refreshAccessToken()
  session.accessToken = credentials.access_token!
  session.expiresAt = Date.now() + credentials.expiry_date!
  oauth2Client.setCredentials({ access_token: session.accessToken })
}

const requestPeopleAPI = async (oauth2Client: OAuth2Client, syncToken?: string): Promise<PeopleRequestResult> => {
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
      personFields: 'names,emailAddresses,addresses,phoneNumbers,photos,organizations,occupations,birthdays',
      requestSyncToken: true,
      syncToken,
    })
    data.push(...(response.data.connections! || []))
    nextPageToken = response.data.nextPageToken
  } while (nextPageToken)

  return { syncToken: response.data.nextSyncToken!, data }
}

export async function fetchGoogleContacts(userId: string) {
  const session = (await nextauth.auth()) as CustomSession

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URL,
  )

  oauth2Client.setCredentials({ access_token: session.accessToken })

  const existingSyncToken = await prisma.googleSyncToken.findFirst({
    where: {
      userId: userId,
    },
    select: {
      token: true,
    },
  })
  // Fetch the user's Google Contacts
  let response: PeopleRequestResult
  try {
    response = await requestPeopleAPI(oauth2Client, existingSyncToken?.token)
  } catch (error: unknown) {
    try {
      await refreshToken(session, oauth2Client)
      response = await requestPeopleAPI(oauth2Client, existingSyncToken?.token)
    } catch (error: unknown) {
      throw error
    }
  }

  if (existingSyncToken?.token) {
    await prisma.googleSyncToken.update({
      where: {
        userId: userId,
      },
      data: {
        token: response.syncToken,
      },
    })
  } else {
    await prisma.googleSyncToken.create({
      data: {
        userId: userId,
        token: response.syncToken,
      },
    })
  }

  if (response.data) await syncGoogleContacts(response.data, userId)
  redirect('/contacts-list')
}
