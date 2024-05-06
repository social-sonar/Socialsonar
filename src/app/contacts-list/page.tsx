'use client'

import {
  Fragment,
  useEffect,
  useState,
  useCallback,
  AwaitedReactNode,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
} from 'react'
import { findContacts } from '@/lib/data'
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { getName, registerLocale } from 'i18n-iso-countries'
import {
  ChevronDownIcon,
  FunnelIcon,
  MinusIcon,
  PlusIcon,
  Squares2X2Icon,
} from '@heroicons/react/20/solid'

import { APP_NAME } from '@/lib/constants'
import clsx from 'clsx'
import Link from 'next/link'
import { FlattenContact } from '@/lib/definitions'
import { useSession } from 'next-auth/react'

import { useContacts } from '@/app/ContactsProvider'

import ContactDetail from '@/components/ContactDetail'

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

export default function Example({}) {
  registerLocale(require('i18n-iso-countries/langs/en.json'))
  
  // const [contacts, setContacts] = useState([
  //   {
  //     id: 1,
  //     name: 'Abuelita norma',
  //     emails: ['norma@example.com'],
  //     occupations: [{ id: 1, name: 'Grandma' }],
  //     photos:
  //       [{url:'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmatthewkimberley.com%2Fwp-content%2Fuploads%2F2013%2F05%2Fgrandmother.jpg&f=1&nofb=1&ipt=d0f05fed654bb8a848720b607e0b3dca7086282bf8125bc62f4c3f2c129b571b&ipo=images'}],
  //     lastSeen: '3h ago',
  //     lastSeenDateTime: '2023-01-23T13:23Z',
  //     favorite: true,
  //     location: 'Argentina',
  //     category: ['Personal'],
  //     source: 'custom',
  //     phoneNumbers: [],
  //   },
  //   {
  //     id: 2,
  //     name: 'Leslie Alexander',
  //     emails: ['leslie.alexander@example.com'],
  //     occupations: [{ id: 2, name: 'Co-Founder / CEO' }],
  //     photos:
  //       [{url:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}],
  //     lastSeen: '3h ago',
  //     lastSeenDateTime: '2023-01-23T13:23Z',
  //     favorite: true,
  //     location: 'United States',
  //     category: ['Personal', 'School'],
  //     source: 'google',
  //     phoneNumbers: [],
  //   },
  //   {
  //     id: 3,
  //     name: 'Michael Foster',
  //     emails: ['michael.foster@example.com'],
  //     occupations: [{ id: 3, name: 'Co-Founder / CTO' }],
  //     photos:
  //       [{url:'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}],
  //     lastSeen: '3h ago',
  //     lastSeenDateTime: '2023-01-23T13:23Z',
  //     favorite: true,
  //     location: 'United States',
  //     category: ['Personal', 'School'],
  //     source: 'google',
  //     phoneNumbers: [],
  //   },
  //   {
  //     id: 4,
  //     name: 'Dries Vincent',
  //     emails: ['dries.vincent@example.com'],
  //     occupations: [{ id: 4, name: 'Business Relations' }],
  //     photos:
  //       [{url:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}],
  //     lastSeen: null,
  //     favorite: false,
  //     location: 'United States',
  //     category: ['Apple'],
  //     source: 'google',
  //     phoneNumbers: [],
  //   },
  //   {
  //     id: 5,
  //     name: 'Juana Ladev',
  //     emails: ['juana.ladev@example.com'],
  //     occupations: [{ id: 5, name: 'Front-end Developer' }],
  //     photos:
  //       [{url:'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}],
  //     lastSeen: '3h ago',
  //     lastSeenDateTime: '2023-01-23T13:23Z',
  //     favorite: false,
  //     location: 'Argentina',
  //     category: ['Personal', 'School'],
  //     phoneNumbers: [],
  //   },
  //   {
  //     id: 6,
  //     name: 'Courtney Henry',
  //     emails: ['courtney.henry@example.com'],
  //     occupations: [{ id: 6, name: 'Designer' }],
  //     photos:
  //       [{url:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}],
  //     lastSeen: '3h ago',
  //     lastSeenDateTime: '2023-01-23T13:23Z',
  //     favorite: false,
  //     location: 'United States',
  //     category: ['Tesla'],
  //     phoneNumbers: [],
  //   },
  //   {
  //     id: 7,
  //     name: 'Tom Cook',
  //     emails: ['tom.cook@example.com'],
  //     occupations: [{ id: 7, name: 'Director of Product' }],
  //     photos:
  //       [{url:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}],
  //     lastSeen: null,
  //     favorite: false,
  //     location: 'United States',
  //     category: ['Apple'],
  //     phoneNumbers: [],
  //   },
  // ])

  const { contacts, updateContact, setContacts } = useContacts()
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState(filtersTemplate)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [sortApplied, setSortApplied] = useState<string | null>(null)
  const [filteredContacts, setFilteredContacts] = useState<FlattenContact[]>([])
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [hideFilterAdvice, setHideFilterAdvice] = useState(true)

  const session = useSession()

  const [showContactDetail, setShowContactDetail] = useState(false)
  const [detailedContact, setDetailedContact] = useState<FlattenContact | null>(
    null,
  )

  useEffect(() => {
    if (session.status == 'authenticated') {
      fetch(`/api/contacts-list?userId=${session?.data.user?.id}`)
        .then((response) => response.json())
        .then((data: FlattenContact[]) => {
          if (data.length) {
            setContacts(data)
            // setHideFilterAdvice(false)
          }
        })
        .catch((error) => console.error('Failed to load contacts', error))
    }
  }, [session.status])

  const handleSourceChange = (source: string) => {
    setSelectedSource(source)
  }

  useEffect(() => {
    let occupationOptions = filters.find((a) => {
      return a.id == 'occupation'
    })
    if (occupationOptions) {
      occupationOptions.options = contacts
        .flatMap((a) => {
          return (a.occupations || []).map((b) => {
            return { value: b.id.toString(), label: b.name, checked: false }
          })
        })
        .filter((v, i, a) => a.findIndex((v2) => v2.value === v.value) === i)
    } else {
      console.log('ERROR LOADING ROLEOPTIONS')
    }
    let categoryOptions = filters.find((a) => {
      return a.id == 'category'
    })
    if (categoryOptions) {
      categoryOptions.options = contacts
        .flatMap((a) => {
          return (a.category || []).map((b) => {
            return { value: b, label: b, checked: false }
          })
        })
        .filter((v, i, a) => a.findIndex((v2) => v2.value === v.value) === i)
    } else {
      console.log('ERROR LOADING CATEGORIES')
    }
    let locationOptions = filters.find((a) => {
      return a.id == 'location'
    })
    if (locationOptions) {
      locationOptions.options = [
        ...new Set(
          contacts.map((a) => {
            return a.location
          }),
        ),
      ].map((a) => {
        return { value: a, label: a, checked: false }
      })
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
    console.log('handleFilterChange', sectionId, optionIdx, checked)

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
          selectedRoles!.find((b) => b == a.id.toString()),
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
      {detailedContact && <ContactDetail
        open={showContactDetail}
        setOpen={setShowContactDetail}
        contact={detailedContact}
      />}

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

      <main className="mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
          <h1 className="text-white-900 text-4xl font-bold tracking-tight">
            Contact book
          </h1>

          <div className="flex items-center">
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

            {/* <button
              type="button"
              className="-m-2 ml-5 p-2 text-gray-400 hover:text-white-500 sm:ml-7"
            >
              <span className="sr-only">View grid</span>
              <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
            </button> */}
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
                                      : (option.label ?? "No assigned country")}
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
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <li
                        key={contact.id}
                        className="flex justify-between gap-x-6 py-5"
                        onClick={(e) => {
                          setShowContactDetail(true)
                          setDetailedContact(contact)
                        }}
                      >
                        <div className="flex min-w-0 gap-x-4">
                          {contact.photos && contact.photos[0] && (
                            <img
                              className="h-12 w-12 flex-none rounded-full bg-gray-800"
                              src={contact.photos[0].url}
                              alt=""
                            />
                          )}
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
                                      href={'tel://' + a.phoneNumber}
                                    >
                                      {a.phoneNumber}
                                    </a>
                                  )
                                })
                                .reduce(
                                  (acc, x) =>
                                    acc === null ? (
                                      x
                                    ) : (
                                      <>
                                        {acc} | {x}
                                      </>
                                    ),
                                  null as React.ReactNode | null,
                                )}
                            </p>
                          ) : (
                            <div className="mt-1 flex items-center gap-x-1.5">
                              {/* <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </div> */}
                              <p className="text-xs leading-5 text-gray-400">
                                No phone
                              </p>
                            </div>
                          )}
                        </div>
                      </li>
                    ))
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
    </>
  )
}
