import { Email, Occupation, Organization, PhoneNumber, Photo } from "@prisma/client"
import { GoogleContactRelation, GoogleEmail, GoogleOccupation, GoogleOrganization, GooglePhoneNumber, GooglePhoto, GoogleResponse } from "../definitions"
import prisma from "@/db"
import { getEmailsIDs, getOccupationIDs, getOrganizationIDs, getPhoneNumberIDs, getPhotoIDs } from "../data/common"

type MetaParams = {
    dbField: {
        obj: string,
        property: string
    },
    googleField: string
}

type PrismaHandler = (addedItems: (string | null | undefined)[], removedItems: string[]) => Promise<void>


const syncEntities = async <E extends Record<string, any>, G extends Record<string, any>>
    (existingEntities: E[], metaParams: MetaParams, prismaHandler: PrismaHandler, googleResponse?: G[]) => {
    const existingLength = existingEntities.length
    const responseLength = googleResponse?.length || 0

    const googleResponseItems = googleResponse?.map(googleItem => googleItem[metaParams.googleField]) || []
    const existingEntities_ = existingEntities.map(entity => entity[metaParams.dbField.obj][metaParams.dbField.property])

    let addedItems: (string | null | undefined)[] = []
    let removedItems: string[] = []
    if (existingLength < responseLength) {
        // if the objects in the DB are less than the returned ones in the Google response, then, there are new items to add to the DB
        addedItems = googleResponseItems?.filter(item => item !== null && item !== undefined && !existingEntities_.includes(item!));
    } else if (existingLength > responseLength) {
        // if the objects in the DB are greater than the returned ones in the Google response, then, there are items to remove from the DB
        removedItems = existingEntities_.filter(entity => !googleResponseItems.includes(entity));
    } else {
        // if the number of objects in the DB is the same as the number of objects in the response, then we need to find which objects
        // were updated. Note that based on how the database was designed, any updates to the existing objects will require their 
        // relationships to be updated. This may involve disconnecting or connecting new or existing objects
        removedItems = existingEntities_.filter(entity => !googleResponseItems.includes(entity));
        addedItems = googleResponseItems.filter(item => !existingEntities_.includes(item || ""))
    }
    // this provided function must handle both disconnections and connections
    await prismaHandler(addedItems, removedItems)
}

const syncOrganizations = async (existingOrganizations: { organization: Organization }[], contactId: number, googleResponseOrganization?: GoogleOrganization[]) => {
    await syncEntities<{ organization: Organization }, GoogleOrganization>(existingOrganizations, {
        dbField: {
            obj: "organization",
            property: "name"
        },
        googleField: "name"
    }, async (addedItems, removedItems) => {
        if (removedItems) {
            await prisma.contactOrganization.deleteMany({
                where: {
                    organization: {
                        name: {
                            in: removedItems
                        }
                    },
                    contactId: contactId
                }
            })
        }
        if (addedItems) {
            const organizationIDs = await getOrganizationIDs(googleResponseOrganization?.filter(org => addedItems.includes(org.name)) || [])
            await prisma.contactOrganization.createMany({
                data: organizationIDs.map(orgId => ({
                    contactId,
                    organizationId: orgId
                }))
            })
        }
    },
        googleResponseOrganization)
}

const syncPhoneNumbers = async (existingPhoneNumbers: { phoneNumber: PhoneNumber }[], contactId: number, googleResponsePhoneNumbers?: GooglePhoneNumber[]) => {
    await syncEntities<{ phoneNumber: PhoneNumber }, GooglePhoneNumber>(existingPhoneNumbers, {
        dbField: {
            obj: "phoneNumber",
            property: "number"
        },
        googleField: "canonicalForm"
    }, async (addedItems, removedItems) => {
        if (removedItems) {
            await prisma.contactPhoneNumber.deleteMany({
                where: {
                    phoneNumber: {
                        number: {
                            in: removedItems
                        }
                    },
                    contactId
                }
            })
        }
        if (addedItems) {
            const phoneNumberIDs = await getPhoneNumberIDs(googleResponsePhoneNumbers?.filter(phoneNumber => addedItems.includes(phoneNumber.canonicalForm)) || [])
            await prisma.contactPhoneNumber.createMany({
                data: phoneNumberIDs.map(phoneNumberId => ({
                    contactId,
                    phoneNumberId
                }))
            })
        }
    },
        googleResponsePhoneNumbers)
}


