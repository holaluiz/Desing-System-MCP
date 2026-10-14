import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export const DisplayHeading = ({ as: Component = 'h1', size = 'lg', uppercase = true, className, children, ...props }) => {
    const sizeStyles = {
        xl: 'text-4xl md:text-6xl lg:text-7xl leading-[0.92] tracking-[-0.035em]',
        lg: 'text-3xl md:text-5xl leading-[0.96] tracking-[-0.03em]',
        md: 'text-2xl md:text-3xl leading-[1.05] tracking-[-0.02em]',
    }[size];
    return (_jsx(Component, { className: cn('font-display font-black font-extrabold', uppercase && 'uppercase', sizeStyles, className), ...props, children: children }));
};
export const Text = ({ as: Component = 'p', size = 'base', variant = 'primary', className, children, ...props }) => {
    const sizeStyles = {
        sm: 'text-sm leading-relaxed',
        base: 'text-base leading-relaxed',
        lg: 'text-lg leading-relaxed',
    }[size];
    const variantStyles = {
        primary: 'text-inherit opacity-90',
        muted: 'text-inherit opacity-65',
    }[variant];
    return (_jsx(Component, { className: cn('font-sans font-normal', sizeStyles, variantStyles, className), ...props, children: children }));
};
export const HandwrittenNote = ({ color = 'caramel', rotate = '-1', className, children, ...props }) => {
    const colorStyles = {
        caramel: 'text-[#FF701A]',
        sky: 'text-[#25BFFF]',
        pink: 'text-[#FF3D8D]',
        yellow: 'text-[#FFD52A]',
        cream: 'text-[#FFF4E8]',
    }[color];
    const rotateStyles = {
        '-2': '-rotate-2',
        '-1': '-rotate-1',
        '0': 'rotate-0',
        '1': 'rotate-1',
        '2': 'rotate-2',
    }[rotate];
    return (_jsx("span", { className: cn('font-handwriting inline-block text-xl md:text-2xl font-bold select-none', colorStyles, rotateStyles, className), ...props, children: children }));
};
export const Eyebrow = ({ color = 'caramel', className, children, ...props }) => {
    const colorStyles = {
        caramel: 'text-[#FF701A]',
        sky: 'text-[#25BFFF]',
        pink: 'text-[#FF3D8D]',
        violet: 'text-[#7657FF]',
        yellow: 'text-[#FFD52A]',
        muted: 'opacity-60',
    }[color];
    return (_jsx("span", { className: cn('font-sans text-[0.6875rem] font-black uppercase tracking-[0.09em] inline-flex items-center gap-1.5', colorStyles, className), ...props, children: children }));
};
