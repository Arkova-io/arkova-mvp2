/**
 * Login Page
 */

import { LoginForm } from '../components/auth';

interface LoginPageProps {
  onNavigateToSignUp: () => void;
  onLoginSuccess: () => void;
}

export function LoginPage({ onNavigateToSignUp, onLoginSuccess }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          Arkova
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Secure your documents with cryptographic verification
        </p>
      </div>

      <div className="mt-8">
        <LoginForm
          onSuccess={onLoginSuccess}
          onSignUpClick={onNavigateToSignUp}
        />
      </div>
    </div>
  );
}