const syncOccupations = async (existingOccupations: { ocuppation: Occupation }[], contactId: number, googleResponseOccupations?: GoogleOccupation[]) => {
    await syncEntities<{ ocuppation: Occupation }, GoogleOccupation>(existingOccupations, {
        dbField: {
            obj: "occupation",
            property: "name"
        },
        googleField: "value"
    }, async (addedItems, removedItems) => {
        if (removedItems) {
            await prisma.contactOccupation.deleteMany({
                where: {
                    ocuppation: {
                        name: {
                            in: removedItems
                        }
                    },
                    contactId
                }
            })
        }
        if (addedItems) {
            const occupationsIDs = await getOccupationIDs(googleResponseOccupations?.filter(occupation => addedItems.includes(occupation.value)) || [])
            await prisma.contactOccupation.createMany({
                data: occupationsIDs.map(occupationId => ({
                    contactId,
                    occupationId
                }))
            })
        }
    },
        googleResponseOccupations)
}


const syncPhotos = async (existingPhotos: { photo: Photo }[], contactId: number, googleResponsePhotos?: GooglePhoto[]) => {
    await syncEntities<{ photo: Photo }, GooglePhoto>(existingPhotos, {
        dbField: {
            obj: "photo",
            property: "url"
        },
        googleField: "url"
    }, async (addedItems, removedItems) => {
        if (removedItems) {
            await prisma.contactPhoto.deleteMany({
                where: {
                    photo: {
                        url: {
                            in: removedItems
                        }
                    },
                    contactId: contactId
                }
            })
        }
        if (addedItems) {
            const photoIDs = await getPhotoIDs(googleResponsePhotos?.filter(photo => addedItems.includes(photo.url)) || [])
            await prisma.contactPhoto.createMany({
                data: photoIDs.map(photoId => ({
                    contactId,
                    photoId
                }))
            })
        }
    },
        googleResponsePhotos)
}

// TODO: Address sync


const syncEmails = async (existingEmails: { email: Email }[], contactId: number, googleResponseEmails?: GoogleEmail[]) => {
    await syncEntities<{ email: Email }, GooglePhoto>(existingEmails, {
        dbField: {
            obj: "email",
            property: "address"
        },
        googleField: "value"
    }, async (addedItems, removedItems) => {
        if (removedItems) {
            await prisma.contactEmail.deleteMany({
                where: {
                    email: {
                        address: {
                            in: removedItems
                        }
                    },
                    contactId: contactId
                }
            })
        }
        if (addedItems) {
            const emailsIDs = await getEmailsIDs(googleResponseEmails?.filter(email => addedItems.includes(email.value)) || [])
            await prisma.contactEmail.createMany({
                data: emailsIDs.map(emailId => ({
                    contactId,
                    emailId
                }))
            })
        }
    },
        googleResponseEmails)
}


export const syncExisting = async (existingGoogleContacts: GoogleContactRelation[], googlePayload: GoogleResponse[]) => {
    // ensure ascending order based on the resource name for matching the ascending order of existingGoogleContacts
    googlePayload = googlePayload.sort((a, b) => a.resourceName!.slice(7).localeCompare(b.resourceName!.slice(7)))
    const length = existingGoogleContacts.length
    for (let index = 0; index < length; index++) {
        // both existingGoogleContacts and googlePayload will have the same size
        const existingGoogleContact = existingGoogleContacts[index]
        const googlePayloadItem = googlePayload[index]
        await syncOrganizations(existingGoogleContact.contact.organizations, existingGoogleContact.contactId, googlePayloadItem.organizations)
        await syncPhoneNumbers(existingGoogleContact.contact.phoneNumbers, existingGoogleContact.contactId, googlePayloadItem.phoneNumbers)
        await syncOccupations(existingGoogleContact.contact.occupations, existingGoogleContact.contactId, googlePayloadItem.occupations)
        await syncPhotos(existingGoogleContact.contact.photos, existingGoogleContact.contactId, googlePayloadItem.photos)
        await syncEmails(existingGoogleContact.contact.emails, existingGoogleContact.contactId, googlePayloadItem.emailAddresses)
    }

}