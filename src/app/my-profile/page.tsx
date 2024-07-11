'use client'

import { exportAllContacts } from '@/actions/common/contacts-bulkactions'
import { useNotification } from '@/app/NotificationsProvider'
import CalendarOptionsMenu from '@/components/CalendarActionsMenu'
import protectPage from '@/components/common/auth'
import LocationPicker from '@/components/LocationPicker'
import { changeHomeBaseStatus, removeHomeBase, upsertLocation, userHomeBases } from '@/lib/data/safeQueries'
import { LocationSetData } from '@/lib/definitions'
import { Dialog, Switch, Transition } from '@headlessui/react'
import { ArrowLeftIcon, MapPinIcon, UserIcon } from '@heroicons/react/20/solid'
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { HomeBase } from '@prisma/client'
import { signOut, useSession } from 'next-auth/react'
import React, { Fragment, useEffect, useState } from 'react'
import { deleteAccount } from '../../actions/common/delete-account'
import Button from '../../components/Button'
import LoadingSpinner from '../../components/common/spinner'


type HomeBasesManagerProps = {
  homeBases: Pick<HomeBase, 'id' | 'location' | 'active'>[],
  updateHomeBases: (homeBases: Pick<HomeBase, 'id' | 'location' | 'active'>[]) => void,
  closeAction: () => void,
  onLocationSet: (locationData: LocationSetData, localUpdater: (newData: Pick<HomeBase, 'id' | 'location' | 'active'>[]) => void) => Promise<void>
}

type AddressToggleProps = {
  isEnabled: boolean,
  onChange: (active: boolean) => void
}

