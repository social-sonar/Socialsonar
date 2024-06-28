'use server'
import { getSession } from '@/lib/utils/common'
import vCard from 'vcards-js'
import { findContacts } from '@/lib/data/common'
import { dateObject } from '@/lib/utils/dates'
export async function exportAllContacts() {
  const userId = (await getSession()).user.id
  const contacts = await findContacts(userId)

  const exportedArray = contacts.map((eachContact) => {
    const contact = vCard()
    contact.firstName = eachContact.name
    if (eachContact.nickName) {
      contact.nickname = eachContact.nickName
    }
    contact.email = eachContact.emails.map(
      (eachEmail) => eachEmail.email.address,
    )

    if (eachContact.occupations.length > 0) {
      contact.title = eachContact.occupations[0].ocuppation.name ?? ''
    }
    if (eachContact.organizations.length > 0) {
      contact.organization =
        eachContact.organizations[0].organization.name ?? ''
    }

    if (eachContact.addresses.length > 0) {
      contact.homeAddress = {
        stateProvince: eachContact.addresses[0].address.region ?? '',
        street: eachContact.addresses[0].address.streetAddress ?? '',
        city: eachContact.addresses[0].address.city ?? '',
        countryRegion: eachContact.addresses[0].address.countryCode ?? '',
        label: '',
        postalCode: eachContact.addresses[0].address.postalCode ?? '',
      }
    }
    if (eachContact.birthday) {
      const birthday = dateObject(eachContact.birthday)
      if (birthday.year && birthday.month) {

        // months are zero-based in JavaScript's Date object
        contact.birthday = new Date(
          birthday.year,
          birthday.month - 1,
          birthday.day,
        )
      }
    }
    const cellPhone = eachContact.phoneNumbers.filter(
      (a) => a.phoneNumber.type == 'CELL',
    )
    if (cellPhone) {
      contact.cellPhone = cellPhone.map((a) => a.phoneNumber.number)
    }
    const homePhone = eachContact.phoneNumbers.filter(
      (a) => a.phoneNumber.type == 'HOME',
    )
    if (homePhone) {
      contact.homePhone = homePhone.map((a) => a.phoneNumber.number)
    }
    const workPhone = eachContact.phoneNumbers.filter(
      (a) => a.phoneNumber.type == 'WORK',
    )
    if (workPhone) {
      contact.workPhone = workPhone.map((a) => a.phoneNumber.number)
    }
    const mobilePhone = eachContact.phoneNumbers.filter(
      (a) => a.phoneNumber.type == 'MOBILE',
    )
    if (mobilePhone) {
      contact.otherPhone = mobilePhone.map((a) => a.phoneNumber.number)
    }
    return contact.getFormattedString()
  })

  return {
    exportedArray: exportedArray,
  }
}
