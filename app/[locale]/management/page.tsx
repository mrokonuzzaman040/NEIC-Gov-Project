'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic';

interface DashboardStats {
  totalSubmissions: number;
  pendingReview: number;
  reviewedToday: number;
  flaggedItems: number;
  recentSubmissions: Array<{
    id: string;
    name: string | null;
    contact: string;
    message: string;
    status: string;
    createdAt: string;
    attachmentUrl: string | null;
  }>;
}

export default function ManagementDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/management/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Transform API data to match component interface
        const apiData = result.data;
        const transformedStats: DashboardStats = {
          totalSubmissions: apiData.totalSubmissions || 0,
          pendingReview: apiData.pendingReview || 0,
          reviewedToday: apiData.reviewedToday || 0,
          flaggedItems: apiData.flaggedItems || 0,
          recentSubmissions: apiData.recentSubmissions || []
        };
        
        setStats(transformedStats);
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      
      // Fallback to empty state instead of mock data for security
      setStats({
        totalSubmissions: 0,
        pendingReview: 0,
        reviewedToday: 0,
        flaggedItems: 0,
        recentSubmissions: []
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
          onClick={() => window.location.reload()} 
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
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Management Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Welcome back, {session?.user?.name || 'Manager'}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalSubmissions}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Submissions</div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pendingReview}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.reviewedToday}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Reviewed Today</div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-4">
          <div className="text-2xl font-bold text-red-600">
            {stats.flaggedItems}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Flagged Items</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600">
        <div className="p-4 border-b border-gray-200 dark:border-slate-600">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/en/management/submissions'}
              className="p-4 text-left border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white">Review Submissions</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stats.pendingReview} pending items
              </div>
            </button>
            
            <button
              onClick={() => window.location.href = '/en/management/reports'}
              className="p-4 text-left border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white">View Reports</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Analytics and statistics</div>
            </button>
            
            <button
              onClick={() => window.location.href = '/en/management/profile'}
              className="p-4 text-left border border-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <div className="font-medium text-green-700 dark:text-green-300">Profile Settings</div>
              <div className="text-sm text-green-600 dark:text-green-400">Update account info</div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600">
        <div className="p-4 border-b border-gray-200 dark:border-slate-600">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Submissions</h3>
        </div>
        <div className="p-4">
          {stats.recentSubmissions.length > 0 ? (
            <div className="space-y-3">
              {stats.recentSubmissions.slice(0, 5).map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-600">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {submission.name || 'Anonymous'}
                      </span>
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {submission.contact}
                      </span>
                      {submission.attachmentUrl && (
                        <span className="text-xs text-blue-600 dark:text-blue-400">📎</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {submission.message.substring(0, 80)}...
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(submission.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-2 py-1 text-xs border ${
                      submission.status === 'PENDING' 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                        : submission.status === 'REVIEWED'
                        ? 'bg-green-50 text-green-700 border-green-300'
                        : 'bg-red-50 text-red-700 border-red-300'
                    }`}>
                      {submission.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">No recent submissions</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
