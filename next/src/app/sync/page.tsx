import SyncButton from "@/components/Sync";
import { createOAuth2Client, generateAuthUrl } from "@/lib/integrations/google";
import logoGoogleContacts from '@/images/logos/google-contacts.svg'


export default async function Page() {
    const oauth = createOAuth2Client()
    const url = generateAuthUrl(oauth)
    return <div>
        <SyncButton authUrl={url} logo={logoGoogleContacts} title="Google contacts"/>
    </div>
}