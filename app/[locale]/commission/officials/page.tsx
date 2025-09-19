import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import commissionOfficialsData from '@/data/commisson/commission_officials.json';
import GovernmentHeader from '@/components/GovernmentHeader';

interface CommissionOfficialsPageProps {
  params: { locale: string };
}

export default async function CommissionOfficialsPage({ params }: CommissionOfficialsPageProps) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'commission' });
  
  const { officials } = commissionOfficialsData;
  const isBengali = params.locale === 'bn';
  const langKey = isBengali ? 'bn' : 'en';

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Government Header */}
        <GovernmentHeader
          title={isBengali ? 'জাতীয় সংসদ নির্বাচন তদন্ত কমিশন' : 'National Elections Inquiry Commission'}
          subtitle={isBengali ? 'জাতীয় সংসদ নির্বাচন (২০১৪, ২০১৮, ২০২৪) তদন্ত কমিশন' : 'National Elections (2014, 2018, 2024) Inquiry Commission'}
          portal={isBengali ? 'কমিশন কর্মকর্তা' : 'Commission Officials'}
          tagline={isBengali ? 'কর্মচারী তালিকা' : 'Staff Directory'}
          borderColor="green"
          iconColor="green"
        />

        {/* Page Header */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {officials.title[langKey]}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {officials.description[langKey]}
            </p>
          </div>
        </div>

        {/* Secretariat Staff */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="truncate">{officials.secretariat.title[langKey]}</span>
          </h2>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {officials.secretariat.members.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-3 sm:mb-4">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                      {member.name[langKey].split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white break-words">
                    {member.name[langKey]}
                  </h3>
                  <p className="text-green-700 dark:text-green-300 font-semibold text-sm sm:text-base break-words">
                    {member.position[langKey]}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                    {member.department[langKey]}
                  </p>
                </div>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${member.email}`} className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                      {member.email}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{member.phone}</span>
                  </div>
                  <div className="pt-1.5 sm:pt-2 border-t border-green-200 dark:border-green-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>{isBengali ? 'অভিজ্ঞতা:' : 'Experience:'}</strong> {member.experience[langKey]}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <strong>{isBengali ? 'শিক্ষাগত যোগ্যতা:' : 'Qualification:'}</strong> {member.qualification[langKey]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Support Team */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="truncate">{officials.technical_support.title[langKey]}</span>
          </h2>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
            {officials.technical_support.members.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-3 sm:mb-4">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                      {member.name[langKey].split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white break-words">
                    {member.name[langKey]}
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 font-semibold text-sm sm:text-base break-words">
                    {member.position[langKey]}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                    {member.department[langKey]}
                  </p>
                </div>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${member.email}`} className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                      {member.email}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{member.phone}</span>
                  </div>
                  <div className="pt-1.5 sm:pt-2 border-t border-blue-200 dark:border-blue-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>{isBengali ? 'অভিজ্ঞতা:' : 'Experience:'}</strong> {member.experience[langKey]}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <strong>{isBengali ? 'শিক্ষাগত যোগ্যতা:' : 'Qualification:'}</strong> {member.qualification[langKey]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Team */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-purple-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="truncate">{officials.legal_team.title[langKey]}</span>
          </h2>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
            {officials.legal_team.members.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-3 sm:mb-4">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                      {member.name[langKey].split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white break-words">
                    {member.name[langKey]}
                  </h3>
                  <p className="text-purple-700 dark:text-purple-300 font-semibold text-sm sm:text-base break-words">
                    {member.position[langKey]}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                    {member.department[langKey]}
                  </p>
                </div>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${member.email}`} className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                      {member.email}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{member.phone}</span>
                  </div>
                  <div className="pt-1.5 sm:pt-2 border-t border-purple-200 dark:border-purple-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>{isBengali ? 'অভিজ্ঞতা:' : 'Experience:'}</strong> {member.experience[langKey]}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <strong>{isBengali ? 'শিক্ষাগত যোগ্যতা:' : 'Qualification:'}</strong> {member.qualification[langKey]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Administrative Staff */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-orange-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm2 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="truncate">{officials.administrative_staff.title[langKey]}</span>
          </h2>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
            {officials.administrative_staff.members.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-3 sm:mb-4">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                      {member.name[langKey].split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white break-words">
                    {member.name[langKey]}
                  </h3>
                  <p className="text-orange-700 dark:text-orange-300 font-semibold text-sm sm:text-base break-words">
                    {member.position[langKey]}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                    {member.department[langKey]}
                  </p>
                </div>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${member.email}`} className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                      {member.email}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{member.phone}</span>
                  </div>
                  <div className="pt-1.5 sm:pt-2 border-t border-orange-200 dark:border-orange-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>{isBengali ? 'অভিজ্ঞতা:' : 'Experience:'}</strong> {member.experience[langKey]}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <strong>{isBengali ? 'শিক্ষাগত যোগ্যতা:' : 'Qualification:'}</strong> {member.qualification[langKey]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gray-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="truncate">{officials.contact_info.title[langKey]}</span>
          </h2>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-1 md:grid-cols-2">
            <div className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {isBengali ? 'অফিসের ঠিকানা' : 'Office Address'}
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {officials.contact_info.office_address[langKey]}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {isBengali ? 'যোগাযোগের তথ্য' : 'Contact Details'}
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{officials.contact_info.phone}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${officials.contact_info.email}`} className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline break-all">
                    {officials.contact_info.email}
                  </a>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  <a href={`https://${officials.contact_info.website}`} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline break-all">
                    {officials.contact_info.website}
                  </a>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{officials.contact_info.office_hours[langKey]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
