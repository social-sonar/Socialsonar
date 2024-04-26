import prisma from '@/db'
import { Address, Email, Occupation, Organization, PhoneNumber, PhoneNumberType, Photo } from '@prisma/client'

import {
    ContactNames,
    GoogleAddress,
    GoogleContactRelation,
    GoogleEmail,
    GoogleOccupation,
    GoogleOrganization,
    GooglePhoneNumber,
    GooglePhoto,
    GoogleResponse,
    MetaParams,
    MetaParamsMultiProperty,
    PrismaHandlerMultiple,
    PrismaHandlerSingle,
} from '../definitions'

import {
    getAddressIDs,
    getEmailsIDs,
    getOccupationIDs,
    getOrganizationIDs,
    getPhoneNumberIDs,
    getPhoneNumberType,
    getPhotoIDs,
} from '../data/common'


const compareItems = (itemA: Record<string, any>, itemB: Record<string, any>, metaParams: MetaParamsMultiProperty) =>
    metaParams.dbField.properties.every(
        (field) => (itemA[field]?.toString().toLowerCase() || '') === (itemB[field]?.toString().toLowerCase() || ''),
    )

const syncEntitiesMultiLookup = async <E extends Record<string, any>, G extends Record<string, any>>(
    existingEntities: E[],
    metaParams: MetaParamsMultiProperty,
    prismaHandler: PrismaHandlerMultiple,
    googleResponse?: G[],
) => {
    const googleResponseItems =
        googleResponse?.map((googleItem) =>
            metaParams.googleFields.reduce(
                (obj, googleField, index) => {
                    obj[metaParams.dbField.properties[index]] = googleItem[googleField]
                    return obj
                },
                {} as Record<string, any>,
            ),
        ) || []

    const existingEntities_ = existingEntities.map((entity) =>
        metaParams.dbField.properties.reduce(
            (obj, field) => {
                obj[field] = entity[metaParams.dbField.obj][field]
                return obj
            },
            {} as Record<string, any>,
        ),
    )
    let addedItems: Record<string, any>[] = []
    let removedItems: Record<string, any>[] = []
    if (existingEntities_.length < googleResponseItems.length) {
        addedItems = googleResponseItems?.filter(
            (item) =>
                item !== null &&
                item !== undefined &&
                !existingEntities_.some((entity) => compareItems(entity, item, metaParams)),
        )
    } else if (existingEntities_.length > googleResponseItems.length) {
        removedItems = existingEntities_.filter(
            (entity) => !googleResponseItems.some((item) => compareItems(entity, item, metaParams)),
        )
    } else {
        removedItems = existingEntities_.filter(
            (entity) => !googleResponseItems.some((item) => compareItems(entity, item, metaParams)),
        )
        addedItems = googleResponseItems?.filter(
            (item) =>
                item !== null &&
                item !== undefined &&
                !existingEntities_.some((entity) => compareItems(entity, item, metaParams)),
        )
    }
    // this provided function must handle both disconnections and connections
    await prismaHandler(addedItems, removedItems)
}

const syncEntitiesSingleLookup = async <E extends Record<string, any>, G extends Record<string, any>>(
    existingEntities: E[],
    metaParams: MetaParams,
    prismaHandler: PrismaHandlerSingle,
    googleResponse?: G[],
) => {
    const existingLength = existingEntities.length
    const responseLength = googleResponse?.length || 0

    const googleResponseItems = googleResponse?.map((googleItem) => googleItem[metaParams.googleField]) || []
    const existingEntities_ = existingEntities.map(
        (entity) => entity[metaParams.dbField.obj][metaParams.dbField.property],
    )

    let addedItems: (string | null | undefined)[] = []
    let removedItems: string[] = []
    if (existingLength < responseLength) {
        // if the objects in the DB are less than the returned ones in the Google response, then, there are new items to add to the DB
        addedItems = googleResponseItems?.filter(
            (item) => item !== null && item !== undefined && !existingEntities_.includes(item!),
        )
    } else if (existingLength > responseLength) {
        // if the objects in the DB are greater than the returned ones in the Google response, then, there are items to remove from the DB
        removedItems = existingEntities_.filter((entity) => !googleResponseItems.includes(entity))
    } else {
        // if the number of objects in the DB is the same as the number of objects in the response, then we need to find which objects
        // were updated. Note that based on how the database was designed, any updates to the existing objects will require their
        // relationships to be updated. This may involve disconnecting or connecting new or existing objects
        removedItems = existingEntities_.filter((entity) => !googleResponseItems.includes(entity))
        addedItems = googleResponseItems.filter((item) => !existingEntities_.includes(item || ''))
    }
    // this provided function must handle both disconnections and connections
    await prismaHandler(addedItems, removedItems)
}

