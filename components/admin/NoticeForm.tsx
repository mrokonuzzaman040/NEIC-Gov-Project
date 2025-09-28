"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  MegaphoneIcon,
  TagIcon,
  CalendarIcon,
  DocumentIcon,
  StarIcon,
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
}

interface NoticeFormProps {
  noticeId: string;
}

const NOTICE_TYPES = [
  { value: 'ANNOUNCEMENT', label: 'Announcement', color: 'blue' },
  { value: 'WARNING', label: 'Warning', color: 'yellow' },
  { value: 'INFORMATION', label: 'Information', color: 'green' },
  { value: 'URGENT', label: 'Urgent', color: 'red' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'gray' },
  { value: 'MEDIUM', label: 'Medium', color: 'yellow' },
  { value: 'HIGH', label: 'High', color: 'orange' },
  { value: 'CRITICAL', label: 'Critical', color: 'red' },
];

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'registration', label: 'Voter Registration' },
  { value: 'polling', label: 'Polling Stations' },
  { value: 'nomination', label: 'Candidate Nomination' },
  { value: 'schedule', label: 'Election Schedule' },
  { value: 'education', label: 'Voter Education' },
  { value: 'conduct', label: 'Code of Conduct' },
  { value: 'media', label: 'Media Guidelines' },
  { value: 'security', label: 'Security' },
  { value: 'observers', label: 'Election Observers' },
  { value: 'technology', label: 'Election Technology' },
];

