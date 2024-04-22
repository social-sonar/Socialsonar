import { GoogleSyncButton } from "@/components/Sync";
import { auth } from "@/auth";


export default async function Page() {
    const session = await auth()
    return <div>
        <GoogleSyncButton userId={session?.user?.id!} />
    </div>
}