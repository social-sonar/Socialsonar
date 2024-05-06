import { findContacts } from '@/lib/data/common'
import { CleanPhoneData, FlattenContact } from '@/lib/definitions'
import { dateObject } from '@/lib/utils'
import { ContactMergeStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { phone } from 'phone'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') as string
  const contacts = await findContacts(userId)

  const normalizeContact = <C extends Omit<(typeof contacts)[number], 'firstContacts'>>(
    contact: C,
  ): FlattenContact => ({
    id: contact.id,
    userId: contact.userId.toString(),
    name: contact.name,
    nickName: contact.nickName,
    birthday: contact.birthday ? dateObject(contact.birthday): null,
    organizations: contact.organizations.map((item) => ({
      ...item.organization, 
    })),
    phoneNumbers: contact.phoneNumbers.map((item): CleanPhoneData => {
      let phoneProcesed = phone(item.phoneNumber.number)
      return {
        ...phoneProcesed,
        ...item.phoneNumber,
      }
    }),
    occupations: contact.occupations.map((item) => ({ ...item.ocuppation })),
    photos: contact.photos.map((item) => ({ ...item.photo })),
    addresses: contact.addresses.map((item) => ({ ...item.address })),
    emails: contact.emails.map((item) => ({ ...item.email })),
    location:
      contact.phoneNumbers[0] &&
      phone(contact.phoneNumbers[0].phoneNumber.number) &&
      phone(contact.phoneNumbers[0].phoneNumber.number).countryIso2
        ? phone(contact.phoneNumbers[0].phoneNumber.number).countryIso2
        : null,
    source: contact.googleContacts.length > 0 ? 'google' : 'custom',
  })

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
