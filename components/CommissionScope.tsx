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
      label: isEnglish ? 'Commission Scope' : 'কমিশনের দায়িত্বাবলী',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
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
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="flex space-x-2 sm:space-x-8 px-2 sm:px-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 sm:py-4 px-1 border-b-2 font-bold text-sm sm:text-base lg:text-lg flex items-center transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              {tab.icon}
              <span className={`ml-1 sm:ml-2 font-bold ${!isEnglish ? 'bengali-tab' : ''}`}>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-6">
        <div className="space-y-3 sm:space-y-5">
          {getCurrentData().map((item, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-5 bg-gray-50 dark:bg-slate-700/50 rounded-lg border-l-4 border-green-500"
            >
              <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-green-600 text-white rounded-full flex items-center justify-center mt-1 sm:mt-1.5">
                <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className={`text-sm sm:text-base lg:text-lg font-bold text-gray-700 dark:text-gray-300 leading-relaxed break-words ${!isEnglish ? 'font-bengali' : ''}`}>
                {isEnglish ? item.en : item.bn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
