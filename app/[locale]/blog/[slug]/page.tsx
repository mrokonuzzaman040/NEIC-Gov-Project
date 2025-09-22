'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
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
  contentEn: string;
  contentBn: string;
  authorEn: string;
  authorBn: string;
  category: string;
  image: string;
  tags: string[];
  featured: boolean;
  readTime: number;
  publishedAt: string;
}

interface RelatedPost {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string;
  excerptEn: string;
  excerptBn: string;
  image: string;
  category: string;
  publishedAt: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale() as 'en' | 'bn';
  const t = useTranslations('blog');
  const isEnglish = locale === 'en';
  const langKey = isEnglish ? 'en' : 'bn';
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFloatingShare, setShowFloatingShare] = useState(false);

  useEffect(() => {
    const loadBlogPost = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const slug = params.slug as string;
        if (!slug) {
          throw new Error('Blog post slug is required');
        }
        
        const response = await fetch(`/api/public/blog/${slug}`);
        
        if (response.status === 404) {
          // Post not found, redirect to blog page
          router.push(`/${locale}/blog`);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blog post: ${response.status}`);
        }
        
        const data = await response.json();
        setPost(data.post);
        setRelatedPosts(data.relatedPosts || []);
      } catch (error) {
        console.error('Error loading blog post:', error);
        setError(error instanceof Error ? error.message : 'Failed to load blog post');
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogPost();
  }, [params.slug, locale, router]);

  // Handle scroll for floating share button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowFloatingShare(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="text-center py-10 sm:py-20">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {isEnglish ? 'Loading blog post...' : 'ব্লগ পোস্ট লোড হচ্ছে...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400 mt-1 mr-3 sm:mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                    {isEnglish ? 'Error Loading Blog Post' : 'ব্লগ পোস্ট লোড করতে ত্রুটি'}
                  </h3>
                  <p className="text-sm sm:text-base text-red-800 dark:text-red-200 mb-4">
                    {error}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-3 py-2 sm:px-4 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      {isEnglish ? 'Retry' : 'পুনরায় চেষ্টা করুন'}
                    </button>
                    <Link
                      href={`/${locale}/blog`}
                      className="inline-flex items-center px-3 py-2 sm:px-4 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      {isEnglish ? 'Back to Blog' : 'ব্লগে ফিরুন'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Post not found (shouldn't happen as we redirect, but safety check)
  if (!post) {
    return (
      <div className="min-h-screen py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="text-center py-10 sm:py-20">
            <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
              {isEnglish ? 'Blog post not found' : 'ব্লগ পোস্ট পাওয়া যায়নি'}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {isEnglish ? 'The blog post you are looking for does not exist.' : 'আপনি যে ব্লগ পোস্টটি খুঁজছেন তা বিদ্যমান নেই।'}
            </p>
            <div className="mt-4 sm:mt-6">
              <Link
                href={`/${locale}/blog`}
                className="inline-flex items-center px-3 py-2 sm:px-4 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                {isEnglish ? 'Back to Blog' : 'ব্লগে ফিরুন'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
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
    // Map category IDs to display names
    const categoryMap: Record<string, { en: string; bn: string }> = {
      'electoral': { en: 'Electoral Process', bn: 'নির্বাচনী প্রক্রিয়া' },
      'technology': { en: 'Technology', bn: 'প্রযুক্তি' },
      'rights': { en: 'Citizen Rights', bn: 'নাগরিক অধিকার' },
      'transparency': { en: 'Transparency', bn: 'স্বচ্ছতা' },
      'security': { en: 'Security', bn: 'নিরাপত্তা' },
      'general': { en: 'General', bn: 'সাধারণ' },
    };
    
    const category = categoryMap[categoryId];
    return category ? category[langKey] : categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering for the content
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-6 sm:mt-8 mb-3 sm:mb-4">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white mt-4 sm:mt-6 mb-2 sm:mb-3">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('### ')) {
        return (
          <h4 key={index} className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mt-3 sm:mt-4 mb-2">
            {line.substring(5)}
          </h4>
        );
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return (
          <p key={index} className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-4">
            {line}
          </p>
        );
      }
    });
  };

  return (
    <div className="min-h-screen py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Government Header */}
        <GovernmentHeader
          title={isEnglish ? post.titleEn : post.titleBn}
          subtitle={isEnglish ? 'Government of the People\'s Republic of Bangladesh' : 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার'}
          portal={isEnglish ? 'Official Blog Post' : 'সরকারি ব্লগ পোস্ট'}
          tagline={formatDate(post.publishedAt)}
          borderColor="green"
          iconColor="green"
        />

        {/* Navigation */}
        <div className="mb-4 sm:mb-6">
          <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm overflow-x-auto">
            <Link 
              href={`/${locale}`}
              className="text-green-600 hover:text-green-700 font-medium transition-colors whitespace-nowrap"
            >
              {isEnglish ? 'Home' : 'হোম'}
            </Link>
            <span className="text-gray-400">/</span>
            <Link 
              href={`/${locale}/blog`}
              className="text-green-600 hover:text-green-700 font-medium transition-colors whitespace-nowrap"
            >
              {isEnglish ? 'Blog' : 'ব্লগ'}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-gray-400 truncate max-w-32 sm:max-w-xs">
              {isEnglish ? post.titleEn : post.titleBn}
            </span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <article className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
              {/* Featured Image */}
              <div className="relative h-48 sm:h-64 md:h-96">
                <Image
                  src={post.image}
                  alt={isEnglish ? post.titleEn : post.titleBn}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4">
                  <span className="inline-block px-2 py-1 sm:px-3 bg-green-600 text-white text-xs sm:text-sm font-medium rounded-full">
                    {getCategoryName(post.category)}
                  </span>
                </div>
              </div>

              {/* Article Header */}
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-4 sm:mb-6">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight">
                    {isEnglish ? post.titleEn : post.titleBn}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                    <div className="flex items-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="truncate">{isEnglish ? post.authorEn : post.authorBn}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(post.publishedAt)}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {post.readTime} {isEnglish ? 'min read' : 'মিনিট পড়া'}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 sm:px-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Article Content */}
                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert">
                  {renderContent(isEnglish ? post.contentEn : post.contentBn)}
                </div>

                {/* Share Section */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {isEnglish ? 'Share this article' : 'এই নিবন্ধটি শেয়ার করুন'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {isEnglish 
                          ? 'Help others discover this important information by sharing it on social media.'
                          : 'সামাজিক যোগাযোগ মাধ্যমে শেয়ার করে অন্যদের এই গুরুত্বপূর্ণ তথ্য জানতে সাহায্য করুন।'
                        }
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ShareButtons
                        title={isEnglish ? post.titleEn : post.titleBn}
                        description={isEnglish ? post.excerptEn : post.excerptBn}
                        url={typeof window !== 'undefined' ? window.location.href : ''}
                        image={post.image}
                        hashtags={post.tags}
                        size="md"
                        orientation="horizontal"
                        className="justify-end"
                      />
                    </div>
                  </div>
                </div>

                {/* Article Footer */}
                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                          {isEnglish ? post.authorEn : post.authorBn}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {isEnglish ? 'Commission Staff' : 'কমিশন কর্মী'}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {isEnglish ? 'Published on' : 'প্রকাশিত'}
                      </p>
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                        {formatDate(post.publishedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    {isEnglish ? 'Related Posts' : 'সম্পর্কিত পোস্ট'}
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.id}
                        href={`/${locale}/blog/${relatedPost.slug}`}
                        className="block group"
                      >
                        <div className="flex space-x-2 sm:space-x-3">
                          <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 relative">
                            <Image
                              src={relatedPost.image}
                              alt={isEnglish ? relatedPost.titleEn : relatedPost.titleBn}
                              fill
                              className="object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white group-hover:text-green-600 transition-colors line-clamp-2">
                              {isEnglish ? relatedPost.titleEn : relatedPost.titleBn}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {formatDate(relatedPost.publishedAt)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Category */}
              <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {isEnglish ? 'Category' : 'বিভাগ'}
                </h3>
                <div>
                  <Link
                    href={`/${locale}/blog`}
                    className="inline-block px-3 py-2 sm:px-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                  >
                    {getCategoryName(post.category)}
                  </Link>
                </div>
              </div>

              {/* Back to Blog */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-green-900 dark:text-green-100 mb-2 sm:mb-3">
                  {isEnglish ? 'More Articles' : 'আরও নিবন্ধ'}
                </h3>
                <p className="text-green-800 dark:text-green-200 text-xs sm:text-sm mb-3 sm:mb-4">
                  {isEnglish 
                    ? 'Explore more insights and updates from our commission.'
                    : 'আমাদের কমিশনের আরও অন্তর্দৃষ্টি এবং আপডেট অন্বেষণ করুন।'
                  }
                </p>
                <Link
                  href={`/${locale}/blog`}
                  className="inline-flex items-center px-3 py-2 sm:px-4 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {isEnglish ? 'Back to Blog' : 'ব্লগে ফিরুন'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Share Button (Mobile) */}
      {showFloatingShare && post && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 lg:hidden">
          <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-full p-2 sm:p-3 border border-gray-200 dark:border-slate-700">
            <ShareButtons
              title={isEnglish ? post.titleEn : post.titleBn}
              description={isEnglish ? post.excerptEn : post.excerptBn}
              url={typeof window !== 'undefined' ? window.location.href : ''}
              image={post.image}
              hashtags={post.tags}
              size="sm"
              orientation="horizontal"
              className="justify-center"
            />
          </div>
        </div>
      )}
    </div>
  );
}
