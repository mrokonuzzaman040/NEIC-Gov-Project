'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NotFound() {
  const pathname = usePathname();
  // Detect locale from the current pathname
  const locale = pathname.startsWith('/bn') ? 'bn' : 'en';
  
  // Bilingual content
  const content = {
    en: {
      title: 'Page Not Found',
      subtitle: 'The page you are looking for does not exist.',
      description: 'It might have been moved, deleted, or you entered the wrong URL.',
      homeButton: 'Go to Homepage',
      reportButton: 'Report Issue',
      importantNotice: 'Important Notice',
      noticeText: 'If you believe this is an error, please',
      noticeText2: 'to our technical team for immediate assistance.',
      commissionName: 'Bangladesh National Elections Inquiry Commission',
      commissionSubtitle: 'National Elections (2014, 2018, 2024) Inquiry Commission',
      errorCode: 'Error Code: 404',
      pageNotFound: 'Page Not Found'
    },
    bn: {
      title: 'পৃষ্ঠা পাওয়া যায়নি',
      subtitle: 'আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই।',
      description: 'অনুরোধকৃত পৃষ্ঠাটি খুঁজে পাওয়া যায়নি। এটি ঘটতে পারে যদি পৃষ্ঠাটি সরানো, মুছে ফেলা হয় বা আপনি ভুল URL প্রবেশ করান।',
      homeButton: 'হোমে ফিরুন',
      reportButton: 'সমস্যা রিপোর্ট করুন',
      importantNotice: 'গুরুত্বপূর্ণ বিজ্ঞপ্তি',
      noticeText: 'যদি আপনি মনে করেন এটি একটি ত্রুটি, অনুগ্রহ করে',
      noticeText2: 'আমাদের প্রযুক্তিগত দলের সাথে যোগাযোগ করুন।',
      commissionName: 'বাংলাদেশ জাতীয় জাতীয় সংসদ নির্বাচন তদন্ত কমিশন',
      commissionSubtitle: 'জাতীয় সংসদ নির্বাচন (২০১৪, ২০১৮ ও ২০২৪) তদন্ত কমিশন',
      errorCode: 'ত্রুটি কোড: ৪০৪',
      pageNotFound: 'পৃষ্ঠা পাওয়া যায়নি'
    }
  };
  
  const t = content[locale as keyof typeof content];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        {/* Government Header */}
        <div className="bg-white dark:bg-slate-800 shadow-lg border-l-4 border-red-600 mb-8">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Official Seal/Logo */}
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t.commissionName}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t.commissionSubtitle}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.errorCode}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {t.pageNotFound}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8 text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-full mb-6">
              <svg 
                className="w-12 h-12 text-red-500 dark:text-red-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
                />
              </svg>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
          </div>

          {/* Content */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              {t.subtitle}
            </p>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              {t.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href={`/${locale}`}
              className="inline-flex items-center justify-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              {t.homeButton}
            </Link>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5 mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}