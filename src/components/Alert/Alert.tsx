import React from 'react';
import { cn } from '../../utils/cn';
import { HandwrittenNote } from '../Typography';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'spectrum' | 'caramel' | 'sky' | 'pink' | 'yellow' | 'confession';
  title?: string;
  badge?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'spectrum',
  title,
  badge,
  className,
  children,
  role,
  ...props
}) => {
  const variantStyles = {
    spectrum: 'cm-brand-badge',
    caramel: 'border-[#FF701A] bg-[#1F1F26] text-[#FFF4E8] shadow-[4px_4px_0px_#FF701A]',
    sky: 'border-[#25BFFF] bg-[#0A2533] text-[#FFF4E8] shadow-[4px_4px_0px_#25BFFF]',
    pink: 'border-[#FF3D8D] bg-[#330B1C] text-[#FFF4E8] shadow-[4px_4px_0px_#FF3D8D]',
    yellow: 'border-[#FFD52A] bg-[#332900] text-[#FFF4E8] shadow-[4px_4px_0px_#FFD52A]',
    confession: 'cm-brand-badge',
  }[variant];

  const accentBadge = {
    spectrum: 'cm-brand-badge',
    caramel: 'bg-[#FF701A] text-[#101014]',
    sky: 'bg-[#25BFFF] text-[#101014]',
    pink: 'bg-[#FF3D8D] text-[#FFF4E8]',
    yellow: 'bg-[#FFD52A] text-[#101014]',
    confession: 'cm-brand-badge',
  }[variant];

  return (
    <div
      // status = anúncio educado. Use role="alert" apenas para erros que exigem ação imediata.
      role={role ?? 'status'}
      className={cn('relative p-4 md:p-5 border-2 transition-all', variantStyles, className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {badge && (
            <span
              className={cn(
                'text-[0.65rem] font-bold uppercase tracking-widest px-2 py-0.5 border border-[#101014]',
                accentBadge
              )}
            >
              {badge}
            </span>
          )}
          {title && (
            <span className="font-display font-black text-sm uppercase tracking-tight">
              {title}
            </span>
          )}
        </div>

        {variant === 'confession' && (
          <HandwrittenNote color="spectrum" rotate="-2" className="text-xl">
            confissão patética
          </HandwrittenNote>
        )}
      </div>

      <div className="font-sans text-sm leading-relaxed text-inherit opacity-90">
        {children}
      </div>
    </div>
  );
};
