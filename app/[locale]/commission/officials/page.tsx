'use client';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import GovernmentHeader from '@/components/GovernmentHeader';
import Image from 'next/image';

interface CommissionOfficial {
  id: string;
  serial_no: number;
  name_english: string;
  name_bangla: string;
  designation_english: string;
  designation_bangla: string;
  department: string;
  telephone?: string;
  mobile: string;
  room_no?: string;
  category: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CommissionOfficialsPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('commission');
  const { locale } = params;
  const isBengali = locale === 'bn';
  
  const [officials, setOfficials] = useState<CommissionOfficial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchOfficials = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/public/commission-officials');
        if (!response.ok) {
          throw new Error('Failed to fetch commission officials');
        }
        const data = await response.json();
        setOfficials(data.officials || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOfficials();
  }, []);
  
  // Group officials by category
  const groupedOfficials = officials.reduce((acc, official) => {
    if (!acc[official.category]) {
      acc[official.category] = [];
    }
    acc[official.category].push(official);
    return acc;
  }, {} as Record<string, CommissionOfficial[]>);
  
  const departmentNames: Record<string, { en: string; bn: string }> = {
    'Chief_and_Members': { en: 'Commission Chairman & Members', bn: 'কমিশনের প্রধান ও সদস্যবৃন্দ' },
    'Cabinet Division': { en: 'Cabinet Division', bn: 'কর্মকর্তাবৃন্দ' },
    'Law and Justice Division': { en: 'Law and Justice Division', bn: 'আইন বিষয়ক কর্মকর্তা' },
    'National Parliament Secretariat': { en: 'National Parliament Secretariat', bn: 'জাতীয়  সচিবালয়' },
    'Statistics and Information Management Division': { en: 'Statistics and Information Management Division', bn: 'পরিসংখ্যান ও তথ্য ব্যবস্থাপনা বিভাগ' },
    'Election Commission Secretariat': { en: 'Election Commission Secretariat', bn: 'নির্বাচন কমিশন সচিবালয়' }
  };

  const categoryOrder = [
    'Chief_and_Members',
    'Cabinet Division',
    'Law and Justice Division',
    'National Parliament Secretariat',
    'Statistics and Information Management Division',
    'Election Commission Secretariat'
  ];

  const colors = ['green', 'blue', 'purple', 'orange', 'indigo', 'teal'];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Government Header */}
        <GovernmentHeader
          title={isBengali ? 'জাতীয় নির্বাচন (২০১৪, ২০১৮, ২০২৪) তদন্ত কমিশন' : 'National Elections Inquiry Commission'}
          // subtitle={isBengali ? 'জাতীয়  নির্বাচন (২০১৪, ২০১৮, ২০২৪) তদন্ত কমিশন' : 'National Elections (2014, 2018, 2024) Inquiry Commission'}
          portal={isBengali ? 'কমিশন কর্মকর্তা' : 'Commission Officials'}
          // tagline={isBengali ? 'কর্মচারী তালিকা' : 'Staff Directory'}
          borderColor="green"
          iconColor="green"
        />

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-slate-800 shadow-lg mb-6 sm:mb-8">
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                {isBengali ? 'কমিশন কর্মকর্তাদের তথ্য লোড হচ্ছে...' : 'Loading commission officials...'}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white dark:bg-slate-800 shadow-lg mb-6 sm:mb-8">
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {isBengali ? 'তথ্য লোড করতে ত্রুটি' : 'Error Loading Data'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isBengali ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
              </button>
            </div>
          </div>
        )}

        {/* Officials by Category */}
        {!loading && !error && categoryOrder.map((category, index) => {
          const officialsInCategory = groupedOfficials[category];
          if (!officialsInCategory || officialsInCategory.length === 0) return null;

          const departmentName = departmentNames[category] || { en: category, bn: category };
          const color = colors[index % colors.length];

          return (
            <div key={category} className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
              <h2 className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center`}>
                <div className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-${color}-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0`}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="truncate">{isBengali ? departmentName.bn : departmentName.en}</span>
              </h2>
              
              {/* Table for Officials */}
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
                      {category === 'Chief_and_Members' && (
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                          {isBengali ? 'কক্ষ নং' : 'Room No'}
                        </th>
                      )}
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {isBengali ? 'টেলিফোন' : 'Telephone'}
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {isBengali ? 'মোবাইল' : 'Mobile'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {officialsInCategory.map((official) => (
                      <tr key={official.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          {official.serial_no}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm text-gray-900 dark:text-white font-medium">
                          <div className="flex items-center space-x-3">
                            {official.image && (
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                                <Image 
                                  src={official.image} 
                                  alt={isBengali ? official.name_bangla : official.name_english}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            <span>{isBengali ? official.name_bangla : official.name_english}</span>
                          </div>
                        </td>
                        <td className={`border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm text-${color}-700 dark:text-${color}-400 font-semibold`}>
                          {isBengali ? official.designation_bangla : official.designation_english}
                        </td>
                        {category === 'Chief_and_Members' && (
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            {official.room_no || '-'}
                          </td>
                        )}
                        <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm">
                          {official.telephone ? (
                            <a href={`tel:${official.telephone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                              {official.telephone}
                            </a>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm">
                          <a href={`tel:${official.mobile}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                            {official.mobile}
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
        {!loading && !error && (
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
                    ? 'জাতীয়  নির্বাচন তদন্ত কমিশন একটি স্বাধীন ও নিরপেক্ষ প্রতিষ্ঠান যা নির্বাচনী প্রক্রিয়ার স্বচ্ছতা ও ন্যায়বিচার নিশ্চিত করার জন্য কাজ করে।'
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
        )}
      </div>
    </div>
  );
}