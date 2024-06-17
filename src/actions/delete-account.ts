/* eslint-disable */
// @ts-nocheck

'use server'

import prisma from '@/db'
import { getSession } from '@/lib/utils/common'
import { Session } from 'next-auth'

export type State = {
  errors?: []
  message?: string | null
}

export async function deleteAccount(): State {
  try {
    const session = await getSession()
    const userId = session.user.id
    try {
      const deletedUser = await prisma.user.delete({
        where: { id: userId },
        include: {
          accounts: true,
          sessions: true,
          events: true,
          googleAccounts: {
            include: {
              googleAccount: true,
            },
          },
        },
      })
      if (deletedUser.googleAccounts.length > 0) {
        deletedUser.googleAccounts.forEach(async (eachGoogleAccount) => {
          const amountOfOtherAccountsConnected =
            await prisma.userGoogleAccount.count({
              where: {
                googleAccountId: eachGoogleAccount.googleAccountId,
                NOT: {
                  userId: deletedUser.id,
                },
              },
            })
          //If no other account has this google account connected, delete it.
          if (amountOfOtherAccountsConnected == 0) {
            try {
              await prisma.googleAccount.delete({
                where: { id: eachGoogleAccount.googleAccountId },
                include: { contacts: true },
              })
            } catch (error) {
              console.log(error)
            }
          } else {
            prisma.googleAccount.update({
              where: {
                id: eachGoogleAccount.id,
              },
              data: {
                token: null,
              },
            })
          }
        })
      }
      return { message: 'Success', errors: [] }
    } catch (error) {
      console.log(error)
      return {
        message: 'there was an error',
        errors: [error],
      }
    }
  } catch (error) {
    console.log(error)
    return {
      message: 'there was an error',
      errors: [error],
    }
  }
}
