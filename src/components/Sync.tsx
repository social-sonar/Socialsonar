import googleContactsLogo from '@/images/logos/google-contacts.svg'

import { fetchGoogleContacts } from '@/actions'
import SyncButton from './common/form-button'


export function GoogleSyncButton({ userId }: { userId: string }) {
    const action = fetchGoogleContacts.bind(null, userId)
    return (
        <form action={action}>
            <SyncButton title='Google contacts' logo={googleContactsLogo} />
        </form>
    )
}