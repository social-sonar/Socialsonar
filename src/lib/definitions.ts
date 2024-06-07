import { Prisma, Contact, $Enums, Organization, PhoneNumber, Occupation, Photo, Address, Email } from '@prisma/client'
import { people_v1 } from 'googleapis'
import { Session } from 'next-auth'

interface PhoneValidResult {
    isValid?: boolean;
    phoneNumber?: string | null;
    countryIso2?: string | null;
    countryIso3?: string | null;
    countryCode?: string | null;
}
export interface CustomSession extends Session {
    accessToken: string
    refreshToken: string
    expiresAt: number
}

export type GoogleContactMainResponse = people_v1.Schema$ListConnectionsResponse

export type GoogleResponse = people_v1.Schema$Person

export type GoogleOrganization = people_v1.Schema$Organization

export type GoogleOccupation = people_v1.Schema$Occupation

export type GooglePhoto = people_v1.Schema$Photo

export type GoogleAddress = people_v1.Schema$Address

export type GoogleEmail = people_v1.Schema$EmailAddress

export type GooglePhoneNumber = people_v1.Schema$PhoneNumber

export type GoogleDate = people_v1.Schema$Date

export type ContactCreate = Prisma.ContactUncheckedCreateInput;

export type { Contact }

export type CleanPhoneData = Partial<PhoneValidResult> & {
    number: string;
    type: $Enums.PhoneNumberType;
}

export interface AddressInterface {
    countryCode: string | null
    city: string | null
    region: string | null
    postalCode: string | null
    streetAddress: string | null
}

export type BirthDay = {
    year?: number,
    month?: number,
    day?: number
}

export type FlattenContact = {
    category?: string[],
    favorite?: boolean
    id: number,
    userId: string,
    name: string,
    nickName: string | null,
    birthday: BirthDay | null
    organizations: {
        name: string;
    }[],
    phoneNumbers: CleanPhoneData[],
    occupations: {
        id?: number;
        name: string;
    }[],
    photos: {
        url: string;
    }[],
    addresses: AddressInterface[],
    emails: {
        address: string,
    }[],
    location: string | null,
    source: string
    duplicates?: FlattenContact[]
}


export type GoogleContactRelation = {
    contactId: number,
    googleContactId: string,
    contact: {
        name: string,
        nickname?: string,
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

export type PlainFields = {
    name?: string
    nickName?: string
    birthday?: string
}

export type MetaParams = {
    dbField: {
        obj: string
        property: string
    }
    googleField: string
}

export type MetaParamsMultiProperty = {
    dbField: {
        obj: string
        properties: string[]
    }
    googleFields: string[],
    transformers?: Record<string, (value?: any) => any>
}

export type PrismaHandlerSingle = (addedItems: (string | null | undefined)[], removedItems: string[]) => Promise<void>

export type PrismaHandlerMultiple<T extends Record<string, any>> = (addedItems: Record<string, any>[], removedItems: Record<string, any>[], mappedGooglePayload: T[]) => Promise<void>

export enum ResolutionStrategy {
    KEEP_ONE = "KEEP_ONE",
    KEEP_BOTH = "KEEP_BOTH",
    MERGE = "MERGE",
}

export type DuplicateContactResolutionPayload = {
    strategy: ResolutionStrategy,
    contactA?: number,
    contactB?: number,
    mergeName?: string
}

export type { PhoneNumber }

export type TimeDuration = {
    duration: number,
    repr: string,
    timedelta: number
}

type ValuePiece = Date | null;

export type Value = ValuePiece | [ValuePiece, ValuePiece];

export type DateRange = {
    minDate: Date,
    maxDate: Date
}