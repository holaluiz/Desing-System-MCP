/**
 * Mapeamento de classes Tailwind genéricas → identidade Caramelo.
 * Cores viram PAPÉIS semânticos (bg-surface-1, text-fg-muted, bg-accent…),
 * que se adaptam ao tema e à cor funcional de base. Gradientes mantêm as cores combinadas da marca.
 */

import { colors } from '../../tokens/colors';
import type { SemanticRole } from '../../tokens/semantic';
import {
  chromaRole,
  FAMILY_TO_BRAND,
  neutralRole,
  resolveTailwindColor,
  type AccentStrategy,
  type Polarity,
  type UtilityKind,
} from './brand';
import type { HueFamily } from './color';

export type Material = 'lumen' | 'print';

export interface MapOptions {
  primaryFamily: HueFamily | null;
  strategy: AccentStrategy;
  material: Material;
  /** Tema alvo (afeta apenas cores literais na estratégia preserve) */
  theme: Polarity;
  /** Polaridade do design de origem */
  polarity: Polarity;
}

export interface ClassChange {
  from: string;
  to: string;
  reason: string;
}

export interface ParsedUtility {
  variants: string[];
  important: boolean;
  negative: boolean;
  base: string;
}

export function parseUtility(token: string): ParsedUtility {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of token) {
    if (ch === '[') depth++;
    if (ch === ']') depth--;
    if (ch === ':' && depth === 0) {
      parts.push(cur);
      cur = '';
    } else cur += ch;
  }
  let base = cur;
  const important = base.startsWith('!');
  if (important) base = base.slice(1);
  const negative = base.startsWith('-');
  if (negative) base = base.slice(1);
  return { variants: parts, important, negative, base };
}

export function stringifyUtility(p: ParsedUtility): string {
  return [...p.variants, `${p.important ? '!' : ''}${p.negative ? '-' : ''}${p.base}`].join(':');
}

const COLOR_PREFIXES: Array<[string, UtilityKind]> = [
  ['ring-offset', 'ring-offset'],
  ['border-x', 'line'],
  ['border-y', 'line'],
  ['border-t', 'line'],
  ['border-r', 'line'],
  ['border-b', 'line'],
  ['border-l', 'line'],
  ['border-s', 'line'],
  ['border-e', 'line'],
  ['border', 'line'],
  ['divide', 'line'],
  ['outline', 'line'],
  ['ring', 'line'],
  ['decoration', 'line'],
  ['bg', 'bg'],
  ['text', 'text'],
  ['from', 'gradient'],
  ['via', 'gradient'],
  ['to', 'gradient'],
  ['fill', 'fill'],
  ['stroke', 'fill'],
  ['placeholder', 'placeholder'],
  ['caret', 'text'],
  ['accent', 'text'],
  ['shadow', 'shadow'],
];

export interface ColorUtility {
  prefix: string;
  kind: UtilityKind;
  value: string;
  opacity: string;
  family: HueFamily;
  shade: number | 'white' | 'black';
}

export function splitColorUtility(base: string): ColorUtility | null {
  for (const [prefix, kind] of COLOR_PREFIXES) {
    if (!base.startsWith(prefix + '-')) continue;
    const rest = base.slice(prefix.length + 1);
    const om = /(\/(?:\d+|\[[^\]]+\]))$/.exec(rest);
    const opacity = om ? om[1] : '';
    const value = om ? rest.slice(0, -opacity.length) : rest;
    const resolved = resolveTailwindColor(value);
    if (!resolved) return null;
    return { prefix, kind, value, opacity, family: resolved.family, shade: resolved.shade };
  }
  return null;
}

export type ElementFill = 'accent' | 'status' | null;

export interface RoleResult {
  /** Papel semântico (preferencial) */
  role?: SemanticRole;
  /** Token literal da marca (gradientes ou estratégia preserve), ex.: "violet-surface" */
  literal?: string;
  /** Opacidade sugerida quando a origem era um tom claro de borda */
  opacity?: string;
}

