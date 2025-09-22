import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import commissionExtensionData from '@/data/commisson/commission_date_extaintion.json';
import GovernmentHeader from '@/components/GovernmentHeader';

interface CommissionExtensionPageProps {
  params: { locale: string };
}

export default async function CommissionExtensionPage({ params }: CommissionExtensionPageProps) {
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
          portal={isBengali ? 'কমিশনের সময়সীমা বর্ধিতকরণ' : 'Commission Date Extension'}
          tagline={isBengali ? 'সরকারি আদেশ ও সদস্যগণের তালিকা' : 'Government Orders & Member List'}
          borderColor="blue"
          iconColor="blue"
        />

        {/* Introduction */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 break-words">
              {isBengali ? 'কমিশনের সময়সীমা বর্ধিতকরণ ও সদস্যগণের তালিকা' : 'Commission Date Extension & Member List'}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {isBengali 
                ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের মন্ত্রিপরিষদ বিভাগের আদেশক্রমে কমিশনের সময়সীমা বর্ধিতকরণ এবং সদস্যগণের নিয়োগ।'
                : 'Extension of commission timeline and appointment of members by order of the Cabinet Division of the Government of the People\'s Republic of Bangladesh.'
              }
            </p>
          </div>
        </div>

        {/* Date Extension Information */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {isBengali ? 'সময়সীমা বর্ধিতকরণ সংক্রান্ত তথ্য' : 'Date Extension Information'}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Title */}
            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-teal-900 dark:text-teal-100 mb-2 sm:mb-3 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {isBengali ? 'শিরোনাম' : 'Title'}
              </h3>
              <p className="text-xs sm:text-sm text-teal-800 dark:text-teal-200 leading-relaxed break-words">
                {commissionExtensionData.commission_date_extaintion.title[langKey]}
              </p>
            </div>

            {/* Date */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 sm:mb-3 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isBengali ? 'বর্ধিতকরণের তারিখ' : 'Extension Date'}
              </h3>
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 leading-relaxed break-words">
                {commissionExtensionData.commission_date_extaintion.date[langKey]}
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
                {commissionExtensionData.commission_date_extaintion.reference[langKey]}
              </p>
            </div>
          </div>
        </div>

        {/* Commission Formation Notice */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1" />
            </svg>
            {isBengali ? 'কমিশন গঠন বিজ্ঞপ্তি' : 'Commission Formation Notice'}
          </h2>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 sm:p-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 text-white rounded-full flex items-center justify-center mt-1">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base lg:text-lg text-purple-800 dark:text-purple-200 leading-relaxed break-words font-medium">
                  {commissionExtensionData.commission_formation[langKey]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Members */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            {isBengali ? 'কমিশনের সদস্যগণ' : 'Commission Members'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {commissionExtensionData.commission_members.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-lg">
                    {index === 0 ? (
                      <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs sm:text-sm">{index}</span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-1 sm:mb-2">
                    {member.position[langKey]}
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed break-words">
                    {member.name[langKey]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Notice */}
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
                  ? 'কমিশনের সময়সীমা বর্ধিতকরণের পর ২০২৫ সালের ৩১ অক্টোবরের মধ্যে তদন্ত প্রতিবেদন সরকারের নিকট দাখিল করবে।'
                  : 'After the commission\'s timeline extension, the investigation report shall be submitted to the government by October 31, 2025.'
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
                  ? 'এই কমিশনের সময়সীমা বর্ধিতকরণ এবং সদস্যগণের নিয়োগ সরকারি আদেশের মাধ্যমে সম্পন্ন হয়েছে। কমিশনের সকল কার্যক্রম আইনি কাঠামোর মধ্যে পরিচালিত হচ্ছে।' 
                  : 'The extension of this commission\'s timeline and appointment of members has been completed through government orders. All commission activities are conducted within the legal framework.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
