import { findContacts } from '@/lib/data'
import { FlattenContact } from '@/lib/definitions'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const contacts = await findContacts(1) // dummy search

  const responseContacts: FlattenContact[] = contacts.map((contact) => ({
    id: contact.id.toString(),
    userId: contact.userId.toString(),
    name: contact.name,
    nickName: contact.nickName,
    organizations: contact.organizations.map(item => ({ ...item.organization })),
    phoneNumbers: contact.phoneNumbers.map(item => ({ ...item.phoneNumber })),
    occupations: contact.occupations.map(item => ({ ...item.ocuppation })),
    photos: contact.photos.map(item => ({ ...item.photo })),
    addresses: contact.addresses.map(item => ({ ...item.address })),
    emails: contact.emails.map(item => ({ ...item.email })),
  }))

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
