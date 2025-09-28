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
    district?: string | null;
    seatName?: string | null;
    source?: string;
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
      setLoading(true);
      
      const response = await fetch('/api/support/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Transform API data to match component interface
        const apiData = result.data;
        const transformedStats: SupportStats = {
          totalSubmissions: apiData.totalSubmissions || 0,
          pendingItems: apiData.pendingItems || 0,
          myAssignments: apiData.myAssignments || 0,
          recentActivity: apiData.recentActivity || []
        };
        
        setStats(transformedStats);
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch support data:', error);
      
      // Fallback to empty state instead of mock data for security
      setStats({
        totalSubmissions: 0,
        pendingItems: 0,
        myAssignments: 0,
        recentActivity: []
      });
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
        <div className="text-sm text-red-600 dark:text-red-400">
          Failed to load dashboard data. Please refresh the page or contact system administrator.
        </div>
        <button 
          onClick={fetchSupportData} 
          className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Welcome Header */}
      <div className="border-l-4 border-green-600 bg-white dark:bg-slate-800 pl-4 py-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Support Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back, {session?.user?.name || 'Support Staff'}
            </p>
          </div>
          <button
            onClick={fetchSupportData}
            disabled={loading}
            className="px-3 py-1 text-sm bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 rounded transition-colors"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
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
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                        {item.district && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            {item.district}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          {item.source || 'web'}
                        </span>
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

