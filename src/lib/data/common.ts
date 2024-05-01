import { ContactMergeStatus, PhoneNumberType } from '@prisma/client'
import prisma from '@/db'
import {
  GoogleAddress,
  GoogleEmail,
  GoogleContactRelation,
  GoogleResponse,
  GoogleOccupation,
  GoogleOrganization,
  GooglePhoneNumber,
  GooglePhoto,
} from '../definitions'
import { syncExisting } from './google'
import { fuzzy } from 'fast-fuzzy'

export const getPhoneNumberType = (type: string): PhoneNumberType => {
  const typeMap: { [key: string]: PhoneNumberType } = {
    work: PhoneNumberType.WORK,
    cell: PhoneNumberType.MOBILE,
    mobile: PhoneNumberType.MOBILE,
    home: PhoneNumberType.HOME,
  }

  return typeMap[type] ?? PhoneNumberType.MOBILE
}

export const getOrganizationIDs = async (organizations: GoogleOrganization[]): Promise<number[]> => {
  const cleanOrgs = organizations.filter((org) => org.name && org.name !== undefined)
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

export const getPhoneNumberIDs = async (phoneNumbers: GooglePhoneNumber[]): Promise<number[]> => {
  const cleanItems = phoneNumbers.filter((phoneNumber) => phoneNumber.canonicalForm)
  const phoneNumbersIDs = await Promise.all(
    cleanItems.map(async (phoneNumber) => {
      let phoneNumberResult = await prisma.phoneNumber.findFirst({
        where: {
          number: phoneNumber.canonicalForm!,
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
          number: phoneNumber.canonicalForm!,
          type: getPhoneNumberType(phoneNumber.type?.toLowerCase() || 'cell'),
        },
      })
      return phoneNumberResult.id
    }),
  )
  return phoneNumbersIDs
}

export const getOccupationIDs = async (occupations: GoogleOccupation[]): Promise<number[]> => {
  const cleanItems = occupations.filter((occupation) => occupation.value)
  const occupationsIDs = await Promise.all(
    cleanItems.map(async (occupation) => {
      let occupationResult = await prisma.occupation.findFirst({
        where: {
          name: occupation.value!,
        },
        select: {
          id: true,
        },
      })
      if (occupationResult) {
        return occupationResult.id
      }
      occupationResult = await prisma.occupation.create({
        data: { name: occupation.value! },
      })
      return occupationResult.id
    }),
  )
  return occupationsIDs
}

export const getPhotoIDs = async (photos: GooglePhoto[]): Promise<number[]> => {
  const cleanItems = photos.filter((photo) => photo.url)
  const photoIDs = await Promise.all(
    cleanItems.map(async (photo) => {
      let photoResult = await prisma.occupation.findFirst({
        where: {
          name: photo.url!,
        },
        select: {
          id: true,
        },
      })
      if (photoResult) {
        return photoResult.id
      }
      photoResult = await prisma.photo.create({
        data: { url: photo.url! },
      })
      return photoResult.id
    }),
  )
  return photoIDs
}

export const getAddressIDs = async (addresses: GoogleAddress[]): Promise<number[]> => {
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

export const getEmailsIDs = async (emails: GoogleEmail[]): Promise<number[]> => {
  const cleanItems = emails.filter((email) => email.value)
  const emailsIDs = await Promise.all(
    cleanItems.map(async (email) => {
      let emailResult = await prisma.email.findFirst({
        where: {
          address: email.value!,
        },
        select: {
          id: true,
        },
      })
      if (emailResult) {
        return emailResult.id
      }
      emailResult = await prisma.email.create({
        data: { address: email.value! },
      })
      return emailResult.id
    }),
  )
  return emailsIDs
}

const findExistingGoogleIds = async (googleIds: string[], userId: string): Promise<GoogleContactRelation[]> =>
  await prisma.contactGoogle.findMany({
    where: {
      googleContactId: {
        in: googleIds,
      },
      contact: {
        userId: userId,
      },
    },
    select: {
      contactId: true,
      googleContactId: true,
      contact: {
        select: {
          name: true,
          nickName: true,
          organizations: {
            select: {
              organization: true,
            },
          },
          phoneNumbers: {
            select: {
              phoneNumber: true,
            },
          },
          occupations: {
            select: {
              ocuppation: true,
            },
          },
          photos: {
            select: {
              photo: true,
            },
          },
          addresses: {
            select: {
              address: true,
            },
          },
          emails: {
            select: {
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      googleContactId: 'asc',
    },
  })

type Duplicate = {
  firstContactId: number
  secondContactId: number
}

const findDuplicates = async (userId: string) => {
  const duplicates: Duplicate[] = []
  const contacts = await prisma.contact.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      name: true,
      phoneNumbers: {
        select: {
          phoneNumber: true,
        },
      },
    },
  })

  contacts.forEach((contact) => {
    contacts.forEach((innerContact) => {
      if (contact.id !== innerContact.id) {
        const posibleDuplicate = fuzzy(contact.name, innerContact.name) > 0.95
        if (posibleDuplicate) {
          duplicates.push({
            firstContactId: contact.id,
            secondContactId: innerContact.id,
          })
        }
        const contactPhoneNumber = contact.phoneNumbers[0]?.phoneNumber
        const innerContactPhoneNumber = innerContact.phoneNumbers[0]?.phoneNumber
        if (contactPhoneNumber && innerContactPhoneNumber && contactPhoneNumber === innerContactPhoneNumber) {
          duplicates.push({
            firstContactId: contact.id,
            secondContactId: innerContact.id,
          })
        }
      }
    })
  })

  await prisma.contactStatus.createMany({
    data: duplicates,
    skipDuplicates: true,
  })
}

export const syncGoogleContacts = async (people: GoogleResponse[], userId: string): Promise<void> => {
  const googleIds = people.map((person) => person.resourceName!.slice(7))
  const existingGoogleContacts = await findExistingGoogleIds(googleIds, userId)
  const existingGoogleIdsSet = new Set(existingGoogleContacts.map((googleContact) => googleContact.googleContactId))
  // non existing google IDs
  const googleIdsSet = new Set(googleIds.filter((id) => !existingGoogleIdsSet.has(id)))
  //  sync of google contacts thasecondContacts.length > 0t already exist and were updated somehow
  await syncExisting(
    existingGoogleContacts,
    people.filter((person) => !googleIdsSet.has(person.resourceName!.slice(7))),
  )
  // creation of non existing google contacts
  for (const person of people.filter((person) => googleIdsSet.has(person.resourceName!.slice(7)))) {
    const organizationsIDs = await getOrganizationIDs(person.organizations ?? [])
    const phoneNumbersIDs = await getPhoneNumberIDs(person.phoneNumbers ?? [])
    const occupationIDs = await getOccupationIDs(person.occupations ?? [])
    const photosIDs = await getPhotoIDs(person.photos ?? [])
    const addressesIDs = await getAddressIDs(person.addresses ?? [])
    const emailsIDs = await getEmailsIDs(person.emailAddresses ?? [])

    const newContact = await prisma.contact.create({
      data: {
        name: (person.names && person.names[0].displayName) || 'Contact',
        nickName: (person.nicknames && person.nicknames[0].value) || null,
        userId: userId,
      },
    })
    await prisma.contactGoogle.create({
      data: { contactId: newContact.id, googleContactId: person.resourceName!.slice(7) }, // remove "people/" prefix
    })
    await prisma.contactOrganization.createMany({
      data: organizationsIDs.map((organization) => ({ contactId: newContact.id, organizationId: organization })),
      skipDuplicates: true,
    })
    await prisma.contactPhoneNumber.createMany({
      data: phoneNumbersIDs.map((phoneNumber) => ({ contactId: newContact.id, phoneNumberId: phoneNumber })),
      skipDuplicates: true,
    })
    await prisma.contactOccupation.createMany({
      data: occupationIDs.map((occupation) => ({ contactId: newContact.id, occupationId: occupation })),
      skipDuplicates: true,
    })
    await prisma.contactPhoto.createMany({
      data: photosIDs.map((photo) => ({ contactId: newContact.id, photoId: photo })),
      skipDuplicates: true,
    })
    await prisma.contactAddress.createMany({
      data: addressesIDs.map((address) => ({ contactId: newContact.id, addressId: address })),
      skipDuplicates: true,
    })
    await prisma.contactEmail.createMany({
      data: emailsIDs.map((email) => ({ contactId: newContact.id, emailId: email })),
      skipDuplicates: true,
    })
  }

  await findDuplicates(userId)
}

export const findContacts = async (userId: string) =>
  await prisma.contact.findMany({
    where: {
      userId: userId,
      OR: [
        // Contacts with finalContactId in ContactStatus
        { finalContacts: { some: { finalContactId: { not: null } } } },
        // Contacts with firstContacts or secondContacts in ContactStatus in PENDING status
        {
          OR: [
            { firstContacts: { some: { OR: [{ mergeStatus: 'PENDING' }, { mergeStatus: 'MULTIPLE_CHOICE' }] } } },
            { secondContacts: { some: { OR: [{ mergeStatus: 'PENDING' }, { mergeStatus: 'MULTIPLE_CHOICE' }] } } },
          ]
        },
        // Contacts without firstContacts or secondContacts in ContactStatus
        {
          NOT: {
            OR: [{ firstContacts: { some: {} } }, { secondContacts: { some: {} } }],
          },
        },
      ],
    },
    include: {
      organizations: { select: { organization: { select: { name: true } } } },
      phoneNumbers: { select: { phoneNumber: { select: { number: true, type: true } } } },
      occupations: { select: { ocuppation: { select: { name: true, id: true } } } },
      photos: { select: { photo: { select: { url: true } } } },
      addresses: { select: { address: true } },
      emails: { select: { email: { select: { address: true } } } },
      googleContacts: { select: { googleContactId: true } },
      firstContacts: {
        select: {
          secondContact: {
            include: {
              organizations: { select: { organization: { select: { name: true } } } },
              phoneNumbers: { select: { phoneNumber: { select: { number: true, type: true } } } },
              occupations: { select: { ocuppation: { select: { name: true, id: true } } } },
              photos: { select: { photo: { select: { url: true } } } },
              addresses: { select: { address: true } },
              emails: { select: { email: { select: { address: true } } } },
              googleContacts: { select: { googleContactId: true } },
            }
          },
          mergeStatus: true
        },
      },
    },
  })

export const keepDuplicatedContacts = async (contactA: number, contactB: number): Promise<void> => {
  await prisma.contactStatus.updateMany({
    where: {
      OR: [
        {
          firstContactId: contactA,
          secondContactId: contactB,
        },
        {
          firstContactId: contactB,
          secondContactId: contactA,
        },
      ],
    },
    data: {
      mergeStatus: ContactMergeStatus.MULTIPLE_CHOICE
    },
  })
}

export const keepSelectedContact = async (contactA: number, contactB: number): Promise<void> => {
  await prisma.contactStatus.updateMany({
    where: {
      OR: [
        {
          firstContactId: contactA,
          secondContactId: contactB,
        },
        {
          firstContactId: contactB,
          secondContactId: contactA,
        },
      ],
    },
    data: {
      finalContactId: contactA,
      mergeStatus: ContactMergeStatus.SINGLE_CHOICE,
    },
  })
}

export const mergeContacts = async (contactA: number, contactB: number, mergeName?: string): Promise<void> => {
  const [firstContact, secondContact] = await prisma.contact.findMany({
    where: {
      id: {
        in: [contactA, contactB],
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
      userId: firstContact.userId,
      name: mergeName || firstContact.name,
      phoneNumbers: {
        connect: [
          ...firstContact.phoneNumbers.map((phoneNumber) => ({ id: phoneNumber.phoneNumberId })),
          ...secondContact.phoneNumbers.map((phoneNumber) => ({ id: phoneNumber.phoneNumberId })),
        ],
      },
      addresses: {
        connect: [
          ...firstContact.addresses.map((address) => ({ id: address.addressId })),
          ...secondContact.addresses.map((address) => ({ id: address.addressId })),
        ],
      },
      emails: {
        connect: [
          ...firstContact.emails.map((email) => ({ id: email.emailId })),
          ...secondContact.emails.map((email) => ({ id: email.emailId })),
        ],
      },
    },
  })

  await prisma.contactStatus.updateMany({
    where: {
      OR: [
        {
          firstContactId: contactA,
          secondContactId: contactB,
        },
        {
          firstContactId: contactB,
          secondContactId: contactA,
        },
      ],
    },
    data: {
      finalContactId: newContact.id,
      mergeStatus: ContactMergeStatus.MERGED_BETWEEN,
    },
  })
}
