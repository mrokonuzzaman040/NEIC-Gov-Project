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
                    {isEnglish ? 'Service Process' : 'সেবা গ্রহণের প্রক্রিয়া'}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {isEnglish ? 'National Elections (2014, 2018, 2024) Inquiry Commission' : 'জাতীয় সংসদ নির্বাচন (২০১৪, ২০১৮, ২০২৪) তদন্ত কমিশন'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEnglish ? 'Service Guidelines' : 'সেবা নির্দেশিকা'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {isEnglish ? 'Your Service, Our Commitment' : 'আপনার সেবা, আমাদের প্রতিশ্রুতি'}
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
            {isEnglish ? 'Back to Home' : 'হোমে ফিরুন'}
          </Link>
        </div>

        {/* Description Section */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-3 mb-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {isEnglish ? 'Service Process' : 'সেবা গ্রহণের প্রক্রিয়া'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {isEnglish 
                ? 'Learn about our comprehensive service delivery process and how citizens can access various services provided by the National Elections Inquiry Commission.'
                : 'জাতীয় জাতীয় সংসদ নির্বাচন তদন্ত কমিশন কর্তৃক প্রদত্ত বিভিন্ন সেবা এবং নাগরিকরা কীভাবে এই সেবাগুলো পেতে পারেন সে সম্পর্কে বিস্তারিত জানুন।'
              }
            </p>
          </div>
        </div>

        {/* Service Process Steps */}
        <div className="space-y-8">
          {/* Step 1: Service Request */}
          <section className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isEnglish ? 'Step 1: Service Request' : 'ধাপ ১: সেবা অনুরোধ'}
              </h2>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
                  <div className="mb-4">
                    <svg className="w-12 h-12 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {isEnglish ? 'Online Submission' : 'অনলাইন জমা'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {isEnglish 
                      ? 'Submit your service request through our secure online portal with detailed information and supporting documents.'
                      : 'বিস্তারিত তথ্য এবং সহায়ক নথি সহ আমাদের নিরাপদ অনলাইন পোর্টালের মাধ্যমে আপনার সেবা অনুরোধ জমা দিন।'
                    }
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                  <div className="mb-4">
                    <svg className="w-12 h-12 mx-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {isEnglish ? 'Phone Contact' : 'ফোন যোগাযোগ'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {isEnglish 
                      ? 'Call our helpline during office hours for immediate assistance and guidance on service requirements.'
                      : 'সেবার প্রয়োজনীয়তা সম্পর্কে তাত্ক্ষণিক সহায়তা এবং নির্দেশনার জন্য অফিস সময়ে আমাদের হেল্পলাইনে ফোন করুন।'
                    }
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 text-center">
                            <div className="mb-4">
                    <svg className="w-12 h-12 mx-auto text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {isEnglish ? 'In-Person Visit' : 'ব্যক্তিগত সাক্ষাৎ'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {isEnglish 
                      ? 'Visit our office during business hours for face-to-face consultation and document submission.'
                      : 'সাক্ষাৎকার এবং নথি জমা দেওয়ার জন্য ব্যবসায়িক সময়ে আমাদের অফিসে আসুন।'
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Processing */}
          <section className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isEnglish ? 'Step 2: Processing & Review' : 'ধাপ ২: প্রক্রিয়াকরণ ও পর্যালোচনা'}
              </h2>
            </div>
            <div className="p-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {isEnglish ? 'Initial Review' : 'প্রাথমিক পর্যালোচনা'}
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {isEnglish ? 'Document verification and completeness check' : 'নথি যাচাই এবং সম্পূর্ণতা পরীক্ষা'}
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {isEnglish ? 'Eligibility assessment' : 'যোগ্যতা মূল্যায়ন'}
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {isEnglish ? 'Case assignment to appropriate department' : 'উপযুক্ত বিভাগে মামলা বরাদ্দ'}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {isEnglish ? 'Processing Timeline' : 'প্রক্রিয়াকরণ সময়সীমা'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-700 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">
                          {isEnglish ? 'Standard Services' : 'সাধারণ সেবা সময়সীমা'}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {isEnglish ? '3-5 Business Days' : '৩-৫ কর্মদিবস'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-700 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">
                          {isEnglish ? 'Complex Cases' : 'জটিল বিসয়ক সময়সীমা'}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {isEnglish ? '7-14 Business Days' : '৭-১৪ কর্মদিবস'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3: Service Delivery */}
          <section className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isEnglish ? 'Step 3: Service Delivery' : 'ধাপ ৩: সেবা প্রদান'}
              </h2>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {isEnglish ? 'Digital Delivery' : 'ডিজিটাল প্রদান'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {isEnglish 
                          ? 'Receive official documents and responses via secure email and online portal.'
                          : 'নিরাপদ ইমেইল এবং অনলাইন পোর্টালের মাধ্যমে সরকারি নথি এবং প্রতিক্রিয়া পান।'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {isEnglish ? 'Phone Notification' : 'ফোন বিজ্ঞপ্তি'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {isEnglish 
                          ? 'Get notified via phone call when your service is ready for collection.'
                          : 'আপনার সেবা সংগ্রহের জন্য প্রস্তুত হলে ফোন কলের মাধ্যমে জানানো হবে।'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {isEnglish ? 'Office Collection' : 'অফিস সংগ্রহ'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {isEnglish 
                          ? 'Collect physical documents and certificates from our office with proper identification.'
                          : 'সঠিক পরিচয়পত্র সহ আমাদের অফিস থেকে শারীরিক নথি এবং সার্টিফিকেট সংগ্রহ করুন।'
                        }
                            </p>
                          </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {isEnglish ? 'Follow-up Support' : 'অনুসরণ সহায়তা'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {isEnglish 
                          ? 'Ongoing support and assistance for any questions or concerns about your service.'
                          : 'আপনার সেবা সম্পর্কে কোন প্রশ্ন বা উদ্বেগের জন্য চলমান সহায়তা এবং সহায়তা।'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
                  {isEnglish ? 'Important Notice' : 'গুরুত্বপূর্ণ বিজ্ঞপ্তি'}
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                  {isEnglish 
                    ? 'All service requests are processed with strict confidentiality and security. Please ensure all required documents are submitted correctly to avoid delays. For urgent matters, contact our emergency helpline.'
                    : 'সমস্ত সেবা অনুরোধ কঠোর গোপনীয়তা এবং নিরাপত্তার সাথে প্রক্রিয়াজাত করা হয়। বিলম্ব এড়াতে অনুগ্রহ করে সমস্ত প্রয়োজনীয় নথি সঠিকভাবে জমা দিন। জরুরি বিষয়ের জন্য আমাদের জরুরি হেল্পলাইনে যোগাযোগ করুন।'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}