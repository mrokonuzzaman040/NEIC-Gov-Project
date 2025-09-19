"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon,
  EyeIcon,
  StarIcon,
  TagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

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
  isActive: boolean;
  order: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export default function GalleryManagement() {
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadGalleryItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`/api/admin/gallery?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch gallery items: ${response.status}`);
      }
      
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error loading gallery items:', error);
      setError(error instanceof Error ? error.message : 'Failed to load gallery items');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  // Load gallery items from database
  useEffect(() => {
    loadGalleryItems();
  }, [loadGalleryItems]);

  const handleEditItem = (item: GalleryItem) => {
    router.push(`/en/admin/gallery/${item.id}`);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this gallery item? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/admin/gallery?id=${itemId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete gallery item');
        }

        setMessage({ type: 'success', text: 'Gallery item deleted successfully!' });
        setItems(items.filter(item => item.id !== itemId));
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error('Error deleting gallery item:', error);
        setMessage({ 
          type: 'error', 
          text: error instanceof Error ? error.message : 'Failed to delete gallery item' 
        });
        setTimeout(() => setMessage(null), 5000);
      }
    }
  };

  const handleToggleFeatured = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    try {
      const formData = new FormData();
      formData.append('id', itemId);
      formData.append('titleEn', item.titleEn);
      formData.append('titleBn', item.titleBn);
      formData.append('descriptionEn', item.descriptionEn || '');
      formData.append('descriptionBn', item.descriptionBn || '');
      formData.append('category', item.category);
      formData.append('tags', JSON.stringify(item.tags));
      formData.append('featured', (!item.featured).toString());
      formData.append('order', item.order.toString());

      const response = await fetch('/api/admin/gallery', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update gallery item');
      }

      setItems(items.map(i => 
        i.id === itemId 
          ? { ...i, featured: !i.featured }
          : i
      ));
      setMessage({ type: 'success', text: 'Gallery item updated successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating gallery item:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update gallery item' 
      });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))];

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading gallery items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Error Loading Gallery Items
            </h3>
            <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
            <button
              onClick={loadGalleryItems}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {items.length} item{items.length !== 1 ? 's' : ''} total
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {items.filter(i => i.featured).length} featured
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          
          <Link
            href="/en/admin/gallery/new"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Image</span>
          </Link>
        </div>
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

      {/* Gallery Grid */}
      {items.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="p-12 text-center">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No gallery items found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding your first image to the gallery.
            </p>
            <div className="mt-6">
              <Link
                href="/en/admin/gallery/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Image
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="relative aspect-square">
                <Image
                  src={item.imageUrl}
                  alt={item.titleEn}
                  fill
                  className="object-cover"
                />
                {item.featured && (
                  <div className="absolute top-2 left-2">
                    <StarSolidIcon className="h-5 w-5 text-yellow-500" />
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">
                  {item.titleEn}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">
                  {item.titleBn}
                </p>
                
                {/* Category and Tags */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    {item.category}
                  </span>
                  {item.tags.length > 0 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      +{item.tags.length} tags
                    </span>
                  )}
                </div>
                
                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <div className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {new Date(item.publishedAt).toLocaleDateString().replace(/\//g, '-')}
                  </div>
                  <div className="text-xs">
                    Order: {item.order}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(item.id)}
                      className={`${
                        item.featured 
                          ? 'text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300'
                          : 'text-gray-400 hover:text-yellow-600 dark:text-gray-500 dark:hover:text-yellow-400'
                      }`}
                      title={item.featured ? 'Remove from featured' : 'Add to featured'}
                    >
                      <StarIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  {item.imageUrl && (
                    <a
                      href={item.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      title="View image"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
