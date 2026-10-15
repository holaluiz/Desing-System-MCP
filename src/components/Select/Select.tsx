import React from 'react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-bold uppercase tracking-wider text-inherit opacity-90 select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full appearance-none px-3.5 py-2.5 pr-10 text-sm bg-[#141419] text-[#FFF4E8] border-2 border-[#27272F]',
              'transition-colors duration-150 cursor-pointer shadow-[2px_2px_0px_#101014]',
              'focus:outline-none focus:border-[#25BFFF] focus:ring-1 focus:ring-[#25BFFF]',
              error && 'border-[#FF3D8D] focus:border-[#FF3D8D] focus:ring-[#FF3D8D]',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#141419] text-[#FFF4E8]">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-neutral-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {hint && !error && <span className="text-xs text-neutral-400">{hint}</span>}
        {error && (
          <span className="text-xs font-semibold text-[#FF3D8D] flex items-center gap-1">
            ⚠ {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
