/**
 * Conhecimento de Marca do Motor MCP — como traduzir qualquer cor/escala
 * para os papéis semânticos Caramelo.
 */

import { colors, neutral } from '../../tokens/colors';
import { darkTheme, lightTheme, sceneAccents, type SceneAccent, type SemanticRole } from '../../tokens/semantic';
import { deltaE, hueFamily, lightness, parseColor, TAILWIND_FAMILY_HUE, toHex, type HueFamily, type RGB } from './color';
import { TAILWIND_PALETTE } from './tailwind-palette';

export type Polarity = 'light' | 'dark';
export type AccentStrategy = 'unify' | 'preserve';
export type UtilityKind = 'bg' | 'text' | 'line' | 'fill' | 'gradient' | 'placeholder' | 'shadow' | 'ring-offset';

/** Paleta de marca (literal) para nearest-match e relatórios */
export const BRAND_SWATCHES: Array<{ token: string; hex: string; role: string }> = [
  { token: 'caramel', hex: colors.caramel.DEFAULT, role: 'Canal quente do espectro combinado' },
  { token: 'caramel-bright', hex: colors.caramel.bright, role: 'Hover luminoso' },
  { token: 'caramel-deep', hex: colors.caramel.deep, role: 'Texto acento (claro)' },
  { token: 'caramel-light', hex: colors.caramel.light, role: 'Fundo tingido (claro)' },
  { token: 'caramel-surface', hex: colors.caramel.surface, role: 'Fundo tingido (escuro)' },
  { token: 'sky', hex: colors.sky.DEFAULT, role: 'Acento digital / info / foco' },
  { token: 'sky-deep', hex: colors.sky.deep, role: 'Texto info (claro)' },
  { token: 'pink', hex: colors.pink.DEFAULT, role: 'Provocação / erro' },
  { token: 'pink-deep', hex: colors.pink.deep, role: 'Texto erro (claro)' },
  { token: 'violet', hex: colors.violet.DEFAULT, role: 'Transição' },
  { token: 'violet-hover', hex: colors.violet.hover, role: 'Preenchimento violet acessível' },
  { token: 'yellow', hex: colors.yellow.DEFAULT, role: 'Alerta / humor' },
  { token: 'yellow-deep', hex: colors.yellow.deep, role: 'Texto alerta (claro)' },
  { token: 'mint', hex: colors.mint.DEFAULT, role: 'Sucesso (funcional)' },
  { token: 'mint-deep', hex: colors.mint.deep, role: 'Texto sucesso (claro)' },
  ...Object.entries(neutral).map(([k, hex]) => ({ token: `ink-${k}`, hex, role: 'Neutro' })),
];

export function nearestBrand(c: RGB): { token: string; hex: string; deltaE: number } {
  let best = { token: '', hex: '', deltaE: Infinity };
  for (const s of BRAND_SWATCHES) {
    const d = deltaE(c, parseColor(s.hex)!);
    if (d < best.deltaE) best = { token: s.token, hex: s.hex, deltaE: d };
  }
  return { ...best, deltaE: +best.deltaE.toFixed(1) };
}

export function isBrandColor(c: RGB, tolerance = 2.5): boolean {
  return nearestBrand(c).deltaE <= tolerance;
}

/** Valor do papel semântico no tema escolhido (com a cor funcional de base aplicada) */
export function roleHex(role: SemanticRole, theme: Polarity, accent: SceneAccent = 'caramel'): string {
  if (role.startsWith('accent')) {
    const a = sceneAccents[accent][theme];
    const key = role === 'accent' ? 'accent' : (role.slice('accent-'.length) as 'bright' | 'ink' | 'soft' | 'contrast');
    return a[key as keyof typeof a];
  }
  return (theme === 'dark' ? darkTheme : lightTheme)[role];
}

// ——— Shades ———
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const FAMILY_REF: Record<Exclude<HueFamily, 'neutral'>, string> = {
  red: 'red',
  orange: 'orange',
  yellow: 'yellow',
  green: 'green',
  blue: 'blue',
  violet: 'violet',
  pink: 'pink',
};

