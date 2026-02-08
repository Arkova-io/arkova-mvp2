/**
 * Sign Up Page
 */

import { SignUpForm } from '../components/auth';

interface SignUpPageProps {
  onNavigateToLogin: () => void;
  onSignUpSuccess: () => void;
}

export function SignUpPage({ onNavigateToLogin, onSignUpSuccess }: SignUpPageProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          Arkova
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create your account to start securing documents
        </p>
      </div>

      <div className="mt-8">
        <SignUpForm
          onSuccess={onSignUpSuccess}
          onLoginClick={onNavigateToLogin}
        />
      </div>
    </div>
  );
}
