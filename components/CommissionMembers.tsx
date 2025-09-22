'use client';
import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import Image from 'next/image';

interface CommissionMember {
  id: string;
  nameEn: string;
  nameBn: string;
  designationEn: string;
  designationBn: string;
  descriptionEn: string;
  descriptionBn: string;
  email?: string;
  phone?: string;
  image?: string;
  serialNo: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CommissionMembersProps {
  className?: string;
}

export default function CommissionMembers({ className = '' }: CommissionMembersProps) {
  const locale = useLocale() as 'en' | 'bn';
  const isEnglish = locale === 'en';
  const [members, setMembers] = useState<CommissionMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/public/commission-members');
        if (response.ok) {
          const data = await response.json();
          setMembers(data.members || []);
        }
      } catch (error) {
        console.error('Error fetching commission members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 ${className}`}>
        <div className="text-center py-6">
          <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            {isEnglish ? 'No members found' : 'কোন সদস্য পাওয়া যায়নি'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isEnglish ? 'Commission members will be displayed here.' : 'কমিশনের সদস্যদের এখানে প্রদর্শিত হবে।'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3">
          <h2 className="text-lg font-bold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {isEnglish ? 'Commission Members' : 'কমিশনের সদস্যবৃন্দ'}
          </h2>
        </div>

        {/* Members List - All Members Visible */}
        <div className="p-4 space-y-4">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border-l-4 border-green-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                {/* Member Image */}
                <div className="flex-shrink-0">
                  <div className="relative w-12 h-12">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={isEnglish ? member.nameEn : member.nameBn}
                        fill
                        className="object-cover rounded-full border-2 border-green-200 dark:border-green-800"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Member Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {isEnglish ? member.nameEn : member.nameBn}
                  </h3>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                    {isEnglish ? member.designationEn : member.designationBn}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                    {isEnglish ? member.descriptionEn : member.descriptionBn}
                  </p>
                  
                  {/* Contact Info */}
                  {(member.email || member.phone) && (
                    <div className="mt-2 flex flex-col space-y-1">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{member.email}</span>
                        </a>
                      )}
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="truncate">{member.phone}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Footer - Outside the main card */}
      <div className="mt-4 px-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {members.length} {isEnglish ? 'Commission Members' : 'কমিশনের সদস্য'}
        </p>
      </div>
    </div>
  );
}
