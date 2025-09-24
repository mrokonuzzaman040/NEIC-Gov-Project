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
          title={isBengali ? 'জাতীয় নির্বাচন (২০১৪, ২০১৮, ২০২৪) তদন্ত কমিশনের কার্যপরিধি' : 'National Elections Inquiry Commission'}
          // subtitle={isBengali ? 'জাতীয়  নির্বাচন (২০১৪, ২০১৮ ও ২০২৪) তদন্ত কমিশন' : 'National Elections (2014, 2018, 2024) Inquiry Commission'}
          // portal={isBengali ? 'কমিশনের কার্যপরিধি ও ক্ষমতা' : 'Commission Scope & Powers'}
          // tagline={isBengali ? 'আদেশ ও নির্দেশনা' : 'Terms & Directives'}
          borderColor="green"
          iconColor="green"
        />


        {/* Commission Scope */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          {/* <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isBengali ? 'কার্যপরিধি' : 'Commission Scope'}
          </h2> */}
          <div className="space-y-3 sm:space-y-4">
            {commissionScopeData.commission_scope.map((scope, index) => (
              <div key={index} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm lg:text-base text-green-800 dark:text-green-200 leading-relaxed break-words">
                      {scope[langKey]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

          {/* Government Header */}
          <GovernmentHeader
          title={isBengali ? 'জাতীয় নির্বাচন (২০১৪, ২০১৮, ২০২৪) তদন্ত কমিশনের ক্ষমতা' : 'National Elections Inquiry Commission'}
          // subtitle={isBengali ? 'জাতীয়  নির্বাচন (২০১৪, ২০১৮ ও ২০২৪) তদন্ত কমিশন' : 'National Elections (2014, 2018, 2024) Inquiry Commission'}
          // portal={isBengali ? 'কমিশনের কার্যপরিধি ও ক্ষমতা' : 'Commission Scope & Powers'}
          // tagline={isBengali ? 'আদেশ ও নির্দেশনা' : 'Terms & Directives'}
          borderColor="green"
          iconColor="green"
        />

        {/* Powers */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="space-y-3 sm:space-y-4">
            {commissionScopeData.powers.map((power, index) => (
              <div key={index} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm lg:text-base text-green-800 dark:text-green-200 leading-relaxed break-words">
                      {power[langKey]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}