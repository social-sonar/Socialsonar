import nextAuth from '@/auth'
import { CustomSession } from '@/lib/definitions'
import { GoogleAccount } from '@prisma/client'
import { OAuth2Client } from 'google-auth-library'
import { google, people_v1 } from 'googleapis'
import { getGoogleAccount } from '../data/google/contacts'

export const getSession = async () => {
  return (await nextAuth.auth()) as CustomSession
}

export const getContactIdFromResourceName = (
  payload: people_v1.Schema$Person,
) => {
  return payload.resourceName!.slice(7)
}

export const getOAuthClient = async (
  userId: string,
  googleAccount?: GoogleAccount,
): Promise<OAuth2Client> => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URL,
  )
  if (!googleAccount) {
    const userGoogleAccount = await getGoogleAccount(userId)
    googleAccount = userGoogleAccount?.googleAccount
  }
  oauth2Client.setCredentials({
    access_token: googleAccount!.accessToken,
  })

  return oauth2Client
}
