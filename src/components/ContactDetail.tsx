import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { MinusIcon, PlusIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import ContactDetailAddress from './ContactDetailAddress'
import { FlattenContact } from '@/lib/definitions'
import { useContacts } from '@/app/ContactsProvider'
import ContactDetailPhone from './ContactDetailPhone'
import phone from 'phone'
import { useFormState } from 'react-dom'
import { saveContact, State } from '@/actions/saveContact'
import LoadingSpinner from './common/spinner'
import { useNotification } from '@/app/NotificationsProvider'
import { Session } from 'next-auth'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface ContactDetailProps {
  children?: React.ReactNode
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  contact: Partial<FlattenContact>
  session: Session | null
}

export default function ContactDetail(props: ContactDetailProps) {
  const { showNotification, hideNotification } = useNotification()
  const [isEdited, setIsEdited] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const initialState: State = {}
  const [showAddresses, setShowAddresses] = useState(false)
  const [showPhones, setShowPhones] = useState(false)
  const [contact, setContact] = useState<Partial<FlattenContact>>(props.contact)
  const { getContactByID, updateContact, contacts, setContacts } = useContacts()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!props.open) {
      router.push(pathname, { scroll: false })
    }
  }, [props.open])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!isSaving && props.session) {
      setIsSaving(true)
      showNotification(
        'Saving',
        'Your data is being saved',
        LoadingSpinner({ size: 20 }),
      )
      let saveResponse = await saveContact(contact, props.session!)

      if (
        saveResponse &&
        saveResponse.errors?.length === 0 &&
        saveResponse.contact
      ) {
        setContact(saveResponse.contact!)
        showNotification(
          'Success!',
          'Your data has been saved successfully.',
          <CheckCircleIcon
            className="h-6 w-6 text-green-400"
            aria-hidden="true"
          />,
        )
        if (contact.id) {
          updateContact(contact.id, saveResponse.contact!)
        } else {
          setContacts([saveResponse.contact!, ...contacts])
        }
      } else {
        showNotification(
          'Error!',
          'It was an error saving the contact. Please try again.',
          <ExclamationTriangleIcon
            className="h-6 w-6 text-red-400"
            aria-hidden="true"
          ></ExclamationTriangleIcon>,
        )
      }
      setIsSaving(false)
    }
  }

  return (
    <>
      <Transition.Root show={props.open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (!isSaving) {
              props.setOpen(false)
              setTimeout(() => {
                hideNotification()
              }, 1000)
            }
          }}
        >
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
                    <form onSubmit={handleSubmit}>
                      <div className="">
                        <div className="pb-12">
                          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
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
                                {contact?.photos && contact.photos[0] ? (
                                  <img
                                    className="h-20 w-20 flex-none rounded-full bg-gray-800"
                                    src={contact?.photos[0].url}
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
                                  defaultValue={contact.name ?? ''}
                                  onChange={(e) => {
                                    setContact({
                                      ...contact,
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
                                  defaultValue={
                                    contact.phoneNumbers?.[0]?.phoneNumber ??
                                    contact.phoneNumbers?.[0]?.number ??
                                    ''
                                  }
                                  onChange={(e) => {
                                    const phoneNumbers = contact.phoneNumbers
                                      ? [...contact.phoneNumbers]
                                      : []
                                    if (phoneNumbers.length > 0) {
                                      phoneNumbers[0] = {
                                        ...phoneNumbers[0],
                                        number: e.target.value,
                                        ...phone(e.target.value),
                                      }
                                    } else {
                                      phoneNumbers.push({
                                        number: e.target.value,
                                        type: 'CELL',
                                        ...phone(e.target.value),
                                      })
                                    }
                                    setContact({
                                      ...contact,
                                      phoneNumbers,
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
                                  defaultValue={
                                    contact.emails?.[0]?.address ?? ''
                                  }
                                  onChange={(e) => {
                                    const emails = contact.emails
                                      ? [...contact.emails]
                                      : []
                                    if (emails.length > 0) {
                                      emails[0].address = e.target.value
                                    } else {
                                      emails.push({
                                        address: e.target.value,
                                      })
                                    }
                                    setContact({
                                      ...contact,
                                      emails,
                                    })
                                  }}
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-2">
                              <label
                                htmlFor="mainrole"
                                className="block text-sm font-medium leading-6 text-white"
                              >
                                Main role
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  name="mainrole"
                                  id="mainrole"
                                  autoComplete="family-name"
                                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                  defaultValue={
                                    contact.occupations?.[0]?.name ?? ''
                                  }
                                  onChange={(e) => {
                                    const occupations = contact.occupations
                                      ? [...contact.occupations]
                                      : []
                                    if (occupations.length > 0) {
                                      occupations[0] = {
                                        ...occupations[0],
                                        name: e.target.value,
                                      }
                                    } else {
                                      occupations.push({
                                        name: e.target.value,
                                      })
                                    }
                                    setContact({
                                      ...contact,
                                      occupations,
                                    })
                                  }}
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-2">
                              <label
                                htmlFor="organization"
                                className="block text-sm font-medium leading-6 text-white"
                              >
                                Main organization
                              </label>
                              <div className="mt-2">
                                <input
                                  id="organization"
                                  name="organization"
                                  type="text"
                                  autoComplete="organization"
                                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                  defaultValue={
                                    contact.organizations?.[0]?.name ?? ''
                                  }
                                  onChange={(e) => {
                                    const organizations = contact.organizations
                                      ? [...contact.organizations]
                                      : []
                                    if (organizations.length > 0) {
                                      organizations[0] = {
                                        ...organizations[0],
                                        name: e.target.value,
                                      }
                                    } else {
                                      organizations.push({
                                        name: e.target.value,
                                      })
                                    }
                                    setContact({
                                      ...contact,
                                      organizations,
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
                                  defaultValue={
                                    contact.birthday?.day ?? undefined
                                  }
                                  min={1}
                                  max={31}
                                  placeholder="day"
                                  className="w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                  onChange={(e) => {
                                    const newBirthDay = {
                                      ...contact.birthday,
                                      day: e.target.valueAsNumber,
                                    }
                                    setContact({
                                      ...contact,
                                      birthday: newBirthDay,
                                    })
                                  }}
                                />
                                <input
                                  id="bmonth"
                                  name="bmonth"
                                  type="number"
                                  defaultValue={
                                    contact.birthday?.month ?? undefined
                                  }
                                  min={1}
                                  max={12}
                                  placeholder="month"
                                  className="w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                  onChange={(e) => {
                                    const newBirthDay = {
                                      ...contact.birthday,
                                      month: e.target.valueAsNumber,
                                    }
                                    setContact({
                                      ...contact,
                                      birthday: newBirthDay,
                                    })
                                  }}
                                />
                                <input
                                  id="byear"
                                  name="byear"
                                  type="number"
                                  defaultValue={
                                    contact.birthday?.year ?? undefined
                                  }
                                  min={1900}
                                  max={2024}
                                  placeholder="year"
                                  autoComplete="email"
                                  className="w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                  onChange={(e) => {
                                    const newBirthDay = {
                                      ...contact.birthday,
                                      year: e.target.valueAsNumber,
                                    }
                                    setContact({
                                      ...contact,
                                      birthday: newBirthDay,
                                    })
                                  }}
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
                            <span className="text-white-900 bg-black pr-3 text-base font-semibold leading-6">
                              Extra phones
                            </span>
                            <button
                              onClick={(e) => {
                                const phoneNumbers = contact.phoneNumbers
                                  ? [...contact.phoneNumbers]
                                  : []
                                if (phoneNumbers.length <= 1) {
                                  phoneNumbers.push({
                                    ...phone(''),
                                    number: '',
                                    type: 'CELL',
                                  })
                                }
                                setContact({
                                  ...contact,
                                  phoneNumbers,
                                })
                                setShowPhones(!showPhones)
                              }}
                              type="button"
                              className="text-white-900 inline-flex items-center gap-x-1.5 rounded-full bg-black px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300"
                            >
                              {showPhones ? (
                                <MinusIcon
                                  className="-ml-1 -mr-0.5 h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                              ) : (
                                <PlusIcon
                                  className="-ml-1 -mr-0.5 h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                              )}
                              <span>
                                {showPhones
                                  ? 'Hide'
                                  : (contact.phoneNumbers?.length || 0) > 1
                                    ? 'Show'
                                    : 'Add'}
                              </span>
                            </button>
                          </div>
                        </div>
                        {showPhones &&
                          (contact.phoneNumbers ?? []).slice(1).map((a, i) => {
                            return (
                              <ContactDetailPhone
                                key={`${contact.id}_${i + 1}`}
                                callUpdate={(newPhoneData) => {
                                  setContact((prev) => ({
                                    ...prev,
                                    phoneNumbers: (prev.phoneNumbers ?? []).map(
                                      (phone, index) =>
                                        index === i + 1 ? newPhoneData : phone,
                                    ),
                                  }))
                                }}
                                callDelete={() => {
                                  setContact((prev) => ({
                                    ...prev,
                                    phoneNumbers: (
                                      prev.phoneNumbers ?? []
                                    ).filter((_, idx) => idx !== i + 1),
                                  }))
                                  setShowPhones(false)
                                }}
                                phone={a}
                              />
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
                            <span className="text-white-900 bg-black pr-3 text-base font-semibold leading-6">
                              Address
                            </span>
                            <button
                              onClick={(e) => {
                                const addresses = contact.addresses
                                  ? [...contact.addresses]
                                  : []
                                if (addresses.length === 0) {
                                  addresses.push({
                                    countryCode: null,
                                    city: null,
                                    region: null,
                                    postalCode: null,
                                    streetAddress: null,
                                  })
                                }
                                setContact({
                                  ...contact,
                                  addresses,
                                })
                                setShowAddresses(!showAddresses)
                              }}
                              type="button"
                              className="text-white-900 inline-flex items-center gap-x-1.5 rounded-full bg-black px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300"
                            >
                              {showAddresses ? (
                                <MinusIcon
                                  className="-ml-1 -mr-0.5 h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                              ) : (
                                <PlusIcon
                                  className="-ml-1 -mr-0.5 h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                              )}
                              <span>
                                {showAddresses
                                  ? 'Hide'
                                  : (contact.addresses?.length || 0) > 0
                                    ? 'Show'
                                    : 'Add'}
                              </span>
                            </button>
                          </div>
                        </div>
                        {showAddresses &&
                          (contact?.addresses || []).map((a, i) => {
                            return (
                              <ContactDetailAddress
                                key={`${contact.id}_${i}`}
                                callUpdate={(updatedAddress) => {
                                  const addresses = [
                                    ...(contact.addresses ?? []),
                                  ]
                                  addresses[i] = updatedAddress
                                  setContact({
                                    ...contact,
                                    addresses,
                                  })
                                }}
                                address={a}
                              />
                            )
                          })}

                        <div className="mt-8 border-b border-white/10 pb-12">
                          <h2 className="text-base font-semibold leading-7 text-white">
                            Notifications
                          </h2>
                          <p className="mt-1 text-sm leading-6 text-gray-400">
                            We&apos;ll always let you know about important
                            changes, but you pick what else you want to hear
                            about.
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
                                      disabled
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
                                      disabled
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
                                      defaultChecked
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

                      <div className="mt-6 flex items-center justify-end gap-x-6">
                        {!isSaving && (
                          <button
                            type="button"
                            className="text-sm font-semibold leading-6 text-white"
                            onClick={() => {
                              props.setOpen(false)
                            }}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        >
                          {isSaving ? (
                            <LoadingSpinner size={20} className="center" />
                          ) : (
                            'Save'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
