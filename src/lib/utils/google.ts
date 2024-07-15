import prisma from '@/db'
import { GoogleAccount } from '@prisma/client'
import { OAuth2Client } from 'google-auth-library'

export const refreshToken = async (
  googleAccount: GoogleAccount,
  oauth2Client: OAuth2Client,
) => {
  oauth2Client.setCredentials({
    refresh_token: googleAccount.refreshToken,
  })
  const { credentials } = await oauth2Client.refreshAccessToken()
  googleAccount.accessToken = credentials.access_token!
  googleAccount.refreshToken = credentials.refresh_token!
  oauth2Client.setCredentials({
    access_token: googleAccount.accessToken,
    refresh_token: googleAccount.refreshToken,
  })

  // Sentry.captureMessage(
  //   'tokens.refresh_token' + tokens.refresh_token,
  //   'debug',
  // )

  let googleAccountDataToUpdate: {
    accessToken: string
    refreshToken?: string
  } = {
    accessToken: googleAccount.accessToken,
  }

  if (googleAccount.refreshToken) {
    googleAccountDataToUpdate.refreshToken = googleAccount.refreshToken
  }

  console.log(
    'refresh_token: googleAccount.refreshToken',
    oauth2Client.credentials.refresh_token,
    googleAccountDataToUpdate.refreshToken,
  )

  prisma.googleAccount.update({
    data: googleAccountDataToUpdate,
    where: {
      id: googleAccount.id,
    },
  })
}

export const googleScopes = [
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://mail.google.com/',
]
