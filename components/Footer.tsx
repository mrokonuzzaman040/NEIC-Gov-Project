'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import homeData from '../data/homeData.json';
import type { HomePageData } from '../types/home';

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const isEnglish = locale === 'en';
  const data = (homeData as HomePageData).homePage;
  
  return (
    <footer className="bg-white dark:bg-slate-800 shadow-lg border-t border-gray-200 dark:border-slate-700 mt-6 sm:mt-8" role="contentinfo">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Main footer content */}
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 mb-6">
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
              {/* <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {data.footer.subtitle[locale as keyof typeof data.footer.subtitle]}
              </p> */}
            </div>
          </div>
          
          <div className="text-center lg:text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
              {data.footer.copyright[locale as keyof typeof data.footer.copyright]}
            </p>
          </div>
        </div>
        
        {/* Technical Support Section */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-3 lg:space-y-0">
            {/* Left side - Technical Support with Logo */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {data.footer.technicalSupport[locale as keyof typeof data.footer.technicalSupport]}
              </span>
              <div className="flex items-center">
                {/* GenAI BD Logo with Link */}
                <a 
                  href="https://genaibd.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity duration-200"
                >
                  <div className="w-16 h-10 flex items-center justify-center flex-shrink-0">
                    <Image
                      src="/GenAl-logo.svg"
                      alt="GenAI BD Logo"
                      width={64}
                      height={40}
                      className="object-contain filter dark:invert-0 invert"
                    />
                  </div>
                </a>
              </div>
            </div>
            
            {/* Right side - Developer */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <a 
                href="https://www.linkedin.com/in/rokonuzzaman040/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 underline decoration-dotted underline-offset-2"
              >
                {data.footer.developer[locale as keyof typeof data.footer.developer]}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}