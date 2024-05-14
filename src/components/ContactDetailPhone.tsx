import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'
import {
  BarsArrowUpIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/20/solid'
import {
  FlattenContact,
  AddressInterface,
  PhoneNumber,
  CleanPhoneData,
} from '@/lib/definitions'
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { getNames } from 'i18n-iso-countries'
import PhoneVerification from 'phone'
import { $Enums, PhoneNumberType } from '@prisma/client'

export default function ContactDetailPhone(props: {
  phone: CleanPhoneData
  callUpdate: (a: CleanPhoneData) => void
  callDelete: () => void
}) {
  const phoneTypes = $Enums.PhoneNumberType

  const [phone, setPhone] = useState<CleanPhoneData>(props.phone)
  const { callUpdate } = props

  const countriesMap = getNames('en')
  const countries = Object.entries(countriesMap)

  useEffect(() => {
    const verifiedPhone = PhoneVerification(phone.number || '')

    const newPhoneState = {
      type: phone.type,
      number: phone.number,
      ...verifiedPhone,
    }

    setPhone(newPhoneState)
    props.callUpdate(newPhoneState)
  }, [phone.number, phone.type])

  function handleDeletePhone(): void {
    props.callDelete()
  }

  return (
    <div className="border-b border-white/10 pb-12">
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="col-span-full">
          <label
            htmlFor="phonenumber"
            className="block text-sm font-medium leading-6 text-white"
          >
            Phone number
          </label>
          <div className="mt-2 flex">
            <select
              id="country"
              name="country"
              autoComplete="country-name"
              className="mr-6 w-1/4 rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 [&_*]:text-black"
              value={
                phone.countryIso2 ||
                phone.countryIso3 ||
                phone.countryCode ||
                'No country'
              }
            >
              <option
                value={
                  phone.countryIso2 ||
                  phone.countryIso3 ||
                  phone.countryCode ||
                  'No country'
                }
                selected
              >
                {countriesMap[
                  phone.countryIso2 ||
                    phone.countryIso3 ||
                    phone.countryCode ||
                    ''
                ] ?? 'No country'}
              </option>
              {countries.map((a) => {
                return (
                  <option key={a[0]} value={a[0]}>
                    {a[1]}
                  </option>
                )
              })}
            </select>
            <input
              type="text"
              name="phonenumber"
              id="phonenumber"
              value={phone.phoneNumber || phone.number || ''}
              onChange={(e) => {
                setPhone(() => ({
                  ...phone,
                  number: e.target.value,
                }))
              }}
              className="w-1/3 rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            <select
              id="type"
              name="type"
              autoComplete="type"
              className="text-red ml-6 w-1/4 rounded-md border-0 bg-white/5 py-1.5 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 [&_*]:text-black"
              defaultValue={phone.type || 'MOBILE'}
              onChange={(e) => {
                setPhone(() => ({
                  ...phone,
                  type: e.target.value as PhoneNumberType,
                }))
              }}
            >
              {Object.values(phoneTypes).map((a, i) => {
                return (
                  <option key={a} value={a}>
                    {a}
                  </option>
                )
              })}
            </select>
            <button
              type="button"
              className="ml-8 rounded-full bg-red-600 p-2 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              onClick={handleDeletePhone}
            >
              <TrashIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
