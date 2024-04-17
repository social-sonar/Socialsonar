import { findContacts } from '@/lib/data'
import { FlattenContact } from '@/lib/definitions'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') as string
  const contacts = await findContacts(userId)

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
