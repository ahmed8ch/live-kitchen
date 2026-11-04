import React from 'react';

interface ArrowProps {
  className?: string;
}

export const DirectionalArrow: React.FC<ArrowProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={`rtl:rotate-180 shrink-0 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const DirectionalBackArrow: React.FC<ArrowProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={`rtl:rotate-180 shrink-0 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);
