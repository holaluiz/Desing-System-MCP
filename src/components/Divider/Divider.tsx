import React from 'react';
import { cn } from '../../utils/cn';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'solid' | 'dashed' | 'halftone';
  label?: string;
  accent?: 'caramel' | 'sky' | 'pink' | 'default';
}

export const Divider: React.FC<DividerProps> = ({
  variant = 'solid',
  label,
  accent = 'default',
  className,
  ...props
}) => {
  const accentColor = {
    default: 'border-[#27272F] text-neutral-400',
    caramel: 'border-[#FF701A] text-[#FF701A]',
    sky: 'border-[#25BFFF] text-[#25BFFF]',
    pink: 'border-[#FF3D8D] text-[#FF3D8D]',
  }[accent];

  if (label) {
    return (
      <div className={cn('flex items-center gap-4 my-6 select-none', className)} {...props}>
        <div className={cn('flex-1 border-t-2', accentColor)} />
        <span className={cn('text-xs font-bold uppercase tracking-widest px-2 font-sans', accentColor)}>
          {label}
        </span>
        <div className={cn('flex-1 border-t-2', accentColor)} />
      </div>
    );
  }

  const lineStyles = {
    solid: 'border-t-2',
    dashed: 'border-t-2 border-dashed',
    halftone: 'h-1 bg-[radial-gradient(#FF701A_1px,transparent_1px)] [background-size:6px_6px]',
  }[variant];

  return <div className={cn('w-full my-6', lineStyles, accentColor, className)} {...props} />;
};
