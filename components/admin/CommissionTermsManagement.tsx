"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  DocumentCheckIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  TagIcon,
  ListBulletIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface CommissionTerm {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  category: string;
  section: string;
  order: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CommissionTermsManagement() {
  const router = useRouter();
  const [terms, setTerms] = useState<CommissionTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load commission terms from database
  useEffect(() => {
    const loadTerms = async () => {
      try {
        const response = await fetch('/api/admin/commission/terms');
        if (response.ok) {
          const data = await response.json();
          setTerms(data.terms || []);
        } else {
          setMessage({ type: 'error', text: 'Failed to load commission terms' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Error loading commission terms' });
      } finally {
        setIsLoading(false);
      }
    };

    loadTerms();
  }, []);

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'mandate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'powers':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'scope':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'reporting':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'procedures':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const isExpired = (effectiveTo?: string) => {
    if (!effectiveTo) return false;
    return new Date(effectiveTo) < new Date();
  };

  const handleEditTerm = (termId: string) => {
    router.push(`/en/admin/commission/terms/${termId}` as any);
  };

  const handleDeleteTerm = async (termId: string) => {
    if (window.confirm('Are you sure you want to delete this term?')) {
      try {
        const response = await fetch(`/api/admin/commission/terms?id=${termId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Term deleted successfully!' });
          setTerms(terms.filter(term => term.id !== termId));
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: error.error || 'Failed to delete term' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Network error. Please try again.' });
      }
    }
  };

  const handleToggleActive = async (termId: string) => {
    const term = terms.find(t => t.id === termId);
    if (!term) return;

    try {
      const response = await fetch('/api/admin/commission/terms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: termId,
          isActive: !term.isActive,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Term status updated!' });
        setTerms(terms.map(t => 
          t.id === termId ? { ...t, isActive: !t.isActive } : t
        ));
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  // Filter terms based on search and category
  const filteredTerms = terms.filter(term => {
    const matchesSearch = searchTerm === '' || 
      term.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.titleBn.includes(searchTerm) ||
      term.descriptionEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.descriptionBn.includes(searchTerm) ||
      term.section.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading terms of reference...</p>
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
            {filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''} total
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {terms.filter(t => t.isActive).length} active
          </div>
        </div>
        <button
          onClick={() => router.push('/en/admin/commission/terms/new' as any)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Term</span>
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
            placeholder="Search terms..."
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="mandate">Mandate</option>
          <option value="powers">Powers</option>
          <option value="scope">Scope</option>
          <option value="reporting">Reporting</option>
          <option value="procedures">Procedures</option>
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

      {/* Terms List */}
      <div className="space-y-4">
        {filteredTerms.map((term) => (
          <div key={term.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <DocumentCheckIcon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {term.titleEn}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(term.category)}`}>
                        <TagIcon className="h-3 w-3 mr-1" />
                        {term.category}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                        <ListBulletIcon className="h-3 w-3 mr-1" />
                        {term.section}
                      </span>
                      {!term.isActive && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
                          Inactive
                        </span>
                      )}
                      {isExpired(term.effectiveTo) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                          Expired
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {term.titleBn}
                    </p>
                    
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                      {term.descriptionEn}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>Effective from: {new Date(term.effectiveFrom).toLocaleDateString()}</span>
                      </div>
                      {term.effectiveTo && (
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>Until: {new Date(term.effectiveTo).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div>Order: {term.order}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEditTerm(term.id)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                    title="Edit Term"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(term.id)}
                    className={`p-1 ${term.isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400 hover:text-green-600 dark:hover:text-green-400'}`}
                    title={term.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTerm(term.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                    title="Delete Term"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-12">
          <DocumentCheckIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No terms</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchTerm || selectedCategory !== 'all'
              ? 'No terms match your search criteria.' 
              : 'Get started by adding a new term of reference.'}
          </p>
          {(!searchTerm && selectedCategory === 'all') && (
            <div className="mt-6">
              <button
                onClick={() => router.push('/en/admin/commission/terms/new' as any)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Term of Reference
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
