/**
 * Motor CSS — parser tolerante (aninhamento, @media, comentários) e transformação
 * de folhas de estilo de qualquer sistema para a identidade Caramelo:
 *  - temas por variáveis (shadcn, Bootstrap, MUI, Material 3, Chakra…) → valores Caramelo no MESMO formato
 *  - cores literais → papéis semânticos rgb(var(--cm-*)) que seguem tema e acento da cena
 *  - sombras borradas → elevação Lumen / sombra gráfica Print; raios → escala concêntrica
 *  - transições genéricas → tokens de motion; foco removido → anel Electric Sky
 *  - reforços de interação para seletores de botão e campo
 */

import type { SceneAccent, SemanticRole } from '../../tokens/semantic';
import { classify, roleHex, type Polarity, type UtilityKind } from './brand';
import {
  formatLike,
  formatRgbTriplet,
  lightness,
  parseColor,
  parseColorDetailed,
  type ColorFormat,
  type HueFamily,
  type RGB,
} from './color';
import type { Change, Edit } from './edits';
import type { LineIndex } from './scan';
import { literalHex, roleFor, type ElementFill, type MapOptions, type RoleResult } from './tailwind-map';

// ═══════════════════════════════════════════════════════════════════
// 1. PARSER
// ═══════════════════════════════════════════════════════════════════

export interface CssDecl {
  prop: string;
  value: string;
  start: number;
  valueStart: number;
  valueEnd: number;
  /** Logo após o ";" (ou no "}" quando a última declaração não tem ";") */
  end: number;
  hasSemicolon: boolean;
  important: boolean;
}

export interface CssRule {
  /** Seletor completo (aninhamentos resolvidos com &) */
  selector: string;
  atRules: string[];
  start: number;
  bodyStart: number;
  bodyEnd: number;
  decls: CssDecl[];
}

function skipCssString(code: string, k: number): number {
  const q = code[k];
  for (let i = k + 1; i < code.length; i++) {
    if (code[i] === '\\') {
      i++;
      continue;
    }
    if (code[i] === q || code[i] === '\n') return i;
  }
  return code.length - 1;
}

function skipLeadingTrivia(code: string, k: number, end: number): number {
  while (k < end) {
    if (/\s/.test(code[k])) k++;
    else if (code[k] === '/' && code[k + 1] === '*') {
      const e = code.indexOf('*/', k + 2);
      k = e === -1 ? end : e + 2;
    } else break;
  }
  return k;
}

function combineSelector(parent: string, child: string): string {
  if (!parent) return child;
  if (child.includes('&')) return child.replace(/&/g, parent);
  return parent
    .split(',')
    .flatMap((p) => child.split(',').map((c) => `${p.trim()} ${c.trim()}`))
    .join(', ');
}

export function parseCss(code: string, from = 0, to = code.length): CssRule[] {
  const rules: CssRule[] = [];
  type Frame = { at: string | null; rule: CssRule | null };
  const stack: Frame[] = [];
  let segStart = from;
  let parens = 0;

  const currentSelector = () => {
    for (let i = stack.length - 1; i >= 0; i--) if (stack[i].rule) return stack[i].rule!.selector;
    return '';
  };

  for (let k = from; k < to; k++) {
    const c = code[k];
    if (c === '/' && code[k + 1] === '*') {
      const e = code.indexOf('*/', k + 2);
      k = e === -1 ? to : e + 1;
      continue;
    }
    if (c === '"' || c === "'") {
      k = skipCssString(code, k);
      continue;
    }
    if (c === '(') parens++;
    else if (c === ')') parens = Math.max(0, parens - 1);
    if (parens > 0) continue;

    if (c === '{') {
      const s = skipLeadingTrivia(code, segStart, k);
      const prelude = code.slice(s, k).replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (prelude.startsWith('@')) {
        stack.push({ at: prelude, rule: null });
      } else {
        const rule: CssRule = {
          selector: combineSelector(currentSelector(), prelude),
          atRules: stack.filter((f) => f.at).map((f) => f.at!),
          start: s,
          bodyStart: k + 1,
          bodyEnd: to,
          decls: [],
        };
        rules.push(rule);
        stack.push({ at: null, rule });
      }
      segStart = k + 1;
      continue;
    }

    if (c === ';' || c === '}') {
      const top = stack[stack.length - 1];
      if (top?.rule) {
        const s = skipLeadingTrivia(code, segStart, k);
        const seg = code.slice(s, k);
        const m = /^(-{0,2}[a-zA-Z][\w-]*)\s*:/.exec(seg);
        if (m) {
          let vs = s + m[0].length;
          while (vs < k && /\s/.test(code[vs])) vs++;
          let ve = k;
          while (ve > vs && /\s/.test(code[ve - 1])) ve--;
          const raw = code.slice(vs, ve);
          top.rule.decls.push({
            prop: m[1].startsWith('--') ? m[1] : m[1].toLowerCase(),
            value: raw.replace(/\s*!important\s*$/i, ''),
            start: s,
            valueStart: vs,
            valueEnd: ve,
            end: c === ';' ? k + 1 : k,
            hasSemicolon: c === ';',
            important: /!important\s*$/i.test(raw),
          });
        }
      }
      if (c === '}') {
        const f = stack.pop();
        if (f?.rule) f.rule.bodyEnd = k;
      }
      segStart = k + 1;
    }
  }
  return rules;
}

