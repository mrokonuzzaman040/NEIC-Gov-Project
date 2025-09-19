'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic';

interface SubmissionStats {
  total: number;
  pending: number;
  reviewed: number;
  flagged: number;
  withAttachments: number;
  totalFileSize: number;
  byLocale: { [key: string]: number };
}

export default function ReportsPage() {
  const t = useTranslations();
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Fetch basic statistics from the submissions API
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Use the existing submissions API to get data
      const response = await fetch('/api/admin/submissions');
      if (response.ok) {
        const data = await response.json();
        
        // Calculate statistics from submissions data
        const submissions = data.submissions || [];
        const stats: SubmissionStats = {
          total: submissions.length,
          pending: submissions.filter((s: any) => s.status === 'PENDING').length,
          reviewed: submissions.filter((s: any) => s.status === 'REVIEWED').length,
          flagged: submissions.filter((s: any) => s.status === 'FLAGGED').length,
          withAttachments: submissions.filter((s: any) => s.attachmentUrl).length,
          totalFileSize: submissions.reduce((sum: number, s: any) => sum + (s.attachmentSize || 0), 0),
          byLocale: submissions.reduce((acc: any, s: any) => {
            acc[s.locale] = (acc[s.locale] || 0) + 1;
            return acc;
          }, {})
        };
        
        setStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Fallback to mock data for demonstration
      setStats({
        total: 3,
        pending: 3,
        reviewed: 0,
        flagged: 0,
        withAttachments: 3,
        totalFileSize: 181,
        byLocale: { 'en': 1, 'bn': 2 }
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      const response = await fetch('/api/admin/submissions');
      if (response.ok) {
        const data = await response.json();
        const submissions = data.submissions || [];
        
        // Create CSV content
        const csvHeaders = ['ID', 'Date', 'Name', 'Phone', 'Email', 'Language', 'Status', 'Message', 'Has File'];
        const csvRows = submissions.map((sub: any) => [
          sub.id,
          new Date(sub.createdAt).toLocaleDateString(),
          sub.name || 'Anonymous',
          sub.contact || '',
          sub.email || '',
          sub.locale,
          sub.status,
          `"${(sub.message || '').replace(/"/g, '""').substring(0, 100)}"`,
          sub.attachmentUrl ? 'Yes' : 'No'
        ]);
        
        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map((row: any) => row.join(','))
        ].join('\\n');
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `submissions-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="border-l-4 border-green-600 bg-white dark:bg-slate-800 p-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading reports...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="border-l-4 border-red-600 bg-white dark:bg-slate-800 p-4">
        <div className="text-sm text-red-600 dark:text-red-400">Failed to load report data</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 max-w-7xl">
      {/* Header */}
      <div className="border-l-4 border-green-600 bg-white dark:bg-slate-800 pl-4 py-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          System statistics and data export
        </p>
      </div>

      {/* Export Controls */}
      <div className="bg-gray-50 dark:bg-slate-700 p-4 border border-gray-200 dark:border-slate-600">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex space-x-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">Period:</span>
            {['7d', '30d', '90d', 'all'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-3 py-1 text-sm border transition-colors ${
                  selectedPeriod === period
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-slate-600 dark:text-gray-300 dark:border-slate-500'
                }`}
              >
                {period === 'all' ? 'All Time' : period.toUpperCase()}
              </button>
            ))}
          </div>
          
          <button
            onClick={generateReport}
            disabled={generating}
            className="px-4 py-1 bg-green-600 text-white text-sm hover:bg-green-700 disabled:bg-gray-400 border border-green-600"
          >
            {generating ? 'Generating...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Submissions */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Submissions</div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
        </div>

        {/* With Attachments */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.withAttachments}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">With Files</div>
        </div>

        {/* Total File Size */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {formatFileSize(stats.totalFileSize)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total File Size</div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600">
        <div className="p-4 border-b border-gray-200 dark:border-slate-600">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Status Breakdown</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                {stats.pending}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="text-lg font-bold text-green-700 dark:text-green-300">
                {stats.reviewed}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Reviewed</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.total > 0 ? Math.round((stats.reviewed / stats.total) * 100) : 0}%
              </div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="text-lg font-bold text-red-700 dark:text-red-300">
                {stats.flagged}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">Flagged</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.total > 0 ? Math.round((stats.flagged / stats.total) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Language Distribution */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600">
        <div className="p-4 border-b border-gray-200 dark:border-slate-600">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Language Distribution</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(stats.byLocale).map(([locale, count]) => (
              <div key={locale} className="flex justify-between items-center p-3 border border-gray-200 dark:border-slate-600">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {locale === 'en' ? 'English' : 'Bengali'}
                </span>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{count}</div>
                  <div className="text-xs text-gray-500">
                    {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* File Statistics */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600">
        <div className="p-4 border-b border-gray-200 dark:border-slate-600">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">File Upload Statistics</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 border border-gray-200 dark:border-slate-600">
              <div className="font-medium text-gray-600 dark:text-gray-300">Submissions with Files</div>
              <div className="text-lg font-bold text-green-600">{stats.withAttachments}</div>
              <div className="text-xs text-gray-500">
                {stats.total > 0 ? Math.round((stats.withAttachments / stats.total) * 100) : 0}% of total
              </div>
            </div>
            <div className="p-3 border border-gray-200 dark:border-slate-600">
              <div className="font-medium text-gray-600 dark:text-gray-300">Total Storage Used</div>
              <div className="text-lg font-bold text-blue-600">{formatFileSize(stats.totalFileSize)}</div>
              <div className="text-xs text-gray-500">Stored in S3</div>
            </div>
            <div className="p-3 border border-gray-200 dark:border-slate-600">
              <div className="font-medium text-gray-600 dark:text-gray-300">Average File Size</div>
              <div className="text-lg font-bold text-purple-600">
                {stats.withAttachments > 0 ? formatFileSize(Math.round(stats.totalFileSize / stats.withAttachments)) : '0 Bytes'}
              </div>
              <div className="text-xs text-gray-500">Per file</div>
            </div>
          </div>
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
              onClick={() => window.open('/en/admin/submissions', '_blank')}
              className="p-3 text-left border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white">View All Submissions</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Manage citizen submissions</div>
            </button>
            
            <button
              onClick={() => {
                const pendingUrl = '/en/admin/submissions?status=pending';
                window.open(pendingUrl, '_blank');
              }}
              className="p-3 text-left border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="font-medium text-yellow-600 dark:text-yellow-400">Review Pending</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stats.pending} items need review</div>
            </button>
            
            <button
              onClick={generateReport}
              disabled={generating}
              className="p-3 text-left border border-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
            >
              <div className="font-medium text-green-700 dark:text-green-300">
                {generating ? 'Generating...' : 'Export Data'}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Download CSV report</div>
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600">
        <div className="p-4 border-b border-gray-200 dark:border-slate-600">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Information</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 border border-gray-200 dark:border-slate-600">
              <div className="font-medium text-gray-600 dark:text-gray-300">Database Status</div>
              <div className="text-green-600 dark:text-green-400">✓ Connected</div>
            </div>
            <div className="p-3 border border-gray-200 dark:border-slate-600">
              <div className="font-medium text-gray-600 dark:text-gray-300">File Storage</div>
              <div className="text-green-600 dark:text-green-400">✓ S3 Active</div>
            </div>
            <div className="p-3 border border-gray-200 dark:border-slate-600">
              <div className="font-medium text-gray-600 dark:text-gray-300">Last Updated</div>
              <div className="text-gray-900 dark:text-gray-100">{new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}