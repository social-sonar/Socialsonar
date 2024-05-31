'use server'
import nextauth from '@/auth'

export async function signOut() {
    return nextauth.signOut({redirect: false, redirectTo: process.env.NEXT_PUBLIC_SITE_URL})
}