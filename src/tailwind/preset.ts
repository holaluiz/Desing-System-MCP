import type { Config } from 'tailwindcss';
import { colors, neutral } from '../tokens/colors';
import { shadows } from '../tokens/shadows';
import { lumenRadii } from '../tokens/spacing';
import { motion } from '../tokens/motion';
import { typography } from '../tokens/typography';
import type { SemanticRole } from '../tokens/semantic';

/** Papel semântico → cor Tailwind que respeita tema, acento de cena e modificador de opacidade (bg-fg/10) */
const role = (name: SemanticRole) => `rgb(var(--cm-${name}) / <alpha-value>)`;

export const carameloPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // ——— Marca (literais) ———
        ink: {
          DEFAULT: colors.ink.DEFAULT,
          pure: colors.ink.pure,
          muted: colors.ink.muted,
          border: colors.ink.border,
          surface: colors.ink.surface,
          'surface-subtle': colors.ink.surfaceSubtle,
          ...neutral,
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
          bright: colors.caramel.bright,
          deep: colors.caramel.deep,
          surface: colors.caramel.surface,
        },
        sky: { DEFAULT: colors.sky.DEFAULT, hover: colors.sky.hover, surface: colors.sky.surface, light: colors.sky.light, deep: colors.sky.deep },
        pink: { DEFAULT: colors.pink.DEFAULT, hover: colors.pink.hover, surface: colors.pink.surface, light: colors.pink.light, deep: colors.pink.deep },
        violet: { DEFAULT: colors.violet.DEFAULT, hover: colors.violet.hover, surface: colors.violet.surface, light: colors.violet.light, deep: colors.violet.deep },
        yellow: { DEFAULT: colors.yellow.DEFAULT, hover: colors.yellow.hover, surface: colors.yellow.surface, light: colors.yellow.light, deep: colors.yellow.deep },
        mint: { DEFAULT: colors.mint.DEFAULT, surface: colors.mint.surface, light: colors.mint.light, deep: colors.mint.deep },

        // ——— Papéis semânticos V2 (mudam com tema e acento) ———
        stage: role('stage'),
        surface: { 1: role('surface-1'), 2: role('surface-2'), 3: role('surface-3') },
        line: { soft: role('line-soft'), DEFAULT: role('line'), strong: role('line-strong') },
        fg: { DEFAULT: role('fg'), 2: role('fg-2'), muted: role('fg-muted'), dim: role('fg-dim'), faint: role('fg-faint') },
        accent: {
          DEFAULT: role('accent'),
          bright: role('accent-bright'),
          ink: role('accent-ink'),
          soft: role('accent-soft'),
          contrast: role('accent-contrast'),
        },
        focus: role('focus'),
        success: { DEFAULT: role('success'), soft: role('success-soft') },
        warning: { DEFAULT: role('warning'), soft: role('warning-soft') },
        danger: { DEFAULT: role('danger'), soft: role('danger-soft') },
        info: { DEFAULT: role('info'), soft: role('info-soft') },
        'on-status': role('on-status'),
      },
      fontFamily: {
        display: ['Montserrat', 'Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        handwriting: ['"Covered By Your Grace"', 'cursive'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', '"Liberation Mono"', 'Menlo', 'monospace'],
      },
      // Escala do LP: text-cm-hero, text-cm-display… (tamanho + entrelinha + tracking + peso)
      fontSize: Object.fromEntries(
        Object.entries(typography.sizes).map(([name, s]) => [
          `cm-${name}`,
          [s.size, { lineHeight: s.lineHeight, letterSpacing: s.tracking, fontWeight: s.weight }],
        ])
      ) as Record<string, [string, { lineHeight: string; letterSpacing: string; fontWeight: string }]>,
      boxShadow: {
        // Print
        'graphic-sm': shadows['graphic-sm'],
        'graphic-md': shadows['graphic-md'],
        'graphic-lg': shadows['graphic-lg'],
        'graphic-caramel': shadows['graphic-caramel'],
        'graphic-sky': shadows['graphic-sky'],
        'graphic-cream': shadows['graphic-cream'],
        'offset-cmyk': shadows['offset-cmyk'],
        // Lumen (seguem o tema via variáveis)
        'elev-1': 'var(--cm-elev-1)',
        'elev-2': 'var(--cm-elev-2)',
        'elev-3': 'var(--cm-elev-3)',
        'elev-4': 'var(--cm-elev-4)',
        pressed: 'var(--cm-pressed)',
        highlight: 'var(--cm-highlight)',
        glow: 'var(--cm-glow)',
        'glow-sm': 'var(--cm-glow-sm)',
        'glow-sky': shadows['glow-sky'],
        focus: 'var(--cm-focus-ring)',
      },
      borderRadius: {
        'cm-xs': lumenRadii.xs,
        'cm-sm': lumenRadii.sm,
        'cm-md': lumenRadii.md,
        'cm-lg': lumenRadii.lg,
        'cm-xl': lumenRadii.xl,
        'cm-2xl': lumenRadii['2xl'],
        pill: lumenRadii.pill,
      },
      transitionTimingFunction: {
        kinetic: motion.easings.kinetic,
        snap: motion.easings.snap,
        'layer-split': motion.easings.layerSeparation,
        'out-expo': motion.easings.out,
        'out-quint': motion.easings.quint,
        drawer: motion.easings.drawer,
        standard: motion.easings.standard,
        'in-expo': motion.easings.in,
        spring: motion.easings.spring,
        // Curvas do LP (equivalentes GSAP)
        'power1-out': motion.easings.power1Out,
        'power2-out': motion.easings.power2Out,
        'power2-in-out': motion.easings.power2InOut,
        'power3-out': motion.easings.power3Out,
        'power3-in-out': motion.easings.power3InOut,
        'power4-out': motion.easings.power4Out,
        editorial: motion.easings.editorial,
      },
      transitionDuration: {
        instant: motion.durations.instant,
        micro: motion.durations.micro,
        quick: motion.durations.quick,
        base: motion.durations.base,
        smooth: motion.durations.smooth,
        cinematic: motion.durations.cinematic,
      },
      keyframes: {
        'cm-reveal': {
          from: { opacity: '0', transform: 'translateY(16px)', filter: 'blur(8px)' },
          to: { opacity: '1', transform: 'none', filter: 'blur(0)' },
        },
        'cm-menu-in': {
          from: { opacity: '0', transform: 'translateY(-4px) scale(0.97)', filter: 'blur(4px)' },
          to: { opacity: '1', transform: 'none', filter: 'blur(0)' },
        },
        'cm-pop': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '60%': { transform: 'scale(1.12)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'cm-shake': {
          '0%, 100%': { translate: '0' },
          '20%': { translate: '-4px' },
          '40%': { translate: '4px' },
          '60%': { translate: '-3px' },
          '80%': { translate: '2px' },
        },
        'cm-pulse': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(0.7)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'cm-reveal': `cm-reveal ${motion.durations.smooth} ${motion.easings.quint} both`,
        'cm-menu-in': `cm-menu-in ${motion.durations.base} ${motion.easings.out} both`,
        'cm-pop': `cm-pop ${motion.durations.base} ${motion.easings.spring} both`,
        'cm-shake': `cm-shake 360ms ${motion.easings.out}`,
        'cm-pulse': `cm-pulse 1.8s ${motion.easings.standard} infinite`,
      },
      blur: {
        'cm-sm': motion.blur.sm,
        'cm-md': motion.blur.md,
        'cm-lg': motion.blur.lg,
      },
      letterSpacing: {
        hero: '-0.073em',
        display: '-0.065em',
        title: '-0.045em',
        tighter: '-0.04em',
        tight: '-0.025em',
        snug: '-0.015em',
        wide: '0.04em',
        wider: '0.08em',
        meta: '0.1em',
      },
    },
  },
};

export default carameloPreset;
