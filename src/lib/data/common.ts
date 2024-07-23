import { requestPeopleAPI } from '@/actions/google/contacts/integrations'
import prisma from '@/db'
import {
  ContactMergeStatus,
  GoogleAccount,
  PhoneNumberType,
} from '@prisma/client'
import { fuzzy } from 'fast-fuzzy'
import { google, people_v1 } from 'googleapis'
import phone from 'phone'
import {
  CleanPhoneData,
  FlattenContact,
  GoogleAddress,
  GoogleContactRelation,
  GoogleEmail,
  GoogleOccupation,
  GoogleOrganization,
  GooglePhoneNumber,
  GooglePhoto,
  GoogleResponse,
} from '../definitions'
import { getContactIdFromResourceName, getSession } from '../utils/common'
import { dateObject, dateString } from '../utils/dates'
import { refreshToken } from '../utils/google'
import { syncExisting } from '@/lib/data/google/contacts'

export const getPhoneNumberType = (type: string): PhoneNumberType => {
  const typeMap: { [key: string]: PhoneNumberType } = {
    work: PhoneNumberType.WORK,
    cell: PhoneNumberType.MOBILE,
    mobile: PhoneNumberType.MOBILE,
    home: PhoneNumberType.HOME,
  }

  return typeMap[type] ?? PhoneNumberType.MOBILE
}

export const getOrganizationIDs = async (
  organizations: GoogleOrganization[],
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

export const getPhoneNumberIDs = async (
  phoneNumbers: GooglePhoneNumber[],
): Promise<number[]> => {
  const cleanItems = phoneNumbers.filter(
    (phoneNumber) => phoneNumber.canonicalForm || phoneNumber.value,
  )
  const phoneNumbersIDs = await Promise.all(
    cleanItems.map(async (phoneNumber) => {
      let phoneNumberResult = await prisma.phoneNumber.findFirst({
        where: {
          number: phoneNumber.canonicalForm ?? phoneNumber.value!,
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
          number: phoneNumber.canonicalForm ?? phoneNumber.value!,
          type: getPhoneNumberType(phoneNumber.type?.toLowerCase() || 'cell'),
        },
      })
      return phoneNumberResult.id
    }),
  )
  return phoneNumbersIDs
}

export const getOccupationIDs = async (
  occupations: GoogleOccupation[],
): Promise<number[]> => {
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

export const getAddressIDs = async (
  addresses: GoogleAddress[],
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

export const getEmailsIDs = async (
  emails: GoogleEmail[],
): Promise<number[]> => {
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

const findExistingGoogleIds = async (
  googleIds: string[],
  userId: string,
): Promise<GoogleContactRelation[]> =>
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

const matches = (sentenceA: string, sentenceB: string): boolean =>
  sentenceA.trim().split(/\s+/).length === sentenceB.trim().split(/\s+/).length

const findDuplicates = async (userId: string) => {
  const combinations = new Set<number>()
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
      // skip the detection process for contacts with the default name 'Contact'
      if (contact.name === 'Contact' || innerContact.name === 'Contact') return
      if (
        contact.id !== innerContact.id &&
        !combinations.has(contact.id) &&
        !combinations.has(innerContact.id)
      ) {
        if (matches(contact.name, innerContact.name)) {
          const posibleDuplicate =
            fuzzy(contact.name, innerContact.name, {
              ignoreCase: false,
              ignoreSymbols: true,
              normalizeWhitespace: true,
              useDamerau: true,
              useSellers: true,
            }) > 0.9
          if (posibleDuplicate) {
            duplicates.push({
              firstContactId: contact.id,
              secondContactId: innerContact.id,
            })
            combinations.add(innerContact.id)
          }
        }
        const contactPhoneNumber = contact.phoneNumbers[0]?.phoneNumber.number
        const innerContactPhoneNumber =
          innerContact.phoneNumbers[0]?.phoneNumber.number

        if (
          contactPhoneNumber &&
          innerContactPhoneNumber &&
          contactPhoneNumber === innerContactPhoneNumber
        ) {
          duplicates.push({
            firstContactId: contact.id,
            secondContactId: innerContact.id,
          })
          combinations.add(innerContact.id)
        }
      }
    })
  })

  await prisma.contactStatus.createMany({
    data: duplicates,
    skipDuplicates: true,
  })
}

