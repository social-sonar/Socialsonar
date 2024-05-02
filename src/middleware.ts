import { NextResponse } from "next/server";

export default async function middleware(request : any) {
    const cookieData: Map<string, any> = request.cookies._parsed;
    if (!cookieData.get('authjs.session-token')?.['value']) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!$|api|_next/static|_next/image|favicon.ico).*)']
};