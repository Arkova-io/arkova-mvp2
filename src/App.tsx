/**
 * Arkova MVP - Main Application
 *
 * Simple routing without external router library.
 * Handles auth state and page navigation.
 */

import { useState, useEffect } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoginPage, SignUpPage, DashboardPage } from '@/pages';

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading Arkova...</span>
          </div>
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
