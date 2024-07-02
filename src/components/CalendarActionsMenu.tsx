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
import { prepareBackup, restoreBackup } from '@/actions/google/events/backupRestore'

export default function CalendarOptionsMenu() {
  const { showNotification } = useNotification()

  const [syncing] = useState(false)

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
          callClose={async () => showBackup(false)}
          dataGetter={prepareBackup}
          title='Backup your google events'
        >
          <p className="text-sm text-gray-500">
            Create a backup of your google events by clicking the
            button below. This will download all your active events in a
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
                Restore your google events backup
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Selected backup is from the main account <b>({backupData.email})</b>{' '}
                  google account, created at{' '}
                  <b>{backupData.date.toLocaleString()}</b>. Please
                  note that this will{' '}
                  <b>
                    overwrite all your current events in the Google
                    Calendar
                  </b>
                  . So be extremely careful while restoring your data
                </p>
              </div>
            </>
          )}
        </RestoreDialog>
      )}
      {fileInput && (
        <Popover className="relative">
          <Popover.Button className="text-white-900 inline-flex items-center gap-x-1 text-lg font-semibold leading-6">
            <span>Calendar actions</span>
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
                    onClick={() => {
                      showBackup(true)
                    }}
                    className="w-full"
                  >
                    Backup events
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
                    Restore events
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
