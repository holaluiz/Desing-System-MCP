import React from 'react';
import { cn } from '../../utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  accentColor?: 'spectrum' | 'caramel' | 'sky' | 'pink' | 'yellow';
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, accentColor = 'spectrum', className, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    const accentBorder = {
      spectrum: 'checked:bg-[image:var(--cm-spectrum-soft)] checked:border-[#FFF4E8]/60 focus-visible:ring-[rgb(var(--cm-focus))]',
      caramel: 'checked:bg-[#FF701A] checked:border-[#FF701A] focus-visible:ring-[#FF701A]',
      sky: 'checked:bg-[#25BFFF] checked:border-[#25BFFF] focus-visible:ring-[#25BFFF]',
      pink: 'checked:bg-[#FF3D8D] checked:border-[#FF3D8D] focus-visible:ring-[#FF3D8D]',
      yellow: 'checked:bg-[#FFD52A] checked:border-[#FFD52A] focus-visible:ring-[#FFD52A]',
    }[accentColor];

    return (
      <div className={cn('flex items-start gap-3 select-none', disabled && 'opacity-50 cursor-not-allowed', className)}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={cn(
              'peer appearance-none w-5 h-5 bg-[#141419] border-2 border-[#27272F] cursor-pointer',
              'transition-all duration-150 ease-kinetic shadow-[2px_2px_0px_#101014]',
              'hover:border-[#FFF4E8] active:translate-x-[1px] active:translate-y-[1px]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
              accentBorder
            )}
            {...props}
          />
          {/* Ícone de Checkmark gráfico */}
          <svg
            className="absolute w-3.5 h-3.5 text-[#101014] pointer-events-none hidden peer-checked:block stroke-[3]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {(label || description) && (
          <label htmlFor={inputId} className="cursor-pointer flex flex-col">
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
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
