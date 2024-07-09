'use server'

import prisma from '@/db'
import { GoogleAccount } from '@prisma/client'
import { getSession } from '@/lib/utils/common'

export async function getGoogleAccounts() {
  const session = await getSession()

  return prisma.userGoogleAccount.findMany({
    where: {
      userId: session?.user.id,
    },
    include: {
      googleAccount: true,
    },
  })
}
export async function editGoogleAccount(
  id: string,
  googleAccount: GoogleAccount,
) {
  const session = await getSession()

  const userGoogleAccount = await prisma.userGoogleAccount.findFirst({
    where: {
      id,
      userId: session?.user.id,
    },
  })

  if (!userGoogleAccount) {
    throw new Error('User Google Account not found')
  }

  return prisma.googleAccount.update({
    where: {
      id: userGoogleAccount.googleAccountId,
    },
    data: {
      ...googleAccount,
    },
  })
}
