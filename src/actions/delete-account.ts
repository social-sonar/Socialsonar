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

export async function deleteAccount(
  session: Session,
) : State {
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
          googleSyncTokens: true,
          contact: true,
        },
      });
      return {message: "Success", errors: []}
    } catch (error) {
      console.log(error);      
      return {
        message: "there was an error",
        errors : [error]
      }
    }
  } catch (error){
    console.log(error);      
    return {
      message: "there was an error",
      errors: [error]
    }
  }
}