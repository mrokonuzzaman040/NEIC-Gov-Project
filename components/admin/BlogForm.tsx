"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  PhotoIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface BlogPost {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string;
  excerptEn: string;
  excerptBn: string;
  contentEn: string;
  contentBn: string;
  authorEn: string;
  authorBn: string;
  category: string;
  image: string;
  tags: string[];
  featured: boolean;
  isActive: boolean;
  readTime: number;
  publishedAt: string;
}

interface BlogFormProps {
  postId: string;
}

const CATEGORIES = [
  { value: 'electoral', label: 'Electoral Process' },
  { value: 'technology', label: 'Technology' },
  { value: 'rights', label: 'Citizen Rights' },
  { value: 'transparency', label: 'Transparency' },
  { value: 'security', label: 'Security' },
  { value: 'general', label: 'General' },
];

export default function BlogForm({ postId }: BlogFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(postId !== 'new');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    slug: '',
    titleEn: '',
    titleBn: '',
    excerptEn: '',
    excerptBn: '',
    contentEn: '',
    contentBn: '',
    authorEn: 'Election Commission',
    authorBn: 'নির্বাচন কমিশন',
    category: 'general',
    image: '',
    tags: [] as string[],
    featured: false,
    isActive: true,
    readTime: 5,
    publishedAt: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  // Load existing post data if editing
  useEffect(() => {
    if (postId !== 'new') {
      const loadPost = async () => {
        try {
          const response = await fetch(`/api/admin/blog?id=${postId}`);
          if (response.ok) {
            const data = await response.json();
            const post = data.post;
            setFormData({
              slug: post.slug || '',
              titleEn: post.titleEn || '',
              titleBn: post.titleBn || '',
              excerptEn: post.excerptEn || '',
              excerptBn: post.excerptBn || '',
              contentEn: post.contentEn || '',
              contentBn: post.contentBn || '',
              authorEn: post.authorEn || 'Election Commission',
              authorBn: post.authorBn || 'নির্বাচন কমিশন',
              category: post.category || 'general',
              image: post.image || '',
              tags: post.tags || [],
              featured: post.featured || false,
              isActive: post.isActive !== undefined ? post.isActive : true,
              readTime: post.readTime || 5,
              publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            });
          } else {
            setMessage({ type: 'error', text: 'Failed to load blog post' });
          }
        } catch (error) {
          setMessage({ type: 'error', text: 'Error loading blog post' });
        } finally {
          setIsLoadingData(false);
        }
      };

      loadPost();
    }
  }, [postId]);

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

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titleEn.trim()) newErrors.titleEn = 'English title is required';
    if (!formData.titleBn.trim()) newErrors.titleBn = 'Bengali title is required';
    if (!formData.excerptEn.trim()) newErrors.excerptEn = 'English excerpt is required';
    if (!formData.excerptBn.trim()) newErrors.excerptBn = 'Bengali excerpt is required';
    if (!formData.contentEn.trim()) newErrors.contentEn = 'English content is required';
    if (!formData.contentBn.trim()) newErrors.contentBn = 'Bengali content is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';

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
      const url = postId === 'new' ? '/api/admin/blog' : '/api/admin/blog';
      const method = postId === 'new' ? 'POST' : 'PUT';
      
      const payload = postId === 'new' ? formData : { id: postId, ...formData };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Blog post saved successfully!' });
        setTimeout(() => {
          router.push('/en/admin/settings/blog');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save blog post' });
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
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading blog post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push('/en/admin/settings/blog')}
          className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Blog Management</span>
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
                  onChange={(e) => {
                    handleInputChange('titleEn', e.target.value);
                    if (!formData.slug || formData.slug === generateSlug(formData.titleEn)) {
                      handleInputChange('slug', generateSlug(e.target.value));
                    }
                  }}
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
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.slug ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="blog-post-slug"
              />
              {errors.slug && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.slug}</p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                URL-friendly version of the title (auto-generated from English title)
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Content
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Excerpt (English) *
                </label>
                <textarea
                  value={formData.excerptEn}
                  onChange={(e) => handleInputChange('excerptEn', e.target.value)}
                  rows={4}
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.excerptEn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="Enter English excerpt"
                />
                {errors.excerptEn && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.excerptEn}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Excerpt (Bengali) *
                </label>
                <textarea
                  value={formData.excerptBn}
                  onChange={(e) => handleInputChange('excerptBn', e.target.value)}
                  rows={4}
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.excerptBn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="বাংলা সারসংক্ষেপ লিখুন"
                />
                {errors.excerptBn && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.excerptBn}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Content (English) *
                </label>
                <textarea
                  value={formData.contentEn}
                  onChange={(e) => handleInputChange('contentEn', e.target.value)}
                  rows={12}
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.contentEn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="Enter English content (supports Markdown)"
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
                  rows={12}
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.contentBn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="বাংলা বিষয়বস্তু লিখুন (মার্কডাউন সমর্থিত)"
                />
                {errors.contentBn && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.contentBn}</p>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <TagIcon className="h-5 w-5 mr-2" />
              Metadata
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Author (English)
                </label>
                <input
                  type="text"
                  value={formData.authorEn}
                  onChange={(e) => handleInputChange('authorEn', e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Election Commission"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Author (Bengali)
                </label>
                <input
                  type="text"
                  value={formData.authorBn}
                  onChange={(e) => handleInputChange('authorBn', e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="নির্বাচন কমিশন"
                />
              </div>
            </div>

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
                  Read Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.readTime}
                  onChange={(e) => handleInputChange('readTime', parseInt(e.target.value) || 5)}
                  min="1"
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Image URL *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhotoIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.image ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="/blog-images/image.jpg"
                />
              </div>
              {errors.image && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.image}</p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-slate-700 dark:text-slate-300 flex items-center">
                  <StarIcon className="h-4 w-4 mr-1" />
                  Featured Post
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
              onClick={() => router.push('/en/admin/settings/blog')}
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
                  <span>{postId === 'new' ? 'Create Post' : 'Update Post'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
