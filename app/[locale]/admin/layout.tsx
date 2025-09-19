"use client";
import { ReactNode, useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import SessionProvider from '@/components/providers/SessionProvider';
import { useParams } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';

// Force dynamic rendering for all admin pages
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<any>(null);
  const params = useParams();
  const locale = params?.locale as string || 'en';

  useEffect(() => {
    // Load messages for the current locale
    const loadMessages = async () => {
      try {
        const msgs = await import(`../../../messages/${locale}.json`);
        setMessages(msgs.default);
      } catch (error) {
        console.error('Failed to load messages:', error);
        // Fallback to empty object
        setMessages({});
      }
    };
    loadMessages();
  }, [locale]);

  if (!messages) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <SessionProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          <div className="flex h-screen">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <AdminSidebar />
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
              <AdminHeader 
                onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                isSidebarOpen={isSidebarOpen}
              />
              
              <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
