'use server'
import nextauth from '@/auth'

export async function signIn() {
    return nextauth.signIn('google')
}