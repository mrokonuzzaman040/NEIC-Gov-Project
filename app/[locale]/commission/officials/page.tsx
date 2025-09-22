import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import officerListData from '@/data/commisson/officer_list_bilingual.json';
import GovernmentHeader from '@/components/GovernmentHeader';

interface CommissionOfficialsPageProps {
  params: { locale: string };
}

export default async function CommissionOfficialsPage({ params }: CommissionOfficialsPageProps) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'commission' });
  
  const { Chief_and_Members, Officials_and_Employees } = officerListData;
  const isBengali = params.locale === 'bn';
  const langKey = isBengali ? 'bn' : 'en';

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Government Header */}
        <GovernmentHeader
          title={isBengali ? 'জাতীয় সংসদ নির্বাচন তদন্ত কমিশন' : 'National Elections Inquiry Commission'}
          subtitle={isBengali ? 'জাতীয় সংসদ নির্বাচন (২০১৪, ২০১৮ ও ২০২৪) তদন্ত কমিশন' : 'National Elections (2014, 2018, 2024) Inquiry Commission'}
          portal={isBengali ? 'কমিশন কর্মকর্তা' : 'Commission Officials'}
          tagline={isBengali ? 'কর্মচারী তালিকা' : 'Staff Directory'}
          borderColor="green"
          iconColor="green"
        />

        {/* Page Header */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {isBengali ? 'কমিশনের প্রধান ও সদস্যবৃন্দ' : 'Commission Chairman & Members'}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {isBengali 
                ? 'জাতীয় সংসদ নির্বাচন তদন্ত কমিশনের প্রধান ও সদস্যদের পরিচিতি এবং যোগাযোগের তথ্য।'
                : 'Meet the Chairman and Members of the National Elections Inquiry Commission with their contact information.'
              }
            </p>
          </div>
        </div>

        {/* Commission Chairman & Members */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="truncate">{isBengali ? 'কমিশনের প্রধান ও সদস্যবৃন্দ' : 'Commission Chairman & Members'}</span>
          </h2>
          
          {/* Table for Chairman & Members */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-green-50 dark:bg-green-900/20">
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {isBengali ? 'ক্রমিক নং' : 'Serial No'}
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {isBengali ? 'নাম' : 'Name'}
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {isBengali ? 'পদবি' : 'Designation'}
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {isBengali ? 'কক্ষ নং' : 'Room No'}
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {isBengali ? 'টেলিফোন' : 'Telephone'}
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {isBengali ? 'মোবাইল' : 'Mobile'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {Chief_and_Members.map((member) => (
                  <tr key={member.serial_no} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      {member.serial_no}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm text-gray-900 dark:text-white font-medium">
                      {isBengali ? member.name_bangla : member.name_english}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm text-green-700 dark:text-green-400 font-semibold">
                      {isBengali ? member.designation_bangla : member.designation_english}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      {member.room_no}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm">
                      <a href={`tel:${member.telephone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {member.telephone}
                      </a>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm">
                      <a href={`tel:${member.mobile}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {member.mobile}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Officials and Employees by Department */}
        {Object.entries(Officials_and_Employees).map(([departmentKey, members], index) => {
          const departmentNames: Record<string, { en: string; bn: string }> = {
            'Cabinet Division': { en: 'Cabinet Division', bn: 'ক্যাবিনেট বিভাগ' },
            'Law and Justice Division': { en: 'Law and Justice Division', bn: 'আইন ও বিচার বিভাগ' },
            'National Parliament Secretariat': { en: 'National Parliament Secretariat', bn: 'জাতীয় সংসদ সচিবালয়' },
            'Statistics and Information Management Division': { en: 'Statistics and Information Management Division', bn: 'পরিসংখ্যান ও তথ্য ব্যবস্থাপনা বিভাগ' },
            'Election Commission Secretariat': { en: 'Election Commission Secretariat', bn: 'নির্বাচন কমিশন সচিবালয়' }
          };

          const departmentName = departmentNames[departmentKey] || { en: departmentKey, bn: departmentKey };
          const colors = ['blue', 'purple', 'orange', 'indigo', 'teal'];
          const color = colors[index % colors.length];

          return (
            <div key={departmentKey} className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
              <h2 className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center`}>
                <div className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-${color}-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0`}>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 100 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
                </div>
                <span className="truncate">{isBengali ? departmentName.bn : departmentName.en}</span>
              </h2>
              
              {/* Table for Department Members */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className={`bg-${color}-50 dark:bg-${color}-900/20`}>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {isBengali ? 'ক্রমিক নং' : 'Serial No'}
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {isBengali ? 'নাম' : 'Name'}
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {isBengali ? 'পদবি' : 'Designation'}
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {isBengali ? 'টেলিফোন' : 'Telephone'}
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {isBengali ? 'মোবাইল' : 'Mobile'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.serial_no} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          {member.serial_no}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm text-gray-900 dark:text-white font-medium">
                          {isBengali ? member.name_bangla : member.name_english}
                        </td>
                        <td className={`border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm text-${color}-700 dark:text-${color}-400 font-semibold`}>
                          {isBengali ? member.designation_bangla : member.designation_english}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm">
                          {(member as any).telephone ? (
                            <a href={`tel:${(member as any).telephone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                              {(member as any).telephone}
                            </a>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm">
                          <a href={`tel:${member.mobile}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                            {member.mobile}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {/* Contact Information */}
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gray-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="truncate">{isBengali ? 'যোগাযোগের তথ্য' : 'Contact Information'}</span>
          </h2>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-1 md:grid-cols-2">
            <div className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {isBengali ? 'কমিশন সম্পর্কে' : 'About the Commission'}
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {isBengali 
                  ? 'জাতীয় সংসদ নির্বাচন তদন্ত কমিশন একটি স্বাধীন ও নিরপেক্ষ প্রতিষ্ঠান যা নির্বাচনী প্রক্রিয়ার স্বচ্ছতা ও ন্যায়বিচার নিশ্চিত করার জন্য কাজ করে।'
                  : 'The National Elections Inquiry Commission is an independent and impartial institution working to ensure transparency and justice in the electoral process.'
                }
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
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {isBengali ? 'সকল প্রশ্নের জন্য উপরের কর্মকর্তাদের সাথে যোগাযোগ করুন' : 'Contact the above officials for any inquiries'}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {isBengali ? 'অফিস সময়: সকাল ৯টা থেকে বিকাল ৫টা (রবিবার বন্ধ)' : 'Office Hours: 9:00 AM to 5:00 PM (Closed on Sundays)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
