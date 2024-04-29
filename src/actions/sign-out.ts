'use server'
import nextauth from '@/auth'

export async function signOut() {
    return nextauth.signOut()
}