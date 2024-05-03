import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'
import { BarsArrowUpIcon, PlusIcon, UsersIcon } from '@heroicons/react/20/solid'
import {
  FlattenContact,
  AddressInterface,
  PhoneNumber,
  CleanPhoneData,
} from '@/lib/definitions'
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { getNames } from 'i18n-iso-countries'
import PhoneVerification from 'phone'

export default function ContactDetailAddress(props: {
  phone: CleanPhoneData
  callUpdate: (a: PhoneNumber) => void
}) {
  const [phone, setPhone] = useState<CleanPhoneData>(props.phone)
  const { callUpdate } = props

  const countries = Object.entries(getNames('en'))

  useEffect(() => {
    const verifiedPhone = PhoneVerification(phone.phoneNumber)

    setPhone({
      ...phone,
      ...verifiedPhone,
      countryCode: verifiedPhone.countryIso2,
      phoneNumber: phone.phoneNumber,
    })

    console.log(verifiedPhone)

    callUpdate(phone)
  }, [phone.phoneNumber])

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
              disabled={true}
              id="country"
              name="country"
              autoComplete="country-name"
              className="w-1/4 rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 [&_*]:text-black"
              value={phone.countryCode ?? ''}
              onChange={(e) => {
                setPhone({
                  ...phone,
                  countryCode: e.target.value,
                })
                callUpdate(phone)
              }}
            >
              <option value={''}>No country</option>
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
              value={phone.phoneNumber ?? ''}
              onChange={(e) => {
                setPhone({
                  ...phone,
                  phoneNumber: e.target.value,
                })
              }}
              className="w-1/2 rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        {/* <div className="sm:col-span-2 sm:col-start-1">
          <label
            htmlFor="city"
            className="block text-sm font-medium leading-6 text-white"
          >
            City
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="city"
              id="city"
              autoComplete="address-level2"
              defaultValue={address.city ?? ''}
              onChange={(e) => {
                setAddress({
                  ...address,
                  city: e.target.value,
                })
                callUpdate(address)
              }}
              className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="region"
            className="block text-sm font-medium leading-6 text-white"
          >
            State / Province
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="region"
              id="region"
              autoComplete="address-level1"
              defaultValue={address.region ?? ''}
              onChange={(e) => {
                setAddress({
                  ...address,
                  region: e.target.value,
                })
                callUpdate(address)
              }}
              className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="postal-code"
            className="block text-sm font-medium leading-6 text-white"
          >
            ZIP / Postal code
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="postal-code"
              id="postal-code"
              autoComplete="postal-code"
              defaultValue={address.postalCode ?? ''}
              onChange={(e) => {
                setAddress({
                  ...address,
                  postalCode: e.target.value,
                })
                callUpdate(address)
              }}
              className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div> */}
      </div>
    </div>
  )
}
