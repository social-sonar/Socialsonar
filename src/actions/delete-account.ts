/* eslint-disable */
// @ts-nocheck

'use server'

import prisma from '@/db'
import { getPhoneNumberType, normalizeContact } from '@/lib/data/common'
import {
  CleanPhoneData,
  CustomSession,
  FlattenContact,
  PlainFields,
} from '@/lib/definitions'
import { dateString } from '@/lib/utils'
import { Address, Email, Occupation, Organization } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'

export type State = {
  errors?: []
  message?: string | null
}

export async function deleteAccount(session: Session): State {
  try {
    if (!session || !session.user) {
      throw new Error('User not authenticated')
    }
    const userId = session.user.id
    try {
      const deletedUser = await prisma.user.delete({
        where: { id: userId },
        include: {
          accounts: true,
          sessions: true,
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
            //If no other account has this google account connect, delete it.
          if (amountOfOtherAccountsConnected == 0) {
            try {
              await prisma.googleAccount.delete({
                where: { id: eachGoogleAccount.googleAccountId },
                include: { contacts: true },
              })
            } catch (error) {
              console.log(error)
            }
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
