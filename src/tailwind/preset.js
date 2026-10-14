import { colors } from '../tokens/colors';
import { shadows } from '../tokens/shadows';
export const carameloPreset = {
    theme: {
        extend: {
            colors: {
                ink: {
                    DEFAULT: colors.ink.DEFAULT,
                    pure: colors.ink.pure,
                    muted: colors.ink.muted,
                    border: colors.ink.border,
                    surface: colors.ink.surface,
                    'surface-subtle': colors.ink.surfaceSubtle,
                },
                cream: {
                    DEFAULT: colors.cream.DEFAULT,
                    pure: colors.cream.pure,
                    muted: colors.cream.muted,
                    border: colors.cream.border,
                    surface: colors.cream.surface,
                },
                caramel: {
                    DEFAULT: colors.caramel.DEFAULT,
                    hover: colors.caramel.hover,
                    active: colors.caramel.active,
                    light: colors.caramel.light,
                    muted: colors.caramel.muted,
                },
                sky: {
                    DEFAULT: colors.sky.DEFAULT,
                    hover: colors.sky.hover,
                    surface: colors.sky.surface,
                    light: colors.sky.light,
                },
                pink: {
                    DEFAULT: colors.pink.DEFAULT,
                    hover: colors.pink.hover,
                    surface: colors.pink.surface,
                    light: colors.pink.light,
                },
                violet: {
                    DEFAULT: colors.violet.DEFAULT,
                    hover: colors.violet.hover,
                    surface: colors.violet.surface,
                    light: colors.violet.light,
                },
                yellow: {
                    DEFAULT: colors.yellow.DEFAULT,
                    hover: colors.yellow.hover,
                    surface: colors.yellow.surface,
                    light: colors.yellow.light,
                },
            },
            fontFamily: {
                display: ['"Inter Display"', '"Syne"', 'Impact', '-apple-system', 'sans-serif'],
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
                handwriting: ['"Caveat"', '"Kalam"', '"Gochi Hand"', 'cursive'],
            },
            boxShadow: {
                'graphic-sm': shadows['graphic-sm'],
                'graphic-md': shadows['graphic-md'],
                'graphic-lg': shadows['graphic-lg'],
                'graphic-caramel': shadows['graphic-caramel'],
                'graphic-sky': shadows['graphic-sky'],
                'graphic-cream': shadows['graphic-cream'],
                'offset-cmyk': shadows['offset-cmyk'],
            },
            transitionTimingFunction: {
                kinetic: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                snap: 'cubic-bezier(0.16, 1, 0.3, 1)',
                'layer-split': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            letterSpacing: {
                tighter: '-0.04em',
                tight: '-0.025em',
                snug: '-0.015em',
                wide: '0.04em',
                wider: '0.08em',
            },
        },
    },
};
export default carameloPreset;
