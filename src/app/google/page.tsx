import { findContacts, syncGoogleContacts } from '@/lib/data'
import { GoogleResponse } from '@/lib/definitions'
import { syncContacts, createOAuth2Client } from '@/lib/integrations/google'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Example({
  searchParams,
}: {
  searchParams?: {
    code?: string
  }
}) {
  if (searchParams?.code) {
    const oauth = createOAuth2Client()
    const results: GoogleResponse[] = await syncContacts(
      oauth,
      searchParams.code,
    )
    await syncGoogleContacts(results)
  }
  // const contacts = await findContacts(1n) // dummy search
  return redirect('/contacts-list')
}
