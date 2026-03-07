/**
 * Login Page
 */

import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth';
import { AuthLayout } from '@/components/layout';
import { ROUTES } from '@/lib/routes';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your credentials to access your vault"
    >
      <LoginForm
        onSuccess={() => navigate(ROUTES.DASHBOARD)}
        onSignUpClick={() => navigate(ROUTES.SIGNUP)}
      />
    </AuthLayout>
  );
}
