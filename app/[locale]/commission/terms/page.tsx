import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import commissionTermsData from '@/data/commisson/commission_terms.json';
import GovernmentHeader from '@/components/GovernmentHeader';

interface CommissionTermsPageProps {
  params: { locale: string };
}

export default async function CommissionTermsPage({ params }: CommissionTermsPageProps) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'commission' });
  
  const { document } = commissionTermsData;
  const isBengali = params.locale === 'bn';
  const langKey = isBengali ? 'ban' : 'en';

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Government Header */}
        <GovernmentHeader
          title={isBengali ? 'জাতীয় সংসদ নির্বাচন তদন্ত কমিশন' : 'National Elections Inquiry Commission'}
          subtitle={isBengali ? 'জাতীয় সংসদ নির্বাচন (২০১৪, ২০১৮, ২০২৪) তদন্ত কমিশন' : 'National Elections (2014, 2018, 2024) Inquiry Commission'}
          portal={isBengali ? 'গেজেট প্রজ্ঞাপন' : 'Gazette Notification'}
          tagline={isBengali ? 'কমিশনের কার্যপরিধি' : 'Commission Terms'}
          borderColor="green"
          iconColor="green"
        />

        {/* Document Header */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {document.title[langKey]}
            </h1>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p className="text-lg font-semibold">{document.date[langKey]}</p>
              <p className="text-base">{document.reference_number[langKey]}</p>
            </div>
          </div>

          {/* Background */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              {isBengali ? 'পটভূমি' : 'Background'}
            </h2>
            <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
              {document.background[langKey]}
            </p>
          </div>
        </div>

        {/* Commission Members */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {isBengali ? 'কমিশন সদস্য' : 'Commission Members'}
          </h2>
          <div className="space-y-4">
            {document.commission_members.map((member, index) => (
              <div key={index} className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                      {member[langKey]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms of Reference */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {isBengali ? 'কার্যপরিধি' : 'Terms of Reference'}
          </h2>
          <div className="space-y-4">
            {document.terms_of_reference[langKey].map((term, index) => (
              <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-yellow-800 dark:text-yellow-200 leading-relaxed">
                    {term}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Powers */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {isBengali ? 'ক্ষমতা' : 'Powers'}
          </h2>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-200 leading-relaxed">
              {document.powers[langKey]}
            </p>
          </div>
        </div>

        {/* Report Deadline */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {isBengali ? 'প্রতিবেদন জমাদানের সময়সীমা' : 'Report Submission Deadline'}
          </h2>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-orange-800 dark:text-orange-200 font-semibold text-lg">
                {document.report_deadline[langKey]}
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {isBengali ? 'সহায়তা' : 'Support'}
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <p className="text-green-800 dark:text-green-200 leading-relaxed">
              {document.support[langKey]}
            </p>
          </div>
        </div>

        {/* Effective Date */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {isBengali ? 'কার্যকর তারিখ' : 'Effective Date'}
          </h2>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
            <p className="text-purple-800 dark:text-purple-200 font-semibold text-lg">
              {document.effective_date[langKey]}
            </p>
          </div>
        </div>

        {/* Signature */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {isBengali ? 'স্বাক্ষর' : 'Signature'}
          </h2>
          <div className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-6">
            <div className="text-center">
              <p className="text-gray-800 dark:text-gray-200 font-medium text-lg">
                {document.signed_by[langKey]}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5 mr-3">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                {isBengali ? 'গুরুত্বপূর্ণ বিজ্ঞপ্তি' : 'Important Notice'}
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                {isBengali 
                  ? 'এই গেজেট প্রজ্ঞাপনটি সরকারি নথি এবং এর সকল তথ্য সরকারি সূত্র থেকে প্রাপ্ত।' 
                  : 'This gazette notification is an official document and all information is sourced from official government records.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
