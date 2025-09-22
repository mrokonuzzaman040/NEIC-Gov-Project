'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import homeData from '../data/homeData.json';
import type { HomePageData } from '../types/home';

export function Hero() {
  const t = useTranslations();
  const locale = useLocale();
  const isEnglish = locale === 'en';
  const data = (homeData as HomePageData).homePage;
  
  return (
    <section className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-green-100 text-xs sm:text-sm tracking-wide font-semibold uppercase">
              {t('banner.subtitle')}
            </h2>
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mt-1 sm:mt-2">
              {t('banner.title')}
            </h1>
          </div>
          <div className="hidden sm:block">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
              {t('banner.lead')}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link 
                href={`/${locale}/submit`} 
                className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t('cta.opinion')}
              </Link>
              <Link 
                href={`/${locale}/submit`} 
                className="inline-flex items-center justify-center border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg transition-all duration-200 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('cta.reporting')}
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-slate-700">
              {data.hero.stats.map((stat) => (
                <div key={stat.id} className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                    {typeof stat.value === 'string' 
                      ? stat.value 
                      : stat.value[locale as keyof typeof stat.value]
                    }
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {stat.label[locale as keyof typeof stat.label]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commission Messages */}
          <div className="lg:col-span-1">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6">
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg text-gray-900 dark:text-white flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {t('slogans.title')}
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {([0,1,2,3]).map(i => (
                  <li key={i} className="flex items-start">
                    <div className="flex-shrink-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3"></div>
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {t(`slogans.list.${i}` as any)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
