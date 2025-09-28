'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic';

// Read-only submissions view for Support role
interface Submission {
  id: string;
  name: string | null;
  contact: string;
  email?: string;
  district?: string | null;
  seatName?: string | null;
  message: string;
  status: string;
  source?: string;
  locale?: string;
  createdAt: string;
  updatedAt?: string;
  attachmentUrl?: string | null;
  attachmentName?: string;
  attachmentSize?: number | null;
  attachmentType?: string | null;
}

export default function SupportSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/support/submissions', {
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
        setSubmissions(result.data);
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => 
    !searchTerm || 
    sub.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.seatName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="border-l-4 border-green-600 bg-white dark:bg-slate-800 p-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading submissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Header */}
      <div className="border-l-4 border-green-600 bg-white dark:bg-slate-800 pl-4 py-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">View Submissions</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredSubmissions.length} submissions (read-only access)
            </p>
          </div>
          <button
            onClick={fetchSubmissions}
            disabled={loading}
            className="px-3 py-1 text-sm bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 rounded transition-colors"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-gray-50 dark:bg-slate-700 p-4 border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, contact, message, district, seat, or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 dark:bg-slate-600 dark:border-slate-500 dark:text-white rounded-md"
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 dark:bg-slate-600 dark:border-slate-500 dark:text-white rounded-md"
              onChange={(e) => {
                const status = e.target.value;
                if (status === 'all') {
                  setSearchTerm(searchTerm.replace(/status:\w+/g, '').trim());
                } else {
                  setSearchTerm(searchTerm.replace(/status:\w+/g, '').trim() + ` status:${status}`);
                }
              }}
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="FLAGGED">Flagged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.map((submission) => (
          <div key={submission.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
            {/* Header Section */}
            <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 border-b border-gray-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {submission.name || 'Anonymous'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      submission.status === 'PENDING' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : submission.status === 'REVIEWED'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {submission.status}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(submission.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contact</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {submission.contact || 'Not provided'}
                  </p>
                </div>
                {submission.email && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                    <p className="text-sm text-gray-900 dark:text-white">{submission.email}</p>
                  </div>
                )}
              </div>

              {/* Location Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {submission.district && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">District</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {submission.district}
                    </span>
                  </div>
                )}
                {submission.seatName && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Seat</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {submission.seatName}
                    </span>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Message</label>
                <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-md">
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {submission.message}
                  </p>
                </div>
              </div>

              {/* Attachment */}
              {submission.attachmentUrl && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Attachment</label>
                  <div className="flex items-center space-x-2">
                    <a
                      href={submission.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {submission.attachmentName}
                    </a>
                    {submission.attachmentSize && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({Math.round(submission.attachmentSize / 1024)} KB)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                  Source: {submission.source || 'web'}
                </span>
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                  Language: {submission.locale || 'en'}
                </span>
                {submission.updatedAt && submission.updatedAt !== submission.createdAt && (
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                    Updated: {new Date(submission.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSubmissions.length === 0 && (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <div className="text-sm">No submissions found</div>
            <div className="text-xs mt-1">
              {searchTerm ? 'Try adjusting your search terms' : 'No submissions available'}
            </div>
          </div>
        </div>
      )}
      
      {/* Note about permissions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> As a Support staff member, you have read-only access to submissions. 
          Contact Management or Administrator for approval actions.
        </div>
      </div>
    </div>
  );
}
