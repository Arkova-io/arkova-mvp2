/**
 * SignUpForm Beta Gate Tests
 *
 * Verifies that when VITE_BETA_INVITE_CODE is set, users must
 * enter a valid invite code before the signup form is shown.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignUpForm } from './SignUpForm';

const mockSignUp = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
    loading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

vi.mock('@/components/onboarding/EmailConfirmation', () => ({
  EmailConfirmation: () => <div data-testid="email-confirmation">Check your email</div>,
}));

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUp.mockResolvedValue({ error: null });
  });

  describe('without beta gate (no VITE_BETA_INVITE_CODE)', () => {
    it('shows signup form directly', () => {
      render(<SignUpForm />);
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('submits signup form', async () => {
      render(<SignUpForm />);
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
      });
    });

    it('shows password mismatch error', async () => {
      render(<SignUpForm />);
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('shows email confirmation after successful signup', async () => {
      render(<SignUpForm />);
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByTestId('email-confirmation')).toBeInTheDocument();
      });
    });

    it('shows sign in link when onLoginClick provided', () => {
      const onLoginClick = vi.fn();
      render(<SignUpForm onLoginClick={onLoginClick} />);
      const signInButton = screen.getByText(/sign in/i);
      fireEvent.click(signInButton);
      expect(onLoginClick).toHaveBeenCalled();
    });
  });
});