export const pullAndSyncGoogleContacts = async (
  people: GoogleResponse[],
  userId: string,
  googleAccountId: string,
): Promise<{
  syncedContactsPromise: Promise<[void, void, void, void, void, void, void]>[]
  createdContactsPromise: Promise<void>[]
}> => {
  let counter = 0
  const googleIds = people.map((person) => getContactIdFromResourceName(person))
  const existingGoogleContacts = await findExistingGoogleIds(googleIds, userId)
  const existingGoogleIdsSet = new Set(
    existingGoogleContacts.map(
      (googleContact) => googleContact.googleContactId,
    ),
  )
  // non existing google IDs
  const googleIdsSet = new Set(
    googleIds.filter((id) => !existingGoogleIdsSet.has(id)),
  )
  //  sync of google contacts thasecondContacts.length > 0t already exist and were updated somehow
  const syncedContactsPromise = syncExisting(
    existingGoogleContacts,
    people.filter(
      (person) => !googleIdsSet.has(getContactIdFromResourceName(person)),
    ),
  )
  let rawContactsPromise: Promise<void>[] = []
  const filteredPeople = people.filter((person) =>
    googleIdsSet.has(getContactIdFromResourceName(person)),
  )
  // Although this function is called from a button click handler, the promises are executed in the server
  // This was causing an odd behavior regarding the `findDuplicates` function as it always was executed before
  // any other promises. That is the reason why new items of `rawContactsPromise` are being overwritten to
  // add extra logic so `findDuplicates` is executed ONLY when the last promise in `rawContactsPromise` is executed
  for (const person of filteredPeople) {
    rawContactsPromise.push(
      new Promise((resolve) => {
        createNewContact(person, userId, googleAccountId).then(() => {
          counter++
          if (counter == filteredPeople.length)
            findDuplicates(userId).then(() => {})
          resolve()
        })
      }),
    )
  }
  const createdContactsPromise = rawContactsPromise

  return {
    createdContactsPromise,
    syncedContactsPromise,
  }
}

