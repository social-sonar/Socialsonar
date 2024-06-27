// src/app/api/contacts-list/route.ts
import { findContacts, normalizeContact } from '@/lib/data/common'
import { FlattenContact } from '@/lib/definitions'
import { getSession } from '@/lib/utils/common'
import { ContactMergeStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {

  const session = await getSession()
  if (!session || !session.user) return NextResponse.json('Unauthorized', {status: 403})

  const userId = session.user.id
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
