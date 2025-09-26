"use client";
import { ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import SessionProvider from '@/components/providers/SessionProvider';
import { useParams } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';

// Force dynamic rendering for all admin pages
export const dynamic = 'force-dynamic';

// SECURITY: Authentication guard component
function AuthGuard({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // CRITICAL: Prevent any content rendering until auth is verified
    if (status === 'loading') {
      setIsChecking(true);
      return;
    }

    if (status === 'unauthenticated' || !session) {
      // Immediate redirect - no content exposure
      router.replace('/bn/login');
      return;
    }

    if (session && !(session as any).user?.isActive) {
      // Account deactivated - immediate redirect
      router.replace('/bn/login?error=AccountDeactivated');
      return;
    }

    // Only allow rendering if authenticated and active
    setIsChecking(false);
  }, [session, status, router]);

  // CRITICAL: Show nothing until authentication is verified
  if (isChecking || status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If we reach here, user is authenticated and active
  return <>{children}</>;
}

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

  // CRITICAL: Don't render anything until messages are loaded
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
        <AuthGuard>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="flex h-screen">
              {/* Sidebar */}
              <div className={`fixed inset-y-0 left-0 z-50 w-56 sm:w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
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
              <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <AdminHeader 
                  onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                  isSidebarOpen={isSidebarOpen}
                />
                
                <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
                  <div className="max-w-7xl mx-auto">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </div>
        </AuthGuard>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
