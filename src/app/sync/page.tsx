import { GoogleSyncButton } from "@/components/Sync";
import nextauth from "@/auth";


export default async function Page() {
    const session = await nextauth.auth()
    return <div className="flex flex-col justify-center items-center">
        <GoogleSyncButton userId={session?.user?.id!} />
    </div>
}