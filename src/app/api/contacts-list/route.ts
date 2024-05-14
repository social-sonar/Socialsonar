import { findContacts, normalizeContact } from '@/lib/data/common'
import { CleanPhoneData, FlattenContact } from '@/lib/definitions'
import { dateObject } from '@/lib/utils'
import { ContactMergeStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { phone } from 'phone'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') as string
  const contacts = await findContacts(userId)

  const responseContacts: FlattenContact[] = contacts.map((contact) => {
    const normalizedContact = normalizeContact(contact)
    if (contact.firstContacts.length > 0) {
      normalizedContact.duplicates = contact.firstContacts
        .filter((contact) => contact.mergeStatus == ContactMergeStatus.PENDING)
        .map((contact) => normalizeContact(contact.secondContact))
    }

    return normalizedContact
  })

  return NextResponse.json(responseContacts)
}

export async function POST(req: Request) {
  const body = await req.json()
}

export async function PUT(req: Request) {
  const body = await req.json()
}

export async function DELETE(req: Request) {
  const body = await req.json()
}