const syncOrganizations = async (
    existingOrganizations: { organization: Organization }[],
    contactId: number,
    googleResponseOrganization?: GoogleOrganization[],
) => {
    await syncEntitiesSingleLookup<{ organization: Organization }, GoogleOrganization>(
        existingOrganizations,
        {
            dbField: {
                obj: 'organization',
                property: 'name',
            },
            googleField: 'name',
        },
        async (addedItems, removedItems) => {
            if (removedItems) {
                await prisma.contactOrganization.deleteMany({
                    where: {
                        organization: {
                            name: {
                                in: removedItems,
                            },
                        },
                        contactId: contactId,
                    },
                })
            }
            if (addedItems) {
                const organizationIDs = await getOrganizationIDs(
                    googleResponseOrganization?.filter((org) => addedItems.includes(org.name)) || [],
                )
                await prisma.contactOrganization.createMany({
                    data: organizationIDs.map((orgId) => ({
                        contactId,
                        organizationId: orgId,
                    })),
                })
            }
        },
        googleResponseOrganization,
    )
}

const syncPhoneNumbers = async (
    existingPhoneNumbers: { phoneNumber: PhoneNumber }[],
    contactId: number,
    googleResponsePhoneNumbers?: GooglePhoneNumber[],
) => {
    await syncEntitiesMultiLookup<{ phoneNumber: PhoneNumber }, GooglePhoneNumber>(
        existingPhoneNumbers,
        {
            dbField: {
                obj: 'phoneNumber',
                properties: ['number', 'type'],
            },
            googleFields: ['canonicalForm', 'type'],
        },
        async (addedItems, removedItems) => {
            const numbers: string[] = []
            const types: PhoneNumberType[] = []
            removedItems.forEach((item) => {
                numbers.push(item['number'])
                types.push(getPhoneNumberType((item['type'] as string).toLowerCase()))
            })
            if (removedItems) {
                await prisma.contactPhoneNumber.deleteMany({
                    where: {
                        phoneNumber: {
                            number: {
                                in: numbers,
                            },
                            type: {
                                in: types,
                            },
                        },
                        contactId,
                    },
                })
            }
            if (addedItems) {
                const phoneNumberIDs = await getPhoneNumberIDs(
                    googleResponsePhoneNumbers?.filter((phoneNumber) =>
                        addedItems.some(
                            (item) => item['number'] === phoneNumber.canonicalForm && item['type'] === phoneNumber.type,
                        ),
                    ) || [],
                )
                const uniqueIDs = [...new Set([...phoneNumberIDs])]
                await prisma.contactPhoneNumber.createMany({
                    data: uniqueIDs.map((phoneNumberId) => ({
                        contactId,
                        phoneNumberId,
                    })),
                })
            }
        },
        googleResponsePhoneNumbers,
    )
}

const syncOccupations = async (
    existingOccupations: { ocuppation: Occupation }[],
    contactId: number,
    googleResponseOccupations?: GoogleOccupation[],
) => {
    await syncEntitiesSingleLookup<{ ocuppation: Occupation }, GoogleOccupation>(
        existingOccupations,
        {
            dbField: {
                obj: 'occupation',
                property: 'name',
            },
            googleField: 'value',
        },
        async (addedItems, removedItems) => {
            if (removedItems) {
                await prisma.contactOccupation.deleteMany({
                    where: {
                        ocuppation: {
                            name: {
                                in: removedItems,
                            },
                        },
                        contactId,
                    },
                })
            }
            if (addedItems) {
                const occupationsIDs = await getOccupationIDs(
                    googleResponseOccupations?.filter((occupation) => addedItems.includes(occupation.value)) || [],
                )
                await prisma.contactOccupation.createMany({
                    data: occupationsIDs.map((occupationId) => ({
                        contactId,
                        occupationId,
                    })),
                })
            }
        },
        googleResponseOccupations,
    )
}

const syncPhotos = async (
    existingPhotos: { photo: Photo }[],
    contactId: number,
    googleResponsePhotos?: GooglePhoto[],
) => {
    await syncEntitiesSingleLookup<{ photo: Photo }, GooglePhoto>(
        existingPhotos,
        {
            dbField: {
                obj: 'photo',
                property: 'url',
            },
            googleField: 'url',
        },
        async (addedItems, removedItems) => {
            if (removedItems) {
                await prisma.contactPhoto.deleteMany({
                    where: {
                        photo: {
                            url: {
                                in: removedItems,
                            },
                        },
                        contactId: contactId,
                    },
                })
            }
            if (addedItems) {
                const photoIDs = await getPhotoIDs(
                    googleResponsePhotos?.filter((photo) => addedItems.includes(photo.url)) || [],
                )
                await prisma.contactPhoto.createMany({
                    data: photoIDs.map((photoId) => ({
                        contactId,
                        photoId,
                    })),
                })
            }
        },
        googleResponsePhotos,
    )
}

