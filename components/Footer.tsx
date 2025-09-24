'use client';

import { useTranslations, useLocale } from 'next-intl';
import homeData from '../data/homeData.json';
import type { HomePageData } from '../types/home';

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const isEnglish = locale === 'en';
  const data = (homeData as HomePageData).homePage;
  
  return (
    <footer className="bg-white dark:bg-slate-800 shadow-lg border-t border-gray-200 dark:border-slate-700 mt-6 sm:mt-8" role="contentinfo">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white break-words">
                {data.footer.title[locale as keyof typeof data.footer.title]}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                {data.footer.subtitle[locale as keyof typeof data.footer.subtitle]}
              </p>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
              {data.footer.copyright[locale as keyof typeof data.footer.copyright]}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
