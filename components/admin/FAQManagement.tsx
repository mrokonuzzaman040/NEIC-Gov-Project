"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ChevronDownIcon,
  ChevronRightIcon,
  QuestionMarkCircleIcon,
  TagIcon,
  MagnifyingGlassIcon,
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
  createdAt: string;
  updatedAt: string;
}

export default function FAQManagementNew() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Load FAQ data from API
  useEffect(() => {
    const loadFAQs = async () => {
      try {
        const response = await fetch('/api/admin/faq');
        if (response.ok) {
          const data = await response.json();
          setFaqs(data.faqs || []);
        } else {
          setMessage({ type: 'error', text: 'Failed to load FAQs' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Error loading FAQs' });
      } finally {
        setIsLoading(false);
      }
    };

    loadFAQs();
  }, []);

  const getCategoryBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'complaints':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'process':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'support':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'reporting':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'technical':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleEditFAQ = (faqId: string) => {
    router.push(`/en/admin/settings/faq/${faqId}` as any);
  };

  const handleDeleteFAQ = async (faqId: string) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        const response = await fetch(`/api/admin/faq?id=${faqId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'FAQ deleted successfully!' });
          setFaqs(faqs.filter(faq => faq.id !== faqId));
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: error.error || 'Failed to delete FAQ' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Network error. Please try again.' });
      }
    }
  };

  const handleToggleActive = async (faqId: string) => {
    const faq = faqs.find(f => f.id === faqId);
    if (!faq) return;

    try {
      const response = await fetch('/api/admin/faq', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: faqId,
          isActive: !faq.isActive,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'FAQ status updated!' });
        setFaqs(faqs.map(f => 
          f.id === faqId ? { ...f, isActive: !f.isActive } : f
        ));
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.questionEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.questionBn.includes(searchTerm) ||
      faq.answerEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answerBn.includes(searchTerm);
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {filteredFAQs.length} FAQ{filteredFAQs.length !== 1 ? 's' : ''} total
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {faqs.filter(f => f.isActive).length} active
          </div>
        </div>
        <button
          onClick={() => router.push('/en/admin/settings/faq/new' as any)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add FAQ</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Search FAQs..."
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="general">General</option>
          <option value="complaints">Complaints</option>
          <option value="process">Process</option>
          <option value="support">Support</option>
          <option value="reporting">Reporting</option>
          <option value="technical">Technical</option>
        </select>
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

      {/* FAQs List */}
      <div className="space-y-4">
        {filteredFAQs.map((faq) => (
          <div key={faq.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <QuestionMarkCircleIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {faq.questionEn}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(faq.category)}`}>
                        <TagIcon className="h-3 w-3 mr-1" />
                        {faq.category}
                      </span>
                      {!faq.isActive && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {faq.questionBn}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleExpanded(faq.id)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {expandedItems.has(faq.id) ? (
                      <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5" />
                    )}
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditFAQ(faq.id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                      title="Edit FAQ"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(faq.id)}
                      className={`p-1 ${faq.isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400 hover:text-green-600 dark:hover:text-green-400'}`}
                      title={faq.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <ListBulletIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFAQ(faq.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                      title="Delete FAQ"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedItems.has(faq.id) && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Answer (English)
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {faq.answerEn}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Answer (Bengali)
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {faq.answerBn}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                      <div>
                        Order: {faq.order}
                      </div>
                      <div>
                        Created: {new Date(faq.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        Updated: {new Date(faq.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredFAQs.length === 0 && (
        <div className="text-center py-12">
          <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No FAQs</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchTerm || selectedCategory !== 'all' 
              ? 'No FAQs match your search criteria.' 
              : 'Get started by creating a new FAQ.'}
          </p>
          {(!searchTerm && selectedCategory === 'all') && (
            <div className="mt-6">
              <button
                onClick={() => router.push('/en/admin/settings/faq/new' as any)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add FAQ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
