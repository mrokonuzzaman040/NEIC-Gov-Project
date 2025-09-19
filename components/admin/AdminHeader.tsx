"use client";
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  UserCircleIcon, 
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import SignOutButton from './SignOutButton';
import Notifications from './Notifications';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';

interface AdminHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export default function AdminHeader({ onMenuToggle, isSidebarOpen }: AdminHeaderProps) {
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const user = session?.user as any;

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
      {/* Left side - Menu toggle and title */}
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
        <button
          onClick={onMenuToggle}
          className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors lg:hidden flex-shrink-0"
        >
          {isSidebarOpen ? (
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </button>
        
        <div className="hidden lg:block min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
            Dashboard
          </h1>
        </div>
      </div>

      {/* Right side - Language, Theme, Notifications and user menu */}
      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
        {/* Language Switcher */}
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Notifications />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div className="hidden md:block text-left min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.role || 'Administrator'}
              </p>
            </div>
            <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
          </button>

          {/* Dropdown menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
              <div className="px-3 sm:px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
              <div className="py-1">
                <a href="/en/admin/profile" className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Profile Settings
                </a>
                <a href="/en/admin/change-password" className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Change Password
                </a>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 py-1">
                <SignOutButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