const isInteractionVariant = (v: string[]) => v.some((x) => /^(hover|active|group-hover|peer-hover)$/.test(x));
const isFocusVariant = (v: string[]) => v.some((x) => /^(focus|focus-visible|focus-within|group-focus|peer-focus)$/.test(x));

/** Decide o papel de uma cor — compartilhado entre Tailwind, CSS e estilos inline */
export function roleFor(
  kind: UtilityKind,
  family: HueFamily,
  shade: number | 'white' | 'black',
  opts: MapOptions,
  ctx: { variants?: string[]; fill?: ElementFill; prefix?: string } = {}
): RoleResult {
  const variants = ctx.variants ?? [];
  const n = shade === 'white' ? 0 : shade === 'black' ? 1000 : shade;

  // Texto/ícone sobre preenchimento colorido: contraste garantido pelo token
  if ((kind === 'text' || kind === 'fill') && ctx.fill) {
    return { role: ctx.fill === 'accent' ? 'accent-contrast' : 'on-status' };
  }
  if (kind === 'ring-offset') return { role: 'stage' };
  if (kind === 'placeholder') return { role: 'fg-dim' };
  if (kind === 'line' && ctx.prefix?.startsWith('ring') && isFocusVariant(variants)) return { role: 'focus' };

  if (family === 'neutral') return { role: neutralRole(kind, shade, opts.polarity) };

  // Gradientes são composição de marca: nunca colapsar seus stops em um acento único.
  // Mint continua reservado a sucesso; verde decorativo entra no canal frio do espectro.
  if (kind === 'gradient') {
    const color = FAMILY_TO_BRAND[family];
    return { literal: color === 'mint' ? 'sky' : color };
  }

  const role = chromaRole(family, opts.primaryFamily);

  if (opts.strategy === 'preserve' && role === 'accent' && family !== opts.primaryFamily) {
    const c = FAMILY_TO_BRAND[family];
    if (kind === 'text') return { literal: opts.theme === 'light' ? `${c}-deep` : c === 'violet' ? '[#9A85FF]' : c };
    if (kind === 'bg') {
      if (n <= 200) return { literal: opts.theme === 'dark' ? `${c}-surface` : `${c}-light` };
      if (n >= 900) return { literal: `${c}-surface` };
      return { literal: c === 'violet' ? 'violet-hover' : c };
    }
    return { literal: c, opacity: kind === 'line' && n <= 300 ? '/40' : undefined };
  }

  const soft = (`${role}-soft` as SemanticRole);
  switch (kind) {
    case 'bg':
      if (n <= 200 || n >= 900) return { role: soft };
      if (role === 'accent' && (isInteractionVariant(variants) || n >= 700)) {
        return { role: isInteractionVariant(variants) ? 'accent-bright' : 'accent' };
      }
      // Status não tem "bright": no hover, um leve recuo de opacidade mantém a resposta visível
      if (isInteractionVariant(variants)) return { role, opacity: '/90' };
      return { role };
    case 'text':
      return { role: role === 'accent' ? 'accent-ink' : role };
    case 'shadow':
      return { role, opacity: '/30' };
    case 'line':
      return { role, opacity: n <= 300 ? '/40' : undefined };
    default:
      return { role };
  }
}

