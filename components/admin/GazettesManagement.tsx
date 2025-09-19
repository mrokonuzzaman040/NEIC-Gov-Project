"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  NewspaperIcon,
  CalendarIcon,
  DocumentIcon,
  MagnifyingGlassIcon,
  TagIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Gazette {
  id: string;
  titleEn: string;
  titleBn: string;
  gazetteNumber: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  publishedAt: string;
  downloadUrl: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function GazettesManagement() {
  const router = useRouter();
  const [gazettes, setGazettes] = useState<Gazette[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Load gazettes from database
  useEffect(() => {
    const loadGazettes = async () => {
      try {
        const response = await fetch('/api/admin/commission/gazettes');
        if (response.ok) {
          const data = await response.json();
          setGazettes(data.gazettes || []);
        } else {
          setMessage({ type: 'error', text: 'Failed to load gazettes' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Error loading gazettes' });
      } finally {
        setIsLoading(false);
      }
    };

    loadGazettes();
  }, []);

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'formation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'terms':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'appointment':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'powers':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'procedures':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleEditGazette = (gazetteId: string) => {
    router.push(`/en/admin/commission/gazettes/${gazetteId}` as any);
  };

  const handleDeleteGazette = async (gazetteId: string) => {
    if (window.confirm('Are you sure you want to delete this gazette?')) {
      try {
        const response = await fetch(`/api/admin/commission/gazettes?id=${gazetteId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Gazette deleted successfully!' });
          setGazettes(gazettes.filter(gazette => gazette.id !== gazetteId));
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: error.error || 'Failed to delete gazette' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Network error. Please try again.' });
      }
    }
  };

  const handleToggleActive = async (gazetteId: string) => {
    const gazette = gazettes.find(g => g.id === gazetteId);
    if (!gazette) return;

    try {
      const response = await fetch('/api/admin/commission/gazettes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: gazetteId,
          isActive: !gazette.isActive,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Gazette status updated!' });
        setGazettes(gazettes.map(g => 
          g.id === gazetteId ? { ...g, isActive: !g.isActive } : g
        ));
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  // Filter gazettes based on search and filters
  const filteredGazettes = gazettes.filter(gazette => {
    const matchesSearch = searchTerm === '' || 
      gazette.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gazette.titleBn.includes(searchTerm) ||
      gazette.gazetteNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || gazette.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || gazette.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading gazettes...</p>
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
            {filteredGazettes.length} gazette{filteredGazettes.length !== 1 ? 's' : ''} total
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {gazettes.filter(g => g.isActive).length} active
          </div>
        </div>
        <button
          onClick={() => router.push('/en/admin/commission/gazettes/new' as any)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Gazette</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Search gazettes..."
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="formation">Formation</option>
          <option value="terms">Terms</option>
          <option value="appointment">Appointment</option>
          <option value="powers">Powers</option>
          <option value="procedures">Procedures</option>
        </select>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
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

      {/* Gazettes List */}
      <div className="space-y-4">
        {filteredGazettes.map((gazette) => (
          <div key={gazette.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <NewspaperIcon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {gazette.titleEn}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(gazette.category)}`}>
                        <TagIcon className="h-3 w-3 mr-1" />
                        {gazette.category}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(gazette.priority)}`}>
                        {gazette.priority}
                      </span>
                      {!gazette.isActive && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {gazette.titleBn}
                    </p>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        <DocumentIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {gazette.gazetteNumber}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Published: {new Date(gazette.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {gazette.description && (
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                        {gazette.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-2">
                      <a
                        href={gazette.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download PDF
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEditGazette(gazette.id)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                    title="Edit Gazette"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(gazette.id)}
                    className={`p-1 ${gazette.isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400 hover:text-green-600 dark:hover:text-green-400'}`}
                    title={gazette.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGazette(gazette.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                    title="Delete Gazette"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGazettes.length === 0 && (
        <div className="text-center py-12">
          <NewspaperIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No gazettes</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all'
              ? 'No gazettes match your search criteria.' 
              : 'Get started by adding a new gazette.'}
          </p>
          {(!searchTerm && selectedCategory === 'all' && selectedPriority === 'all') && (
            <div className="mt-6">
              <button
                onClick={() => router.push('/en/admin/commission/gazettes/new' as any)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Gazette
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
