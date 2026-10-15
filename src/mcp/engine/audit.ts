/**
 * Auditoria de UX/UI — mede (não adivinha): contraste WCAG calculado com herança
 * de fundo, acessibilidade de controles, física de interação, motion, disciplina
 * cromática e tipografia. Cada achado traz linha, correção e se o
 * transform_to_caramelo resolve sozinho (autoFix).
 */

import { colors, neutral } from '../../tokens/colors';
import { semanticRoles, type SemanticRole } from '../../tokens/semantic';
import { resolveTailwindColor, roleHex, type Polarity } from './brand';
import { composite, contrastRatio, parseColor, type RGB } from './color';
import { colorHits, colorKindOfProp, isDarkBlock, parseCss, baseSelector, BUTTONISH_RE, FIELDISH_RE, type CssRule } from './css';
import { detectLanguage, findClassLikeStrings, getAttr, hasAttr, insideTag, LineIndex, classLiteralsIn, looksLikeClassList, scanElements, visibleText, type ScannedElement } from './scan';
import { FIELD_TAGS, FOCUS_INDICATOR_RE, parseUtility, polarityOfLists, splitColorUtility } from './tailwind-map';

export type Severity = 'critical' | 'warning' | 'suggestion';
export type AuditCategory = 'acessibilidade' | 'contraste' | 'interacao' | 'motion' | 'identidade' | 'tipografia' | 'ux';
export type AuditContext = 'web-app' | 'landing-page' | 'dashboard' | 'mobile';

export interface Finding {
  rule: string;
  severity: Severity;
  category: AuditCategory;
  line: number;
  snippet?: string;
  issue: string;
  fix: string;
  autoFix: boolean;
}

export interface AuditReport {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  verdict: string;
  context: AuditContext;
  language: 'markup' | 'css';
  categories: Record<AuditCategory, { score: number; findings: number }>;
  findings: Finding[];
  strengths: string[];
  stats: {
    elements: number;
    interactive: number;
    contrastPairs: number;
    literalColors: number;
    semanticTokens: number;
  };
  recommendedInteractions: string[];
  nextSteps: string[];
}

const CATEGORIES: AuditCategory[] = ['acessibilidade', 'contraste', 'interacao', 'motion', 'identidade', 'tipografia', 'ux'];
const WEIGHT: Record<Severity, number> = { critical: 12, warning: 5, suggestion: 2 };
const CAP: Record<Severity, number> = { critical: 3, warning: 3, suggestion: 2 };

// ═══════════════════════════════════════════════════════════════════
// Resolução de cores de classe (Tailwind, papéis Caramelo, tintas da marca)
// ═══════════════════════════════════════════════════════════════════

interface ThemedColor {
  light: RGB;
  dark: RGB;
  semantic: boolean;
  label: string;
}

const ROLE_SET = new Set(Object.keys(semanticRoles));

function brandLiteral(value: string): string | null {
  const [name, ...rest] = value.split('-');
  const variant = rest.join('-');
  if (name === 'ink' && /^\d+$/.test(variant)) return (neutral as Record<string, string>)[variant] ?? null;
  const group = (colors as unknown as Record<string, Record<string, string>>)[name];
  if (!group) return null;
  const key = variant ? variant.replace(/-(\w)/g, (_, c: string) => c.toUpperCase()) : 'DEFAULT';
  const hex = group[key];
  return hex && hex.startsWith('#') ? hex : null;
}

function parseAlphaSuffix(value: string): { value: string; alpha: number } {
  const m = /\/(\d+|\[[\d.]+%?\])$/.exec(value);
  if (!m) return { value, alpha: 1 };
  const raw = m[1].replace(/[[\]]/g, '');
  const alpha = raw.endsWith('%') ? parseFloat(raw) / 100 : raw.includes('.') ? parseFloat(raw) : parseFloat(raw) / 100;
  return { value: value.slice(0, -m[0].length), alpha };
}

export function resolveClassColor(rawValue: string): ThemedColor | null {
  const { value, alpha } = parseAlphaSuffix(rawValue);
  const withAlpha = (c: RGB): RGB => ({ ...c, a: c.a * alpha });
  if (ROLE_SET.has(value)) {
    const role = value as SemanticRole;
    return { light: withAlpha(parseColor(roleHex(role, 'light'))!), dark: withAlpha(parseColor(roleHex(role, 'dark'))!), semantic: true, label: value };
  }
  const tw = resolveTailwindColor(value);
  if (tw) return { light: withAlpha(tw.rgb), dark: withAlpha(tw.rgb), semantic: false, label: value };
  const brand = brandLiteral(value);
  if (brand) {
    const c = withAlpha(parseColor(brand)!);
    return { light: c, dark: c, semantic: false, label: value };
  }
  return null;
}

interface ElementStyle {
  tokens: string[];
  plain: string[];
  text?: ThemedColor;
  bg?: ThemedColor;
  sizePx?: number;
  bold: boolean;
}

const TEXT_SIZES: Record<string, number> = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48, '6xl': 60, '7xl': 72, '8xl': 96, '9xl': 128 };

function styleOf(tokens: string[]): ElementStyle {
  const plain = tokens.map(parseUtility).filter((p) => p.variants.length === 0).map((p) => p.base);
  const s: ElementStyle = { tokens, plain, bold: plain.some((t) => /^font-(semibold|bold|extrabold|black)$/.test(t)) };
  for (const t of plain) {
    const size = /^text-(xs|sm|base|lg|xl|[2-9]xl)$/.exec(t) ?? /^text-\[(\d+(?:\.\d+)?)(px|rem)\]$/.exec(t);
    if (size) {
      s.sizePx = size[2] ? (size[2] === 'rem' ? parseFloat(size[1]) * 16 : parseFloat(size[1])) : TEXT_SIZES[size[1]];
      continue;
    }
    const m = /^(text|bg)-(.+)$/.exec(t);
    if (!m) continue;
    const c = resolveClassColor(m[2]);
    if (!c) continue;
    if (m[1] === 'text') s.text = c;
    else s.bg = c;
  }
  return s;
}

