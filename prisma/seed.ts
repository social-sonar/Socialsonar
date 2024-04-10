import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
    {
        name: 'Jonh doe',
        email: 'jonh@test.com',
        password: '123'
    },
    {
        name: 'Steve Jobs',
        email: 'steve@test.com',
        password: '456'
    },
    {
        name: 'Chris Azumo',
        email: 'chris@test.com',
        password: '789'
    },
]

async function main() {
    console.log(`Start seeding ...`)
    for (const u of userData) {
        const user = await prisma.user.create({
            data: u,
        })
        console.log(`Created user with id: ${user.id}`)
    }
    console.log(`Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })