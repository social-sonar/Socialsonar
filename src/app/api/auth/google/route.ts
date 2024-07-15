// src/app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server'
import NextAuth from '@/auth'
import { google } from 'googleapis'
import { googleScopes } from '@/lib/utils/google'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.DOMAIN}/api/oauth2callback`,
)

export async function GET() {
  const session = await NextAuth.auth()

  if (!session) {
    return NextResponse.json({ Error: session })
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: googleScopes,
    prompt : 'consent'
  })

  return NextResponse.redirect(url)
}