async function createNewContact(
  person: people_v1.Schema$Person,
  userId: string,
  googleAccountId: string,
) {
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
      birthday:
        (person.birthdays && dateString(person.birthdays[0].date!)) || null,
      userId: userId,
      googleAccountId,
    },
  })
  await prisma.contactGoogle.create({
    data: {
      contactId: newContact.id,
      googleContactId: getContactIdFromResourceName(person),
    },
  })
  await prisma.contactOrganization.createMany({
    data: organizationsIDs.map((organization) => ({
      contactId: newContact.id,
      organizationId: organization,
    })),
    skipDuplicates: true,
  })
  await prisma.contactPhoneNumber.createMany({
    data: phoneNumbersIDs.map((phoneNumber) => ({
      contactId: newContact.id,
      phoneNumberId: phoneNumber,
    })),
    skipDuplicates: true,
  })
  await prisma.contactOccupation.createMany({
    data: occupationIDs.map((occupation) => ({
      contactId: newContact.id,
      occupationId: occupation,
    })),
    skipDuplicates: true,
  })
  await prisma.contactPhoto.createMany({
    data: photosIDs.map((photo) => ({
      contactId: newContact.id,
      photoId: photo,
    })),
    skipDuplicates: true,
  })
  await prisma.contactAddress.createMany({
    data: addressesIDs.map((address) => ({
      contactId: newContact.id,
      addressId: address,
    })),
    skipDuplicates: true,
  })
  await prisma.contactEmail.createMany({
    data: emailsIDs.map((email) => ({
      contactId: newContact.id,
      emailId: email,
    })),
    skipDuplicates: true,
  })
}
export const findContacts = async (userId: string) => {
  const userGoogleAccounts = (
    await prisma.userGoogleAccount.findMany({
      where: { userId },
      select: {
        googleAccountId: true,
      },
    })
  ).map((a) => a.googleAccountId)

  return prisma.contact.findMany({
    where: {
      AND: [
        {
          OR: [
            { userId },
            {
              googleAccountId: { in: userGoogleAccounts },
            },
          ],
        },
        {
          OR: [
            // Contacts with firstContacts in ContactStatus with either PENDING or MULTIPLE_CHOICE status
            {
              firstContacts: {
                some: {
                  OR: [
                    { mergeStatus: 'PENDING' },
                    { mergeStatus: 'MULTIPLE_CHOICE' },
                    { mergeStatus: 'SINGLE_CHOICE' },
                  ],
                },
              },
            },
            // Contacts with secondContacts in ContactStatus with either PENDING or MULTIPLE_CHOICE status
            {
              secondContacts: {
                some: {
                  OR: [
                    { mergeStatus: 'PENDING' },
                    { mergeStatus: 'MULTIPLE_CHOICE' },
                    { mergeStatus: 'SINGLE_CHOICE' },
                  ],
                },
              },
            },
            // Contacts without firstContacts or secondContacts in ContactStatus
            {
              NOT: {
                OR: [
                  { firstContacts: { some: {} } },
                  { secondContacts: { some: {} } },
                ],
              },
            },
          ],
        },
      ],
    },
    include: {
      contactUserFav: { select: { userId: true } },
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
      firstContacts: {
        select: {
          secondContact: {
            include: {
              organizations: {
                select: { organization: { select: { name: true } } },
              },
              phoneNumbers: {
                select: {
                  phoneNumber: { select: { number: true, type: true } },
                },
              },
              occupations: {
                select: { ocuppation: { select: { name: true, id: true } } },
              },
              photos: { select: { photo: { select: { url: true } } } },
              addresses: { select: { address: true } },
              emails: { select: { email: { select: { address: true } } } },
              googleContacts: { select: { googleContactId: true } },
            },
          },
          finalContact: {
            select: {
              id: true,
            },
          },
          mergeStatus: true,
        },
      },
    },
  })
}

export const normalizeContact = (contact: any): FlattenContact => ({
  id: contact.id,
  favorite: contact.contactUserFav?.length > 0,
  userId: contact.userId.toString(),
  name: contact.name,
  nickName: contact.nickName,
  birthday: contact.birthday ? dateObject(contact.birthday) : null,
  organizations: contact.organizations.map((item: { organization: any }) => ({
    ...item.organization,
  })),
  phoneNumbers: contact.phoneNumbers.map(
    (item: { phoneNumber: CleanPhoneData }): CleanPhoneData => {
      let phoneProcesed = phone(item.phoneNumber.number, {
        validateMobilePrefix: false,
      })
      return {
        ...phoneProcesed,
        ...item.phoneNumber,
      }
    },
  ),
  occupations: contact.occupations.map((item: { ocuppation: any }) => ({
    ...item.ocuppation,
  })),
  photos: contact.photos.map((item: { photo: any }) => ({ ...item.photo })),
  addresses: contact.addresses.map((item: { address: any }) => ({
    ...item.address,
  })),
  emails: contact.emails.map((item: { email: any }) => ({ ...item.email })),
  location:
    contact.phoneNumbers[0] &&
    phone(contact.phoneNumbers[0].phoneNumber.number) &&
    phone(contact.phoneNumbers[0].phoneNumber.number).countryIso2
      ? phone(contact.phoneNumbers[0].phoneNumber.number).countryIso2
      : null,
  source: contact.googleContacts.length > 0 ? 'google' : 'custom',
})

