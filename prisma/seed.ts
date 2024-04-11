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

    await prisma.contact.create(
        {
            data:
            {
                userId: 1,
                name: 'Nikola Tesla',
                nickName: 'Nick',
                organizations: {
                    create: { organization: { create: { name: 'Azumo' } } }
                },
                phoneNumbers: {
                    create: { phoneNumber: { create: { number: '0000-0000', type: 'WORK' } } }
                },
                occupations: {
                    create: { ocuppation: { create: { name: 'Software Engineer' } } }
                },
                photos: {
                    create: { photo: { create: { url: 'https://as2.ftcdn.net/v2/jpg/03/64/21/11/1000_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg' } } }
                },
                addresses: {
                    create: { address: { create: { countryCode: 'us', city: 'California', postalCode: '90001', streetAddress: "9th" } } }
                },
                emails: {
                    create: { email: { create: { address: 'nickola@spark.com' } } }
                },
            }
        }
    )

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