const AddressToggle = ({ isEnabled, onChange }: AddressToggleProps) => {
  const [enabled, setEnabled] = useState(isEnabled)

  useEffect(() => {
    setEnabled(isEnabled)
  }, [isEnabled])

  return (
    <Switch
      checked={enabled}
      onChange={(checked) => {
        setEnabled(checked)
        onChange(checked)
      }}
      className={`${enabled ? 'bg-teal-900' : 'bg-gray-500'}
          relative inline-flex h-[30px] w-[50px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
      title={`${enabled ? 'Deactivate home base' : 'Set as your home base'}`}>
      <span
        aria-hidden="true"
        className={`${enabled ? 'translate-x-4' : 'translate-x-0'}
            pointer-events-none inline-block h-[26px] w-[30px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
      />
    </Switch>
  )
}

const HomeBasesManager = ({ homeBases, closeAction, onLocationSet, updateHomeBases }: HomeBasesManagerProps) => {
  const maxHomeBases = homeBases.length === 2
  const noHomeBases = homeBases.length === 0
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false)
  const [activeBaseId, setActiveBaseId] = useState<string>('')
  const [localHomeBases, setLocalHomeBases] = useState<Pick<HomeBase, 'id' | 'location' | 'active'>[]>(homeBases)

  const onHomeBaseSelection = async (homeBase: Pick<HomeBase, 'id' | 'location' | 'active'>, isActive: boolean) => {
    if (isActive) {
      const newData = localHomeBases.map(localHomeBase => ({ ...localHomeBase, active: localHomeBase.id === homeBase.id }))
      setLocalHomeBases(newData)
      setActiveBaseId(homeBase.id)
    }
    else {
      homeBase.active = false
      setLocalHomeBases([...localHomeBases])
      setActiveBaseId('')
    }
    await changeHomeBaseStatus(homeBase.id, isActive)
  }

  const localUpdater = (newData: Pick<HomeBase, 'id' | 'location' | 'active'>[]) => setLocalHomeBases(newData)

  useEffect(() => {
    updateHomeBases(localHomeBases)
  }, [closeAction, localHomeBases])


  return (
    <div className='flex flex-col gap-5 justify-center items-center'>
      {/* layout does not matter here as the LocationPicker is a modal */}
      {showLocationPicker &&
        <LocationPicker
          callClose={() => setShowLocationPicker(false)}
          onLocationSet={async (locationData: LocationSetData) => {
            onLocationSet(locationData, localUpdater)
          }}
        />
      }
      <button onClick={closeAction}><ArrowLeftIcon className='w-10' /></button>
      <div className='flex flex-col gap-3 justify-center items-center'>
        {noHomeBases ?
          <p>No home bases have been set yet</p> :
          <table className='table-auto border-collapse text-left border-slate-500'>
            <thead>
              <tr className='*:p-3'>
                <th className='border-b border-slate-600'>Address</th>
                <th className='border-b border-slate-600'>Status</th>
                <th className='border-b border-slate-600'>Edit</th>
                <th className='border-b border-slate-600'>Remove</th>
              </tr>
            </thead>
            <tbody>
              {localHomeBases.map((homebase) =>
                <tr key={homebase.id} className='*:p-3'>
                  <td className='flex gap-1'>
                    <MapPinIcon className='w-[20px] text-red-500' />
                    <span>{homebase.location}</span>
                  </td>
                  <td>
                    <AddressToggle
                      // The first condition ensures that the active home base is rendered as active on component creation
                      isEnabled={homebase.active || activeBaseId === homebase.id}
                      onChange={(active: boolean) => onHomeBaseSelection(homebase, active)}
                    />
                  </td>
                  <td>
                    <PencilIcon className='w-[20px] text-green-200 cursor-pointer' />
                  </td>
                  <td className='flex justify-center'>
                    <button
                      disabled={homebase.active || activeBaseId === homebase.id}
                      className='cursor-pointer disabled:opacity-50 disabled:cursor-default'
                      title={`${(homebase.active || activeBaseId === homebase.id) ? 'You cannot delete an active home base' : ''}`}>
                      <TrashIcon
                        className='w-[20px] text-red-500'
                        onClick={() => {
                          removeHomeBase(homebase.id)
                          setLocalHomeBases(localHomeBases.filter(localHomeBase => localHomeBase.id !== homebase.id))
                        }}
                      />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        }
        {!maxHomeBases &&
          <Button className="flex gap-2 justify-center items-center " onClick={() => setShowLocationPicker(true)}>
            Add home base
          </Button>
        }
      </div>
    </div>

  )
}

function Profile() {
  const { showNotification } = useNotification()
  const session = useSession()
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showHomeBasesManager, setShowHomeBasesManager] = useState(false)

  const [homeBases, setHomeBases] = useState<Pick<HomeBase, 'id' | 'location' | 'active'>[]>([])

  const fetchData = async () => {
    let response = await userHomeBases(session.data?.user.id!)
    setHomeBases(response)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onLocationSet = async (locationData: LocationSetData, localUpdater: (newData: Pick<HomeBase, 'id' | 'location' | 'active'>[]) => void) => {
    const result = await upsertLocation(locationData)
    if (result) {
      setHomeBases([...homeBases, result])
      localUpdater([...homeBases, result])
    }
  }

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
        {showHomeBasesManager ?
          <HomeBasesManager
            closeAction={() => setShowHomeBasesManager(false)}
            homeBases={homeBases}
            onLocationSet={onLocationSet}
            updateHomeBases={setHomeBases}
          /> :
          <div className="flex flex-col items-center justify-center gap-10 w-fit mt-5">
            <Button className="w-52 flex gap-2" onClick={() => setShowHomeBasesManager(true)}>
              <span>Manage home bases</span>
              <MapPinIcon className='w-5' />
            </Button>
            <Button className="w-52">
              <span>About me</span> <UserIcon className="w-5" />
            </Button>
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
                <LoadingSpinner size={20} />
              ) : (
                <ArrowDownTrayIcon className="w-4" />
              )}
            </Button>
            <Button
              onClick={() => {
                setOpen(true)
              }}
              className="dark:enabled:bg-red-700 dark:hover:enabled:bg-red-800 dark:active:enabled:bg-red-800 w-52"
            >
              <span>Delete your account</span> <TrashIcon className="w-4" />
            </Button>
          </div>

        }

      </div>
    </div>
  )
}

export default protectPage(Profile)
