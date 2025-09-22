import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import commissionFormationData from '@/data/commisson/commission_formation.json';
import GovernmentHeader from '@/components/GovernmentHeader';

interface CommissionFormationPageProps {
  params: { locale: string };
}

export default async function CommissionFormationPage({ params }: CommissionFormationPageProps) {
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
          portal={isBengali ? 'কমিশন গঠন' : 'Commission Formation'}
          tagline={isBengali ? 'সরকারি আদেশ ও গঠন প্রক্রিয়া' : 'Government Orders & Formation Process'}
          borderColor="purple"
          iconColor="purple"
        />

        {/* Introduction */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 break-words">
              {isBengali ? 'জাতীয় সংসদ নির্বাচন তদন্ত কমিশন গঠন' : 'National Elections Inquiry Commission Formation'}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {isBengali 
                ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের মন্ত্রিপরিষদ বিভাগের আদেশক্রমে গঠিত তদন্ত কমিশন।'
                : 'An inquiry commission established by order of the Cabinet Division of the Government of the People\'s Republic of Bangladesh.'
              }
            </p>
          </div>
        </div>

        {/* Commission Formation Details */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isBengali ? 'কমিশন গঠন সংক্রান্ত তথ্য' : 'Commission Formation Information'}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Title */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2 sm:mb-3 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {isBengali ? 'শিরোনাম' : 'Title'}
              </h3>
              <p className="text-xs sm:text-sm text-purple-800 dark:text-purple-200 leading-relaxed break-words">
                {commissionFormationData.commission_formation.title[langKey]}
              </p>
            </div>

            {/* Date */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 sm:mb-3 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isBengali ? 'তারিখ' : 'Date'}
              </h3>
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 leading-relaxed break-words">
                {commissionFormationData.commission_formation.date[langKey]}
              </p>
            </div>

            {/* Reference */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6 lg:col-span-2">
              <h3 className="text-base sm:text-lg font-semibold text-green-900 dark:text-green-100 mb-2 sm:mb-3 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {isBengali ? 'আইনি ভিত্তি' : 'Legal Foundation'}
              </h3>
              <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 leading-relaxed break-words">
                {commissionFormationData.commission_formation.reference[langKey]}
              </p>
            </div>
          </div>
        </div>

        {/* Commission Scope */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {isBengali ? 'কমিশনের কার্যপরিধি' : 'Commission Scope'}
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {commissionFormationData.commission_scope.map((scope, index) => (
              <div key={index} className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm lg:text-base text-indigo-800 dark:text-indigo-200 leading-relaxed break-words">
                      {scope[langKey]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commission Powers */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {isBengali ? 'কমিশনের ক্ষমতা' : 'Commission Powers'}
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {commissionFormationData.commission_powers.map((power, index) => (
              <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm lg:text-base text-red-800 dark:text-red-200 leading-relaxed break-words">
                      {power[langKey]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isBengali ? 'গুরুত্বপূর্ণ সময়সীমা' : 'Important Timeline'}
          </h2>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-orange-800 dark:text-orange-200 font-semibold break-words">
                {isBengali 
                  ? 'কমিশন ২০২৫ সালের ৩১ অক্টোবরের মধ্যে তদন্ত প্রতিবেদন সরকারের নিকট দাখিল করবে।'
                  : 'The Commission shall submit its investigation report to the government by October 31, 2025.'
                }
              </p>
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
                {isBengali ? 'গুরুত্বপূর্ণ বিজ্ঞপ্তি' : 'Important Notice'}
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm leading-relaxed break-words">
                {isBengali 
                  ? 'এই কমিশন সরকারি আদেশের মাধ্যমে গঠিত এবং এর সকল কার্যক্রম আইনি কাঠামোর মধ্যে পরিচালিত হচ্ছে। কমিশনের গঠন ও ক্ষমতা ১৯৫৬ সালের তদন্ত কমিশন আইনের অধীনে প্রণীত হয়েছে।' 
                  : 'This commission is established through government orders and all its activities are conducted within the legal framework. The commission\'s formation and powers are established under the Commissions of Inquiry Act, 1956.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
