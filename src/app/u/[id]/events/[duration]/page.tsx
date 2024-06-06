'use client'

import Button from '@/components/Button';
import EventDatePicker, { Value } from '@/components/EventDatePicker';
import { TimeDuration } from '@/lib/definitions';
import { toLocalISOString } from '@/lib/utils';
import { CalendarIcon, ClockIcon, VideoCameraIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import 'react-calendar/dist/Calendar.css';

type EventsProps = {
    params: {
        id: string,
        duration: string
    },
    searchParams: {
        month: string,
        date?: string
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

const prettyDate = (date: Date, timedelta: number): string => {
    const newDate = new Date(date.getTime() + timedelta)
    const dateString = newDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeString = newDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${timeString}, ${dateString}`
}


export default function Events({ params, searchParams }: EventsProps) {
    const { replace } = useRouter()
    const pathname = usePathname()
    const [value, onChange] = useState<Value>(new Date());
    const [date, setDate] = useState<Date | null>(null)
    const [time, setTime] = useState<string>('');
    const [showForm, setShowForm] = useState<boolean>(false)

    const parsedDuration = parseTimeInput(params.duration)
    const maxCalendarDate = maxDate(searchParams.month)

    useEffect(() => {
        if (searchParams.date) {
            const newDate = new Date(searchParams.date)
            setDate(newDate);
            setTime(`${newDate.getHours().toString().padStart(2, '0')}:${newDate.getMinutes().toString().padStart(2, '0')}`)
        } else {
            setShowForm(false)
            setTime('')
            setDate(null)
        }
    }, [searchParams.date]);

    useEffect(() => {
        if (!time) return;
        const [hours, minutes] = time.split(':').map(Number)
        const eventDate = new Date((value as Date).getTime())

        eventDate.setHours(hours)
        eventDate.setMinutes(minutes)
        eventDate.setSeconds(0)
        setDate(new Date(eventDate.getTime()))
    }, [time, value])

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (date) {
            setShowForm(true)
            params.set('date', toLocalISOString(date))
            replace(`${pathname}?${params}`)
        }
    }, [date])

    const backAction = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('date')
        replace(`${pathname}?${params}`)
    }

    return (
        <div className='flex flex-col justify-center gap-10'>
            {
                showForm &&
                <button onClick={backAction}><ArrowLeftIcon className='w-10' /></button>
            }
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
                            <CalendarIcon className='w-[25px]' /> {`${time} - ${prettyDate(date, parsedDuration.timedelta)}`}
                        </div>
                    }
                </div>
                <div className='bg-gray-800 w-[1px]' />
                {
                    showForm ?
                        <div>
                            <form className='flex flex-col gap-8'>
                                <h1 className='text-xl font-semibold'>Scheduler details</h1>
                                <div className='flex flex-col gap-4'>
                                    <label htmlFor="name">Name *</label>
                                    <input type="text" name='name' id='name' className='rounded-lg text-black' />
                                </div>
                                <div className='flex flex-col gap-4'>
                                    <label htmlFor="email">Email *</label>
                                    <input type="email" name='email' id='email' className='rounded-lg text-black' />
                                </div>
                                <Button className='w-fit'>Schedule</Button>
                            </form>
                        </div>
                        :
                        <EventDatePicker className='flex gap-8' value={value} onChange={onChange} maxDate={maxCalendarDate} onTimeSelect={setTime} />
                }

            </div>
        </div>

    )
}