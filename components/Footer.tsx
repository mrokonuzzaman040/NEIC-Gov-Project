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
    <footer className="bg-white dark:bg-slate-800 shadow-lg border-t border-gray-200 dark:border-slate-700 mt-8" role="contentinfo">
      <div className="px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {data.footer.title[locale as keyof typeof data.footer.title]}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {data.footer.subtitle[locale as keyof typeof data.footer.subtitle]}
              </p>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
              {t('footer.tagline')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {data.footer.copyright[locale as keyof typeof data.footer.copyright]}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
