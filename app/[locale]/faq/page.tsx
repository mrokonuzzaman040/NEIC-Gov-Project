import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { HelpCircle, MessageCircle, Shield, AlertTriangle, FileText, Phone } from 'lucide-react';
import Link from 'next/link';
import type { FAQPageData, FAQItem } from '@/types/faq';

// Force dynamic rendering to ensure fresh data from APIs
export const dynamic = 'force-dynamic';

// Fetch FAQ data from API
async function fetchFAQData() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/faq`, {
      cache: 'no-store' // Ensure fresh data
    });
    if (!response.ok) {
      throw new Error('Failed to fetch FAQ data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching FAQ data:', error);
    // Fallback to static data
    const faqData = await import('@/data/faqData.json');
    return faqData.default;
  }
}

interface FAQProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params: { locale } }: FAQProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'faq' });
  
  return {
    title: `${t('title')} - Bangladesh National Elections Inquiry Commission`,
    description: t('description'),
  };
}

export default async function FAQPage({ params: { locale } }: FAQProps) {
  const t = await getTranslations({ locale, namespace: 'faq' });
  const isEnglish = locale === 'en';
  
  // Fetch dynamic data from API
  const faqData = await fetchFAQData();
  const data = (faqData as FAQPageData).faqPage;

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
      case 'red':
        return {
          gradient: 'from-red-600 to-red-700',
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: 'text-red-600',
          dot: 'bg-red-600'
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
          {/* FAQ Items */}
          {data.faqs.map((faq: any) => {
            const colors = getColorClasses(faq.color);
            
            return (
              <div key={faq.id} className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${colors.gradient} px-8 py-6`}>
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={faq.icon} />
                    </svg>
                    {faq.questionEn && faq.questionBn ? 
                      (isEnglish ? faq.questionEn : faq.questionBn) : 
                      t(faq.questionKey as any)
                    }
                  </h3>
                </div>
                <div className="p-8">
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    {faq.answerEn && faq.answerBn ? 
                      (isEnglish ? faq.answerEn : faq.answerBn) : 
                      t(faq.answerKey as any)
                    }
                  </p>
                </div>
              </div>
            );
          })}

          {/* Contact Info */}
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={data.contact.icon} />
                </svg>
                {t(data.contact.titleKey as any)}
              </h3>
            </div>
            <div className="p-8">
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                {t(data.contact.descriptionKey as any)}
              </p>
              <Link 
                href={`/${locale}${data.contact.buttonHref}`}
                className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t(data.contact.buttonKey as any)}
              </Link>
            </div>
          </div>

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