"use client";
import { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  UserIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ActivityItem {
  id: string;
  type: 'submission' | 'user' | 'system';
  action: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error';
}

function ActivityItem({ item }: { item: ActivityItem }) {
  const getIcon = () => {
    switch (item.type) {
      case 'submission':
        return DocumentTextIcon;
      case 'user':
        return UserIcon;
      case 'system':
        return ClockIcon;
      default:
        return ClockIcon;
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const Icon = getIcon();

  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
          <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {item.action}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {item.description}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
          {item.timestamp}
        </p>
      </div>
      {item.status && (
        <div className="flex-shrink-0">
          {item.status === 'success' && (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          )}
          {item.status === 'warning' && (
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
          )}
          {item.status === 'error' && (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          )}
        </div>
      )}
    </div>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex items-start space-x-3 p-4 animate-pulse">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
      </div>
    </div>
  );
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecentActivity = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/admin/dashboard');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }
        
        const data = await response.json();
        setActivities(data.activities || []);
      } catch (error) {
        console.error('Error loading recent activity:', error);
        setError(error instanceof Error ? error.message : 'Failed to load recent activity');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentActivity();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Recent Activity
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Latest system and user activities
        </p>
      </div>
      
      {isLoading ? (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {Array.from({ length: 5 }).map((_, index) => (
            <ActivityItemSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                Error Loading Activity
              </h4>
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      ) : activities.length === 0 ? (
        <div className="p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No recent activity
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Activity will appear here as users interact with the system.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} item={activity} />
          ))}
        </div>
      )}
      
      {!isLoading && !error && activities.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <button className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
}
