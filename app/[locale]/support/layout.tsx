"use client";
import { ReactNode, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import SessionProvider from '@/components/providers/SessionProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { useParams } from 'next/navigation';

// Support Sidebar Component
function SupportSidebar({ locale }: { locale: string }) {
  return (
    <div className="h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-600">
      <div className="p-4 border-b border-gray-200 dark:border-slate-600">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {locale === 'bn' ? 'সহায়তা প্যানেল' : 'Support Panel'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {locale === 'bn' ? 'নির্বাচন কমিশন' : 'Election Commission'}
        </p>
      </div>
      
      <nav className="p-4 space-y-2">
        <a
          href={`/${locale}/support`}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 border border-transparent hover:border-green-200 dark:hover:border-green-800 transition-colors"
        >
          📊 {locale === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
        </a>
        
        <a
          href={`/${locale}/support/submissions`}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 border border-transparent hover:border-green-200 dark:hover:border-green-800 transition-colors"
        >
          📋 {locale === 'bn' ? 'জমা দেখুন' : 'View Submissions'}
        </a>
        
        <a
          href={`/${locale}/support/profile`}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 border border-transparent hover:border-green-200 dark:hover:border-green-800 transition-colors"
        >
          👤 {locale === 'bn' ? 'প্রোফাইল' : 'Profile'}
        </a>
        
        <div className="pt-4 border-t border-gray-200 dark:border-slate-600">
          <button
            onClick={() => {
              import('next-auth/react').then(({ signOut }) => signOut({ callbackUrl: `/${locale}` }));
            }}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-colors"
          >
            🚪 {locale === 'bn' ? 'সাইন আউট' : 'Sign Out'}
          </button>
        </div>
      </nav>
    </div>
  );
}

// Support Header Component
function SupportHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();
  
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-600 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            ☰
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Support Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome, {session?.user?.name || 'Support Staff'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          <div className="text-right">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">SUPPORT</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Role-based access control
function RequireSupportRole({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return (
      <div className="border-l-4 border-green-600 bg-white dark:bg-slate-800 p-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Checking permissions...</span>
        </div>
      </div>
    );
  }
  
  if (!session) {
    redirect('/login');
  }
  
  const userRole = (session as any)?.role;
  if (!['ADMIN', 'MANAGEMENT', 'SUPPORT'].includes(userRole)) {
    redirect('/unauthorized');
  }
  
  return <>{children}</>;
}

export default function SupportLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const params = useParams();
  const locale = params?.locale as string || 'en';

  return (
    <SessionProvider>
      <RequireSupportRole>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          <div className="flex h-screen">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <SupportSidebar locale={locale} />
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <SupportHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
              
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </div>
      </RequireSupportRole>
    </SessionProvider>
  );
}
