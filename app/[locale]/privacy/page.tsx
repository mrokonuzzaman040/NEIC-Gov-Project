import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Calendar } from 'lucide-react';
import Link from 'next/link';
import privacyData from '@/data/privacyData.json';
import type { PrivacyPageData, PrivacyPageSection, PrivacyPageSubsection, PrivacyContactInfo } from '@/types/privacy';

interface PrivacyProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params: { locale } }: PrivacyProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'privacy' });
  
  return {
    title: `${t('title')} - Bangladesh National Elections Inquiry Commission`,
    description: t('description'),
  };
}

export default async function PrivacyPage({ params: { locale } }: PrivacyProps) {
  const t = await getTranslations({ locale, namespace: 'privacy' });
  const isEnglish = locale === 'en';
  const data = (privacyData as PrivacyPageData).privacyPage;

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          gradient: 'from-blue-600 to-blue-700',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600',
          dot: 'bg-blue-600'
        };
      case 'green':
        return {
          gradient: 'from-green-600 to-green-700',
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: 'text-green-600',
          dot: 'bg-green-600'
        };
      case 'purple':
        return {
          gradient: 'from-purple-600 to-purple-700',
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          icon: 'text-purple-600',
          dot: 'bg-purple-600'
        };
      case 'orange':
        return {
          gradient: 'from-orange-600 to-orange-700',
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          icon: 'text-orange-600',
          dot: 'bg-orange-600'
        };
      default:
        return {
          gradient: 'from-gray-600 to-gray-700',
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          icon: 'text-gray-600',
          dot: 'bg-gray-600'
        };
    }
  };
  
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Government Header with Official Seal */}
        <div className="bg-white dark:bg-slate-800 shadow-lg border-l-4 border-green-600 mb-8">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Official Seal/Logo */}
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.header.title[locale as keyof typeof data.header.title]}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {data.header.subtitle[locale as keyof typeof data.header.subtitle]}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {data.header.documentType[locale as keyof typeof data.header.documentType]}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {data.header.tagline[locale as keyof typeof data.header.tagline]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mb-6">
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {data.navigation.backToHome[locale as keyof typeof data.navigation.backToHome]}
          </Link>
        </div>

        {/* Description Section */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {t('description')}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {data.sections.map((section: PrivacyPageSection) => {
            const colors = getColorClasses(section.color);
            
            return (
              <section key={section.id} className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${colors.gradient} px-8 py-6`}>
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                    </svg>
                    {t(section.titleKey as any)}
                  </h2>
                </div>
                <div className="p-8">
                  {section.subsections ? (
                    // Section with subsections (like Information Collection and Data Protection)
                    <div className="grid md:grid-cols-2 gap-8">
                      {section.subsections.map((subsection: PrivacyPageSubsection) => {
                        const subColors = getColorClasses(subsection.color);
                        return (
                          <div key={subsection.id} className={`${subColors.bg} ${subColors.border} border rounded-lg p-6`}>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                              <svg className={`w-5 h-5 ${subColors.icon} mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={subsection.icon} />
                              </svg>
                              {t(subsection.titleKey as any)}
                            </h3>
                            <ul className="space-y-3">
                              {t.raw(subsection.itemsKey as any).map((item: string, index: number) => (
                                <li key={index} className="flex items-start">
                                  <div className={`flex-shrink-0 w-5 h-5 ${subColors.dot} rounded-full flex items-center justify-center mt-0.5 mr-3`}>
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  ) : section.contactInfo ? (
                    // Contact section
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                          {t(section.descriptionKey as any)}
                        </p>
                      </div>
                      <div className="space-y-4">
                        {section.contactInfo.map((contact: PrivacyContactInfo, index: number) => (
                          <div key={index} className={`flex items-center gap-3 p-4 rounded-lg ${colors.bg} ${colors.border} border`}>
                            <svg className={`w-5 h-5 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={contact.icon} />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{t(contact.key as any)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : section.itemsKey ? (
                    // Section with items (like Usage and Rights)
                    <div className="grid md:grid-cols-2 gap-6">
                      {t.raw(section.itemsKey as any).map((item: any, index: number) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            <div className={`w-3 h-3 ${colors.dot} rounded-full mr-3`}></div>
                            {item.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })}

          {/* Last Updated */}
          <section className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
              <Calendar className="w-5 h-5" />
              <p className="text-sm font-medium">{t(data.footer.lastUpdatedKey as any)}</p>
            </div>
          </section>

          {/* Important Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5 mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  {data.footer.importantNotice.title[locale as keyof typeof data.footer.importantNotice.title]}
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                  {data.footer.importantNotice.description[locale as keyof typeof data.footer.importantNotice.description]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}