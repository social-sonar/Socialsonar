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
  createData,
  updateData,
}: LocationSetData): Promise<
  Pick<HomeBase, 'id' | 'location' | 'active'> | undefined
> => {
  if (updateData) {
    const { homeBaseId, ...rest } = updateData
    return await prisma.homeBase.update({
      where: {
        id: homeBaseId,
      },
      data: {
        ...rest,
      },
      select: {
        id: true,
        location: true,
        active: true,
      },
    })
  } else if (createData) {
    const session = await getSession()
    return await prisma.homeBase.create({
      data: {
        ...createData,
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
