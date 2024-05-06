import { Dispatch, Fragment, SetStateAction, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'
import {
  BarsArrowUpIcon,
  MinusIcon,
  PlusIcon,
  UsersIcon,
} from '@heroicons/react/20/solid'
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import ContactDetailAddress from './ContactDetailAddress'
import { FlattenContact } from '@/lib/definitions'
import { useContacts } from '@/app/ContactsProvider'
import ContactDetailPhone from './ContactDetailPhone'

interface ContactDetailProps {
  children?: React.ReactNode

  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  contact: FlattenContact
}

export default function ContactDetail(props: ContactDetailProps) {
  const [isEdited, setIsEdited] = useState(false)

  const [showAdresses, setShowAdresses] = useState(false)
  const [showPhones, setShowPhones] = useState(false)

  const { contact } = props
  const { updateContact } = useContacts()

  return (
    <Transition.Root show={props.open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={props.setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="mt-24 flex items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-black px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-1/2 sm:p-6">
                <div>
                  <form>
                    <div className="">
                      {/* <div className="border-b border-white/10 "> */}

                      <div className="pb-12">
                        <div className=" grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <h2 className="mt-2 text-base font-semibold leading-7 text-white">
                              Contact Information
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-gray-400">
                              View all your contact information.
                            </p>
                          </div>
                          <div className="sm:col-span-3">
                            <div className="float-right flex items-center">
                              {props.contact?.photos &&
                              props.contact.photos[0] ? (
                                <img
                                  className="h-20 w-20 flex-none rounded-full bg-gray-800"
                                  src={props.contact?.photos[0].url}
                                  alt=""
                                />
                              ) : (
                                <UserCircleIcon
                                  className="h-12 w-12 text-gray-500"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label
                              htmlFor="first-name"
                              className="block text-sm font-medium leading-6 text-white"
                            >
                              Name
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="first-name"
                                id="first-name"
                                autoComplete="given-name"
                                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                defaultValue={contact.name}
                                onChange={(e) => {
                                  updateContact(contact.id, {
                                    name: e.target.value,
                                  })
                                }}
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label
                              htmlFor="mainphone"
                              className="block text-sm font-medium leading-6 text-white"
                            >
                              Main phone
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="mainphone"
                                id="mainphone"
                                autoComplete="family-name"
                                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                value={contact.phoneNumbers[0]?.phoneNumber || ''}
                                onChange={(e) => {
                                  if (contact.phoneNumbers.length > 0) {
                                    contact.phoneNumbers[0]!.phoneNumber =
                                      e.target.value
                                  } else {
                                    contact.phoneNumbers = [
                                      {
                                        phoneNumber: e.target.value,
                                      },
                                    ]
                                  }
                                  updateContact(contact.id, {
                                    phoneNumbers: contact.phoneNumbers,
                                  })
                                }}
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium leading-6 text-white"
                            >
                              Email address
                            </label>
                            <div className="mt-2">
                              <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                defaultValue={contact.emails[0]?.address ?? ''}
                                onChange={(e) => {
                                  if (contact.emails.length > 0) {
                                    contact.emails[0].address = e.target.value
                                  } else {
                                    contact.emails = [
                                      {
                                        address: e.target.value,
                                      },
                                    ]
                                  }
                                  updateContact(contact.id, {
                                    emails: contact.emails,
                                  })
                                }}
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label
                              htmlFor="mainphone"
                              className="block text-sm font-medium leading-6 text-white"
                            >
                              Main role
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="mainphone"
                                id="mainphone"
                                autoComplete="family-name"
                                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                defaultValue={
                                  contact.occupations[0]?.name ?? ''
                                }
                                onChange={(e) => {
                                  if (contact.occupations.length > 0) {
                                    contact.occupations[0]!.name =
                                      e.target.value
                                  } else {
                                    contact.occupations = [
                                      {
                                        id: Math.round(Math.random() * 100000),
                                        name: e.target.value,
                                      },
                                    ]
                                  }
                                  updateContact(contact.id, {
                                    occupations: contact.occupations,
                                  })
                                }}
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium leading-6 text-white"
                            >
                              Main organization
                            </label>
                            <div className="mt-2">
                              <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                defaultValue={
                                  contact.organizations[0]?.name ?? ''
                                }
                                onChange={(e) => {
                                  if (contact.organizations.length > 0) {
                                    contact.organizations[0].name =
                                      e.target.value
                                  } else {
                                    contact.organizations = [
                                      {
                                        name: e.target.value,
                                      },
                                    ]
                                  }
                                  updateContact(contact.id, {
                                    organizations: contact.organizations,
                                  })
                                }}
                              />
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <label
                              htmlFor="bday"
                              className="block text-sm font-medium leading-6 text-white"
                            >
                              Birthday
                            </label>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              <input
                                id="bday"
                                name="bday"
                                type="number"
                                min={1}
                                max={31}
                                placeholder="day"
                                className="w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                              />
                              <input
                                id="bmonth"
                                name="bmonth"
                                type="number"
                                min={1}
                                max={12}
                                placeholder="month"
                                className="w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                              />
                              <input
                                id="byear"
                                name="byear"
                                type="number"
                                min={1900}
                                max={2024}
                                placeholder="year"
                                autoComplete="email"
                                className="w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <div
                          className="absolute inset-0 flex items-center"
                          aria-hidden="true"
                        >
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex items-center justify-between">
                          <span className="text-white-900 pr-3text-base bg-black font-semibold leading-6">
                            Phones
                          </span>
                          <button
                            onClick={(e) => {
                              if ((contact.phoneNumbers?.length || 0) == 0) {
                                contact.phoneNumbers = [
                                  {
                                    phoneNumber: '',
                                  },
                                ]
                              }
                              setShowPhones(!showPhones)
                            }}
                            type="button"
                            className="text-white-900 inline-flex items-center gap-x-1.5 rounded-full bg-black px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300"
                          >
                            {showPhones ? (
                              <MinusIcon
                                className="-ml-1 -mr-0.5 h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              ></MinusIcon>
                            ) : (
                              <PlusIcon
                                className="-ml-1 -mr-0.5 h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            )}
                            <span>
                              {showPhones
                                ? 'Hide'
                                : (props.contact?.phoneNumbers?.length || 0) > 0
                                  ? 'Show'
                                  : 'Add'}
                            </span>
                          </button>
                        </div>
                      </div>
                      {showPhones &&
                        props.contact?.phoneNumbers.map((a, i) => {
                          return (
                            <ContactDetailPhone
                              key={contact.id + '_' + i}
                              callUpdate={(updatedPhone) => {
                                contact.phoneNumbers[i] = updatedPhone
                                updateContact(contact.id, {
                                  phoneNumbers: contact.phoneNumbers,
                                })
                              }}
                              phone={a}
                            ></ContactDetailPhone>
                          )
                        })}
                      <div className="relative mt-8">
                        <div
                          className="absolute inset-0 flex items-center"
                          aria-hidden="true"
                        >
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex items-center justify-between">
                          <span className="text-white-900 pr-3text-base bg-black font-semibold leading-6">
                            Address
                          </span>
                          <button
                            onClick={(e) => {
                              if ((contact.addresses?.length || 0) == 0) {
                                contact.addresses = [
                                  {
                                    countryCode: null,
                                    city: null,
                                    region: null,
                                    postalCode: null,
                                    streetAddress: null,
                                  },
                                ]
                              }
                              setShowAdresses(!showAdresses)
                            }}
                            type="button"
                            className="text-white-900 inline-flex items-center gap-x-1.5 rounded-full bg-black px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300"
                          >
                            {showAdresses ? (
                              <MinusIcon
                                className="-ml-1 -mr-0.5 h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              ></MinusIcon>
                            ) : (
                              <PlusIcon
                                className="-ml-1 -mr-0.5 h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            )}
                            <span>
                              {showAdresses
                                ? 'Hide'
                                : props.contact?.addresses?.length || 0 > 0
                                  ? 'Show'
                                  : 'Add'}
                            </span>
                          </button>
                        </div>
                      </div>
                      {showAdresses &&
                        props.contact?.addresses.map((a, i) => {
                          return (
                            <ContactDetailAddress
                              key={contact.id + '_' + i}
                              callUpdate={(updatedAddress) => {
                                contact.addresses[i] = updatedAddress
                                updateContact(contact.id, {
                                  addresses: contact.addresses,
                                })
                              }}
                              address={a}
                            ></ContactDetailAddress>
                          )
                        })}

                      <div className="mt-8 border-b border-white/10 pb-12">
                        <h2 className="text-base font-semibold leading-7 text-white">
                          Notifications
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-gray-400">
                          Well always let you know about important changes, but
                          you pick what else you want to hear about.
                        </p>

                        <div className="mt-10 space-y-10">
                          <fieldset>
                            <legend className="text-sm font-semibold leading-6 text-white">
                              By Email
                            </legend>
                            <div className="mt-6 space-y-6">
                              <div className="relative flex gap-x-3">
                                <div className="flex h-6 items-center">
                                  <input
                                    id="comments"
                                    name="comments"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-gray-900"
                                  />
                                </div>
                                <div className="text-sm leading-6">
                                  <label
                                    htmlFor="comments"
                                    className="font-medium text-white"
                                  >
                                    Any update
                                  </label>
                                  <p className="text-gray-400">
                                    Get notified when we get any new update of
                                    this contact
                                  </p>
                                </div>
                              </div>
                              <div className="relative flex gap-x-3">
                                <div className="flex h-6 items-center">
                                  <input
                                    id="candidates"
                                    name="candidates"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-gray-900"
                                  />
                                </div>
                                <div className="text-sm leading-6">
                                  <label
                                    htmlFor="candidates"
                                    className="font-medium text-white"
                                  >
                                    Candidates
                                  </label>
                                  <p className="text-gray-400">
                                    Get notified when a social network profile
                                    candidate applies for this contact
                                  </p>
                                </div>
                              </div>
                              <div className="relative flex gap-x-3">
                                <div className="flex h-6 items-center">
                                  <input
                                    id="offers"
                                    name="offers"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-gray-900"
                                    checked
                                  />
                                </div>
                                <div className="text-sm leading-6">
                                  <label
                                    htmlFor="offers"
                                    className="font-medium text-white"
                                  >
                                    {"Don't notify me"}
                                  </label>
                                  <p className="text-gray-400">
                                    We will not send you any notification from
                                    this contact
                                  </p>
                                </div>
                              </div>
                            </div>
                          </fieldset>
                        </div>
                      </div>
                    </div>

                    {isEdited ? (
                      <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                          type="button"
                          className="text-sm font-semibold leading-6 text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <></>
                    )}
                  </form>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => props.setOpen(false)}
                  >
                    Go back to Contact book
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
