'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ error, reset }: ErrorProps) {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const t = useTranslations('error.global');

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Locale error:', error);
  }, [error]);

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
                    Bangladesh National Elections Inquiry Commission
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    National Elections (2014, 2018, 2024) Inquiry Commission
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  System Error
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Technical Issue
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8 text-center">
          {/* Error Icon */}
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Oops!
            </h1>
          </div>

          {/* Content */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              {t('subtitle')}
            </p>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              {t('description')}
            </p>
          </div>

          {/* Error Details (Development Mode) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Error Details (Development Mode)
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400 font-mono bg-white dark:bg-slate-800 p-3 rounded border">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 dark:text-red-500 mt-2 font-medium">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={reset}
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              {t('refresh')}
            </button>
            
            <Link 
              href={`/${locale}`}
              className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-slate-800 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold rounded-lg transition-colors"
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
              {t('homeButton')}
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
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Important Notice
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                  If this error persists, please{' '}
                  <Link 
                    href={`/${locale}/reporting`}
                    className="text-green-600 dark:text-green-400 hover:underline font-medium"
                  >
                    report the issue
                  </Link>
                  {' '}to our technical team for immediate assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
