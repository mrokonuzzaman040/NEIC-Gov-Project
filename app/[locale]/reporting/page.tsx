import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Link from 'next/link';
import type { ReportingPageData, ReportingPageSection, ReportingGuideline } from '@/types/reporting';

// Force dynamic rendering to ensure fresh data from APIs
export const dynamic = 'force-dynamic';

interface ReportingProps {
  params: {
    locale: string;
  };
}

// Fetch reporting data from API
async function fetchReportingData() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/reporting`, {
      cache: 'no-store' // Ensure fresh data
    });
    if (!response.ok) {
      throw new Error('Failed to fetch reporting data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reporting data:', error);
    // Fallback to static data
    const reportingData = await import('@/data/reportingData.json');
    return reportingData.default;
  }
}

export async function generateMetadata({ params: { locale } }: ReportingProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'reporting' });
  
  return {
    title: `${locale === 'en' ? 'Service Process' : 'সেবা গ্রহণের প্রক্রিয়া'} - Bangladesh National Elections Inquiry Commission`,
    description: locale === 'en' ? 'Learn about our service delivery process and how to access commission services' : 'আমাদের সেবা প্রদানের প্রক্রিয়া এবং কমিশনের সেবা কীভাবে পাওয়া যায় তা জানুন',
  };
}

export default async function ReportingPage({ params: { locale } }: ReportingProps) {
  const t = await getTranslations({ locale, namespace: 'reporting' });
  const isEnglish = locale === 'en';
  
  // Fetch dynamic data from API
  const reportingData = await fetchReportingData();
  const data = (reportingData as ReportingPageData).reportingPage;

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          gradient: 'from-green-600 to-green-700',
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: 'text-green-600',
          dot: 'bg-green-600'
        };
      case 'amber':
        return {
          gradient: 'from-amber-600 to-amber-700',
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800',
          icon: 'text-amber-600',
          dot: 'bg-amber-600'
        };
      case 'blue':
        return {
          gradient: 'from-blue-600 to-blue-700',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600',
          dot: 'bg-blue-600'
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
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Back to Home Link */}
        <div className="mb-4 sm:mb-6">
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {isEnglish ? 'Back to Home' : 'হোমপেজ'}
          </Link>
        </div>

        {/* Service Process Steps */}
        <div className="space-y-6 sm:space-y-8">
          {/* Step 1: Service Request */}
          <section className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate">{isEnglish ? 'Step 1: Service Request' : 'তথ্য/অভিযোগ প্রদানের প্রক্রিয়া'}</span>
              </h2>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6 text-center">
                  <div className="mb-3 sm:mb-4">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                    {isEnglish ? 'Online Submission' : 'অনলাইনে জমা'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                    {isEnglish 
                      ? 'Submit your service request through our secure online portal with detailed information and supporting documents.'
                      : 'বিস্তারিত তথ্য এবং সহায়ক নথি সহ আমাদের নিরাপদ অনলাইন পোর্টালের মাধ্যমে আপনার তথ্য/অভিযোগ  জমা দিন।'
                    }
                  </p>
                </div>
                {/* <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6 text-center">
                  <div className="mb-3 sm:mb-4">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                    {isEnglish ? 'Phone Contact' : 'ফোন যোগাযোগ'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                    {isEnglish 
                      ? 'Call our helpline during office hours for immediate assistance and guidance on service requirements.'
                      : 'সেবার প্রয়োজনীয়তা সম্পর্কে তাৎক্ষণিক সহায়তা এবং নির্দেশনার জন্য অফিস সময়ে আমাদের হেল্পলাইনে ফোন করুন।'
                    }
                  </p>
                </div> */}
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 sm:p-6 text-center">
                  <div className="mb-3 sm:mb-4">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                    {isEnglish ? 'In-Person Visit' : 'ব্যক্তিগত সাক্ষাৎ'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                    {isEnglish 
                      ? 'Visit our office during business hours for face-to-face consultation and document submission.'
                      : 'সাক্ষাৎকার এবং নথি জমা দেওয়ার জন্য অফিস সময়ে আমাদের অফিসে আসুন।'
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}