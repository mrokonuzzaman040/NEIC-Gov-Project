import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-static';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'rateLimit' });
  return {
    title: t('title'),
    description: t('description')
  };
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'bn' }];
}

export default async function RateLimitPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('rateLimit');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="bg-white dark:bg-slate-900/70 shadow-2xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-200/70 dark:border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="bg-green-600/10 dark:bg-green-500/10 border-b border-green-500/20 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-green-600 text-white flex items-center justify-center shadow-inner shadow-green-900/30 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v3m0 3h.01M5.455 19h13.09c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.723 16.5C2.953 17.333 3.915 19 5.455 19z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm uppercase tracking-widest text-green-700 dark:text-green-300 font-semibold">{t('badge')}</p>
                  <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 dark:text-white leading-tight break-words">{t('title')}</h1>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-300 flex items-center gap-2 sm:ml-4">
                <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="break-words">{t('errorCode')}</span>
              </span>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 lg:py-8 xl:py-12 space-y-6 sm:space-y-8 lg:space-y-10">
            <section className="space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                {t('description')}
              </p>
              <p className="text-xs sm:text-sm lg:text-base text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl px-3 sm:px-4 lg:px-5 py-3 sm:py-4 break-words">
                {t('retry')}
              </p>
            </section>

            <section className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-3">
              <article className="lg:col-span-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/70 border border-slate-200/70 dark:border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-inner">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="break-words">{t('tipsTitle')}</span>
                </h2>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <span className="mt-1.5 sm:mt-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                    <span className="break-words">{t('tip1')}</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <span className="mt-1.5 sm:mt-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                    <span className="break-words">{t('tip2')}</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <span className="mt-1.5 sm:mt-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                    <span className="break-words">{t('tip3')}</span>
                  </li>
                </ul>
              </article>
              <aside className="bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-amber-700/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg shadow-amber-100/50 dark:shadow-amber-950/30">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500/90 text-white flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-amber-800 dark:text-amber-300 break-words">{t('supportTitle')}</h3>
                </div>
                <p className="text-xs sm:text-sm lg:text-base text-amber-800/80 dark:text-amber-200 leading-relaxed break-words">
                  {t('supportDescription')}
                </p>
              </aside>
            </section>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 sm:items-center sm:justify-between bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 lg:px-6 py-4 sm:py-5">
              <div className="flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-300 text-xs sm:text-sm lg:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 01.633 0l6.482 3.241a.75.75 0 01.418.67v2.14a.75.75 0 01-1.067.678L12 15.25l-5.758 2.709a.75.75 0 01-1.067-.678v-2.14a.75.75 0 01.418-.67l5.682-2.841a.75.75 0 01.64-.03z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 11.25V6.75a2.25 2.25 0 00-1.5-2.122l-5.25-1.75a2.25 2.25 0 00-1.5 0l-5.25 1.75A2.25 2.25 0 004.5 6.75v4.5m15 0l-7.5 3.75m-7.5-3.75l7.5 3.75" />
                </svg>
                <span className="font-medium break-words">{t('errorCode')}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <Link
                  href={`/${locale}`}
                  className="inline-flex items-center justify-center px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm lg:text-base font-semibold transition-colors w-full sm:w-auto"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="break-words">{t('backHome')}</span>
                </Link>
                <a
                  href="mailto:support@ec.gov.bd"
                  className="inline-flex items-center justify-center px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-100 text-xs sm:text-sm lg:text-base font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="break-words">{t('contactSupport')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
