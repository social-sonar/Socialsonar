import { Prisma, Contact } from '@prisma/client'
import prisma from './prisma'
import { ContactCreate, GoogleResponse } from './definitions'

export const syncGoogleContacts = async (
  people: GoogleResponse[],
): Promise<void> => {
  const payload: Prisma.ContactUncheckedCreateInput[] = people.map(
    (person: GoogleResponse): ContactCreate => ({
      name: (person.names && person.names[0].displayName) || 'Contact',
      phoneNumber:
        (person.phoneNumbers && person.phoneNumbers![0].canonicalForm) ||
        '0000-0000',
      email: (person.emailAddresses && person.emailAddresses[0].value) || null,
      address: (person.addresses && person.addresses[0].formattedValue) || null,
      occupation: (person.occupations && person.occupations[0].value) || null,
      organization:
        (person.organizations && person.organizations[0].name) || null,
      photoUrl: (person.photos && person.photos[0].url) || null,
      userId: 1,
    }),
  )
  await prisma.contact.createMany({ data: payload })
}

export const findContacts = async (userId: bigint): Promise<Contact[]> =>
  await prisma.contact.findMany({ where: { userId: userId } })
