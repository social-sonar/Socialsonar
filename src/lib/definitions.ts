import { Prisma, Contact, $Enums, Organization, PhoneNumber, Occupation, Photo, Address, Email } from '@prisma/client'
import { people_v1 } from 'googleapis'
import { PhoneResult } from 'phone'



export type GoogleResponse = people_v1.Schema$Person

export type GoogleOrganization = people_v1.Schema$Organization

export type GoogleOccupation = people_v1.Schema$Occupation

export type GooglePhoto = people_v1.Schema$Photo

export type GoogleAddress = people_v1.Schema$Address

export type GoogleEmail = people_v1.Schema$EmailAddress

export type GooglePhoneNumber = people_v1.Schema$PhoneNumber

export type ContactCreate = Prisma.ContactUncheckedCreateInput;

export type { Contact }

export type CleanPhoneData = PhoneResult & {
    number: string;
    type: $Enums.PhoneNumberType;
}

export type FlattenContact = {
    category?: string[],
    favorite?: boolean
    id: string,
    userId: string,
    name: string,
    nickName: string | null,
    organizations: {
        name: string;
    }[],
    phoneNumbers: CleanPhoneData[],
    occupations: {
        id: number;
        name: string;
    }[],
    photos: {
        url: string;
    }[],
    addresses: {
        countryCode: string | null,
        city: string | null,
        region: string | null,
        postalCode: string | null,
        streetAddress: string | null,
    }[],
    emails: {
        address: string,
    }[],
    location: string | null,
    source: string
}


export type GoogleContactRelation = {
    googleContactId: string,
    contact: {
        organizations: {
            organization: Organization
        }[],
        phoneNumbers: {
            phoneNumber: PhoneNumber
        }[],
        occupations: {
            ocuppation: Occupation
        }[],
        photos: {
            photo: Photo
        }[],
        addresses: {
            address: Address
        }[],
        emails: {
            email: Email
        }[]
    }
}