'use client'

import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react'
import {
  ChevronDownIcon,
  FunnelIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'
import { getName, registerLocale } from 'i18n-iso-countries'
import { Fragment, useEffect, useState, Suspense } from 'react'

import { useContacts } from '@/app/ContactsProvider'
import ContactDetail from '@/components/ContactDetail'
import DuplicatesScreen from '@/components/DuplicatesScreen'
import LoadingSpinner from '@/components/common/spinner'
import RefreshIcon from '@/images/icons/refresh.svg'
import UserIcon from '@/images/icons/user.svg'
import { APP_NAME } from '@/lib/constants'
import { FlattenContact } from '@/lib/definitions'
import clsx from 'clsx'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ContentLoader from 'react-content-loader'
import ContactListSkeleton from '@/components/ContactListSkeleton'

const sortOptions = [
  { name: 'A - Z', href: '#', current: true },
  { name: 'Z - A', href: '#', current: false },
]
const contactsSource = [
  { value: 'all', name: 'All', href: '#', current: true },
  { value: 'favorites', name: 'Favorites', href: '#', current: false },
  { value: 'google', name: 'Imported from Google', href: '#', current: false },
  { value: 'custom', name: `Added in ${APP_NAME}`, href: '#', current: false },
]
const filtersTemplate = [
  {
    id: 'occupation',
    name: 'Job / Role / Occupation',
    options: [] as Option[],
  },
  {
    id: 'category',
    name: 'Category',
    options: [] as Option[],
  },
  {
    id: 'location',
    name: 'Location (city / state / country)',
    options: [] as Option[],
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface Option {
  value: string | null
  label: string | null
  checked: boolean
}

export default function ContactList() {
  const { contacts, updateContact, setContacts } = useContacts()
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState(filtersTemplate)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [sortApplied, setSortApplied] = useState<string | null>(null)
  const [filteredContacts, setFilteredContacts] = useState<FlattenContact[]>([])
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [hideFilterAdvice, setHideFilterAdvice] = useState(true)

  const session = useSession()
  const searchParams = useSearchParams()

  const [showContactDetail, setShowContactDetail] = useState(false)
  const [detailedContact, setDetailedContact] =
    useState<Partial<FlattenContact> | null>(null)

  useEffect(() => {
    if (searchParams.has('add-new-contact')) {
      setDetailedContact({
        addresses: [],
        name: '',
      })
      setShowContactDetail(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (!showContactDetail) {
      setDetailedContact(null)
    }
  }, [showContactDetail])

  const fetchContacts = () => {
    setIsLoading(true)
    fetch(`/api/contacts-list`)
      .then((response) => response.json())
      .then((data: FlattenContact[]) => {
        setContacts(data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Failed to load contacts', error)
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchContacts()
  }, [session.status])

  const handleSourceChange = (source: string) => {
    setSelectedSource(source)
  }

  useEffect(() => {
    let occupationOptions = filters.find((a) => a.id == 'occupation')
    if (occupationOptions) {
      occupationOptions.options = contacts
        .flatMap((a) =>
          (a.occupations || []).map((b) => ({
            value: (b.id || '').toString(),
            label: b.name,
            checked: false,
          })),
        )
        .filter((v, i, a) => a.findIndex((v2) => v2.value === v.value) === i)
    } else {
      console.log('ERROR LOADING ROLEOPTIONS')
    }
    let categoryOptions = filters.find((a) => a.id == 'category')
    if (categoryOptions) {
      categoryOptions.options = contacts
        .flatMap((a) =>
          (a.category || []).map((b) => ({
            value: b,
            label: b,
            checked: false,
          })),
        )
        .filter((v, i, a) => a.findIndex((v2) => v2.value === v.value) === i)
    } else {
      console.log('ERROR LOADING CATEGORIES')
    }
    let locationOptions = filters.find((a) => a.id == 'location')
    if (locationOptions) {
      locationOptions.options = [
        ...new Set(contacts.map((a) => a.location)),
      ].map((a) => ({ value: a, label: a, checked: false }))
    } else {
      console.log('ERROR LOADING CATEGORIES')
    }
  }, [contacts])

  useEffect(() => {
    let newFilteredContacts = contacts

    if (selectedSource !== 'all') {
      if (selectedSource == 'favorites') {
        newFilteredContacts = newFilteredContacts.filter(
          (person) => person.favorite,
        )
      } else {
        newFilteredContacts = newFilteredContacts.filter((person) =>
          person.source?.includes(selectedSource),
        )
      }
    }

    setFilteredContacts(newFilteredContacts)
  }, [filters, selectedSource, contacts])

  const handleFilterChange = (
    sectionId: string,
    optionIdx: string,
    checked: boolean,
  ) => {
    const newFilters = filters.map((section) => {
      if (section.id === sectionId) {
        const newOptions = section.options.map((option, idx) => {
          if (idx.toString() === optionIdx) {
            return { ...option, checked }
          }
          return option
        })
        return { ...section, options: newOptions }
      }
      return section
    })
    setFilters(newFilters)
  }

  useEffect(() => {
    let newFilteredContacts = contacts

    const occupationFilter = filters.find(
      (filter) => filter.id === 'occupation',
    )
    const selectedRoles = occupationFilter?.options
      .filter((option) => option.checked)
      .map((option) => option.value)
    if ((selectedRoles || []).length > 0) {
      newFilteredContacts = newFilteredContacts.filter((contact) =>
        contact.occupations.find((a) =>
          selectedRoles!.find((b) => b == (a.id || '').toString()),
        ),
      )
    }

    const locationFilter = filters.find((filter) => filter.id === 'location')
    const selectedLocations = locationFilter?.options
      .filter((option) => option.checked)
      .map((option) => option.value)
    if ((selectedLocations || []).length > 0) {
      newFilteredContacts = newFilteredContacts.filter((person) =>
        selectedLocations!.includes(person.location),
      )
    }

    const categoryFilter = filters.find((filter) => filter.id === 'category')
    const selectedCategories = (categoryFilter?.options || [])
      .filter((option) => option.checked)
      .map((option) => option.value)
    if (selectedCategories.length > 0) {
      newFilteredContacts = newFilteredContacts.filter((person) =>
        (person.category || []).some((category) =>
          selectedCategories.includes(category),
        ),
      )
    }

    setFilteredContacts(newFilteredContacts)
  }, [filters, contacts])

  useEffect(() => {
    if (sortApplied == undefined) {
      return
    }

    setFilteredContacts(
      filteredContacts.sort((a, b) => {
        return sortApplied == 'AZ'
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name)
      }),
    )
  }, [sortApplied, contacts, filteredContacts])

  return (
    <>
      {detailedContact && (
        <ContactDetail
          open={showContactDetail}
          setOpen={setShowContactDetail}
          contact={detailedContact}
          session={session.data}
        />
      )}

      {/* Mobile filter dialog */}
      <Transition.Root show={mobileFiltersOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 lg:hidden"
          onClose={setMobileFiltersOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-white-900 text-lg font-medium">
                    Filters
                  </h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Filters */}
                <form className="mt-4 border-t border-gray-200">
                  <h3 className="sr-only">Categories</h3>
                  <ul
                    role="list"
                    className="text-white-900 px-2 py-3 font-medium"
                  >
                    {contactsSource.map((category) => (
                      <li key={category.name}>
                        <a href={category.href} className="block px-2 py-3">
                          {category.name}
                        </a>
                      </li>
                    ))}
                  </ul>

                  {filters
                    .filter((a) => a.options.length > 0)
                    .map((section) => (
                      <Disclosure
                        as="div"
                        key={section.id}
                        className="border-t border-gray-200 px-4 py-6"
                      >
                        {({ open }) => (
                          <>
                            <h3 className="-mx-2 -my-3 flow-root">
                              <Disclosure.Button className="hover:text-white-500 flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400">
                                <span className="text-white-900 font-medium">
                                  {section.name}
                                </span>
                                <span className="ml-6 flex items-center">
                                  {open ? (
                                    <MinusIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <PlusIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  )}
                                </span>
                              </Disclosure.Button>
                            </h3>
                            <Disclosure.Panel className="pt-6">
                              <div className="space-y-6">
                                {section.options.map((option, optionIdx) => (
                                  <div
                                    key={option.value}
                                    className="flex items-center"
                                  >
                                    <input
                                      id={`filter-mobile-${section.id}-${optionIdx}`}
                                      name={`${section.id}[]`}
                                      defaultValue={option.value || undefined}
                                      type="checkbox"
                                      defaultChecked={option.checked}
                                      onChange={(e) =>
                                        handleFilterChange(
                                          section.id,
                                          optionIdx.toString(),
                                          e.target.checked,
                                        )
                                      }
                                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label
                                      htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                      className="text-white-500 ml-3 min-w-0 flex-1"
                                    >
                                      {option.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    ))}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      {/* {isLoading ? (
        <LoadingSpinner size={100} className="mx-auto" />
      ) : ( */}
      <main className="mx-auto h-full px-4 sm:px-6 lg:px-8">
        <DuplicatesScreen
          contacts={contacts.filter(
            (contact) => contact.duplicates?.length! > 0 || false,
          )}
        />

        <div className="flex items-center justify-between gap-7 border-b border-gray-200 pb-6 pt-2 md:mt-10 lg:mt-5">
          <h1 className="text-white-900 text-xl font-bold tracking-tight md:text-4xl lg:text-4xl">
            Contact book
          </h1>

          <div className="flex gap-0">
            <button className="h-[25px] w-[25px]">
              <img
                src={RefreshIcon.src}
                alt="Refresh icon"
                title="Refresh contact list"
                onClick={fetchContacts}
              />
            </button>
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="hover:text-white-900 text-white-700 group inline-flex justify-center pl-6 text-sm font-medium">
                  Sort{' '}
                  {sortApplied ? (sortApplied == 'AZ' ? 'A - Z' : 'Z - A') : ''}
                  <ChevronDownIcon
                    className="group-hover:text-white-500 -mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="w-18 absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            sortApplied == 'AZ'
                              ? 'font-medium text-gray-900'
                              : 'text-gray-500',
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm',
                          )}
                          onClick={() => {
                            setSortApplied('AZ')
                          }}
                        >
                          A - Z
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            sortApplied == 'ZA'
                              ? 'font-medium text-gray-900'
                              : 'text-gray-500',
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm',
                          )}
                          onClick={() => {
                            setSortApplied('ZA')
                          }}
                        >
                          Z - A
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            <button
              type="button"
              className="hover:text-white-500 -m-2 ml-4 p-2 text-gray-400 sm:ml-6 lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <span className="sr-only">Filters</span>
              <FunnelIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <section aria-labelledby="products-heading" className="pb-24 pt-6">
          <h2 id="products-heading" className="sr-only">
            Products
          </h2>

          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
            {/* Filters */}
            <form className="hidden lg:block">
              <h3 className="sr-only">Categories</h3>
              <ul
                role="list"
                className="text-white-900 space-y-4 border-b border-gray-200 pb-6 text-sm font-medium"
              >
                {contactsSource.map((category) => (
                  <li key={category.name}>
                    <button
                      type="button"
                      onClick={() => handleSourceChange(category.value)}
                      className={clsx(
                        'text-white-600 ml-3 text-sm',
                        selectedSource === category.value
                          ? 'text-teal-500 dark:text-teal-400'
                          : 'hover:text-teal-500 dark:hover:text-teal-400',
                      )}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>

              {hideFilterAdvice &&
                filters
                  .filter((a) => a.options.length > 0)
                  .map((section) => (
                    <Disclosure
                      as="div"
                      key={section.id}
                      className="border-b border-gray-200 py-6"
                    >
                      {({ open }) => (
                        <>
                          <h3 className="-my-3 flow-root">
                            <Disclosure.Button className="hover:text-white-500 flex w-full items-center justify-between bg-white py-3 pl-3 text-sm text-gray-400">
                              <span className="text-white-900 font-medium">
                                {section.name}
                              </span>
                              <span className="ml-6 mr-2 flex items-center">
                                {open ? (
                                  <MinusIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <PlusIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                )}
                              </span>
                            </Disclosure.Button>
                          </h3>
                          <Disclosure.Panel className="pt-8">
                            <div className="space-y-4">
                              {section.options.map((option, optionIdx) => (
                                <div
                                  key={option.value}
                                  className="flex items-center"
                                >
                                  <input
                                    id={`filter-${section.id}-${optionIdx}`}
                                    name={`${section.id}[]`}
                                    defaultValue={option.value || undefined}
                                    type="checkbox"
                                    defaultChecked={option.checked}
                                    onChange={(e) =>
                                      handleFilterChange(
                                        section.id,
                                        optionIdx.toString(),
                                        e.target.checked,
                                      )
                                    }
                                    className="h-4 w-4 rounded text-teal-600"
                                  />
                                  <label
                                    htmlFor={`filter-${section.id}-${optionIdx}`}
                                    className={clsx(
                                      'text-white-600 ml-3 text-sm',
                                      option.checked
                                        ? 'text-teal-500 dark:text-teal-400'
                                        : 'hover:text-teal-500 dark:hover:text-teal-400',
                                    )}
                                  >
                                    {section.id == 'location' && option.label
                                      ? getName(option.label, 'en', {
                                          select: 'alias',
                                        }) ?? 'No assigned country'
                                      : option.label ?? 'No assigned country'}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  ))}

              {!hideFilterAdvice ? (
                <p className="text-white-600 sm-text">
                  There are no filters applicable <br></br> for the contacts
                  list
                </p>
              ) : (
                <></>
              )}
            </form>
            {/* Product grid */}
            <div className="lg:col-span-3">
              {
                <ul
                  role="list"
                  className="w-full max-w-7xl divide-y divide-gray-800"
                >
                  {filteredContacts.length > 0 && !isLoading ? (
                    filteredContacts.map((contact) => (
                      <li
                        key={contact.id}
                        className="flex justify-between gap-x-6 py-5"
                        onClick={(e) => {
                          e.preventDefault()
                          setDetailedContact(contact)
                          setShowContactDetail(true)
                        }}
                      >
                        <div className="flex min-w-0 gap-x-4">
                          <img
                            className="h-12 w-12 flex-none rounded-full bg-gray-800"
                            src={
                              contact.photos && contact.photos[0]
                                ? contact.photos[0].url
                                : UserIcon.src
                            }
                            alt=""
                          />
                          <div className="min-w-0 flex-auto">
                            <p className="text-sm font-semibold leading-6 text-white">
                              {contact.name}
                            </p>
                            <p className="mt-1 truncate text-xs leading-5 text-gray-400">
                              {contact.emails.length == 0
                                ? 'No email found'
                                : contact.emails[0].address}
                            </p>
                          </div>
                        </div>
                        <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                          <p className="text-sm leading-6 text-white">
                            {contact.occupations.length == 0
                              ? 'No role found'
                              : contact.occupations
                                  .map((a: { name: any }) => a.name)
                                  .join(' | ')}
                          </p>
                          {contact.phoneNumbers.length > 0 ? (
                            <p className="mt-1 text-xs leading-5 text-gray-400">
                              {contact.phoneNumbers
                                .map((a, index) => {
                                  return (
                                    <a
                                      key={contact.id + 'index:' + index}
                                      href={
                                        'tel://' + (a.phoneNumber || a.number)
                                      }
                                    >
                                      {a.phoneNumber || a.number}
                                    </a>
                                  )
                                })
                                .reduce(
                                  (acc, x) =>
                                    acc === null ? (
                                      x
                                    ) : (
                                      <>
                                        {acc}
                                        <span className="mx-2">|</span>
                                        {x}
                                      </>
                                    ),
                                  null as React.ReactNode | null,
                                )}
                            </p>
                          ) : (
                            <div className="mt-1 flex items-center gap-x-1.5">
                              <p className="text-xs leading-5 text-gray-400">
                                No phone
                              </p>
                            </div>
                          )}
                        </div>
                      </li>
                    ))
                  ) : contacts.length == 0 ? (
                    <>{ContactListSkeleton(10)}</>
                  ) : (
                    <p>
                      No contacts yet. Sync your contacts{' '}
                      <Link href={'/sync'} className="text-teal-500">
                        here
                      </Link>
                    </p>
                  )}
                </ul>
              }
            </div>
          </div>
        </section>
      </main>
      {/* )} */}
    </>
  )
}
