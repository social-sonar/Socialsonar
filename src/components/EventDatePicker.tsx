'use client'

import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


type ValuePiece = Date | null;

export type Value = ValuePiece | [ValuePiece, ValuePiece];

type EventDatePickerProps = {
    className: string,
    value: Value,
    onChange: (value: Value) => void,
    maxDate: Date,
    onTimeSelect: (value: string) => void
}

export default function EventDatePicker({ className, value, onChange, maxDate, onTimeSelect }: EventDatePickerProps) {
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
                    minDate={new Date()}
                    maxDate={maxDate}
                    onClickDay={() => setShowTimeList(true)} />
            </div>
            {
                showTimeList &&
                <div className='flex flex-col gap-3 w-60'>
                    <p>{(value as Date)?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <div className='overflow-scroll flex flex-col gap-2 p-3'>
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