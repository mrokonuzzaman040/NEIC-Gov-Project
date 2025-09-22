'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isHovered, setIsHovered] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isEnglish = locale === 'en';
  const langKey = isEnglish ? 'en' : 'bn';

  // Animation frame function for smooth marquee
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    // Slow down the animation by increasing the duration (multiply by 3 for slower speed)
    const totalDuration = autoplayInterval * slides.length * 3;
    const progress = (elapsed % totalDuration) / totalDuration;
    
    setAnimationProgress(progress);

    if (isPlaying && !isHovered) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying, isHovered, autoplayInterval, slides.length]);

  // Auto-play functionality for marquee effect
  useEffect(() => {
    if (isPlaying && !isHovered && slides.length > 1) {
      startTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isHovered, slides.length, autoplayInterval, animate]);

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Reset start time to continue from current position
    startTimeRef.current = 0;
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

  // Duplicate slides for seamless marquee effect
  const duplicatedSlides = [...slides, ...slides];

  return (
    <div 
      className="relative w-full h-[350px] sm:h-[380px] lg:h-[420px] overflow-hidden rounded-2xl shadow-2xl z-10"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Marquee Container */}
      <div className="relative w-full h-full">
        <div 
          className="flex h-full"
          style={{
            width: `${duplicatedSlides.length * 100}%`,
            transform: `translateX(-${animationProgress * 50}%)`,
            transition: isHovered ? 'none' : 'transform 0.1s linear'
          }}
        >
          {duplicatedSlides.map((slide, index) => (
            <div key={`${slide.id}-${index}`} className="relative flex-shrink-0 h-full" style={{ width: `${100 / duplicatedSlides.length}%` }}>
              <Image
                src={slide.image}
                alt={slide.title[langKey]}
                fill
                className="object-cover"
                priority={index < 2}
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
                        {slide.category[langKey]}
                      </span>
                      {slide.featured && (
                        <span className="ml-2 inline-block px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                          {isEnglish ? 'Featured' : 'বিশেষ'}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                      {slide.title[langKey]}
                    </h2>

                    {/* Description */}
                    <p className="text-sm sm:text-base lg:text-lg text-gray-200 mb-4 sm:mb-6 leading-relaxed max-w-2xl">
                      {slide.description[langKey]}
                    </p>

                    {/* Date */}
                    <div className="mb-6">
                      <span className="text-xs text-gray-300">
                        {formatDate(slide.date)}
                      </span>
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={slide.link as any}
                      className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                    >
                      {slide.buttonText[langKey]}
                      <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Play/Pause Button */}
        {slides.length > 1 && (
          <button
            onClick={toggleAutoplay}
            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200 z-20"
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
    </div>
  );
}
