"use client";
import { signOut } from 'next-auth/react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function SignOutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/' })} 
      className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
    >
      <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
      Sign Out
    </button>
  );
}
