"use client";
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const locale = useLocale();
  
  // Since we only support Bangla now, just show the current language
  return (
    <div className="px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-xs">
      বাংলা
    </div>
  );
}
