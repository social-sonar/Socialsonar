export const maxDuration = 600

import { GoogleSyncButton } from '@/components/Sync'
import nextauth from '@/auth'

export default async function Page() {
  const session = await nextauth.auth()
  return (
    <div className="flex flex-col items-center justify-center">
      <GoogleSyncButton userId={session?.user?.id!} />
    </div>
  )
}
