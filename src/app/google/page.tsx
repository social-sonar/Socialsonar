import { auth } from '@/auth'
import {  syncGoogleContacts } from '@/lib/data'
import { GoogleResponse } from '@/lib/definitions'
import { syncContacts, createOAuth2Client } from '@/lib/integrations/google'
import { redirect } from 'next/navigation'

export default async function Example({
  searchParams,
}: {
  searchParams?: {
    code?: string
  }
}) {
  if (searchParams?.code) {
    const session = await auth()
    const oauth = createOAuth2Client()
    const results: GoogleResponse[] = await syncContacts(
      oauth,
      searchParams.code,
    )
    await syncGoogleContacts(results, session?.user?.id!)
  }
  return redirect('/contacts-list')
}
