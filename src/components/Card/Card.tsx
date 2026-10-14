import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'dark' | 'light' | 'accent' | 'outline';
  halftone?: boolean;
  interactive?: boolean;
  accentColor?: 'caramel' | 'sky' | 'pink' | 'violet' | 'yellow';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'dark',
      halftone = false,
      interactive = false,
      accentColor = 'caramel',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      dark: 'bg-[#1F1F26] text-[#FFF4E8] border-2 border-[#27272F] shadow-[4px_4px_0px_#101014]',
      light: 'bg-[#FFF4E8] text-[#101014] border-2 border-[#101014] shadow-[4px_4px_0px_#101014]',
      accent: 'bg-[#1F1F26] text-[#FFF4E8] border-2 border-[#FF701A] shadow-[4px_4px_0px_#FF701A]',
      outline: 'bg-transparent text-inherit border-2 border-current/20',
    }[variant];

    const interactiveStyles = interactive
      ? 'transition-all duration-200 cursor-pointer hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[6px_6px_0px_#FF701A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#FF701A]'
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
