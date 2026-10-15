import React from 'react';

/** Ícones internos (stroke 1.75, 24×24) — sem dependência externa */
type IconProps = React.SVGProps<SVGSVGElement>;

const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

export const IconArrowRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconChevronRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const IconCopy = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <svg {...base} strokeWidth={2.25} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const IconGrip = (p: IconProps) => (
  <svg width={6} height={14} viewBox="0 0 6 14" fill="currentColor" aria-hidden focusable={false} {...p}>
    <circle cx="1.5" cy="2" r="1.2" />
    <circle cx="4.5" cy="2" r="1.2" />
    <circle cx="1.5" cy="7" r="1.2" />
    <circle cx="4.5" cy="7" r="1.2" />
    <circle cx="1.5" cy="12" r="1.2" />
    <circle cx="4.5" cy="12" r="1.2" />
  </svg>
);
