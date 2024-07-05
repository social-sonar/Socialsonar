'use client'

import { useNotification } from '@/app/NotificationsProvider'
import protectPage from '@/components/common/auth'
import { Dialog, Transition } from '@headlessui/react'
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { signOut, useSession } from 'next-auth/react'
import React, { Fragment, useState } from 'react'
import { deleteAccount } from '../../actions/common/delete-account'
import Button from '../../components/Button'
import LoadingSpinner from '../../components/common/spinner'
import { exportAllContacts } from '@/actions/common/contacts-bulkactions'
import CalendarOptionsMenu from '@/components/CalendarActionsMenu'

function Profile() {
  const { showNotification } = useNotification()
  const session = useSession()
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const handleExport = async () => {
    if (isExporting) return
    setIsExporting(true)
    try {
      showNotification(
        'Exporting your contacts',
        'All your contacts are being exported. It can take some minutes',
        LoadingSpinner({ size: 20 }),
      )
      let response = await exportAllContacts()
      const vcardContent = response.exportedArray.join('\r\n')

      const blob = new Blob([vcardContent], { type: 'text/x-vcard' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download =
        session.data?.user.name?.replaceAll(' ', '_') + '_contacts.vcf'
      document.body.appendChild(link)
      link.click()
      showNotification(
        'Success!',
        'All your contacts has been exported successfully. Please check your downloads.',
        <CheckCircleIcon
          className="h-6 w-6 text-green-400"
          aria-hidden="true"
        />,
      )
    } catch (error) {
      showNotification(
        'Error!',
        'It was an error exporting your contacts. Please report the admin.',
        <ExclamationTriangleIcon
          className="h-6 w-6 text-red-400"
          aria-hidden="true"
        ></ExclamationTriangleIcon>,
      )
    } finally {
      setIsExporting(false)
    }
  }
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!isSaving && session.status == 'authenticated') {
      setIsSaving(true)
      showNotification(
        'Deleting',
        'Your account is being deleted',
        LoadingSpinner({ size: 20 }),
      )
      let saveResponse = await deleteAccount()

      if (saveResponse && saveResponse.errors?.length === 0) {
        showNotification(
          'Success!',
          'Your account has been deleted successfully.',
          <CheckCircleIcon
            className="h-6 w-6 text-green-400"
            aria-hidden="true"
          />,
        )
        await signOut()
      } else {
        showNotification(
          'Error!',
          'It was an error deleting your account. Please report the admin.',
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
    <div className='w-full flex justify-center'>
      <div>
        <Transition show={open} as={Fragment}>
          <Dialog className="relative z-10" onClose={() => setOpen(false)}>
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                          <ExclamationTriangleIcon
                            className="h-6 w-6 text-red-600"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <h3 className="text-base font-semibold leading-6 text-gray-900">
                            Deactivate account
                          </h3>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Are you sure you want to deactivate your account?
                              All of your data will be permanently removed. This
                              action cannot be undone.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <form onSubmit={handleSubmit}>
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        >
                          Deactivate
                        </button>
                      </form>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => setOpen(false)}
                        data-autofocus
                      >
                        Cancel
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
        <div className="flex flex-col items-center justify-center gap-10 w-fit mt-5">
          <CalendarOptionsMenu userId={session.data?.user.id!} />
          <Button
            disabled={isExporting}
            onClick={() => {
              handleExport()
            }}
            className='w-52'
          >
            Export all your contacts{' '}
            {isExporting ? (
              <LoadingSpinner size={20}></LoadingSpinner>
            ) : (
              <ArrowDownTrayIcon className="h-4 w-4"></ArrowDownTrayIcon>
            )}
          </Button>
          <Button
            onClick={() => {
              setOpen(true)
            }}
            className="dark:bg-red-700 dark:enabled:hover:bg-red-800 text-gray-500 w-52"
          >
            <span>Delete your account</span> <TrashIcon className="h-4 w-4"/>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default protectPage(Profile)
