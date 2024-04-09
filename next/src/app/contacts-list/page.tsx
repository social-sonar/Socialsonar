
import { findContacts, syncGoogleContacts } from "@/lib/data"
import { GoogleResponse } from "@/lib/definitions"
import { syncContacts, createOAuth2Client } from "@/lib/integrations/google"
import Link from "next/link"


export default async function Example(
  {
    searchParams
  }: {
    searchParams?: {
      code?: string,
    }
  }
) {
  if (searchParams?.code) {
    const oauth = createOAuth2Client()
    const results: GoogleResponse[] = await syncContacts(oauth, searchParams.code)
    await syncGoogleContacts(results)
  }
  const contacts = await findContacts(1n) // dummy search
  if (contacts.length == 0) {
    return <p>No contacts yet. Sync your contacts <Link href={'/sync'} className="text-teal-500">here</Link></p>
  }
  return (
    <ul role="list" className="divide-y divide-gray-800 max-w-7xl w-full px-24" >
      {contacts.map((contact) => (
        <li key={contact.phoneNumber} className="flex justify-between gap-x-6 py-5">
          <div className="flex min-w-0 gap-x-4">
            <img
              className="h-12 w-12 flex-none rounded-full bg-gray-800"
              src={contact.photoUrl || '/default.png'}
              alt=""
              width={25} height={25}
            />
            <div className="min-w-0 flex-auto">
              <div className="flex">

                <p className="text-sm font-semibold leading-6 text-white">
                  {contact.name}
                </p>
                <p className="mt-1 truncate text-sm leading-5 text-gray-400 ml-2">
                  {contact.phoneNumber}
                </p>
              </div>
              <p className="mt-1 truncate text-xs leading-5 text-gray-400">
                {contact.email || "No email address"}
              </p>
            </div>
          </div>
          <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
            <p className="text-sm leading-6 text-white">{contact.occupation || "Occupation not found"}</p>
            {'3h ago' ? (
              <p className="mt-1 text-xs leading-5 text-gray-400">
                Last seen{' '}
                <time dateTime={'2023-01-23T13:23Z'}>
                  {'3h ago'}
                </time>
              </p>
            ) : (
              <div className="mt-1 flex items-center gap-x-1.5">
                <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-xs leading-5 text-gray-400">Online</p>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
