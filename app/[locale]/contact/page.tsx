'use client';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import GovernmentHeader from '@/components/GovernmentHeader';
import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

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
  const mapInstanceRef = useRef<any>(null);
  const scriptLoadingRef = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [useFallbackMap, setUseFallbackMap] = useState(false);

  // Fetch contact data from API
  const fetchContactData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchContactData();
  }, [fetchContactData]);

  // Google Maps initialization
  useEffect(() => {
    if (!contactData?.contactPage) {
      return;
    }

    const data = contactData.contactPage;
    const coordinates = data?.location?.coordinates;

    if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
      setMapLoaded(false);
      setUseFallbackMap(false);
      setMapError(isEnglish ? 'Location details are currently unavailable.' : 'অবস্থান সংক্রান্ত তথ্য বর্তমানে অনুপলব্ধ।');
      return;
    }

    const mapCenter = { lat: coordinates.lat, lng: coordinates.lng };
    const zoomValue = Number(data.location?.zoom ?? 16);
    const mapZoom = Number.isFinite(zoomValue) ? zoomValue : 16;
    const fallbackMessage = isEnglish
      ? 'Interactive map is unavailable. Showing an embedded map instead.'
      : 'ইন্টারেকটিভ মানচিত্রটি প্রদর্শিত হচ্ছে না। বিকল্প মানচিত্র দেখানো হচ্ছে।';

    setMapLoaded(false);
    setUseFallbackMap(false);
    setMapError(null);

    if (mapRef.current) {
      mapRef.current.innerHTML = '';
    }
    mapInstanceRef.current = null;

    const initializeMap = () => {
      if (!mapRef.current) {
        return;
      }

      if (!(window.google && window.google.maps)) {
        setUseFallbackMap(true);
        setMapLoaded(false);
        setMapError(fallbackMessage);
        return;
      }

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: mapZoom,
          mapTypeId: window.google.maps.MapTypeId?.ROADMAP ?? 'roadmap',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        const primaryTitle = data.location?.marker?.title?.[langKey] || (isEnglish ? 'National Elections Inquiry Commission' : 'জাতীয় নির্বাচন তদন্ত কমিশন');
        let marker: any = null;
        const advancedMarkerCtor = window.google?.maps?.marker?.AdvancedMarkerElement;

        if (advancedMarkerCtor) {
          const markerContent = document.createElement('div');
          markerContent.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#16a34a" stroke="#ffffff" stroke-width="2"/>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="#ffffff" transform="translate(10, 10) scale(1.2)"/>
            </svg>
          `;

          marker = new advancedMarkerCtor({
            map,
            position: mapCenter,
            title: primaryTitle,
            content: markerContent
          });
        } else {
          marker = new window.google.maps.Marker({
            position: mapCenter,
            map,
            title: primaryTitle,
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
        }

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

        if (marker?.addListener) {
          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        }

        mapInstanceRef.current = map;
        setUseFallbackMap(false);
        setMapLoaded(true);
        setMapError(null);
      } catch (error) {
        console.error('Map initialization error:', error);
        setUseFallbackMap(true);
        setMapLoaded(false);
        setMapError(fallbackMessage);
      }
    };

    const handleScriptLoad = () => {
      scriptLoadingRef.current = false;
      initializeMap();
    };

    const handleScriptError = () => {
      scriptLoadingRef.current = false;
      setUseFallbackMap(true);
      setMapLoaded(false);
      setMapError(fallbackMessage);
    };

    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setUseFallbackMap(true);
      setMapLoaded(false);
      setMapError(fallbackMessage);
      return;
    }

    const existingScript = document.querySelector('script[data-google-maps-loader="true"]') as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', handleScriptLoad);
      existingScript.addEventListener('error', handleScriptError);

      return () => {
        existingScript.removeEventListener('load', handleScriptLoad);
        existingScript.removeEventListener('error', handleScriptError);
      };
    }

    if (scriptLoadingRef.current) {
      return;
    }

    scriptLoadingRef.current = true;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly&loading=async`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = 'true';
    script.addEventListener('load', handleScriptLoad);
    script.addEventListener('error', handleScriptError);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', handleScriptLoad);
      script.removeEventListener('error', handleScriptError);
    };
  }, [contactData, isEnglish, langKey]);

  if (loading) {
    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="animate-pulse">
            <div className="h-24 sm:h-32 bg-slate-200 dark:bg-slate-700 rounded-lg mb-6 sm:mb-8"></div>
            <div className="h-48 sm:h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const data = contactData?.contactPage;

  // Safety check for data
  if (!data) {
    return (
      <div className="min-h-screen py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="text-center py-12 sm:py-20">
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              {isEnglish ? 'Loading contact information...' : 'যোগাযোগের তথ্য লোড হচ্ছে...'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const coordinates = data.location?.coordinates;
  const zoomForEmbedRaw = Number(data.location?.zoom ?? 16);
  const zoomForEmbed = Number.isFinite(zoomForEmbedRaw)
    ? Math.min(Math.max(Math.round(zoomForEmbedRaw), 3), 21)
    : 16;
  const fallbackEmbedUrl = coordinates
    ? `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=${zoomForEmbed}&hl=${isEnglish ? 'en' : 'bn'}&output=embed`
    : null;

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Government Header with Official Seal */}
        <GovernmentHeader
          title={data.title?.[langKey] || (isEnglish ? 'Contact Us' : 'যোগাযোগ')}
          borderColor="green"
          iconColor="green"
        />

        {/* Contact Information Section */}
        <div className="bg-white dark:bg-slate-800 shadow-lg mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Address Information */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                      {isEnglish ? 'Address' : 'ঠিকানা'}
                    </h3>
                    <div className="space-y-1 sm:space-y-2">
                      <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium">
                        {
                          isEnglish ? 'National Elections (2014, 2018, 2024) Inquiry Commission' : 'জাতীয় নির্বাচন (২০১৪, ২০১৮, ২০২৪) তদন্ত কমিশন'
                        }
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {isEnglish ? 'Block-2,LD Hall, Jatiya Sangsad Bhaban (Nare by Gate-6)' : 'ব্লক-২, এলডি হল, জাতীয় সংসদ ভবন এলাকা (গেট-৬ গেটের কাছে)'}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {isEnglish ? 'Sher-e-Bangla Nagar': 'শের-ই-বাংলা নগর'}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {isEnglish ? 'Dhaka-1207' : 'ঢাকা-১২০৭'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Information */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                      {isEnglish ? 'Email' : 'ইমেইল'}
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <a 
                        href={`mailto:${data.contactInfo?.email || 'feedback@neic.ecs.gov.bd'}`}
                        className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200 font-medium text-xs sm:text-sm w-full sm:w-auto"
                      >
                        <span className="truncate">{data.contactInfo?.email || 'feedback@neic.ecs.gov.bd'}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Phone Information */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                      {isEnglish ? 'Phone' : 'ফোন'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <a 
                        href="tel:+8801550-042060"
                        className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 font-medium text-xs sm:text-sm"
                      >
                        <span className="break-all">+8801550-042060</span>
                      </a>
                      <a 
                        href="tel:+880222215647"
                        className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 font-medium text-xs sm:text-sm"
                      >
                        <span className="break-all">+880222215647</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section with Interactive Map and Location Image */}
        <div className="bg-white dark:bg-slate-800 shadow-lg mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{data.location?.title?.[langKey] || (isEnglish ? 'Location Map' : 'অবস্থান মানচিত্র')}</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm">
              {data.location?.description?.[langKey] || (isEnglish ? 'Find our office location on the map below' : 'নিচের মানচিত্রে আমাদের অফিসের অবস্থান দেখুন')}
            </p>
          </div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Interactive Google Map */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {isEnglish ? 'Interactive Map' : 'ইন্টারেকটিভ মানচিত্র'}
                </h3>
                <div 
                  className="relative w-full h-80 sm:h-96 lg:h-[400px] rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm overflow-hidden"
                  style={{ minHeight: '320px' }}
                >
                  {!useFallbackMap && (
                    <>
                      {!mapLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-800">
                          <div className="h-8 w-8 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
                          <p className="mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {isEnglish ? 'Loading interactive map...' : 'ইন্টারেকটিভ মানচিত্র লোড হচ্ছে...'}
                          </p>
                        </div>
                      )}
                      <div ref={mapRef} className="h-full w-full" />
                    </>
                  )}

                  {useFallbackMap && fallbackEmbedUrl && (
                    <iframe
                      title={isEnglish ? 'Office location map' : 'অফিসের অবস্থান মানচিত্র'}
                      src={fallbackEmbedUrl}
                      className="absolute inset-0 h-full w-full border-0"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  )}

                  {useFallbackMap && !fallbackEmbedUrl && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-800 text-center">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2a10 10 0 00-10 10v0.5A3.5 3.5 0 005.5 16h2.086a1 1 0 01.707.293l2.414 2.414a1 1 0 001.414 0l2.414-2.414a1 1 0 01.707-.293H18.5A3.5 3.5 0 0022 12.5V12a10 10 0 00-10-10z" />
                      </svg>
                      <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        {mapError || (isEnglish ? 'Map data is unavailable right now.' : 'মানচিত্রের তথ্য বর্তমানে অনুপলব্ধ।')}
                      </p>
                    </div>
                  )}

                  {mapError && !useFallbackMap && (
                    <div className="absolute inset-x-0 bottom-0 bg-white/90 dark:bg-slate-900/80 px-3 py-2 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      {mapError}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {useFallbackMap
                      ? (mapError || (isEnglish
                          ? 'The interactive map could not be loaded. A basic embedded map is shown instead.'
                          : 'ইন্টারেকটিভ মানচিত্র লোড করা যায়নি। বিকল্প এমবেডেড মানচিত্র প্রদর্শন করা হচ্ছে।'))
                      : (isEnglish
                          ? 'Click on the marker for more information'
                          : 'আরও তথ্যের জন্য মার্কারে ক্লিক করুন')}
                  </p>
                </div>
              </div>

              {/* Location Image */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {isEnglish ? 'Location Overview' : 'অবস্থানের সারসংক্ষেপ'}
                </h3>
                <div className="relative w-full h-80 sm:h-96 lg:h-[400px] rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm overflow-hidden bg-gray-50 dark:bg-slate-700">
                  <Image
                    src="/map-location.png"
                    alt={isEnglish ? 'National Elections Inquiry Commission Building Location' : 'জাতীয় নির্বাচন তদন্ত কমিশন ভবনের অবস্থান'}
                    className="w-full h-full object-cover object-center"
                    width={1000}
                    height={1000}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-700 text-center"
                    style={{ display: 'none' }}
                  >
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {isEnglish ? 'Location image could not be loaded' : 'অবস্থানের ছবি লোড করা যায়নি'}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {isEnglish 
                      ? 'Aerial view of the Jatiya Sangsad Bhaban area where our office is located'
                      : 'জাতীয় সংসদ ভবন এলাকার আকাশ থেকে তোলা দৃশ্য যেখানে আমাদের অফিস অবস্থিত'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
