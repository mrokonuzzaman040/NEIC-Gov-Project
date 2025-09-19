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
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
      {/* Left side - Menu toggle and title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors lg:hidden"
        >
          {isSidebarOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
        
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
        </div>
      </div>

      {/* Right side - Language, Theme, Notifications and user menu */}
      <div className="flex items-center space-x-4">
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
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <UserCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.role || 'Administrator'}
              </p>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-slate-400" />
          </button>

          {/* Dropdown menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
              <div className="py-1">
                <a href="/en/admin/profile" className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Profile Settings
                </a>
                <a href="/en/admin/change-password" className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
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
