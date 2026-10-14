import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Wordmark } from '../Wordmark';
import { cn } from '../../utils/cn';
export const Lockup = ({ type = 'institucional', variant = 'cream', size = 'md', className, ...props }) => {
    const isLight = variant === 'ink';
    const subtitleColor = isLight ? 'text-[#101014]/75' : 'text-[#FFF4E8]/80';
    if (type === 'bio') {
        return (_jsxs("div", { className: cn('flex flex-col gap-0.5 select-none', className), ...props, children: [_jsx("span", { className: cn('font-bold text-sm tracking-tight', isLight ? 'text-[#101014]' : 'text-[#FFF4E8]'), children: "Luiz | Head de Intera\u00E7\u00E3o" }), _jsx("span", { className: "font-sans text-xs text-[#FF701A] font-semibold", children: "@umcaracaramelo" })] }));
    }
    const taglines = {
        institucional: 'LABORATÓRIO DE INTERAÇÃO',
        explicativo: 'Conteúdo social • Web • Experiências digitais',
        autoral: 'por Luiz, Head de Interação',
    };
    return (_jsxs("div", { className: cn('inline-flex flex-col gap-1.5 select-none', className), ...props, children: [_jsx(Wordmark, { variant: variant, size: size }), _jsx("span", { className: cn('text-[0.65rem] md:text-xs font-bold tracking-[0.08em] uppercase font-sans border-t pt-1 border-current/20', subtitleColor), children: taglines[type] })] }));
};
