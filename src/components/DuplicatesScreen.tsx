import { DuplicateContactResolutionPayload, FlattenContact, ResolutionStrategy } from '@/lib/definitions'
import { Popover, RadioGroup, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { Button } from './Button'

type DuplicatedContacts = {
    contacts: FlattenContact[]
}

type Options = {
    optionA: FlattenContact
    optionB: FlattenContact
    localDeletionHandler: (id: number) => void
}

async function handleDuplication(payload: DuplicateContactResolutionPayload) {
    await fetch('/api/handle-duplicates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
}

function DuplicateContactCard({ optionA, optionB, localDeletionHandler }: Options) {
    const [contactId, setContactId] = useState<number | null>(null)
    const [mergeSelected, setMergeSelection] = useState<boolean>(false)
    const [mergeName, setMergeName] = useState<string>('')

    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-slate-950 p-4">
            <RadioGroup value={contactId} onChange={setContactId} className="flex cursor-pointer gap-4">
                <RadioGroup.Option value={optionA.id}>
                    {({ checked }) => <Contact contact={optionA} className={`${checked ? 'bg-slate-900' : ''} rounded`} />}
                </RadioGroup.Option>
                <RadioGroup.Option value={optionB.id}>
                    {({ checked }) => <Contact contact={optionB} className={`${checked ? 'bg-slate-900' : ''} rounded`} />}
                </RadioGroup.Option>
            </RadioGroup>

            <div className="flex gap-3">
                {!mergeSelected && !contactId && (
                    <Button
                        onClick={async () => {
                            await handleDuplication({
                                strategy: ResolutionStrategy.KEEP_BOTH,
                                contactA: optionA.id,
                                contactB: optionB.id,
                            })
                            localDeletionHandler(optionB.id)
                        }}
                    >
                        Keep both
                    </Button>
                )}
                {mergeSelected && optionA.name !== optionB.name && (
                    <input
                        className="text-black"
                        type="text"
                        placeholder="New name..."
                        onChange={(evt) => setMergeName(evt.target.value)}
                        value={mergeName}
                    />
                )}
                {!mergeSelected && !contactId && (
                    <Button
                        onClick={async () => {
                            if (optionA.name !== optionB.name) {
                                setMergeSelection(true)
                            } else {
                                await handleDuplication({
                                    strategy: ResolutionStrategy.MERGE,
                                    contactA: optionA.id,
                                    contactB: optionB.id,
                                })
                                localDeletionHandler(optionB.id)
                            }
                        }}
                    >
                        Merge
                    </Button>
                )}
                {mergeSelected && (
                    <Button
                        onClick={async () => {
                            await handleDuplication({
                                strategy: ResolutionStrategy.MERGE,
                                contactA: optionA.id,
                                contactB: optionB.id,
                                mergeName,
                            })
                            localDeletionHandler(optionB.id)
                        }}
                    >
                        Done
                    </Button>
                )}
                {contactId && (
                    <Button
                        onClick={async () => {
                            await handleDuplication({
                                strategy: ResolutionStrategy.KEEP_ONE,
                                contactA: contactId,
                                contactB: contactId == optionA.id ? optionB.id : optionA.id,
                            })
                            localDeletionHandler(optionB.id)
                        }}
                    >
                        Keep selected contact
                    </Button>
                )}
                {(mergeSelected || contactId) && (
                    <button
                        onClick={() => {
                            setMergeSelection(false)
                            setContactId(null)
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    )
}

function Contact({ contact, className }: { contact: FlattenContact; className: string }) {
    return (
        <div className={`flex gap-3 p-3 shadow-xl ${className}`}>
            <img className="h-12 w-12 flex-none rounded-full bg-gray-800" src={contact.photos[0].url} alt="" />
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

export default function DuplicatesScreen({ contacts }: DuplicatedContacts) {
    const [updatedContacts, setUpdatedContacts] = useState<FlattenContact[]>([])
    useEffect(() => {
        // Code to execute when 'contacts' array changes
        setUpdatedContacts(contacts)
    }, [contacts])

    const deleteContact = (id: number) => {
        let filteredContacts = updatedContacts.map((contact) => ({
            ...contact,
            duplicates: contact.duplicates?.filter((duplicate) => duplicate.id !== id),
        }))
        filteredContacts = filteredContacts.filter((contact) => contact.duplicates?.length! > 0)
        setUpdatedContacts(filteredContacts)
    }

    if (updatedContacts.length == 0) return null

    return (
        <Popover className="relative mt-10 flex w-auto justify-end">
            {({ open }) => (
                <>
                    <Popover.Button className="flex items-center gap-10 rounded border border-gray-500 bg-gray-800 p-3">
                        <div className="flex flex-col items-start">
                            <p>Possible duplicates</p>
                            <p className="text-sm text-yellow-400">
                                {updatedContacts[0].name} and {updatedContacts.length} more
                            </p>
                        </div>
                        <p>Review</p>
                    </Popover.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel className="absolute z-10 flex max-h-screen w-full flex-col gap-5 overflow-scroll rounded-lg bg-slate-800 p-5">
                            {updatedContacts.map((contact) =>
                                contact.duplicates?.map((duplicate) => (
                                    <DuplicateContactCard
                                        optionA={contact}
                                        optionB={duplicate}
                                        key={`${contact.id.toString() + duplicate.id.toString()}`}
                                        localDeletionHandler={deleteContact}
                                    />
                                )),
                            )}
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    )
}