'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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

const SpeedUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const SpeedDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
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
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedProgressRef = useRef<number>(0);
  const isEnglish = locale === 'bn';
  const langKey = isEnglish ? 'bn' : 'en';

  // Animation frame function for smooth marquee
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    // Adjust speed based on speedMultiplier (higher multiplier = faster)
    const totalDuration = (autoplayInterval * slides.length * 3) / speedMultiplier;
    const progress = (elapsed % totalDuration) / totalDuration;
    
    setAnimationProgress(progress);

    if (isPlaying && !isHovered) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying, isHovered, autoplayInterval, slides.length, speedMultiplier]);

  // Auto-play functionality for marquee effect
  useEffect(() => {
    if (isPlaying && !isHovered && slides.length > 1) {
      // Only reset start time if not resuming from hover
      if (pausedProgressRef.current === 0) {
        startTimeRef.current = 0;
      }
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

  const increaseSpeed = () => {
    setSpeedMultiplier(prev => Math.min(prev + 0.5, 3)); // Max speed 3x
  };

  const decreaseSpeed = () => {
    setSpeedMultiplier(prev => Math.max(prev - 0.5, 0.5)); // Min speed 0.5x
  };

  const handleMouseEnter = () => {
    // Store current progress when hovering
    pausedProgressRef.current = animationProgress;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Continue from the paused progress, not from the beginning
    const currentProgress = pausedProgressRef.current;
    const totalDuration = autoplayInterval * slides.length * 3;
    const elapsedTime = currentProgress * totalDuration;
    startTimeRef.current = performance.now() - elapsedTime;
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
            transition: isHovered ? 'none' : 'none'
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

                    {/* Title */}
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                      {slide.title[langKey]}
                    </h2>

                    {/* Description */}
                    {/* <p className="text-sm sm:text-base lg:text-lg text-gray-200 mb-4 sm:mb-6 leading-relaxed max-w-2xl">
                      {slide.description[langKey]}
                    </p> */}

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

        {/* Control Buttons */}
        {slides.length > 1 && (
          <div className="absolute top-3 right-3 z-20">
            {/* Main Controls Row */}
            <div className="flex items-center gap-2 mb-2">
              {/* Play/Pause Button */}
              <button
                onClick={toggleAutoplay}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                aria-label={isPlaying ? (isEnglish ? 'Pause slideshow' : 'স্লাইডশো বিরতি') : (isEnglish ? 'Play slideshow' : 'স্লাইডশো চালান')}
              >
                {isPlaying ? (
                  <PauseIcon className="w-4 h-4" />
                ) : (
                  <PlayIcon className="w-4 h-4" />
                )}
              </button>

              {/* Speed Indicator */}
              <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full text-center min-w-[32px]">
                {speedMultiplier}x
              </div>
            </div>

            {/* Speed Control Buttons */}
            <div className="flex items-center gap-1">
              {/* Speed Down Button */}
              <button
                onClick={decreaseSpeed}
                disabled={speedMultiplier <= 0.5}
                className="bg-black/50 hover:bg-black/70 disabled:bg-black/30 disabled:cursor-not-allowed text-white p-1.5 rounded-full transition-colors duration-200"
                aria-label={isEnglish ? 'Decrease speed' : 'গতি কমান'}
                title={`${isEnglish ? 'Speed' : 'গতি'}: ${speedMultiplier}x`}
              >
                <SpeedDownIcon className="w-3 h-3" />
              </button>

              {/* Speed Up Button */}
              <button
                onClick={increaseSpeed}
                disabled={speedMultiplier >= 3}
                className="bg-black/50 hover:bg-black/70 disabled:bg-black/30 disabled:cursor-not-allowed text-white p-1.5 rounded-full transition-colors duration-200"
                aria-label={isEnglish ? 'Increase speed' : 'গতি বাড়ান'}
                title={`${isEnglish ? 'Speed' : 'গতি'}: ${speedMultiplier}x`}
              >
                <SpeedUpIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
