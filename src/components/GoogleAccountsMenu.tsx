import { Fragment, useRef, useState } from 'react'
import { Popover, Transition, Dialog } from '@headlessui/react'
import {
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid'
import { GoogleSyncButton } from './Sync'
import { pullGoogleContacts } from '@/actions/integrations'
import Button from './Button'
import GoogleAccountBackup from './GoogleAccountBackup'
import GoogleAccountRestore from './GoogleAccountRestore'
import { backupFileData } from '@/lib/definitions'
import { useNotification } from '@/app/NotificationsProvider'
import LoadingSpinner from './common/spinner'

export default function Menu({ googleAccountId }: { googleAccountId: string }) {
  const { showNotification, hideNotification } = useNotification()
  const [open, setOpen] = useState(true)

  const [syncing, setSyncing] = useState(false)

  const fileInput = useRef<HTMLInputElement>(null)
  const [backupData, setBackupData] = useState<backupFileData | null>(null)

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
      let data: backupFileData = {
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
      console.log('error laoding backup:', error)

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

    const response = await pullGoogleContacts(googleAccountId)
    response?.data.then(console.log)
    setSyncing(false)
    showNotification(
      'Successfully called sync process',
      `Your contacts will be pulled and sync in the following minutes`,
      <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />,
    )
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
        <GoogleAccountBackup
          googleAccountId={googleAccountId}
          callClose={async () => showBackup(false)}
        ></GoogleAccountBackup>
      )}
      {restore && (
        <GoogleAccountRestore
          googleAccountId={googleAccountId}
          callClose={async () => {
            showRestore(false)
            setBackupData(null)
          }}
          backupData={backupData}
        ></GoogleAccountRestore>
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
                      <LoadingSpinner size={20}></LoadingSpinner>
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
