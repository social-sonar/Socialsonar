'use client'

import { DateRange, Value, TimeDuration } from '@/lib/definitions';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import Button from '@/components/Button';
import { toLocalISOString } from '@/lib/utils';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter } from 'next/navigation';
import 'react-calendar/dist/Calendar.css';

type DatePickerProps = {
    className: string,
    value: Value,
    onChange: (value: Value) => void,
    dateRange: DateRange,
    onTimeSelect: (value: string) => void
}

type EventDatePicker = {
    duration: string,
    month: string,
    dateString?: string
    userName: string
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

const getMinMaxDate = (date: string): DateRange => {
    const [year, month] = date.split('-').map(Number)
    const maxDate = new Date(year, month, 0)
    const minDate = new Date(year, month - 1, 1)
    return {
        minDate,
        maxDate
    }
}

const prettyDate = (date: Date, timedelta: number): string => {
    const newDate = new Date(date.getTime() + timedelta)
    const dateString = newDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeString = newDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${timeString}, ${dateString}`
}

function DatePicker({ className, value, onChange, dateRange, onTimeSelect }: DatePickerProps) {
    const [showTimeList, setShowTimeList] = useState<boolean>(false)
    return (
        <div className={className}>
            <div className='flex flex-col gap-5'>
                <h1 className='text-2xl'>Select a date and time</h1>
                <Calendar
                    onChange={onChange}
                    value={value}
                    className="text-black rounded-2xl"
                    showNeighboringMonth={false}
                    minDate={dateRange.minDate}
                    maxDate={dateRange.maxDate}
                    onClickDay={() => setShowTimeList(true)} />
            </div>
            {
                showTimeList &&
                <div className='flex flex-col gap-3 w-60 lg:items-stretch md:items-stretch items-center'>
                    <p>{(value as Date)?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <div className='overflow-scroll lg:flex md:flex lg:flex-col md:flex-col grid grid-cols-3 gap-2 p-3'>
                        {/* TODO */}
                        <button className='p-3 border-2 border-teal-800 text-teal-800 rounded-xl font-bold hover:border-teal-500' onClick={(e) => onTimeSelect(e.currentTarget.value)} value='09:00'>09:00</button>
                        <button className='p-3 border-2 border-teal-800 text-teal-800 rounded-xl font-bold hover:border-teal-500' onClick={(e) => onTimeSelect(e.currentTarget.value)} value='09:30'>09:30</button>
                        <button className='p-3 border-2 border-teal-800 text-teal-800 rounded-xl font-bold hover:border-teal-500' onClick={(e) => onTimeSelect(e.currentTarget.value)} value='10:00'>10:00</button>
                        <button className='p-3 border-2 border-teal-800 text-teal-800 rounded-xl font-bold hover:border-teal-500' onClick={(e) => onTimeSelect(e.currentTarget.value)} value='10:30'>10:30</button>
                        <button className='p-3 border-2 border-teal-800 text-teal-800 rounded-xl font-bold hover:border-teal-500' onClick={(e) => onTimeSelect(e.currentTarget.value)} value='11:00'>11:00</button>
                        <button className='p-3 border-2 border-teal-800 text-teal-800 rounded-xl font-bold hover:border-teal-500' onClick={(e) => onTimeSelect(e.currentTarget.value)} value='11:30'>11:30</button>
                        <button className='p-3 border-2 border-teal-800 text-teal-800 rounded-xl font-bold hover:border-teal-500' onClick={(e) => onTimeSelect(e.currentTarget.value)} value='12:00'>12:00</button>

                    </div>
                </div>
            }
        </div>
    )
}


export default function EventDatePicker({ duration, month, dateString, userName }: EventDatePicker) {
    const { replace } = useRouter()
    const pathname = usePathname()
    const [value, onChange] = useState<Value>(new Date());
    const [date, setDate] = useState<Date | null>(null)
    const [time, setTime] = useState<string>('');
    const [showForm, setShowForm] = useState<boolean>(false)

    const parsedDuration = parseTimeInput(duration)
    const minMaxDates = getMinMaxDate(month)

    useEffect(() => {
        if (dateString) {
            const newDate = new Date(dateString)
            setDate(newDate);
            setTime(`${newDate.getHours().toString().padStart(2, '0')}:${newDate.getMinutes().toString().padStart(2, '0')}`)
        } else {
            setShowForm(false)
            setTime('')
            setDate(null)
        }
    }, [dateString]);

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
        const params = new URLSearchParams({month});
        if (date) {
            setShowForm(true)
            params.set('date', toLocalISOString(date))
            replace(`${pathname}?${params}`)
        }
    }, [date])

    const backAction = () => {
        const params = new URLSearchParams({month, date: dateString!});
        params.delete('date')
        replace(`${pathname}?${params}`)
    }

    return (
        <>
            {
                showForm &&
                <button onClick={backAction}><ArrowLeftIcon className='w-10' /></button>
            }
            <div className="flex lg:flex-row md:flex-row flex-col gap-10 h-4/6 lg:max-h-96 md:max-h-96 max-h-fit self-center">
                <div className="flex flex-col gap-5">
                    <div>
                        <p className='text-xl'>{userName}</p>
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
                <div className='bg-gray-800 w-[1px] lg:flex md:flex hidden' />
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
                        <DatePicker
                            className='flex lg:flex-row md:flex-row flex-col gap-8 lg:items-stretch md:items-stretch items-center'
                            value={value}
                            onChange={onChange}
                            dateRange={minMaxDates}
                            onTimeSelect={setTime}
                        />
                }

            </div>
        </>

    )
}