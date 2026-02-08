/**
 * Dashboard Page (Vault Dashboard)
 *
 * Main authenticated view showing user's secured records.
 * Uses approved terminology per Constitution.
 */

import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';

interface DashboardPageProps {
  onSignOut: () => void;
}

export function DashboardPage({ onSignOut }: DashboardPageProps) {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const handleSignOut = async () => {
    await signOut();
    onSignOut();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Arkova</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {profileLoading ? 'Loading...' : profile?.full_name || user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-blue-100 rounded-md flex items-center justify-center">
                    <span className="text-blue-600 text-xl">📄</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Records
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-green-100 rounded-md flex items-center justify-center">
                    <span className="text-green-600 text-xl">✓</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Secured
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-yellow-100 rounded-md flex items-center justify-center">
                    <span className="text-yellow-600 text-xl">⏳</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Records Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                My Records
              </h2>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Secure Document
              </button>
            </div>
          </div>

          <div className="px-4 py-12 text-center">
            <div className="text-gray-500">
              <p className="text-lg font-medium">No records yet</p>
              <p className="mt-1 text-sm">
                Secure your first document to create a permanent record.
              </p>
            </div>
          </div>
        </div>

        {/* Role Info */}
        {profile && (
          <div className="mt-6 bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
            <p className="mt-1 text-lg font-semibold">
              {profile.role === 'ORG_ADMIN' ? 'Organization Administrator' : 'Individual'}
            </p>
            {profile.org_id && (
              <p className="text-sm text-gray-500 mt-1">
                Organization member
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
