"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  UsersIcon,
  EnvelopeIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

interface CommissionOfficial {
  id: string;
  nameEn: string;
  nameBn: string;
  positionEn: string;
  positionBn: string;
  departmentEn: string;
  departmentBn: string;
  descriptionEn: string;
  descriptionBn: string;
  email: string;
  phone: string;
  experienceEn: string;
  experienceBn: string;
  qualificationEn: string;
  qualificationBn: string;
  image?: string;
  category: 'secretariat' | 'technical' | 'administrative' | 'support';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CommissionOfficialsManagement() {
  const router = useRouter();
  const [officials, setOfficials] = useState<CommissionOfficial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load commission officials from database
  useEffect(() => {
    const loadOfficials = async () => {
      try {
        const response = await fetch('/api/admin/commission/officials');
        if (response.ok) {
          const data = await response.json();
          setOfficials(data.officials || []);
        } else {
          setMessage({ type: 'error', text: 'Failed to load commission officials' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Error loading commission officials' });
      } finally {
        setIsLoading(false);
      }
    };

    loadOfficials();
  }, []);

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'secretariat':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'technical':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'administrative':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'support':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleEditOfficial = (officialId: string) => {
    router.push(`/en/admin/commission/officials/${officialId}` as any);
  };

  const handleDeleteOfficial = async (officialId: string) => {
    if (window.confirm('Are you sure you want to delete this official?')) {
      try {
        const response = await fetch(`/api/admin/commission/officials?id=${officialId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Official deleted successfully!' });
          setOfficials(officials.filter(official => official.id !== officialId));
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: error.error || 'Failed to delete official' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Network error. Please try again.' });
      }
    }
  };

  const handleToggleActive = async (officialId: string) => {
    const official = officials.find(o => o.id === officialId);
    if (!official) return;

    try {
      const response = await fetch('/api/admin/commission/officials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: officialId,
          isActive: !official.isActive,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Official status updated!' });
        setOfficials(officials.map(o => 
          o.id === officialId ? { ...o, isActive: !o.isActive } : o
        ));
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  // Filter officials based on search and category
  const filteredOfficials = officials.filter(official => {
    const matchesSearch = searchTerm === '' || 
      official.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      official.nameBn.includes(searchTerm) ||
      official.positionEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      official.positionBn.includes(searchTerm) ||
      official.departmentEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      official.departmentBn.includes(searchTerm) ||
      official.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || official.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading commission officials...</p>
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
            {filteredOfficials.length} official{filteredOfficials.length !== 1 ? 's' : ''} total
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {officials.filter(o => o.isActive).length} active
          </div>
        </div>
        <button
          onClick={() => router.push('/en/admin/commission/officials/new' as any)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Official</span>
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
            placeholder="Search officials..."
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="secretariat">Secretariat</option>
          <option value="technical">Technical</option>
          <option value="administrative">Administrative</option>
          <option value="support">Support</option>
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

      {/* Officials List */}
      <div className="space-y-4">
        {filteredOfficials.map((official) => (
          <div key={official.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <UsersIcon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {official.nameEn}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(official.category)}`}>
                        {official.category}
                      </span>
                      {!official.isActive && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {official.nameBn}
                    </p>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center space-x-1">
                        <BriefcaseIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {official.positionEn}
                        </span>
                      </div>
                      <span className="text-slate-400">•</span>
                      <div className="flex items-center space-x-1">
                        <BuildingOfficeIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {official.departmentEn}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                        <a href={`mailto:${official.email}`} className="text-sm text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400">
                          {official.email}
                        </a>
                      </div>
                      <div className="flex items-center space-x-2">
                        <PhoneIcon className="h-4 w-4 text-slate-400" />
                        <a href={`tel:${official.phone}`} className="text-sm text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400">
                          {official.phone}
                        </a>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <BriefcaseIcon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{official.experienceEn}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{official.experienceBn}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <AcademicCapIcon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{official.qualificationEn}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{official.qualificationBn}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEditOfficial(official.id)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                    title="Edit Official"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(official.id)}
                    className={`p-1 ${official.isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400 hover:text-green-600 dark:hover:text-green-400'}`}
                    title={official.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteOfficial(official.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                    title="Delete Official"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOfficials.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No officials</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchTerm || selectedCategory !== 'all'
              ? 'No officials match your search criteria.' 
              : 'Get started by adding a new commission official.'}
          </p>
          {(!searchTerm && selectedCategory === 'all') && (
            <div className="mt-6">
              <button
                onClick={() => router.push('/en/admin/commission/officials/new' as any)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Commission Official
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
