import { Prisma, Contact, $Enums } from '@prisma/client'
import { people_v1 } from 'googleapis'


export type GoogleResponse = people_v1.Schema$Person

export type Organization = people_v1.Schema$Organization

export type Occupation = people_v1.Schema$Occupation

export type Photo = people_v1.Schema$Photo

export type Address = people_v1.Schema$Address

export type Email = people_v1.Schema$EmailAddress

export type PhoneNumber = people_v1.Schema$PhoneNumber

export type ContactCreate = Prisma.ContactUncheckedCreateInput;

export type { Contact }

export type FlattenContact = {
    id: string,
    userId: string,
    name: string,
    nickName: string | null,
    organizations: {
        name: string;
    }[],
    phoneNumbers: {
        number: string;
        type: $Enums.PhoneNumberType;
    }[],
    occupations: {
        id: string;
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
    }[]
}