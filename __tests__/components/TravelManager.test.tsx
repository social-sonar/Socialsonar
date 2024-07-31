import '@testing-library/jest-dom'
import { render, fireEvent, waitFor, getByRole } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import TravelManager from '@/components/TravelManager'
import React from 'react'

describe('TravelManager', () => {
    it('should render correctly with initial state', async () => {
        const showNotification = jest.fn()
        const callClose = jest.fn()
        const { getByText, getByPlaceholderText } = render(
            <TravelManager showNotification={showNotification} userId="123" callClose={callClose} />
        );

        expect(getByText('Register an upcoming travel')).toBeInTheDocument();
        expect(getByPlaceholderText('Where are you traveling to?')).toBeInTheDocument();
        expect(getByText('Add to calendar')).toBeInTheDocument();
    })

    it('should not register travel when value is null', async () => {
        const showNotification = jest.fn();
        const callClose = jest.fn();
        const { getByRole } = render(
            <TravelManager showNotification={showNotification} userId="123" callClose={callClose} />
        );

        const registerButton = getByRole('button')

        await userEvent.click(registerButton);

        expect(registerButton).toBeDisabled()
        expect(showNotification).not.toHaveBeenCalled();
        expect(callClose).not.toHaveBeenCalled();
    });

    // it('should register travel successfully when valid data is provided', async () => {

    //     const mockGoogle = {
    //         maps: {
    //             places: {
    //                 Autocomplete: jest.fn().mockImplementation(function () {
    //                     return {
    //                         addListener: jest.fn(),
    //                         getPlace: jest.fn().mockReturnValue({
    //                             name: 'Mock Place',
    //                             formatted_address: 'Mock Address',
    //                             geometry: {
    //                                 location: {
    //                                     lat: () => 0,
    //                                     lng: () => 0,
    //                                 },
    //                             },
    //                         }),
    //                     };
    //                 }),
    //             },
    //         },
    //     };

    //     // Mock window.google
    //     // (global as any).google = mockGoogle;

    //     const showNotification = jest.fn();
    //     const callClose = jest.fn();
    //     const registerTravel = jest.fn();
    //     const google = {
    //         maps: {
    //             places: {
    //                 PlaceResult: jest.fn()
    //             }
    //         }
    //     };

    //     const { getByPlaceholderText, getByText } = render(
    //         <TravelManager showNotification={showNotification} userId="123" callClose={callClose} />
    //     );
    //     const placeholder = getByPlaceholderText('Where are you traveling to?')
    //     await userEvent.type(placeholder, 'Los Angeles')
    //     expect(placeholder).toHaveValue('Los Angeles')
    // });
})