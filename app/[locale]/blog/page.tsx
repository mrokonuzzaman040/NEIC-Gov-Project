'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import GovernmentHeader from '@/components/GovernmentHeader';
import ShareButtons from '@/components/ShareButtons';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string;
  excerptEn: string;
  excerptBn: string;
  authorEn: string;
  authorBn: string;
  category: string;
  image: string;
  tags: string[];
  featured: boolean;
  readTime: number;
  publishedAt: string;
}

export default function BlogPage() {
  const locale = useLocale() as 'en' | 'bn';
  const t = useTranslations('blog');
  const isEnglish = locale === 'en';
  const langKey = isEnglish ? 'en' : 'bn';

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load blog posts from database
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/public/blog');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blog posts: ${response.status}`);
        }
        
        const data = await response.json();
        setBlogPosts(data.posts || []);
      } catch (error) {
        console.error('Error loading blog posts:', error);
        setError(error instanceof Error ? error.message : 'Failed to load blog posts');
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

  // Filter posts by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredPosts(blogPosts);
    } else {
      setFilteredPosts(blogPosts.filter(post => post.category === selectedCategory));
    }
  }, [selectedCategory, blogPosts]);

  // Get unique categories from blog posts
  const categories = [
    { id: 'all', name: { en: 'All Posts', bn: 'সব পোস্ট' } },
    ...Array.from(new Set(blogPosts.map(post => post.category))).map(category => ({
      id: category,
      name: {
        en: category.charAt(0).toUpperCase() + category.slice(1),
        bn: getCategoryNameBengali(category)
      }
    }))
  ];

  function getCategoryNameBengali(category: string): string {
    const categoryMap: Record<string, string> = {
      'electoral': 'নির্বাচনী প্রক্রিয়া',
      'technology': 'প্রযুক্তি',
      'rights': 'নাগরিক অধিকার',
      'transparency': 'স্বচ্ছতা',
      'security': 'নিরাপত্তা',
      'general': 'সাধারণ',
    };
    return categoryMap[category] || category;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      locale === 'en' ? 'en-US' : 'bn-BD',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    ).replace(/\//g, '-');
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name[langKey] : categoryId;
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Government Header */}
        <GovernmentHeader
          title={isEnglish ? 'Official Blog & Updates' : ' ব্লগ ও আপডেট'}
          subtitle={isEnglish ? 'Government of the People\'s Republic of Bangladesh' : 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার'}
          portal={isEnglish ? 'National Elections (2014, 2018, 2024) Inquiry Commission' : 'জাতীয়  নির্বাচন (২০১৪, ২০১৮ ও ২০২৪) তদন্ত কমিশন'}
          tagline={isEnglish ? `Latest Updates: ${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}` : `সর্বশেষ আপডেট: ${new Date().toLocaleDateString('bn-BD').replace(/\//g, '-')}`}
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
                {isEnglish ? 'Loading blog posts...' : 'ব্লগ পোস্ট লোড হচ্ছে...'}
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
                  {isEnglish ? 'Error Loading Blog Posts' : 'ব্লগ পোস্ট লোড করতে ত্রুটি'}
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

        {/* Blog Description */}
        {!isLoading && !error && (
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {isEnglish ? 'Official Blog & Updates' : ' ব্লগ ও আপডেট'}
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                {isEnglish 
                  ? 'Stay informed with the latest updates, insights, and official communications from the National Elections Inquiry Commission.'
                  : 'জাতীয় নির্বাচন তদন্ত কমিশনের সর্বশেষ আপডেট, অন্তর্দৃষ্টি এবং  যোগাযোগের সাথে অবগত থাকুন।'
                }
              </p>
            </div>
          </div>
        )}

        {/* Category Filter */}
        {!isLoading && !error && (
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {isEnglish ? 'Categories' : 'বিভাগসমূহ'}
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg transition-colors duration-200 font-medium text-xs sm:text-sm ${
                    selectedCategory === category.id
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                  }`}
                >
                  {category.name[langKey]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full text-center py-8 sm:py-12">
                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                  {isEnglish ? 'No blog posts available' : 'কোন ব্লগ পোস্ট উপলব্ধ নেই'}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {selectedCategory !== 'all' 
                    ? (isEnglish ? 'No posts in this category.' : 'এই বিভাগে কোন পোস্ট নেই।')
                    : (isEnglish ? 'Check back later for new blog posts.' : 'নতুন ব্লগ পোস্টের জন্য পরে আবার দেখুন।')
                  }
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <Link key={post.id} href={`/${locale}/blog/${post.slug}`} className="block">
                  <article className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {/* Post Image */}
                    <div className="relative h-40 sm:h-48">
                      <Image
                        src={post.image}
                        alt={isEnglish ? post.titleEn : post.titleBn}
                        fill
                        className="object-cover"
                      />
                      {post.featured && (
                        <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                          <span className="inline-block px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                            {isEnglish ? 'Featured' : 'বিশেষ'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="p-4 sm:p-6">
                      {/* Category Badge */}
                      <div className="mb-2 sm:mb-3">
                        <span className="inline-block px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                          {getCategoryName(post.category)}
                        </span>
                      </div>

                      {/* Post Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 line-clamp-2">
                        {isEnglish ? post.titleEn : post.titleBn}
                      </h3>

                      {/* Post Excerpt */}
                      <p className="text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-3 text-sm sm:text-base">
                        {isEnglish ? post.excerptEn : post.excerptBn}
                      </p>

                      {/* Post Meta */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                        <div className="flex items-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="truncate">{isEnglish ? post.authorEn : post.authorBn}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {post.readTime} {isEnglish ? 'min read' : 'মিনিট পড়া'}
                        </div>
                      </div>

                      {/* Post Date */}
                      <div className="text-xs text-gray-400 dark:text-gray-500 mb-3 sm:mb-4">
                        {formatDate(post.publishedAt)}
                      </div>

                      {/* Share Buttons */}
                      <div className="mb-2 sm:mb-3">
                        <ShareButtons
                          title={isEnglish ? post.titleEn : post.titleBn}
                          description={isEnglish ? post.excerptEn : post.excerptBn}
                          url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/blog/${post.slug}`}
                          image={post.image}
                          hashtags={['ElectionCommission', 'Bangladesh', ...post.tags]}
                          size="sm"
                          orientation="horizontal"
                          className="justify-center scale-90"
                        />
                      </div>

                      {/* Read More Button */}
                      <div className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center text-xs sm:text-sm">
                        {isEnglish ? 'Read More' : 'আরও পড়ুন'}
                      </div>
                    </div>
                  </article>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Newsletter Subscription */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 sm:p-6 lg:p-8 text-white">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">
              {isEnglish ? 'Stay Updated' : 'আপডেট থাকুন'}
            </h3>
            <p className="text-green-100 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
              {isEnglish 
                ? 'Subscribe to our newsletter to receive the latest updates and official communications from the Commission.'
                : 'কমিশনের সর্বশেষ আপডেট এবং  যোগাযোগ পেতে আমাদের নিউজলেটারে সাবস্ক্রাইব করুন।'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder={isEnglish ? 'Enter your email' : 'আপনার ইমেইল দিন'}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300 text-sm sm:text-base"
              />
              <button className="bg-white text-green-600 font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-50 transition-colors duration-200 text-sm sm:text-base">
                {isEnglish ? 'Subscribe' : 'সাবস্ক্রাইব'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
