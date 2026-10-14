import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export const LayerSplit = ({ accentColor = 'caramel', className, children, ...props }) => {
    const accentBorder = {
        caramel: 'border-[#FF701A] shadow-[4px_4px_0px_#FF701A]',
        sky: 'border-[#25BFFF] shadow-[4px_4px_0px_#25BFFF]',
        pink: 'border-[#FF3D8D] shadow-[4px_4px_0px_#FF3D8D]',
        violet: 'border-[#7657FF] shadow-[4px_4px_0px_#7657FF]',
        yellow: 'border-[#FFD52A] shadow-[4px_4px_0px_#FFD52A]',
    }[accentColor];
    return (_jsxs("div", { className: cn('group relative transition-transform duration-200 cursor-pointer', className), ...props, children: [_jsx("div", { className: cn('absolute inset-0 bg-[#FF701A] transition-all duration-200', 'translate-x-0 translate-y-0 group-hover:translate-x-2 group-hover:translate-y-2') }), _jsx("div", { className: cn('relative z-10 bg-[#1F1F26] border-2 border-[#FFF4E8] p-5 text-[#FFF4E8]', 'transition-all duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1'), children: children })] }));
};
