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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="bg-white dark:bg-slate-800 shadow-lg mb-8">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {t('commissionMembers')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isEnglish ? 'Distinguished members appointed to conduct the inquiry' : 'তদন্ত পরিচালনার জন্য নিযুক্ত বিশিষ্ট সদস্যগণ'}
            </p>
          </div>
          
          <div className="p-8">
            <div className="space-y-8">
              {commissionMembers.map((member, index) => (
                <div key={member.serial_no} className="bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start space-x-6">
                      {/* Member Image/Logo */}
                      <div className="flex-shrink-0">
                        {member.image ? (
                          <Image 
                            src={member.image} 
                            alt={isEnglish ? member.name_english : member.name_bengali}
                            className="rounded-full object-cover border-4 border-white dark:border-slate-600 shadow-lg"
                            width={96}
                            height={96}
                          />
                        ) : (
                          <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-600 shadow-lg">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Member Info */}
                      <div className="flex-grow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {member.serial_no}
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isEnglish ? member.name_english : member.name_bengali}
                              </h3>
                            </div>
                            <p className="text-green-600 dark:text-green-400 font-semibold text-lg mb-2">
                              {isEnglish 
                                ? (member.designation_english || member.designation_bengali)
                                : member.designation_bengali
                              }
                            </p>
                            {member.designation_bengali === 'চেয়ারম্যান' && (
                              <span className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                                {isEnglish ? 'Chairman' : 'চেয়ারম্যান'}
                              </span>
                            )}
                          </div>
                          
                          {/* Official Badge */}
                          <div className="text-right">
                            <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg">
                              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {isEnglish ? 'Commission Member' : 'কমিশন সদস্য'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Description */}
                        <div className="mb-4">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {isEnglish ? member.description_english : member.description_bengali}
                          </p>
                        </div>
                        
                        {/* Contact Information */}
                        <div className="space-y-2">
                          {/* Email Contact */}
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <a 
                              href={`mailto:${member.email}`}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                            >
                              {member.email}
                            </a>
                          </div>
                          
                          {/* Phone Contact */}
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a 
                              href={`tel:${member.phone}`}
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium text-sm transition-colors"
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
          <div className="px-8 py-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1" />
              </svg>
              {t('secretarialSupport')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isEnglish ? 'Administrative and secretarial support staff' : 'প্রশাসনিক ও সচিবালয় সহায়তা কর্মী'}
            </p>
          </div>
          
          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {isEnglish ? 'Serial' : 'ক্রমিক'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {isEnglish ? 'Name' : 'নাম'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {isEnglish ? 'Designation' : 'পদবী'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {isEnglish ? 'Department' : 'বিভাগ'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {isEnglish ? 'Email' : 'ইমেইল'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {isEnglish ? 'Phone' : 'ফোন'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                  {secretarialSupport.map((member) => (
                    <tr key={member.serial_no} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {member.serial_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {isEnglish ? member.name_english : member.name_bengali}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {isEnglish 
                            ? (member.designation_english || member.designation_bengali)
                            : member.designation_bengali
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {isEnglish 
                            ? (member.department_english || member.department_bengali)
                            : member.department_bengali
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a 
                          href={`mailto:${member.email}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                        >
                          {member.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a 
                          href={`tel:${member.phone}`}
                          className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium transition-colors"
                        >
                          {member.phone}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                {isEnglish ? 'Official Notice' : 'সরকারি বিজ্ঞপ্তি'}
              </h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
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