/** Shade Tailwind mais próximo (por luminosidade) dentro da família de referência */
export function nearestShade(c: RGB, family: HueFamily): number | 'white' | 'black' {
  const L = lightness(c);
  if (family === 'neutral') {
    if (L > 0.995) return 'white';
    if (L < 0.08) return 'black';
  }
  const palette = TAILWIND_PALETTE[family === 'neutral' ? 'neutral' : FAMILY_REF[family]];
  let best = 500;
  let bestD = Infinity;
  for (const s of SHADES) {
    const d = Math.abs(lightness(parseColor(palette[s])!) - L);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

type Shade = number | 'white' | 'black';
const shadeNum = (s: Shade) => (s === 'white' ? 0 : s === 'black' ? 1000 : s);

/**
 * Neutros → papel semântico. A tabela depende da polaridade do design de ORIGEM:
 * em um design claro, bg-white é card e bg-gray-900 é um elemento invertido;
 * em um design escuro é o contrário. O papel resultante se adapta aos dois temas.
 */
type ShadeTable = Array<[maxShade: number, role: SemanticRole]>;

// Escala: white = 0, 50…950, black = 1000. Cada linha = "até este shade → papel".
const NEUTRAL_TABLES: Record<Polarity, Record<'bg' | 'text' | 'line', ShadeTable>> = {
  light: {
    bg: [[0, 'surface-1'], [50, 'stage'], [100, 'surface-2'], [200, 'surface-3'], [300, 'line-strong'], [400, 'fg-faint'], [500, 'fg-dim'], [600, 'fg-muted'], [800, 'fg-2'], [1000, 'fg']],
    // texto claro num design claro = texto sobre elemento invertido
    text: [[100, 'stage'], [300, 'fg-faint'], [500, 'fg-dim'], [600, 'fg-muted'], [800, 'fg-2'], [1000, 'fg']],
    line: [[100, 'line-soft'], [200, 'line'], [400, 'line-strong'], [600, 'fg-faint'], [1000, 'fg']],
  },
  dark: {
    bg: [[100, 'fg'], [200, 'fg-2'], [300, 'fg-muted'], [400, 'fg-dim'], [500, 'fg-faint'], [600, 'line-strong'], [700, 'surface-3'], [800, 'surface-2'], [900, 'surface-1'], [1000, 'stage']],
    // texto escuro num design escuro = texto sobre elemento invertido
    text: [[50, 'fg'], [200, 'fg-2'], [300, 'fg-muted'], [500, 'fg-dim'], [600, 'fg-faint'], [1000, 'stage']],
    line: [[300, 'fg'], [500, 'fg-faint'], [700, 'line-strong'], [800, 'line'], [1000, 'line-soft']],
  },
};

/**
 * Neutros → papel semântico. A tabela depende da polaridade do design de ORIGEM:
 * em um design claro, bg-white é card e bg-gray-900 é um elemento invertido;
 * em um design escuro é o contrário. O papel resultante se adapta aos dois temas.
 */
export function neutralRole(kind: UtilityKind, shade: Shade, polarity: Polarity): SemanticRole {
  if (kind === 'placeholder') return 'fg-dim';
  if (kind === 'ring-offset') return 'stage';
  const table = NEUTRAL_TABLES[polarity][kind === 'line' ? 'line' : kind === 'text' || kind === 'fill' ? 'text' : 'bg'];
  const n = shadeNum(shade);
  for (const [max, role] of table) if (n <= max) return role;
  return table[table.length - 1][1];
}

export type ChromaRole = 'accent' | 'danger' | 'success' | 'warning' | 'info';

/** Família cromática → papel sólido funcional (estratégia "unify"). Gradientes preservam o espectro. */
export function chromaRole(family: Exclude<HueFamily, 'neutral'>, primary: HueFamily | null): ChromaRole {
  if (family === primary) return 'accent';
  switch (family) {
    case 'red':
      return 'danger';
    case 'green':
      return 'success';
    case 'yellow':
      return 'warning';
    case 'blue':
      return 'info';
    default:
      return 'accent'; // preenchimentos sólidos decorativos → cor funcional de base
  }
}

/** Família → acento literal da marca (estratégia "preserve") */
export const FAMILY_TO_BRAND: Record<Exclude<HueFamily, 'neutral'>, 'caramel' | 'sky' | 'pink' | 'violet' | 'yellow' | 'mint'> = {
  orange: 'caramel',
  blue: 'sky',
  pink: 'pink',
  red: 'pink',
  violet: 'violet',
  yellow: 'yellow',
  green: 'mint',
};

export interface ResolvedColor {
  rgb: RGB;
  family: HueFamily;
  shade: Shade;
}

/** Resolve "blue-600", "white", "[#3b82f6]" etc. */
export function resolveTailwindColor(value: string): ResolvedColor | null {
  const v = value.replace(/\/[\d.]+$|\/\[[^\]]+\]$/, '');
  if (v === 'white') return { rgb: parseColor('#ffffff')!, family: 'neutral', shade: 'white' };
  if (v === 'black') return { rgb: parseColor('#000000')!, family: 'neutral', shade: 'black' };
  const arb = /^\[(.+)\]$/.exec(v);
  if (arb) {
    const rgb = parseColor(arb[1].replace(/_/g, ' '));
    if (!rgb) return null;
    const family = hueFamily(rgb);
    return { rgb, family, shade: nearestShade(rgb, family) };
  }
  const m = /^([a-z]+)-(50|[1-9]00|950)$/.exec(v);
  if (!m || !TAILWIND_PALETTE[m[1]]) return null;
  const hex = TAILWIND_PALETTE[m[1]][Number(m[2])];
  const rgb = parseColor(hex)!;
  return { rgb, family: TAILWIND_FAMILY_HUE[m[1]], shade: Number(m[2]) };
}

/** Classifica uma cor qualquer em família + shade */
export function classify(rgb: RGB): ResolvedColor {
  const family = hueFamily(rgb);
  return { rgb, family, shade: nearestShade(rgb, family) };
}

export const describeHex = (rgb: RGB) => toHex(rgb);
