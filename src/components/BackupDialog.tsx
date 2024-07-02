import { useEffect, useState } from 'react'
import { Transition, Dialog } from '@headlessui/react'
import { FolderIcon } from '@heroicons/react/24/outline'
import { BackupFileData } from '@/lib/definitions'

export default function AccountBackup({
    accountId,
    callClose,
    dataGetter,
    title,
    children
}: {
    accountId?: string,
    callClose: () => void,
    dataGetter: (() => Promise<BackupFileData | undefined>) | ((accountId: string) => Promise<BackupFileData | undefined>),
    title: string,
    children: React.ReactElement
}) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(true)

    useEffect(() => {
        if (!open) {
            callClose()
        }
    }, [open])

    async function onClickBackup(event: React.MouseEvent): Promise<void> {
        event.preventDefault()
        setLoading(true)
        const response = await dataGetter(accountId || '')
        const fileData = JSON.stringify(response)
        const blob = new Blob([fileData], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `${response?.email}_backup.json`
        link.href = url
        link.click()
        setLoading(false)
    }

    return (
        <Transition show={open}>
            <Dialog className="relative z-10" onClose={setOpen}>
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

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div>
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                                        <FolderIcon
                                            className="h-6 w-6 text-yellow-600"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-5">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-base font-semibold leading-6 text-gray-900"
                                        >
                                            {title}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            {children}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                    <button
                                        type="button"
                                        disabled={loading}
                                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                                        onClick={onClickBackup}
                                    >
                                        {loading ? 'Loading...' : 'Download Backup'}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={loading}
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
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
    )
}
