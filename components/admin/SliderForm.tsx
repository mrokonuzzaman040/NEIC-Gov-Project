"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  XMarkIcon,
  PhotoIcon,
  LinkIcon,
  TagIcon,
  StarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface SliderFormData {
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  image: string;
  imageKey?: string;
  link: string;
  buttonTextEn: string;
  buttonTextBn: string;
  categoryEn: string;
  categoryBn: string;
  featured: boolean;
  order: number;
}

interface SliderFormProps {
  slider?: (SliderFormData & { id?: string }) | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

const CATEGORIES = [
  { en: 'Transparency', bn: 'স্বচ্ছতা' },
  { en: 'Security', bn: 'নিরাপত্তা' },
  { en: 'Engagement', bn: 'অংশগ্রহণ' },
  { en: 'Technology', bn: 'প্রযুক্তি' },
  { en: 'Consultation', bn: 'পরামর্শ' },
  { en: 'News', bn: 'খবর' },
  { en: 'Updates', bn: 'আপডেট' },
];

export default function SliderForm({ slider, isOpen, onClose, onSave, isLoading = false }: SliderFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<SliderFormData>({
    titleEn: '',
    titleBn: '',
    descriptionEn: '',
    descriptionBn: '',
    image: '',
    imageKey: '',
    link: '',
    buttonTextEn: 'Learn More',
    buttonTextBn: 'আরও জানুন',
    categoryEn: 'News',
    categoryBn: 'খবর',
    featured: false,
    order: 0,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<SliderFormData>>({});
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!slider;

  // Initialize form data when slider prop changes
  useEffect(() => {
    if (slider) {
      setFormData({
        ...slider,
        imageKey: (slider as any).imageKey || ''
      });
      setPreviewUrl(slider.image);
    } else {
      setFormData({
        titleEn: '',
        titleBn: '',
        descriptionEn: '',
        descriptionBn: '',
        image: '',
        imageKey: '',
        link: '',
        buttonTextEn: 'Learn More',
        buttonTextBn: 'আরও জানুন',
        categoryEn: 'News',
        categoryBn: 'খবর',
        featured: false,
        order: 0,
      });
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setErrors({});
    setError(null);
  }, [slider]);

  const handleInputChange = (field: keyof SliderFormData, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleCategoryChange = (categoryEn: string) => {
    const category = CATEGORIES.find(c => c.en === categoryEn);
    if (category) {
      setFormData(prev => ({
        ...prev,
        categoryEn: category.en,
        categoryBn: category.bn
      }));
    }
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

      // Clear image URL error if it exists
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: undefined
        }));
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(isEditing && slider ? slider.image : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SliderFormData> = {};

    if (!formData.titleEn.trim()) newErrors.titleEn = 'English title is required';
    if (!formData.titleBn.trim()) newErrors.titleBn = 'Bengali title is required';
    if (!formData.descriptionEn.trim()) newErrors.descriptionEn = 'English description is required';
    if (!formData.descriptionBn.trim()) newErrors.descriptionBn = 'Bengali description is required';
    
    // For new sliders, require either a file or existing image URL
    // For editing, allow keeping existing image
    if (!isEditing && !selectedFile) {
      newErrors.image = 'Image file is required for new sliders';
    }
    
    if (!formData.link.trim()) newErrors.link = 'Link is required';
    if (!formData.buttonTextEn.trim()) newErrors.buttonTextEn = 'English button text is required';
    if (!formData.buttonTextBn.trim()) newErrors.buttonTextBn = 'Bengali button text is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      if (isEditing && slider?.id) {
        submitData.append('id', slider.id);
      }
      
      submitData.append('titleEn', formData.titleEn.trim());
      submitData.append('titleBn', formData.titleBn.trim());
      submitData.append('descriptionEn', formData.descriptionEn.trim());
      submitData.append('descriptionBn', formData.descriptionBn.trim());
      submitData.append('link', formData.link.trim());
      submitData.append('buttonTextEn', formData.buttonTextEn.trim());
      submitData.append('buttonTextBn', formData.buttonTextBn.trim());
      submitData.append('categoryEn', formData.categoryEn);
      submitData.append('categoryBn', formData.categoryBn);
      submitData.append('featured', formData.featured.toString());
      submitData.append('order', formData.order.toString());
      
      if (selectedFile) {
        submitData.append('file', selectedFile);
      } else if (isEditing && formData.image) {
        // Keep existing image for edits when no new file is selected
        submitData.append('existingImage', formData.image);
        if (formData.imageKey) {
          submitData.append('existingImageKey', formData.imageKey);
        }
      }

      await onSave(submitData);
    } catch (error) {
      console.error('Error saving slider:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {slider ? 'Edit Slider' : 'Add New Slider'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}
          {/* Title Fields */}
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

          {/* Description Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description (English) *
              </label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                rows={4}
                className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.descriptionEn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter English description"
              />
              {errors.descriptionEn && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.descriptionEn}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description (Bengali) *
              </label>
              <textarea
                value={formData.descriptionBn}
                onChange={(e) => handleInputChange('descriptionBn', e.target.value)}
                rows={4}
                className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.descriptionBn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="বাংলা বর্ণনা লিখুন"
              />
              {errors.descriptionBn && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.descriptionBn}</p>
              )}
            </div>
          </div>

          {/* Image Upload and Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="relative w-48 h-32 mx-auto">
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
                {errors.image && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.image}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Link *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.link ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="/blog/article-name"
                />
              </div>
              {errors.link && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.link}</p>
              )}
            </div>
          </div>

          {/* Button Text Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Button Text (English) *
              </label>
              <input
                type="text"
                value={formData.buttonTextEn}
                onChange={(e) => handleInputChange('buttonTextEn', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.buttonTextEn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Learn More"
              />
              {errors.buttonTextEn && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.buttonTextEn}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Button Text (Bengali) *
              </label>
              <input
                type="text"
                value={formData.buttonTextBn}
                onChange={(e) => handleInputChange('buttonTextBn', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.buttonTextBn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="আরও জানুন"
              />
              {errors.buttonTextBn && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.buttonTextBn}</p>
              )}
            </div>
          </div>

          {/* Category and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TagIcon className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  value={formData.categoryEn}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.en} value={category.en}>
                      {category.en} / {category.bn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Settings
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-slate-700 dark:text-slate-300 flex items-center">
                    <StarIcon className="h-4 w-4 mr-1" />
                    Featured
                  </span>
                </label>
              </div>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : (slider ? 'Update Slider' : 'Create Slider')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
