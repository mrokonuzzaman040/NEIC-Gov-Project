"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import navigationData from '@/data/navigation.json';
import type { NavigationData } from '@/types/navigation';

interface MobileMenuProps {
  locale: string;
}

export default function MobileMenu({ locale }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Create language switch link
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale = segments[0];
  const rest = segments.slice(1).join('/');
  const other = locale === 'bn' ? 'en' : 'bn';
  const target = `/${other}/${rest}`.replace(/\/$/, '');

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="lg:hidden relative p-2 sm:p-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 active:scale-95"
        aria-label="Open mobile menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      
      {/* Mobile Navigation Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-screen w-72 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
              <h2 className="text-white font-semibold text-base sm:text-lg">{locale === 'bn' ? 'মেনু' : 'Menu'}</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-green-200 transition-colors p-1"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Menu Content */}
            <div className="px-3 py-4 sm:px-4 sm:py-6 space-y-2 overflow-y-auto h-[calc(100vh-70px)] sm:h-[calc(100vh-80px)] pb-6">
              {(navigationData as NavigationData).navigation.main.map((item) => {
                if (item.type === 'link') {
                  return (
                    <a 
                      key={item.id}
                      href={`/${locale}${item.href}`} 
                      className="flex items-center px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-slate-800 hover:text-green-700 dark:hover:text-green-400 font-medium transition-all duration-200 group text-sm sm:text-base"
                      onClick={() => setIsOpen(false)}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-green-600 group-hover:text-green-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <span className="truncate">{item.label[locale as keyof typeof item.label]}</span>
                    </a>
                  );
                } else if (item.type === 'dropdown') {
                  return (
                    <div key={item.id} className="mb-3 sm:mb-4">
                      <div className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider border-b border-green-100 dark:border-slate-700 mb-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        <span className="truncate">{item.label[locale as keyof typeof item.label]}</span>
                      </div>
                      <div className="space-y-1">
                        {item.children?.map((child) => (
                          <a 
                            key={child.id}
                            href={`/${locale}${child.href}`} 
                            className="flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-slate-800 hover:text-green-700 dark:hover:text-green-400 transition-all duration-200 text-xs sm:text-sm group ml-3 sm:ml-4"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-2 sm:mr-3 group-hover:bg-green-600 flex-shrink-0"></div>
                            <span className="truncate">{child.label[locale as keyof typeof child.label]}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
               
               {/* Language Switcher */}
               <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-700">
                 <Link 
                   href={target as any} 
                   prefetch 
                   className="flex items-center justify-center px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base" 
                   aria-label="Switch language"
                   onClick={() => setIsOpen(false)}
                 >
                   <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                   </svg>
                   <span className="truncate">{other === 'bn' ? 'বাংলা' : 'English'}</span>
                 </Link>
               </div>
             </div>
           </div>
         </>
       )}
    </>
  );
}
