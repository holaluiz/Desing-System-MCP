import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export const HalftoneOverlay = ({ density = 'subtle', className, children, ...props }) => {
    const densityClass = {
        subtle: 'caramelo-halftone-subtle',
        normal: 'caramelo-halftone',
        dense: 'caramelo-halftone-dense',
    }[density];
    return (_jsxs("div", { className: cn('relative', className), ...props, children: [_jsx("div", { className: cn('absolute inset-0 pointer-events-none z-0', densityClass) }), _jsx("div", { className: "relative z-10", children: children })] }));
};
export const MisregistrationText = ({ as: Component = 'span', className, children, ...props }) => {
    return (_jsx(Component, { className: cn('caramelo-misregistration inline-block cursor-default select-none', className), ...props, children: children }));
};