export const updateContactInGoogle = async (contactId: number) => {
  console.time('updateContactInGoogle')
  const session = await getSession()

  const contact = (await prisma.contact.findFirst({
    where: {
      id: contactId!,
    },
    include: {
      contactUserFav: { select: { userId: true } },
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
  }))!

  const userId = session.user.id

  let userGoogleAccount = await prisma.userGoogleAccount.findFirst({
    orderBy: {
      createdAt: 'asc',
    },
    where: {
      googleAccount: {
        contacts: {
          some: {
            id: contactId!,
          },
        },
      },
      userId: userId,
    },
    include: {
      googleAccount: true,
    },
  })

  if (!userGoogleAccount || contact.googleContacts.length == 0) {
    console.log('Contact has no googleId')
    userGoogleAccount = await prisma.userGoogleAccount.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: { googleAccount: true },
    })
    console.log('Using:', userGoogleAccount?.googleAccount.email)
    // throw new Error('Google Account not found')
  }

  const googleAccount = userGoogleAccount!.googleAccount

  if (!googleAccount.ableToWrite) {
    console.log("User didn't allow editing his contacts")
    console.timeEnd('updateContactInGoogle')
    return {
      success: false,
      message: 'You are not able to write contacts',
    }
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URL,
  )

  oauth2Client.setCredentials({ access_token: googleAccount.accessToken })

  const people = google.people({
    version: 'v1',
    auth: oauth2Client,
  })
  let existingContact

  if ((contact?.googleContacts || []).length > 0) {
    try {
      existingContact = await people.people.get({
        resourceName: `people/${contact?.googleContacts[0].googleContactId}`,
        personFields:
          'names,emailAddresses,addresses,phoneNumbers,organizations,occupations,birthdays',
      })
    } catch (error: unknown) {
      try {
        await refreshToken(googleAccount, oauth2Client)
        existingContact = await people.people.get({
          resourceName: `people/${contact?.googleContacts[0].googleContactId}`,
          personFields:
            'names,emailAddresses,addresses,phoneNumbers,organizations,occupations,birthdays',
        })
      } catch (error: unknown) {
        throw error
      }
    }
  }

  const updatedContactData = {
    names: existingContact?.data.names || [],
    emailAddresses: existingContact?.data.emailAddresses || [],
    phoneNumbers: existingContact?.data.phoneNumbers || [],
    etag: existingContact?.data.etag,
    organizations: existingContact?.data.organizations || [],
    occupations: existingContact?.data.occupations || [],
    addresses: existingContact?.data.addresses || [],
    birthdays: existingContact?.data.birthdays || [],
  }

  updatedContactData.names = [
    {
      ...(updatedContactData.names[0] || {}),
      displayName: contact!.name,
      givenName: contact!.name,
      unstructuredName: contact!.name,
    },
  ]
  updatedContactData.emailAddresses = contact!.emails.map((a) => {
    return {
      value: a.email.address,
    }
  })
  updatedContactData.phoneNumbers = contact!.phoneNumbers.map((a) => {
    return { value: a.phoneNumber.number, type: a.phoneNumber.type }
  })
  updatedContactData.organizations = contact!.organizations.map((a) => {
    return {
      name: a.organization.name,
    }
  })
  updatedContactData.occupations = contact!.occupations.map((a) => {
    return {
      value: a.ocuppation.name,
    }
  })
  updatedContactData.addresses = contact!.addresses.map((a) => {
    return {
      streetAddress: a.address.streetAddress,
      postalCode: a.address.postalCode,
      city: a.address.city,
      region: a.address.region,
      countryCode: a.address.countryCode,
    }
  })

  if (contact!.birthday) {
    updatedContactData.birthdays[0] = {
      date: dateObject(contact!.birthday!),
    }
  }
  let response
  if (existingContact) {
    response = await people.people.updateContact({
      resourceName: `people/${contact?.googleContacts[0].googleContactId}`,
      updatePersonFields:
        'names,emailAddresses,addresses,phoneNumbers,organizations,occupations,birthdays',
      requestBody: updatedContactData,
    })
  } else {
    try {
      response = await people.people.createContact({
        requestBody: updatedContactData,
        prettyPrint: true,
      })
    } catch (error) {
      await refreshToken(googleAccount, oauth2Client)
      response = await people.people.createContact({
        requestBody: updatedContactData,
        prettyPrint: true,
      })
    }
    await prisma.contact.update({
      where: {
        id: contact.id,
      },
      data: {
        googleContacts: {
          create: {
            googleContactId: getContactIdFromResourceName(response.data),
          },
        },
      },
    })
  }
  console.timeEnd('updateContactInGoogle')
  return {
    success: true,
    message: 'Successfully updated contact',
  }
}

