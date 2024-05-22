import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'

import ContactDetailAddress from './ContactDetailAddress'

describe('ContactDetailAddress', () => {
  // Component renders without crashing
  it('should render without crashing when provided with initial props', () => {
    const mockCallUpdate = jest.fn()
    const { container } = render(
      <ContactDetailAddress
        address={{
          countryCode: 'US',
          city: 'New York',
          region: 'NY',
          postalCode: '10001',
          streetAddress: '123 Broadway',
        }}
        callUpdate={mockCallUpdate}
      />,
    )
    expect(container).toBeInTheDocument()
  })

  // Handles null values in initial props gracefully
  it('should handle null values in initial props gracefully', () => {
    const mockCallUpdate = jest.fn()
    const { getByLabelText } = render(
      <ContactDetailAddress
        address={{
          countryCode: null,
          city: null,
          region: null,
          postalCode: null,
          streetAddress: null,
        }}
        callUpdate={mockCallUpdate}
      />,
    )
    expect(getByLabelText(/Country/i).value).toBe('')
    expect(getByLabelText(/City/i).value).toBe('')
    expect(getByLabelText(/State \/ Province/i).value).toBe('')
    expect(getByLabelText(/ZIP \/ Postal code/i).value).toBe('')
    expect(getByLabelText(/Street address/i).value).toBe('')
  })
})
