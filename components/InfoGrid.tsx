'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import homeData from '../data/homeData.json';
import type { HomePageData } from '../types/home';

export function InfoGrid() {
  const t = useTranslations();
  const locale = useLocale();
  const isEnglish = locale === 'en';
  const data = (homeData as HomePageData).homePage;
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-600',
          text: 'text-blue-600 hover:text-blue-700',
          dot: 'bg-blue-500'
        };
      case 'green':
        return {
          bg: 'bg-green-600',
          text: 'text-green-600 hover:text-green-700',
          dot: 'bg-green-500'
        };
      case 'purple':
        return {
          bg: 'bg-purple-600',
          text: 'text-purple-600 hover:text-purple-700',
          dot: 'bg-purple-500'
        };
      default:
        return {
          bg: 'bg-gray-600',
          text: 'text-gray-600 hover:text-gray-700',
          dot: 'bg-gray-500'
        };
    }
  };

  return (
    <section className="grid gap-4 sm:gap-6 md:grid-cols-3" aria-label="Home sections">
      {data.sections.map((section) => {
        const colors = getColorClasses(section.color);
        
        return (
          <div key={section.id} className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${colors.bg} rounded-lg flex items-center justify-center mr-2 sm:mr-3`}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                </svg>
              </div>
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">{t(section.titleKey as any)}</h4>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{t(section.textKey as any)}</p>
            
            {/* Section Items (for how to participate) */}
            {section.items && (
              <ul className="space-y-1.5 sm:space-y-2">
                {section.items.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className={`flex-shrink-0 w-1.5 h-1.5 sm:w-2 sm:h-2 ${colors.dot} rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3`}></div>
                    <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{t(item.key as any)}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {/* Section Link (for reporting guidelines) */}
            {section.link && (
              <Link 
                href={`/${locale}${section.link.href}`}
                className={`inline-flex items-center ${colors.text} font-medium text-xs sm:text-sm transition-colors`}
              >
                {section.link.text[locale as keyof typeof section.link.text]}
                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            
            {/* Section Links (for quick links) */}
            {section.links && (
              <div className="space-y-2">
                {section.links.map((link, index) => (
                  <Link 
                    key={index}
                    href={`/${locale}${link.href}`}
                    className={`flex items-center ${colors.text} font-medium text-sm transition-colors`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                    </svg>
                    {t(link.key as any)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
