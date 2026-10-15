import React from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  accentBorder?: 'spectrum' | 'caramel' | 'sky' | 'pink' | 'ink';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  fallback = 'UC',
  size = 'md',
  accentBorder = 'spectrum',
  className,
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
  }[size];

  const borderStyles = {
    spectrum: 'cm-brand-badge border-2',
    caramel: 'border-2 border-[#FF701A] shadow-[2px_2px_0px_#FF701A]',
    sky: 'border-2 border-[#25BFFF] shadow-[2px_2px_0px_#25BFFF]',
    pink: 'border-2 border-[#FF3D8D] shadow-[2px_2px_0px_#FF3D8D]',
    ink: 'border-2 border-[#101014] shadow-[2px_2px_0px_#101014]',
  }[accentBorder];

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center font-display font-black select-none overflow-hidden',
        accentBorder !== 'spectrum' && 'bg-[#1F1F26] text-[#FFF4E8]',
        sizeStyles,
        borderStyles,
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
};
