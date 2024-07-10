'use server'

import prisma from '@/db'
import { HomeBase } from '@prisma/client'

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
