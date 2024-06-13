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
    oauth2Client.setCredentials({
      access_token: googleAccount.accessToken,
    })
    prisma.googleAccount.update({
      data: {
        accessToken: googleAccount.accessToken,
        refreshToken: googleAccount.refreshToken,
      },
      where: {
        id: googleAccount.id,
      },
    })
  }