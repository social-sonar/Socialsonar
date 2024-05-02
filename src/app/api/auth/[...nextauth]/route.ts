import nextauth from "@/auth"
export const GET = nextauth.handlers.GET
export const POST = nextauth.handlers.POST

export const runtime: string = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';
