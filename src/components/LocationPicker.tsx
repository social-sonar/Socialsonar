import { LocationSetData } from '@/lib/definitions';
import { Dialog, Transition } from '@headlessui/react';
import {
    AdvancedMarker,
    APIProvider,
    ControlPosition,
    Map,
    MapControl,
    useAdvancedMarkerRef,
    useMap,
    useMapsLibrary
} from '@vis.gl/react-google-maps';
import React, { useEffect, useRef, useState } from 'react';

type MapHandlerProps = {
    place: google.maps.places.PlaceResult | null;
    marker: google.maps.marker.AdvancedMarkerElement | null;
}
type PlaceAutocompleteProps = {
    onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

const MapHandler = ({ place, marker }: MapHandlerProps) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !place || !marker) return;

        if (place.geometry?.viewport) {
            map.fitBounds(place.geometry?.viewport);
        }
        marker.position = place.geometry?.location;
    }, [map, place, marker]);

    return null;
};


const PlaceAutocomplete = ({ onPlaceSelect }: PlaceAutocompleteProps) => {
    const [placeAutocomplete, setPlaceAutocomplete] =
        useState<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const places = useMapsLibrary('places');

    useEffect(() => {
        if (!places || !inputRef.current) return;

        const options = {
            fields: ['geometry', 'name', 'formatted_address', 'utc_offset_minutes']
        };

        setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
    }, [places]);

    useEffect(() => {
        if (!placeAutocomplete) return;

        placeAutocomplete.addListener('place_changed', () => {
            onPlaceSelect(placeAutocomplete.getPlace());
        });
    }, [onPlaceSelect, placeAutocomplete]);

    return (
        <div className="autocomplete-container text-black">
            <input ref={inputRef} className='rounded-md' />
        </div>
    );
};

type LocationPickerProps = {
    callClose: () => void,
    onLocationSet: (locationData: LocationSetData) => Promise<void>,
    position?: string
}

export default function LocationPicker({ callClose, onLocationSet, position }: LocationPickerProps) {
    const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
    const [markerRef, marker] = useAdvancedMarkerRef();
    const [open, setOpen] = useState(true)
    
    let coords: { lat: number; lng: number } | undefined = undefined
    if (position) {
        const [lat, lng] = position.split(',').map(Number)
        coords = { lat, lng }
    }

    useEffect(() => {
        if (!open) {
            callClose()
        }
    }, [open])

    const onClick = async () => {
        if (selectedPlace) {
            await onLocationSet({
                data: {
                    coords: `${selectedPlace?.geometry?.location?.lat()},${selectedPlace?.geometry?.location?.lng()}`,
                    location: selectedPlace.formatted_address || ''
                }
            })
        }
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

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative rounded-lg bg-white p-5 flex flex-col gap-5">
                                <APIProvider
                                    apiKey={process.env.NEXT_PUBLIC_MAP_API_KEY || ''}
                                    solutionChannel='GMP_devsite_samples_v3_rgmautocomplete'>
                                    <Map
                                        mapId={'bf51a910020fa25a'}
                                        defaultZoom={coords ? 10 : 3}
                                        defaultCenter={coords || { lat: 22.54992, lng: 0 }}
                                        gestureHandling={'greedy'}
                                        disableDefaultUI={true}
                                        className='md:w-[500px] md:h-[500px] lg:w-[500px] lg:h-[500px] w-[300px] h-[300px]'
                                    >
                                        <MapControl position={ControlPosition.TOP_CENTER}>
                                            <div className="autocomplete-control text-black p-3">
                                                <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
                                            </div>
                                        </MapControl>
                                        <AdvancedMarker ref={markerRef} position={coords} />
                                    </Map>
                                    <MapHandler place={selectedPlace} marker={marker} />
                                </APIProvider>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        className="bg-gray-600 p-2 rounded-lg"
                                        onClick={onClick}
                                        data-autofocus
                                    >
                                        Choose location
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