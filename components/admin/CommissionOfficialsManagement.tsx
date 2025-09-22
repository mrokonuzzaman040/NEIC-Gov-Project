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
  serial_no: number;
  name_english: string;
  name_bangla: string;
  designation_english: string;
  designation_bangla: string;
  department: string;
  telephone?: string;
  mobile: string;
  room_no?: string;
  category: 'Chief_and_Members' | 'Cabinet Division' | 'Law and Justice Division' | 'National Parliament Secretariat' | 'Statistics and Information Management Division' | 'Election Commission Secretariat';
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
      case 'Chief_and_Members':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Cabinet Division':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Law and Justice Division':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'National Parliament Secretariat':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'Statistics and Information Management Division':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      case 'Election Commission Secretariat':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300';
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
      official.name_english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      official.name_bangla.includes(searchTerm) ||
      official.designation_english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      official.designation_bangla.includes(searchTerm) ||
      official.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      official.mobile.includes(searchTerm) ||
      (official.telephone && official.telephone.includes(searchTerm));
    
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
          <option value="Chief_and_Members">Chief & Members</option>
          <option value="Cabinet Division">Cabinet Division</option>
          <option value="Law and Justice Division">Law and Justice Division</option>
          <option value="National Parliament Secretariat">National Parliament Secretariat</option>
          <option value="Statistics and Information Management Division">Statistics and Information Management Division</option>
          <option value="Election Commission Secretariat">Election Commission Secretariat</option>
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

      {/* Officials List - Grouped by Category */}
      <div className="space-y-8">
        {(() => {
          // Group officials by category
          const groupedOfficials = filteredOfficials.reduce((acc, official) => {
            const category = official.category;
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(official);
            return acc;
          }, {} as Record<string, CommissionOfficial[]>);

          // Sort categories for consistent display
          const categoryOrder = [
            'Chief_and_Members',
            'Cabinet Division',
            'Law and Justice Division',
            'National Parliament Secretariat',
            'Statistics and Information Management Division',
            'Election Commission Secretariat'
          ];

          return categoryOrder.map(category => {
            const officials = groupedOfficials[category];
            if (!officials || officials.length === 0) return null;

            return (
              <div key={category} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                {/* Category Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryBadgeColor(category)}`}>
                        {category.replace('_', ' & ')}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {officials.length} official{officials.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                          Serial
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                          Name (English)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                          Name (Bengali)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                          Designation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                          Room
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {officials.map((official) => (
                        <tr key={official.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                            {official.serial_no}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {official.name_english}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {official.name_bangla}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-slate-100">
                              {official.designation_english}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {official.designation_bangla}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {official.department}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {official.room_no || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              {official.telephone && (
                                <div className="text-sm">
                                  <a href={`tel:${official.telephone}`} className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400">
                                    📞 {official.telephone}
                                  </a>
                                </div>
                              )}
                              <div className="text-sm">
                                <a href={`tel:${official.mobile}`} className="text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400">
                                  📱 {official.mobile}
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              official.isActive 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                            }`}>
                              {official.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }).filter(Boolean);
        })()}
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

