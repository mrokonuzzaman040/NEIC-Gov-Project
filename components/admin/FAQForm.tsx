"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  QuestionMarkCircleIcon,
  TagIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

interface FAQ {
  id: string;
  questionEn: string;
  questionBn: string;
  answerEn: string;
  answerBn: string;
  category: string;
  order: number;
  isActive: boolean;
}

interface FAQFormProps {
  faqId: string;
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'complaints', label: 'Complaints' },
  { value: 'process', label: 'Process' },
  { value: 'support', label: 'Support' },
  { value: 'reporting', label: 'Reporting' },
  { value: 'technical', label: 'Technical' },
];

export default function FAQForm({ faqId }: FAQFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(faqId !== 'new');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    questionEn: '',
    questionBn: '',
    answerEn: '',
    answerBn: '',
    category: 'general',
    order: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing FAQ data if editing
  useEffect(() => {
    if (faqId !== 'new') {
      const loadFAQ = async () => {
        try {
          const response = await fetch(`/api/admin/faq?id=${faqId}`);
          if (response.ok) {
            const data = await response.json();
            const faq = data.faq;
            setFormData({
              questionEn: faq.questionEn || '',
              questionBn: faq.questionBn || '',
              answerEn: faq.answerEn || '',
              answerBn: faq.answerBn || '',
              category: faq.category || 'general',
              order: faq.order || 0,
              isActive: faq.isActive !== undefined ? faq.isActive : true,
            });
          } else {
            setMessage({ type: 'error', text: 'Failed to load FAQ' });
          }
        } catch (error) {
          setMessage({ type: 'error', text: 'Error loading FAQ' });
        } finally {
          setIsLoadingData(false);
        }
      };

      loadFAQ();
    }
  }, [faqId]);

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

    if (!formData.questionEn.trim()) newErrors.questionEn = 'English question is required';
    if (!formData.questionBn.trim()) newErrors.questionBn = 'Bengali question is required';
    if (!formData.answerEn.trim()) newErrors.answerEn = 'English answer is required';
    if (!formData.answerBn.trim()) newErrors.answerBn = 'Bengali answer is required';

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
      const url = faqId === 'new' ? '/api/admin/faq' : '/api/admin/faq';
      const method = faqId === 'new' ? 'POST' : 'PUT';
      
      const payload = faqId === 'new' ? formData : { id: faqId, ...formData };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'FAQ saved successfully!' });
        setTimeout(() => {
          router.push('/en/admin/settings/faq' as any);
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save FAQ' });
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
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading FAQ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push('/en/admin/settings/faq' as any)}
          className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to FAQ Management</span>
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
          {/* Question Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
              Question
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Question (English) *
                </label>
                <textarea
                  value={formData.questionEn}
                  onChange={(e) => handleInputChange('questionEn', e.target.value)}
                  rows={3}
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.questionEn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="Enter English question"
                />
                {errors.questionEn && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.questionEn}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Question (Bengali) *
                </label>
                <textarea
                  value={formData.questionBn}
                  onChange={(e) => handleInputChange('questionBn', e.target.value)}
                  rows={3}
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.questionBn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="বাংলা প্রশ্ন লিখুন"
                />
                {errors.questionBn && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.questionBn}</p>
                )}
              </div>
            </div>
          </div>

          {/* Answer Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <ListBulletIcon className="h-5 w-5 mr-2" />
              Answer
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Answer (English) *
                </label>
                <textarea
                  value={formData.answerEn}
                  onChange={(e) => handleInputChange('answerEn', e.target.value)}
                  rows={6}
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.answerEn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="Enter English answer"
                />
                {errors.answerEn && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.answerEn}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Answer (Bengali) *
                </label>
                <textarea
                  value={formData.answerBn}
                  onChange={(e) => handleInputChange('answerBn', e.target.value)}
                  rows={6}
                  className={`block w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.answerBn ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="বাংলা উত্তর লিখুন"
                />
                {errors.answerBn && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.answerBn}</p>
                )}
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <TagIcon className="h-5 w-5 mr-2" />
              Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
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
                  Inactive FAQs won&apos;t be displayed publicly
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => router.push('/en/admin/settings/faq' as any)}
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
                  <QuestionMarkCircleIcon className="h-4 w-4" />
                  <span>{faqId === 'new' ? 'Create FAQ' : 'Update FAQ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
