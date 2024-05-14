'use server'

import prisma from '@/db'
import { getPhoneNumberType, normalizeContact } from '@/lib/data/common'
import { CleanPhoneData, FlattenContact, PlainFields } from '@/lib/definitions'
import { dateString } from '@/lib/utils'
import { Address, Email, Occupation, Organization } from '@prisma/client'
import { z } from 'zod'

const NameFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'You must enter at least two characters' }),
})

export type State = {
  errors?: []
  message?: string | null
  contact?: FlattenContact
}

export async function saveContact(
  prevState: State | undefined,
  contact: FlattenContact,
) {
  let dataToUpdate: Partial<PlainFields> = {
    name: contact.name,
  }

  if (contact.birthday) {
    dataToUpdate.birthday = dateString({ ...contact.birthday! })
  }

  await prisma.contact.update({
    where: {
      id: contact.id,
    },
    data: dataToUpdate,
  })

  const phoneNumbersIDs = await getPhoneNumberIDs(contact.phoneNumbers)
  await prisma.contactPhoneNumber.deleteMany({
    where: {
      contactId: contact.id,
      phoneNumberId: {
        notIn: phoneNumbersIDs,
      },
    },
  })
  await prisma.contactPhoneNumber.createMany({
    data: phoneNumbersIDs.map((phoneNumberId) => ({
      contactId: contact.id,
      phoneNumberId: phoneNumberId,
    })),
    skipDuplicates: true,
  })

  const occupationsIDs = await getOccupationIDs(contact.occupations)
  await prisma.contactOccupation.deleteMany({
    where: {
      contactId: contact.id,
      occupationId: {
        notIn: occupationsIDs,
      },
    },
  })
  await prisma.contactOccupation.createMany({
    data: occupationsIDs.map((occupationId) => ({
      contactId: contact.id,
      occupationId,
    })),
    skipDuplicates: true,
  })

  const organizationIDs = await getOrganizationIDs(contact.organizations)
  await prisma.contactOrganization.deleteMany({
    where: {
      contactId: contact.id,
      organizationId: {
        notIn: organizationIDs,
      },
    },
  })
  await prisma.contactOrganization.createMany({
    data: organizationIDs.map((organizationId) => ({
      contactId: contact.id,
      organizationId: organizationId,
    })),
    skipDuplicates: true,
  })

  const emailsIDs = await getEmailsIDs(contact.emails)
  await prisma.contactEmail.deleteMany({
    where: {
      contactId: contact.id,
      emailId: {
        notIn: emailsIDs,
      },
    },
  })
  await prisma.contactEmail.createMany({
    data: emailsIDs.map((emailId) => ({
      contactId: contact.id,
      emailId,
    })),
    skipDuplicates: true,
  })

  const addressesIDs = await getAddressIDs(contact.addresses)
  await prisma.contactAddress.deleteMany({
    where: {
      contactId: contact.id,
      addressId: {
        notIn: addressesIDs,
      },
    },
  })
  await prisma.contactAddress.createMany({
    data: addressesIDs.map((addressId) => ({
      contactId: contact.id,
      addressId,
    })),
    skipDuplicates: true
  })

  const contactUpdatedRaw = await prisma.contact.findFirst({
    where: { id: contact.id },
    include: {
      organizations: { select: { organization: { select: { name: true } } } },
      phoneNumbers: {
        select: { phoneNumber: { select: { number: true, type: true } } },
      },
      occupations: {
        select: { ocuppation: { select: { name: true, id: true } } },
      },
      photos: { select: { photo: { select: { url: true } } } },
      addresses: { select: { address: true } },
      emails: { select: { email: { select: { address: true } } } },
      googleContacts: { select: { googleContactId: true } },
    },
  })

  const asd = normalizeContact(contactUpdatedRaw!)

  const state: State = {
    errors: [],
    message: 'Contact saved',
    contact: asd!,
  }

  return state
}

