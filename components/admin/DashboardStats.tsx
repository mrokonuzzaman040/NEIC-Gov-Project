"use client";
import { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  UsersIcon, 
  ClockIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color: 'blue' | 'green' | 'yellow' | 'red';
}

interface DashboardStats {
  totalSubmissions: {
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
  };
  pendingReview: {
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
  };
  approved: {
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
  };
  activeUsers: {
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
  };
}

function StatCard({ title, value, icon: Icon, change, changeType = 'neutral', color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  const changeClasses = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-slate-600 dark:text-slate-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeClasses[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2 animate-pulse"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
        </div>
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/admin/dashboard');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }
        
        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Error Loading Dashboard Stats
            </h3>
            <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Submissions',
      value: stats.totalSubmissions.value,
      icon: DocumentTextIcon,
      change: stats.totalSubmissions.change,
      changeType: stats.totalSubmissions.changeType,
      color: 'blue' as const,
    },
    {
      title: 'Pending Review',
      value: stats.pendingReview.value,
      icon: ClockIcon,
      change: stats.pendingReview.change,
      changeType: stats.pendingReview.changeType,
      color: 'yellow' as const,
    },
    {
      title: 'Approved',
      value: stats.approved.value,
      icon: CheckCircleIcon,
      change: stats.approved.change,
      changeType: stats.approved.changeType,
      color: 'green' as const,
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.value,
      icon: UsersIcon,
      change: stats.activeUsers.change,
      changeType: stats.activeUsers.changeType,
      color: 'red' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
