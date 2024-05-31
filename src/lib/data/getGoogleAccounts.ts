"use server"

import prisma from '@/db'
import NextAuth from '@/auth'

export default async function getGoogleAccounts() {
  const session = await NextAuth.auth()

  return prisma.userGoogleAccount.findMany({
    where: {
      userId: session?.user.id
    },
    include:{
      googleAccount: true
    }
  })
}
