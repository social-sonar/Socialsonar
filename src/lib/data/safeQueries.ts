'use server'

import prisma from '@/db'
import tzlookup from '@photostructure/tz-lookup'
import { ContactMergeStatus, HomeBase } from '@prisma/client'
import { LocationSetData } from '../definitions'
import { getSession } from '../utils/common'

export const userHomeBases = async (
  userId: string,
): Promise<Pick<HomeBase, 'id' | 'location' | 'active' | 'coords'>[]> =>
  await prisma.homeBase.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      location: true,
      active: true,
      coords: true,
    },
  })

export const upsertLocation = async ({
  data,
  homeBaseId,
}: LocationSetData): Promise<
  Pick<HomeBase, 'id' | 'location' | 'active' | 'coords'> | undefined
> => {
  const [lat, lon] = data.coords.split(',').map(Number)
  const timezone = tzlookup(lat, lon)
  if (homeBaseId) {
    return await prisma.homeBase.update({
      where: {
        id: homeBaseId,
      },
      data: {
        ...data,
        active: false, // After updating, the new location must be set to 'not in use'
        timezone,
      },
      select: {
        id: true,
        location: true,
        active: true,
        coords: true,
      },
    })
  } else {
    const session = await getSession()
    return await prisma.homeBase.create({
      data: {
        ...data,
        userId: session.user.id,
        timezone,
      },
      select: {
        id: true,
        location: true,
        active: true,
        coords: true,
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

export const keepSelectedContact = async (
  selectedContactId: number,
  contactsIds: number[],
): Promise<void> => {
  await prisma.contactStatus.updateMany({
    where: {
      OR: [
        {
          firstContactId: selectedContactId,
          secondContactId: {
            in: contactsIds.filter((c) => c !== selectedContactId),
          },
        },
        {
          firstContactId: {
            in: contactsIds.filter((c) => c !== selectedContactId),
          },
          secondContactId: selectedContactId,
        },
        {
          firstContactId: {
            in: contactsIds.filter((c) => c !== selectedContactId),
          },
          secondContactId: {
            in: contactsIds.filter((c) => c !== selectedContactId),
          },
        },
      ],
    },
    data: {
      finalContactId: selectedContactId,
      mergeStatus: ContactMergeStatus.SINGLE_CHOICE,
    },
  })
}

export const mergeContacts = async (
  contacts: number[],
  mergeName?: string,
): Promise<void> => {
  const [mainContact, ...rest] = await prisma.contact.findMany({
    where: {
      id: {
        in: contacts,
      },
    },
    select: {
      userId: true,
      name: true,
      organizations: { select: { organizationId: true } },
      phoneNumbers: { select: { phoneNumberId: true } },
      occupations: { select: { occupationId: true } },
      photos: { select: { photoId: true } },
      addresses: { select: { addressId: true } },
      emails: { select: { emailId: true } },
    },
  })

  const newContact = await prisma.contact.create({
    data: {
      // both firstContact and secondContact have the same userId and name
      userId: mainContact.userId,
      name: mergeName || mainContact.name,
    },
  })

  await prisma.contactPhoneNumber.createMany({
    data: [
      ...mainContact.phoneNumbers,
      ...rest.flatMap((contact) => contact.phoneNumbers),
    ].map((phoneNumber) => ({
      phoneNumberId: phoneNumber.phoneNumberId,
      contactId: newContact.id,
    })),
    skipDuplicates: true,
  })

  await prisma.contactAddress.createMany({
    data: [
      ...mainContact.addresses,
      ...rest.flatMap((contact) => contact.addresses),
    ].map((address) => ({
      addressId: address.addressId,
      contactId: newContact.id,
    })),
    skipDuplicates: true,
  })

  await prisma.contactEmail.createMany({
    data: [
      ...mainContact.emails,
      ...rest.flatMap((contact) => contact.emails),
    ].map((email) => ({
      emailId: email.emailId,
      contactId: newContact.id,
    })),
    skipDuplicates: true,
  })

  await prisma.contactStatus.updateMany({
    where: {
      OR: [
        {
          firstContactId: contacts[0],
          secondContactId: {
            in: contacts.slice(1),
          },
        },
        {
          firstContactId: {
            in: contacts.slice(1),
          },
          secondContactId: contacts[0],
        },
      ],
    },
    data: {
      finalContactId: newContact.id,
      mergeStatus: ContactMergeStatus.MERGED_BETWEEN,
    },
  })
}

export const keepDuplicatedContacts = async (
  contacts: number[],
): Promise<void> => {
  await prisma.contactStatus.updateMany({
    where: {
      OR: [
        {
          firstContactId: contacts[0],
          secondContactId: {
            in: contacts.slice(1),
          },
        },
        {
          firstContactId: {
            in: contacts.slice(1),
          },
          secondContactId: contacts[0],
        },
      ],
    },
    data: {
      mergeStatus: ContactMergeStatus.MULTIPLE_CHOICE,
    },
  })
}
