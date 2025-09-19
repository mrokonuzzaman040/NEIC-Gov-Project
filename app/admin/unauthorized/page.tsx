'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function UnauthorizedPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session on client side only
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const sessionData = await response.json();
        setSession(sessionData);
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    // Only redirect if session is loaded and user has proper permissions
    if (!isLoading && session && session.role) {
      const timer = setTimeout(() => {
        router.push('/admin/dashboard' as any);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [session, router, isLoading]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  // Show loading state while session is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Access Denied
          </h2>
          
          {/* Description */}
          <p className="mt-2 text-sm text-gray-600">
            You don&apos;t have permission to access this resource.
          </p>

          {/* User Info */}
          {session && (
            <div className="mt-4 bg-white rounded-lg p-4 shadow-sm border">
              <p className="text-sm text-gray-700">
                <strong>Logged in as:</strong> {session.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Role:</strong> {session.role}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => router.push('/admin/dashboard' as any)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Sign Out
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Security Notice:</strong> Unauthorized access attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 National Elections Inquiry Commission
          </p>
          <p className="text-xs text-gray-400">
            Government of the People&apos;s Republic of Bangladesh
          </p>
        </div>
      </div>
    </div>
  );
}
