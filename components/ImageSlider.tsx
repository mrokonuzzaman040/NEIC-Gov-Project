'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// Custom SVG Icons
const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
  </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface Slide {
  id: number;
  title: {
    en: string;
    bn: string;
  };
  description: {
    en: string;
    bn: string;
  };
  image: string;
  link: string;
  buttonText: {
    en: string;
    bn: string;
  };
  category: {
    en: string;
    bn: string;
  };
  date: string;
  featured: boolean;
}

interface ImageSliderProps {
  slides: Slide[];
  locale: 'en' | 'bn';
  autoplay?: boolean;
  autoplayInterval?: number;
  showText?: boolean;
}

export default function ImageSlider({ 
  slides, 
  locale, 
  autoplay = true, 
  autoplayInterval = 5000,
  showText = false
}: ImageSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isEnglish = locale === 'en';
  const langKey = isEnglish ? 'en' : 'bn';

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && slides.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, autoplayInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, slides.length, autoplayInterval]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPlaying(false); // Pause autoplay when user manually navigates
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsPlaying(false);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsPlaying(false);
  };

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      locale === 'en' ? 'en-US' : 'bn-BD',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    );
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative w-full h-[350px] sm:h-[380px] lg:h-[420px] overflow-hidden rounded-2xl shadow-2xl">
      {/* Main Slide */}
      <div className="relative w-full h-full">
        <Image
          src={currentSlideData.image}
          alt={currentSlideData.title[langKey]}
          fill
          className="object-cover transition-opacity duration-500"
          priority={currentSlide === 0}
        />
        
        {/* Overlay - only show when text is enabled */}
        {showText && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        )}
        
        {/* Content - only show when showText is true */}
        {showText && (
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-5xl px-6 sm:px-8 lg:px-16">
              {/* Category Badge */}
              <div className="mb-3">
                <span className="inline-block px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-full">
                  {currentSlideData.category[langKey]}
                </span>
                {currentSlideData.featured && (
                  <span className="ml-2 inline-block px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                    {isEnglish ? 'Featured' : 'বিশেষ'}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                {currentSlideData.title[langKey]}
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base lg:text-lg text-gray-200 mb-4 sm:mb-6 leading-relaxed max-w-2xl">
                {currentSlideData.description[langKey]}
              </p>

              {/* Date */}
              <div className="mb-6">
                <span className="text-xs text-gray-300">
                  {formatDate(currentSlideData.date)}
                </span>
              </div>

              {/* CTA Button */}
              <Link
                href={currentSlideData.link as any}
                className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
              >
                {currentSlideData.buttonText[langKey]}
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full transition-colors duration-200"
              aria-label={isEnglish ? 'Previous slide' : 'পূর্ববর্তী স্লাইড'}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full transition-colors duration-200"
              aria-label={isEnglish ? 'Next slide' : 'পরবর্তী স্লাইড'}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Play/Pause Button */}
        {slides.length > 1 && (
          <button
            onClick={toggleAutoplay}
            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
            aria-label={isPlaying ? (isEnglish ? 'Pause slideshow' : 'স্লাইডশো বিরতি') : (isEnglish ? 'Play slideshow' : 'স্লাইডশো চালান')}
          >
            {isPlaying ? (
              <PauseIcon className="w-4 h-4" />
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                index === currentSlide
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`${isEnglish ? 'Go to slide' : 'স্লাইডে যান'} ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2.5 py-1 rounded-full text-xs">
          {currentSlide + 1} / {slides.length}
        </div>
      )}
    </div>
  );
}
