import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { Noto_Sans } from 'next/font/google';
import type { Metadata } from 'next';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MobileMenu from '@/components/MobileMenu';
import Logo from '@/components/Logo';
import ErrorBoundary from '@/components/ErrorBoundary';
import navigationData from '@/data/navigation.json';
import type { NavigationData } from '@/types/navigation';

const noto = Noto_Sans({ subsets: ['latin'], weight: ['400','500','600','700'] });

export const metadata: Metadata = {
  title: 'National Elections Inquiry Commission',
  description: 'Bangladesh National Elections Inquiry Commission public submission portal'
};

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: { locale: string } }) {
  const { locale } = params;
  unstable_setRequestLocale(locale);
  const messages = await getMessages({ locale });
  
  if (!['en', 'bn'].includes(locale)) {
    // Not strictly necessary (middleware handles) but safe fallback
    return null;
  }
  return (
    <div className={noto.className} lang={locale}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute left-4 top-4 bg-white dark:bg-slate-800 text-sm px-3 py-2 rounded shadow">Skip to content</a>
      <NextIntlClientProvider messages={messages} locale={locale}>
        {/* Header with Logo and Controls */}
        <header className="w-full border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm relative z-30">
          <div className="container-max">
            <div className="flex items-center justify-between h-12 sm:h-14">
              {/* Logo/Brand */}
              <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 min-w-0 flex-1">
                <Logo size="sm" />
                <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-green-800 dark:text-slate-100 truncate leading-tight">
                  {locale === 'bn' ? 'জাতীয়  নির্বাচন (২০১৪, ২০১৮, ২০২৪) তদন্ত কমিশন' : 'National Elections (2014, 2018, 2024) Inquiry Commission'}
                </div>
              </div>

              {/* Right side: Controls (Language, Theme, Mobile Menu) */}
              <div className="flex items-center space-x-1 sm:space-x-2 relative flex-shrink-0">
                <div className="hidden sm:block">
                  <ErrorBoundary>
                    <LanguageSwitcher />
                  </ErrorBoundary>
                </div>
                <ErrorBoundary>
                  <ThemeToggle />
                </ErrorBoundary>
                <ErrorBoundary>
                  <MobileMenu locale={locale} />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </header>

        {/* Premium Minimal Navigation Section with Dropdowns - Hidden on Mobile */}
        <nav className="hidden lg:block w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm relative z-20">
          <div className="container-max">
            <div className="flex items-center justify-center py-2">
              {/* Desktop Navigation Links */}
              <div className="flex items-center space-x-1">
                {(navigationData as NavigationData).navigation.main.map((item) => {
                  if (item.type === 'link') {
                    return (
                      <a 
                        key={item.id}
                        href={`/${locale}${item.href}`} 
                        className="group relative px-4 py-3 text-base text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors duration-200"
                      >
                        {item.label[locale as keyof typeof item.label]}
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 dark:bg-green-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></div>
                      </a>
                    );
                  } else if (item.type === 'dropdown') {
                    return (
                      <div key={item.id} className="group relative">
                        <button className="flex items-center px-4 py-3 text-base text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors duration-200">
                          {item.label[locale as keyof typeof item.label]}
                          <svg className="ml-1 w-3 h-3 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className="absolute top-full left-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          {item.children?.map((child) => (
                            <a 
                              key={child.id}
                              href={`/${locale}${child.href}`} 
                              className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400"
                            >
                              {child.label[locale as keyof typeof child.label]}
                            </a>
                          ))}
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 dark:bg-green-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        </nav>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}

// Ensure static params for prerendering each locale are registered at the locale segment level.
// Keeping this here (instead of root layout) aligns with Next.js locale segment best practices
// and prevents occasional middleware/context mismatches during dev navigation.
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'bn' }];
}
