/**
 * Motor de Cor — parse universal, OKLab/OKLCH, ΔE perceptual e contraste WCAG.
 * Aceita qualquer formato encontrado em sistemas de terceiros:
 * #rgb, #rrggbb(aa), rgb()/rgba(), hsl()/hsla(), oklch(), nomes básicos,
 * triplets HSL do shadcn ("222.2 47.4% 11.2%") e triplets RGB ("16 16 20").
 */

export interface RGB {
  r: number; // 0–255
  g: number;
  b: number;
  a: number; // 0–1
}

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsl-triplet' | 'rgb-triplet' | 'oklch' | 'named';

const NAMED: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  orange: '#ffa500',
  yellow: '#ffff00',
  purple: '#800080',
  gray: '#808080',
  grey: '#808080',
  silver: '#c0c0c0',
  navy: '#000080',
  teal: '#008080',
  pink: '#ffc0cb',
  whitesmoke: '#f5f5f5',
  gainsboro: '#dcdcdc',
  lightgray: '#d3d3d3',
  darkgray: '#a9a9a9',
  dimgray: '#696969',
  royalblue: '#4169e1',
  dodgerblue: '#1e90ff',
  tomato: '#ff6347',
  crimson: '#dc143c',
};

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const num = (s: string) => parseFloat(s);

function parseAlpha(s: string | undefined): number {
  if (s === undefined) return 1;
  const t = s.trim();
  return clamp(t.endsWith('%') ? num(t) / 100 : num(t));
}

function hslToRgb(h: number, s: number, l: number, a = 1): RGB {
  h = ((h % 360) + 360) % 360;
  s = clamp(s);
  l = clamp(l);
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255, a };
}

function rgbToHsl({ r, g, b }: RGB): { h: number; s: number; l: number } {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === rr ? (gg - bb) / d + (gg < bb ? 6 : 0) : max === gg ? (bb - rr) / d + 2 : (rr - gg) / d + 4;
  h *= 60;
  return { h, s, l };
}

// ——— sRGB ↔ linear ↔ OKLab ———
const toLinear = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const fromLinear = (v: number) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);

export interface Oklab {
  L: number;
  a: number;
  b: number;
}

export function rgbToOklab(c: RGB): Oklab {
  const r = toLinear(c.r);
  const g = toLinear(c.g);
  const b = toLinear(c.b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

export function oklabToRgb({ L, a, b }: Oklab, alpha = 1): RGB {
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
  return {
    r: clamp(fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), 0, 255),
    g: clamp(fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), 0, 255),
    b: clamp(fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s), 0, 255),
    a: alpha,
  };
}

export function toOklch(c: RGB): { l: number; c: number; h: number } {
  const { L, a, b } = rgbToOklab(c);
  const chroma = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c: chroma, h };
}

// ——— Parse ———
export interface ParsedColor {
  rgb: RGB;
  format: ColorFormat;
}

export function parseColorDetailed(input: string): ParsedColor | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;

  if (s === 'transparent') return { rgb: { r: 0, g: 0, b: 0, a: 0 }, format: 'named' };
  if (NAMED[s]) return { rgb: parseColorDetailed(NAMED[s])!.rgb, format: 'named' };

  let m = /^#([0-9a-f]{3,8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    return {
      rgb: {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
      },
      format: 'hex',
    };
  }

  m = /^rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/.exec(s);
  if (m) {
    const ch = (v: string) => (v.endsWith('%') ? (num(v) / 100) * 255 : num(v));
    return { rgb: { r: ch(m[1]), g: ch(m[2]), b: ch(m[3]), a: parseAlpha(m[4]) }, format: 'rgb' };
  }

  m = /^hsla?\(\s*([\d.-]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/.exec(s);
  if (m) return { rgb: hslToRgb(num(m[1]), num(m[2]) / 100, num(m[3]) / 100, parseAlpha(m[4])), format: 'hsl' };

  // Triplet HSL estilo shadcn: "222.2 47.4% 11.2%"
  m = /^([\d.-]+)(?:deg)?\s+([\d.]+)%\s+([\d.]+)%(?:\s*\/\s*([\d.]+%?))?$/.exec(s);
  if (m) return { rgb: hslToRgb(num(m[1]), num(m[2]) / 100, num(m[3]) / 100, parseAlpha(m[4])), format: 'hsl-triplet' };

  // Triplet RGB estilo Caramelo: "16 16 20"
  m = /^(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})$/.exec(s);
  if (m && [m[1], m[2], m[3]].every((v) => num(v) <= 255)) {
    return { rgb: { r: num(m[1]), g: num(m[2]), b: num(m[3]), a: 1 }, format: 'rgb-triplet' };
  }

  m = /^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.-]+)(?:deg)?\s*(?:\/\s*([\d.]+%?))?\s*\)$/.exec(s);
  if (m) {
    const L = m[1].endsWith('%') ? num(m[1]) / 100 : num(m[1]);
    const C = m[2].endsWith('%') ? (num(m[2]) / 100) * 0.4 : num(m[2]);
    const H = (num(m[3]) * Math.PI) / 180;
    return { rgb: oklabToRgb({ L, a: C * Math.cos(H), b: C * Math.sin(H) }, parseAlpha(m[4])), format: 'oklch' };
  }

  return null;
}