/** Hex de um token literal (para saídas CSS) */
export function literalHex(literal: string): string {
  const arb = /^\[(#[0-9A-Fa-f]{6})\]$/.exec(literal);
  if (arb) return arb[1];
  const [name, variant = 'DEFAULT'] = literal.split('-') as [keyof typeof colors, string?];
  const group = colors[name] as Record<string, string> | undefined;
  return group?.[variant] ?? group?.DEFAULT ?? '#FF701A';
}

// ——— Utilitários não-cromáticos ———
const SHADOW_SIZES = new Set(['shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-inner']);
const LUMEN_SHADOW: Record<string, string> = {
  'shadow-sm': 'shadow-elev-1',
  shadow: 'shadow-elev-2',
  'shadow-md': 'shadow-elev-2',
  'shadow-lg': 'shadow-elev-3',
  'shadow-xl': 'shadow-elev-3',
  'shadow-2xl': 'shadow-elev-4',
  'shadow-inner': 'shadow-pressed',
};
const PRINT_SHADOW: Record<string, string> = {
  'shadow-sm': 'shadow-graphic-sm',
  shadow: 'shadow-graphic-md',
  'shadow-md': 'shadow-graphic-md',
  'shadow-lg': 'shadow-graphic-lg',
  'shadow-xl': 'shadow-graphic-lg',
  'shadow-2xl': 'shadow-graphic-lg',
  'shadow-inner': 'shadow-none',
};
const LUMEN_RADIUS: Record<string, string> = {
  sm: 'cm-xs',
  '': 'cm-sm',
  md: 'cm-md',
  lg: 'cm-md',
  xl: 'cm-lg',
  '2xl': 'cm-xl',
  '3xl': 'cm-2xl',
};
const DURATION: Record<string, string> = {
  '0': 'duration-0',
  '75': 'duration-instant',
  '100': 'duration-instant',
  '150': 'duration-micro',
  '200': 'duration-micro',
  '300': 'duration-base',
  '500': 'duration-smooth',
  '700': 'duration-cinematic',
  '1000': 'duration-cinematic',
};

function mapNonColor(base: string, opts: MapOptions): { base: string; reason: string } | null {
  if (SHADOW_SIZES.has(base)) {
    return {
      base: (opts.material === 'print' ? PRINT_SHADOW : LUMEN_SHADOW)[base],
      reason: opts.material === 'print' ? 'sombra borrada → sombra gráfica sólida (Print)' : 'sombra genérica → elevação Lumen (aresta de luz + profundidade)',
    };
  }
  const r = /^rounded(?:-([trblse]{1,2}))?(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$/.exec(base);
  if (r && base !== 'rounded-none' && !base.endsWith('-full') && !base.endsWith('-none')) {
    const side = r[1] ? `-${r[1]}` : '';
    if (opts.material === 'print') return { base: `rounded${side}-none`, reason: 'Print usa arestas retas de cartaz' };
    const mapped = LUMEN_RADIUS[r[2] ?? ''];
    if (mapped) return { base: `rounded${side}-${mapped}`, reason: 'raio → escala Lumen concêntrica' };
  }
  if (base === 'transition' || base === 'transition-all') {
    return {
      base: 'transition-[color,background-color,border-color,box-shadow,transform,opacity]',
      reason: '"transition-all" anima propriedades de layout sem querer — propriedades explícitas',
    };
  }
  const d = /^duration-(\d+)$/.exec(base);
  if (d && DURATION[d[1]]) return { base: DURATION[d[1]], reason: 'duração → token de motion' };
  if (base === 'ease-in-out' || base === 'ease-in' || base === 'ease-out') {
    return { base: 'ease-out-expo', reason: 'curva genérica → expo-out (resposta rápida, pouso suave)' };
  }
  if (base === 'font-serif') return { base: 'font-display', reason: 'serifa → Montserrat 900 (display)' };
  return null;
}

export interface ElementInfo {
  tag: string;
  role?: string | null;
  inputType?: string | null;
  /** Preenchimento do estilo inline, que prevalece sobre as classes. */
  fill?: ElementFill;
  /** Lista solta (base de cva/variantes): o hover vem das variantes, não do base */
  loose?: boolean;
}

export const INTERACTIVE_TAGS = new Set(['button', 'a', 'summary', 'Button', 'Link', 'NavLink']);
export const FIELD_TAGS = new Set(['input', 'textarea', 'select', 'Input', 'Textarea', 'Select']);
const HEADING_TAGS = new Set(['h1', 'h2', 'h3']);

const has = (tokens: string[], re: RegExp) => tokens.some((t) => re.test(t));

/** Indicador de foco VISÍVEL (focus:outline-none sozinho não conta) */
export const FOCUS_INDICATOR_RE = /(^|:)focus(-visible|-within)?:(ring|shadow|border|outline-(?!none)|bg-|underline|text-)/;

/** Reforços de interação por tipo de elemento (apenas o que estiver faltando) */
export function enhance(
  tokens: string[],
  el: ElementInfo,
  opts: MapOptions,
  fill: ElementFill = null
): { add: string[]; reasons: string[] } {
  const add: string[] = [];
  const reasons: string[] = [];
  const plain = tokens.map((t) => parseUtility(t)).filter((p) => p.variants.length === 0).map((p) => p.base);

  const interactive =
    INTERACTIVE_TAGS.has(el.tag) || el.role === 'button' || el.role === 'tab' || el.role === 'menuitem' || plain.includes('cursor-pointer');
  const buttonLike =
    interactive && (!!el.loose || has(plain, /^bg-/) || has(plain, /^border/) || (has(plain, /^px-/) && has(plain, /^py-/)) || has(plain, /^h-\d/) || has(plain, /^size-/));
  const hasActive = has(tokens, /(^|:)active:/);
  const hasHover = has(tokens, /(^|:)hover:/);
  const hasFocus = has(tokens, FOCUS_INDICATOR_RE);
  const hasTransition = has(plain, /^transition/);

  if (buttonLike) {
    let glow = false;
    if (opts.material === 'lumen') {
      if (!hasTransition) add.push('transition-[color,background-color,border-color,box-shadow,transform]', 'duration-micro', 'ease-out-expo');
      if (!hasActive) add.push('active:scale-[0.97]', 'active:duration-instant');
      if (fill === 'accent' && !hasHover) {
        add.push('hover:bg-accent-bright', 'hover:shadow-glow-sm');
        glow = true;
      } else if (!fill && !hasHover && !el.loose) add.push('hover:bg-fg/[0.06]');
    } else {
      if (!hasTransition) add.push('transition-[transform,box-shadow]', 'duration-150', 'ease-kinetic');
      if (!has(plain, /^shadow-/)) add.push('shadow-graphic-sm');
      if (!hasHover) add.push('hover:-translate-x-[2px]', 'hover:-translate-y-[2px]', 'hover:shadow-graphic-md');
      if (!hasActive) add.push('active:translate-x-[1px]', 'active:translate-y-[1px]', 'active:shadow-none');
    }
    if (!hasFocus) add.push('focus-visible:outline-none', 'focus-visible:shadow-focus');
    if (add.length) {
      add.push(opts.material === 'print' ? 'motion-reduce:transform-none' : 'motion-reduce:transition-none');
      reasons.push(
        opts.material === 'print'
          ? 'física de clique Print: sobe no hover, afunda no clique'
          : 'feedback tátil' + (hasActive ? '' : ': press 0.97 em 80ms') + (hasFocus ? '' : ', foco Electric Sky') + (glow ? ', glow no CTA' : '')
      );
    }
  } else if (interactive && !hasFocus && (plain.includes('outline-none') || has(tokens, /(^|:)focus:outline-none/))) {
    // Link/elemento interativo que apaga o contorno nativo sem repor um indicador
    add.push('focus-visible:shadow-focus', 'focus-visible:rounded-cm-xs');
    reasons.push('outline removido sem substituto → anel de foco Electric Sky');
  }

  const isField = FIELD_TAGS.has(el.tag) && !/^(checkbox|radio|range|file|color|hidden|submit|button)$/.test(el.inputType ?? '');
  if (isField) {
    const before = add.length;
    if (!hasFocus) add.push('focus:outline-none', 'focus:border-accent/70', 'focus:ring-[3px]', 'focus:ring-accent/15');
    if (!has(tokens, /(^|:)placeholder:/)) add.push('placeholder:text-fg-dim');
    if (!hasTransition) add.push('transition-[border-color,box-shadow]', 'duration-micro', 'ease-standard');
    if (add.length > before) reasons.push('campo com foco luminoso: borda acesa + halo de 3px');
  }

  if (HEADING_TAGS.has(el.tag) && !plain.includes('font-display')) {
    // Tipografia do LP: Montserrat 900 com tracking negativo forte nos títulos de cena
    const major = el.tag === 'h1' || el.tag === 'h2';
    add.push('font-display');
    // Peso: só quando a origem não definiu (respeita a intenção do autor)
    if (!has(plain, /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)) add.push(major ? 'font-black' : 'font-extrabold');
    if (!has(plain, /^tracking-/)) add.push(major ? 'tracking-display' : 'tracking-title');
    add.push('text-balance');
    if (opts.material === 'print' && !plain.includes('uppercase')) add.push('uppercase');
    reasons.push('título na Montserrat 900 (display) com tracking do LP e quebra balanceada');
  }

  return { add: add.filter((t) => !tokens.includes(t)), reasons };
}

/** Preenchimento colorido do elemento (define a cor de texto segura) */
export function detectFill(tokens: string[], opts: MapOptions): ElementFill {
  for (const t of tokens) {
    const p = parseUtility(t);
    if (p.variants.length) continue;
    if (/^bg-(accent|caramel|sky|pink|violet|yellow)(?:\/(?:\d+|\[[^\]]+\]))?$/.test(p.base)) return 'accent';
    if (/^bg-(danger|success|warning|info)$/.test(p.base)) return 'status';
    const cu = splitColorUtility(p.base);
    if (!cu || (cu.kind !== 'bg' && !(cu.kind === 'gradient' && cu.prefix === 'from')) || cu.family === 'neutral') continue;
    const n = cu.shade === 'white' ? 0 : cu.shade === 'black' ? 1000 : cu.shade;
    if (n <= 200 || n >= 900) continue; // fundos tingidos não são preenchimentos
    const r = roleFor('bg', cu.family, cu.shade, opts);
    return r.role === 'accent' || r.role === 'accent-bright' || r.literal ? 'accent' : 'status';
  }
  return null;
}

/**
 * Mapeia uma lista de classes. `el` presente = classes de um elemento conhecido
 * (habilita contraste por contexto e reforços de interação).
 * `contextTokens` = todas as classes do elemento quando ele tem vários literais (cn/clsx).
 */
export function mapClassList(
  value: string,
  opts: MapOptions,
  el?: ElementInfo,
  enhanceInteractions = true,
  contextTokens?: string[]
): { value: string; changes: ClassChange[] } {
  const lead = /^\s*/.exec(value)![0];
  const trail = /\s*$/.exec(value)![0];
  const tokens = value.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length && !el?.fill) return { value, changes: [] };

  const changes: ClassChange[] = [];
  const fill = el?.fill ?? detectFill(contextTokens ?? tokens, opts);
  const out: string[] = [];

  for (const token of tokens) {
    const p = parseUtility(token);

    // Cores em dark: são redundantes — os papéis semânticos já trocam com o tema
    const cu = splitColorUtility(p.base);
    if (cu && p.variants.includes('dark')) {
      changes.push({ from: token, to: '∅', reason: 'variante dark: removida — papéis semânticos já se adaptam ao tema' });
      continue;
    }

    if (cu) {
      const r = roleFor(cu.kind, cu.family, cu.shade, opts, { variants: p.variants, fill, prefix: cu.prefix });
      const name = r.role ?? r.literal!;
      const nextBase = `${cu.prefix}-${name}${cu.opacity || r.opacity || ''}`;
      const next = stringifyUtility({ ...p, base: nextBase });
      if (next !== token) {
        changes.push({
          from: token,
          to: next,
          reason: r.role === 'accent-contrast' || r.role === 'on-status' ? 'texto sobre preenchimento → contraste garantido' : r.literal ? 'acento preservado como tinta da marca' : 'cor → papel semântico',
        });
      }
      out.push(next);
      continue;
    }

    const nc = mapNonColor(p.base, opts);
    if (nc && nc.base !== p.base) {
      const next = stringifyUtility({ ...p, base: nc.base });
      changes.push({ from: token, to: next, reason: nc.reason });
      out.push(next);
      continue;
    }
    out.push(token);
  }

  let final = Array.from(new Set(out));
  const interactive = el && (INTERACTIVE_TAGS.has(el.tag) || el.role === 'button' || el.role === 'tab' || el.role === 'menuitem');
  if (interactive && fill === 'accent' && opts.material === 'lumen' && !(contextTokens ?? final).includes('cm-brand-action')) {
    final.push('cm-brand-action');
    changes.push({ from: `<${el.tag}>`, to: '+ cm-brand-action', reason: 'CTA de marca → camada combinada das cinco cores sobre base neutra' });
  }
  if (el && enhanceInteractions) {
    const { add, reasons } = enhance(contextTokens ? Array.from(new Set([...final, ...contextTokens])) : final, el, opts, fill);
    if (add.length) {
      final = [...final, ...add];
      changes.push({ from: `<${el.tag}>`, to: `+ ${add.join(' ')}`, reason: reasons.join('; ') });
    }
  }

  return { value: lead + final.join(' ') + trail, changes };
}

/** Conta famílias cromáticas para eleger o acento principal da origem */
export function familyWeights(tokens: string[], interactiveTokens: Set<string>): Map<HueFamily, number> {
  const w = new Map<HueFamily, number>();
  for (const t of tokens) {
    const p = parseUtility(t);
    if (p.variants.includes('dark')) continue;
    const cu = splitColorUtility(p.base);
    if (!cu || cu.family === 'neutral') continue;
    let score = cu.kind === 'bg' || cu.kind === 'gradient' ? 2 : 1;
    if (interactiveTokens.has(t) && cu.kind === 'bg') score += 2;
    if (cu.family === 'red' || cu.family === 'green') score *= 0.5; // geralmente status
    w.set(cu.family, (w.get(cu.family) ?? 0) + score);
  }
  return w;
}

/** Polaridade do design de origem (claro x escuro) */
export function polarityOf(tokens: string[]): Polarity {
  return polarityOfLists([tokens]);
}

/**
 * Polaridade por lista de classes: texto claro sobre um preenchimento colorido
 * (botão bg-blue-600 text-white) não indica design escuro.
 */
export function polarityOfLists(lists: string[][]): Polarity {
  let light = 0;
  let dark = 0;
  for (const list of lists) {
    const filled = list.some((t) => {
      const cu = splitColorUtility(parseUtility(t).base);
      if (!cu || cu.family === 'neutral' || (cu.kind !== 'bg' && cu.kind !== 'gradient')) return false;
      const n = cu.shade === 'white' ? 0 : cu.shade === 'black' ? 1000 : cu.shade;
      return n > 200 && n < 900;
    });
    tally(list, filled);
  }
  return dark > light ? 'dark' : 'light';

  function tally(tokens: string[], filled: boolean) {
  for (const t of tokens) {
    const p = parseUtility(t);
    if (p.variants.length) continue;
    const cu = splitColorUtility(p.base);
    if (!cu || cu.family !== 'neutral') continue;
    if (filled && cu.kind === 'text') continue;
    const n = cu.shade === 'white' ? 0 : cu.shade === 'black' ? 1000 : cu.shade;
    if (cu.kind === 'bg') {
      if (n <= 100) light += 2;
      else if (n >= 800) dark += 2;
    } else if (cu.kind === 'text') {
      if (n >= 700) light += 1;
      else if (n <= 200) dark += 1;
    }
  }
  }
}

/** Status (erro/sucesso) nunca vira o acento da cena quando o código fala de status */
const STATUS_HINT_RE = /destructive|danger|error|erro|delete|excluir|remov|invalid|success|sucesso|warning|alerta|aviso/i;

export function electPrimary(weights: Map<HueFamily, number>, code: string): HueFamily | null {
  const statusy = STATUS_HINT_RE.test(code);
  let best: HueFamily | null = null;
  let bw = 0;
  weights.forEach((w, f) => {
    if (statusy && (f === 'red' || f === 'green')) return;
    if (w > bw) {
      bw = w;
      best = f;
    }
  });
  return best;
}