export const restoreContactsInGoogle = async (
  googleAccount: GoogleAccount,
  backupContacts: any[],
) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URL,
  )

  oauth2Client.setCredentials({
    access_token: googleAccount.accessToken,
    refresh_token: googleAccount.refreshToken,
  })

  const people = google.people({
    version: 'v1',
    auth: oauth2Client,
  })

  const contacts = await requestPeopleAPI(oauth2Client, null)

  console.log('contacts to delete: ', contacts.data.length, googleAccount.email)

  let resourceNamesToDelete = []
  for (let i = 0; i < contacts.data.length; i++) {
    const contact = contacts.data[i]
    if (!contact.resourceName) continue
    resourceNamesToDelete.push(contact.resourceName)

    // If we reach the batch size, delete them
    if (resourceNamesToDelete.length >= 500) {
      await people.people.batchDeleteContacts({
        requestBody: { resourceNames: resourceNamesToDelete },
      })
      // Reset the array for the next batch
      resourceNamesToDelete = []
    }
  }

  // If there are remaining contacts to delete after the loop, do it now
  if (resourceNamesToDelete.length > 0) {
    await people.people.batchDeleteContacts({
      requestBody: { resourceNames: resourceNamesToDelete },
    })
  }

  const processedBackupedContacts = backupContacts.map((contact) => {
    delete contact.resourceName
    delete contact.etag
    delete contact.metadata
    delete contact.photos
    delete contact.sources

    if (Array.isArray(contact.names)) {
      contact.names = contact.names.map((name: { metadata: any }) => {
        if (name.metadata) {
          delete name.metadata
        }
        return name
      })
    }

    if (Array.isArray(contact.birthdays)) {
      contact.birthdays = contact.birthdays.map(
        (birthday: { metadata: any }) => {
          if (birthday.metadata) {
            delete birthday.metadata
          }
          return birthday
        },
      )
    }

    if (Array.isArray(contact.addresses)) {
      contact.addresses = contact.addresses.map(
        (address: { metadata: any }) => {
          if (address.metadata) {
            delete address.metadata
          }
          return address
        },
      )
    }

    if (Array.isArray(contact.phoneNumbers)) {
      contact.phoneNumbers = contact.phoneNumbers.map(
        (phoneNumber: { metadata: any }) => {
          if (phoneNumber.metadata) {
            delete phoneNumber.metadata
          }
          return phoneNumber
        },
      )
    }

    if (Array.isArray(contact.organizations)) {
      contact.organizations = contact.organizations.map(
        (organization: { metadata: any }) => {
          if (organization.metadata) {
            delete organization.metadata
          }
          return organization
        },
      )
    }

    if (Array.isArray(contact.emailAddresses)) {
      contact.emailAddresses = contact.emailAddresses.map(
        (emailAddress: { metadata: any }) => {
          if (emailAddress.metadata) {
            delete emailAddress.metadata
          }
          return emailAddress
        },
      )
    }

    return { contactPerson: contact }
  })

  for (let i = 0; i < processedBackupedContacts.length; i += 200) {
    const batch = processedBackupedContacts.slice(i, i + 200)
    try {
      await people.people.batchCreateContacts({
        requestBody: { contacts: batch },
        prettyPrint: true,
      })
    } catch (error) {
      console.log('Error creating contact', error)
    }
  }

  return { processed: processedBackupedContacts.length }
}
