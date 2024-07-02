// src/app/api/oauth2callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import prisma from '@/db'
import NextAuth from '@/auth'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_SITE_URL}/api/oauth2callback`,
)

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  const session = await NextAuth.auth()

  if (!session) {
    return NextResponse.json({ Error: session })
  }
  if (!code) {
    return NextResponse.json({ error: 'No code found' }, { status: 400 })
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    if (!tokens.refresh_token) {
      throw Error('No refresh token during the callback')
    }

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data } = await oauth2.userinfo.get()

    await prisma.googleAccount.upsert({
      where: { googleId: data.id! },
      update: {
        email: data.email!,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        users: {
          connectOrCreate: {
            create: {
              userId: session.user.id,
            },
            where: {
              id: session.user.id,
            },
          },
        },
      },
      create: {
        googleId: data.id!,
        email: data.email!,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        users: {
          connectOrCreate: {
            create: {
              userId: session.user.id,
            },
            where: {
              id: session.user.id,
            },
          },
        },
      },
    })

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/sync?success`,
    )
  } catch (error) {
    console.error('Error during OAuth2 callback:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/sync?error`,
    )
  }
}
