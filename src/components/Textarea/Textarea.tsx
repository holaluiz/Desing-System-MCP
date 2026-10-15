import React from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, rows = 4, ...props }, ref) => {
    const textareaId = id || React.useId();

    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-bold uppercase tracking-wider text-inherit opacity-90 select-none"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            'w-full px-3.5 py-2.5 text-sm bg-[#141419] text-[#FFF4E8] border-2 border-[#27272F]',
            'transition-colors duration-150 placeholder:text-neutral-500 resize-y',
            'focus:outline-none focus:border-[#25BFFF] focus:ring-1 focus:ring-[#25BFFF]',
            error && 'border-[#FF3D8D] focus:border-[#FF3D8D] focus:ring-[#FF3D8D]',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <span className="text-xs text-neutral-400">{hint}</span>
        )}
        {error && (
          <span className="text-xs font-semibold text-[#FF3D8D] flex items-center gap-1">
            ⚠ {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
