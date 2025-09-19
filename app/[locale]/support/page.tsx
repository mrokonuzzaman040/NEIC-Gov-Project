'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic';

interface SupportStats {
  totalSubmissions: number;
  pendingItems: number;
  myAssignments: number;
  recentActivity: Array<{
    id: string;
    name: string | null;
    contact: string;
    message: string;
    status: string;
    createdAt: string;
  }>;
}

export default function SupportDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupportData();
  }, []);

  const fetchSupportData = async () => {
    try {
      // For now, use mock data. In production, this would fetch from API
      const mockStats: SupportStats = {
        totalSubmissions: 3,
        pendingItems: 3,
        myAssignments: 1,
        recentActivity: [
          {
            id: '1',
            name: 'John Doe',
            contact: '01712345678',
            message: 'Testing S3 file upload functionality with AWS environment properly configured.',
            status: 'PENDING',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: null,
            contact: '01798765432',
            message: 'Another test submission for the support dashboard.',
            status: 'PENDING',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch support data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="border-l-4 border-green-600 bg-white dark:bg-slate-800 p-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="border-l-4 border-red-600 bg-white dark:bg-slate-800 p-4">
        <div className="text-sm text-red-600 dark:text-red-400">Failed to load dashboard data</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Welcome Header */}
      <div className="border-l-4 border-green-600 bg-white dark:bg-slate-800 pl-4 py-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Support Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Welcome back, {session?.user?.name || 'Support Staff'}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalSubmissions}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Submissions</div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pendingItems}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending Items</div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {stats.myAssignments}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">My Assignments</div>
        </div>
      </div>

      {/* Available Actions */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600">
        <div className="p-4 border-b border-gray-200 dark:border-slate-600">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Available Actions</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => window.location.href = '/en/support/submissions'}
              className="p-4 text-left border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white">View Submissions</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Browse citizen submissions
              </div>
            </button>
            
            <button
              onClick={() => window.location.href = '/en/support/profile'}
              className="p-4 text-left border border-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <div className="font-medium text-green-700 dark:text-green-300">Profile Settings</div>
              <div className="text-sm text-green-600 dark:text-green-400">Update account info</div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600">
        <div className="p-4 border-b border-gray-200 dark:border-slate-600">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <div className="p-4">
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.name || 'Anonymous'} - {item.contact}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {item.message.substring(0, 60)}...
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs border ${
                      item.status === 'PENDING' 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                        : 'bg-gray-50 text-gray-700 border-gray-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">No recent activity</div>
            </div>
          )}
        </div>
      </div>

      {/* Help & Resources */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600">
        <div className="p-4 border-b border-gray-200 dark:border-slate-600">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Help & Resources</h3>
        </div>
        <div className="p-4">
          <div className="space-y-2 text-sm">
            <div className="p-2 border border-gray-200 dark:border-slate-600">
              <div className="font-medium text-gray-700 dark:text-gray-300">📖 User Guide</div>
              <div className="text-gray-600 dark:text-gray-400">How to use the support panel</div>
            </div>
            <div className="p-2 border border-gray-200 dark:border-slate-600">
              <div className="font-medium text-gray-700 dark:text-gray-300">📞 Contact IT</div>
              <div className="text-gray-600 dark:text-gray-400">Technical support and assistance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

