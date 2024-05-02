import nextauth from "@/auth"
export const GET = nextauth.handlers.GET
export const POST = nextauth.handlers.POST

const runtime: string = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';

export { runtime };