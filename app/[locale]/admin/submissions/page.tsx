'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic';

// File size formatting utility
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface Submission {
  id: string;
  name: string | null;
  contact: string | null;
  email: string | null;
  message: string;
  locale: string;
  status: string;
  createdAt: string;
  attachmentUrl: string | null;
  attachmentKey: string | null;
  attachmentName: string | null;
  attachmentSize: number | null;
  attachmentType: string | null;
}

export default function SubmissionsPage() {
  const t = useTranslations();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'flagged' | 'reviewed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        setSubmissions(prev => 
          prev.map(sub => sub.id === id ? { ...sub, status } : sub)
        );
        if (selectedSubmission && selectedSubmission.id === id) {
          setSelectedSubmission({ ...selectedSubmission, status });
        }
      }
    } catch (error) {
      console.error('Failed to update submission status:', error);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesFilter = filter === 'all' || submission.status.toLowerCase() === filter;
    const matchesSearch = !searchTerm || 
      submission.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      case 'flagged': return 'bg-red-50 text-red-700 border-red-300';
      case 'reviewed': return 'bg-green-50 text-green-700 border-green-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Citizen Submissions</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredSubmissions.length} total submissions
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded border">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Filter */}
          <div className="flex space-x-1">
            {['all', 'pending', 'flagged', 'reviewed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-3 py-1 text-sm border transition-colors ${
                  filter === status
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-slate-600 dark:text-gray-300 dark:border-slate-500 dark:hover:bg-slate-500'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full px-3 py-1 border border-gray-300 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 dark:bg-slate-600 dark:border-slate-500 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600">
        <table className="min-w-full">
          <thead className="bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                Contact
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                Message
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                File
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                Status
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800">
            {filteredSubmissions.map((submission) => (
              <tr key={submission.id} className="border-b border-gray-100 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  <div className="text-xs">
                    {formatDate(submission.createdAt)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {submission.locale.toUpperCase()}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  <div className="text-sm">
                    {submission.name && (
                      <div className="font-medium">{submission.name}</div>
                    )}
                    <div className="text-green-600 dark:text-green-400 text-xs">{submission.contact}</div>
                    {submission.email && (
                      <div className="text-gray-500 dark:text-gray-400 text-xs">{submission.email}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  <div className="max-w-xs">
                    <p className="text-xs truncate" title={submission.message}>
                      {submission.message.length > 80 
                        ? `${submission.message.slice(0, 80)}...` 
                        : submission.message}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {submission.attachmentUrl ? (
                    <div className="text-xs">
                      <div className="text-green-600 dark:text-green-400">📎 {submission.attachmentName}</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {submission.attachmentSize ? formatFileSize(submission.attachmentSize) : 'Unknown'}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 text-xs border ${
                    getStatusColor(submission.status)
                  }`}>
                    {submission.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mr-2 underline"
                  >
                    View
                  </button>
                  {submission.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateSubmissionStatus(submission.id, 'REVIEWED')}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mr-2 underline"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateSubmissionStatus(submission.id, 'FLAGGED')}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 underline"
                      >
                        Flag
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredSubmissions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <div className="text-sm">No submissions found</div>
                    <div className="text-xs mt-1">
                      {searchTerm ? 'Try adjusting your search terms.' : 'No submissions have been submitted yet.'}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-30 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-4 border w-11/12 md:w-3/4 lg:w-1/2 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200 dark:border-slate-600">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Submission Details
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 text-sm">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-slate-700">
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-300">Submitted</div>
                  <div className="text-gray-900 dark:text-gray-100">{formatDate(selectedSubmission.createdAt)}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-300">Language</div>
                  <div className="text-gray-900 dark:text-gray-100">{selectedSubmission.locale.toUpperCase()}</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-3 gap-4 p-3 border border-gray-200 dark:border-slate-600">
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-300">Name</div>
                  <div className="text-gray-900 dark:text-gray-100">
                    {selectedSubmission.name || 'Anonymous'}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-300">Phone</div>
                  <div className="text-green-600 dark:text-green-400">{selectedSubmission.contact}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-300">Email</div>
                  <div className="text-gray-900 dark:text-gray-100">
                    {selectedSubmission.email || 'Not provided'}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <div className="font-medium text-gray-600 dark:text-gray-300 mb-2">Message</div>
                <div className="p-3 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800">
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap text-sm">
                    {selectedSubmission.message}
                  </p>
                </div>
              </div>

              {/* Attachment */}
              {selectedSubmission.attachmentUrl && (
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-300 mb-2">Attachment</div>
                  <div className="p-3 border border-gray-200 dark:border-slate-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          📎 {selectedSubmission.attachmentName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedSubmission.attachmentSize ? formatFileSize(selectedSubmission.attachmentSize) : 'Unknown size'} • {selectedSubmission.attachmentType}
                        </div>
                      </div>
                      <a
                        href={selectedSubmission.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-green-600 text-white text-xs hover:bg-green-700"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Status and Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Status:</span>
                  <span className={`px-2 py-1 text-xs border ${
                    getStatusColor(selectedSubmission.status)
                  }`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                
                {selectedSubmission.status === 'PENDING' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        updateSubmissionStatus(selectedSubmission.id, 'REVIEWED');
                        setSelectedSubmission(null);
                      }}
                      className="px-3 py-1 text-sm bg-green-600 text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        updateSubmissionStatus(selectedSubmission.id, 'FLAGGED');
                        setSelectedSubmission(null);
                      }}
                      className="px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700"
                    >
                      Flag
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}