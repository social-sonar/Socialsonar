import { GoogleSyncButton } from "@/components/Sync";
import nextauth from "@/auth";


export default async function Page() {
    const session = await nextauth.auth()
    return <div>
        <GoogleSyncButton userId={session?.user?.id!} />
    </div>
}