// ═══════════════════════════════════════════════════════════════════
// 2. ANÁLISE
// ═══════════════════════════════════════════════════════════════════

const NAMED_COLOR_RE =
  /(?<![\w-])(white|black|red|green|blue|orange|yellow|purple|gray|grey|silver|navy|teal|pink|whitesmoke|gainsboro|lightgray|darkgray|dimgray|royalblue|dodgerblue|tomato|crimson)(?![\w-])/gi;
const FN_COLOR_RE = /#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b|(?:rgba?|hsla?|oklch)\([^)]*\)/g;

export interface ColorHit {
  start: number; // relativo ao valor
  end: number;
  text: string;
  rgb: RGB;
  format: ColorFormat;
}

/** Literais de cor dentro de um valor CSS (funções, hex e nomes) */
export function colorHits(value: string, allowNamed = true): ColorHit[] {
  const out: ColorHit[] = [];
  for (const re of allowNamed ? [FN_COLOR_RE, NAMED_COLOR_RE] : [FN_COLOR_RE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(value))) {
      if (/var\(/.test(m[0])) continue;
      const p = parseColorDetailed(m[0]);
      if (!p) continue;
      if (out.some((h) => m!.index < h.end && m!.index + m![0].length > h.start)) continue;
      out.push({ start: m.index, end: m.index + m[0].length, text: m[0], rgb: p.rgb, format: p.format });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

const COLOR_PROPS: Array<[RegExp, UtilityKind]> = [
  [/^(color|caret-color|-webkit-text-fill-color|accent-color)$/, 'text'],
  [/^(background|background-color|background-image)$/, 'bg'],
  [/^(border|border-(top|right|bottom|left|block|inline)(-(start|end))?)(-color)?$|^border-color$|^outline(-color)?$|^column-rule(-color)?$|^text-decoration(-color)?$/, 'line'],
  [/^(fill|stroke|stop-color)$/, 'fill'],
  [/^(box-shadow|text-shadow)$/, 'shadow'],
];

export function colorKindOfProp(prop: string): UtilityKind | null {
  for (const [re, kind] of COLOR_PROPS) if (re.test(prop)) return kind;
  return null;
}

export const isDarkBlock = (r: CssRule) =>
  /\.dark\b|\[data-(?:theme|mode|bs-theme|color-scheme|caramelo-theme)=["']?dark|\.theme-dark|\.dark-mode/.test(r.selector) ||
  r.atRules.some((a) => /prefers-color-scheme:\s*dark/.test(a));

export const isLightBlock = (r: CssRule) =>
  /\.light\b|\[data-(?:theme|mode|bs-theme|color-scheme|caramelo-theme)=["']?light|\.theme-light/.test(r.selector) ||
  r.atRules.some((a) => /prefers-color-scheme:\s*light/.test(a));

const ROOTISH_RE = /(^|[\s,])(:root|html|body|\.app|#root|#app|main)(?![\w-])/;

const PSEUDO_TAIL_RE = /(?:::?[\w-]+(?:\([^)]*\))?)+$/;
export const baseSelector = (sel: string) => sel.trim().replace(PSEUDO_TAIL_RE, '').trim();

export const BUTTONISH_RE =
  /(^|[\s>+~])(button|\.btn[\w-]*|\.button[\w-]*|\.cta[\w-]*|\[role=["']?button["']?\]|input\[type=["']?(submit|button)["']?\]|a\.[\w-]*(btn|button|cta)[\w-]*)$/i;
export const FIELDISH_RE =
  /(^|[\s>+~])(input(?!\[type=["']?(checkbox|radio|submit|button|range|file|color|hidden))(\[[^\]]*\])?|textarea|select|\.input[\w-]*|\.form-control|\.form-select|\.field[\w-]*|\.text-field[\w-]*)$/i;
export const HEADINGISH_RE = /(^|[\s,>+~])h[1-3](?![\w-])|title|heading|display|hero|headline/i;

export interface CssAnalysis {
  polarity: Polarity;
  weights: Map<HueFamily, number>;
  hasDarkBlock: boolean;
}

export function analyzeCss(rules: CssRule[]): CssAnalysis {
  let polarity: Polarity | null = null;
  let light = 0;
  let dark = 0;
  const weights = new Map<HueFamily, number>();
  const bump = (f: HueFamily, n: number) => weights.set(f, (weights.get(f) ?? 0) + (f === 'red' || f === 'green' ? n / 2 : n));
  const hasDarkBlock = rules.some(isDarkBlock);

  for (const r of rules) {
    if (isDarkBlock(r)) continue;
    const rootish = ROOTISH_RE.test(r.selector);
    const buttonish = r.selector.split(',').some((s) => BUTTONISH_RE.test(baseSelector(s)));
    for (const d of r.decls) {
      if (d.prop.startsWith('--')) {
        const p = parseColorDetailed(d.value);
        if (!p) continue;
        const name = normalizeVarName(d.prop);
        if (/^(background|body-bg|bg|background-default)$/.test(name) && polarity === null) polarity = lightness(p.rgb) > 0.6 ? 'light' : 'dark';
        const fam = classify(p.rgb).family;
        if (fam !== 'neutral') bump(fam, /primary|brand|accent|main/.test(name) ? 4 : 1);
        continue;
      }
      const kind = colorKindOfProp(d.prop);
      if (!kind) continue;
      for (const h of colorHits(d.value)) {
        if (h.rgb.a < 0.5) continue;
        const L = lightness(h.rgb);
        if (kind === 'bg') {
          if (rootish && polarity === null) polarity = L > 0.6 ? 'light' : 'dark';
          if (L > 0.85) light += 1;
          else if (L < 0.3) dark += 1;
        }
        const fam = classify(h.rgb).family;
        if (fam !== 'neutral') bump(fam, kind === 'bg' ? (buttonish ? 3 : 2) : 1);
      }
    }
  }
  return { polarity: polarity ?? (dark > light ? 'dark' : 'light'), weights, hasDarkBlock };
}

// ═══════════════════════════════════════════════════════════════════
// 3. VARIÁVEIS DE TEMA DE TERCEIROS
// ═══════════════════════════════════════════════════════════════════

export function normalizeVarName(prop: string): string {
  return prop
    .toLowerCase()
    .replace(/^--(?:tw-)?(?:bs-|mui-palette-|md-sys-color-|chakra-colors-|mantine-color-|color-|colors-|clr-|theme-)?/, '')
    .replace(/-(rgb|hsl|color-value)$/, '');
}

type VarTarget = SemanticRole | 'neutral-or-accent';

const STATUS = ['danger', 'success', 'warning', 'info'] as const;
const STATUS_ALIASES: Record<(typeof STATUS)[number], string> = {
  danger: 'destructive|danger|error',
  success: 'success|positive',
  warning: 'warning|caution',
  info: 'info|notice',
};

const VAR_RULES: Array<[RegExp, VarTarget]> = [
  [/^(on-primary(-container)?|(sidebar-)?primary-(foreground|contrast|contrast-?text|text|on|fg))$/, 'accent-contrast'],
  [/^(on-(error|danger|destructive|success|warning|info)(-container)?|(destructive|danger|error|success|warning|info)-(foreground|contrast|contrast-?text|text|fg))$/, 'on-status'],
  [/(^|-)(ring|focus|focus-ring)$/, 'focus'],
  [/^(primary|brand|sidebar-primary|primary-(main|default|base|500|600)|brand-(500|600)|link|link-color|accent-9)$/, 'accent'],
  [/^((primary|brand|link)-(hover|light|bright|400)|link-hover-color|accent-10)$/, 'accent-bright'],
  [/^((primary|brand)-(soft|subtle|bg|bg-subtle|container|50|100|tint|lighter)|primary-bg-subtle|accent-3)$/, 'accent-soft'],
  [/^((primary|brand)-(dark|deep|emphasis|700|800|text-emphasis)|primary-text-emphasis|accent-11)$/, 'accent-ink'],
  ...STATUS.flatMap((s): Array<[RegExp, VarTarget]> => [
    [new RegExp(`^(${STATUS_ALIASES[s]})(-(main|default|base|500|600))?$`), s],
    [new RegExp(`^(${STATUS_ALIASES[s]})-(soft|subtle|bg|bg-subtle|container|light|50|100)$`), `${s}-soft` as SemanticRole],
  ]),
  [/^(background|body-bg|bg|background-default|page|canvas|base-100|surface-dim|app-bg|bg-body)$/, 'stage'],
  [/^(card|surface|paper|background-paper|surface-container(-low)?|panel|base-200|sidebar|sidebar-background|tertiary-bg)$/, 'surface-1'],
  [/^(popover|surface-container-high|elevated|overlay|dropdown|muted|secondary-bg|base-300|surface-bright)$/, 'surface-2'],
  [/^(secondary|accent|surface-variant|hover|surface-container-highest|sidebar-accent|highlight|tertiary)$/, 'neutral-or-accent'],
  [/^(muted-foreground|secondary-color|text-secondary|on-surface-variant|text-muted|tertiary-color|secondary-text|text-subtle|fg-muted)$/, 'fg-muted'],
  [/^(text-disabled|placeholder|text-placeholder|fg-subtle|text-tertiary)$/, 'fg-dim'],
  [/(foreground|^text$|^text-primary$|body-color|^on-background$|^on-surface$|^on-secondary$|^on-tertiary$|emphasis-color|^fg$|heading-color)$/, 'fg'],
  [/(border|^input$|^outline$|divider|^line$|outline-variant|^separator$)/, 'line'],
];

const CHART_CYCLE = ['caramel', 'sky', 'pink', 'violet', 'yellow'];

export interface VarMapping {
  role?: SemanticRole;
  literal?: string;
}

export function roleForVar(prop: string, rgb: RGB, opts: MapOptions): VarMapping | null {
  const name = normalizeVarName(prop);
  const chart = /^chart-(\d+)$/.exec(name);
  if (chart) return { literal: CHART_CYCLE[(Number(chart[1]) - 1 + CHART_CYCLE.length) % CHART_CYCLE.length] };

  const c = classify(rgb);
  for (const [re, target] of VAR_RULES) {
    if (!re.test(name)) continue;
    if (target !== 'neutral-or-accent') return { role: target };
    if (c.family === 'neutral') return { role: 'surface-3' };
    const r = roleFor('bg', c.family, c.shade, opts);
    return r.role ? { role: r.role } : { literal: r.literal };
  }

  // Nome desconhecido: decide pelo valor + pista do nome
  const kind: UtilityKind = /(text|fg|foreground|ink|heading)/.test(name)
    ? 'text'
    : /(border|line|outline|divider|ring|stroke)/.test(name)
      ? 'line'
      : 'bg';
  const r = roleFor(kind, c.family, c.shade, opts);
  return r.role ? { role: r.role } : r.literal ? { literal: r.literal } : null;
}

// ═══════════════════════════════════════════════════════════════════
// 4. TRANSFORMAÇÃO
// ═══════════════════════════════════════════════════════════════════

export interface CssTransformOptions extends MapOptions {
  accent: SceneAccent;
  enhanceInteractions: boolean;
  /** O usuário pediu um tema-alvo explícito */
  explicitTheme: boolean;
}

export interface CssTransformResult {
  edits: Edit[];
  changes: Change[];
  appended: string;
  notes: string[];
}

const LUMEN_RADIUS_STEPS: Array<[number, string]> = [
  [3, 'xs'],
  [6, 'sm'],
  [10, 'md'],
  [14, 'lg'],
  [19, 'xl'],
  [Infinity, '2xl'],
];

function toPx(v: string): number | null {
  const m = /^(-?[\d.]+)(px|rem|em)?$/.exec(v);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return m[2] === 'rem' || m[2] === 'em' ? n * 16 : n;
}

function durationToken(ms: number): string {
  if (ms <= 100) return 'var(--cm-dur-instant)';
  if (ms <= 200) return 'var(--cm-dur-micro)';
  if (ms <= 270) return 'var(--cm-dur-quick)';
  if (ms <= 400) return 'var(--cm-dur-base)';
  if (ms <= 560) return 'var(--cm-dur-smooth)';
  return 'var(--cm-dur-cinematic)';
}

const parseMs = (t: string) => (t.endsWith('ms') ? parseFloat(t) : parseFloat(t) * 1000);

function splitTopLevel(value: string, sep = ','): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === sep && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

const TIME_RE = /^[\d.]+m?s$/;
const GENERIC_EASE_RE = /^(ease|ease-in-out|ease-out)$/;
const EXPLICIT_PROPS = ['color', 'background-color', 'border-color', 'box-shadow', 'transform', 'opacity'];

function rewriteTransition(value: string, isControl: boolean): string | null {
  if (/var\(/.test(value) || /^none$/i.test(value.trim())) return null;
  const layers = splitTopLevel(value).map((layer) => {
    const tokens = layer.split(/\s+(?![^(]*\))/);
    const times = tokens.filter((t) => TIME_RE.test(t));
    const easing = tokens.find((t) => /^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)$|^(cubic-bezier|steps|linear)\(/.test(t));
    const prop = tokens.find((t) => !TIME_RE.test(t) && t !== easing) ?? 'all';
    return { prop, dur: times[0], delay: times[1], easing };
  });
  const fmt = (l: (typeof layers)[number], prop: string) => {
    let ms = l.dur ? parseMs(l.dur) : 0;
    if (isControl && ms > 400) ms = 320;
    const dur = l.dur ? durationToken(ms) : 'var(--cm-dur-micro)';
    const ease = !l.easing || GENERIC_EASE_RE.test(l.easing) ? 'var(--cm-ease-out)' : l.easing === 'ease-in' ? 'var(--cm-ease-in)' : l.easing;
    return [prop, dur, ease, l.delay].filter(Boolean).join(' ');
  };
  if (layers.length === 1 && layers[0].prop === 'all') return EXPLICIT_PROPS.map((p) => fmt(layers[0], p)).join(', ');
  return layers.map((l) => fmt(l, l.prop === 'all' ? EXPLICIT_PROPS.join(', ') : l.prop)).join(', ');
}

interface ShadowLayer {
  inset: boolean;
  lengths: number[];
}

function shadowLayers(value: string): ShadowLayer[] {
  return splitTopLevel(value).map((layer) => {
    const tokens: string[] = layer.match(/(?:rgba?|hsla?|oklch)\([^)]*\)|[^\s]+/gi) ?? [];
    return {
      inset: tokens.includes('inset'),
      lengths: tokens.map(toPx).filter((n): n is number => n !== null),
    };
  });
}

function cssColorFor(r: RoleResult, src: RGB, fmt: ColorFormat): string {
  if (r.role) {
    const alpha = src.a < 1 ? src.a : r.opacity ? Number(r.opacity.replace(/[^\d.]/g, '')) / 100 : 1;
    return alpha < 1 ? `rgb(var(--cm-${r.role}) / ${+alpha.toFixed(2)})` : `rgb(var(--cm-${r.role}))`;
  }
  const rgb = { ...parseColor(literalHex(r.literal!))!, a: src.a };
  if (src.a < 1) return `rgb(${formatRgbTriplet(rgb)} / ${+src.a.toFixed(2)})`;
  return formatLike(rgb, fmt === 'hsl-triplet' || fmt === 'rgb-triplet' || fmt === 'named' ? 'hex' : fmt);
}

function variantsOf(selector: string): string[] {
  const v: string[] = [];
  if (/:hover/.test(selector)) v.push('hover');
  if (/:active/.test(selector)) v.push('active');
  if (/:focus/.test(selector)) v.push('focus');
  return v;
}

function ruleFill(rule: CssRule, opts: MapOptions): ElementFill {
  for (const d of rule.decls) {
    if (d.prop !== 'background' && d.prop !== 'background-color' && d.prop !== 'background-image') continue;
    for (const h of colorHits(d.value)) {
      const c = classify(h.rgb);
      if (c.family === 'neutral' || h.rgb.a < 0.6) continue;
      const n = c.shade === 'white' ? 0 : c.shade === 'black' ? 1000 : c.shade;
      if (n <= 200 || n >= 900) continue;
      const r = roleFor('bg', c.family, c.shade, opts);
      return r.role === 'accent' || r.role === 'accent-bright' || r.literal ? 'accent' : 'status';
    }
  }
  return null;
}

export function transformCss(code: string, rules: CssRule[], opts: CssTransformOptions, lines: LineIndex): CssTransformResult {
  const edits: Edit[] = [];
  const changes: Change[] = [];
  const notes: string[] = [];
  const analysis = analyzeCss(rules);

  const push = (start: number, end: number, text: string, kind: Change['kind'], reason: string) => {
    const from = code.slice(start, end);
    if (from === text) return;
    edits.push({ start, end, text });
    changes.push({ line: lines.lineAt(start), kind, from: from.length > 90 ? from.slice(0, 87) + '…' : from, to: text.length > 90 ? text.slice(0, 87) + '…' : text, reason });
  };

  for (const rule of rules) {
    if (rule.atRules.some((a) => /^@(font-face|page|property)/.test(a))) continue;
    const variants = variantsOf(rule.selector);
    const fill = ruleFill(rule, opts);
    const isControl = rule.selector.split(',').some((s) => BUTTONISH_RE.test(baseSelector(s)) || FIELDISH_RE.test(baseSelector(s)));
    const blockTheme: Polarity = isDarkBlock(rule)
      ? 'dark'
      : isLightBlock(rule)
        ? 'light'
        : analysis.hasDarkBlock || !opts.explicitTheme
          ? opts.polarity
          : opts.theme;
    let focusFixed = false;

    for (const d of rule.decls) {
      // ——— Variáveis de tema ———
      if (d.prop.startsWith('--')) {
        const parsed = parseColorDetailed(d.value);
        if (parsed) {
          const m = roleForVar(d.prop, parsed.rgb, opts);
          if (!m) continue;
          const hex = m.role ? roleHex(m.role, blockTheme, opts.accent) : literalHex(m.literal!);
          const rgb = { ...parseColor(hex)!, a: parsed.rgb.a };
          const text =
            parsed.rgb.a < 1 && parsed.format !== 'hsl-triplet' && parsed.format !== 'rgb-triplet'
              ? `rgb(${formatRgbTriplet(rgb)} / ${+parsed.rgb.a.toFixed(2)})`
              : formatLike(rgb, parsed.format);
          push(d.valueStart, d.valueStart + d.value.length, text, 'theme', `${d.prop} → ${m.role ? `papel ${m.role}` : `tinta ${m.literal}`} (${blockTheme === 'dark' ? 'escuro' : 'claro'})`);
          continue;
        }
        if (/^--radius$/.test(d.prop)) {
          push(d.valueStart, d.valueStart + d.value.length, opts.material === 'print' ? '0rem' : '0.75rem', 'radius', opts.material === 'print' ? 'Print usa arestas retas' : 'raio-base Lumen (card 12px, concêntrico)');
          continue;
        }
        const font = /^--font-(sans|body|heading|display|serif|mono)/.exec(d.prop);
        if (font && !/var\(/.test(d.value)) {
          const voice = font[1] === 'mono' ? 'mono' : font[1] === 'heading' || font[1] === 'display' || font[1] === 'serif' ? 'display' : 'sans';
          push(d.valueStart, d.valueStart + d.value.length, `var(--caramelo-font-${voice})`, 'type', `fonte → voz ${voice}`);
          continue;
        }
      }

      // ——— Transições ———
      if (d.prop === 'transition' || d.prop === 'transition-property' || d.prop === 'transition-duration' || d.prop === 'transition-timing-function') {
        let next: string | null = null;
        if (d.prop === 'transition') next = rewriteTransition(d.value, isControl);
        else if (d.prop === 'transition-property' && /\ball\b/.test(d.value)) next = EXPLICIT_PROPS.join(', ');
        else if (d.prop === 'transition-duration' && !/var\(/.test(d.value))
          next = splitTopLevel(d.value).map((t) => (TIME_RE.test(t) ? durationToken(Math.min(parseMs(t), isControl ? 320 : Infinity)) : t)).join(', ');
        else if (d.prop === 'transition-timing-function')
          next = splitTopLevel(d.value).map((t) => (GENERIC_EASE_RE.test(t) ? 'var(--cm-ease-out)' : t)).join(', ');
        if (next) push(d.valueStart, d.valueStart + d.value.length, next, 'motion', /\ball\b/.test(d.value) ? '"all" anima layout sem querer → propriedades explícitas + tokens de motion' : 'tempo/curva → tokens de motion (expo-out)');
        continue;
      }

      // ——— Raios ———
      if (/^border(-(top|bottom)-(left|right)|-(start|end)-(start|end))?-radius$/.test(d.prop)) {
        if (/var\(|%/.test(d.value)) continue;
        const next = d.value
          .split(/\s+/)
          .map((t) => {
            const px = toPx(t);
            if (px === null || px === 0) return t;
            if (px >= 999) return 'var(--cm-radius-pill)';
            if (opts.material === 'print') return '0';
            return `var(--cm-radius-${LUMEN_RADIUS_STEPS.find(([max]) => px <= max)![1]})`;
          })
          .join(' ');
        push(d.valueStart, d.valueStart + d.value.length, next, 'radius', opts.material === 'print' ? 'Print usa arestas retas de cartaz' : 'raio → escala Lumen concêntrica');
        continue;
      }

      // ——— Tipografia ———
      const fontShort = d.prop === 'font' ? /^((?:[\w.-]+\s+)*?[\d.]+(?:px|rem|em|%|pt)(?:\/[\w.%-]+)?\s+)(.+)$/.exec(d.value) : null;
      if (fontShort && !/var\(/.test(d.value)) {
        const fam = fontShort[2].toLowerCase();
        const voice = /mono|courier|consolas|menlo/.test(fam)
          ? 'mono'
          : HEADINGISH_RE.test(rule.selector) || /(^|[\s,"'])serif|georgia|times|playfair|merriweather/.test(fam.replace(/sans-serif/g, ''))
            ? 'display'
            : 'sans';
        const start = d.valueStart + fontShort[1].length;
        push(start, d.valueStart + d.value.length, `var(--caramelo-font-${voice})`, 'type', voice === 'display' ? 'título → Montserrat 900 (display)' : `fonte → voz ${voice}`);
        continue;
      }
      if (d.prop === 'font-family' && !/var\(/.test(d.value)) {
        const v = d.value.toLowerCase();
        const voice = /mono|courier|consolas|menlo/.test(v)
          ? 'mono'
          : HEADINGISH_RE.test(rule.selector) || /(^|[\s,"'])serif|georgia|times|playfair|merriweather/.test(v.replace(/sans-serif/g, ''))
            ? 'display'
            : 'sans';
        push(d.valueStart, d.valueStart + d.value.length, `var(--caramelo-font-${voice})`, 'type', voice === 'display' ? 'título → Montserrat 900 (display)' : `fonte → voz ${voice}`);
        continue;
      }

      // ——— Foco removido ———
      if ((d.prop === 'outline' && /^(none|0)\b/.test(d.value)) || (d.prop === 'outline-style' && d.value === 'none') || (d.prop === 'outline-width' && /^0/.test(d.value))) {
        const hasReplacement = rule.decls.some((x) => x.prop === 'box-shadow' || x.prop === 'border-color' || (x.prop === 'outline' && !/^(none|0)/.test(x.value)));
        if (/:focus/.test(rule.selector) && !hasReplacement && !focusFixed) {
          focusFixed = true;
          const at = d.hasSemicolon ? d.end : d.valueEnd;
          edits.push({ start: at, end: at, text: `${d.hasSemicolon ? '' : ';'} box-shadow: var(--cm-focus-ring);` });
          changes.push({ line: lines.lineAt(d.start), kind: 'a11y', from: `${d.prop}: ${d.value}`, to: '+ box-shadow: var(--cm-focus-ring)', reason: 'foco removido sem substituto → anel Electric Sky (WCAG 2.4.7)' });
        }
        continue;
      }

      // ——— Cores ———
      const kind = colorKindOfProp(d.prop);
      if (!kind) continue;

      if (kind === 'shadow' && d.prop === 'box-shadow' && !/var\(/.test(d.value) && d.value !== 'none') {
        const layers = shadowLayers(d.value);
        const blurred = layers.filter((l) => !l.inset && (l.lengths[2] ?? 0) > 0.5);
        if (/:focus/.test(rule.selector)) {
          push(d.valueStart, d.valueStart + d.value.length, 'var(--cm-focus-ring)', 'a11y', 'anel de foco → Electric Sky com respiro de 2px');
          continue;
        }
        if (blurred.length) {
          const blur = Math.max(...blurred.map((l) => l.lengths[2] ?? 0));
          // Sombra colorida = intenção de brilho → glow do acento (segue data-cm-accent)
          const tinted = colorHits(d.value).some((h) => classify(h.rgb).family !== 'neutral');
          const next =
            opts.material === 'print'
              ? blur <= 3
                ? 'var(--caramelo-shadow-sm)'
                : 'var(--caramelo-shadow-md)'
              : tinted || (fill === 'accent' && variants.includes('hover'))
                ? 'var(--cm-glow-sm)'
                : `var(--cm-elev-${blur <= 3 ? 1 : blur <= 14 ? 2 : blur <= 32 ? 3 : 4})`;
          push(d.valueStart, d.valueStart + d.value.length, next, 'shadow', opts.material === 'print' ? 'sombra borrada → sombra gráfica sólida (Print)' : 'sombra genérica → elevação Lumen (aresta de luz + profundidade)');
          continue;
        }
        if (layers.length && layers.every((l) => l.inset)) {
          if (opts.material === 'lumen') push(d.valueStart, d.valueStart + d.value.length, 'var(--cm-pressed)', 'shadow', 'sombra interna → estado afundado Lumen');
          continue;
        }
      }

      const isGradient = /gradient\(/.test(d.value);
      const valueEdits: Array<{ s: number; e: number; t: string }> = [];
      const hits = colorHits(d.value, kind !== 'shadow');
      for (const [hi, h] of hits.entries()) {
        const c = classify(h.rgb);
        // paradas do gradiente: from → accent, to → accent-bright (mantém a profundidade)
        const prefix = isGradient ? (hi === 0 ? 'from' : hi === hits.length - 1 ? 'to' : 'via') : undefined;
        // Sombras neutras (preto translúcido) funcionam nos dois temas — mantidas
        if (kind === 'shadow' && c.family === 'neutral') continue;
        let r: RoleResult;
        if (/:focus/.test(rule.selector) && (kind === 'line' || kind === 'shadow')) r = { role: 'focus' };
        else
          r = roleFor(isGradient ? 'gradient' : kind, c.family, c.shade, opts, {
            variants,
            fill: kind === 'text' || kind === 'fill' ? fill : null,
            prefix,
          });
        valueEdits.push({ s: h.start, e: h.end, t: cssColorFor(r, h.rgb, h.format) });
      }
      if (valueEdits.length) {
        let next = d.value;
        for (const ve of [...valueEdits].reverse()) next = next.slice(0, ve.s) + ve.t + next.slice(ve.e);
        const isContrast = (kind === 'text' || kind === 'fill') && fill;
        push(d.valueStart, d.valueStart + d.value.length, next, 'color', isContrast ? 'texto sobre preenchimento → contraste garantido' : 'cor → papel semântico (segue tema e acento)');
      }
    }
  }

  const appended = opts.enhanceInteractions ? interactionRules(rules, opts) : '';
  if (appended) notes.push('Regras de interação foram anexadas ao fim do CSS (feedback de clique, foco visível e movimento reduzido).');
  return { edits, changes, appended, notes };
}

// ——— Reforços de interação para seletores de botão/campo ———
function interactionRules(rules: CssRule[], opts: MapOptions): string {
  interface Info {
    hover: boolean;
    active: boolean;
    focus: boolean;
    transition: boolean;
    fill: ElementFill;
    field: boolean;
    placeholder: boolean;
  }
  const bases = new Map<string, Info>();
  for (const r of rules) {
    if (r.atRules.some((a) => /keyframes|font-face/.test(a))) continue;
    for (const raw of r.selector.split(',')) {
      const sel = raw.trim();
      const base = baseSelector(sel);
      const button = BUTTONISH_RE.test(base);
      const field = !button && FIELDISH_RE.test(base);
      if (!button && !field) continue;
      const info = bases.get(base) ?? { hover: false, active: false, focus: false, transition: false, fill: null, field, placeholder: false };
      const pseudo = sel.slice(base.length);
      if (/:hover/.test(pseudo)) info.hover = true;
      if (/:active/.test(pseudo)) info.active = true;
      if (/::?placeholder/.test(pseudo)) info.placeholder = true;
      // outline:none em :focus também conta — transformCss insere o anel nessa mesma regra
      if (/:focus/.test(pseudo) && r.decls.some((d) => d.prop === 'box-shadow' || d.prop === 'border-color' || d.prop.startsWith('outline'))) info.focus = true;
      if (!pseudo) {
        if (r.decls.some((d) => d.prop.startsWith('transition'))) info.transition = true;
        info.fill = info.fill ?? ruleFill(r, opts);
      }
      bases.set(base, info);
    }
  }

  const blocks: string[] = [];
  const reduced: string[] = [];
  for (const [base, i] of bases) {
    const out: string[] = [];
    if (i.field) {
      if (!i.focus)
        out.push(`${base}:focus-visible {\n  outline: none;\n  border-color: rgb(var(--cm-accent) / 0.7);\n  box-shadow: 0 0 0 3px rgb(var(--cm-accent) / 0.15);\n}`);
      if (!i.placeholder) out.push(`${base}::placeholder {\n  color: rgb(var(--cm-fg-dim));\n}`);
      if (!i.transition) out.push(`${base} {\n  transition: border-color var(--cm-dur-micro) var(--cm-ease-standard), box-shadow var(--cm-dur-micro) var(--cm-ease-standard);\n}`);
    } else if (opts.material === 'print') {
      if (!i.transition) out.push(`${base} {\n  transition: transform 150ms var(--caramelo-ease-kinetic), box-shadow 150ms var(--caramelo-ease-kinetic);\n}`);
      if (!i.hover) out.push(`${base}:hover {\n  transform: translate(-2px, -2px);\n  box-shadow: var(--caramelo-shadow-md);\n}`);
      if (!i.active) out.push(`${base}:active {\n  transform: translate(1px, 1px);\n  box-shadow: none;\n}`);
      if (!i.focus) out.push(`${base}:focus-visible {\n  outline: none;\n  box-shadow: var(--cm-focus-ring);\n}`);
      if (out.length) reduced.push(`${base}, ${base}:hover, ${base}:active { transform: none; }`);
    } else {
      if (!i.transition)
        out.push(`${base} {\n  transition: color var(--cm-dur-micro) var(--cm-ease-out), background-color var(--cm-dur-micro) var(--cm-ease-out),\n    border-color var(--cm-dur-micro) var(--cm-ease-out), box-shadow var(--cm-dur-micro) var(--cm-ease-out),\n    transform var(--cm-dur-micro) var(--cm-ease-out);\n}`);
      if (!i.hover && i.fill === 'accent') out.push(`${base}:hover {\n  background-color: rgb(var(--cm-accent-bright));\n  box-shadow: var(--cm-glow-sm);\n}`);
      if (!i.active) out.push(`${base}:active {\n  transform: scale(0.97);\n  transition-duration: var(--cm-dur-instant);\n}`);
      if (!i.focus) out.push(`${base}:focus-visible {\n  outline: none;\n  box-shadow: var(--cm-focus-ring);\n}`);
      if (out.length) reduced.push(`${base} { transition: none; }\n  ${base}:active { transform: none; }`);
    }
    blocks.push(...out);
  }
  if (!blocks.length) return '';
  const motionBlock = reduced.length ? `\n\n@media (prefers-reduced-motion: reduce) {\n  ${reduced.join('\n  ')}\n}` : '';
  return `\n\n/* ——— Caramelo · interação (gerado pelo MCP) ——— */\n${blocks.join('\n\n')}${motionBlock}\n`;
}
