'use client';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import GovernmentHeader from '@/components/GovernmentHeader';
import { useEffect, useRef, useState } from 'react';

// Force dynamic rendering to ensure fresh data from APIs
export const dynamic = 'force-dynamic';

// Google Maps TypeScript declarations
declare global {
  interface Window {
    google: any;
  }
}

export default function ContactPage() {
  const locale = useLocale() as 'en' | 'bn';
  const t = useTranslations('contact');
  const [contactData, setContactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isEnglish = locale === 'en';
  const langKey = isEnglish ? 'en' : 'bn';
  const mapRef = useRef<HTMLDivElement>(null);

  // Fetch contact data from API
  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await fetch('/api/public/contact');
        if (!response.ok) {
          throw new Error('Failed to fetch contact data');
        }
        const data = await response.json();
        setContactData(data);
      } catch (error) {
        console.error('Error fetching contact data:', error);
        // Fallback to static data
        import('@/data/contact_page/contact.json').then(data => {
          setContactData(data.default);
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, []);

  // Google Maps initialization
  useEffect(() => {
    // Safety check for data
    if (!contactData?.contactPage) {
      return;
    }
    const data = contactData.contactPage;
    // Safety check for location data
    if (!data?.location?.coordinates) {
      console.warn('Location coordinates not available');
      return;
    }

    // Google Maps coordinates from JSON data
    const mapCenter = { lat: data.location.coordinates.lat, lng: data.location.coordinates.lng };
    const mapZoom = data.location.zoom || 16;

    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && mapRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: mapZoom,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        // Add marker
        const marker = new window.google.maps.Marker({
          position: mapCenter,
          map: map,
          title: data.location?.marker?.title?.[langKey] || (isEnglish ? 'National Elections Inquiry Commission' : 'জাতীয় নির্বাচন তদন্ত কমিশন'),
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#16a34a" stroke="#ffffff" stroke-width="2"/>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="#ffffff" transform="translate(10, 10) scale(1.2)"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20)
          }
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 300px;">
              <h3 style="margin: 0 0 8px 0; color: #16a34a; font-size: 16px; font-weight: bold;">
                ${data.location?.marker?.title?.[langKey] || (isEnglish ? 'National Elections Inquiry Commission' : 'জাতীয় নির্বাচন তদন্ত কমিশন')}
              </h3>
              <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.4;">
                ${data.location?.marker?.info?.[langKey] || (isEnglish ? 'Block-2, 6th Floor (West), Jatiya Sangsad Bhaban<br>Sher-e-Bangla Nagar, Dhaka' : 'ব্লক-২, দ্বিতীয় তলা (পশ্চিম), জাতীয় সংসদ ভবন<br>শের-ই-বাংলা নগর, ঢাকা')}
              </p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      }
    };

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      loadGoogleMaps();
    } else {
      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = loadGoogleMaps;
      document.head.appendChild(script);
    }
  }, [isEnglish, contactData, langKey]);

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg mb-8"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const data = contactData?.contactPage;

  // Safety check for data
  if (!data) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400">
              {isEnglish ? 'Loading contact information...' : 'যোগাযোগের তথ্য লোড হচ্ছে...'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Government Header with Official Seal */}
        <GovernmentHeader
          title={data.title?.[langKey] || (isEnglish ? 'Contact Us' : 'যোগাযোগ করুন')}
          subtitle={isEnglish ? 'Government of the People\'s Republic of Bangladesh' : 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার'}
          portal={isEnglish ? 'Official Contact Information' : 'সরকারি যোগাযোগের তথ্য'}
          tagline={isEnglish ? 'Last Updated: September 2024' : 'সর্বশেষ আপডেট: সেপ্টেম্বর ২০২৪'}
          borderColor="green"
          iconColor="green"
        />

        {/* Description Section */}
        <div className="bg-white dark:bg-slate-800 shadow-lg mb-8">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {isEnglish ? 'Contact Information' : 'যোগাযোগের তথ্য'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {data.description?.[langKey] || (isEnglish ? 'Get in touch with the National Elections Inquiry Commission' : 'জাতীয় নির্বাচন তদন্ত কমিশনের সাথে যোগাযোগ করুন')}
            </p>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white dark:bg-slate-800 shadow-lg mb-8">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {isEnglish ? 'Official Contact Details' : 'সরকারি যোগাযোগের বিবরণ'}
            </h2>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Address Information */}
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {isEnglish ? 'Address' : 'ঠিকানা'}
                    </h3>
                    <div className="space-y-2">
                      <div className="text-gray-800 dark:text-gray-200 font-medium">
                        {data.contactInfo?.address?.[langKey]?.organization || (isEnglish ? 'National Elections Inquiry Commission' : 'জাতীয় নির্বাচন তদন্ত কমিশন')}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {data.contactInfo?.address?.[langKey]?.location || (isEnglish ? 'Block-2, 6th Floor (West), Jatiya Sangsad Bhaban' : 'ব্লক-২, দ্বিতীয় তলা (পশ্চিম), জাতীয় সংসদ ভবন')}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {data.contactInfo?.address?.[langKey]?.area || (isEnglish ? 'Sher-e-Bangla Nagar' : 'শের-ই-বাংলা নগর')}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {data.contactInfo?.address?.[langKey]?.city || (isEnglish ? 'Dhaka-1000' : 'ঢাকা-১০০০')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Information */}
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {isEnglish ? 'Email' : 'ইমেইল'}
                    </h3>
                    <div className="space-y-3">
                      <a 
                        href={`mailto:${data.contactInfo?.email || 'feedback@neic.ecs.gov.bd'}`}
                        className="inline-flex items-center px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200 font-medium"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {data.contactInfo?.email || 'feedback@neic.ecs.gov.bd'}
                      </a>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {data.contactMethods?.methods?.[0]?.description?.[langKey] || 
                         (isEnglish ? 'Send us an email for general inquiries and feedback' : 'সাধারণ জিজ্ঞাসা ও মতামতের জন্য আমাদের ইমেইল করুন')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone Information */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {isEnglish ? 'Phone' : 'ফোন'}
                    </h3>
                    <div className="space-y-3">
                      <a 
                        href={`tel:${data.contactInfo?.phone || '+880-2-12345678'}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 font-medium"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {data.contactInfo?.phone || '+880-2-12345678'}
                      </a>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {data.contactMethods?.methods?.[1]?.description?.[langKey] || 
                         (isEnglish ? 'Call us during office hours for immediate assistance' : 'তাত্ক্ষণিক সহায়তার জন্য অফিস সময়ে আমাদের ফোন করুন')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Google Map Section */}
        <div className="bg-white dark:bg-slate-800 shadow-lg mb-8">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {data.location?.title?.[langKey] || (isEnglish ? 'Location Map' : 'অবস্থান মানচিত্র')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {data.location?.description?.[langKey] || (isEnglish ? 'Find our office location on the map below' : 'নিচের মানচিত্রে আমাদের অফিসের অবস্থান দেখুন')}
            </p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Map Container */}
              <div className="space-y-4">
                <div 
                  ref={mapRef}
                  className="w-full h-96 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm"
                  style={{ minHeight: '400px' }}
                />
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEnglish ? 'Click on the marker for more information' : 'আরও তথ্যের জন্য মার্কারে ক্লিক করুন'}
                  </p>
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {data.locationDetails?.title?.[langKey] || (isEnglish ? 'Office Location Details' : 'অফিস অবস্থানের বিবরণ')}
                  </h3>
                  <div className="space-y-3">
                    {data.locationDetails?.details?.map((detail: any, index: number) => (
                      <div key={index} className="flex items-start">
                        <svg className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
                          detail.icon === 'building' ? 'text-green-600' :
                          detail.icon === 'floor' ? 'text-blue-600' :
                          'text-purple-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {detail.icon === 'building' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          ) : detail.icon === 'floor' ? (
                            <>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                            </>
                          ) : (
                            <>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </>
                          )}
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {detail.label[langKey]}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {detail.value[langKey]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Directions */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                    {data.directions?.title?.[langKey] || (isEnglish ? 'How to Reach' : 'কিভাবে যাবেন')}
                  </h3>
                  <div className="space-y-3 text-sm text-green-800 dark:text-green-200">
                    {data.directions?.instructions?.map((instruction: any, index: number) => (
                      <div key={index} className="flex items-start">
                        <span className="font-medium mr-2">•</span>
                        <span>{instruction[langKey]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Office Hours and Response Time */}
        <div className="bg-white dark:bg-slate-800 shadow-lg mb-8">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isEnglish ? 'Office Hours & Response Time' : 'অফিস সময় ও প্রতিক্রিয়া সময়'}
            </h2>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {data.officeHours?.title?.[langKey] || (isEnglish ? 'Office Hours' : 'অফিস সময়')}
                </h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  {data.officeHours?.schedule?.map((schedule: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span>{schedule.days[langKey]}:</span>
                      <span className={`font-medium ${
                        schedule.status === 'closed' ? 'text-red-600 dark:text-red-400' : ''
                      }`}>
                        {schedule.time[langKey]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {data.responseTime?.title?.[langKey] || (isEnglish ? 'Response Time' : 'প্রতিক্রিয়া সময়')}
                </h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  {data.responseTime?.timelines?.map((timeline: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span>{timeline.type[langKey]}:</span>
                      <span className="font-medium">{timeline.duration[langKey]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                {data.importantNotice?.title?.[langKey] || (isEnglish ? 'Important Notice' : 'গুরুত্বপূর্ণ বিজ্ঞপ্তি')}
              </h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                {data.importantNotice?.description?.[langKey] || (isEnglish ? 'For security and confidentiality reasons, all communications are monitored and recorded.' : 'নিরাপত্তা ও গোপনীয়তার কারণে সকল যোগাযোগ পর্যবেক্ষণ ও রেকর্ড করা হয়।')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}