// ═══════════════════════════════════════════════════════════════════
// Auditoria
// ═══════════════════════════════════════════════════════════════════

export function audit(code: string, context: AuditContext = 'web-app'): AuditReport {
  const language = detectLanguage(code);
  const findings: Finding[] = [];
  const strengths: string[] = [];
  const stats = { elements: 0, interactive: 0, contrastPairs: 0, literalColors: 0, semanticTokens: 0 };
  const recommended = new Set<string>();
  const add = (f: Finding) => findings.push(f);
  const lines = new LineIndex(code);

  if (language === 'css') {
    auditCss(code, parseCss(code), lines, add, stats, strengths);
  } else {
    auditMarkup(code, lines, context, add, stats, strengths, recommended);
  }
  return finalize(findings, strengths, stats, context, language, recommended);
}

function auditMarkup(
  code: string,
  lines: LineIndex,
  context: AuditContext,
  add: (f: Finding) => void,
  stats: AuditReport['stats'],
  strengths: string[],
  recommended: Set<string>
) {
  const els = scanElements(code, lines);
  stats.elements = els.length;

  // Classes por elemento (todos os literais de className/class)
  const covered = new Set<number>();
  const elTokens: string[][] = els.map((el) => {
    const attr = getAttr(el, 'className', 'class', ':class');
    if (!attr?.raw) return [];
    if (attr.raw.startsWith('"') || attr.raw.startsWith("'")) {
      covered.add(attr.valueStart + 1);
      return (attr.value ?? '').split(/\s+/).filter(Boolean);
    }
    return classLiteralsIn(code, attr.valueStart, attr.valueEnd)
      .filter((l) => looksLikeClassList(l.value))
      .flatMap((l) => (covered.add(l.start), l.value.split(/\s+/).filter(Boolean)));
  });
  const looseTokens = findClassLikeStrings(code)
    .filter((l) => !covered.has(l.start))
    .flatMap((l) => l.value.split(/\s+/).filter(Boolean));
  const allTokens = Array.from(new Set([...elTokens.flat(), ...looseTokens]));
  const tokenList = [...elTokens.flat(), ...looseTokens];
  const styles = elTokens.map(styleOf);
  const polarity: Polarity = polarityOfLists([...elTokens, looseTokens]);
  const snippet = (el: ScannedElement) => code.slice(el.start, Math.min(el.end, el.start + 90)).replace(/\s+/g, ' ');

  // ——— Estatísticas de tokens ———
  for (const t of tokenList) {
    const base = parseUtility(t).base;
    const m = /^(?:text|bg|border|ring|fill|stroke|from|via|to|divide|outline|shadow|placeholder|decoration)-(.+)$/.exec(base);
    if (!m) continue;
    const v = parseAlphaSuffix(m[1]).value;
    if (ROLE_SET.has(v)) stats.semanticTokens++;
    else if (splitColorUtility(base)) stats.literalColors++;
  }
  for (const el of els) {
    const st = getAttr(el, 'style');
    if (st?.raw) stats.literalColors += colorHits(st.raw).length;
  }

  // ——— Elementos ———
  let h1Count = 0;
  let lastHeading = 0;
  let accentCtas = 0;
  let fieldsTotal = 0;
  let fieldsLabelled = 0;
  let focusIndicators = 0;

  els.forEach((el, idx) => {
    const st = styles[idx];
    const tokens = st.tokens;
    const lower = el.tag.toLowerCase();
    const role = getAttr(el, 'role')?.value;
    const isNativeLike = el.tag === lower || el.tag === 'Link' || el.tag === 'NavLink' || el.tag === 'Button';
    const interactive =
      isNativeLike &&
      (lower === 'button' || lower === 'a' || el.tag === 'Link' || el.tag === 'NavLink' || role === 'button' || role === 'tab' || role === 'menuitem' || st.plain.includes('cursor-pointer'));
    if (interactive) stats.interactive++;
    const has = (re: RegExp) => tokens.some((t) => re.test(t));
    const buttonLike = interactive && (st.plain.some((t) => /^(bg-|border|h-\d|size-)/.test(t)) || (st.plain.some((t) => /^px-/.test(t)) && st.plain.some((t) => /^py-/.test(t))));
    const hasFocusIndicator = has(FOCUS_INDICATOR_RE);
    if (hasFocusIndicator) focusIndicators++;

    // ——— Acessibilidade ———
    if (lower === 'img' && !hasAttr(el, 'alt')) {
      add({ rule: 'A11Y-IMG-ALT', severity: 'critical', category: 'acessibilidade', line: el.line, snippet: snippet(el), issue: 'Imagem sem alt — o leitor de tela anuncia o nome do arquivo.', fix: 'alt descritivo (ou alt="" se decorativa).', autoFix: true });
    }
    const iconOnly = el.inner !== null && !visibleText(el.inner).text && !visibleText(el.inner).hasExpression && /<(svg|img|i|[A-Z])/.test(el.inner);
    if (interactive && iconOnly && !hasAttr(el, 'aria-label', 'aria-labelledby', 'title')) {
      add({ rule: 'A11Y-ICON-NAME', severity: 'critical', category: 'acessibilidade', line: el.line, snippet: snippet(el), issue: 'Controle só com ícone, sem nome acessível.', fix: 'aria-label com a ação ("Fechar", "Buscar"…).', autoFix: true });
    }
    if (FIELD_TAGS.has(el.tag) && !/^(hidden|submit|button|image|reset|checkbox|radio)$/.test(getAttr(el, 'type')?.value ?? '')) {
      fieldsTotal++;
      const id = getAttr(el, 'id')?.value;
      const labelled =
        hasAttr(el, 'aria-label', 'aria-labelledby', 'label') ||
        insideTag(els, idx, 'label') ||
        (!!id && els.some((e) => e.tag === 'label' && (getAttr(e, 'htmlFor')?.value === id || getAttr(e, 'for')?.value === id)));
      if (labelled) fieldsLabelled++;
      else if (hasAttr(el, 'placeholder'))
        add({ rule: 'A11Y-PLACEHOLDER-LABEL', severity: 'warning', category: 'acessibilidade', line: el.line, snippet: snippet(el), issue: 'Placeholder usado como rótulo: some ao digitar e tem contraste baixo.', fix: '<label> visível ou <FocusField label="…"> (rótulo flutuante).', autoFix: true });
      else add({ rule: 'A11Y-FIELD-LABEL', severity: 'critical', category: 'acessibilidade', line: el.line, snippet: snippet(el), issue: 'Campo de formulário sem rótulo.', fix: 'Associe <label htmlFor> ou aria-label.', autoFix: false });
      recommended.add('focus-field');
    }
    if ((lower === 'div' || lower === 'span' || lower === 'li') && hasAttr(el, 'onClick', 'onclick', '@click') && !hasAttr(el, 'role')) {
      add({ rule: 'A11Y-CLICKABLE-DIV', severity: 'critical', category: 'acessibilidade', line: el.line, snippet: snippet(el), issue: `<${el.tag}> clicável: sem foco por teclado e sem papel de botão.`, fix: '<button type="button"> (ou <a href> se navega).', autoFix: false });
    }
    if (lower === 'a' && !hasAttr(el, 'href') && hasAttr(el, 'onClick', 'onclick', '@click')) {
      add({ rule: 'A11Y-ANCHOR-ACTION', severity: 'warning', category: 'acessibilidade', line: el.line, snippet: snippet(el), issue: '<a> sem href executando ação.', fix: 'Use <button type="button">.', autoFix: false });
    }
    if ((interactive || FIELD_TAGS.has(el.tag)) && (st.plain.includes('outline-none') || has(/(^|:)focus:outline-none$/)) && !hasFocusIndicator) {
      add({ rule: 'A11Y-FOCUS-REMOVED', severity: 'critical', category: 'acessibilidade', line: el.line, snippet: snippet(el), issue: 'Contorno de foco removido sem substituto — quem navega por teclado se perde.', fix: 'focus-visible:shadow-focus (anel Electric Sky com respiro).', autoFix: true });
    }
    const tab = getAttr(el, 'tabIndex', 'tabindex');
    if (tab && Number((tab.raw ?? '').replace(/[{}"']/g, '')) > 0) {
      add({ rule: 'A11Y-TABINDEX', severity: 'warning', category: 'acessibilidade', line: el.line, snippet: snippet(el), issue: 'tabIndex positivo quebra a ordem natural de foco.', fix: 'tabIndex={0} ou reordene o DOM.', autoFix: false });
    }
    if (lower === 'a' && getAttr(el, 'target')?.value === '_blank' && !hasAttr(el, 'rel')) {
      add({ rule: 'A11Y-BLANK-REL', severity: 'suggestion', category: 'acessibilidade', line: el.line, snippet: snippet(el), issue: 'Nova aba sem rel="noopener" (segurança) e sem aviso.', fix: 'rel="noopener noreferrer" + indicação visual de link externo.', autoFix: true });
    }
    if (lower === 'button' && !hasAttr(el, 'type') && insideTag(els, idx, 'form')) {
      add({ rule: 'A11Y-BUTTON-TYPE', severity: 'suggestion', category: 'ux', line: el.line, snippet: snippet(el), issue: 'Botão sem type dentro de <form> envia o formulário por padrão.', fix: 'type="button" ou type="submit" explícito.', autoFix: true });
    }
    const href = getAttr(el, 'href')?.value;
    if (lower === 'a' && (href === '#' || href === '')) {
      add({ rule: 'UX-DEAD-LINK', severity: 'warning', category: 'ux', line: el.line, snippet: snippet(el), issue: 'Link de placeholder (href="#") — rola para o topo e não leva a lugar nenhum.', fix: 'Destino real ou <button>.', autoFix: false });
    }

    // Alvo de toque
    if (interactive) {
      const px = (t: string) => {
        const m = /^(?:h|w|size)-(\d+(?:\.5)?)$/.exec(t) ?? /^(?:h|w|size)-\[(\d+)px\]$/.exec(t);
        if (!m) return null;
        return t.includes('[') ? Number(m[1]) : Number(m[1]) * 4;
      };
      const hs = st.plain.filter((t) => /^(h|size)-/.test(t)).map(px).filter((n): n is number => n !== null);
      const min = hs.length ? Math.min(...hs) : null;
      const target = context === 'mobile' ? 44 : 24;
      if (min !== null && min < target) {
        add({ rule: 'A11Y-TARGET-SIZE', severity: context === 'mobile' || min < 24 ? 'warning' : 'suggestion', category: 'acessibilidade', line: el.line, snippet: snippet(el), issue: `Alvo de ${min}px — abaixo de ${target}px (${context === 'mobile' ? 'toque' : 'WCAG 2.5.8'}).`, fix: context === 'mobile' ? 'h-11 (44px) em mobile; aumente a área clicável com padding.' : 'Mínimo h-6 (24px); recomendado h-10 (40px).', autoFix: false });
      }
    }

    // ——— Interação ———
    if (buttonLike && isNativeLike) {
      const hover = has(/(^|:)hover:/);
      const active = has(/(^|:)active:/);
      if (!hover && !active && !hasFocusIndicator) {
        add({ rule: 'IX-NO-FEEDBACK', severity: 'critical', category: 'interacao', line: el.line, snippet: snippet(el), issue: 'Controle sem nenhuma resposta ao gesto (hover, clique ou foco) — parece morto.', fix: 'Lumen: active:scale-[0.97] em 80ms + hover luminoso + focus-visible:shadow-focus.', autoFix: true });
      } else if (!active) {
        add({ rule: 'IX-NO-PRESS', severity: 'warning', category: 'interacao', line: el.line, snippet: snippet(el), issue: 'Sem estado pressionado: o clique não "pega" (feedback ≤100ms).', fix: 'active:scale-[0.97] active:duration-instant (Lumen) ou afundar 1px (Print).', autoFix: true });
      }
      if (!hasFocusIndicator && !st.plain.includes('outline-none')) {
        add({ rule: 'IX-FOCUS-DEFAULT', severity: 'suggestion', category: 'interacao', line: el.line, snippet: snippet(el), issue: 'Foco de teclado depende do contorno padrão do navegador.', fix: 'focus-visible:shadow-focus — anel da marca, só para teclado.', autoFix: true });
      }
      const bgFill = st.plain.find((t) => /^bg-/.test(t) && splitColorUtility(t)?.family !== 'neutral' && splitColorUtility(t));
      if (bgFill || st.plain.some((t) => /^bg-(accent|caramel)$/.test(t))) accentCtas++;
    }

    // ——— Motion ———
    if (st.plain.includes('transition-all')) {
      add({ rule: 'MO-TRANSITION-ALL', severity: 'warning', category: 'motion', line: el.line, snippet: snippet(el), issue: '"transition-all" anima layout (width, padding…) junto — custo de performance e movimento acidental.', fix: 'Propriedades explícitas: transition-[color,background-color,box-shadow,transform].', autoFix: true });
    }
    const dur = st.plain.map((t) => /^duration-(\d+)$/.exec(t) ?? /^duration-\[(\d+)ms\]$/.exec(t)).find(Boolean);
    if (dur && (interactive || FIELD_TAGS.has(el.tag)) && Number(dur[1]) > 400) {
      add({ rule: 'MO-SLOW-CONTROL', severity: 'warning', category: 'motion', line: el.line, snippet: snippet(el), issue: `Controle com ${dur[1]}ms de transição — acima do limiar de Doherty (400ms), parece lento.`, fix: 'duration-micro (160ms) para hover/cor; duration-instant (80ms) no press.', autoFix: true });
    }
    if (st.plain.some((t) => /^animate-(bounce|ping)$/.test(t))) {
      add({ rule: 'MO-INFINITE-LOOP', severity: 'suggestion', category: 'motion', line: el.line, snippet: snippet(el), issue: 'Animação infinita disputa atenção para sempre.', fix: 'Reserve loops para status ao vivo (cm-dot--pulse) e respeite motion-reduce.', autoFix: false });
    }

    // ——— Identidade ———
    const hard = st.plain.some((t) => /^shadow-(graphic|\[\d+px_\d+px_0)/.test(t));
    const soft = st.plain.some((t) => /^shadow-(sm|md|lg|xl|2xl|elev|glow)/.test(t) || t === 'shadow');
    if (hard && soft) {
      add({ rule: 'ID-MATERIAL-MIX', severity: 'warning', category: 'identidade', line: el.line, snippet: snippet(el), issue: 'Sombra sólida (Print) e sombra de luz (Lumen) no mesmo elemento.', fix: 'Um material por superfície.', autoFix: false });
    }
    if (st.plain.some((t) => /^shadow-(md|lg|xl|2xl)$/.test(t))) {
      add({ rule: 'ID-GENERIC-SHADOW', severity: 'suggestion', category: 'identidade', line: el.line, snippet: snippet(el), issue: 'Sombra borrada genérica de template.', fix: 'shadow-elev-2/3 (Lumen: aresta de luz + profundidade) ou shadow-graphic-md (Print).', autoFix: true });
    }

    // ——— Tipografia ———
    const hl = /^h([1-6])$/.exec(lower);
    if (hl) {
      const level = Number(hl[1]);
      if (level === 1) h1Count++;
      if (lastHeading && level > lastHeading + 1) {
        add({ rule: 'TY-HEADING-SKIP', severity: 'suggestion', category: 'tipografia', line: el.line, snippet: snippet(el), issue: `Hierarquia pula de h${lastHeading} para h${level}.`, fix: 'Mantenha a ordem dos níveis (o estilo vem da classe, não da tag).', autoFix: false });
      }
      lastHeading = level;
      // Só quando o título é estilizado por classes (em páginas com CSS próprio a fonte vem da folha)
      if (level <= 2 && st.tokens.length > 0 && !st.plain.includes('font-display') && !st.plain.includes('cm-heading')) {
        add({ rule: 'TY-HEADING-VOICE', severity: 'suggestion', category: 'tipografia', line: el.line, snippet: snippet(el), issue: 'Título sem a Montserrat 900 (display).', fix: 'font-display tracking-tight text-balance (ou classe cm-heading).', autoFix: true });
      }
    }
    if (st.sizePx !== undefined && st.sizePx < 12) {
      add({ rule: 'TY-TINY-TEXT', severity: 'warning', category: 'tipografia', line: el.line, snippet: snippet(el), issue: `Texto de ${st.sizePx}px — ilegível para boa parte das pessoas.`, fix: 'Mínimo text-xs (12px); 14–16px para leitura.', autoFix: false });
    }
    if (st.plain.includes('font-handwriting') && (interactive || FIELD_TAGS.has(el.tag) || (lower === 'p' && visibleText(el.inner).text.length > 80))) {
      add({ rule: 'TY-HANDWRITING-MISUSE', severity: 'warning', category: 'tipografia', line: el.line, snippet: snippet(el), issue: 'Voz manuscrita em controle ou texto longo.', fix: 'Voz 3 só em notas curtas e intervenções; controles usam a Sans.', autoFix: false });
    }
    if (lower === 'p' && visibleText(el.inner).text.length > 220) {
      const constrained = [st, ...ancestorStyles(els, styles, idx)].some((s) => s.plain.some((t) => /^max-w-/.test(t)));
      if (!constrained) {
        add({ rule: 'TY-MEASURE', severity: 'suggestion', category: 'tipografia', line: el.line, snippet: snippet(el), issue: 'Parágrafo longo sem largura máxima — linhas acima de ~75 caracteres cansam.', fix: 'max-w-prose ou max-w-[65ch].', autoFix: false });
      }
    }
    if (lower === 'p' && st.plain.includes('uppercase') && visibleText(el.inner).text.length > 60) {
      add({ rule: 'TY-LONG-CAPS', severity: 'suggestion', category: 'tipografia', line: el.line, snippet: snippet(el), issue: 'Texto corrido em caixa alta perde legibilidade.', fix: 'Caixa alta só em eyebrows e rótulos curtos (com tracking-wider).', autoFix: false });
    }

    // Interações recomendadas por padrão de uso
    if (role === 'tablist') recommended.add('spotlight-tabs');
    if (role === 'menu' || /dropdown|menu/i.test(el.tag)) recommended.add('blur-glide-menu');
    if (/copy|copiar/i.test(el.inner ?? '') && interactive) recommended.add('copy-swap');
  });

  // ——— Contraste (com herança de fundo) ———
  els.forEach((el, idx) => {
    const direct = directText(code, els, idx);
    if (!direct) return;
    const chain = [styles[idx], ...ancestorStyles(els, styles, idx)];
    const text = chain.find((s) => s.text)?.text;
    if (!text) return;
    const size = chain.find((s) => s.sizePx !== undefined)?.sizePx ?? 16;
    const bold = chain.find((s) => s.plain.some((t) => /^font-/.test(t) && /(semibold|bold|extrabold|black|normal|medium|light)$/.test(t)))?.bold ?? false;
    const large = size >= 24 || (size >= 18.66 && bold);
    const min = large ? 3 : 4.5;
    const bgs = chain.map((s) => s.bg).filter((b): b is ThemedColor => !!b);
    const semantic = text.semantic || bgs.some((b) => b.semantic);
    const themes: Polarity[] = semantic ? ['dark', 'light'] : [polarity];
    stats.contrastPairs++;
    for (const theme of themes) {
      const base = parseColor(semantic ? roleHex('stage', theme) : polarity === 'dark' ? '#0A0A0A' : '#FFFFFF')!;
      let bg = base;
      const firstOpaque = bgs.findIndex((b) => b[theme].a >= 1);
      const layers = firstOpaque === -1 ? bgs : bgs.slice(0, firstOpaque + 1);
      for (let k = layers.length - 1; k >= 0; k--) bg = composite(layers[k][theme], bg);
      const presumed = firstOpaque === -1;
      const ratio = contrastRatio(text[theme], bg);
      if (ratio >= min) continue;
      const bgLabel = bgs[0]?.label ?? (presumed ? 'fundo presumido' : '');
      const severity: Severity = ratio < 3 ? (presumed ? 'warning' : 'critical') : presumed ? 'suggestion' : 'warning';
      add({
        rule: 'CT-TEXT',
        severity,
        category: 'contraste',
        line: el.line,
        snippet: direct.slice(0, 60),
        issue: `Contraste ${ratio.toFixed(2)}:1 (text-${text.label} sobre ${bgLabel}${semantic ? `, tema ${theme === 'dark' ? 'escuro' : 'claro'}` : ''}) — mínimo ${min}:1${large ? ' (texto grande)' : ''}.`,
        fix: contrastFix(text.label),
        autoFix: !text.semantic,
      });
      break;
    }
  });

  // Inline style color/background
  els.forEach((el) => {
    const st = getAttr(el, 'style');
    if (!st?.raw) return;
    const fg = /(?:^|[{\s;,])color\s*:\s*['"]?([^;'",}]+)/.exec(st.raw);
    const bg = /background(?:-c|C)?(?:olor)?\s*:\s*['"]?([^;'",}]+)/.exec(st.raw);
    if (!fg || !bg) return;
    const f = parseColor(fg[1].trim());
    const b = parseColor(bg[1].trim());
    if (!f || !b) return;
    stats.contrastPairs++;
    const ratio = contrastRatio(f, b.a < 1 ? composite(b, parseColor('#ffffff')!) : b);
    if (ratio < 4.5)
      add({ rule: 'CT-TEXT', severity: ratio < 3 ? 'critical' : 'warning', category: 'contraste', line: el.line, issue: `Contraste ${ratio.toFixed(2)}:1 em estilo inline (${fg[1].trim()} sobre ${bg[1].trim()}).`, fix: 'Use papéis: rgb(var(--cm-fg)) sobre rgb(var(--cm-surface-1)).', autoFix: false });
  });

  // ——— Regras de cena ———
  // Combinar as cinco cores é identidade. Contraste e hierarquia são avaliados por regras próprias.
  if (stats.literalColors >= 4 && stats.semanticTokens === 0) {
    add({ rule: 'ID-TOKEN-DEBT', severity: 'warning', category: 'identidade', line: 1, issue: `${stats.literalColors} cores literais e nenhum papel semântico — superfícies e textos não acompanham o tema.`, fix: 'Use papéis Caramelo para superfície e leitura; preserve a composição espectral em gradientes.', autoFix: true });
  } else if (stats.literalColors > stats.semanticTokens && stats.literalColors >= 4) {
    add({ rule: 'ID-TOKEN-DEBT', severity: 'suggestion', category: 'identidade', line: 1, issue: `${stats.literalColors} cores literais contra ${stats.semanticTokens} papéis semânticos.`, fix: 'Use papéis para superfícies e leitura; preserve as cores da marca nos gradientes.', autoFix: true });
  }
  const darkVariants = allTokens.filter((t) => t.startsWith('dark:')).length;
  if (darkVariants >= 4) {
    add({ rule: 'ID-DARK-DUPLICATION', severity: 'suggestion', category: 'identidade', line: 1, issue: `${darkVariants} variantes dark: duplicam cada cor.`, fix: 'Papéis semânticos trocam com o tema sozinhos — remova as variantes.', autoFix: true });
  }
  if (h1Count > 1) add({ rule: 'TY-MULTIPLE-H1', severity: 'suggestion', category: 'tipografia', line: 1, issue: `${h1Count} <h1> na mesma tela.`, fix: 'Um h1 por página; seções usam h2.', autoFix: false });
  if (accentCtas > 2 && context !== 'dashboard') {
    add({ rule: 'UX-FOCAL-POINT', severity: 'suggestion', category: 'ux', line: 1, issue: `${accentCtas} botões preenchidos com acento — o ponto focal se dilui.`, fix: 'Um CTA primário por cena (MagneticButton fill); os demais em variante surface/ghost.', autoFix: false });
    recommended.add('magnetic-fill');
  }
  const hasMotion = allTokens.some((t) => /(^|:)(animate-|translate|scale|rotate)/.test(t) || /^transition/.test(parseUtility(t).base));
  const hasReduced = allTokens.some((t) => /^motion-(reduce|safe):/.test(t)) || /prefers-reduced-motion/.test(code);
  if (hasMotion && !hasReduced) {
    add({ rule: 'MO-REDUCED-MOTION', severity: 'warning', category: 'motion', line: 1, issue: 'Movimento sem alternativa para prefers-reduced-motion.', fix: 'motion-reduce:transition-none / motion-reduce:transform-none (ou os componentes Caramelo, que já respeitam).', autoFix: true });
  }
  if (context === 'landing-page') recommended.add('blur-reveal');
  if (accentCtas >= 1 && context === 'landing-page') recommended.add('magnetic-fill');

  // ——— <style> embutido ———
  for (const el of els) if (el.tag === 'style' && el.close !== null) auditCss(code, parseCss(code, el.end, el.close), lines, add, stats, strengths);

  // ——— Pontos fortes ———
  if (stats.semanticTokens > stats.literalColors && stats.semanticTokens > 0) strengths.push(`Usa papéis semânticos (${stats.semanticTokens}) — pronto para tema e cores funcionais.`);
  if (focusIndicators > 0) strengths.push(`${focusIndicators} elemento(s) com indicador de foco visível.`);
  if (hasReduced) strengths.push('Respeita prefers-reduced-motion.');
  if (fieldsTotal > 0 && fieldsLabelled === fieldsTotal) strengths.push('Todos os campos têm rótulo acessível.');
  const carameloComponents = Array.from(new Set(els.map((e) => e.tag).filter((t) => /^(MagneticButton|GlowButton|Surface|SpotlightTabs|GlideMenu|GlideGroup|FocusField|ScrubNumber|CopyButton|CommandCopy|Reveal|TextSwap|ThemeToggle|LayerSplit|DisplayHeading)$/.test(t))));
  if (carameloComponents.length) strengths.push(`Componentes Caramelo em uso: ${carameloComponents.join(', ')}.`);
}

function ancestorStyles(els: ScannedElement[], styles: ElementStyle[], idx: number): ElementStyle[] {
  const out: ElementStyle[] = [];
  for (let p = els[idx].parent; p !== -1; p = els[p].parent) out.push(styles[p]);
  return out;
}

/** Texto que pertence diretamente ao elemento (sem o dos filhos) */
function directText(code: string, els: ScannedElement[], idx: number): string {
  const el = els[idx];
  if (el.inner === null || el.close === null) return '';
  let inner = code.slice(el.end, el.close);
  const children = els
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.parent === idx)
    .map(({ c }) => ({ s: c.start - el.end, e: (c.close !== null ? code.indexOf('>', c.close) + 1 : c.end) - el.end }))
    .sort((a, b) => b.s - a.s);
  for (const ch of children) inner = inner.slice(0, Math.max(0, ch.s)) + ' ' + inner.slice(Math.max(0, ch.e));
  const { text, hasExpression } = visibleText(inner);
  return text || (hasExpression ? '{…}' : '');
}

function contrastFix(textLabel: string): string {
  if (/accent-contrast|on-status|white|cream/.test(textLabel)) return 'Sobre preenchimentos: text-accent-contrast / text-on-status (contraste garantido pelo token).';
  if (/accent|caramel|sky|pink|violet|yellow|blue|orange|indigo|purple/.test(textLabel)) return 'Texto colorido: text-accent-ink (versão segura para texto em cada tema).';
  return 'Texto neutro: text-fg-muted (≥7:1, AAA) ou text-fg-dim (≥4.5:1). fg-faint é só para não-texto.';
}

// ═══════════════════════════════════════════════════════════════════
// CSS
// ═══════════════════════════════════════════════════════════════════

function auditCss(code: string, rules: CssRule[], lines: LineIndex, add: (f: Finding) => void, stats: AuditReport['stats'], strengths: string[]) {
  let hasMotion = false;
  let reduced = false;
  const bases = new Map<string, { line: number; hover: boolean; active: boolean; focus: boolean; field: boolean }>();
  let rootBg: RGB | null = null;

  for (const r of rules) {
    if (r.atRules.some((a) => /prefers-reduced-motion/.test(a))) reduced = true;
    if (/(^|[\s,])(:root|html|body)(?![\w-])/.test(r.selector) && !isDarkBlock(r)) {
      const bgd = r.decls.find((d) => d.prop === 'background' || d.prop === 'background-color');
      const hit = bgd && colorHits(bgd.value)[0];
      if (hit) rootBg = hit.rgb;
    }
  }

  for (const r of rules) {
    const line = lines.lineAt(r.start);
    const sel = r.selector.length > 70 ? r.selector.slice(0, 67) + '…' : r.selector;
    if (r.atRules.some((a) => /keyframes/.test(a))) {
      hasMotion = true;
      continue;
    }
    let fg: RGB | null = null;
    let bg: RGB | null = null;
    for (const d of r.decls) {
      if (d.prop.startsWith('--')) {
        if (/var\(--cm-/.test(d.value)) stats.semanticTokens++;
        continue;
      }
      if (/var\(--cm-|var\(--caramelo-/.test(d.value)) stats.semanticTokens++;
      const kind = colorKindOfProp(d.prop);
      if (kind) stats.literalColors += colorHits(d.value).length;
      if (d.prop === 'color') fg = colorHits(d.value)[0]?.rgb ?? fg;
      if (d.prop === 'background' || d.prop === 'background-color') bg = colorHits(d.value)[0]?.rgb ?? bg;
      if (/^(animation|transform)$/.test(d.prop) || (d.prop.startsWith('transition') && d.value !== 'none')) hasMotion = true;

      if (/^transition(-property)?$/.test(d.prop) && /(^|[\s,])all(?![\w-])/.test(d.value)) {
        add({ rule: 'MO-TRANSITION-ALL', severity: 'warning', category: 'motion', line: lines.lineAt(d.start), snippet: `${sel} { ${d.prop}: ${d.value} }`, issue: '"transition: all" anima layout junto.', fix: 'Liste as propriedades (color, background-color, box-shadow, transform).', autoFix: true });
      }
      if (/^transition(-duration)?$/.test(d.prop)) {
        const ms = Array.from(d.value.matchAll(/([\d.]+)(m?s)\b/g), (m) => (m[2] === 's' ? parseFloat(m[1]) * 1000 : parseFloat(m[1])));
        const control = r.selector.split(',').some((s) => BUTTONISH_RE.test(baseSelector(s)) || FIELDISH_RE.test(baseSelector(s)));
        if (control && ms.length && ms[0] > 400) {
          add({ rule: 'MO-SLOW-CONTROL', severity: 'warning', category: 'motion', line: lines.lineAt(d.start), snippet: sel, issue: `Controle com ${ms[0]}ms de transição (limiar de Doherty: 400ms).`, fix: 'var(--cm-dur-micro) para hover; var(--cm-dur-instant) no press.', autoFix: true });
        }
      }
      if (d.prop === 'outline' && /^(none|0)\b/.test(d.value) && /:focus/.test(r.selector) && !r.decls.some((x) => x.prop === 'box-shadow' || x.prop === 'border-color')) {
        add({ rule: 'A11Y-FOCUS-REMOVED', severity: 'critical', category: 'acessibilidade', line: lines.lineAt(d.start), snippet: sel, issue: 'Foco removido sem substituto.', fix: 'box-shadow: var(--cm-focus-ring).', autoFix: true });
      }
      if (d.prop === 'box-shadow' && /\d+px\s+\d+px\s+[1-9]\d*px/.test(d.value) && !/var\(/.test(d.value) && !/:focus/.test(r.selector)) {
        add({ rule: 'ID-GENERIC-SHADOW', severity: 'suggestion', category: 'identidade', line: lines.lineAt(d.start), snippet: sel, issue: 'Sombra borrada genérica.', fix: 'var(--cm-elev-2) (Lumen) ou var(--caramelo-shadow-md) (Print).', autoFix: true });
      }
      if (d.prop === 'font-size') {
        const m = /^([\d.]+)(px|rem)$/.exec(d.value);
        const px = m ? (m[2] === 'rem' ? parseFloat(m[1]) * 16 : parseFloat(m[1])) : null;
        if (px !== null && px < 12) add({ rule: 'TY-TINY-TEXT', severity: 'warning', category: 'tipografia', line: lines.lineAt(d.start), snippet: sel, issue: `Texto de ${px}px.`, fix: 'Mínimo 12px; 14–16px para leitura.', autoFix: false });
      }
    }
    if (fg && (bg || rootBg)) {
      const back = bg ?? rootBg!;
      const ratio = contrastRatio(fg, back.a < 1 ? composite(back, rootBg ?? parseColor('#ffffff')!) : back);
      stats.contrastPairs++;
      if (ratio < 4.5)
        add({ rule: 'CT-TEXT', severity: ratio < 3 ? (bg ? 'critical' : 'warning') : 'warning', category: 'contraste', line, snippet: sel, issue: `Contraste ${ratio.toFixed(2)}:1 em ${sel}${bg ? '' : ' (sobre o fundo da página)'}.`, fix: 'rgb(var(--cm-fg-muted)) ou papéis de contraste garantido.', autoFix: true });
    }

    for (const raw of r.selector.split(',')) {
      const s = raw.trim();
      const base = baseSelector(s);
      const button = BUTTONISH_RE.test(base);
      const field = FIELDISH_RE.test(base);
      if (!button && !field) continue;
      const info = bases.get(base) ?? { line, hover: false, active: false, focus: false, field: !button };
      const pseudo = s.slice(base.length);
      if (/:hover/.test(pseudo)) info.hover = true;
      if (/:active/.test(pseudo)) info.active = true;
      if (/:focus/.test(pseudo)) info.focus = true;
      bases.set(base, info);
    }
  }

  for (const [base, i] of bases) {
    if (i.field) {
      if (!i.focus) add({ rule: 'IX-FIELD-FOCUS', severity: 'warning', category: 'interacao', line: i.line, snippet: base, issue: 'Campo sem estado de foco próprio.', fix: 'Borda acesa + halo: border-color: rgb(var(--cm-accent) / .7); box-shadow: 0 0 0 3px rgb(var(--cm-accent) / .15).', autoFix: true });
      continue;
    }
    if (!i.hover && !i.active) add({ rule: 'IX-NO-FEEDBACK', severity: 'critical', category: 'interacao', line: i.line, snippet: base, issue: `${base} não responde ao gesto (sem :hover nem :active).`, fix: ':active { transform: scale(.97) } + hover luminoso.', autoFix: true });
    else if (!i.active) add({ rule: 'IX-NO-PRESS', severity: 'warning', category: 'interacao', line: i.line, snippet: base, issue: `${base} sem estado pressionado.`, fix: ':active { transform: scale(.97); transition-duration: var(--cm-dur-instant) }.', autoFix: true });
    if (!i.focus) add({ rule: 'IX-FOCUS-DEFAULT', severity: 'suggestion', category: 'interacao', line: i.line, snippet: base, issue: `${base} sem :focus-visible da marca.`, fix: ':focus-visible { outline: none; box-shadow: var(--cm-focus-ring) }.', autoFix: true });
  }

  if (hasMotion && !reduced && !/prefers-reduced-motion/.test(code)) {
    add({ rule: 'MO-REDUCED-MOTION', severity: 'warning', category: 'motion', line: 1, issue: 'Movimento sem @media (prefers-reduced-motion: reduce).', fix: 'Remova deslocamentos/escala; mantenha só opacidade ≤160ms.', autoFix: true });
  }
  if (reduced) strengths.push('Respeita prefers-reduced-motion.');
  if (stats.literalColors >= 6 && stats.semanticTokens === 0) {
    add({ rule: 'ID-TOKEN-DEBT', severity: 'warning', category: 'identidade', line: 1, issue: `${stats.literalColors} cores literais e nenhuma variável de papel.`, fix: 'Papéis rgb(var(--cm-*)) para superfícies e leitura; preserve o espectro da marca em gradientes.', autoFix: true });
  }
}

// ═══════════════════════════════════════════════════════════════════
// Pontuação
// ═══════════════════════════════════════════════════════════════════

function finalize(
  raw: Finding[],
  strengths: string[],
  stats: AuditReport['stats'],
  context: AuditContext,
  language: 'markup' | 'css',
  recommended: Set<string>
): AuditReport {
  // Deduplica (mesma regra + linha)
  const seen = new Set<string>();
  const findings = raw.filter((f) => {
    const k = `${f.rule}:${f.line}:${f.snippet ?? ''}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const order: Record<Severity, number> = { critical: 0, warning: 1, suggestion: 2 };
  findings.sort((a, b) => order[a.severity] - order[b.severity] || a.line - b.line);

  const perRule = new Map<string, { sev: Severity; count: number; cat: AuditCategory }>();
  for (const f of findings) {
    const k = `${f.rule}|${f.severity}`;
    const cur = perRule.get(k) ?? { sev: f.severity, count: 0, cat: f.category };
    cur.count++;
    perRule.set(k, cur);
  }
  let total = 0;
  const catDeduction = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<AuditCategory, number>;
  perRule.forEach(({ sev, count, cat }) => {
    const d = WEIGHT[sev] * Math.min(count, CAP[sev]);
    total += d;
    catDeduction[cat] += d;
  });
  const score = Math.max(0, Math.round(100 - total));
  const grade: AuditReport['grade'] = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 65 ? 'C' : score >= 50 ? 'D' : 'F';
  const verdict = {
    A: 'Excelente — interface madura, pronta para a identidade Caramelo.',
    B: 'Boa — ajustes pontuais de interação e tokens.',
    C: 'Média — funciona, mas falta física de interação e disciplina de tokens.',
    D: 'Fraca — interface genérica com falhas de acessibilidade.',
    F: 'Crítica — bloqueios de acessibilidade e nenhuma resposta ao gesto.',
  }[grade];

  const categories = Object.fromEntries(
    CATEGORIES.map((c) => [c, { score: Math.max(0, Math.round(100 - catDeduction[c] * 2)), findings: findings.filter((f) => f.category === c).length }])
  ) as AuditReport['categories'];

  const autoFixable = findings.filter((f) => f.autoFix).length;
  const nextSteps: string[] = [];
  if (autoFixable) nextSteps.push(`transform_to_caramelo resolve ${autoFixable} de ${findings.length} achados automaticamente (cores → papéis, foco, press, motion, a11y).`);
  const manual = findings.filter((f) => !f.autoFix && f.severity !== 'suggestion');
  if (manual.length) nextSteps.push(`${manual.length} achado(s) exigem decisão humana (rótulos, estrutura semântica, alvos de toque).`);
  if (recommended.size) nextSteps.push(`Interações recomendadas: ${Array.from(recommended).join(', ')} (get_interaction).`);
  if (!findings.length) nextSteps.push('Nada a corrigir — considere uma microinteração de assinatura no ponto focal (magnetic-fill).');

  return { score, grade, verdict, context, language, categories, findings, strengths, stats, recommendedInteractions: Array.from(recommended), nextSteps };
}
