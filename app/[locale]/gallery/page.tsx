'use client';
import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import GovernmentHeader from '@/components/GovernmentHeader';
import ShareButtons from '@/components/ShareButtons';
import Link from 'next/link';
import Image from 'next/image';
import { PhotoIcon, StarIcon, TagIcon } from '@heroicons/react/24/outline';

interface GalleryItem {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string | null;
  descriptionBn: string | null;
  imageUrl: string;
  category: string;
  tags: string[];
  featured: boolean;
  publishedAt: string;
}

export default function GalleryPage() {
  const locale = useLocale() as 'en' | 'bn';
  const isEnglish = locale === 'en';

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load gallery items from database
  useEffect(() => {
    const loadGalleryItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        
        const response = await fetch(`/api/public/gallery?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch gallery items: ${response.status}`);
        }
        
        const data = await response.json();
        setItems(data.items || []);
        setCategories(['all', ...(data.categories || [])]);
      } catch (error) {
        console.error('Error loading gallery items:', error);
        setError(error instanceof Error ? error.message : 'Failed to load gallery items');
      } finally {
        setIsLoading(false);
      }
    };

    loadGalleryItems();
  }, [selectedCategory]);

  const getCategoryName = (category: string) => {
    if (category === 'all') return isEnglish ? 'All Categories' : 'সব বিভাগ';
    
    const categoryMap: Record<string, { en: string; bn: string }> = {
      general: { en: 'General', bn: 'সাধারণ' },
      events: { en: 'Events', bn: 'ইভেন্ট' },
      meetings: { en: 'Meetings', bn: 'সভা' },
      activities: { en: 'Activities', bn: 'কার্যক্রম' },
      facilities: { en: 'Facilities', bn: 'সুবিধা' },
      team: { en: 'Team', bn: 'দল' },
      achievements: { en: 'Achievements', bn: 'অর্জন' },
    };
    
    return categoryMap[category] ? categoryMap[category][locale] : category;
  };

  const openImageModal = (item: GalleryItem) => {
    const index = items.findIndex(img => img.id === item.id);
    setSelectedImage(item);
    setSelectedImageIndex(index);
    setIsModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setSelectedImageIndex(0);
    setIsModalOpen(false);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  const goToNextImage = useCallback(() => {
    if (items.length === 0) return;
    const nextIndex = (selectedImageIndex + 1) % items.length;
    setSelectedImageIndex(nextIndex);
    setSelectedImage(items[nextIndex]);
  }, [items, selectedImageIndex]);

  const goToPreviousImage = useCallback(() => {
    if (items.length === 0) return;
    const prevIndex = selectedImageIndex === 0 ? items.length - 1 : selectedImageIndex - 1;
    setSelectedImageIndex(prevIndex);
    setSelectedImage(items[prevIndex]);
  }, [items, selectedImageIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      switch (event.key) {
        case 'Escape':
          closeImageModal();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goToPreviousImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextImage();
          break;
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, selectedImageIndex, items, goToNextImage, goToPreviousImage]);

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Government Header */}
        <GovernmentHeader
          title={isEnglish ? 'Photo Gallery' : 'ফটো গ্যালারি'}
          subtitle={isEnglish ? 'Government of the People\'s Republic of Bangladesh' : 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার'}
          portal={isEnglish ? 'National Elections (2014, 2018, 2024) Inquiry Commission' : 'জাতীয় সংসদ নির্বাচন (২০১৪, ২০১৮ ও ২০২৪) তদন্ত কমিশন'}
          tagline={isEnglish ? `Last Updated: ${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}` : `সর্বশেষ আপডেট: ${new Date().toLocaleDateString('bn-BD').replace(/\//g, '-')}`}
          borderColor="green"
          iconColor="green"
        />

        {/* Back to Home Link */}
        <div className="mb-4 sm:mb-6">
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {isEnglish ? 'Back to Home' : 'হোমে ফিরুন'}
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg">
            <div className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-3 sm:mt-4 text-sm sm:text-base">
                {isEnglish ? 'Loading gallery...' : 'গ্যালারি লোড হচ্ছে...'}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0 mx-auto sm:mx-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-center sm:text-left min-w-0">
                <h4 className="text-base sm:text-lg font-semibold text-red-900 dark:text-red-100 mb-1 sm:mb-2">
                  {isEnglish ? 'Error Loading Gallery' : 'গ্যালারি লোড করতে ত্রুটি'}
                </h4>
                <p className="text-red-800 dark:text-red-200 text-xs sm:text-sm break-words">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 sm:mt-3 inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {isEnglish ? 'Retry' : 'পুনরায় চেষ্টা করুন'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Description */}
        {!isLoading && !error && (
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {isEnglish ? 'Photo Gallery' : 'ফটো গ্যালারি'}
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                {isEnglish 
                  ? 'Explore our collection of images showcasing the activities, events, and achievements of the National Elections Inquiry Commission.'
                  : 'জাতীয় নির্বাচন তদন্ত কমিশনের কার্যক্রম, ইভেন্ট এবং অর্জনের ছবির সংগ্রহ দেখুন।'
                }
              </p>
            </div>
          </div>
        )}

        {/* Category Filter */}
        {!isLoading && !error && categories.length > 1 && (
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {isEnglish ? 'Categories' : 'বিভাগসমূহ'}
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg transition-colors duration-200 font-medium text-xs sm:text-sm ${
                    selectedCategory === category
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                  }`}
                >
                  {getCategoryName(category)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && !error && (
          <div className="mb-6 sm:mb-8">
            {items.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6 sm:p-8 lg:p-12 text-center">
                <PhotoIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                  {isEnglish ? 'No images available' : 'কোন ছবি উপলব্ধ নেই'}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {selectedCategory !== 'all' 
                    ? (isEnglish ? 'No images in this category.' : 'এই বিভাগে কোন ছবি নেই।')
                    : (isEnglish ? 'Check back later for new images.' : 'নতুন ছবির জন্য পরে আবার দেখুন।')
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                    {/* Image */}
                    <div 
                      className="relative aspect-square cursor-pointer"
                      onClick={() => openImageModal(item)}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={isEnglish ? item.titleEn : item.titleBn}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.featured && (
                        <div className="absolute top-2 left-2">
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                            <StarIcon className="h-3 w-3 mr-1" />
                            {isEnglish ? 'Featured' : 'বিশেষ'}
                          </span>
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-4">
                      {/* Category Badge */}
                      <div className="mb-1.5 sm:mb-2">
                        <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                          {getCategoryName(item.category)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                        {isEnglish ? item.titleEn : item.titleBn}
                      </h3>

                      {/* Description */}
                      {(item.descriptionEn || item.descriptionBn) && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-1.5 sm:mb-2 line-clamp-2">
                          {isEnglish ? item.descriptionEn : item.descriptionBn}
                        </p>
                      )}

                      {/* Tags */}
                      {item.tags.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">
                          <TagIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {item.tags.slice(0, 2).join(', ')}
                            {item.tags.length > 2 && ` +${item.tags.length - 2}`}
                          </span>
                        </div>
                      )}

                      {/* Date */}
                      <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                        {new Date(item.publishedAt).toLocaleDateString(
                          locale === 'en' ? 'en-US' : 'bn-BD'
                        ).replace(/\//g, '-')}
                      </div>

                      {/* Share Buttons */}
                      <ShareButtons
                        title={isEnglish ? item.titleEn : item.titleBn}
                        description={isEnglish ? item.descriptionEn || '' : item.descriptionBn || ''}
                        image={item.imageUrl}
                        hashtags={['Gallery', 'ElectionCommission', 'Bangladesh', getCategoryName(item.category), ...item.tags.slice(0, 2)]}
                        size="sm"
                        orientation="horizontal"
                        className="justify-center scale-75"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Call to Action */}
        {!isLoading && !error && items.length > 0 && (
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 sm:p-6 lg:p-8 text-white">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">
                {isEnglish ? 'Stay Connected' : 'যোগাযোগে থাকুন'}
              </h3>
              <p className="text-green-100 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
                {isEnglish 
                  ? 'Follow our activities and stay updated with the latest developments from the Commission.'
                  : 'আমাদের কার্যক্রম অনুসরণ করুন এবং কমিশনের সর্বশেষ উন্নয়নের সাথে আপডেট থাকুন।'
                }
              </p>
              <Link
                href={`/${locale}`}
                className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors duration-200 text-sm sm:text-base"
              >
                {isEnglish ? 'Back to Home' : 'হোমে ফিরুন'}
              </Link>
            </div>
          </div>
        )}

        {/* Fullscreen Image Modal */}
        {isModalOpen && selectedImage && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-2 sm:p-4">
            {/* Close button */}
            <button
              onClick={closeImageModal}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 z-60 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1.5 sm:p-2 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation buttons - only show if there are multiple images */}
            {items.length > 1 && (
              <>
                {/* Previous button */}
                <button
                  onClick={goToPreviousImage}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-60 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 sm:p-3 rounded-full transition-colors"
                  aria-label={isEnglish ? 'Previous image' : 'পূর্ববর্তী ছবি'}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Next button */}
                <button
                  onClick={goToNextImage}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-60 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 sm:p-3 rounded-full transition-colors"
                  aria-label={isEnglish ? 'Next image' : 'পরবর্তী ছবি'}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image counter */}
            {items.length > 1 && (
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-60 bg-black bg-opacity-50 text-white px-3 py-1.5 rounded-full text-sm">
                {selectedImageIndex + 1} / {items.length}
              </div>
            )}

            {/* Modal content */}
            <div className="max-w-7xl max-h-full w-full h-full flex flex-col items-center justify-center">
              {/* Image */}
              <div className="relative max-w-full max-h-[70vh] sm:max-h-[80vh] w-auto h-auto">
                <Image
                  src={selectedImage.imageUrl}
                  alt={isEnglish ? selectedImage.titleEn : selectedImage.titleBn}
                  width={1200}
                  height={800}
                  className="object-contain max-w-full max-h-full"
                  priority
                />
              </div>

              {/* Image info */}
              <div className="mt-3 sm:mt-6 max-w-2xl text-center px-2 sm:px-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 break-words">
                  {isEnglish ? selectedImage.titleEn : selectedImage.titleBn}
                </h2>
                
                {(selectedImage.descriptionEn || selectedImage.descriptionBn) && (
                  <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base break-words">
                    {isEnglish ? selectedImage.descriptionEn : selectedImage.descriptionBn}
                  </p>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                      {getCategoryName(selectedImage.category)}
                    </span>
                  </div>
                  
                  {selectedImage.featured && (
                    <div className="flex items-center">
                      <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-yellow-400" />
                      <span className="text-yellow-400">
                        {isEnglish ? 'Featured' : 'বিশেষ'}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">
                      {new Date(selectedImage.publishedAt).toLocaleDateString(
                        locale === 'en' ? 'en-US' : 'bn-BD'
                      ).replace(/\//g, '-')}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {selectedImage.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mt-3 sm:mt-4">
                    {selectedImage.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300"
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        <span className="truncate">{tag}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Share Buttons in Modal */}
                <div className="mt-4 sm:mt-6 flex justify-center">
                  <ShareButtons
                    title={isEnglish ? selectedImage.titleEn : selectedImage.titleBn}
                    description={isEnglish ? selectedImage.descriptionEn || '' : selectedImage.descriptionBn || ''}
                    image={selectedImage.imageUrl}
                    hashtags={['Gallery', 'ElectionCommission', 'Bangladesh', getCategoryName(selectedImage.category), ...selectedImage.tags.slice(0, 2)]}
                    size="sm"
                    orientation="horizontal"
                    className="justify-center bg-black bg-opacity-50 rounded-lg p-2 scale-90"
                  />
                </div>
              </div>
            </div>

            {/* Click outside to close */}
            <div 
              className="absolute inset-0 z-40"
              onClick={closeImageModal}
            />
          </div>
        )}
      </div>
    </div>
  );
}
