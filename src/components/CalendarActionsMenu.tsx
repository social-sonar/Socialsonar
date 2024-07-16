import { syncGoogleCalendar } from '@/actions'
import { prepareBackup, restoreBackup } from '@/actions/google/events/backupRestore'
import { useNotification } from '@/app/NotificationsProvider'
import { BackupFileData } from '@/lib/definitions'
import { Dialog, Popover, Transition } from '@headlessui/react'
import {
  ChevronUpDownIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon
} from '@heroicons/react/20/solid'
import { useRef, useState } from 'react'
import AccountBackup from './BackupDialog'
import Button, { predefinedStyle } from './Button'
import EventGenerator from './EventGenerator'
import RestoreDialog from './RestoreDialog'
import LoadingSpinner from './common/spinner'
import TravelManager from './TravelManager'


export default function CalendarOptionsMenu({ userId }: { userId: string }) {
  const { showNotification, hideNotification } = useNotification()

  const [syncing, setSyncing] = useState(false)

  const fileInput = useRef<HTMLInputElement>(null)
  const [backupData, setBackupData] = useState<BackupFileData | null>(null)
  const [generator, showGenerator] = useState(false)
  const [travel, showTravel] = useState(false)
  const [backup, showBackup] = useState(false)
  const [restore, showRestore] = useState(false)

  let fileReader: FileReader

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

  const clipBoardNotificationHandler = async () => {
    showNotification(
      'URL copied to clipboard',
      '',
      <ClipboardDocumentIcon className="w-[25px] text-black" />,
      'bg-green-500 flex flex-col justify-center',
    )
    await new Promise(() => setTimeout(hideNotification, 5000))
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
      {travel &&
        <TravelManager
          showNotification={clipBoardNotificationHandler}
          userId={userId}
          callClose={() => {
            showTravel(false)
          }}
        />}
      {generator && (
        <EventGenerator
          showNotification={clipBoardNotificationHandler}
          userId={userId}
          callClose={() => {
            showGenerator(false)
          }}
        />
      )}
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
          <Popover.Button className={`text-white-900 items-center flex w-52 ${predefinedStyle()}`}>
            <span>Calendar actions</span>
            <ChevronUpDownIcon className="w-5" aria-hidden="true" />
          </Popover.Button>

          <Transition
            enter="transition ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Popover.Panel className="absolute z-10 flex w-screen max-w-max px-4 left-10 top-14">
              <div className="flex flex-col rounded-3xl bg-white p-4 text-left text-sm leading-6 shadow-lg ring-1 ring-gray-900/5 gap-3">
                <Button className="w-full"
                  disabled={syncing}
                  onClick={async () => {
                    setSyncing(true)
                    await syncGoogleCalendar(userId, undefined, false)
                    setSyncing(false)
                    showNotification(
                      'Done',
                      `Your events were pulled and sync successfully`,
                      <CheckBadgeIcon
                        className="text-sm text-green-600 w-[25px]"
                      />,
                    )
                  }}>
                  {
                    syncing &&
                    <LoadingSpinner size={24} />
                  }
                  <span>Sync calendar</span>
                </Button>
                <Button
                  onClick={() => {
                    showTravel(true)
                  }}
                >
                  Register travel
                </Button>
                <Button
                  onClick={async () => {
                    showGenerator(true)
                    await syncGoogleCalendar(userId, undefined, false)
                  }}
                  className="w-full"
                >
                  Generate event URL
                </Button>
                <Button
                  onClick={() => {
                    showBackup(true)
                  }}
                  className="w-full"
                >
                  Backup events
                </Button>
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
            </Popover.Panel>
          </Transition>
        </Popover>
      )}{' '}
    </>
  )
}