const syncAddresses = async (
    existingAddresses: { address: Address }[],
    contactId: number,
    googleResponseAddresses?: GoogleAddress[],
) => {
    await syncEntitiesMultiLookup<{ address: Address }, GoogleAddress>(
        existingAddresses,
        {
            dbField: {
                obj: 'address',
                properties: ['countryCode', 'city', 'region', 'postalCode', 'streetAddress'],
            },
            googleFields: ['countryCode', 'city', 'region', 'postalCode', 'streetAddress'],
        },
        async (addedItems, removedItems) => {
            const countryCodes: string[] = []
            const cities: string[] = []
            const regions: string[] = []
            const postalCodes: string[] = []
            const streetAddresses: string[] = []

            removedItems.forEach((item) => {
                countryCodes.push(item['countryCode'])
                cities.push(item['city'])
                regions.push(item['region'])
                postalCodes.push(item['postalCode'])
                streetAddresses.push(item['streetAddress'])
            })

            if (removedItems) {
                await prisma.contactAddress.deleteMany({
                    where: {
                        address: {
                            countryCode: {
                                in: countryCodes,
                            },
                            city: {
                                in: cities,
                            },
                            region: {
                                in: regions,
                            },
                            postalCode: {
                                in: postalCodes,
                            },
                            streetAddress: {
                                in: streetAddresses,
                            },
                        },
                        contactId,
                    },
                })
            }
            if (addedItems) {
                const addressesIDs = await getAddressIDs(
                    googleResponseAddresses?.filter((address) =>
                        addedItems.some(
                            (item) =>
                                item['countryCode'] === address.countryCode &&
                                item['city'] === address.city &&
                                item['region'] === address.region &&
                                item['postalCode'] === address.postalCode &&
                                item['streetAddress'] === address.streetAddress,
                        ),
                    ) || [],
                )
                const uniqueIDs = [...new Set([...addressesIDs])]
                await prisma.contactAddress.createMany({
                    data: uniqueIDs.map((addressId) => ({
                        contactId,
                        addressId,
                    })),
                })
            }
        },
        googleResponseAddresses,
    )
}

const syncEmails = async (
    existingEmails: { email: Email }[],
    contactId: number,
    googleResponseEmails?: GoogleEmail[],
) => {
    await syncEntitiesSingleLookup<{ email: Email }, GooglePhoto>(
        existingEmails,
        {
            dbField: {
                obj: 'email',
                property: 'address',
            },
            googleField: 'value',
        },
        async (addedItems, removedItems) => {
            if (removedItems) {
                await prisma.contactEmail.deleteMany({
                    where: {
                        email: {
                            address: {
                                in: removedItems,
                            },
                        },
                        contactId: contactId,
                    },
                })
            }
            if (addedItems) {
                const emailsIDs = await getEmailsIDs(
                    googleResponseEmails?.filter((email) => addedItems.includes(email.value)) || [],
                )
                await prisma.contactEmail.createMany({
                    data: emailsIDs.map((emailId) => ({
                        contactId,
                        emailId,
                    })),
                })
            }
        },
        googleResponseEmails,
    )
}

const syncNames = async (contactId: number, dbNames: ContactNames, googleNames: ContactNames) => {
    let data: Partial<ContactNames> = {}

    if (googleNames.name && dbNames.name !== googleNames.name) {
        data.name = googleNames.name
    }

    if (googleNames.nickName && dbNames.nickName !== googleNames.nickName) {
        data.nickName = googleNames.nickName
    }

    await prisma.contact.update({
        where: {
            id: contactId,
        },
        data: data,
    })
}

export const syncExisting = async (
    existingGoogleContacts: GoogleContactRelation[],
    googlePayload: GoogleResponse[],
) => {
    // ensure ascending order based on the resource name for matching the ascending order of existingGoogleContacts
    googlePayload = googlePayload.sort((a, b) => a.resourceName!.slice(7).localeCompare(b.resourceName!.slice(7)))
    const length = existingGoogleContacts.length
    for (let index = 0; index < length; index++) {
        // both existingGoogleContacts and googlePayload will have the same size
        const existingGoogleContact = existingGoogleContacts[index]
        const googlePayloadItem = googlePayload[index]

        await syncNames(existingGoogleContact.contactId, existingGoogleContact.contact, {
            name: googlePayloadItem.names?.[0].displayName!,
            nickName: googlePayloadItem.nicknames?.[0].value!,
        })

        await syncOrganizations(
            existingGoogleContact.contact.organizations,
            existingGoogleContact.contactId,
            googlePayloadItem.organizations,
        )
        await syncPhoneNumbers(
            existingGoogleContact.contact.phoneNumbers,
            existingGoogleContact.contactId,
            googlePayloadItem.phoneNumbers,
        )
        await syncOccupations(
            existingGoogleContact.contact.occupations,
            existingGoogleContact.contactId,
            googlePayloadItem.occupations,
        )
        await syncPhotos(existingGoogleContact.contact.photos, existingGoogleContact.contactId, googlePayloadItem.photos)
        await syncAddresses(
            existingGoogleContact.contact.addresses,
            existingGoogleContact.contactId,
            googlePayloadItem.addresses,
        )
        await syncEmails(
            existingGoogleContact.contact.emails,
            existingGoogleContact.contactId,
            googlePayloadItem.emailAddresses,
        )
    }
}
