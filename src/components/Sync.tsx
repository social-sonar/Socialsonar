import googleContactsLogo from '@/images/logos/google-contacts.svg'

// import { fetchGoogleContacts } from '@/actions'
import SyncButton from './common/form-button'

export function GoogleSyncButton({
  googleAccountId,
}: {
  googleAccountId: string
}) {
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    // const response = await fetchGoogleContacts(googleAccountId)
  }

  return (
    <form onSubmit={handleSubmit}>
      <SyncButton title="Sync Google contacts" logo={googleContactsLogo} />
    </form>
  )
}
