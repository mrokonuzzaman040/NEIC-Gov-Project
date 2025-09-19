"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  // Remove leading /locale segment
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale = segments[0];
  const rest = segments.slice(1).join('/');
  const other = locale === 'bn' ? 'en' : 'bn';
  const target = `/${other}/${rest}`.replace(/\/$/, '');
  return (
    <Link 
      href={target as any} 
      prefetch 
      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm" 
      aria-label="Switch language"
    >
      {other === 'bn' ? 'বাংলা' : 'EN'}
    </Link>
  );
}