export function parseColor(input: string): RGB | null {
  return parseColorDetailed(input)?.rgb ?? null;
}

/** Regex que encontra literais de cor dentro de qualquer texto (CSS, JSX, JSON) */
export const COLOR_LITERAL_RE =
  /#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\)/g;

// ——— Formatação ———
const hex2 = (v: number) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');

export function toHex(c: RGB): string {
  return `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}`.toUpperCase();
}

export function formatRgbTriplet(c: RGB): string {
  return `${Math.round(c.r)} ${Math.round(c.g)} ${Math.round(c.b)}`;
}

export function formatHslTriplet(c: RGB): string {
  const { h, s, l } = rgbToHsl(c);
  return `${+h.toFixed(1)} ${+(s * 100).toFixed(1)}% ${+(l * 100).toFixed(1)}%`;
}

export function formatOklch(c: RGB): string {
  const o = toOklch(c);
  const hue = o.c < 0.0005 ? 0 : o.h;
  return `oklch(${+o.l.toFixed(3)} ${+o.c.toFixed(3)} ${+hue.toFixed(1)})`;
}

/** Formata no mesmo formato do valor de origem — preserva o contrato do sistema alvo */
export function formatLike(c: RGB, format: ColorFormat): string {
  switch (format) {
    case 'hsl-triplet':
      return formatHslTriplet(c);
    case 'hsl':
      return `hsl(${formatHslTriplet(c)})`;
    case 'rgb-triplet':
      return formatRgbTriplet(c);
    case 'rgb':
      return `rgb(${formatRgbTriplet(c)})`;
    case 'oklch':
      return formatOklch(c);
    default:
      return toHex(c);
  }
}

// ——— Contraste WCAG 2.x ———
export function relativeLuminance(c: RGB): number {
  return 0.2126 * toLinear(c.r) + 0.7152 * toLinear(c.g) + 0.0722 * toLinear(c.b);
}

/** Compõe uma cor translúcida sobre um fundo opaco */
export function composite(fg: RGB, bg: RGB): RGB {
  const a = fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

export function contrastRatio(fg: RGB, bg: RGB): number {
  const f = fg.a < 1 ? composite(fg, bg) : fg;
  const l1 = relativeLuminance(f);
  const l2 = relativeLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ——— Distância perceptual ———
export function deltaE(x: RGB, y: RGB): number {
  const a = rgbToOklab(x);
  const b = rgbToOklab(y);
  return Math.sqrt((a.L - b.L) ** 2 + (a.a - b.a) ** 2 + (a.b - b.b) ** 2) * 100;
}

export function lightness(c: RGB): number {
  return rgbToOklab(c).L;
}

// ——— Família de matiz ———
export type HueFamily = 'neutral' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'violet' | 'pink';

export function hueFamily(c: RGB): HueFamily {
  const { c: chroma, h, l } = toOklch(c);
  // Limites calibrados contra a paleta Tailwind v3 (slate até c≈0.041 é cinza; blue-800 está em 266°)
  if (chroma < 0.045 || (l > 0.97 && chroma < 0.06)) return 'neutral';
  if (h >= 345 || h < 8) return 'pink';
  if (h < 36) return 'red';
  if (h < 75) return 'orange';
  if (h < 120) return 'yellow';
  if (h < 195) return 'green';
  if (h < 270) return 'blue';
  if (h < 315) return 'violet';
  return 'pink';
}

/** Tailwind: família nativa → família de matiz */
export const TAILWIND_FAMILY_HUE: Record<string, HueFamily> = {
  slate: 'neutral',
  gray: 'neutral',
  zinc: 'neutral',
  neutral: 'neutral',
  stone: 'neutral',
  red: 'red',
  rose: 'red',
  orange: 'orange',
  amber: 'orange',
  yellow: 'yellow',
  lime: 'green',
  green: 'green',
  emerald: 'green',
  teal: 'green',
  cyan: 'blue',
  sky: 'blue',
  blue: 'blue',
  indigo: 'violet',
  violet: 'violet',
  purple: 'violet',
  fuchsia: 'pink',
  pink: 'pink',
};
