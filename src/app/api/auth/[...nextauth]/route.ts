import nextauth from "@/auth"
export const GET = nextauth.handlers.GET
export const POST = nextauth.handlers.POST

export const runtime: "edge" | "nodejs" | "experimental-edge" | undefined = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';
