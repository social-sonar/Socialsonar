'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { redirect } from 'next/navigation'
import Button from './Button'
import {
  CheckIcon,
  HandThumbUpIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'
import { useEffect } from 'react'
import { RedirectType } from 'next/navigation'
import { classNames } from '@/lib/utils/common'
export default function ScopesNotApprovedDialog(props: {
  permissions: string[]
  message?: string | undefined
  setPermissions: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const [open, setOpen] = useState(true)

  const permissions = props.permissions.map((permission, id) => ({
    id: id,
    content: `${permission}`,
    target: '',
    href: '#',
    date: 'Sep 20',
    datetime: '2020-09-20',
    icon: XMarkIcon,
    iconBackground: 'bg-red-600',
  }))

  useEffect(() => {
    if (open == false) {
      props.setPermissions([])
      redirect('/sync', RedirectType.replace)
    }
  }, [open])

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <Dialog.Backdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon
                    aria-hidden="true"
                    className="h-6 w-6 text-red-600"
                  />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className="text-base font-semibold leading-6 text-gray-900"
                  >
                    Google permissions problem
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {props.message
                        ? props.message
                        : 'Some strictly necessary permissions were not granted correctly. Please give us  the required permissions to proceed.'}
                    </p>
                    <div className="flow-root">
                      <ul role="list" className="-mb-8 mt-6">
                        {permissions.map((event, eventIdx) => (
                          <li key={event.id}>
                            <div className="relative pb-8">
                              {eventIdx !== permissions.length - 1 ? (
                                <span
                                  aria-hidden="true"
                                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span
                                    className={classNames(
                                      event.iconBackground,
                                      'flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white',
                                    )}
                                  >
                                    <event.icon
                                      aria-hidden="true"
                                      className="h-5 w-5 text-white"
                                    />
                                  </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      {event.content}{' '}
                                      <a
                                        href={event.href}
                                        className="font-medium text-gray-900"
                                      >
                                        {event.target}
                                      </a>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <Button
                href="/api/auth/google"
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
              >
                Reconnect google account
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  )
}
