"use client";
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

interface Notice {
  id: string;
  titleEn: string;
  titleBn: string;
  contentEn: string;
  contentBn: string;
  type: string;
  priority: string;
  category: string;
  publishedAt: string;
  expiresAt?: string;
  isPinned: boolean;
  attachments: string[];
}

export default function NoticePage() {
  const t = useTranslations('notice');
  const locale = useLocale() as 'en' | 'bn';
  const isEnglish = locale === 'en';
  
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notices from database
  useEffect(() => {
    const loadNotices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/public/notices');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch notices: ${response.status}`);
        }
        
        const data = await response.json();
        setNotices(data.notices || []);
      } catch (error) {
        console.error('Error loading notices:', error);
        setError(error instanceof Error ? error.message : 'Failed to load notices');
      } finally {
        setIsLoading(false);
      }
    };

    loadNotices();
  }, []);

  // Transform notices data for the current locale
  const transformedNotices = notices.map(notice => ({
    id: notice.id,
    title: isEnglish ? notice.titleEn : notice.titleBn,
    content: isEnglish ? notice.contentEn : notice.contentBn,
    publishedAt: notice.publishedAt,
    downloadUrl: notice.attachments[0] || '#', // Use first attachment as download URL
    category: notice.category,
    priority: notice.priority.toLowerCase(),
    type: notice.type,
    isPinned: notice.isPinned,
    expiresAt: notice.expiresAt
  }));

  // Get category translations
  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, { en: string; bn: string }> = {
      'general': { en: 'General', bn: 'সাধারণ' },
      'registration': { en: 'Voter Registration', bn: 'ভোটার নিবন্ধন' },
      'polling': { en: 'Polling Stations', bn: 'ভোটকেন্দ্র' },
      'nomination': { en: 'Candidate Nomination', bn: 'প্রার্থী মনোনয়ন' },
      'schedule': { en: 'Election Schedule', bn: 'নির্বাচনের সময়সূচী' },
      'education': { en: 'Voter Education', bn: 'ভোটার শিক্ষা' },
      'conduct': { en: 'Code of Conduct', bn: 'আচরণবিধি' },
      'media': { en: 'Media Guidelines', bn: 'মিডিয়া নির্দেশিকা' },
      'security': { en: 'Security', bn: 'নিরাপত্তা' },
      'observers': { en: 'Election Observers', bn: 'নির্বাচন পর্যবেক্ষক' },
      'technology': { en: 'Election Technology', bn: 'নির্বাচনী প্রযুক্তি' },
    };
    
    return categoryMap[category]?.[locale] || category;
  };

  // Get priority badge styling
  const getPriorityBadge = (priority: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (priority) {
      case 'high':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300`;
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300`;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Government Header with Official Seal */}
        <div className="bg-white dark:bg-slate-800 shadow-lg border-l-4 border-green-600 mb-8">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Official Seal/Logo */}
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('title')}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {isEnglish ? 'Government of the People\'s Republic of Bangladesh' : 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEnglish ? 'Official Notices & Announcements' : 'সরকারি বিজ্ঞপ্তি ও ঘোষণা'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {isEnglish ? `Last Updated: ${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}` : `সর্বশেষ আপডেট: ${new Date().toLocaleDateString('bn-BD').replace(/\//g, '-')}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white dark:bg-slate-800 shadow-lg mb-8">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isEnglish ? 'Official Notices & Announcements' : 'সরকারি বিজ্ঞপ্তি ও ঘোষণা'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('description')}
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6 border-l-4 border-blue-600">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isEnglish ? 'Total Notices' : 'মোট বিজ্ঞপ্তি'}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {transformedNotices.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6 border-l-4 border-red-600">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isEnglish ? 'High Priority' : 'উচ্চ অগ্রাধিকার'}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {transformedNotices.filter(n => n.priority === 'high').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6 border-l-4 border-green-600">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isEnglish ? 'This Month' : 'এই মাসে'}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {transformedNotices.filter(n => new Date(n.publishedAt).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg">
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                {isEnglish ? 'Loading notices...' : 'বিজ্ঞপ্তি লোড হচ্ছে...'}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                  {isEnglish ? 'Error Loading Notices' : 'বিজ্ঞপ্তি লোড করতে ত্রুটি'}
                </h4>
                <p className="text-red-800 dark:text-red-200 text-sm">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {isEnglish ? 'Retry' : 'পুনরায় চেষ্টা করুন'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notice Table */}
        {!isLoading && !error && (
          <div className="bg-white dark:bg-slate-800 shadow-lg">
            <div className="px-8 py-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('allNotices')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {isEnglish ? 'Official notices and announcements from the National Elections Inquiry Commission' : 'জাতীয় সংসদ নির্বাচন তদন্ত কমিশনের সরকারি বিজ্ঞপ্তি ও ঘোষণা'}
              </p>
            </div>
            
            <div className="p-8">
              {transformedNotices.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {isEnglish ? 'No notices available' : 'কোন বিজ্ঞপ্তি উপলব্ধ নেই'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isEnglish ? 'Check back later for new notices and announcements.' : 'নতুন বিজ্ঞপ্তি ও ঘোষণার জন্য পরে আবার দেখুন।'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {isEnglish ? 'Serial' : 'ক্রমিক'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {isEnglish ? 'Notice Title' : 'বিজ্ঞপ্তির শিরোনাম'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {isEnglish ? 'Category' : 'বিভাগ'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {isEnglish ? 'Priority' : 'অগ্রাধিকার'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {isEnglish ? 'Published Date' : 'প্রকাশের তারিখ'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {isEnglish ? 'Action' : 'কার্যক্রম'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                      {transformedNotices.map((notice, index) => (
                        <tr key={notice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {index + 1}
                            {notice.isPinned && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                📌
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {notice.title}
                            </div>
                            {notice.content && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {notice.content.substring(0, 100)}...
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                              {getCategoryName(notice.category)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getPriorityBadge(notice.priority)}>
                              {isEnglish ? notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1) : 
                               notice.priority === 'high' ? 'উচ্চ' : 
                               notice.priority === 'medium' ? 'মধ্যম' : 
                               notice.priority === 'critical' ? 'জরুরি' : 'নিম্ন'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(notice.publishedAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US').replace(/\//g, '-')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {notice.downloadUrl && notice.downloadUrl !== '#' ? (
                              <a
                                href={notice.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-6 8h8a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v11a2 2 0 002 2z" />
                                </svg>
                                {isEnglish ? 'Download' : 'ডাউনলোড'}
                              </a>
                            ) : (
                              <span className="inline-flex items-center px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                {isEnglish ? 'No attachment' : 'কোন সংযুক্তি নেই'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                {t('importantNote')}
              </h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                {t('noteDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}