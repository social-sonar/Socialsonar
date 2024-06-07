'use client'

import { Value } from '@/lib/definitions';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


const getMonthStr = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear()
    return `${year}-${month}`;
}

const buildEventURL = (duration: string, monthStr: string): string => {    
    // TODO: add user-id instead of the dummy 'u-u-i-d' value
    return `${window.location.origin}/u/u-u-i-d/events/${duration}?month=${monthStr}`
}


export default function EventGenerator() {
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
            const eventURL = buildEventURL(duration, monthStr)
            console.log("Event URL:", eventURL);
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
                <div className='flex gap-10'>
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
                            <div className='space-y-4 hover:cursor-pointer flex flex-col items-start'>
                                <button
                                    className='hover:text-teal-600'
                                    value='5m'
                                    onClick={(e) => setDuration(e.currentTarget.value)}
                                >
                                    5 minutes
                                </button>
                                <button
                                    className='hover:text-teal-600'
                                    value='10m'
                                    onClick={(e) => setDuration(e.currentTarget.value)}
                                >
                                    10 minutes
                                </button>
                                <button
                                    className='hover:text-teal-600'
                                    value='20m'
                                    onClick={(e) => setDuration(e.currentTarget.value)}
                                >
                                    20 minutes
                                </button>
                                <button
                                    className='hover:text-teal-600'
                                    value='30m'
                                    onClick={(e) => setDuration(e.currentTarget.value)}
                                >
                                    30 minutes
                                </button>
                                <button
                                    className='hover:text-teal-600'
                                    value='45m'
                                    onClick={(e) => setDuration(e.currentTarget.value)}
                                >
                                    45 minutes
                                </button>
                                <button
                                    className='hover:text-teal-600'
                                    value='1h'
                                    onClick={(e) => setDuration(e.currentTarget.value)}
                                >
                                    1 hour
                                </button>
                                <button
                                    className='hover:text-teal-600'
                                    value='2h'
                                    onClick={(e) => setDuration(e.currentTarget.value)}
                                >
                                    2 hours
                                </button>
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    )
}