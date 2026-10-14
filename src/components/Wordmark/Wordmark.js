import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export const Wordmark = ({ variant = 'cream', size = 'md', withChromaticOffset = true, className, ...props }) => {
    const sizeStyles = {
        sm: 'text-lg leading-[0.9]',
        md: 'text-2xl leading-[0.9]',
        lg: 'text-4xl leading-[0.88]',
        xl: 'text-6xl md:text-7xl leading-[0.85]',
    }[size];
    const colorStyles = {
        cream: 'text-[#FFF4E8]',
        ink: 'text-[#101014]',
        caramel: 'text-[#FF701A]',
    }[variant];
    return (_jsxs("div", { className: cn('font-black tracking-[-0.035em] uppercase select-none font-display inline-flex flex-col', sizeStyles, colorStyles, withChromaticOffset && 'transition-all duration-200 hover:[text-shadow:-2px_-1px_0px_rgba(37,191,255,0.7),2px_1px_0px_rgba(255,61,141,0.7)]', className), ...props, children: [_jsx("span", { children: "UM CARA" }), _jsx("span", { children: "CARAMELO" })] }));
};
