import React from 'react';
import { cn } from '../../utils/cn';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  accentColor?: 'caramel' | 'sky' | 'pink' | 'yellow';
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  accentColor = 'caramel',
  disabled = false,
  className,
}) => {
  const accentActive = {
    caramel: 'bg-[#FF701A] border-[#FF701A]',
    sky: 'bg-[#25BFFF] border-[#25BFFF]',
    pink: 'bg-[#FF3D8D] border-[#FF3D8D]',
    yellow: 'bg-[#FFD52A] border-[#FFD52A]',
  }[accentColor];

  return (
    <div
      className={cn(
        'flex items-start gap-3 select-none cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div
        className={cn(
          'relative w-11 h-6 p-0.5 border-2 transition-colors duration-200 ease-kinetic shadow-[2px_2px_0px_#101014]',
          checked ? accentActive : 'bg-[#141419] border-[#27272F]'
        )}
      >
        <div
          className={cn(
            'w-4 h-4 bg-[#FFF4E8] border border-[#101014] transition-transform duration-200 ease-snap shadow-[1px_1px_0px_rgba(0,0,0,0.5)]',
            checked ? 'translate-x-5 bg-[#101014]' : 'translate-x-0'
          )}
        />
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="font-sans text-sm font-bold tracking-tight text-inherit">
              {label}
            </span>
          )}
          {description && (
            <span className="font-sans text-xs text-neutral-400 mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
