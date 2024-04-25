import { NextResponse } from "next/server"

import { auth } from "@/auth"


export default async function (request: any) {
    // routes protection works as expected when the user is unauthenticated. However, if the user logs in this specific statement `const session = await auth(request)` throws the following error:
    // **PrismaClient is not configured to run in Vercel Edge Functions or Edge Middleware**

    // this workaround fixes the above as 'authjs.session-token' only exists when the user is authenticated
    // Note that as far as I know, nextjs handles cookies as HTTP-only
    const cookieData: Map<string, any> = request.cookies._parsed
    const session = await auth(request)
    console.log("Middleware response:", session, request);
    if (!session?.user) {
        // return NextResponse.redirect(new URL('/', request.url))
    }
    // if (!cookieData.get('authjs.session-token')) {
    // }
}

// protect all routes except the ones that match this pattern
export const config = { matcher: ['/((?!$|api|_next/static|_next/image|favicon.ico).*)'] }
