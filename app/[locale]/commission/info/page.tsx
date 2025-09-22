
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import commissionMissionData from '@/data/commisson/commission_mission.json';
import GovernmentHeader from '@/components/GovernmentHeader';

interface CommissionInfoPageProps {
  params: { locale: string };
}

export default async function CommissionInfoPage({ params }: CommissionInfoPageProps) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'commission' });
  
  const isBengali = params.locale === 'bn';
  const langKey = isBengali ? 'bn' : 'en';

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Government Header */}
        <GovernmentHeader
          title={isBengali ? 'জাতীয় সংসদ নির্বাচন তদন্ত কমিশন' : 'National Elections Inquiry Commission'}
          subtitle={isBengali ? 'জাতীয় সংসদ নির্বাচন (২০১৪, ২০১৮ ও ২০২৪) তদন্ত কমিশন' : 'National Elections (2014, 2018, 2024) Inquiry Commission'}
          portal={isBengali ? 'কমিশন সম্পর্কে' : 'About the Commission'}
          tagline={isBengali ? 'আমাদের অঙ্গীকার ও লক্ষ্য' : 'Our Mission & Commitment'}
          borderColor="blue"
          iconColor="blue"
        />

        {/* Introduction */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 break-words">
              {isBengali ? 'জাতীয় সংসদ নির্বাচন তদন্ত কমিশন সম্পর্কে' : 'About the National Elections Inquiry Commission'}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {isBengali 
                ? 'বাংলাদেশের গণতান্ত্রিক প্রক্রিয়া শক্তিশালীকরণ এবং নির্বাচনী ব্যবস্থার উন্নয়নের লক্ষ্যে গঠিত তদন্ত কমিশন।'
                : 'An inquiry commission established to strengthen Bangladesh\'s democratic process and improve the electoral system.'
              }
            </p>
          </div>
        </div>

        {/* Commission Overview */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isBengali ? 'কমিশনের পরিচয়' : 'Commission Overview'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 sm:mb-3 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                {isBengali ? 'উদ্দেশ্য' : 'Purpose'}
              </h3>
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                {isBengali 
                  ? 'বিগত তিনটি জাতীয় সংসদ নির্বাচনের নিরপেক্ষ তদন্ত ও বিশ্লেষণ করে ভবিষ্যতের জন্য কার্যকর সুপারিশ প্রদান।'
                  : 'Conduct impartial investigation and analysis of the past three national elections to provide effective recommendations for the future.'
                }
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-green-900 dark:text-green-100 mb-2 sm:mb-3 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isBengali ? 'সময়কাল' : 'Timeline'}
              </h3>
              <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 leading-relaxed">
                {isBengali 
                  ? '২০১৪, ২০১৮ এবং ২০২৪ সালের জাতীয় সংসদ নির্বাচনের তদন্ত। প্রতিবেদন জমা: ৩১ অক্টোবর ২০২৫।'
                  : 'Investigation of 2014, 2018, and 2024 national elections. Report submission: October 31, 2025.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {isBengali ? 'আমাদের অঙ্গীকার' : 'Our Commitment'}
          </h2>
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6 lg:p-8">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-red-600 text-white rounded-full flex items-center justify-center mt-1">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h8a2 2 0 002-2V8" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base lg:text-lg text-red-800 dark:text-red-200 leading-relaxed break-words font-medium">
                  {commissionMissionData.commitment[langKey]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {isBengali ? 'যোগাযোগ' : 'Contact Information'}
          </h2>
          <div className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 sm:p-6">
            <div className="text-center">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                {isBengali 
                  ? 'কমিশনের কার্যক্রম সম্পর্কে আরও জানতে বা মতামত প্রদানের জন্য যোগাযোগ করুন।'
                  : 'Contact us to learn more about the commission\'s activities or to provide your opinions.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <a 
                  href={`/${params.locale}/submit`}
                  className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {isBengali ? 'মতামত প্রদান করুন' : 'Submit Opinion'}
                </a>
                <a 
                  href={`/${params.locale}/contact`}
                  className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {isBengali ? 'যোগাযোগ করুন' : 'Contact Us'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-6 sm:mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-1 sm:mb-2">
                {isBengali ? 'গুরুত্বপূর্ণ তথ্য' : 'Important Information'}
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm leading-relaxed break-words">
                {isBengali 
                  ? 'এই কমিশন সরকারি আদেশের মাধ্যমে গঠিত এবং এর সকল কার্যক্রম আইনি কাঠামোর মধ্যে পরিচালিত হচ্ছে।' 
                  : 'This commission is established through government orders and all its activities are conducted within the legal framework.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
