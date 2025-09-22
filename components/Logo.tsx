import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-5 h-5',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const sizeValues = {
    xs: 20,
    sm: 24,
    md: 32,
    lg: 48
  };

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      <Image
        src="/logo.png"
        alt="National Elections Inquiry Commission Logo"
        width={sizeValues[size]}
        height={sizeValues[size]}
        className="object-contain"
        priority
      />
    </div>
  );
};

export default Logo;