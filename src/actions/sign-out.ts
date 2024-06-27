'use server'
import nextauth from '@/auth'

export async function signOut() {
    await nextauth.signOut()
}