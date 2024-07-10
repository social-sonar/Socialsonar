import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool as NeonPool } from '@neondatabase/serverless'
import { Pool as PgPool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const connectionString = `${process.env.POSTGRES_PRISMA_URL}`

let adapter

if (process.env.NODE_ENV === 'production') {
  const neon = new NeonPool({
    connectionString,
  })
  adapter = new PrismaNeon(neon)
} else {
  const pool = new PgPool({ connectionString })
  adapter = new PrismaPg(pool)
}

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
