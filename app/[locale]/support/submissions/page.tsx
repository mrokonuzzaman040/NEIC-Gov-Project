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
  message: string;
  status: string;
  createdAt: string;
  attachmentUrl?: string | null;
  attachmentName?: string;
}

export default function SupportSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data for demonstration
    setSubmissions([
      {
        id: '1',
        name: 'John Doe',
        contact: '01712345678',
        email: 'john@example.com',
        message: 'Testing S3 file upload functionality with AWS environment properly configured.',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        attachmentUrl: 'https://rokon-neic.s3.ap-southeast-1.amazonaws.com/submissions/test.txt',
        attachmentName: 'test-upload.txt'
      }
    ] as any);
    setLoading(false);
  }, []);

  const filteredSubmissions = submissions.filter(sub => 
    !searchTerm || 
    sub.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">View Submissions</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredSubmissions.length} submissions (read-only access)
        </p>
      </div>

      {/* Search */}
      <div className="bg-gray-50 dark:bg-slate-700 p-4 border">
        <input
          type="text"
          placeholder="Search submissions..."
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
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Submitted: {new Date(submission.createdAt).toLocaleString()}
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
          <strong>Note:</strong> As a Management user, you can review and approve submissions. 
          Contact an Administrator for advanced features.
        </div>
      </div>
    </div>
  );
}
