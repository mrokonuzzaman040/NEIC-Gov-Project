import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import commissionData from '@/data/commisson_data.json';
import GovernmentHeader from '@/components/GovernmentHeader';
import Image from 'next/image';

interface CommissionMember {
  serial_no: number;
  name_bengali: string;
  name_english: string;
  role_type: string;
  designation_bengali: string;
  designation_english: string | null;
  department_bengali: string | null;
  department_english: string | null;
  image: string | null;
  email: string;
  phone: string;
  description_bengali: string;
  description_english: string;
}

interface CommissionData {
  commission_name_bengali: string;
  commission_name_english: string;
  personnel: CommissionMember[];
}

export default function CommissionMembersPage({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  const t = useTranslations('commission.members');
  const { locale } = params;
  const data = commissionData as CommissionData;
  
  // Filter commission members only
  const commissionMembers = data.personnel.filter(member => member.role_type === 'commission_member');
  const secretarialSupport = data.personnel.filter(member => member.role_type === 'secretarial_support');
  
  const isEnglish = locale === 'en';
  
  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Government Header with Official Seal */}
        <GovernmentHeader
          title={isEnglish ? data.commission_name_english : data.commission_name_bengali}
          subtitle={isEnglish ? 'Government of the People\'s Republic of Bangladesh' : 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার'}
          portal={isEnglish ? 'Official Website' : 'সরকারি ওয়েবসাইট'}
          tagline={isEnglish ? 'Last Updated: September 2024' : 'সর্বশেষ আপডেট: সেপ্টেম্বর ২০২৪'}
          borderColor="green"
          iconColor="green"
        />

        {/* Commission Members Section */}
        <div className="bg-white dark:bg-slate-800 shadow-lg mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="truncate">{t('commissionMembers')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              {isEnglish ? 'Distinguished members appointed to conduct the inquiry' : 'তদন্ত পরিচালনার জন্য নিযুক্ত বিশিষ্ট সদস্যগণ'}
            </p>
          </div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {commissionMembers.map((member, index) => (
                <div key={member.serial_no} className="bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                      {/* Member Info */}
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                              <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-white break-words">
                                {isEnglish ? member.name_english : member.name_bengali}
                              </h3>
                            </div>
                            <p className="text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base lg:text-lg mb-2 break-words">
                              {isEnglish 
                                ? (member.designation_english || member.designation_bengali)
                                : member.designation_bengali
                              }
                            </p>
                            {member.designation_bengali === 'চেয়ারম্যান' && (
                              <span className="inline-block px-3 py-1 sm:px-4 sm:py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs sm:text-sm font-medium rounded-full">
                                {isEnglish ? 'Chairman' : 'চেয়ারম্যান'}
                              </span>
                            )}
                          </div>
                          
                          {/* Official Badge */}
                          <div className="text-left sm:text-right flex-shrink-0">
                            <div className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                {isEnglish ? 'Commission Member' : 'কমিশন সদস্য'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Description */}
                        <div className="mb-3 sm:mb-4">
                          <p className="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                            {isEnglish ? member.description_english : member.description_bengali}
                          </p>
                        </div>
                        
                        {/* Contact Information */}
                        <div className="space-y-1.5 sm:space-y-2">
                          {/* Email Contact */}
                          <div className="flex items-center space-x-2">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <a 
                              href={`mailto:${member.email}`}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs sm:text-sm transition-colors break-all"
                            >
                              {member.email}
                            </a>
                          </div>
                          
                          {/* Phone Contact */}
                          <div className="flex items-center space-x-2">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a 
                              href={`tel:${member.phone}`}
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium text-xs sm:text-sm transition-colors"
                            >
                              {member.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secretarial Support Section */}
        <div className="bg-white dark:bg-slate-800 shadow-lg">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1" />
              </svg>
              <span className="truncate">{t('secretarialSupport')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              {isEnglish ? 'Administrative and secretarial support staff' : 'প্রশাসনিক ও সচিবালয় সহায়তা কর্মী'}
            </p>
          </div>
          
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {isEnglish ? 'Serial' : 'ক্রমিক'}
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {isEnglish ? 'Name' : 'নাম'}
                    </th>
                    <th className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {isEnglish ? 'Designation' : 'পদবী'}
                    </th>
                    <th className="hidden lg:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {isEnglish ? 'Department' : 'বিভাগ'}
                    </th>
                    <th className="hidden md:table-cell px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {isEnglish ? 'Email' : 'ইমেইল'}
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {isEnglish ? 'Phone' : 'ফোন'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                  {secretarialSupport.map((member) => (
                    <tr key={member.serial_no} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        {member.serial_no}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">
                          {isEnglish ? member.name_english : member.name_bengali}
                        </div>
                        {/* Show designation on mobile */}
                        <div className="sm:hidden text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                          {isEnglish 
                            ? (member.designation_english || member.designation_bengali)
                            : member.designation_bengali
                          }
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {isEnglish 
                            ? (member.designation_english || member.designation_bengali)
                            : member.designation_bengali
                          }
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {isEnglish 
                            ? (member.department_english || member.department_bengali)
                            : member.department_bengali
                          }
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                        <a 
                          href={`mailto:${member.email}`}
                          className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors break-all"
                        >
                          {member.email}
                        </a>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <a 
                          href={`tel:${member.phone}`}
                          className="text-xs sm:text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium transition-colors"
                        >
                          {member.phone}
                        </a>
                        {/* Show email on mobile */}
                        <div className="md:hidden mt-1">
                          <a 
                            href={`mailto:${member.email}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors break-all"
                          >
                            {member.email}
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 sm:mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1 sm:mb-2">
                {isEnglish ? 'Official Notice' : 'সরকারি বিজ্ঞপ্তি'}
              </h4>
              <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm leading-relaxed">
                {isEnglish 
                  ? 'This is the official list of commission members and support staff as appointed by the Government of Bangladesh. For any official correspondence or verification, please contact the commission secretariat.'
                  : 'এটি বাংলাদেশ সরকার কর্তৃক নিযুক্ত কমিশন সদস্য ও সহায়তা কর্মীদের সরকারি তালিকা। কোনো সরকারি যোগাযোগ বা যাচাইয়ের জন্য অনুগ্রহ করে কমিশন সচিবালয়ের সাথে যোগাযোগ করুন।'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}