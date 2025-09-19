"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  MagnifyingGlassIcon,
  IdentificationIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface CommissionMember {
  id: string;
  nameEn: string;
  nameBn: string;
  designationEn: string;
  designationBn: string;
  descriptionEn: string;
  descriptionBn: string;
  email: string;
  phone: string;
  image?: string;
  serialNo: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CommissionMembersManagement() {
  const router = useRouter();
  const [members, setMembers] = useState<CommissionMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load commission members from database
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await fetch('/api/admin/commission/members');
        if (response.ok) {
          const data = await response.json();
          setMembers(data.members || []);
        } else {
          setMessage({ type: 'error', text: 'Failed to load commission members' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Error loading commission members' });
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();
  }, []);

  const handleEditMember = (memberId: string) => {
    router.push(`/en/admin/commission/members/${memberId}` as any);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (window.confirm('Are you sure you want to delete this commission member?')) {
      try {
        const response = await fetch(`/api/admin/commission/members?id=${memberId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Commission member deleted successfully!' });
          setMembers(members.filter(member => member.id !== memberId));
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: error.error || 'Failed to delete member' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Network error. Please try again.' });
      }
    }
  };

  const handleToggleActive = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    try {
      const response = await fetch('/api/admin/commission/members', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: memberId,
          isActive: !member.isActive,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Member status updated!' });
        setMembers(members.map(m => 
          m.id === memberId ? { ...m, isActive: !m.isActive } : m
        ));
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  // Filter members based on search
  const filteredMembers = members.filter(member => 
    searchTerm === '' || 
    member.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.nameBn.includes(searchTerm) ||
    member.designationEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.designationBn.includes(searchTerm) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading commission members...</p>
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
            {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} total
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {members.filter(m => m.isActive).length} active
          </div>
        </div>
        <button
          onClick={() => router.push('/en/admin/commission/members/new' as any)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Search commission members..."
        />
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

      {/* Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        <IdentificationIcon className="h-3 w-3 mr-1" />
                        #{member.serialNo}
                      </span>
                      {member.designationEn === 'Chairman' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                          <StarIcon className="h-3 w-3 mr-1" />
                          Chairman
                        </span>
                      )}
                      {!member.isActive && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditMember(member.id)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                    title="Edit Member"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(member.id)}
                    className={`p-1 ${member.isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400 hover:text-green-600 dark:hover:text-green-400'}`}
                    title={member.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                    title="Delete Member"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {member.nameEn}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {member.nameBn}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {member.designationEn}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {member.designationBn}
                  </p>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {member.descriptionEn.substring(0, 120)}...
                </p>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                    <a href={`mailto:${member.email}`} className="text-sm text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400">
                      {member.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-4 w-4 text-slate-400" />
                    <a href={`tel:${member.phone}`} className="text-sm text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400">
                      {member.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No commission members</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchTerm 
              ? 'No members match your search criteria.' 
              : 'Get started by adding a new commission member.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={() => router.push('/en/admin/commission/members/new' as any)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Commission Member
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
