'use server'

import prisma from '@/db'
import { HomeBase } from '@prisma/client'
import { LocationSetData } from '../definitions'
import { getSession } from '../utils/common'

export const userHomeBases = async (
  userId: string,
): Promise<Pick<HomeBase, 'id' | 'location' | 'active'>[]> =>
  await prisma.homeBase.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      location: true,
      active: true,
    },
  })

export const upsertLocation = async ({
  data,
  homeBaseId,
}: LocationSetData): Promise<
  Pick<HomeBase, 'id' | 'location' | 'active'> | undefined
> => {
  if (homeBaseId) {
    return await prisma.homeBase.update({
      where: {
        id: homeBaseId,
      },
      data: {
        ...data,
        active: false // After updating, the new location must be set to 'not in use'
      },
      select: {
        id: true,
        location: true,
        active: true,
      },
    })
  } else {
    const session = await getSession()
    return await prisma.homeBase.create({
      data: {
        ...data,
        userId: session.user.id,
      },
      select: {
        id: true,
        location: true,
        active: true,
      },
    })
  }
}

export const changeHomeBaseStatus = async (
  homeBaseId: string,
  active: boolean,
) => {
  if (active) {
    const session = await getSession()
    await prisma.homeBase.updateMany({
      where: {
        userId: session.user.id,
      },
      data: {
        active: false,
      },
    })
  }
  await prisma.homeBase.update({
    where: {
      id: homeBaseId,
    },
    data: {
      active,
    },
  })
}

export const removeHomeBase = async (homeBaseId: string) =>
  await prisma.homeBase.delete({
    where: {
      id: homeBaseId,
    },
  })