export default function NoticeForm({ noticeId }: NoticeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(noticeId !== 'new');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    titleEn: '',
    titleBn: '',
    contentEn: '',
    contentBn: '',
    type: 'INFORMATION' as const,
    priority: 'MEDIUM' as const,
    category: 'general',
    publishedAt: new Date().toISOString().split('T')[0],
    expiresAt: '',
    isActive: true,
    isPinned: false,
    attachments: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachmentInput, setAttachmentInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);

  // Load existing notice data if editing
  useEffect(() => {
    if (noticeId !== 'new') {
      const loadNotice = async () => {
        try {
          const response = await fetch(`/api/admin/notices?id=${noticeId}`);
          if (response.ok) {
            const data = await response.json();
            const notice = data.notice;
            setFormData({
              titleEn: notice.titleEn || '',
              titleBn: notice.titleBn || '',
              contentEn: notice.contentEn || '',
              contentBn: notice.contentBn || '',
              type: notice.type || 'INFORMATION',
              priority: notice.priority || 'MEDIUM',
              category: notice.category || 'general',
              publishedAt: notice.publishedAt ? new Date(notice.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              expiresAt: notice.expiresAt ? new Date(notice.expiresAt).toISOString().split('T')[0] : '',
              isActive: notice.isActive !== undefined ? notice.isActive : true,
              isPinned: notice.isPinned || false,
              attachments: notice.attachments || [],
            });
          } else {
            setMessage({ type: 'error', text: 'Failed to load notice' });
          }
        } catch (error) {
          setMessage({ type: 'error', text: 'Error loading notice' });
        } finally {
          setIsLoadingData(false);
        }
      };

      loadNotice();
    }
  }, [noticeId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddAttachment = () => {
    if (attachmentInput.trim() && !formData.attachments.includes(attachmentInput.trim())) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, attachmentInput.trim()]
      }));
      setAttachmentInput('');
    }
  };

  const handleRemoveAttachment = (attachmentToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(attachment => attachment !== attachmentToRemove)
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      setMessage({ type: 'error', text: 'Only PDF files are allowed for attachments.' });
      return;
    }

    // Check file sizes (max 10MB per file)
    const oversizedFiles = pdfFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setMessage({ type: 'error', text: 'File size must be less than 10MB.' });
      return;
    }

    setSelectedFiles(prev => [...prev, ...pdfFiles]);
    setMessage(null);
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setSelectedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'notices');
      formData.append('folder', 'notices');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to upload ${file.name}`);
      }

      const data = await response.json();
      return data.url;
    });

    return Promise.all(uploadPromises);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titleEn.trim()) newErrors.titleEn = 'English title is required';
    if (!formData.titleBn.trim()) newErrors.titleBn = 'Bengali title is required';
    if (!formData.contentEn.trim()) newErrors.contentEn = 'English content is required';
    if (!formData.contentBn.trim()) newErrors.contentBn = 'Bengali content is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      let finalAttachments = [...formData.attachments];

      // Upload selected files if any
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        try {
          const uploadedUrls = await uploadFiles(selectedFiles);
          finalAttachments = [...finalAttachments, ...uploadedUrls];
        } catch (uploadError) {
          setMessage({ type: 'error', text: 'Failed to upload files. Please try again.' });
          return;
        } finally {
          setUploadingFiles(false);
        }
      }

      const url = noticeId === 'new' ? '/api/admin/notices' : '/api/admin/notices';
      const method = noticeId === 'new' ? 'POST' : 'PUT';
      
      const payload = noticeId === 'new' 
        ? { ...formData, attachments: finalAttachments }
        : { id: noticeId, ...formData, attachments: finalAttachments };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Notice saved successfully!' });
        setTimeout(() => {
          router.push('/en/admin/settings/notices');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save notice' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading notice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push('/en/admin/settings/notices')}
          className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Notice Management</span>
        </button>
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

      {/* Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <MegaphoneIcon className="h-5 w-5 mr-2" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Title (English) *
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => handleInputChange('titleEn', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.titleEn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="Enter English title"
                />
                {errors.titleEn && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.titleEn}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Title (Bengali) *
                </label>
                <input
                  type="text"
                  value={formData.titleBn}
                  onChange={(e) => handleInputChange('titleBn', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.titleBn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="বাংলা শিরোনাম লিখুন"
                />
                {errors.titleBn && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.titleBn}</p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <DocumentIcon className="h-5 w-5 mr-2" />
              Content
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Content (English) *
                </label>
                <textarea
                  value={formData.contentEn}
                  onChange={(e) => handleInputChange('contentEn', e.target.value)}
                  rows={8}
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.contentEn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="Enter English content"
                />
                {errors.contentEn && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.contentEn}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Content (Bengali) *
                </label>
                <textarea
                  value={formData.contentBn}
                  onChange={(e) => handleInputChange('contentBn', e.target.value)}
                  rows={8}
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.contentBn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="বাংলা বিষয়বস্তু লিখুন"
                />
                {errors.contentBn && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.contentBn}</p>
                )}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <TagIcon className="h-5 w-5 mr-2" />
              Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {NOTICE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Published Date
                </label>
                <input
                  type="date"
                  value={formData.publishedAt}
                  onChange={(e) => handleInputChange('publishedAt', e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Leave empty for no expiration
                </p>
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Attachments
              </label>
              
              {/* File Upload Section */}
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-green-400 transition-colors bg-slate-50 dark:bg-slate-700">
                  <input
                    type="file"
                    id="pdf-upload"
                    accept=".pdf"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Click to upload PDF files
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Max 10MB per file
                      </span>
                    </div>
                  </label>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Selected Files:</h4>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{file.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* URL Attachments */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">URL Attachments:</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.attachments.map((attachment) => (
                    <span
                      key={attachment}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    >
                      {attachment}
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(attachment)}
                        className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={attachmentInput}
                    onChange={(e) => setAttachmentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAttachment())}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Add attachment URL and press Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add URL
                  </button>
                </div>
              </div>
            </div>

            {/* Status Options */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => handleInputChange('isPinned', e.target.checked)}
                  className="rounded border-slate-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="ml-2 text-sm text-slate-700 dark:text-slate-300 flex items-center">
                  <StarIcon className="h-4 w-4 mr-1" />
                  Pin Notice
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                  Active
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => router.push('/en/admin/settings/notices')}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || uploadingFiles}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {uploadingFiles ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading files...</span>
                </>
              ) : isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <MegaphoneIcon className="h-4 w-4" />
                  <span>{noticeId === 'new' ? 'Create Notice' : 'Update Notice'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
