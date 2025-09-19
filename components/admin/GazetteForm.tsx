"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  DocumentIcon,
  CalendarIcon,
  TagIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Gazette {
  id: string;
  titleEn: string;
  titleBn: string;
  gazetteNumber: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  publishedAt: string;
  downloadUrl: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GazetteFormProps {
  gazetteId: string;
}

const CATEGORIES = [
  { value: 'formation', label: 'Formation' },
  { value: 'terms', label: 'Terms' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'powers', label: 'Powers' },
  { value: 'procedures', label: 'Procedures' },
  { value: 'general', label: 'General' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export default function GazetteForm({ gazetteId }: GazetteFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(gazetteId !== 'new');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    titleEn: '',
    titleBn: '',
    gazetteNumber: '',
    category: 'general',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    publishedAt: new Date().toISOString().split('T')[0],
    downloadUrl: '',
    description: '',
    isActive: true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const isEditing = gazetteId !== 'new';

  // Load existing gazette data if editing
  useEffect(() => {
    if (gazetteId !== 'new') {
      const loadGazette = async () => {
        try {
          setIsLoadingData(true);
          setError(null);
          
          const response = await fetch(`/api/admin/commission/gazettes?id=${gazetteId}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch gazette: ${response.status}`);
          }
          
          const data = await response.json();
          const gazette = data.gazette;
          
          setFormData({
            titleEn: gazette.titleEn || '',
            titleBn: gazette.titleBn || '',
            gazetteNumber: gazette.gazetteNumber || '',
            category: gazette.category || 'general',
            priority: gazette.priority || 'MEDIUM',
            publishedAt: gazette.publishedAt ? new Date(gazette.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            downloadUrl: gazette.downloadUrl || '',
            description: gazette.description || '',
            isActive: gazette.isActive !== undefined ? gazette.isActive : true,
          });
        } catch (error) {
          console.error('Error loading gazette:', error);
          setError(error instanceof Error ? error.message : 'Failed to load gazette');
        } finally {
          setIsLoadingData(false);
        }
      };

      loadGazette();
    }
  }, [gazetteId]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type - only PDF files
      if (file.type !== 'application/pdf') {
        setError('Invalid file type. Only PDF files are allowed.');
        return;
      }

      // Validate file size (50MB max for gazettes)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size too large. Maximum size is 50MB.');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Clear downloadUrl error if it exists
      if (errors.downloadUrl) {
        setErrors(prev => ({
          ...prev,
          downloadUrl: ''
        }));
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titleEn.trim()) newErrors.titleEn = 'English title is required';
    if (!formData.titleBn.trim()) newErrors.titleBn = 'Bengali title is required';
    if (!formData.gazetteNumber.trim()) newErrors.gazetteNumber = 'Gazette number is required';
    
    // For new gazettes, require either a file or existing download URL
    // For editing, allow keeping existing file
    if (!isEditing && !selectedFile) {
      newErrors.downloadUrl = 'PDF file is required for new gazettes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      if (isEditing) {
        submitData.append('id', gazetteId);
      }
      
      submitData.append('titleEn', formData.titleEn.trim());
      submitData.append('titleBn', formData.titleBn.trim());
      submitData.append('gazetteNumber', formData.gazetteNumber.trim());
      submitData.append('category', formData.category);
      submitData.append('priority', formData.priority);
      submitData.append('publishedAt', formData.publishedAt);
      submitData.append('description', formData.description.trim());
      submitData.append('isActive', formData.isActive.toString());
      
      if (selectedFile) {
        submitData.append('file', selectedFile);
      } else if (isEditing && formData.downloadUrl) {
        // Keep existing file for edits when no new file is selected
        submitData.append('existingDownloadUrl', formData.downloadUrl);
      }

      const response = await fetch('/api/admin/commission/gazettes', {
        method: isEditing ? 'PUT' : 'POST',
        body: submitData, // Send FormData directly for file upload
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Gazette saved successfully!' });
        setTimeout(() => {
          router.push('/en/admin/commission/gazettes');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save gazette' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading gazette...</p>
        </div>
      </div>
    );
  }

  if (isEditing && error && !formData.titleEn) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Error Loading Gazette
            </h3>
            <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
            <button
              onClick={() => router.push('/en/admin/commission/gazettes')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Back to Gazettes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push('/en/admin/commission/gazettes')}
          className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Gazettes</span>
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
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Gazette Number *
              </label>
              <input
                type="text"
                value={formData.gazetteNumber}
                onChange={(e) => handleInputChange('gazetteNumber', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.gazetteNumber ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="e.g., SRO-123/2024"
              />
              {errors.gazetteNumber && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.gazetteNumber}</p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unique identifier for this gazette (e.g., SRO-123/2024)
              </p>
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <TagIcon className="h-5 w-5 mr-2" />
              Classification
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  Published Date
                </label>
                <input
                  type="date"
                  value={formData.publishedAt}
                  onChange={(e) => handleInputChange('publishedAt', e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <DocumentIcon className="h-5 w-5 mr-2" />
              Document
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  PDF Document {!isEditing && <span className="text-red-500">*</span>}
                </label>
                
                {/* File Input */}
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    {selectedFile ? (
                      <div className="relative">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                          <DocumentIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="mt-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <>
                        <DocumentIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600 dark:text-slate-400">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                            <span>Upload PDF document</span>
                            <input
                              ref={fileInputRef}
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,application/pdf"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          PDF up to 50MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {errors.downloadUrl && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.downloadUrl}</p>
                )}
              </div>

              {/* Current file display for editing */}
              {isEditing && formData.downloadUrl && !selectedFile && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <DocumentIcon className="h-6 w-6 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          Current Document
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Uploaded document available
                        </p>
                      </div>
                    </div>
                    <a
                      href={formData.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
                    >
                      View Current
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Brief description of the gazette content..."
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-slate-700 dark:text-slate-300 flex items-center">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Active
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => router.push('/en/admin/commission/gazettes')}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>{gazetteId === 'new' ? 'Create Gazette' : 'Update Gazette'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
