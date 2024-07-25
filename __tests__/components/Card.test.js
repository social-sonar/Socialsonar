import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import {Card} from '@/components/Card'

describe('Card', () => {

    // Render Card with default div element if no 'as' prop is provided
    it('should render a div by default when no "as" prop is provided', () => {
      const { container } = render(<Card />);
      expect(container.firstChild.nodeName).toBe('DIV');
    });

    // Render Card with custom element when 'as' prop is specified
    it('should render a custom element when "as" prop is specified', () => {
      const { container } = render(<Card as="section" />);
      expect(container.firstChild.nodeName).toBe('SECTION');
    });

    // Card.Link renders a Link component with children correctly
    it('should render a Link component with children correctly in Card.Link', () => {
      const { getByText } = render(<Card.Link href="/test">Test Link</Card.Link>);
      expect(getByText('Test Link')).toBeInTheDocument();
    });

    // Card.Title renders with default h2 element if no 'as' prop is provided
    it('should render an h2 element by default in Card.Title when no "as" prop is provided', () => {
      const { container } = render(<Card.Title>Test Title</Card.Title>);
      expect(container.querySelector('h2')).toBeInTheDocument();
    });

    // Card.Title renders with custom element when 'as' prop is specified
    it('should render a custom element in Card.Title when "as" prop is specified', () => {
      const { container } = render(<Card.Title as="h1">Test Title</Card.Title>);
      expect(container.querySelector('h1')).toBeInTheDocument();
    });

    // Card.Link handles null or undefined children gracefully
    it('should handle null children gracefully in Card.Link', () => {
      const { container } = render(<Card.Link href="/test">{null}</Card.Link>);
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    // Card.Title handles null or undefined children gracefully
    it('should handle null children gracefully in Card.Title', () => {
      const { container } = render(<Card.Title>{null}</Card.Title>);
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    // Card.Description handles null or undefined children gracefully
    it('should handle null children gracefully in Card.Description', () => {
      const { container } = render(<Card.Description>{null}</Card.Description>);
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    // Card.Eyebrow handles null or undefined children gracefully
    it('should handle null children gracefully in Card.Eyebrow', () => {
      const { container } = render(<Card.Eyebrow>{null}</Card.Eyebrow>);
      expect(container.firstChild).toBeEmptyDOMElement();
    });
});
