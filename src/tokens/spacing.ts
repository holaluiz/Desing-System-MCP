/**
 * Escala de Espaçamento Editorial — Um Cara Caramelo
 * Base 4px. Ritmo vertical em múltiplos de 8.
 */

export const spacing = {
  '0': '0px',
  '1': '0.25rem',  // 4px
  '2': '0.5rem',   // 8px
  '3': '0.75rem',  // 12px
  '4': '1rem',     // 16px
  '5': '1.25rem',  // 20px
  '6': '1.5rem',   // 24px
  '8': '2rem',     // 32px
  '10': '2.5rem',  // 40px
  '12': '3rem',    // 48px
  '16': '4rem',    // 64px
  '20': '5rem',    // 80px
  '24': '6rem',    // 96px
  '32': '8rem',    // 128px
  '40': '10rem',   // 160px
} as const;

/** Raios V1 (material Print usa `none`) */
export const radii = {
  none: '0px',
  sm: '2px',
  md: '4px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
} as const;

/** Raios do material Lumen — concêntricos: raio interno = externo − padding */
export const lumenRadii = {
  xs: '3px',   // chips, kbd
  sm: '5px',   // itens de menu, tags
  md: '8px',   // inputs, botões retangulares
  lg: '12px',  // cards
  xl: '16px',  // painéis
  '2xl': '22px', // superfícies-herói
  pill: '999px', // botões pill, tabs
} as const;

/** Alvos de toque (WCAG 2.5.8 mínimo 24px; Caramelo recomenda 40px, 44px em mobile) */
export const targets = {
  min: '24px',
  compact: '32px',
  default: '40px',
  touch: '44px',
} as const;
