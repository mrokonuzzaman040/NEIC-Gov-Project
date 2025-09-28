'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic';

interface ReportStats {
  totalSubmissions: number;
  pendingReview: number;
  reviewedToday: number;
  flaggedItems: number;
  reviewedInPeriod: number;
  averageProcessingTime: string;
  topCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  sourceDistribution: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  submissionsByStatus: Array<{
    status: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    name: string | null;
    status: string;
    district: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
  lastUpdated: string;
}

export default function ManagementReportsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7'); // days

  useEffect(() => {
    fetchReportData();
  }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/management/reports?days=${dateRange}`, {
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
        setStats(result.data);
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/management/reports/generate?format=${format}&days=${dateRange}`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `management-report-${dateRange}days.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert(error instanceof Error ? error.message : 'Failed to download report');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reports</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reports</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Error Loading Reports</h3>
              <p className="text-red-800 dark:text-red-200 mt-1">{error}</p>
              <button
                onClick={fetchReportData}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Management Reports</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Overview of submission statistics and trends
            {stats && (
              <span className="ml-2 text-sm text-slate-500 dark:text-slate-500">
                (Last updated: {new Date(stats.lastUpdated).toLocaleString()})
              </span>
            )}
          </p>
        </div>
        
        <button
          onClick={fetchReportData}
          disabled={loading}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          
          <div className="flex gap-2">
            <button
              onClick={() => downloadReport('csv')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CSV
            </button>
            <button
              onClick={() => downloadReport('json')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Download JSON
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Submissions</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.totalSubmissions}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Review</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.pendingReview}</p>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Reviewed Today</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.reviewedToday}</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Flagged Items</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.flaggedItems}</p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Time */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Performance Metrics</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Average Processing Time</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.averageProcessingTime}</p>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                ↓ 15% from last period
              </div>
            </div>
          </div>

          {/* Top Districts */}
          {stats.topCategories && stats.topCategories.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Top Districts by Submissions</h3>
              <div className="space-y-4">
                {stats.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-slate-900 dark:text-slate-100 font-medium">{category.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 dark:text-slate-400">{category.count} submissions</span>
                      <span className="text-sm text-slate-500 dark:text-slate-500">({category.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source Distribution */}
          {stats.sourceDistribution && stats.sourceDistribution.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Submission Sources</h3>
              <div className="space-y-4">
                {stats.sourceDistribution.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-900 dark:text-slate-100 font-medium capitalize">{source.source}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 dark:text-slate-400">{source.count} submissions</span>
                      <span className="text-sm text-slate-500 dark:text-slate-500">({source.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Distribution */}
          {stats.submissionsByStatus && stats.submissionsByStatus.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Status Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.submissionsByStatus.map((status, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        status.status === 'PENDING' ? 'bg-yellow-500' :
                        status.status === 'REVIEWED' ? 'bg-green-500' :
                        status.status === 'FLAGGED' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-slate-900 dark:text-slate-100 font-medium">{status.status}</span>
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
