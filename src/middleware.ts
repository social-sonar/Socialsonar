import { NextRequest, NextResponse } from "next/server";
import nextauth from "@/auth"

export default async function middleware(request : NextRequest) {
    try {
        const user = await nextauth.auth()
        if (!user) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Error validating token:', error);
        return NextResponse.redirect(new URL('/', request.url));
    }
}

export const config = {
    matcher: ['/((?!$|api|_next/static|_next/image|favicon.ico|u).*)']
};