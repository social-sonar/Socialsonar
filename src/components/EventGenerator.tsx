'use client'

import { Value } from '@/lib/definitions';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import TimeZoneList from './TimeZoneList';
import { getTimeZoneID } from '@/lib/utils/dates';
import { syncGoogleCalendar } from '@/actions';


type EventGeneratorProps = {
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


export default function EventGenerator({ showNotification, userId }: EventGeneratorProps) {
    const [selected, setSelected] = useState(getTimeZoneID())
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
            const eventURL = buildEventURL(duration, monthStr, userId, selected)
            navigator.clipboard.writeText(eventURL).then(showNotification)
        }

    }, [value, duration, selected])

    useEffect(() => {
        setShowDurations(false)
        setDuration('')
    }, [open])

    return (
        <div className='flex flex-col items-center gap-10'>
            <form action={syncGoogleCalendar.bind(null, userId, undefined, false)}>

                <button onClick={() => setOpen(!open)} className='flex gap-2 hover:text-teal-600'>
                    <span>Generate event URL</span>
                    {
                        open ?
                            <ChevronUpIcon className='w-[20px] animate-pulse' /> :
                            <ChevronDownIcon className='w-[20px] animate-pulse' />
                    }
                </button>
            </form>
            {
                open &&
                <div className='flex lg:flex-row md:flex-row flex-col gap-10'>
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
                                <h1 className='text-xl font-semibold'>Event duration</h1>
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
            }
        </div>
    )
}