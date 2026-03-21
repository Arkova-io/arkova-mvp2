/**
 * Sign Up Page
 */

import { useNavigate } from 'react-router-dom';
import { SignUpForm } from '@/components/auth';
import { AuthLayout } from '@/components/layout';
import { ROUTES } from '@/lib/routes';

export function SignUpPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Create your account"
      description="Join the closed beta and start securing your documents"
    >
      <SignUpForm
        onSuccess={() => navigate(ROUTES.DASHBOARD)}
        onLoginClick={() => navigate(ROUTES.LOGIN)}
      />
    </AuthLayout>
  );
}
