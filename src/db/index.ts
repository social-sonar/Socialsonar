import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const neon = new Pool({ connectionString: process.env.POSTGRES_PRISMA_URL })
const adapter = new PrismaNeon(neon)

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })


if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
