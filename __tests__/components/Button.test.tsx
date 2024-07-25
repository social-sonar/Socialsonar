import '@testing-library/jest-dom'
import { render, fireEvent } from '@testing-library/react'

import Button from '@/components/Button'
import React from 'react'

describe('Button', () => {
  // Render a button with default 'primary' variant when no variant is specified
  it('should render with primary variant by default', () => {
    const { getByRole } = render(<Button />)
    const button = getByRole('button')
    expect(button).toHaveClass('bg-zinc-800')
  })

  // Handle cases where no props are provided at all
  it('should render correctly without any props', () => {
    const { getByRole } = render(<Button />)
    const button = getByRole('button')
    expect(button).toBeInTheDocument()
  })

  // Render a button with specified variant styles when variant is provided
  it('should render with specified variant styles when variant is provided', () => {
    const { getByRole } = render(<Button variant="secondary" />)
    const button = getByRole('button')
    expect(button).toHaveClass('bg-zinc-50')
  })

  // Render a button element when href is undefined
  it('should render a button element when href is undefined', () => {
    const { getByRole } = render(<Button />)
    const button = getByRole('button')
    expect(button).toBeInTheDocument()
  })

  // Render a Link component when href is provided
  it('should render Link component when href is provided', () => {
    const { getByRole } = render(<Button href="https://example.com" />)
    const link = getByRole('link')
    expect(link).toHaveClass('bg-zinc-800')
  })

  // Pass all additional props to the button or Link component
  it('should pass all additional props to the button component', () => {
    const { getByRole } = render(
      <Button id="test-button" onClick={() => console.log('Button clicked')} />,
    )
    const button = getByRole('button')
    expect(button).toHaveAttribute('id', 'test-button')
    fireEvent.click(button)
    // Add more assertions for other props as needed
  })

  // Combine className prop with default and variant-specific classes using clsx
  it('should combine className prop with default and variant-specific classes when provided', () => {
    const { getByRole } = render(
      <Button className="custom-class" variant="secondary" />,
    )
    const button = getByRole('button')
    expect(button).toHaveClass('bg-zinc-50')
    expect(button).toHaveClass('custom-class')
  })

  // Render correctly with empty className
  it('should render with primary variant by default', () => {
    const { getByRole } = render(<Button />)
    const button = getByRole('button')
    expect(button).toHaveClass('bg-zinc-800')
  })

  // Function properly with null or undefined className
  it('should render button with default primary variant and no className', () => {
    const { getByRole } = render(<Button />)
    const button = getByRole('button')
    expect(button).toHaveClass('bg-zinc-800')
  })
})
