import React from 'react';

interface FlameLinkLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export const FlameLinkLogo: React.FC<FlameLinkLogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
}) => {
  const iconSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-7 h-7' : 'w-6 h-6';
  const textSize = size === 'sm' ? 'text-[14px]' : size === 'lg' ? 'text-[22px]' : 'text-[17px]';

  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Brand SVG Mark (Crimson Flame #FF0055) */}
      <span className="flex items-center justify-center shrink-0">
        <svg
          className={`${iconSize}`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Outer Flame Contour */}
          <path
            d="M12 2C9.5 5 7 8 7 12C7 15.3 9.7 18 13 18C16.3 18 19 15.3 19 12C19 9.5 17.5 7.5 15.5 6C15 8 13.5 9.5 12 10.5C11.5 8 12.5 5 12 2Z"
            fill="#FF0055"
          />
          {/* Inner Flame Core */}
          <path
            d="M12 13C11 13 10 13.8 10 15C10 16.1 10.9 17 12 17C13.1 17 14 16.1 14 15C14 14.2 13.4 13.5 12 13Z"
            fill="#FFFFFF"
          />
          {/* Base Precision Notch */}
          <circle cx="12" cy="20.5" r="1.5" fill="#FF0055" />
        </svg>
      </span>

      {/* Baseline-Unified Wordmark */}
      {showWordmark && (
        <span className={`${textSize} font-medium tracking-tight leading-none`}>
          <span className="text-[#262626]">Flame</span>
          <span className="text-[#FF0055]">Link</span>
        </span>
      )}
    </span>
  );
};
