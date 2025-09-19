"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { 
  PhotoIcon, 
  XMarkIcon,
  PlusIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface GalleryItem {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string | null;
  descriptionBn: string | null;
  imageUrl: string;
  imageKey: string;
  category: string;
  tags: string[];
  featured: boolean;
  order: number;
}

interface GalleryFormProps {
  itemId?: string;
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'events', label: 'Events' },
  { value: 'meetings', label: 'Meetings' },
  { value: 'activities', label: 'Activities' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'team', label: 'Team' },
  { value: 'achievements', label: 'Achievements' },
];

export default function GalleryForm({ itemId }: GalleryFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleBn: '',
    descriptionEn: '',
    descriptionBn: '',
    category: 'general',
    tags: [] as string[],
    featured: false,
    order: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItem, setIsLoadingItem] = useState(!!itemId);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!itemId;

  // Load item data for editing
  useEffect(() => {
    if (itemId) {
      const loadItem = async () => {
        try {
          setIsLoadingItem(true);
          setError(null);
          
          const response = await fetch(`/api/admin/gallery/${itemId}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch gallery item: ${response.status}`);
          }
          
          const itemData = await response.json();
          setItem(itemData);
          setFormData({
            titleEn: itemData.titleEn,
            titleBn: itemData.titleBn,
            descriptionEn: itemData.descriptionEn || '',
            descriptionBn: itemData.descriptionBn || '',
            category: itemData.category,
            tags: itemData.tags || [],
            featured: itemData.featured,
            order: itemData.order,
          });
          setPreviewUrl(itemData.imageUrl);
        } catch (error) {
          console.error('Error loading gallery item:', error);
          setError(error instanceof Error ? error.message : 'Failed to load gallery item');
        } finally {
          setIsLoadingItem(false);
        }
      };

      loadItem();
    }
  }, [itemId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only JPEG, PNG, WebP, and GIF files are allowed.');
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size too large. Maximum size is 10MB.');
        return;
      }

      setSelectedFile(file);
      setError(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(isEditing && item ? item.imageUrl : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.titleEn.trim() || !formData.titleBn.trim()) {
        throw new Error('English and Bengali titles are required');
      }

      if (!isEditing && !selectedFile) {
        throw new Error('Image file is required for new gallery items');
      }

      const submitData = new FormData();
      
      if (isEditing) {
        submitData.append('id', itemId!);
      }
      
      submitData.append('titleEn', formData.titleEn.trim());
      submitData.append('titleBn', formData.titleBn.trim());
      submitData.append('descriptionEn', formData.descriptionEn.trim());
      submitData.append('descriptionBn', formData.descriptionBn.trim());
      submitData.append('category', formData.category);
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('featured', formData.featured.toString());
      submitData.append('order', formData.order.toString());
      
      if (selectedFile) {
        submitData.append('file', selectedFile);
      }

      const response = await fetch('/api/admin/gallery', {
        method: isEditing ? 'PUT' : 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} gallery item`);
      }

      // Success - redirect to gallery management
      router.push('/en/admin/gallery');
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingItem) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading gallery item...</p>
        </div>
      </div>
    );
  }

  if (isEditing && error && !item) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Error Loading Gallery Item
            </h3>
            <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
            <Link
              href={`/${locale}/admin/gallery`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Image {!isEditing && <span className="text-red-500">*</span>}
                </label>
                
                {/* File Input */}
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    {previewUrl ? (
                      <div className="relative">
                        <div className="relative w-48 h-48 mx-auto">
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
                    )}
                    
                    <div className="flex text-sm text-slate-600 dark:text-slate-400">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                        <span>{previewUrl ? 'Change image' : 'Upload an image'}</span>
                        <input
                          ref={fileInputRef}
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      PNG, JPG, WebP, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* English Title */}
              <div>
                <label htmlFor="titleEn" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  English Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="titleEn"
                  name="titleEn"
                  value={formData.titleEn}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter English title"
                  required
                />
              </div>

              {/* Bengali Title */}
              <div>
                <label htmlFor="titleBn" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Bengali Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="titleBn"
                  name="titleBn"
                  value={formData.titleBn}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="বাংলা শিরোনাম লিখুন"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order and Featured */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    min="0"
                  />
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="rounded border-slate-300 dark:border-slate-600 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300 flex items-center">
                      <StarIcon className="h-4 w-4 mr-1" />
                      Featured
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="descriptionEn" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                English Description
              </label>
              <textarea
                id="descriptionEn"
                name="descriptionEn"
                value={formData.descriptionEn}
                onChange={handleInputChange}
                rows={4}
                className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter English description (optional)"
              />
            </div>

            <div>
              <label htmlFor="descriptionBn" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Bengali Description
              </label>
              <textarea
                id="descriptionBn"
                name="descriptionBn"
                value={formData.descriptionBn}
                onChange={handleInputChange}
                rows={4}
                className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="বাংলা বিবরণ লিখুন (ঐচ্ছিক)"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Link
              href="/en/admin/gallery"
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>
                {isLoading 
                  ? (isEditing ? 'Updating...' : 'Creating...')
                  : (isEditing ? 'Update Item' : 'Create Item')
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
