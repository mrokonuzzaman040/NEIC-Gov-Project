"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  EyeIcon
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
  createdAt: string;
  updatedAt: string;
}

export default function ContactManagementNew() {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Load contact data from API
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const response = await fetch('/api/admin/contact');
        if (response.ok) {
          const data = await response.json();
          setContacts(data.contacts || []);
        } else {
          setMessage({ type: 'error', text: 'Failed to load contact information' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Error loading contact information' });
      } finally {
        setIsLoading(false);
      }
    };

    loadContacts();
  }, []);

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'OFFICE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'DEPARTMENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'PERSON':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'HOTLINE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'OFFICE':
        return BuildingOfficeIcon;
      case 'DEPARTMENT':
        return UserGroupIcon;
      case 'PERSON':
        return UserGroupIcon;
      case 'HOTLINE':
        return PhoneIcon;
      default:
        return BuildingOfficeIcon;
    }
  };

  const handleEditContact = (contactId: string) => {
    router.push(`/en/admin/settings/contact/${contactId}` as any);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact information?')) {
      try {
        const response = await fetch(`/api/admin/contact?id=${contactId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Contact information deleted successfully!' });
          setContacts(contacts.filter(contact => contact.id !== contactId));
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: error.error || 'Failed to delete contact information' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Network error. Please try again.' });
      }
    }
  };

  const handleToggleActive = async (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    try {
      const response = await fetch('/api/admin/contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: contactId,
          isActive: !contact.isActive,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Contact status updated!' });
        setContacts(contacts.map(c => 
          c.id === contactId ? { ...c, isActive: !c.isActive } : c
        ));
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  // Filter contacts based on search and type
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchTerm === '' || 
      contact.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.nameBn.includes(searchTerm) ||
      (contact.descriptionEn && contact.descriptionEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.descriptionBn && contact.descriptionBn.includes(searchTerm)) ||
      (contact.phone && contact.phone.includes(searchTerm)) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || contact.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
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
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} total
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {contacts.filter(c => c.isActive).length} active
          </div>
        </div>
        <button
          onClick={() => router.push('/en/admin/settings/contact/new' as any)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Contact</span>
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
            placeholder="Search contacts..."
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="OFFICE">Office</option>
          <option value="DEPARTMENT">Department</option>
          <option value="PERSON">Person</option>
          <option value="HOTLINE">Hotline</option>
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

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => {
          const IconComponent = getTypeIcon(contact.type);
          return (
            <div key={contact.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      contact.type === 'OFFICE' ? 'bg-blue-500' :
                      contact.type === 'DEPARTMENT' ? 'bg-green-500' :
                      contact.type === 'PERSON' ? 'bg-purple-500' :
                      'bg-red-500'
                    }`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(contact.type)}`}>
                        {contact.type}
                      </span>
                      {!contact.isActive && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 ml-2">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditContact(contact.id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                      title="Edit Contact"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(contact.id)}
                      className={`p-1 ${contact.isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400 hover:text-green-600 dark:hover:text-green-400'}`}
                      title={contact.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                      title="Delete Contact"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {contact.nameEn}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {contact.nameBn}
                    </p>
                  </div>

                  {contact.descriptionEn && (
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {contact.descriptionEn}
                      </p>
                    </div>
                  )}

                  {contact.addressEn && (
                    <div className="flex items-start space-x-2">
                      <MapPinIcon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {contact.addressEn}
                        </p>
                        {contact.addressBn && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {contact.addressBn}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {contact.phone && (
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="h-4 w-4 text-slate-400" />
                      <a href={`tel:${contact.phone}`} className="text-sm text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400">
                        {contact.phone}
                      </a>
                    </div>
                  )}

                  {contact.email && (
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                      <a href={`mailto:${contact.email}`} className="text-sm text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400">
                        {contact.email}
                      </a>
                    </div>
                  )}

                  {contact.website && (
                    <div className="flex items-center space-x-2">
                      <GlobeAltIcon className="h-4 w-4 text-slate-400" />
                      <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400">
                        {contact.website}
                      </a>
                    </div>
                  )}

                  {contact.hoursEn && (
                    <div className="flex items-start space-x-2">
                      <ClockIcon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {contact.hoursEn}
                        </p>
                        {contact.hoursBn && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {contact.hoursBn}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <PhoneIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No contacts</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchTerm || selectedType !== 'all'
              ? 'No contacts match your search criteria.' 
              : 'Get started by creating a new contact.'}
          </p>
          {(!searchTerm && selectedType === 'all') && (
            <div className="mt-6">
              <button
                onClick={() => router.push('/en/admin/settings/contact/new' as any)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Contact
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
