import SyncButton from "@/components/Sync";
import { authUrl } from "@/lib/integrations/google";
import logoGoogleContacts from '@/images/logos/google-contacts.svg'


export default async function Page() {
    const url = authUrl()
    return <div>
        <SyncButton authUrl={url} logo={logoGoogleContacts} title="Google contacts"/>
    </div>
}