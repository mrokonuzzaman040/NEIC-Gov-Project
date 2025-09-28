"use client";
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import GovernmentHeader from '@/components/GovernmentHeader';

interface Gazette {
  id: string;
  titleEn: string;
  titleBn: string;
  gazetteNumber: string;
  category: string;
  priority: string;
  publishedAt: string;
  downloadUrl: string;
  description?: string;
}

export default function GazettesPage() {
  const t = useTranslations('gazettes');
  const locale = useLocale() as 'en' | 'bn';
  const isBengali = locale === 'bn';
  
  const [gazettes, setGazettes] = useState<Gazette[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load gazettes from database
  useEffect(() => {
    const loadGazettes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/public/gazettes');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch gazettes: ${response.status}`);
        }
        
        const data = await response.json();
        setGazettes(data.gazettes || []);
      } catch (error) {
        console.error('Error loading gazettes:', error);
        setError(error instanceof Error ? error.message : 'Failed to load gazettes');
      } finally {
        setIsLoading(false);
      }
    };

    loadGazettes();
  }, []);

  // Transform gazettes data for the current locale
  const transformedGazettes = gazettes.map(gazette => ({
    id: gazette.id,
    title: isBengali ? gazette.titleBn : gazette.titleEn,
    publishedAt: gazette.publishedAt,
    downloadUrl: gazette.downloadUrl,
    gazetteNumber: gazette.gazetteNumber,
    category: gazette.category,
    priority: gazette.priority.toLowerCase(),
    description: gazette.description
  }));

  // Get category translations
  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, { en: string; bn: string }> = {
      'formation': { en: 'Commission Formation', bn: 'কমিশন গঠন' },
      'terms': { en: 'Terms of Reference', bn: 'কার্যপরিধি' },
      'appointment': { en: 'Appointments', bn: 'নিয়োগ' },
      'procedures': { en: 'Procedures', bn: 'পদ্ধতি' },
      'guidelines': { en: 'Guidelines', bn: 'নির্দেশিকা' },
      'protection': { en: 'Protection Measures', bn: 'সুরক্ষা ব্যবস্থা' },
      'budget': { en: 'Budget & Finance', bn: 'বাজেট ও অর্থ' },
      'administration': { en: 'Administration', bn: 'প্রশাসন' },
      'timeline': { en: 'Timeline & Schedule', bn: 'সময়সূচি' },
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
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Government Header with Official Seal */}
        <GovernmentHeader
          title={t('title')}
          subtitle={isBengali ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার' : 'Government of the People\'s Republic of Bangladesh'}
          portal={isBengali ? 'গেজেট প্রজ্ঞাপন' : 'Gazette Notifications'}
          tagline={isBengali ? `সর্বশেষ আপডেট: ${new Date().toLocaleDateString('bn-BD').replace(/\//g, '-')}` : `Last Updated: ${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}`}
          borderColor="green"
          iconColor="green"
        />

        {/* Description Section */}
        <div className="bg-white dark:bg-slate-800 shadow-lg mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
              {isBengali ? 'গেজেট প্রজ্ঞাপন' : 'Gazette Notifications'}
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('description')}
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 border-l-4 border-blue-600">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isBengali ? 'মোট গেজেট' : 'Total Gazettes'}
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
                  {transformedGazettes.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 border-l-4 border-red-600">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isBengali ? 'উচ্চ অগ্রাধিকার' : 'High Priority'}
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
                  {transformedGazettes.filter(g => g.priority === 'high').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 border-l-4 border-green-600">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isBengali ? 'এই মাসে' : 'This Month'}
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
                  {transformedGazettes.filter(g => new Date(g.publishedAt).getMonth() === new Date().getMonth()).length}
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
                {isBengali ? 'গেজেট লোড হচ্ছে...' : 'Loading gazettes...'}
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
                  {isBengali ? 'গেজেট লোড করতে ত্রুটি' : 'Error Loading Gazettes'}
                </h4>
                <p className="text-red-800 dark:text-red-200 text-sm">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {isBengali ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gazette Table */}
        {!isLoading && !error && (
          <div className="bg-white dark:bg-slate-800 shadow-lg">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate">{t('allGazettes')}</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                {isBengali ? 'জাতীয়  নির্বাচন তদন্ত কমিশনের গেজেট প্রজ্ঞাপন' : 'Gazette notifications from the National Elections Inquiry Commission'}
              </p>
            </div>
            
            <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
              {transformedGazettes.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {isBengali ? 'কোন গেজেট নেই' : 'No gazettes available'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isBengali ? 'নতুন গেজেট প্রজ্ঞাপনের জন্য পরে আবার দেখুন।' : 'Check back later for new gazette notifications.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Card Layout - Hidden on large screens */}
                  <div className="lg:hidden space-y-4">
                    {transformedGazettes.map((gazette, index) => (
                      <div key={gazette.id} className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                              {index + 1}
                            </div>
                            <span className={getPriorityBadge(gazette.priority)}>
                              {isBengali ? 
                               gazette.priority === 'high' ? 'উচ্চ' : 
                               gazette.priority === 'medium' ? 'মধ্যম' : 
                               gazette.priority === 'critical' ? 'জরুরি' : 'নিম্ন' :
                               gazette.priority.charAt(0).toUpperCase() + gazette.priority.slice(1)}
                            </span>
                          </div>
                          <a
                            href={gazette.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-6 8h8a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v11a2 2 0 002 2z" />
                            </svg>
                            {isBengali ? 'ডাউনলোড' : 'Download'}
                          </a>
                        </div>
                        
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 break-words">
                          {gazette.title}
                        </h3>
                        
                        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center justify-between">
                            <span>{isBengali ? 'গেজেট নম্বর:' : 'Gazette No:'}</span>
                            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                              {gazette.gazetteNumber}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{isBengali ? 'বিভাগ:' : 'Category:'}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                              {getCategoryName(gazette.category)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{isBengali ? 'প্রকাশের তারিখ:' : 'Published:'}</span>
                            <span>{new Date(gazette.publishedAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US').replace(/\//g, '-')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table Layout - Hidden on mobile */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
                      <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                          <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {isBengali ? 'ক্রমিক' : 'Serial'}
                          </th>
                          <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {isBengali ? 'গেজেটের শিরোনাম' : 'Gazette Title'}
                          </th>
                          <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {isBengali ? 'গেজেট নম্বর' : 'Gazette No.'}
                          </th>
                          <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {isBengali ? 'বিভাগ' : 'Category'}
                          </th>
                          <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {isBengali ? 'অগ্রাধিকার' : 'Priority'}
                          </th>
                          <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {isBengali ? 'প্রকাশের তারিখ' : 'Published Date'}
                          </th>
                          <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {isBengali ? 'কার্যক্রম' : 'Action'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                        {transformedGazettes.map((gazette, index) => (
                          <tr key={gazette.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                              {index + 1}
                            </td>
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">
                                {gazette.title}
                              </div>
                              {gazette.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {gazette.description.substring(0, 80)}...
                                </div>
                              )}
                            </td>
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                {gazette.gazetteNumber}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                {getCategoryName(gazette.category)}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span className={getPriorityBadge(gazette.priority)}>
                                {isBengali ? 
                                 gazette.priority === 'high' ? 'উচ্চ' : 
                                 gazette.priority === 'medium' ? 'মধ্যম' : 
                                 gazette.priority === 'critical' ? 'জরুরি' : 'নিম্ন' :
                                 gazette.priority.charAt(0).toUpperCase() + gazette.priority.slice(1)}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {new Date(gazette.publishedAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US').replace(/\//g, '-')}
                            </td>
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                              <a
                                href={gazette.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                              >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-6 8h8a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v11a2 2 0 002 2z" />
                                </svg>
                                {isBengali ? 'ডাউনলোড' : 'Download'}
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="mt-6 sm:mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1 sm:mb-2">
                {t('importantNote')}
              </h4>
              <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm leading-relaxed break-words">
                {t('noteDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}