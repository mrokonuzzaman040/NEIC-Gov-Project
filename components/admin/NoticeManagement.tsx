"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MegaphoneIcon,
  CalendarIcon,
  TagIcon,
  StarIcon,
  DocumentIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Notice {
  id: string;
  titleEn: string;
  titleBn: string;
  contentEn: string;
  contentBn: string;
  type: 'ANNOUNCEMENT' | 'WARNING' | 'INFORMATION' | 'URGENT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  publishedAt: string;
  expiresAt?: string;
  isActive: boolean;
  isPinned: boolean;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export default function NoticeManagementNew() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load notice data from API
  useEffect(() => {
    const loadNotices = async () => {
      try {
        const response = await fetch('/api/admin/notices');
        if (response.ok) {
          const data = await response.json();
          setNotices(data.notices || []);
        } else {
          setMessage({ type: 'error', text: 'Failed to load notices' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Error loading notices' });
      } finally {
        setIsLoading(false);
      }
    };

    loadNotices();
  }, []);

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'INFORMATION':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'URGENT':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const handleEditNotice = (noticeId: string) => {
    router.push(`/en/admin/settings/notices/${noticeId}`);
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        const response = await fetch(`/api/admin/notices?id=${noticeId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Notice deleted successfully!' });
          setNotices(notices.filter(notice => notice.id !== noticeId));
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: error.error || 'Failed to delete notice' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Network error. Please try again.' });
      }
    }
  };

  const handleToggleActive = async (noticeId: string) => {
    const notice = notices.find(n => n.id === noticeId);
    if (!notice) return;

    try {
      const response = await fetch('/api/admin/notices', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: noticeId,
          isActive: !notice.isActive,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Notice status updated!' });
        setNotices(notices.map(n => 
          n.id === noticeId ? { ...n, isActive: !n.isActive } : n
        ));
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleTogglePinned = async (noticeId: string) => {
    const notice = notices.find(n => n.id === noticeId);
    if (!notice) return;

    try {
      const response = await fetch('/api/admin/notices', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: noticeId,
          isPinned: !notice.isPinned,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Notice pin status updated!' });
        setNotices(notices.map(n => 
          n.id === noticeId ? { ...n, isPinned: !n.isPinned } : n
        ));
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update pin status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  // Filter notices based on search and filters
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = searchTerm === '' || 
      notice.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.titleBn.includes(searchTerm) ||
      notice.contentEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.contentBn.includes(searchTerm);
    
    const matchesType = selectedType === 'all' || notice.type === selectedType;
    const matchesPriority = selectedPriority === 'all' || notice.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'all' || notice.category === selectedCategory;
    
    return matchesSearch && matchesType && matchesPriority && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {filteredNotices.length} notice{filteredNotices.length !== 1 ? 's' : ''} total
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {notices.filter(n => n.isActive).length} active
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {notices.filter(n => n.isPinned).length} pinned
          </div>
        </div>
        <button
          onClick={() => router.push('/en/admin/settings/notices/new')}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Notice</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Search notices..."
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="ANNOUNCEMENT">Announcement</option>
          <option value="WARNING">Warning</option>
          <option value="INFORMATION">Information</option>
          <option value="URGENT">Urgent</option>
        </select>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="general">General</option>
          <option value="registration">Voter Registration</option>
          <option value="polling">Polling Stations</option>
          <option value="nomination">Candidate Nomination</option>
          <option value="schedule">Election Schedule</option>
          <option value="education">Voter Education</option>
          <option value="conduct">Code of Conduct</option>
          <option value="media">Media Guidelines</option>
          <option value="security">Security</option>
          <option value="observers">Election Observers</option>
          <option value="technology">Election Technology</option>
        </select>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <p className={`text-sm font-medium ${
            message.type === 'success' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.map((notice) => (
          <div key={notice.id} className={`bg-white dark:bg-slate-800 rounded-xl border shadow-sm ${
            notice.isPinned ? 'border-yellow-300 dark:border-yellow-600' : 'border-slate-200 dark:border-slate-700'
          }`}>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    notice.type === 'URGENT' ? 'bg-red-500' :
                    notice.type === 'WARNING' ? 'bg-yellow-500' :
                    notice.type === 'ANNOUNCEMENT' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}>
                    <MegaphoneIcon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {notice.titleEn}
                      </h3>
                      {notice.isPinned && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                          <StarIcon className="h-3 w-3 mr-1" />
                          Pinned
                        </span>
                      )}
                      {!notice.isActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
                          Inactive
                        </span>
                      )}
                      {isExpired(notice.expiresAt) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                          Expired
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {notice.titleBn}
                    </p>
                    
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                      {notice.contentEn.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(notice.type)}`}>
                        <TagIcon className="h-3 w-3 mr-1" />
                        {notice.type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(notice.priority)}`}>
                        {notice.priority}
                      </span>
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Published: {new Date(notice.publishedAt).toLocaleDateString()}
                      </div>
                      {notice.expiresAt && (
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Expires: {new Date(notice.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    {notice.attachments.length > 0 && (
                      <div className="mt-3 flex items-center space-x-2">
                        <DocumentIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {notice.attachments.length} attachment{notice.attachments.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEditNotice(notice.id)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                    title="Edit Notice"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleTogglePinned(notice.id)}
                    className={`p-1 ${notice.isPinned ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400'}`}
                    title={notice.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <StarIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(notice.id)}
                    className={`p-1 ${notice.isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400 hover:text-green-600 dark:hover:text-green-400'}`}
                    title={notice.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                    title="Delete Notice"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotices.length === 0 && (
        <div className="text-center py-12">
          <MegaphoneIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No notices</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchTerm || selectedType !== 'all' || selectedPriority !== 'all' || selectedCategory !== 'all'
              ? 'No notices match your search criteria.' 
              : 'Get started by creating a new notice.'}
          </p>
          {(!searchTerm && selectedType === 'all' && selectedPriority === 'all' && selectedCategory === 'all') && (
            <div className="mt-6">
              <button
                onClick={() => router.push('/en/admin/settings/notices/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Notice
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
