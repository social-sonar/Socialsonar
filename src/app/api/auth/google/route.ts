// src/app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server'
import NextAuth from '@/auth'
import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_SITE_URL}/api/oauth2callback`,
)

export async function GET() {
  const session = await NextAuth.auth()

  if (!session) {
    return NextResponse.json({ Error: session })
  }
  const scopes = [
    'https://www.googleapis.com/auth/contacts.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ]

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  })

  return NextResponse.redirect(url)
}
