'use client'

import { registerTravel } from '@/actions/google/events/travels';
import { RangeValue, Value } from '@/lib/definitions';
import { Dialog, Transition } from '@headlessui/react';
import { MapIcon } from '@heroicons/react/20/solid';
import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import LoadingSpinner from './common/spinner';
import { PlaceAutocomplete } from './Location';

type TravelManagerProps = {
    callClose: () => void
    showNotification: () => Promise<void>,
    userId: string
}

export default function TravelManager({ showNotification, userId, callClose }: TravelManagerProps) {
    const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
    const [open, setOpen] = useState<boolean>(true)
    const [value, onChange] = useState<Value | null>(null);
    const [registering, setRegistering] = useState<boolean>(false)

    useEffect(() => {
        if (!open) {
            callClose()
        }
    }, [open])

    const onClick = async () => {
        setRegistering(true)
        // at this point, `value` WILL have non null values
        const [startDate, endDate] = (value as RangeValue)!
        await registerTravel({
            userId,
            location: selectedPlace?.formatted_address!,
            coords: {
                lat: selectedPlace?.geometry?.location?.lat()!,
                lon: selectedPlace?.geometry?.location?.lng()!
            },
            startDate: startDate!.toISOString().split('T')[0], // yyyy-mm-dd format
            endDate: endDate!.toISOString().split('T')[0], // yyyy-mm-dd format
        })
        setRegistering(false)
        showNotification()
        setOpen(false)
    }

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
                                <div className='flex flex-col gap-5'>
                                    <div className=" flex flex-col gap-5 items-center">
                                        <MapIcon className="w-10 text-blue-600" />
                                        <Dialog.Title
                                            as="h3"
                                            className="font-semibold leading-6 text-white text-xl"
                                        >
                                            Register an upcoming travel
                                        </Dialog.Title>
                                        <div className='flex flex-col items-center gap-5'>
                                            <PlaceAutocomplete onPlaceSelect={setSelectedPlace} placeholder='Where are you traveling to?' />
                                            {selectedPlace &&
                                                <div className='flex flex-col gap-2'>
                                                    <p className='text-lg font-semibold'>Select the duration of the travel</p>
                                                    <Calendar
                                                        className="text-black rounded-2xl h-fit"
                                                        selectRange={true}
                                                        value={value}
                                                        onChange={onChange}
                                                    />
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            disabled={!value || !selectedPlace || registering}
                                            type="button"
                                            className="bg-blue-800 disabled:opacity-50 p-2 rounded-lg flex gap-2 justify-center items-center"
                                            onClick={onClick}
                                            data-autofocus
                                        >
                                            {registering &&
                                                <LoadingSpinner size={20} />
                                            }
                                            <span>{registering ? 'Registering' : 'Register'}</span>
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>

    )
}
