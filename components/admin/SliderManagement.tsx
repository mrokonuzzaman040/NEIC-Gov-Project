"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  PhotoIcon,
  CalendarIcon,
  TagIcon,
  StarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import SliderForm from './SliderForm';

interface SliderItem {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  image: string;
  link: string;
  buttonTextEn: string;
  buttonTextBn: string;
  categoryEn: string;
  categoryBn: string;
  date: string;
  featured: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function SliderManagement() {
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<SliderItem | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Load slider data
  useEffect(() => {
    const loadSliders = async () => {
      try {
        const response = await fetch('/api/admin/sliders');
        if (response.ok) {
          const data = await response.json();
          // Transform the data to match our interface
          const transformedSliders = data.sliderData.slides.map((slide: any) => ({
            id: slide.id,
            titleEn: slide.title.en,
            titleBn: slide.title.bn,
            descriptionEn: slide.description.en,
            descriptionBn: slide.description.bn,
            image: slide.image,
            link: slide.link,
            buttonTextEn: slide.buttonText.en,
            buttonTextBn: slide.buttonText.bn,
            categoryEn: slide.category.en,
            categoryBn: slide.category.bn,
            date: slide.date,
            featured: slide.featured,
            isActive: true, // Default value
            order: 0, // Default value
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          setSliders(transformedSliders);
        } else {
          console.error('Failed to load sliders');
          setSliders([]);
        }
      } catch (error) {
        console.error('Error loading sliders:', error);
        setSliders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSliders();
  }, []);

  const handleEditSlider = (slider: SliderItem) => {
    setEditingSlider(slider);
    setIsModalOpen(true);
  };

  const handleSaveSlider = async (formData: FormData) => {
    setIsFormLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/sliders', {
        method: editingSlider ? 'PUT' : 'POST',
        body: formData, // Send FormData directly for file upload
      });

      if (response.ok) {
        const successMessage = editingSlider ? 'Slider updated successfully!' : 'Slider created successfully!';
        setMessage({ type: 'success', text: successMessage });
        setIsModalOpen(false);
        setEditingSlider(null);
        // Reload sliders
        window.location.reload();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || `Failed to ${editingSlider ? 'update' : 'create'} slider` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlider(null);
    setMessage(null);
  };

  const handleDeleteSlider = async (sliderId: string) => {
    if (window.confirm('Are you sure you want to delete this slider?')) {
      try {
        const response = await fetch(`/api/admin/sliders?id=${sliderId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMessage({ type: 'success', text: 'Slider deleted successfully!' });
          setSliders(sliders.filter(slider => slider.id !== sliderId));
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: error.error || 'Failed to delete slider' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Network error. Please try again.' });
      }
    }
  };

  const handleToggleFeatured = async (sliderId: string) => {
    try {
      const slider = sliders.find(s => s.id === sliderId);
      if (!slider) return;

      const response = await fetch('/api/admin/sliders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: sliderId,
          featured: !slider.featured
        }),
      });

      if (response.ok) {
        setSliders(sliders.map(s => 
          s.id === sliderId 
            ? { ...s, featured: !s.featured }
            : s
        ));
        setMessage({ type: 'success', text: 'Slider featured status updated!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update slider' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'transparency':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'security':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'engagement':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'technology':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'consultation':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Loading sliders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {sliders.length} slider{sliders.length !== 1 ? 's' : ''} total
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {sliders.filter(s => s.featured).length} featured
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Slider</span>
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

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sliders.map((slider) => (
          <div key={slider.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Slider Image */}
            <div className="relative h-48 bg-slate-100 dark:bg-slate-700">
              <Image
                src={slider.image}
                alt={slider.titleEn}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                }}
              />
              {slider.featured && (
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                    <StarIcon className="h-3 w-3 mr-1" />
                    Featured
                  </span>
                </div>
              )}
            </div>

            {/* Slider Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(slider.categoryEn)}`}>
                  <TagIcon className="h-3 w-3 mr-1" />
                  {slider.categoryEn}
                </span>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {new Date(slider.date).toLocaleDateString()}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">
                {slider.titleEn}
              </h3>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                {slider.descriptionEn}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditSlider(slider)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                    title="Edit Slider"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSlider(slider.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                    title="Delete Slider"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(slider.id)}
                    className={`p-1 ${slider.featured ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400'}`}
                    title={slider.featured ? 'Remove from Featured' : 'Add to Featured'}
                  >
                    <StarIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <a
                  href={slider.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-1"
                  title="View Link"
                >
                  <GlobeAltIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Slider Form */}
      <SliderForm
        slider={editingSlider}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSlider}
        isLoading={isFormLoading}
      />
    </div>
  );
}
