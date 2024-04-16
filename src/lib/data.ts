import { PhoneNumberType } from '@prisma/client'
import prisma from '@/db'
import { Address, Email, GoogleResponse, Occupation, Organization, PhoneNumber, Photo } from './definitions'


const getPhoneNumberType = (type: string): PhoneNumberType => {
  const typeMap: { [key: string]: PhoneNumberType } = {
    WORK: PhoneNumberType.WORK,
    CELL: PhoneNumberType.CELL,
    HOME: PhoneNumberType.HOME
  };

  return typeMap[type] ?? PhoneNumberType.CELL;
};

const getOrganizationIDs = async (organizations: Organization[]): Promise<number[]> => {
  const cleanOrgs = organizations.filter(org => org.name && org.name !== undefined);
  // Use Promise.all to resolve all promises in the array of asynchronous operations
  const organizationIDs = await Promise.all(
    cleanOrgs.map(async (organization) => {
      // Check if the organization has a name property
      // Try to find an existing organization by name
      let organizationResult = await prisma.organization.findFirst({
        where: {
          name: organization.name!
        },
        select: {
          id: true
        }
      });
      // If an organization exists, return its id
      if (organizationResult) {
        return organizationResult.id;
      }
      // Otherwise, create a new organization and return its id
      organizationResult = await prisma.organization.create({
        data: { name: organization.name! }
      });
      return organizationResult.id;
    }
      // Return null or an appropriate value if the organization does not have a name
    )
  );
  // Return the array of organization IDs
  return organizationIDs
};

const getPhoneNumberIDs = async (phoneNumbers: PhoneNumber[]): Promise<number[]> => {
  const cleanItems = phoneNumbers.filter(phoneNumber => phoneNumber.canonicalForm);
  const phoneNumbersIDs = await Promise.all(
    cleanItems.map(async (phoneNumber) => {
      let phoneNumberResult = await prisma.phoneNumber.findFirst({
        where: {
          number: phoneNumber.canonicalForm!
        },
        select: {
          id: true
        }
      });
      if (phoneNumberResult) {
        return phoneNumberResult.id;
      }
      phoneNumberResult = await prisma.phoneNumber.create({
        data: { number: phoneNumber.canonicalForm!, type: getPhoneNumberType(phoneNumber.type || "CELL") }
      });
      return phoneNumberResult.id;
    }
    )
  );
  return phoneNumbersIDs
};


const getOccupationIDs = async (occupations: Occupation[]): Promise<number[]> => {
  const cleanItems = occupations.filter(occupation => occupation.value);
  const occupationsIDs = await Promise.all(
    cleanItems.map(async (occupation) => {
      let occupationResult = await prisma.occupation.findFirst({
        where: {
          name: occupation.value!
        },
        select: {
          id: true
        }
      });
      if (occupationResult) {
        return occupationResult.id;
      }
      occupationResult = await prisma.occupation.create({
        data: { name: occupation.value! },
      });
      return occupationResult.id;
    }
    )
  );
  return occupationsIDs
};

const getPhotoIDs = async (photos: Photo[]): Promise<number[]> => {
  const cleanItems = photos.filter(photo => photo.url);
  const photoIDs = await Promise.all(
    cleanItems.map(async (photo) => {
      let photoResult = await prisma.occupation.findFirst({
        where: {
          name: photo.url!
        },
        select: {
          id: true
        }
      });
      if (photoResult) {
        return photoResult.id;
      }
      photoResult = await prisma.photo.create({
        data: { url: photo.url! },
      });
      return photoResult.id;
    }
    )
  );
  return photoIDs
};


const getAddressIDs = async (addresses: Address[]): Promise<number[]> => {
  const addressesIDs = await Promise.all(
    addresses.map(async (address) => {
      let addressResult = await prisma.address.findFirst({
        where: {
          countryCode: address.countryCode, city: address.city, region: address.region, postalCode: address.postalCode, streetAddress: address.streetAddress
        },
        select: {
          id: true
        }
      });
      if (addressResult) {
        return addressResult.id;
      }
      addressResult = await prisma.address.create({
        data: {
          countryCode: address.countryCode, city: address.city, region: address.region, postalCode: address.postalCode, streetAddress: address.streetAddress
        },
      });
      return addressResult.id;
    }
    )
  );
  return addressesIDs
};


const getEmailsIDs = async (emails: Email[]): Promise<number[]> => {
  const cleanItems = emails.filter(email => email.value);
  const emailsIDs = await Promise.all(
    cleanItems.map(async (email) => {
      let emailResult = await prisma.email.findFirst({
        where: {
          address: email.value!
        },
        select: {
          id: true
        }
      });
      if (emailResult) {
        return emailResult.id;
      }
      emailResult = await prisma.email.create({
        data: { address: email.value! },
      });
      return emailResult.id;
    }
    )
  );
  return emailsIDs
};

export const syncGoogleContacts = async (
  people: GoogleResponse[],
): Promise<void> => {

  for (const person of people) {

    const organizationsIDs = await getOrganizationIDs(person.organizations ?? [])
    const phoneNumbersIDs = await getPhoneNumberIDs(person.phoneNumbers ?? [])
    const occupationIDs = await getOccupationIDs(person.occupations ?? [])
    const photosIDs = await getPhotoIDs(person.photos ?? [])
    const addressesIDs = await getAddressIDs(person.addresses ?? [])
    const emailsIDs = await getEmailsIDs(person.emailAddresses ?? [])

    const newContact = await prisma.contact.create({
      data: {
        name: (person.names && person.names[0].displayName) || 'Contact',
        nickName: person.nicknames && person.nicknames[0].value || null,
        userId: 1, // dummy user
      }
    })
    await prisma.contactGoogle.create({
      data: { contactId: newContact.id, googleContactId: person.resourceName!.slice(7) } // remove "people/" prefix
    })
    await prisma.contactOrganization.createMany({
      data: organizationsIDs.map(organization => ({ contactId: newContact.id, organizationId: organization })),
      skipDuplicates: true
    })
    await prisma.contactPhoneNumber.createMany({
      data: phoneNumbersIDs.map(phoneNumber => ({ contactId: newContact.id, phoneNumberId: phoneNumber })),
      skipDuplicates: true
    })
    await prisma.contactOccupation.createMany({
      data: occupationIDs.map(occupation => ({ contactId: newContact.id, occupationId: occupation })),
      skipDuplicates: true
    })
    await prisma.contactPhoto.createMany({
      data: photosIDs.map(photo => ({ contactId: newContact.id, photoId: photo })),
      skipDuplicates: true
    })
    await prisma.contactAddress.createMany({
      data: addressesIDs.map(address => ({ contactId: newContact.id, addressId: address })),
      skipDuplicates: true
    })
    await prisma.contactEmail.createMany({
      data: emailsIDs.map(email => ({ contactId: newContact.id, emailId: email })),
      skipDuplicates: true
    })

  }

}

export const findContacts = async (userId: number) =>
  await prisma.contact.findMany({
    where: { userId: userId },
    include: {
      organizations: { select: { organization: { select: { name: true } } } },
      phoneNumbers: { select: { phoneNumber: { select: { number: true, type: true } } } },
      occupations: { select: { ocuppation: { select: { name: true } } } },
      photos: { select: { photo: { select: { url: true } } } },
      addresses: { select: { address: true } },
      emails: { select: { email: { select: { address: true } } } }
    }
  })


