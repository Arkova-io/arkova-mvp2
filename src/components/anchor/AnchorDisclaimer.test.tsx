import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnchorDisclaimer, AnchorDisclaimerDark } from './AnchorDisclaimer';

describe('AnchorDisclaimer', () => {
  it('renders disclaimer title and body text', () => {
    render(<AnchorDisclaimer />);
    expect(screen.getByText('Platform Disclaimer')).toBeInTheDocument();
    expect(screen.getByText(/does not verify truthfulness/)).toBeInTheDocument();
  });

  it('mentions what Arkova does not do', () => {
    render(<AnchorDisclaimer />);
    expect(screen.getByText(/guarantee authenticity/)).toBeInTheDocument();
    expect(screen.getByText(/legal certification/)).toBeInTheDocument();
  });
});

describe('AnchorDisclaimerDark', () => {
  it('renders dark variant with same content', () => {
    render(<AnchorDisclaimerDark />);
    expect(screen.getByText('Platform Disclaimer')).toBeInTheDocument();
    expect(screen.getByText(/does not verify truthfulness/)).toBeInTheDocument();
  });
});
