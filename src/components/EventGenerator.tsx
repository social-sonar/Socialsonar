'use client'

import { Value } from '@/lib/definitions';
import { getTimeZoneID } from '@/lib/utils/dates';
import { Dialog, Transition } from '@headlessui/react';
import { CalendarDaysIcon } from '@heroicons/react/20/solid';
import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import TimeZoneList from './TimeZoneList';



type EventGeneratorProps = {
    callClose: () => void
    showNotification: () => Promise<void>,
    userId: string
}


const getMonthStr = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear()
    return `${year}-${month}`;
}

const buildEventURL = (duration: string, monthStr: string, userId: string, tz: string): string => {
    return `${window.location.origin}/u/${userId}/events/${duration}?month=${monthStr}&tz=${tz}`
}


const timeData: { value: string, title: string }[] = [
    { value: '10m', title: '10 minutes' },
    { value: '20m', title: '20 minutes' },
    { value: '30m', title: '30 minutes' },
    { value: '1h', title: '1 hour' },
    { value: '2h', title: '2 hours' },
    { value: '3h', title: '3 hours' }
];


export default function EventGenerator({ showNotification, userId, callClose }: EventGeneratorProps) {
    const [selected, setSelected] = useState(getTimeZoneID())
    const [duration, setDuration] = useState<string>('')
    const [open, setOpen] = useState<boolean>(true)
    const [showDurations, setShowDurations] = useState<boolean>(false)
    const [value, onChange] = useState<Value | null>(null);
    const currentDate = new Date()
    currentDate.setMonth(11)

    useEffect(() => {
        if (!open) {
            callClose()
        }
    }, [open])

    useEffect(() => {
        if (value)
            setShowDurations(true)
    }, [value])

    useEffect(() => {
        if (value && duration) {
            const monthStr = getMonthStr((value as Date))
            const eventURL = buildEventURL(duration, monthStr, userId, selected)
            navigator.clipboard.writeText(eventURL).then(showNotification)
        }

    }, [value, duration, selected])

    useEffect(() => {
        setShowDurations(false)
        setDuration('')
    }, [open])

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

                <div className="fixed inset-0 z-10 overflow-y-auto w-full">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 flex flex-col gap-5">
                                <div>

                                    <div className=" flex flex-col gap-5 items-center">
                                        <CalendarDaysIcon className="w-10 text-blue-600"/>
                                        <Dialog.Title
                                            as="h3"
                                            className="font-semibold leading-6 text-white text-xl"
                                        >
                                            Choose and share with a third party
                                        </Dialog.Title>
                                        <div className='flex flex-col items-center gap-10'>
                                            <div className='flex lg:flex-row md:flex-row flex-col gap-5'>
                                                <div className='flex flex-col gap-4'>
                                                    <Calendar
                                                        className="text-black rounded-2xl h-fit"
                                                        view='year'
                                                        value={value}
                                                        onClickMonth={onChange}
                                                        minDate={new Date()}
                                                        maxDate={currentDate}
                                                    />
                                                    <TimeZoneList value={selected} selectionHandler={setSelected} className='w-full' />
                                                </div>
                                                {
                                                    showDurations &&
                                                    <div className='flex flex-col gap-5 lg:items-stretch md:items-stretch items-center justify-between'>
                                                        <div className='flex flex-col gap-6'>
                                                            <h1 className='text-xl font-semibold'>Duration</h1>
                                                            <div className='lg:space-y-3 md:space-y-3 hover:cursor-pointer lg:flex md:flex lg:flex-col md:flex-col gap-3 text-lg items-start grid grid-cols-3 justify-items-start'>
                                                                {timeData.map(({ value, title }) => (
                                                                    <button
                                                                        key={value}
                                                                        className={`hover:text-teal-600 lg:mx-0 md:mx-0 mx-2 lg:w-fit md:w-fit w-full ${value === duration ? 'text-teal-600' : ''}`}
                                                                        onClick={() => setDuration(value)}
                                                                    >
                                                                        {title}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        className="bg-gray-600 p-2 rounded-lg"
                                        onClick={() => setOpen(false)}
                                        data-autofocus
                                    >
                                        Done
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