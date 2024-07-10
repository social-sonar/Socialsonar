'use server'

import prisma from '@/db'
import { HomeBase } from '@prisma/client'
import { LocationSetData } from '../definitions'

export const userHomeBases = async (
  userId: string,
): Promise<Pick<HomeBase, 'location' | 'active'>[]> =>
  await prisma.homeBase.findMany({
    where: {
      userId,
    },
    select: {
      location: true,
      active: true,
    },
  })

export const upsertLocation = async ({
  createData,
  updateData,
}: LocationSetData): Promise<Pick<HomeBase, 'location' | 'active'> | undefined> => {
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
        location: true,
        active: true,
      },
    })
  } else if (createData)
    return await prisma.homeBase.create({
      data: {
        ...createData,
      },
      select: {
        location: true,
        active: true,
      },
    })
}
