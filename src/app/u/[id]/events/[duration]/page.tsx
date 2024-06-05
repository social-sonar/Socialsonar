'use client'

import { useEffect, useState } from 'react';
import EventDatePicker, { Value } from '@/components/EventDatePicker';
import { ClockIcon, VideoCameraIcon, CalendarIcon } from '@heroicons/react/24/outline';
import 'react-calendar/dist/Calendar.css';
import { TimeDuration } from '@/lib/definitions';

type EventsProps = {
    params: {
        id: string,
        duration: string
    },
    searchParams: {
        month: string
    }
}

const parseTimeInput = (input: string): TimeDuration => {
    const [, value, timeUnit] = input.match(/(\d+)([mh])/)!
    const duration = parseInt(value)
    return {
        duration,
        repr: timeUnit === 'm' ? `${value} minutes` : `${value} hour(s)`,
        timedelta: timeUnit === 'm' ? 1000 * 60 * duration : 1000 * 60 * 60 * duration
    }
}

const maxDate = (date: string): Date => {
    const [year, month] = date.split('-').map(Number)
    return new Date(year, month, 0)
}

const prettyDate = (date: Date): string => {
    const dateString = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${timeString}, ${dateString}`
}


export default function Events({ params, searchParams }: EventsProps) {
    const [value, onChange] = useState<Value>(new Date());
    const [date, setDate] = useState<Date | null>(null)
    const [time, setTime] = useState<string>('');
    const parsedDuration = parseTimeInput(params.duration)
    const maxCalendarDate = maxDate(searchParams.month)

    useEffect(() => {
        if (!time) return;
        const [hours, minutes] = time.split(':').map(Number)
        const eventDate = new Date((value as Date).getTime())
        eventDate.setHours(hours)
        eventDate.setMinutes(minutes)
        eventDate.setSeconds(0)
        setDate(new Date(eventDate.getTime() + parsedDuration.timedelta))
    }, [time, value, parsedDuration.timedelta])

    return (
        <div className="flex gap-10 h-4/6 max-h-96 self-center">
            <div className="flex flex-col gap-5">
                <div>
                    <p className='text-xl'>Steve Jobs</p>
                    <p className='text-4xl font-semibold'>{`${parsedDuration.repr} event`}</p>
                </div>
                <div className='flex gap-3'>
                    <ClockIcon className='w-[25px]' /> {parsedDuration.repr}
                </div>
                <div className='flex gap-3'>
                    <VideoCameraIcon className='w-[25px]' /> Event details provided after confirmation
                </div>
                {
                    date &&
                    <div className='flex gap-3 font-bold'>
                        <CalendarIcon className='w-[25px]' /> {`${time} - ${prettyDate(date)}`}
                    </div>
                }
            </div>
            <div className='bg-gray-800 w-[1px]' />
            <EventDatePicker className='flex gap-8' value={value} onChange={onChange} maxDate={maxCalendarDate} onTimeSelect={setTime} />
        </div>
    )
}