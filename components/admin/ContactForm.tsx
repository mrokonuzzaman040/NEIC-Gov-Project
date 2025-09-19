"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ClockIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

interface ContactInfo {
  id: string;
  type: 'OFFICE' | 'DEPARTMENT' | 'PERSON' | 'HOTLINE';
  nameEn: string;
  nameBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  addressEn?: string;
  addressBn?: string;
  phone?: string;
  email?: string;
  website?: string;
  hoursEn?: string;
  hoursBn?: string;
  order: number;
  isActive: boolean;
}

interface ContactFormProps {
  contactId: string;
}

const CONTACT_TYPES = [
  { value: 'OFFICE', label: 'Office', icon: BuildingOfficeIcon },
  { value: 'DEPARTMENT', label: 'Department', icon: UserGroupIcon },
  { value: 'PERSON', label: 'Person', icon: UserGroupIcon },
  { value: 'HOTLINE', label: 'Hotline', icon: PhoneIcon },
];

export default function ContactForm({ contactId }: ContactFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(contactId !== 'new');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    type: 'OFFICE' as const,
    nameEn: '',
    nameBn: '',
    descriptionEn: '',
    descriptionBn: '',
    addressEn: '',
    addressBn: '',
    phone: '',
    email: '',
    website: '',
    hoursEn: '',
    hoursBn: '',
    order: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing contact data if editing
  useEffect(() => {
    if (contactId !== 'new') {
      const loadContact = async () => {
        try {
          const response = await fetch(`/api/admin/contact?id=${contactId}`);
          if (response.ok) {
            const data = await response.json();
            const contact = data.contact;
            setFormData({
              type: contact.type || 'OFFICE',
              nameEn: contact.nameEn || '',
              nameBn: contact.nameBn || '',
              descriptionEn: contact.descriptionEn || '',
              descriptionBn: contact.descriptionBn || '',
              addressEn: contact.addressEn || '',
              addressBn: contact.addressBn || '',
              phone: contact.phone || '',
              email: contact.email || '',
              website: contact.website || '',
              hoursEn: contact.hoursEn || '',
              hoursBn: contact.hoursBn || '',
              order: contact.order || 0,
              isActive: contact.isActive !== undefined ? contact.isActive : true,
            });
          } else {
            setMessage({ type: 'error', text: 'Failed to load contact information' });
          }
        } catch (error) {
          setMessage({ type: 'error', text: 'Error loading contact information' });
        } finally {
          setIsLoadingData(false);
        }
      };

      loadContact();
    }
  }, [contactId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nameEn.trim()) newErrors.nameEn = 'English name is required';
    if (!formData.nameBn.trim()) newErrors.nameBn = 'Bengali name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const url = contactId === 'new' ? '/api/admin/contact' : '/api/admin/contact';
      const method = contactId === 'new' ? 'POST' : 'PUT';
      
      const payload = contactId === 'new' ? formData : { id: contactId, ...formData };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Contact information saved successfully!' });
        setTimeout(() => {
          router.push('/en/admin/settings/contact');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save contact information' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push('/en/admin/settings/contact')}
          className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Contact Management</span>
        </button>
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

      {/* Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 mr-2" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => handleInputChange('nameEn', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.nameEn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="Enter English name"
                />
                {errors.nameEn && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.nameEn}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name (Bengali) *
                </label>
                <input
                  type="text"
                  value={formData.nameBn}
                  onChange={(e) => handleInputChange('nameBn', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.nameBn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="বাংলা নাম লিখুন"
                />
                {errors.nameBn && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.nameBn}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description (English)
                </label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter English description"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description (Bengali)
                </label>
                <textarea
                  value={formData.descriptionBn}
                  onChange={(e) => handleInputChange('descriptionBn', e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="বাংলা বর্ণনা লিখুন"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <PhoneIcon className="h-5 w-5 mr-2" />
              Contact Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+880-2-8181919"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="info@ecs.gov.bd"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Website URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GlobeAltIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://www.ecs.gov.bd"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Address Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Address (English)
                </label>
                <textarea
                  value={formData.addressEn}
                  onChange={(e) => handleInputChange('addressEn', e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter English address"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Address (Bengali)
                </label>
                <textarea
                  value={formData.addressBn}
                  onChange={(e) => handleInputChange('addressBn', e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="বাংলা ঠিকানা লিখুন"
                />
              </div>
            </div>
          </div>

          {/* Hours Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Hours Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Hours (English)
                </label>
                <input
                  type="text"
                  value={formData.hoursEn}
                  onChange={(e) => handleInputChange('hoursEn', e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Sunday to Thursday: 9:00 AM - 5:00 PM"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Hours (Bengali)
                </label>
                <input
                  type="text"
                  value={formData.hoursBn}
                  onChange={(e) => handleInputChange('hoursBn', e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="রবিবার থেকে বৃহস্পতিবার: সকাল ৯:০০ - বিকাল ৫:০০"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <ListBulletIcon className="h-5 w-5 mr-2" />
              Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {CONTACT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                  min="0"
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Lower numbers appear first
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                      Active
                    </span>
                  </label>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inactive contacts won&apos;t be displayed publicly
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => router.push('/en/admin/settings/contact')}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <PhoneIcon className="h-4 w-4" />
                  <span>{contactId === 'new' ? 'Create Contact' : 'Update Contact'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
