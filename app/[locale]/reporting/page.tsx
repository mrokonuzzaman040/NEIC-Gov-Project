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
    title: `${locale === 'en' ? 'Service Process' : 'তথ্য/অভিযোগ জমা দান প্রক্রিয়া'} - Bangladesh National Elections Inquiry Commission`,
    description: locale === 'en' ? 'Learn about our service delivery process and how to access commission services' : 'আমাদের তথ্য/অভিযোগ জমা দান প্রক্রিয়া এবং কমিশনের সেবা কীভাবে পাওয়া যায় তা জানুন',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back to Home Link */}
        <div className="mb-8">
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 text-green-600 hover:text-green-700 font-medium transition-all duration-200 rounded-lg shadow-sm hover:shadow-md border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {isEnglish ? 'Back to Home' : 'হোম'}
          </Link>
        </div>

        {/* Service Process Steps */}
        <div className="space-y-8">
          {/* Step 1: Service Request */}
          <section className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
            <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 px-6 sm:px-8 lg:px-10 py-6 sm:py-8">
              <div className="flex items-center">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                    {isEnglish ? 'Service Request Submission' : 'তথ্য/অভিযোগ জমা দান প্রক্রিয়া'}
                  </h2>
                  <p className="text-green-100 text-sm sm:text-base">
                    {isEnglish 
                      ? 'Choose your preferred method to submit your service request'
                      : 'আপনার সেবা অনুরোধ জমা দেওয়ার জন্য পছন্দের পদ্ধতি নির্বাচন করুন'
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Online Submission Card */}
                <Link 
                  href={`/${locale}/submit`}
                  className="group relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 hover:scale-105 block"
                >
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {isEnglish ? 'Online Submission' : 'অনলাইন জমা'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                      {isEnglish 
                        ? 'Submit your service request through our secure online portal with detailed information and supporting documents. Available 24/7 for your convenience.'
                        : 'বিস্তারিত তথ্য এবং সহায়ক নথিসহ আমাদের নিরাপদ অনলাইন পোর্টালের মাধ্যমে আপনার তথ্য/অভিযোগ জমা দিন।'
                      }
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>{isEnglish ? 'Secure & Encrypted' : 'নিরাপদ ও এনক্রিপ্টেড'}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                      <span>{isEnglish ? 'Click to Submit Online' : 'অনলাইনে জমা দিতে ক্লিক করুন'}</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* In-Person Visit Card */}
                <Link 
                  href={`/${locale}/contact`}
                  className="group relative bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 hover:scale-105 block"
                >
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {isEnglish ? 'In-Person Visit' : 'ব্যক্তিগত সাক্ষাৎ'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                      {isEnglish 
                        ? 'Visit our office during business hours for face-to-face consultation and document submission. Our staff will assist you personally.'
                        : 'সাক্ষাৎকার এবং নথি জমা দেওয়ার জন্য অফিস সময়ে আমাদের অফিসে আসুন। আমাদের কর্মকর্তা-কর্মচারী বৃন্দ সহায়তা করবে। '
                      }
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-orange-600 dark:text-orange-400 text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{isEnglish ? 'Business Hours: 9AM-5PM' : 'অফিস সময়: সকাল ৯টা-বিকাল ৫টা'}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-center text-orange-600 dark:text-orange-400 text-sm font-medium">
                      <span>{isEnglish ? 'Click to Contact Us' : 'যোগাযোগ করতে ক্লিক করুন'}</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}