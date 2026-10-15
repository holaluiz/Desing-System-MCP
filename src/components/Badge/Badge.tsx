import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'caramel' | 'sky' | 'pink' | 'violet' | 'yellow' | 'ink' | 'cream';
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  color = 'caramel',
  variant = 'solid',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const solidColors = {
    caramel: 'bg-[#FF701A] text-[#101014] border-[#101014]',
    sky: 'bg-[#25BFFF] text-[#101014] border-[#101014]',
    // Ink sobre Pink = 5.70:1 (Cream sobre Pink = 3.07:1, reprovado)
    pink: 'bg-[#FF3D8D] text-[#101014] border-[#101014]',
    // Violet puro não atinge 4.5:1 com nenhuma base → preenchimento em violet.hover (Cream = 5.91:1)
    violet: 'bg-[#5D3CE8] text-[#FFF4E8] border-[#101014]',
    yellow: 'bg-[#FFD52A] text-[#101014] border-[#101014]',
    ink: 'bg-[#101014] text-[#FFF4E8] border-[#27272F]',
    cream: 'bg-[#FFF4E8] text-[#101014] border-[#101014]',
  }[color];

  const outlineColors = {
    caramel: 'border-[#FF701A] text-[#FF701A] bg-[#FF701A]/10',
    sky: 'border-[#25BFFF] text-[#25BFFF] bg-[#25BFFF]/10',
    pink: 'border-[#FF3D8D] text-[#FF3D8D] bg-[#FF3D8D]/10',
    violet: 'border-[#7657FF] text-[#9A85FF] bg-[#7657FF]/10',
    yellow: 'border-[#FFD52A] text-[#FFD52A] bg-[#FFD52A]/10',
    ink: 'border-[#101014] text-[#101014] bg-[#101014]/10',
    cream: 'border-[#FFF4E8] text-[#FFF4E8] bg-[#FFF4E8]/10',
  }[color];

  const sizeStyles = {
    sm: 'text-[0.65rem] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  return (
    <span
      className={cn(
        'font-sans font-bold uppercase tracking-wider border inline-flex items-center justify-center select-none shadow-[1px_1px_0px_rgba(0,0,0,0.4)]',
        variant === 'solid' ? solidColors : outlineColors,
        sizeStyles,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
