import nextauth from "@/auth"
export const GET = nextauth.handlers.GET
export const POST = nextauth.handlers.POST
export const runtime = "edge"