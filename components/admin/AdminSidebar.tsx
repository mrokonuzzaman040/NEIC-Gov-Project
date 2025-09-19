"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  UsersIcon, 
  UserIcon,
  CogIcon, 
  ChartBarIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PhotoIcon,
  QuestionMarkCircleIcon,
  MegaphoneIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

// Navigation items will be created dynamically with current locale

export default function AdminSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommissionOpen, setIsCommissionOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Create navigation arrays with current locale
  const navigation: NavItem[] = [
    { name: 'Dashboard', href: `/${locale}/admin`, icon: HomeIcon },
    { name: 'Submissions', href: `/${locale}/admin/submissions`, icon: DocumentTextIcon },
    { name: 'Gallery', href: `/${locale}/admin/gallery`, icon: PhotoIcon },
    { name: 'Users', href: `/${locale}/admin/users`, icon: UsersIcon },
    { name: 'Reports', href: `/${locale}/admin/reports`, icon: ChartBarIcon },
    { name: 'Audit Logs', href: `/${locale}/admin/audit`, icon: ClipboardDocumentListIcon },
  ];

  const settingsNavigation: NavItem[] = [
    { name: 'Slider Management', href: `/${locale}/admin/settings/sliders`, icon: PhotoIcon },
    { name: 'Blog Management', href: `/${locale}/admin/settings/blog`, icon: DocumentTextIcon },
    { name: 'FAQ Management', href: `/${locale}/admin/settings/faq`, icon: QuestionMarkCircleIcon },
    { name: 'Notice Management', href: `/${locale}/admin/settings/notices`, icon: MegaphoneIcon },
    { name: 'Contact Management', href: `/${locale}/admin/settings/contact`, icon: PhoneIcon },
    { name: 'System Settings', href: `/${locale}/admin/settings/system`, icon: CogIcon },
  ];

  const commissionNavigation: NavItem[] = [
    { name: 'Commission Members', href: `/${locale}/admin/commission/members`, icon: UserGroupIcon },
    { name: 'Commission Officials', href: `/${locale}/admin/commission/officials`, icon: UsersIcon },
    { name: 'Terms of Reference', href: `/${locale}/admin/commission/terms`, icon: DocumentCheckIcon },
    { name: 'Gazettes', href: `/${locale}/admin/commission/gazettes`, icon: NewspaperIcon },
  ];

  // Fix hydration issues by ensuring client-side rendering
  useEffect(() => {
    setIsMounted(true);
    // Auto-open dropdowns based on current path
    if (pathname.startsWith(`/${locale}/admin/settings`)) {
      setIsSettingsOpen(true);
    }
    if (pathname.startsWith(`/${locale}/admin/commission`)) {
      setIsCommissionOpen(true);
    }
  }, [pathname, locale]);

  // Prevent hydration issues by not rendering dropdowns until mounted
  if (!isMounted) {
    return (
      <div className="flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-full">
        {/* Logo/Brand */}
        <div className="flex items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Admin Panel
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Election Commission
              </p>
            </div>
          </div>
        </div>
        {/* Loading state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-full">
      {/* Logo/Brand */}
      <div className="flex items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Admin Panel
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Election Commission
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href as any}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-r-2 border-green-500'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive
                    ? 'text-green-500 dark:text-green-400'
                    : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300'
                }`}
              />
              <span className="flex-1">{item.name}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

            {/* Commission Info Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsCommissionOpen(!isCommissionOpen)}
                className={`group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  pathname.startsWith('/en/admin/commission')
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-r-2 border-green-500'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center">
                  <BuildingOfficeIcon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      pathname.startsWith('/en/admin/commission')
                        ? 'text-green-500 dark:text-green-400'
                        : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span className="flex-1">Commission Info</span>
                </div>
                {isCommissionOpen ? (
                  <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {/* Commission Submenu */}
              {isCommissionOpen && (
                <div className="ml-6 space-y-1">
                  {commissionNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href as any}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-r-2 border-green-500'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        <item.icon
                          className={`mr-3 h-4 w-4 flex-shrink-0 ${
                            isActive
                              ? 'text-green-500 dark:text-green-400'
                              : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300'
                          }`}
                        />
                        <span className="flex-1">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Settings Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  pathname.startsWith('/en/admin/settings')
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-r-2 border-green-500'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
            <div className="flex items-center">
              <CogIcon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  pathname.startsWith('/en/admin/settings')
                    ? 'text-green-500 dark:text-green-400'
                    : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300'
                }`}
              />
              <span className="flex-1">Settings</span>
            </div>
            {isSettingsOpen ? (
              <ChevronDownIcon className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {/* Settings Submenu */}
          {isSettingsOpen && (
            <div className="ml-6 space-y-1">
              {settingsNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href as any}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-r-2 border-green-500'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-4 w-4 flex-shrink-0 ${
                        isActive
                          ? 'text-green-500 dark:text-green-400'
                          : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300'
                      }`}
                    />
                    <span className="flex-1">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Quick Actions */}
      <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700">
        <div className="space-y-2">
          <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-colors">
            <BellIcon className="mr-3 h-5 w-5 text-slate-400" />
            Notifications
          </button>
        </div>
      </div>
    </div>
  );
}
