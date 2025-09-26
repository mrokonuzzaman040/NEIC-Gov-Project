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

      {/* Search */}
      <div className="bg-gray-50 dark:bg-slate-700 p-4 border">
        <input
          type="text"
          placeholder="Search by name, contact, message, district, seat, or source..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full max-w-sm px-3 py-1 border border-gray-300 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 dark:bg-slate-600 dark:border-slate-500 dark:text-white"
        />
      </div>

      {/* Submissions List (Read-only) */}
      <div className="space-y-3">
        {filteredSubmissions.map((submission) => (
          <div key={submission.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {submission.name || 'Anonymous'}
                  </span>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {submission.contact}
                  </span>
                  {submission.email && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {submission.email}
                    </span>
                  )}
                </div>
                
                {submission.attachmentUrl && (
                  <div className="mb-2">
                    <a
                      href={submission.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      📎 {submission.attachmentName}
                    </a>
                  </div>
                )}
                
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {submission.message}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Submitted: {new Date(submission.createdAt).toLocaleString()}</span>
                  {submission.district && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      {submission.district}
                    </span>
                  )}
                  {submission.seatName && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                      {submission.seatName}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                    {submission.source || 'web'}
                  </span>
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
