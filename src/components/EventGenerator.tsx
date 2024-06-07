'use client'

import { Value } from '@/lib/definitions';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


type EventGeneratorProps = {
    showNotification: () => Promise<void>,
    userId: string
}


const getMonthStr = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear()
    return `${year}-${month}`;
}

const buildEventURL = (duration: string, monthStr: string, userId: string): string => {
    return `${window.location.origin}/u/${userId}/events/${duration}?month=${monthStr}`
}


const timeData: { value: string, title: string }[] = [
    { value: '5m', title: '5 minutes' },
    { value: '10m', title: '10 minutes' },
    { value: '20m', title: '20 minutes' },
    { value: '30m', title: '30 minutes' },
    { value: '45m', title: '45 minutes' },
    { value: '1h', title: '1 hour' },
    { value: '2h', title: '2 hours' }
];


export default function EventGenerator({ showNotification, userId }: EventGeneratorProps) {
    const [duration, setDuration] = useState<string>('')
    const [open, setOpen] = useState<boolean>(false)
    const [showDurations, setShowDurations] = useState<boolean>(false)
    const [value, onChange] = useState<Value | null>(null);
    const currentDate = new Date()
    currentDate.setMonth(11)

    useEffect(() => {
        if (value)
            setShowDurations(true)
    }, [value])

    useEffect(() => {
        if (value && duration) {
            const monthStr = getMonthStr((value as Date))
            const eventURL = buildEventURL(duration, monthStr, userId)
            navigator.clipboard.writeText(eventURL).then(showNotification)
        }

    }, [value, duration])


    return (
        <div className='flex flex-col items-center gap-10'>
            <button onClick={() => setOpen(!open)} className='flex gap-2 hover:text-teal-600'>
                <span>Generate event URL</span>
                {
                    open ?
                        <ChevronUpIcon className='w-[20px]' /> :
                        <ChevronDownIcon className='w-[20px]' />
                }
            </button>
            {
                open &&
                <div className='flex lg:flex-row md:flex-row flex-col gap-10'>
                    <Calendar
                        className="text-black rounded-2xl"
                        view='year'
                        value={value}
                        onClickMonth={onChange}
                        minDate={new Date()}
                        maxDate={currentDate}
                    />
                    {
                        showDurations &&
                        <div className='flex flex-col gap-5'>
                            <h1 className='text-xl font-semibold'>Event duration</h1>
                            <div className='lg:space-y-4 md:space-y-4 hover:cursor-pointer lg:flex md:flex lg:flex-col md:flex-col flex-row items-start grid grid-cols-3'>
                                {timeData.map(({ value, title }) => (
                                    <button
                                        key={value}
                                        className={`hover:text-teal-600 ${value === duration ? 'text-teal-600' : ''}`}
                                        onClick={() => setDuration(value)}
                                    >
                                        {title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    )
}