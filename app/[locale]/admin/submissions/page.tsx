'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

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
  district: string | null;
  seatName: string | null;
  message: string;
  locale: string;
  status: string;
  source: string;
  createdAt: string;
  updatedAt: string;
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
  
  // Advanced filtering states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  
  // Bulk selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

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
      submission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.seatName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Advanced filters
    const matchesDateFrom = !dateFrom || new Date(submission.createdAt) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(submission.createdAt) <= new Date(dateTo + 'T23:59:59');
    const matchesDistrict = !districtFilter || submission.district?.toLowerCase().includes(districtFilter.toLowerCase());
    const matchesSource = !sourceFilter || submission.source.toLowerCase().includes(sourceFilter.toLowerCase());
    
    return matchesFilter && matchesSearch && matchesDateFrom && matchesDateTo && matchesDistrict && matchesSource;
  });

  // Get unique districts and sources for filter dropdowns
  const uniqueDistricts = [...new Set(submissions.map(s => s.district).filter(Boolean))] as string[];
  const uniqueSources = [...new Set(submissions.map(s => s.source))];

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(filteredSubmissions.map(s => s.id));
      setSelectedIds(allIds);
      setSelectAll(true);
    }
  };

  const handleSelectSubmission = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(newSelected.size === filteredSubmissions.length);
  };

  // CSV download functionality
  const downloadCSV = () => {
    const selectedSubmissions = filteredSubmissions.filter(s => selectedIds.has(s.id));
    
    if (selectedSubmissions.length === 0) {
      alert('Please select at least one submission to download.');
      return;
    }

    const csvHeaders = [
      'ID',
      'Name',
      'Contact',
      'Email',
      'District',
      'Seat Name',
      'Message',
      'Status',
      'Source',
      'Language',
      'Created At',
      'Updated At',
      'Attachment Name',
      'Attachment Size',
      'Attachment Type'
    ];

    const csvData = selectedSubmissions.map(submission => [
      submission.id,
      submission.name || '',
      submission.contact || '',
      submission.email || '',
      submission.district || '',
      submission.seatName || '',
      `"${submission.message.replace(/"/g, '""')}"`, // Escape quotes in message
      submission.status,
      submission.source,
      submission.locale,
      submission.createdAt,
      submission.updatedAt,
      submission.attachmentName || '',
      submission.attachmentSize || '',
      submission.attachmentType || ''
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `submissions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div className="flex flex-col gap-4">
          {/* Basic Filters Row */}
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
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, contact, district, seat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-1 border border-gray-300 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                />
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:bg-slate-600 dark:text-gray-300 dark:border-slate-500 dark:hover:bg-slate-500"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Advanced</span>
            </button>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={downloadCSV}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white hover:bg-green-700 rounded"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  <span>Download CSV</span>
                </button>
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-gray-200 dark:border-slate-600">
              {/* Date From */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  From Date
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="block w-full pl-10 pr-3 py-1 border border-gray-300 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                  />
                </div>
              </div>

              {/* Date To */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  To Date
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="block w-full pl-10 pr-3 py-1 border border-gray-300 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                  />
                </div>
              </div>

              {/* District Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  District
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="block w-full px-3 py-1 border border-gray-300 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                >
                  <option value="">All Districts</option>
                  {uniqueDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Source
                </label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="block w-full px-3 py-1 border border-gray-300 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                >
                  <option value="">All Sources</option>
                  {uniqueSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600">
        <table className="min-w-full">
          <thead className="bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                Contact
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                Location
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                Message
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                File
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                Source
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
                  <input
                    type="checkbox"
                    checked={selectedIds.has(submission.id)}
                    onChange={() => handleSelectSubmission(submission.id)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </td>
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
                  <div className="text-xs">
                    {submission.district && (
                      <div className="font-medium text-blue-600 dark:text-blue-400">{submission.district}</div>
                    )}
                    {submission.seatName && (
                      <div className="text-gray-500 dark:text-gray-400">{submission.seatName}</div>
                    )}
                    {!submission.district && !submission.seatName && (
                      <span className="text-gray-400">—</span>
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
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                    {submission.source}
                  </span>
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
                <td colSpan={9} className="px-4 py-8 text-center">
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
              <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-slate-700">
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-300">Submitted</div>
                  <div className="text-gray-900 dark:text-gray-100">{formatDate(selectedSubmission.createdAt)}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-300">Language</div>
                  <div className="text-gray-900 dark:text-gray-100">{selectedSubmission.locale.toUpperCase()}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-600 dark:text-gray-300">Source</div>
                  <div className="text-gray-900 dark:text-gray-100">
                    <span className="inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                      {selectedSubmission.source}
                    </span>
                  </div>
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

              {/* Location Info */}
              {(selectedSubmission.district || selectedSubmission.seatName) && (
                <div className="grid grid-cols-2 gap-4 p-3 border border-gray-200 dark:border-slate-600">
                  {selectedSubmission.district && (
                    <div>
                      <div className="font-medium text-gray-600 dark:text-gray-300">District</div>
                      <div className="text-blue-600 dark:text-blue-400 font-medium">{selectedSubmission.district}</div>
                    </div>
                  )}
                  {selectedSubmission.seatName && (
                    <div>
                      <div className="font-medium text-gray-600 dark:text-gray-300">Seat Name</div>
                      <div className="text-gray-900 dark:text-gray-100">{selectedSubmission.seatName}</div>
                    </div>
                  )}
                </div>
              )}

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