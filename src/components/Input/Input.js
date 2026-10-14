import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '../../utils/cn';
export const Input = React.forwardRef(({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || React.useId();
    return (_jsxs("div", { className: "w-full flex flex-col gap-1.5 font-sans", children: [label && (_jsx("label", { htmlFor: inputId, className: "text-xs font-bold uppercase tracking-wider text-inherit opacity-90 select-none", children: label })), _jsx("input", { id: inputId, ref: ref, className: cn('w-full px-3.5 py-2.5 text-sm bg-[#141419] text-[#FFF4E8] border-2 border-[#27272F]', 'transition-colors duration-150 placeholder:text-neutral-500', 'focus:outline-none focus:border-[#25BFFF] focus:ring-1 focus:ring-[#25BFFF]', error && 'border-[#FF3D8D] focus:border-[#FF3D8D] focus:ring-[#FF3D8D]', className), ...props }), hint && !error && (_jsx("span", { className: "text-xs text-neutral-400", children: hint })), error && (_jsxs("span", { className: "text-xs font-semibold text-[#FF3D8D] flex items-center gap-1", children: ["\u26A0 ", error] }))] }));
});
Input.displayName = 'Input';
