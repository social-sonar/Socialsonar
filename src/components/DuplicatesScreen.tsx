import UserIcon from '@/images/icons/user.svg';
import { FlattenContact } from '@/lib/definitions';
import { Dialog, RadioGroup, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { Fragment, useEffect, useState } from 'react';
import Button from './Button';
import { keepDuplicatedContacts, keepSelectedContact, mergeContacts } from '@/lib/data/safeQueries';


type DuplicatedContacts = {
    contacts: FlattenContact[]
    showBanner: boolean
}

type Options = {
    contacts: FlattenContact[]
    localDeletionHandler: (parentId: number) => void
}


function DuplicateContactCard({ contacts, localDeletionHandler }: Options) {
    const [contactId, setContactId] = useState<number | null>(null)
    const [mergeSelected, setMergeSelection] = useState<boolean>(false)
    const [mergeName, setMergeName] = useState<string>('')

    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-slate-950 p-4">
            <RadioGroup
                value={contactId}
                onChange={setContactId}
                className="flex cursor-pointer flex-col gap-4 md:flex-row lg:flex-row"
            >
                {contacts.map(contact => <RadioGroup.Option value={contact.id} key={contact.id}>
                    {({ checked }) => <Contact contact={contact} className={`${checked ? 'bg-slate-700' : ''} rounded`} />}
                </RadioGroup.Option>)
                }
            </RadioGroup>

            <div className="flex gap-3">
                {!mergeSelected && !contactId && (
                    <Button
                        onClick={async () => {
                            await keepDuplicatedContacts(contacts.map(contact => contact.id))
                            localDeletionHandler(contacts[0].id)
                        }}
                    >
                        Keep all
                    </Button>
                )}
                {!mergeSelected && !contactId && (
                    <Button
                        onClick={async () => {
                            if (contacts.some((contact) => contact.name !== contacts[0].name)) {
                                setMergeSelection(true)
                            } else {
                                await mergeContacts(contacts.map(contact => contact.id))
                                localDeletionHandler(contacts[0].id)
                            }
                        }}
                    >
                        Merge
                    </Button>
                )}
                {contactId && (
                    <Button
                        onClick={async () => {
                            await keepSelectedContact(contactId, contacts.map(contact => contact.id))
                            localDeletionHandler(contactId)
                        }}
                    >
                        Keep selected contact
                    </Button>
                )}
                <div className="flex flex-col justify-center gap-3 md:flex-row lg:flex-row">
                    {mergeSelected && contacts.some((contact) => contact.name !== contacts[0].name) && !contactId && (
                        <input
                            className="w-52 text-black md:w-auto lg:w-auto"
                            type="text"
                            placeholder="New name..."
                            onChange={(evt) => setMergeName(evt.target.value)}
                            value={mergeName}
                            autoFocus
                            onKeyDown={async (evt) => {
                                if (evt.key === 'Enter') {
                                    await mergeContacts(contacts.map(contact => contact.id), mergeName)
                                    localDeletionHandler(contacts[0].id)
                                }
                            }}
                        />
                    )}
                    {mergeSelected && !contactId && (
                        <Button
                            disabled={!mergeName}
                            className={!mergeName ? 'opacity-50 cursor-not-allowed' : ''}
                            onClick={async () => {
                                await mergeContacts(contacts.map(contact => contact.id), mergeName)
                                localDeletionHandler(contacts[0].id)
                            }}
                        >
                            Done
                        </Button>
                    )}

                    {(mergeSelected || contactId) && (
                        <button
                            onClick={() => {
                                setMergeName('')
                                setMergeSelection(false)
                                setContactId(null)
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function Contact({ contact, className }: { contact: FlattenContact; className: string }) {
    return (
        <div className={`flex gap-3 p-3 shadow-xl ${className}`}>
            <img className="h-12 w-12 flex-none rounded-full bg-gray-800" src={contact.photos[0]?.url || UserIcon.src} alt="contact image" />
            <div className="flex flex-col">
                <h1 className="text-xl font-bold">{contact.name}</h1>
                {contact.phoneNumbers &&
                    contact.phoneNumbers.map((item) => (
                        <p key={item.phoneNumber || item.number} className="text-sm">
                            {item.phoneNumber || item.number}
                        </p>
                    ))}
            </div>
        </div>
    )
}

const DismissableBanner = (): React.ReactElement => {
    const [closed, close] = useState(false)

    return (
        <>
            {
                !closed &&
                <div className='w-full flex justify-end md:mt-8 lg:mt-8 mt-4'>
                    <div className='flex justify-between items-center lg:w-56 md:lg:w-56 w-full p-3 bg-gray-800 border-l-8 border-blue-900 rounded-md'>
                        <p>No duplicates found</p>
                        <XMarkIcon className='w-[25px] hover:cursor-pointer text-red-300' title='Close' onClick={() => close(true)} />
                    </div>
                </div>
            }
        </>
    )
}

export default function DuplicatesScreen({ contacts, showBanner }: DuplicatedContacts) {
    const [updatedContacts, setUpdatedContacts] = useState<FlattenContact[]>([])
    const [isOpen, setIsOpen] = useState<boolean>(false)
    
    useEffect(() => {
        setUpdatedContacts(contacts)
    }, [contacts])

    const deleteContact = (parentId: number) => {

        const filteredContacts = updatedContacts.filter(contact =>
            contact.id !== parentId &&
            !contact.duplicates?.some(duplicatedContact =>
                duplicatedContact.id === parentId
            )
        )

        setUpdatedContacts(filteredContacts)
    }

    if (updatedContacts.length == 0) return showBanner ? <DismissableBanner /> : null

    return (
        <>
            <div className='my-4 flex justify-normal md:mt-9 md:justify-end lg:mt-10 lg:justify-end'>
                <button
                    className="flex w-full items-center justify-between gap-10 bg-gray-800 p-3 md:mt-4 md:w-auto md:justify-normal lg:mt-0 lg:w-auto lg:justify-normal border-l-8 border-yellow-600 rounded-md"
                    onClick={() => setIsOpen(true)}
                >
                    <div className="flex flex-col items-start">
                        <p>Possible duplicates</p>
                        <p className="text-sm text-yellow-400">
                            {updatedContacts[0].name} {updatedContacts.length > 1 && `and ${updatedContacts.length - 1} more`}
                        </p>
                    </div>
                    <p>Review</p>
                </button>
            </div>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="flex flex-col gap-4 transform overflow-scroll max-h-screen rounded-2xl bg-slate-800 p-6 shadow-xl transition-all">
                                    {updatedContacts.map((contact) =>
                                        contact.duplicates && contact.duplicates.length > 0 ?
                                            <DuplicateContactCard
                                                contacts={[contact, ...contact.duplicates]}
                                                key={`${contact.id.toString()}`}
                                                localDeletionHandler={deleteContact}
                                            /> :
                                            null
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}
