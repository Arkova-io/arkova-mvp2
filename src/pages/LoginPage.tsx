/**
 * Login Page
 */

import { LoginForm } from '@/components/auth';
import { AuthLayout } from '@/components/layout';

interface LoginPageProps {
  onNavigateToSignUp: () => void;
  onLoginSuccess: () => void;
}

export function LoginPage({ onNavigateToSignUp, onLoginSuccess }: LoginPageProps) {
  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your credentials to access your vault"
    >
      <LoginForm
        onSuccess={onLoginSuccess}
        onSignUpClick={onNavigateToSignUp}
      />
    </AuthLayout>
  );
}
