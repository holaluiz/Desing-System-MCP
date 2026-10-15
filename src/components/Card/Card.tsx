import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'dark' | 'light' | 'accent' | 'outline';
  halftone?: boolean;
  interactive?: boolean;
  accentColor?: 'spectrum' | 'caramel' | 'sky' | 'pink' | 'violet' | 'yellow';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'dark',
      halftone = false,
      interactive = false,
      accentColor = 'spectrum',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const accentStyles = {
      spectrum: 'cm-brand-badge',
      caramel: 'border-[#FF701A] shadow-[4px_4px_0px_#FF701A]',
      sky: 'border-[#25BFFF] shadow-[4px_4px_0px_#25BFFF]',
      pink: 'border-[#FF3D8D] shadow-[4px_4px_0px_#FF3D8D]',
      violet: 'border-[#7657FF] shadow-[4px_4px_0px_#7657FF]',
      yellow: 'border-[#FFD52A] shadow-[4px_4px_0px_#FFD52A]',
    }[accentColor];

    const variantStyles = {
      dark: cn('bg-[#1F1F26] text-[#FFF4E8] border-2 border-[#27272F]', !(interactive && accentColor === 'spectrum') && 'shadow-[4px_4px_0px_#101014]'),
      light: cn('bg-[#FFF4E8] text-[#101014] border-2 border-[#101014]', !(interactive && accentColor === 'spectrum') && 'shadow-[4px_4px_0px_#101014]'),
      accent: cn('border-2', accentColor !== 'spectrum' && 'bg-[#1F1F26] text-[#FFF4E8]', accentStyles),
      outline: 'bg-transparent text-inherit border-2 border-current/20',
    }[variant];

    const interactiveShadow = {
      spectrum: 'cm-print-interactive',
      caramel: 'hover:shadow-[6px_6px_0px_#FF701A] active:shadow-[2px_2px_0px_#FF701A]',
      sky: 'hover:shadow-[6px_6px_0px_#25BFFF] active:shadow-[2px_2px_0px_#25BFFF]',
      pink: 'hover:shadow-[6px_6px_0px_#FF3D8D] active:shadow-[2px_2px_0px_#FF3D8D]',
      violet: 'hover:shadow-[6px_6px_0px_#7657FF] active:shadow-[2px_2px_0px_#7657FF]',
      yellow: 'hover:shadow-[6px_6px_0px_#FFD52A] active:shadow-[2px_2px_0px_#FFD52A]',
    }[accentColor];

    const interactiveStyles = interactive
      ? cn('transition-all duration-200 cursor-pointer hover:-translate-x-[3px] hover:-translate-y-[3px] active:translate-x-[1px] active:translate-y-[1px]', interactiveShadow)
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          'relative p-6 transition-all',
          variantStyles,
          interactiveStyles,
          halftone && 'caramelo-halftone-subtle',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
