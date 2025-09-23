'use client';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';

interface CommissionScopeData {
  commission_scope: Array<{
    bn: string;
    en: string;
  }>;
  powers: Array<{
    bn: string;
    en: string;
  }>;
  tasks: Array<{
    bn: string;
    en: string;
  }>;
}

interface CommissionScopeProps {
  className?: string;
}

export default function CommissionScope({ className = '' }: CommissionScopeProps) {
  const locale = useLocale() as 'en' | 'bn';
  const isEnglish = locale === 'en';
  const [data, setData] = useState<CommissionScopeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'scope' | 'powers' | 'tasks'>('scope');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/public/commission-scope');
        
        if (response.ok) {
          const scopeData = await response.json();
          setData(scopeData);
        } else {
          console.error('Failed to fetch commission scope data, status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching commission scope data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-2 sm:p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 sm:h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-2 sm:mb-4"></div>
          <div className="space-y-2 sm:space-y-3">
            <div className="h-3 sm:h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-3 sm:h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
            <div className="h-3 sm:h-4 bg-gray-200 dark:bg-slate-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-2 sm:p-6 ${className}`}>
        <div className="text-center py-4 sm:py-8">
          <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
            {isEnglish ? 'No data available' : 'কোন তথ্য পাওয়া যায়নি'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {isEnglish ? 'Commission scope data could not be loaded.' : 'কমিশনের কার্যক্ষেত্রের তথ্য লোড করা যায়নি।'}
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'scope' as const,
      label: isEnglish ? 'Commission Scope' : 'কমিশনের কার্যপরিধি',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    // {
    //   id: 'powers' as const,
    //   label: isEnglish ? 'Powers' : 'ক্ষমতা',
    //   icon: (
    //     <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    //     </svg>
    //   )
    // },
    // {
    //   id: 'tasks' as const,
    //   label: isEnglish ? 'Tasks' : 'কাজ',
    //   icon: (
    //     <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    //     </svg>
    //   )
    // }
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'scope':
        return data.commission_scope;
      case 'powers':
        return data.powers;
      case 'tasks':
        return data.tasks;
      default:
        return data.commission_scope;
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      {/* <div className="bg-gradient-to-r from-green-600 to-green-700 px-2 sm:px-6 py-2 sm:py-4">
        <h2 className="text-sm sm:text-xl font-bold text-white flex items-center">
          <svg className="w-4 h-4 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="break-words">{isEnglish ? 'Commission Scope & Powers' : 'কমিশনের কার্যক্ষেত্র ও ক্ষমতা'}</span>
        </h2>
      </div> */}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="flex space-x-2 sm:space-x-8 px-2 sm:px-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              {tab.icon}
              <span className="ml-1 sm:ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-6">
        <div className="space-y-2 sm:space-y-4">
          {getCurrentData().map((item, index) => (
            <div
              key={index}
              className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border-l-4 border-green-500"
            >
              <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                {index + 1}
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                {isEnglish ? item.en : item.bn}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        {/* <div className="mt-3 sm:mt-6 p-2 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 font-medium">
                {isEnglish ? 'Important Note' : 'গুরুত্বপূর্ণ নোট'}
              </p>
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 mt-1 break-words">
                {isEnglish 
                  ? 'The commission has the authority to investigate and make recommendations for fair elections in Bangladesh.'
                  : 'কমিশনের বাংলাদেশে সুষ্ঠু নির্বাচনের জন্য তদন্ত ও সুপারিশ করার ক্ষমতা রয়েছে।'
                }
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
