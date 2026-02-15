/**
 * Sign Up Page
 */

import { SignUpForm } from '@/components/auth';
import { AuthLayout } from '@/components/layout';

interface SignUpPageProps {
  onNavigateToLogin: () => void;
  onSignUpSuccess: () => void;
}

export function SignUpPage({ onNavigateToLogin, onSignUpSuccess }: SignUpPageProps) {
  return (
    <AuthLayout
      title="Create your account"
      description="Start securing your documents today"
    >
      <SignUpForm
        onSuccess={onSignUpSuccess}
        onLoginClick={onNavigateToLogin}
      />
    </AuthLayout>
  );
}