export const getPhoneNumberIDs = async (
  phoneNumbers: CleanPhoneData[],
): Promise<number[]> => {
  const cleanItems = phoneNumbers.filter(
    (phoneNumber) => phoneNumber.phoneNumber || phoneNumber.number!,
  )
  const phoneNumbersIDs = await Promise.all(
    cleanItems.map(async (phoneNumber) => {
      let phoneNumberResult = await prisma.phoneNumber.findFirst({
        where: {
          number: phoneNumber.phoneNumber || phoneNumber.number!,
          type: getPhoneNumberType(phoneNumber.type?.toLowerCase() || 'cell'),
        },
        select: {
          id: true,
        },
      })
      if (phoneNumberResult) {
        return phoneNumberResult.id
      }
      phoneNumberResult = await prisma.phoneNumber.create({
        data: {
          number: phoneNumber.phoneNumber || phoneNumber.number!,
          type: getPhoneNumberType(phoneNumber.type?.toLowerCase() || 'cell'),
        },
      })
      return phoneNumberResult.id
    }),
  )
  return phoneNumbersIDs
}

export const getOccupationIDs = async (
  occupations: Partial<Occupation>[] = [],
): Promise<number[]> => {
  const cleanItems = occupations.filter((occupation) => occupation.name)
  const occupationsIDs = await Promise.all(
    cleanItems.map(async (occupation) => {
      let occupationResult = await prisma.occupation.findFirst({
        where: {
          name: occupation.name!,
        },
        select: {
          id: true,
        },
      })
      if (occupationResult) {
        return occupationResult.id
      }
      occupationResult = await prisma.occupation.create({
        data: { name: occupation.name! },
      })
      return occupationResult.id
    }),
  )
  return occupationsIDs
}

export const getOrganizationIDs = async (
  organizations: Partial<Organization>[] = [],
): Promise<number[]> => {
  const cleanOrgs = organizations.filter(
    (org) => org.name && org.name !== undefined,
  )
  // Use Promise.all to resolve all promises in the array of asynchronous operations
  const organizationIDs = await Promise.all(
    cleanOrgs.map(
      async (organization) => {
        // Check if the organization has a name property
        // Try to find an existing organization by name
        let organizationResult = await prisma.organization.findFirst({
          where: {
            name: organization.name!,
          },
          select: {
            id: true,
          },
        })
        // If an organization exists, return its id
        if (organizationResult) {
          return organizationResult.id
        }
        // Otherwise, create a new organization and return its id
        organizationResult = await prisma.organization.create({
          data: { name: organization.name! },
        })
        return organizationResult.id
      },
      // Return null or an appropriate value if the organization does not have a name
    ),
  )
  // Return the array of organization IDs
  return organizationIDs
}

export const getEmailsIDs = async (
  emails: Partial<Email>[],
): Promise<number[]> => {
  const cleanItems = emails.filter((email) => email.address)
  const emailsIDs = await Promise.all(
    cleanItems.map(async (email) => {
      let emailResult = await prisma.email.findFirst({
        where: {
          address: email.address!,
        },
        select: {
          id: true,
        },
      })
      if (emailResult) {
        return emailResult.id
      }
      emailResult = await prisma.email.create({
        data: { address: email.address! },
      })
      return emailResult.id
    }),
  )
  return emailsIDs
}

export const getAddressIDs = async (
  addresses: Partial<Address>[],
): Promise<number[]> => {
  const addressesIDs = await Promise.all(
    addresses.map(async (address) => {
      let addressResult = await prisma.address.findFirst({
        where: {
          countryCode: address.countryCode,
          city: address.city,
          region: address.region,
          postalCode: address.postalCode,
          streetAddress: address.streetAddress,
        },
        select: {
          id: true,
        },
      })
      if (addressResult) {
        return addressResult.id
      }
      addressResult = await prisma.address.create({
        data: {
          countryCode: address.countryCode,
          city: address.city,
          region: address.region,
          postalCode: address.postalCode,
          streetAddress: address.streetAddress,
        },
      })
      return addressResult.id
    }),
  )
  return addressesIDs
}
