'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering to prevent build-time API calls
export const dynamic = 'force-dynamic';

// Simplified submissions view for Management role
interface Submission {
  id: string;
  name: string | null;
  contact: string;
  email?: string;
  message: string;
  status: string;
  createdAt: string;
  attachmentUrl?: string | null;
  attachmentName?: string;
  attachmentSize?: number | null;
  attachmentType?: string | null;
}

export default function ManagementSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'flagged' | 'reviewed'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/submissions');
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update submission status');
      }

      setSubmissions(prev => 
        prev.map(sub => sub.id === id ? { ...sub, status } : sub)
      );
    } catch (error) {
      console.error('Error updating submission status:', error);
      alert('Failed to update submission status');
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredSubmissions = submissions.filter(sub => 
    filter === 'all' || sub.status.toLowerCase() === filter
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

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Error Loading Submissions</h3>
            <p className="text-red-800 dark:text-red-200 mt-1">{error}</p>
            <button
              onClick={fetchSubmissions}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Header */}
      <div className="border-l-4 border-green-600 bg-white dark:bg-slate-800 pl-4 py-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Submission Review</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredSubmissions.length} submissions for review
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-slate-700 p-4 border">
        <div className="flex space-x-1">
          {['all', 'pending', 'flagged', 'reviewed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3 py-1 text-sm border transition-colors ${
                filter === status
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-slate-600 dark:text-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
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
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {submission.email}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {submission.message}
                </p>

                {/* File Attachment */}
                {submission.attachmentUrl && (
                  <div className="flex items-center space-x-2 mb-2 p-2 bg-slate-50 dark:bg-slate-700 rounded">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {submission.attachmentName}
                    </span>
                    {submission.attachmentSize && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({formatFileSize(submission.attachmentSize)})
                      </span>
                    )}
                    <button
                      onClick={() => handleDownload(submission.attachmentUrl!, submission.attachmentName || 'attachment')}
                      className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
                    >
                      Download
                    </button>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(submission.createdAt).toLocaleString()}
                </div>
              </div>
              
              <div className="ml-4 flex flex-col space-y-2">
                <div className="flex space-x-1 mb-2">
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="px-2 py-1 text-xs bg-slate-600 text-white hover:bg-slate-700 rounded transition-colors"
                  >
                    View Details
                  </button>
                </div>

                <span className={`px-2 py-1 text-xs border text-center rounded ${
                  submission.status === 'PENDING' 
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                    : submission.status === 'REVIEWED'
                    ? 'bg-green-50 text-green-700 border-green-300'
                    : 'bg-red-50 text-red-700 border-red-300'
                }`}>
                  {submission.status}
                </span>
                
                {submission.status === 'PENDING' && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => updateStatus(submission.id, 'REVIEWED')}
                      className="px-2 py-1 text-xs bg-green-600 text-white hover:bg-green-700 rounded transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(submission.id, 'FLAGGED')}
                      className="px-2 py-1 text-xs bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
                    >
                      Flag
                    </button>
                  </div>
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
            <div className="text-xs mt-1">Try changing the filter or check back later</div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Submission Details
                </h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                  <p className="text-slate-900 dark:text-slate-100">{selectedSubmission.name || 'Anonymous'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contact</label>
                  <p className="text-slate-900 dark:text-slate-100">{selectedSubmission.contact}</p>
                </div>
                
                {selectedSubmission.email && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <p className="text-slate-900 dark:text-slate-100">{selectedSubmission.email}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                  <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
                
                {selectedSubmission.attachmentUrl && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Attachment</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-slate-900 dark:text-slate-100">{selectedSubmission.attachmentName}</span>
                      {selectedSubmission.attachmentSize && (
                        <span className="text-sm text-slate-500">({formatFileSize(selectedSubmission.attachmentSize)})</span>
                      )}
                      <button
                        onClick={() => handleDownload(selectedSubmission.attachmentUrl!, selectedSubmission.attachmentName || 'attachment')}
                        className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedSubmission.status === 'PENDING' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedSubmission.status === 'REVIEWED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Submitted</label>
                  <p className="text-slate-900 dark:text-slate-100">{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                {selectedSubmission.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        updateStatus(selectedSubmission.id, 'REVIEWED');
                        setSelectedSubmission(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        updateStatus(selectedSubmission.id, 'FLAGGED');
                        setSelectedSubmission(null);
                      }}
                      className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
                    >
                      Flag
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
