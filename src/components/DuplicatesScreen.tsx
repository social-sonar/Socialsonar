import { FlattenContact } from "@/lib/definitions"
import { Popover, RadioGroup, Transition } from "@headlessui/react"
import { Fragment, useState } from "react"
import { Button } from "./Button"


type DuplicatedContacts = {
    contacts: FlattenContact[]
}

type Options = {
    optionA: FlattenContact,
    optionB: FlattenContact
}

function DuplicateContactCard({ optionA, optionB }: Options) {
    let [contactId, setContactId] = useState(null)

    return (
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-950 justify-center items-center">
            <RadioGroup value={contactId} onChange={setContactId} className="flex gap-4 cursor-pointer">
                <RadioGroup.Option value={optionA.id}>
                    {({ checked }) => (
                        <Contact contact={optionA} className={`${checked ? 'bg-slate-900' : ''} rounded`} />
                    )}
                </RadioGroup.Option>
                <RadioGroup.Option value={optionB.id}>
                    {({ checked }) => (
                        <Contact contact={optionB} className={`${checked ? 'bg-slate-900' : ''} rounded`} />
                    )}
                </RadioGroup.Option>
            </RadioGroup>

            <div className="flex gap-3">
                <Button>Keep both</Button>
                <Button>Merge</Button>
                {contactId && <Button>Delete selection</Button>}
            </div>
        </div>
    )
}

function Contact({ contact, className }: { contact: FlattenContact, className: string }) {
    return (
        <div className={`p-3 shadow-xl flex gap-3 ${className}`}>
            <img
                className="h-12 w-12 flex-none rounded-full bg-gray-800"
                src={contact.photos[0].url}
                alt=""
            />
            <div className="flex flex-col">
                <h1 className="font-bold text-xl">{contact.name}</h1>
                {
                    contact.phoneNumbers && contact.phoneNumbers.map(item =>
                        <p className="text-sm">{item.phoneNumber || item.number}</p>
                    )
                }
            </div>
        </div>
    )
}

export default function DuplicatesScreen({ contacts }: DuplicatedContacts) {
    if (contacts.length == 0)
        return null
    return (
        <Popover className="relative flex w-auto mt-10 justify-end">
            {({ open }) => (
                <>
                    <Popover.Button className='flex gap-10 bg-gray-800 p-3 items-center rounded border border-gray-500'>
                        <div className="flex flex-col items-start">
                            <p>Possible duplicates</p>
                            <p className="text-sm text-yellow-400">{contacts[0].name} and {contacts.length} more</p>
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
                        <Popover.Panel className="absolute bg-slate-800 w-full z-10 flex flex-col gap-5 p-5 rounded-lg overflow-scroll max-h-screen">
                            {
                                contacts.map((contact) =>
                                    contact.duplicates?.map((duplicate) =>

                                        <DuplicateContactCard optionA={contact} optionB={duplicate} key={`${contact.id.toString() + duplicate.id.toString()}`} />

                                    ))
                            }
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    )
}