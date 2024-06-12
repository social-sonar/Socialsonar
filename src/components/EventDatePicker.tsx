'use client'

import { scheduleEvent } from '@/actions/scheduler';
import Button from '@/components/Button';
import { DateRange, TimeDuration, UserTimeInformation, Value } from '@/lib/definitions';
import { getMinMaxDate } from '@/lib/utils';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, VideoCameraIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useFormState } from 'react-dom';

type DatePickerProps = {
    className: string,
    value: Value,
    onChange: (value: Value) => void,
    dateRange: DateRange,
    onTimeSelect: (value: string) => void,
    availableTime: Map<string, string[]>
}

type EventDatePicker = {
    durationMetadata: TimeDuration,
    month: string,
    dateString?: string
    userInfo: UserTimeInformation
}

const prettyDate = (date: Date, timedelta: number): string => {
    const newDate = new Date(date.getTime() + timedelta)
    const dateString = newDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeString = newDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${timeString}, ${dateString}`
}


const ErrorBox = ({ errors }: { errors?: string[] }): React.ReactElement | null => {
    if (!errors) return null;
    return (
        <div>
            {errors.map((error, idx) => <p className='text-red-500' key={idx}>{error}</p>)}
        </div>
    )
}

function DatePicker({ className, value, onChange, dateRange, onTimeSelect, availableTime }: DatePickerProps) {
    const [showTimeList, setShowTimeList] = useState<boolean>(false)
    const dateStr = `${(value as Date).getFullYear()}-${((value as Date).getMonth() + 1).toString().padStart(2, '0')}-${(value as Date).getDate().toString().padStart(2, '0')}`
    const currentDateAvailabilities = availableTime.get(dateStr)
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
                        {
                            currentDateAvailabilities?.map((time, idx) =>
                                <button
                                    key={idx}
                                    className='p-3 border-2 border-teal-800 text-teal-800 rounded-xl font-bold hover:border-teal-500'
                                    onClick={(e) => onTimeSelect(e.currentTarget.value)}
                                    value={time}>{time}
                                </button>
                            )
                        }
                    </div>
                </div>
            }
        </div>
    )
}

const SuccessScreen = (): React.ReactElement => {
    return (
        <div className='flex flex-col justify-center gap-10 items-center'>
            <CheckCircleIcon className='w-52 text-green-700' />
            <p>Your event was successfully scheduled</p>
        </div>
    )
}


export default function EventDatePicker({ durationMetadata, month, dateString, userInfo }: EventDatePicker) {
    const [addGuests, showGuestsTextarea] = useState<boolean>(false)
    const [value, onChange] = useState<Value>(new Date());
    const [date, setDate] = useState<Date | null>(null)
    const [time, setTime] = useState<string>('');
    const [showForm, setShowForm] = useState<boolean>(false)
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
        // const [hours, minutes] = time.split(':').map(Number);
        // const [year, month, day] = (value as Date).toISOString().split('T')[0].split('-').map(Number);
        // const eventDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
        // setDate(eventDate);
        const [hours, minutes] = time.split(':').map(Number)
        const eventDate = new Date((value as Date).getTime())

        eventDate.setHours(hours)
        eventDate.setMinutes(minutes)
        eventDate.setSeconds(0)
        setDate(new Date(eventDate.getTime()))
    }, [time, value])

    useEffect(() => {
        if (date) setShowForm(true)
    }, [date])

    const [formState, action] = useFormState(
        scheduleEvent.bind(null, userInfo.user.id, durationMetadata.timedelta, date!),
        { errors: {} }
    );

    const backAction = async () => {
        setShowForm(false)
        formState.errors = {}
        showGuestsTextarea(false)
        setTime('')
        setDate(null)
    }

    if (formState.success === true) return <SuccessScreen />

    return (
        <>
            {
                showForm &&
                <button onClick={backAction}><ArrowLeftIcon className='w-10' /></button>
            }
            <div className="flex lg:flex-row md:flex-row flex-col gap-10 h-4/6 lg:max-h-96 md:max-h-96 max-h-fit self-center">
                <div className="flex flex-col gap-5">
                    <div>
                        <p className='text-xl'>{userInfo.user.name}</p>
                        <p className='text-4xl font-semibold'>{`${durationMetadata.repr} event`}</p>
                    </div>
                    <div className='flex gap-3'>
                        <ClockIcon className='w-[25px]' /> {durationMetadata.repr}
                    </div>
                    <div className='flex gap-3'>
                        <VideoCameraIcon className='w-[25px]' /> Event details provided after confirmation
                    </div>
                    {
                        date &&
                        <div className='flex gap-3 font-bold'>
                            <CalendarIcon className='w-[25px]' /> {`${time} - ${prettyDate(date, durationMetadata.timedelta)}`}
                        </div>
                    }
                </div>
                <div className='bg-gray-800 w-[1px] lg:flex md:flex hidden' />
                {
                    showForm ?
                        <div>
                            <form className='flex flex-col gap-8' action={action}>
                                <h1 className='text-xl font-semibold'>Scheduler details</h1>
                                <div className='flex flex-col gap-4'>
                                    <label htmlFor="name">Name *</label>
                                    <input type="text" name='name' id='name' className='rounded-lg text-black' />
                                    <ErrorBox errors={formState.errors.name} />
                                </div>
                                <div className='flex flex-col gap-4'>
                                    <label htmlFor="email">Email *</label>
                                    <input type="email" name='email' id='email' className='rounded-lg text-black' />
                                    <ErrorBox errors={formState.errors.email} />
                                </div>
                                {
                                    addGuests ?
                                        <div className='flex flex-col gap-4'>
                                            <div>
                                                <label htmlFor="guests">Guests</label>
                                                <p className='text-gray-400 text-sm'><span className='font-bold'>Important: </span>Enter an email address per line </p>
                                            </div>
                                            <textarea name='guests' id='guests' className='rounded-lg text-black' />
                                            <ErrorBox errors={formState.errors.guests} />
                                        </div> :
                                        <button onClick={() => showGuestsTextarea(true)} className='w-fit p-2 border rounded-xl'>Add guests <span className='font-bold'>+</span></button>
                                }
                                <ErrorBox errors={formState.errors._form} />
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
                            availableTime={userInfo.availableTime}
                        />
                }

            </div>
        </>

    )
}