"use client";
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ChangePasswordForm() {
  const { update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required' });
      return false;
    }

    if (!formData.newPassword) {
      setMessage({ type: 'error', text: 'New password is required' });
      return false;
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage({ type: 'error', text: 'New password must be different from current password' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        // Update the session
        await update();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Change Password
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Enter your current password and choose a new one
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Current Password */}
        <div className="space-y-2">
          <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Current Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="currentPassword"
              name="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleInputChange}
              required
              className="block w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPasswords.current ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="newPassword"
              name="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleInputChange}
              required
              className="block w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPasswords.new ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="block w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPasswords.confirm ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
            Password Requirements:
          </h4>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <li className="flex items-center">
              <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
              At least 8 characters long
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
              Different from your current password
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
              Use a combination of letters, numbers, and symbols
            </li>
          </ul>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`rounded-lg p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <p className={`text-sm font-medium ${
              message.type === 'success' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              });
              setMessage(null);
            }}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}
