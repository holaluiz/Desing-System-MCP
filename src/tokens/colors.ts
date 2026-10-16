/**
 * Paleta Canônica Oficial de Cores — Um Cara Caramelo (Manual V2 2026)
 * "Base sóbria. Acentos elétricos como tinta gráfica. Luz que responde ao gesto."
 */

export const colors = {
  // Bases Principais
  ink: {
    DEFAULT: '#101014',
    rgb: '16, 16, 20',
    pure: '#000000',
    muted: '#18181D',
    border: '#27272F',
    surface: '#1F1F26',
    surfaceSubtle: '#141419',
  },
  cream: {
    DEFAULT: '#FFF4E8',
    rgb: '255, 244, 232',
    pure: '#FFFFFF',
    muted: '#F5E6D4',
    border: '#E8D2BB',
    surface: '#FDF7F0',
  },

  // Caramel — destaque sólido dos detalhes e parte do espectro de assinatura
  caramel: {
    DEFAULT: '#FF701A',
    rgb: '255, 112, 26',
    hover: '#E55E0D',
    active: '#CC4E00',
    light: '#FFEFE6',
    muted: '#FF9454',
    /** Hover luminoso em superfícies escuras (material Lumen) — 8.4:1 sobre Ink 950 */
    bright: '#FF8A3D',
    /** Texto sobre Warm Cream — 5.77:1; também AA sobre surface-3 claro (4.67:1). */
    deep: '#AB3B00',
    /** Superfície tingida em modo escuro — texto caramel sobre ela: 6.2:1 */
    surface: '#2B1608',
  },

  // Espectro de assinatura: estas cores atuam juntas em glitch, luz, blur e liquid motion.
  sky: {
    DEFAULT: '#25BFFF',
    rgb: '37, 191, 255',
    hover: '#0DA8EA',
    surface: '#0A2533',
    light: '#E6F8FF',
    /** Texto seguro sobre Warm Cream — 5.23:1 */
    deep: '#0B6E99',
  },
  pink: {
    DEFAULT: '#FF3D8D',
    rgb: '255, 61, 141',
    hover: '#E82576',
    surface: '#330B1C',
    light: '#FFEBF3',
    /** Texto seguro sobre Warm Cream — 5.48:1 */
    deep: '#C0185E',
  },
  violet: {
    DEFAULT: '#7657FF',
    rgb: '118, 87, 255',
    hover: '#5D3CE8',
    surface: '#191238',
    light: '#F1EFFF',
    /** Texto seguro sobre Warm Cream — 5.99:1 */
    deep: '#5B3FE0',
  },
  yellow: {
    DEFAULT: '#FFD52A',
    rgb: '255, 213, 42',
    hover: '#E6BD15',
    surface: '#332900',
    light: '#FFFBE6',
    /** Texto seguro sobre Warm Cream — 6.13:1 */
    deep: '#7A5600',
  },

  /**
   * Signal Mint — cor FUNCIONAL, exclusiva para estados de sucesso.
   * Nunca decorativa, nunca acento de cena.
   */
  mint: {
    DEFAULT: '#3DDC97',
    rgb: '61, 220, 151',
    surface: '#0B2A1D',
    light: '#E7FBF2',
    /** Texto seguro sobre Warm Cream — 6.04:1 */
    deep: '#0B6B45',
  },
} as const;

/** Identidade cromática combinada. Cores individuais continuam disponíveis para papéis funcionais. */
export const brandSpectrum = {
  colors: ['caramel', 'pink', 'violet', 'sky', 'yellow'],
  stops: [colors.caramel.DEFAULT, colors.pink.DEFAULT, colors.violet.DEFAULT, colors.sky.DEFAULT, colors.yellow.DEFAULT],
  gradient: `linear-gradient(110deg, ${colors.caramel.DEFAULT} 0%, ${colors.pink.DEFAULT} 24%, ${colors.violet.DEFAULT} 48%, ${colors.sky.DEFAULT} 72%, ${colors.yellow.DEFAULT} 100%)`,
  detailAccent: colors.caramel.DEFAULT,
  interaction: 'As cinco cores formam uma assinatura combinada: glitch acionado por gesto, luz difusa e liquid motion. O laranja Caramel destaca detalhes, marcadores e anotações. Preserve o contraste do conteúdo e uma versão estática com movimento reduzido.',
} as const;

/**
 * Escala Neutra Ink → Cream (13 passos)
 * Tinta levemente fria (Ink) que esquenta até o papel (Cream).
 * Contrastes medidos sobre Ink 900 (#101014).
 */
export const neutral = {
  950: '#0A0A0D', // Stage — fundo de palco do material Lumen
  900: '#101014', // Ink (base V1)
  850: '#141419', // Superfície sutil
  800: '#18181D', // Superfície elevada
  750: '#1F1F26', // Superfície de card (V1)
  700: '#27272F', // Linha / borda
  600: '#3A3A44', // Linha forte
  500: '#5A5A66', // Somente não-texto (ícones decorativos, disabled)
  400: '#8B8B98', // Texto dim — 5.64:1 (AA)
  300: '#A3A3B0', // Texto muted — 7.61:1 (AAA)
  200: '#D9D3CC', // Texto secundário — 12.78:1
  100: '#EDE4DA', // Texto quase-cream
  50: '#FFF4E8', // Cream (papel)
} as const;

/** Metadados de Contraste WCAG Canônicos (calculados — WCAG 2.2) */
export const contrastRatios = {
  'cream-on-ink': { ratio: 17.5, level: 'AAA', role: 'Leitura principal de texto e interface' },
  'orange-on-ink': { ratio: 6.86, level: 'AA', role: 'Destaques, CTAs e marcações' },
  'sky-on-ink': { ratio: 9.02, level: 'AAA', role: 'Acento digital e estados interativos' },
  'pink-on-ink': { ratio: 5.7, level: 'AA', role: 'Provocações e anotações críticas' },
  'violet-on-ink': { ratio: 4.14, level: 'AA Large', role: 'Títulos grandes e áreas não textuais' },
  'yellow-on-ink': { ratio: 13.38, level: 'AAA', role: 'Alertas e sinalização de alta visibilidade' },
  'mint-on-ink': { ratio: 10.74, level: 'AAA', role: 'Estados de sucesso' },
  'ink-on-cream': { ratio: 17.5, level: 'AAA', role: 'Texto editorial em fundo claro' },
  'ink-on-caramel': { ratio: 6.86, level: 'AA', role: 'Contraste do ingrediente Caramel (NUNCA cream sobre caramel: 2.55)' },
  'caramel-deep-on-cream': { ratio: 5.77, level: 'AA', role: 'Contraste da variante Caramel em fundo claro' },
  'muted-on-ink': { ratio: 7.61, level: 'AAA', role: 'Texto de apoio (neutral 300)' },
  'dim-on-ink': { ratio: 5.64, level: 'AA', role: 'Metadados e legendas (neutral 400)' },
} as const;

export type CarameloColors = typeof colors;
export type CarameloNeutral = typeof neutral;
