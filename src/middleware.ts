import { NextRequest, NextResponse } from 'next/server'

// regular middleware was failing a lot because it was using edge runtime, that was a limitation
// for using the entire nodejs ecosystem. Google integrations were failing due to it, as the "edge" runtime
// couldn't find some core libraries.

// Note that this approach is documented here: https://nextjs.org/docs/app/building-your-application/authentication#handling-unauthorized-access
export default async function middleware(request: NextRequest) {
  const currentUser = (request.cookies as any)['_parsed'].get(
    'authjs.session-token',
  )?.value

  if (!currentUser) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!$|api|_next/static|_next/image|favicon.ico|u).*)'],
}
