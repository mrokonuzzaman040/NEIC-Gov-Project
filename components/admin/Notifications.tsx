"use client";
import { useState, useEffect } from 'react';
import { 
  BellIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Mock notification data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'New Submission Received',
        message: 'A new election complaint has been submitted and requires review.',
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: '/en/admin/submissions',
      },
      {
        id: '2',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM.',
        type: 'warning',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
      {
        id: '3',
        title: 'Password Changed',
        message: 'Your password was successfully updated.',
        type: 'success',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true,
      },
      {
        id: '4',
        title: 'Failed Login Attempt',
        message: 'An unsuccessful login attempt was detected from IP 192.168.1.100.',
        type: 'error',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: false,
      },
    ];

    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notification => notification.id !== notificationId));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg z-20">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      !notification.read ? 'bg-slate-50 dark:bg-slate-700/30' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-1">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                        {notification.actionUrl && (
                          <button
                            onClick={() => {
                              markAsRead(notification.id);
                              window.location.href = notification.actionUrl!;
                            }}
                            className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 mt-1"
                          >
                            View Details →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                <button className="w-full text-center text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
