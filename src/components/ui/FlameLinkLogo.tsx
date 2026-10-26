import React from 'react';

interface FlameLinkLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FlameLinkLogo: React.FC<FlameLinkLogoProps> = ({ className = '', size = 'md' }) => {
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-[14px]' : size === 'lg' ? 'text-[22px]' : 'text-[17px]';

  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Geometric Flame Icon */}
      <span className="flex items-center justify-center shrink-0">
        <svg
          className={`${iconSize} text-[#ff4d00]`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
        </svg>
      </span>

      {/* Baseline-Unified Wordmark */}
      <span className={`${textSize} font-medium tracking-tight leading-none`}>
        <span className="text-[#262626]">Flame</span>
        <span className="text-[#ff4d00]">Link</span>
      </span>
    </span>
  );
};
