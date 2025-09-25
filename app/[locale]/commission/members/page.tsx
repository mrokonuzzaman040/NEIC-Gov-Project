'use client';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import GovernmentHeader from '@/components/GovernmentHeader';
import Image from 'next/image';

interface CommissionMember {
  id: string;
  serial_no: number;
  name_bengali: string;
  name_english: string;
  role_type: string;
  designation_bengali: string;
  designation_english: string;
  department_bengali?: string;
  department_english?: string;
  image?: string;
  email?: string;
  phone?: string;
  description_bengali?: string;
  description_english?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CommissionMembersPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('commission.members');
  const { locale } = params;
  const isEnglish = locale === 'en';
  
  const [members, setMembers] = useState<CommissionMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/public/commission-members');
        if (!response.ok) {
          throw new Error('Failed to fetch commission members');
        }
        const data = await response.json();
        setMembers(data.members || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, []);
  
  // Filter commission members only
  const commissionMembers = members.filter(member => member.role_type === 'commission_member' && member.isActive);
  const secretarialSupport = members.filter(member => member.role_type === 'secretarial_support' && member.isActive);
  
  // Commission name - using a default since we don't have this in the API
  const commissionNameEnglish = "National Elections Inquiry Commission";
  const commissionNameBengali = "জাতীয় নির্বাচন তদন্ত কমিশন (২০১৪, ২০১৮, ২০২৪)";
  
  // Function to get member tag based on designation
  const getMemberTag = (member: CommissionMember) => {
    const designation = isEnglish ? member.designation_english : member.designation_bengali;
    
    if (designation?.includes('চেয়ারম্যান') || designation?.includes('Chairman')) {
      return {
        text: isEnglish ? 'Chairman' : 'চেয়ারম্যান',
        className: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      };
    } else if (designation?.includes('সদস্য') || designation?.includes('Member')) {
      return {
        text: isEnglish ? 'Member' : 'সদস্য',
        className: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      };
    } else if (designation?.includes('সচিব') || designation?.includes('Secretary')) {
      return {
        text: isEnglish ? 'Secretary' : 'সচিব',
        className: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
      };
    } else if (designation?.includes('উপ-সচিব') || designation?.includes('Deputy Secretary')) {
      return {
        text: isEnglish ? 'Deputy Secretary' : 'উপ-সচিব',
        className: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
      };
    } else if (designation?.includes('সহকারী সচিব') || designation?.includes('Assistant Secretary')) {
      return {
        text: isEnglish ? 'Assistant Secretary' : 'সহকারী সচিব',
        className: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      };
    } else {
      return {
        text: designation || (isEnglish ? 'Member' : 'সদস্য'),
        className: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
      };
    }
  };
  
  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Government Header with Official Seal */}
        <GovernmentHeader
          title={isEnglish ? commissionNameEnglish : commissionNameBengali}
          borderColor="green"
          iconColor="green"
        />

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-slate-800 shadow-lg mb-6 sm:mb-8">
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                {isEnglish ? 'Loading commission members...' : 'কমিশন সদস্যদের তথ্য লোড হচ্ছে...'}
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
                {isEnglish ? 'Error Loading Data' : 'তথ্য লোড করতে ত্রুটি'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isEnglish ? 'Retry' : 'পুনরায় চেষ্টা করুন'}
              </button>
            </div>
          </div>
        )}

        {/* Commission Members Section */}
        {!loading && !error && (
          <div className="bg-white dark:bg-slate-800 shadow-lg mb-6 sm:mb-8">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="truncate">{t('commissionMembers')}</span>
              </h2>
            </div>
            
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                {commissionMembers.map((member, index) => (
                  <div key={member.id} className="bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:shadow-md transition-shadow overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                        {/* Member Image */}
                        {member.image && (
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 border-2 border-green-200 dark:border-green-800">
                              <Image 
                                src={member.image} 
                                alt={isEnglish ? member.name_english : member.name_bengali}
                                width={112}
                                height={112}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to icon if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center"><svg class="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>`;
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Member Info */}
                        <div className="flex-grow min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                                <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-white break-words">
                                  {isEnglish ? member.name_english : member.name_bengali}
                                </h3>
                              </div>
                              {(() => {
                                const tag = getMemberTag(member);
                                return (
                                  <span className={`inline-block px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-full ${tag.className}`}>
                                    {tag.text}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                          
                          {/* Contact Information */}
                          <div className="space-y-1.5 sm:space-y-2">
                            {/* Email Contact */}
                            {member.email && (
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
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}