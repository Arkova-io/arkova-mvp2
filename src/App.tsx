/**
 * Arkova MVP - Main Application
 *
 * Simple routing without external router library.
 * Handles auth state and page navigation.
 */

import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage, SignUpPage, DashboardPage } from './pages';

type Page = 'login' | 'signup' | 'dashboard';

export function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('login');

  // Redirect based on auth state
  useEffect(() => {
    if (!loading) {
      if (user) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('login');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  switch (currentPage) {
    case 'login':
      return (
        <LoginPage
          onNavigateToSignUp={() => setCurrentPage('signup')}
          onLoginSuccess={() => setCurrentPage('dashboard')}
        />
      );

    case 'signup':
      return (
        <SignUpPage
          onNavigateToLogin={() => setCurrentPage('login')}
          onSignUpSuccess={() => setCurrentPage('dashboard')}
        />
      );

    case 'dashboard':
      return (
        <DashboardPage
          onSignOut={() => setCurrentPage('login')}
        />
      );

    default:
      return null;
  }
}

export default App;
