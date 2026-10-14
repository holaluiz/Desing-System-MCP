import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cn } from '../../utils/cn';
export const Button = React.forwardRef(({ variant = 'primary', size = 'md', fullWidth = false, className, children, disabled, ...props }, ref) => {
    const baseStyles = [
        'relative inline-flex items-center justify-center select-none font-display font-extrabold tracking-tight',
        'border-2 uppercase transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25BFFF] focus-visible:ring-offset-2',
        disabled ? 'opacity-50 cursor-not-allowed shadow-none' : 'cursor-pointer active:translate-x-[1px] active:translate-y-[1px]',
    ].join(' ');
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-7 py-3.5 text-base',
    }[size];
    const variantStyles = {
        primary: [
            'bg-[#FF701A] text-[#101014] border-[#101014]',
            !disabled && 'shadow-[3px_3px_0px_#101014] hover:shadow-[5px_5px_0px_#101014] hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-[1px_1px_0px_#101014]',
        ].join(' '),
        ink: [
            'bg-[#101014] text-[#FFF4E8] border-[#FFF4E8]',
            !disabled && 'shadow-[3px_3px_0px_#FF701A] hover:shadow-[5px_5px_0px_#FF701A] hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-[1px_1px_0px_#FF701A]',
        ].join(' '),
        cream: [
            'bg-[#FFF4E8] text-[#101014] border-[#101014]',
            !disabled && 'shadow-[3px_3px_0px_#101014] hover:shadow-[5px_5px_0px_#101014] hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-[1px_1px_0px_#101014]',
        ].join(' '),
        sky: [
            'bg-[#25BFFF] text-[#101014] border-[#101014]',
            !disabled && 'shadow-[3px_3px_0px_#101014] hover:shadow-[5px_5px_0px_#101014] hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-[1px_1px_0px_#101014]',
        ].join(' '),
        ghost: [
            'bg-transparent text-current border-transparent hover:border-current/30 hover:bg-current/5',
            !disabled && 'active:translate-y-[1px]',
        ].join(' '),
    }[variant];
    return (_jsx("button", { ref: ref, disabled: disabled, className: cn(baseStyles, sizeStyles, variantStyles, fullWidth && 'w-full', className), ...props, children: children }));
});
Button.displayName = 'Button';
