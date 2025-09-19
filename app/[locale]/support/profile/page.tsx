'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
}

export default function SupportProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Profile Settings</h1>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Profile Settings</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Error Loading Profile</h3>
              <p className="text-red-800 dark:text-red-200 mt-1">{error}</p>
              <button
                onClick={fetchProfile}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Profile Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          View your account information
        </p>
      </div>

      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Profile Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <p className="text-slate-900 dark:text-slate-100 py-2">{profile.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <p className="text-slate-900 dark:text-slate-100 py-2">{profile.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <p className="text-slate-900 dark:text-slate-100 py-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                      {profile.role}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Account Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Account Created</p>
                  <p className="text-slate-900 dark:text-slate-100 font-medium">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Last Login</p>
                  <p className="text-slate-900 dark:text-slate-100 font-medium">
                    {new Date(profile.lastLogin).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.isActive 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  }`}>
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mt-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Need Help?
              </h2>
              
              <div className="space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Contact your administrator if you need to update your profile information or have access issues.
                </p>
                
                <div className="text-sm">
                  <p className="text-slate-700 dark:text-slate-300 font-medium">System Administrator</p>
                  <p className="text-slate-600 dark:text-slate-400">admin@election-commission.gov.bd</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
