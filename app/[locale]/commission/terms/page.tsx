import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import commissionScopeData from '@/data/commisson/commission_scope.json';
import GovernmentHeader from '@/components/GovernmentHeader';

interface CommissionTermsPageProps {
  params: { locale: string };
}

export default async function CommissionTermsPage({ params }: CommissionTermsPageProps) {
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
          portal={isBengali ? 'কমিশনের কার্যপরিধি ও ক্ষমতা' : 'Commission Scope & Powers'}
          tagline={isBengali ? 'আদেশ ও নির্দেশনা' : 'Terms & Directives'}
          borderColor="green"
          iconColor="green"
        />

        {/* Introduction */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 break-words">
              {isBengali ? 'জাতীয় সংসদ নির্বাচন (২০১৪, ২০১৮ ও ২০২৪) তদন্ত কমিশনের কার্যপরিধি' : 'National Elections (2014, 2018, 2024) Inquiry Commission Terms of Reference'}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {isBengali 
                ? 'এই কমিশন বিগত তিনটি জাতীয় সংসদ নির্বাচনের সার্বিক বিশ্লেষণ ও তদন্তের জন্য গঠিত হয়েছে।'
                : 'This Commission has been established to conduct comprehensive analysis and investigation of the past three national parliamentary elections.'
              }
            </p>
          </div>
        </div>

        {/* Commission Scope */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isBengali ? 'কার্যপরিধি' : 'Commission Scope'}
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {commissionScopeData.commission_scope.map((scope, index) => (
              <div key={index} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm lg:text-base text-blue-800 dark:text-blue-200 leading-relaxed break-words">
                      {scope[langKey]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Powers */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {isBengali ? 'ক্ষমতা' : 'Powers'}
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {commissionScopeData.powers.map((power, index) => (
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

        {/* Tasks */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {isBengali ? 'কার্যাবলি' : 'Tasks'}
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {commissionScopeData.tasks.map((task, index) => (
              <div key={index} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm lg:text-base text-green-800 dark:text-green-200 leading-relaxed break-words">
                      {task[langKey]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Deadline Notice */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 break-words">
            {isBengali ? 'প্রতিবেদন জমাদানের সময়সীমা' : 'Report Submission Deadline'}
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
                  ? 'এই কার্যপরিধি ও ক্ষমতাসমূহ সরকারি আদেশ অনুযায়ী নির্ধারিত এবং কমিশনের সকল কার্যক্রম এই নির্দেশনা অনুসরণ করে পরিচালিত হবে।' 
                  : 'These terms of reference and powers are determined according to government orders and all commission activities will be conducted following these directives.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}