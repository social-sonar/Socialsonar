import { prepareBackup, pullGoogleContacts, restoreBackup } from '@/actions/integrations'
import { useNotification } from '@/app/NotificationsProvider'
import { BackupFileData } from '@/lib/definitions'
import { Dialog, Popover, Transition } from '@headlessui/react'
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid'
import { CircularProgress } from '@nextui-org/progress'
import { useEffect, useRef, useState } from 'react'
import Button from './Button'
import LoadingSpinner from './common/spinner'
import AccountBackup from './BackupDialog'
import RestoreDialog from './RestoreDialog'

export default function Menu({ googleAccountId }: { googleAccountId: string }) {
  const { showNotification } = useNotification()

  const [syncing, setSyncing] = useState(false)

  const fileInput = useRef<HTMLInputElement>(null)
  const [backupData, setBackupData] = useState<BackupFileData | null>(null)

  const [createdCounter, setCreatedCounter] = useState<number>(0)
  const [createdCounterTotal, setCreatedCounterTotal] = useState<number>(0)
  const [syncedCounter, setSyncedCounter] = useState<number>(0)
  const [syncedCounterTotal, setSyncedCounterTotal] = useState<number>(0)

  const [backup, showBackup] = useState(false)
  const [restore, showRestore] = useState(false)

  let fileReader: FileReader

  useEffect(() => {
    if (syncing) {
      showNotification(
        'Sync process',
        `Your contacts will be pulled and sync in the following minutes`,
        <CircularProgress
          aria-label="Loading..."
          size="lg"
          value={createdCounter + syncedCounter}
          maxValue={createdCounterTotal + syncedCounterTotal}
          className="text-sm text-green-600"
          showValueLabel={true}
        />,
      )
    }
    console.log(
      'createdCounter, syncedCounter',
      createdCounter,
      syncedCounter,
      syncing,
    )
  }, [createdCounter, syncedCounter])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    fileReader = new FileReader()
    fileReader.onloadend = handleFileRead
    fileReader.readAsText(e.target.files[0])
  }

  const handleFileRead = (e: ProgressEvent<FileReader>) => {
    const content = fileReader.result
    try {
      const parsedData = JSON.parse(content!.toString())
      let data: BackupFileData = {
        email: '',
        data: '',
        date: new Date(),
        user: '',
      }
      if (parsedData.user) {
        data.user = parsedData.user
      } else {
        throw new Error('Invalid file format')
      }
      if (parsedData.email) {
        data.email = parsedData.email
      } else {
        throw new Error('Invalid file format')
      }
      if (parsedData.date) {
        data.date = new Date(parsedData.date)
      } else {
        throw new Error('Invalid file format')
      }
      if (parsedData.data) {
        data.data = parsedData.data
      } else {
        throw new Error('Invalid file format')
      }
      setBackupData(data)
      showRestore(true)
    } catch (error) {
      setBackupData(null)
      showRestore(false)
      console.log('Error loading backup:', error)

      showNotification(
        'Error!',
        'It was an error in your restore file. Please try again or contact us if the problem persists.',
        <ExclamationTriangleIcon
          className="h-6 w-6 text-red-400"
          aria-hidden="true"
        ></ExclamationTriangleIcon>,
      )
    }
  }
  const handleSyncButton = async (event: React.FormEvent) => {
    event.preventDefault()
    setSyncing(true)

    try {
      showNotification(
        'Called sync process',
        `Your contacts will be pulled and sync in the following minutes`,
        <LoadingSpinner size={30}></LoadingSpinner>,
      )
      const response = await pullGoogleContacts(googleAccountId)

      if (response?.data) {
        response?.data.then(async (heavyTasks) => {
          console.log(
            'heavyTasks',
            heavyTasks.createdContactsPromise.length,
            heavyTasks.syncedContactsPromise.length,
          )
          setCreatedCounter(0)
          setCreatedCounterTotal(heavyTasks.createdContactsPromise.length)
          heavyTasks.createdContactsPromise.forEach((a) => {
            a.then(() => {
              setCreatedCounter((prevCount) => {
                return prevCount + 1
              })
            })
          })
          setSyncedCounter(0)
          setSyncedCounterTotal(heavyTasks.syncedContactsPromise.length)
          heavyTasks.syncedContactsPromise.forEach((a) => {
            a.then(() => {
              setSyncedCounter((prevCount) => {
                return prevCount + 1
              })
            })
          })
            ; (await Promise.all(heavyTasks.syncedContactsPromise)) &&
              (await Promise.all(heavyTasks.createdContactsPromise))
          setSyncing(false)
          setSyncedCounter(0)
          setSyncedCounterTotal(0)
          setCreatedCounter(0)
          setCreatedCounterTotal(0)
          showNotification(
            'Successfully synced contacts',
            `Your contacts have been pulled and synced succesfully`,
            <CheckCircleIcon
              className="h-6 w-6 text-green-400"
              aria-hidden="true"
            />,
          )
        })
      } else {
        console.log(response?.msg)
        setSyncing(false)
        showNotification(
          'Error!',
          `There was an error syncing your contacts: ${response?.msg}`,
          <ExclamationTriangleIcon
            className="h-6 w-6 text-red-400"
            aria-hidden="true"
          ></ExclamationTriangleIcon>,
        )
      }
    } catch (error) {
      setSyncing(false)
      console.log('ERROR:', error)
    }
  }

  return (
    <>
      <input
        ref={fileInput}
        hidden
        type="file"
        accept="application/json"
        onChange={handleFileInput}
      ></input>
      {backup && (
        <AccountBackup
          accountId={googleAccountId}
          callClose={async () => showBackup(false)}
          dataGetter={prepareBackup}
          title='Backup your google contacts'
        >
          <p className="text-sm text-gray-500">
            Create a backup of your google contacts by clicking the
            button below. This will download all your contacts in a
            JSON encrypted file to allow you to restore them later
            if necessary.
          </p>
        </AccountBackup>
      )}
      {restore && (
        <RestoreDialog
          callClose={async () => {
            showRestore(false)
            setBackupData(null)
          }}
          backupData={backupData}
          restoreFunction={restoreBackup}
        >
          {(backupData) => (
            <>
              <Dialog.Title
                as="h3"
                className="text-base font-semibold leading-6 text-gray-900"
              >
                Restore your google contacts backup
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Selected backup is from <b>({backupData.email})</b>{' '}
                  google account, created at{' '}
                  <b>{backupData.date.toLocaleString()}</b>. Please
                  note that this will{' '}
                  <b>
                    overwrite all your current contacts in Google
                    Contacts
                  </b>
                  . So be extremely careful while restoring your
                  contacts.
                </p>
              </div>
            </>
          )}
        </RestoreDialog>
      )}
      {fileInput && (
        <Popover className="relative">
          <Popover.Button className="text-white-900 inline-flex items-center gap-x-1 text-sm font-semibold leading-6">
            <span>More</span>
            <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
          </Popover.Button>

          <Transition
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4">
              <div className="flex-auto rounded-3xl bg-white p-4 text-left text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                <div className="pb-4">
                  <Button
                    onClick={handleSyncButton}
                    disabled={syncing}
                    className="w-full"
                  >
                    {syncing ? (
                      <LoadingSpinner size={24}></LoadingSpinner>
                    ) : (
                      'Sync google contacts'
                    )}
                  </Button>
                </div>
                <div className="pb-4">
                  <Button
                    onClick={() => {
                      showBackup(true)
                    }}
                    className="w-full"
                  >
                    Backup contacts
                  </Button>
                </div>
                <div className="">
                  <Button
                    disabled={false}
                    onClick={() => {
                      if (fileInput.current) {
                        fileInput.current.value = ''
                        setBackupData(null)
                        fileInput.current?.click()
                      }
                    }}
                    className="w-full"
                  >
                    Restore contacts
                  </Button>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </Popover>
      )}{' '}
    </>
  )
}
