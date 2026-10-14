/**
 * Paleta Canônica Oficial de Cores — Um Cara Caramelo (Manual V1 2026)
 * "Base sóbria. Acentos elétricos como tinta gráfica."
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

  // Cor de Assinatura Oficial
  caramel: {
    DEFAULT: '#FF701A',
    rgb: '255, 112, 26',
    hover: '#E55E0D',
    active: '#CC4E00',
    light: '#FFEFE6',
    muted: '#FF9454',
  },

  // Acentos Elétricos (Regra de Ouro: usar 1 cor dominante por cena)
  sky: {
    DEFAULT: '#25BFFF',
    rgb: '37, 191, 255',
    hover: '#0DA8EA',
    surface: '#0A2533',
    light: '#E6F8FF',
  },
  pink: {
    DEFAULT: '#FF3D8D',
    rgb: '255, 61, 141',
    hover: '#E82576',
    surface: '#330B1C',
    light: '#FFEBF3',
  },
  violet: {
    DEFAULT: '#7657FF',
    rgb: '118, 87, 255',
    hover: '#5D3CE8',
    surface: '#191238',
    light: '#F1EFFF',
  },
  yellow: {
    DEFAULT: '#FFD52A',
    rgb: '255, 213, 42',
    hover: '#E6BD15',
    surface: '#332900',
    light: '#FFFBE6',
  },
} as const;

/** Metadados de Contraste WCAG Canônicos */
export const contrastRatios = {
  'cream-on-ink': { ratio: 17.5, level: 'AAA', role: 'Leitura principal de texto e interface' },
  'orange-on-ink': { ratio: 6.86, level: 'AA', role: 'Destaques, CTAs e marcações' },
  'sky-on-ink': { ratio: 9.02, level: 'AAA', role: 'Acento digital e estados interativos' },
  'pink-on-ink': { ratio: 5.7, level: 'AA', role: 'Provocações e anotações críticas' },
  'violet-on-ink': { ratio: 4.14, level: 'AA Large', role: 'Títulos grandes e áreas não textuais' },
  'yellow-on-ink': { ratio: 13.38, level: 'AAA', role: 'Alertas e sinalização de alta visibilidade' },
  'ink-on-cream': { ratio: 17.5, level: 'AAA', role: 'Texto editorial em fundo claro' },
} as const;

export type CarameloColors = typeof colors;
