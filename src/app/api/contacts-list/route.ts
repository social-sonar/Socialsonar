import { findContacts } from '@/lib/data'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const contacts = await findContacts(1n)

  const responseContacts = contacts.map((a) => {
    return {
      ...a,
      id: a.id.toString(),
      userId: a.userId.toString(),
    }
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
