'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { submissionSchema } from '@/lib/validation/submission';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';
import type { ReCAPTCHA as ReCAPTCHAInstance } from 'react-google-recaptcha';

export default function SubmitPage() {
  const t = useTranslations();
  const locale = useLocale() as 'en' | 'bn';
  const isEnglish = locale === 'en';
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const recaptchaRef = useRef<ReCAPTCHAInstance | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const captchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY;
  const captchaRequired = Boolean(captchaSiteKey) && process.env.NODE_ENV === 'production';
  const maxFileSizeMb = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE_MB ?? '25');
  const maxFileSizeBytes = Math.max(1, maxFileSizeMb) * 1024 * 1024;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setCaptchaError(null);
    setStatus('submitting');
    const formData = new FormData(e.currentTarget);
    
    // Add file to form data if selected
    if (selectedFile) {
      formData.append('attachment', selectedFile);
    }

    if (captchaRequired && !captchaToken) {
      setStatus('error');
      const message = isEnglish ? 'Please complete the verification challenge before submitting.' : 'জমা দেওয়ার আগে অনুগ্রহ করে যাচাইকরণ সম্পন্ন করুন।';
      setCaptchaError(message);
      setErrorMsg(message);
      return;
    }
    
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      shareName: formData.get('shareName') === 'on',
      message: formData.get('message') as string,
      honeypot: formData.get('website') as string
    };
    
    const parsed = submissionSchema.safeParse(data);
    if (!parsed.success) {
      setStatus('error');
      // Extract field-specific errors
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          const fieldName = issue.path[0] as string;
          errors[fieldName] = issue.message;
        }
      });
      setFieldErrors(errors);
      setErrorMsg('Please check your input and try again.');
      return;
    }
    
    // Clear any previous field errors
    setFieldErrors({});
    
    try {
      let response;
      if (selectedFile) {
        // Send as FormData when file is attached
        const submitFormData = new FormData();
        submitFormData.append('name', parsed.data.name || '');
        submitFormData.append('phone', parsed.data.phone);
        submitFormData.append('email', parsed.data.email || '');
        submitFormData.append('shareName', parsed.data.shareName ? 'true' : 'false');
        submitFormData.append('message', parsed.data.message);
        submitFormData.append('website', formData.get('website') as string || '');
        submitFormData.append('attachment', selectedFile);
        if (captchaRequired && captchaToken) {
          submitFormData.append('captchaToken', captchaToken);
        }
        
        response = await fetch('/api/submit', {
          method: 'POST',
          body: submitFormData
        });
      } else {
        // Send as JSON when no file
        response = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...parsed.data,
            ...(captchaRequired && captchaToken ? { captchaToken } : {})
          })
        });
      }
      
      const result = await response.json();
      if (result.ok) {
        setStatus('success');
        (e.target as HTMLFormElement).reset();
        setSelectedFile(null);
        setFieldErrors({});
        setErrorMsg(null);
        setCaptchaToken(null);
        setCaptchaError(null);
        recaptchaRef.current?.reset();
        // Clear the file input
        const fileInput = document.getElementById('attachment') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setStatus('error');
        if (result.error?.issues) {
          // Handle validation errors from server
          const errors: Record<string, string> = {};
          result.error.issues.forEach((issue: any) => {
            if (issue.path && issue.path.length > 0) {
              const fieldName = issue.path[0] as string;
              errors[fieldName] = issue.message;
            }
          });
          setFieldErrors(errors);
        }
        setErrorMsg(result.error?.message || 'Submission failed');
        setCaptchaToken(null);
        recaptchaRef.current?.reset();
      }
    } catch (error) {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size
      if (file.size > maxFileSizeBytes) {
        setErrorMsg(`File size must be less than ${maxFileSizeMb}MB. Current file size: ${formatFileSize(file.size)}`);
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Check file type - Allow more file types for government submissions
      const allowedTypes = [
        // Images
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
        // Documents
        'application/pdf', 'text/plain', 'text/csv',
        // Microsoft Office
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // Archives
        'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed',
        // Audio/Video (for evidence)
        'audio/mpeg', 'audio/wav', 'audio/mp3',
        'video/mp4', 'video/avi', 'video/quicktime'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg(`File type not supported. Allowed types: Images, PDF, Text, Word, Excel, PowerPoint, ZIP, Audio, Video files. Current type: ${file.type}`);
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Additional validation for executable files (security)
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.vbs', '.js', '.jar'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (dangerousExtensions.includes(fileExtension)) {
        setErrorMsg('Executable files are not allowed for security reasons.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setSelectedFile(file);
      setErrorMsg(null);
    }
  };

  return (
    <div className="min-h-screen py-2 sm:py-3 lg:py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Government Header with Official Seal */}
        <div className="bg-white dark:bg-slate-800 shadow-lg border-l-4 border-green-600 mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Official Seal/Logo */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white break-words">
                    {t('form.pageTitle')}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                    {isEnglish ? 'Government of the People\'s Republic of Bangladesh' : 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার'}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {isEnglish ? 'Official Opinion Submission Portal' : 'সরকারি অভিমত জমাদান পোর্টাল'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {isEnglish ? 'Secure & Confidential' : 'নিরাপদ ও গোপনীয়'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mb-2 sm:mb-4">
          <Link href={`/${locale}`} className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors text-sm sm:text-base">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('form.backToHome')}
          </Link>
        </div>

        {/* Description Section */}
        {/* <div className="bg-white dark:bg-slate-800 shadow-lg mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
              {isEnglish ? 'Submit Your Opinion' : 'আপনার অভিমত জমা দিন'}
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('form.pageDescription')}
            </p>
          </div>
        </div> */}

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 shadow-lg">
            {/* Form Header */}
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700 bg-green-50 dark:bg-green-900/20">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="truncate">{t('form.title')}</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                {t('form.desc')}
              </p>
            </div>

            {/* Form Body */}
            <div className="p-4 sm:p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" aria-label="opinion form">
                {/* Honeypot field */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute left-[-9999px] opacity-0"
                  aria-hidden="true"
                />

                {/* Name Field */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('form.name')}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={`w-full border rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm focus:ring-2 transition-colors bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 ${
                      fieldErrors.name
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-200'
                    }`}
                    placeholder={t('form.namePlaceholder')}
                  />
                  {fieldErrors.name && (
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('form.phone')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className={`w-full border rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm focus:ring-2 transition-colors bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 ${
                      fieldErrors.phone
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-200'
                    }`}
                    placeholder={t('form.phonePlaceholder')}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('form.email')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`w-full border rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm focus:ring-2 transition-colors bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 ${
                      fieldErrors.email
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-200'
                    }`}
                    placeholder={t('form.emailPlaceholder')}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Name Sharing Consent */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <input
                      id="shareName"
                      name="shareName"
                      type="checkbox"
                      className="mt-0.5 sm:mt-1 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label htmlFor="shareName" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer break-words">
                        {t('form.shareName')}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-words">
                        {t('form.shareNameDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message Field */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="message" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('form.message')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    maxLength={500}
                    rows={5}
                    className={`w-full border rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm focus:ring-2 transition-colors resize-y bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 ${
                      fieldErrors.message
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 dark:border-slate-600 focus:border-green-500 focus:ring-green-200'
                    }`}
                    placeholder={t('form.placeholder')}
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                    <div>
                      {fieldErrors.message && (
                        <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {fieldErrors.message}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {isEnglish ? 'Max 500 characters' : 'সর্বোচ্চ ৫০০ অক্ষর'}
                    </div>
                  </div>
                </div>

                {/* File Upload Field */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label htmlFor="attachment" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('form.attachment')}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 sm:p-6 text-center hover:border-green-400 transition-colors bg-gray-50 dark:bg-slate-700">
                    <input
                      id="attachment"
                      name="attachment"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.mp3,.mp4,.avi,.wav"
                      className="hidden"
                    />
                    <label htmlFor="attachment" className="cursor-pointer">
                      <div className="flex flex-col items-center space-y-1.5 sm:space-y-2">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-words text-center">
                          {selectedFile ? selectedFile.name : t('form.uploadText')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedFile ? `Size: ${formatFileSize(selectedFile.size)}` : t('form.uploadHint')}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 text-center break-words px-2">
                          {isEnglish
                            ? `Max size: ${maxFileSizeMb}MB | Supported: Images, Documents, Archives, Audio, Video`
                            : `সর্বোচ্চ আকার: ${maxFileSizeMb}MB | সমর্থিত: ছবি, ডকুমেন্ট, আর্কাইভ, অডিও, ভিডিও`}
                        </span>
                      </div>
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 sm:p-3">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium truncate">{selectedFile.name}</span>
                          <span className="text-xs text-green-600 dark:text-green-400">{formatFileSize(selectedFile.size)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          // Clear the file input
                          const fileInput = document.getElementById('attachment') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        className="text-green-600 hover:text-green-800 transition-colors p-1 flex-shrink-0"
                        title="Remove file"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-slate-700">
                  <div className="w-full sm:w-auto">
                    {captchaRequired && captchaSiteKey ? (
                      <ReCAPTCHA
                        sitekey={captchaSiteKey}
                        ref={recaptchaRef}
                        onChange={(token) => {
                          if (token) {
                            setCaptchaToken(token);
                            setCaptchaError(null);
                          } else {
                            setCaptchaToken(null);
                          }
                        }}
                        onExpired={() => {
                          setCaptchaToken(null);
                          setCaptchaError(isEnglish ? 'Verification expired. Please try again.' : 'যাচাইকরণের সময়সীমা শেষ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
                        }}
                        onErrored={() => {
                          const message = isEnglish ? 'Verification could not be completed. Please reload the challenge.' : 'যাচাইকরণ সম্পন্ন করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।';
                          setCaptchaToken(null);
                          setCaptchaError(message);
                        }}
                      />
                    ) : process.env.NODE_ENV === 'development' ? (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-blue-800 dark:text-blue-200 text-xs">
                          <strong>Development Mode:</strong> {isEnglish ? 'reCAPTCHA is disabled for easier testing.' : 'পরীক্ষার সুবিধার জন্য reCAPTCHA নিষ্ক্রিয় করা হয়েছে।'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-yellow-600">
                        {isEnglish ? 'Captcha protection is not configured. Please contact the administrator.' : 'ক্যাপচা সুরক্ষা কনফিগার করা হয়নি। অনুগ্রহ করে প্রশাসকের সাথে যোগাযোগ করুন।'}
                      </p>
                    )}
                    {captchaError && (
                      <p className="text-xs text-red-600 mt-2" role="alert">{captchaError}</p>
                    )}
                  </div>
                  <button
                    disabled={status === 'submitting'}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                    type="submit"
                  >
                    {status === 'submitting' ? (
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t('form.submitting')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>{t('form.submit')}</span>
                      </div>
                    )}
                  </button>
                  <button
                    type="reset"
                    onClick={() => {
                      setSelectedFile(null);
                      setFieldErrors({});
                      setErrorMsg(null);
                      setStatus('idle');
                      // Clear the file input
                      const fileInput = document.getElementById('attachment') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-xs sm:text-sm"
                  >
                    {t('form.reset')}
                  </button>
                </div>

                {/* Privacy Notice */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 break-words">{t('form.privacy')}</p>
                  </div>
                </div>
              </form>

              {/* Status Messages */}
              {status === 'success' && (
                <div className="mt-4 sm:mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 font-medium">{t('success.submitted')}</p>
                  </div>
                </div>
              )}
              
              {status === 'error' && errorMsg && (
                <div className="mt-4 sm:mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 font-medium break-words">{errorMsg}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-6 sm:mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 sm:mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-1 sm:mb-2">
                {isEnglish ? 'Important Guidelines' : 'গুরুত্বপূর্ণ নির্দেশিকা'}
              </h4>
              <div className="text-yellow-800 dark:text-yellow-200 text-xs sm:text-sm leading-relaxed space-y-1.5 sm:space-y-2">
                <p className="break-words">
                  {isEnglish 
                    ? '• Please provide factual and constructive feedback about election-related matters'
                    : '• অনুগ্রহ করে নির্বাচন সংক্রান্ত বিষয়ে তথ্যভিত্তিক ও গঠনমূলক মতামত প্রদান করুন'
                  }
                </p>
                <p className="break-words">
                  {isEnglish 
                    ? '• All submissions are confidential and will be reviewed by the commission'
                    : '• সকল জমাদান গোপনীয় এবং কমিশন কর্তৃক পর্যালোচিত হবে'
                  }
                </p>
                <p className="break-words">
                  {isEnglish 
                    ? '• Avoid sharing sensitive personal information in your submission'
                    : '• আপনার জমাদানে সংবেদনশীল ব্যক্তিগত তথ্য শেয়ার করা এড়িয়ে চলুন'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
