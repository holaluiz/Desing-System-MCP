/**
 * Transformação — leva qualquer interface (Tailwind/JSX/TSX/HTML/Vue ou CSS de
 * qualquer design system) para a identidade visual e a interatividade Caramelo.
 *
 * Princípios:
 *  - Cores viram PAPÉIS semânticos (não hex): o resultado funciona nos dois temas
 *    e muda a cor funcional de base com data-cm-accent. Gradientes preservam o espectro da marca.
 *  - Só adiciona interação/acessibilidade que esteja FALTANDO — nunca remove intenção.
 *  - Toda mudança é rastreável (linha, antes → depois, motivo).
 */

import { hexToTriplet, type SceneAccent } from '../../tokens/semantic';
import { classify, type AccentStrategy, type Polarity } from './brand';
import { type HueFamily } from './color';
import { analyzeCss, colorHits, colorKindOfProp, parseCss, transformCss } from './css';
import { applyEdits, kindOfClassChange, type Change, type ChangeKind, type Edit } from './edits';
import {
  classLiteralsIn,
  detectLanguage,
  findClassLikeStrings,
  getAttr,
  hasAttr,
  insideTag,
  LineIndex,
  looksLikeClassList,
  scanElements,
  visibleText,
  type ClassLiteral,
  type ScannedElement,
} from './scan';
import {
  familyWeights,
  FIELD_TAGS,
  INTERACTIVE_TAGS,
  literalHex,
  mapClassList,
  electPrimary,
  parseUtility,
  polarityOfLists,
  roleFor,
  splitColorUtility,
  type MapOptions,
  type Material,
} from './tailwind-map';

export interface TransformOptions {
  /** lumen = produto digital (luz, glow, raios concêntricos) · print = editorial (sombra sólida, arestas retas) */
  material?: Material;
  /** Tema-alvo. Omitido = mantém a polaridade da origem */
  theme?: Polarity;
  /** unify = papéis sólidos funcionais · preserve = preserva matizes decorativos. Gradientes combinam as cores nas duas estratégias. */
  strategy?: AccentStrategy;
  /** Caramel por padrão para detalhes sólidos; neutral é explícito. CTAs e gradientes mantêm o espectro combinado. */
  accent?: SceneAccent;
  enhanceInteractions?: boolean;
  fixA11y?: boolean;
}

export interface ManualItem {
  line: number;
  issue: string;
  suggestion: string;
}

export interface TransformReport {
  language: 'markup' | 'css';
  code: string;
  source: {
    polarity: Polarity;
    primaryFamily: HueFamily | null;
    palette: Array<{ family: HueFamily; weight: number; becomes: string }>;
  };
  target: { material: Material; theme: Polarity; accent: SceneAccent; strategy: AccentStrategy };
  changes: Change[];
  summary: Partial<Record<ChangeKind, number>>;
  manual: ManualItem[];
  setup: string[];
}

const CLASS_ATTRS = ['className', 'class', ':class', 'v-bind:class', 'class:list'];
const EXTRA_CLASS_ATTR_RE = /^[a-z]\w*ClassName$/;

const SUBMIT_RE =
  /^(enviar|salvar|entrar|cadastrar|criar|confirmar|continuar|finalizar|assinar|comprar|pagar|concluir|submit|save|send|sign ?in|sign ?up|log ?in|register|create|continue|confirm|subscribe|checkout|pay)\b/i;

const ICON_LABELS: Array<[RegExp, string]> = [
  [/^(x|xicon|x-?mark|close|times|cross)\b|close|xmark/i, 'Fechar'],
  [/search|magnifying/i, 'Buscar'],
  [/menu|hamburger|bars/i, 'Abrir menu'],
  [/trash|delete|bin/i, 'Excluir'],
  [/edit|pencil|pen\b/i, 'Editar'],
  [/plus|add/i, 'Adicionar'],
  [/copy|clipboard/i, 'Copiar'],
  [/settings|cog|gear/i, 'Configurações'],
  [/bell|notification/i, 'Notificações'],
  [/heart|like|star/i, 'Favoritar'],
  [/share/i, 'Compartilhar'],
  [/download/i, 'Baixar'],
  [/upload/i, 'Enviar arquivo'],
  [/chevron-?left|arrow-?left|back/i, 'Voltar'],
  [/chevron-?right|arrow-?right|next/i, 'Avançar'],
  [/chevron-?down|arrow-?down|expand/i, 'Expandir'],
  [/chevron-?up|arrow-?up|collapse/i, 'Recolher'],
  [/more|ellipsis|dots/i, 'Mais opções'],
  [/filter|funnel/i, 'Filtrar'],
  [/sun|moon|theme/i, 'Alternar tema'],
  [/user|avatar|account|profile/i, 'Conta'],
  [/eye/i, 'Mostrar'],
  [/refresh|reload|rotate/i, 'Atualizar'],
  [/play/i, 'Reproduzir'],
  [/pause/i, 'Pausar'],
  [/send|paper-?plane/i, 'Enviar'],
  [/cart|bag/i, 'Carrinho'],
  [/home|house/i, 'Início'],
  [/help|question/i, 'Ajuda'],
  [/info/i, 'Informações'],
  [/mail|envelope/i, 'E-mail'],
  [/calendar/i, 'Calendário'],
  [/log-?out|sign-?out/i, 'Sair'],
];

function guessIconLabel(inner: string | null): string | null {
  if (!inner) return null;
  const names = [
    ...Array.from(inner.matchAll(/<([A-Z][\w.]*)/g), (m) => m[1]),
    ...Array.from(inner.matchAll(/\b(?:fa|bi|icon|lucide|ri|ph|tabler)-([\w-]+)/g), (m) => m[1]),
  ];
  for (const n of names) for (const [re, label] of ICON_LABELS) if (re.test(n)) return label;
  return null;
}

const FAMILY_LABEL: Record<HueFamily, string> = {
  neutral: 'neutro',
  red: 'vermelho',
  orange: 'laranja',
  yellow: 'amarelo',
  green: 'verde',
  blue: 'azul',
  violet: 'violeta',
  pink: 'rosa',
};

export function transform(code: string, options: TransformOptions = {}): TransformReport {
  const material = options.material ?? 'lumen';
  const strategy = options.strategy ?? 'unify';
  const accent = options.accent ?? 'caramel';
  const enhanceInteractions = options.enhanceInteractions ?? true;
  const fixA11y = options.fixA11y ?? true;
  const language = detectLanguage(code);
  const lines = new LineIndex(code);

  const edits: Edit[] = [];
  const changes: Change[] = [];
  const manual: ManualItem[] = [];
  const setup: string[] = [];

  // ——— CSS puro ———
  if (language === 'css') {
    const rules = parseCss(code);
    const analysis = analyzeCss(rules);
    const primaryFamily = electPrimary(analysis.weights, code);
    const theme = options.theme ?? analysis.polarity;
    const opts: MapOptions = { primaryFamily, strategy, material, theme, polarity: analysis.polarity };
    const res = transformCss(code, rules, { ...opts, accent, enhanceInteractions, explicitTheme: !!options.theme }, lines);
    const out = applyEdits(code, res.edits) + res.appended;
    setup.push(...cssSetup(theme, accent, res.changes), ...res.notes);
    return finish('css', out, analysis.polarity, primaryFamily, analysis.weights, { material, theme, accent, strategy }, res.changes, manual, setup, opts);
  }

  // ——— Marcação ———
  const els = scanElements(code, lines);

  interface Source {
    el: number | null;
    lits: ClassLiteral[];
    enhance: boolean;
  }
  const sources: Source[] = [];
  const covered = new Set<number>();

  els.forEach((el, idx) => {
    for (const attr of el.attrs) {
      const isMain = CLASS_ATTRS.includes(attr.name);
      if ((!isMain && !EXTRA_CLASS_ATTR_RE.test(attr.name)) || !attr.raw) continue;
      let lits: ClassLiteral[];
      const isExpression = attr.name.startsWith(':') || attr.name.startsWith('v-bind:');
      if (isExpression && (attr.raw.startsWith('"') || attr.raw.startsWith("'"))) {
        // Vue :class="[…]" — o valor é JS: só os literais de string internos são classes
        lits = classLiteralsIn(code, attr.valueStart + 1, attr.valueEnd - 1).filter((l) => looksLikeClassList(l.value));
      } else if (attr.raw.startsWith('"') || attr.raw.startsWith("'")) {
        lits = [{ start: attr.valueStart + 1, end: attr.valueEnd - 1, value: attr.value ?? '' }];
      } else {
        lits = classLiteralsIn(code, attr.valueStart, attr.valueEnd).filter((l) => looksLikeClassList(l.value));
      }
      lits.forEach((l) => covered.add(l.start));
      if (lits.length) sources.push({ el: isMain ? idx : null, lits, enhance: isMain });
    }
  });
  for (const lit of findClassLikeStrings(code)) {
    if (covered.has(lit.start)) continue;
    const t = lit.value.split(/\s+/);
    const buttonBase = t.includes('inline-flex') && t.includes('items-center') && t.includes('justify-center');
    sources.push({ el: null, lits: [lit], enhance: buttonBase });
  }

  // ——— Análise da origem ———
  const allTokens: string[] = [];
  const tokenLists: string[][] = [];
  const interactiveTokens = new Set<string>();
  for (const s of sources) {
    const toks = s.lits.flatMap((l) => l.value.trim().split(/\s+/).filter(Boolean));
    allTokens.push(...toks);
    tokenLists.push(toks);
    const el = s.el !== null ? els[s.el] : null;
    if ((el && (INTERACTIVE_TAGS.has(el.tag) || getAttr(el, 'role')?.value === 'button')) || (!el && s.enhance)) toks.forEach((t) => interactiveTokens.add(t));
  }
  const weights = familyWeights(allTokens, interactiveTokens);

  const styleBlocks = els.filter((e) => e.tag === 'style' && e.close !== null);
  const blockRules = styleBlocks.map((e) => parseCss(code, e.end, e.close!));
  const cssAnalysis = blockRules.length ? analyzeCss(blockRules.flat()) : null;
  cssAnalysis?.weights.forEach((w, f) => weights.set(f, (weights.get(f) ?? 0) + w));
  for (const el of els) {
    const style = getAttr(el, 'style');
    if (!style?.raw) continue;
    for (const h of colorHits(style.raw)) {
      const fam = classify(h.rgb).family;
      if (fam !== 'neutral') weights.set(fam, (weights.get(fam) ?? 0) + 1);
    }
  }

  const hasNeutralTokens = allTokens.some((t) => {
    const cu = splitColorUtility(parseUtility(t).base);
    return cu && cu.family === 'neutral' && (cu.kind === 'bg' || cu.kind === 'text');
  });
  const polarity: Polarity = hasNeutralTokens ? polarityOfLists(tokenLists) : cssAnalysis?.polarity ?? polarityOfLists(tokenLists);
  const primaryFamily = electPrimary(weights, code);
  const theme = options.theme ?? polarity;
  const opts: MapOptions = { primaryFamily, strategy, material, theme, polarity };

  // ——— Estilos inline (também informam o preenchimento que prevalece no CTA) ———
  const inlineFills = new Map<number, 'accent' | 'status'>();
  els.forEach((el, idx) => {
    const style = getAttr(el, 'style');
    if (!style?.raw) return;
    const interactive = INTERACTIVE_TAGS.has(el.tag) || getAttr(el, 'role')?.value === 'button';
    const fill = inlineStyleEdits(style.valueStart, style.raw, opts, lines, edits, changes, interactive);
    if (fill) inlineFills.set(idx, fill);
    if (!interactive || fill !== 'accent' || material !== 'lumen' || sources.some((s) => s.el === idx)) return;
    const classAttr = getAttr(el, 'className', 'class', ':class', 'v-bind:class', 'class:list');
    if (classAttr) {
      manual.push({ line: el.line, issue: 'CTA com preenchimento inline e classe dinâmica não editável com segurança.', suggestion: 'Adicione cm-brand-action à classe do controle para combinar o espectro.' });
    } else {
      const attr = style.raw.startsWith('{') ? 'className' : 'class';
      const at = el.start + 1 + el.tag.length;
      edits.push({ start: at, end: at, text: ` ${attr}="cm-brand-action"` });
      changes.push({ line: el.line, kind: 'color', from: `<${el.tag}>`, to: '+ cm-brand-action', reason: 'CTA inline → camada combinada das cinco cores sobre base neutra' });
    }
  });

  // ——— Classes ———
  for (const s of sources) {
    const el = s.el !== null ? els[s.el] : null;
    const info = el
      ? { tag: el.tag, role: getAttr(el, 'role')?.value ?? null, inputType: getAttr(el, 'type')?.value ?? null, fill: inlineFills.get(s.el!) }
      : s.enhance
        ? { tag: 'button', loose: true }
        : undefined;
    const context = s.lits.length > 1 ? s.lits.flatMap((l) => l.value.trim().split(/\s+/).filter(Boolean)) : undefined;
    s.lits.forEach((lit, i) => {
      const res = mapClassList(lit.value, opts, info, s.enhance && enhanceInteractions && i === 0, context);
      if (res.value === lit.value) return;
      edits.push({ start: lit.start, end: lit.end, text: res.value });
      const line = lines.lineAt(lit.start);
      for (const c of res.changes) changes.push({ line, kind: kindOfClassChange(c.from, c.to, c.reason), ...c });
    });
  }

  // ——— Blocos <style> ———
  styleBlocks.forEach((el, i) => {
    const res = transformCss(code, blockRules[i], { ...opts, accent, enhanceInteractions, explicitTheme: !!options.theme }, lines);
    edits.push(...res.edits);
    changes.push(...res.changes);
    if (res.appended) edits.push({ start: el.close!, end: el.close!, text: res.appended.replace(/\n$/, '\n') });
  });

  // ——— Acessibilidade ———
  if (fixA11y) a11yPass(els, edits, changes, manual);
  else manual.push(...a11yManualOnly(els));

  const out = applyEdits(code, edits);
  setup.push(...markupSetup(theme, accent, material, changes, !!styleBlocks.length));
  return finish('markup', out, polarity, primaryFamily, weights, { material, theme, accent, strategy }, changes, manual, setup, opts);
}

function finish(
  language: 'markup' | 'css',
  code: string,
  polarity: Polarity,
  primaryFamily: HueFamily | null,
  weights: Map<HueFamily, number>,
  target: TransformReport['target'],
  changes: Change[],
  manual: ManualItem[],
  setup: string[],
  opts: MapOptions
): TransformReport {
  const summary: Partial<Record<ChangeKind, number>> = {};
  for (const c of changes) summary[c.kind] = (summary[c.kind] ?? 0) + 1;
  const palette = Array.from(weights.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([family, weight]) => {
      const r = family === 'neutral' ? null : roleFor('bg', family, 500, opts);
      const becomes = !r ? 'papéis neutros' : r.role ?? `tinta ${r.literal}`;
      return { family, weight: +weight.toFixed(1), becomes: `${FAMILY_LABEL[family]} → ${becomes}` };
    });
  changes.sort((a, b) => a.line - b.line);
  manual.sort((a, b) => a.line - b.line);
  return { language, code, source: { polarity, primaryFamily, palette }, target, changes, summary, manual, setup };
}

// ——— Inline styles (JSX objeto ou HTML string) ———
const camelToKebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

function inlineStyleEdits(base: number, raw: string, opts: MapOptions, lines: LineIndex, edits: Edit[], changes: Change[], interactive = false) {
  const pairs: Array<{ prop: string; vStart: number; value: string }> = [];
  if (raw.startsWith('{')) {
    for (const m of raw.matchAll(/([A-Za-z]+)\s*:\s*(['"`])([^'"`]*)\2/g)) {
      pairs.push({ prop: camelToKebab(m[1]), vStart: m.index! + m[0].length - m[3].length - 1, value: m[3] });
    }
  } else {
    const inner = raw.slice(1, -1);
    for (const m of inner.matchAll(/([a-z-]+)\s*:\s*([^;]+)/g)) pairs.push({ prop: m[1], vStart: 1 + m.index! + m[0].length - m[2].length, value: m[2] });
  }
  // preenchimento cromático no próprio elemento → texto vira contraste garantido
  let fill: 'accent' | 'status' | null = null;
  for (const p of pairs) {
    if (p.prop !== 'background' && p.prop !== 'background-color' && p.prop !== 'background-image') continue;
    for (const h of colorHits(p.value)) {
      const c = classify(h.rgb);
      const n = c.shade === 'white' ? 0 : c.shade === 'black' ? 1000 : c.shade;
      if (c.family === 'neutral' || n <= 200 || n >= 900) continue;
      const r = roleFor(/gradient\(/i.test(p.value) ? 'gradient' : 'bg', c.family, c.shade, opts);
      fill = r.role === 'accent' || r.literal ? 'accent' : 'status';
    }
  }
  for (const p of pairs) {
    const kind = colorKindOfProp(p.prop);
    if (!kind) continue;
    const isGradient = /gradient\(/i.test(p.value);
    for (const h of colorHits(p.value, kind !== 'shadow')) {
      const c = classify(h.rgb);
      if (kind === 'shadow' && c.family === 'neutral') continue;
      const r = roleFor(isGradient ? 'gradient' : kind, c.family, c.shade, opts, { fill: kind === 'text' ? fill : null });
      const alpha = h.rgb.a < 1 ? ` / ${+h.rgb.a.toFixed(2)}` : '';
      const literal = r.literal ? literalHex(r.literal) : '';
      const brandBackground = interactive && opts.material === 'lumen' && fill === 'accent' && p.prop === 'background' && !isGradient && r.role === 'accent';
      const text = brandBackground ? 'var(--cm-spectrum-soft)' : r.role ? `rgb(var(--cm-${r.role})${alpha})` : alpha ? `rgb(${hexToTriplet(literal)}${alpha})` : literal;
      const start = base + p.vStart + h.start;
      edits.push({ start, end: start + h.text.length, text });
      changes.push({ line: lines.lineAt(start), kind: 'color', from: `${p.prop}: ${h.text}`, to: `${p.prop}: ${text}`, reason: isGradient ? 'gradiente inline → cores combinadas da marca' : 'cor inline → papel semântico' });
    }
  }
  return fill;
}

// ——— Acessibilidade ———
function isLabelled(els: ScannedElement[], idx: number): boolean {
  const el = els[idx];
  if (hasAttr(el, 'aria-label', 'aria-labelledby', 'title', 'label')) return true;
  if (insideTag(els, idx, 'label')) return true;
  const id = getAttr(el, 'id')?.value;
  return !!id && els.some((e) => e.tag === 'label' && (getAttr(e, 'htmlFor')?.value === id || getAttr(e, 'for')?.value === id));
}

const isIconOnly = (el: ScannedElement) => {
  if (el.inner === null) return false;
  const { text, hasExpression } = visibleText(el.inner);
  return !text && !hasExpression && /<(svg|img|i|[A-Z])/.test(el.inner);
};

function a11yPass(els: ScannedElement[], edits: Edit[], changes: Change[], manual: ManualItem[]) {
  els.forEach((el, idx) => {
    const insertAt = el.start + 1 + el.tag.length;
    const add = (attr: string, reason: string) => {
      edits.push({ start: insertAt, end: insertAt, text: ` ${attr}` });
      changes.push({ line: el.line, kind: 'a11y', from: `<${el.tag}>`, to: `+ ${attr}`, reason });
    };
    const lower = el.tag.toLowerCase();

    if (el.tag === 'button' && !hasAttr(el, 'type')) {
      if (insideTag(els, idx, 'form')) {
        if (SUBMIT_RE.test(visibleText(el.inner).text)) add('type="submit"', 'envio explícito do formulário');
        else manual.push({ line: el.line, issue: 'Botão sem type dentro de <form> vira "submit" por padrão.', suggestion: 'Use type="button" se ele não envia o formulário.' });
      } else add('type="button"', 'evita submit acidental quando o componente for usado dentro de um <form>');
    }

    if (lower === 'img' && !hasAttr(el, 'alt')) {
      add('alt=""', 'imagem sem alt (leitor de tela lia o nome do arquivo)');
      manual.push({ line: el.line, issue: 'alt="" foi adicionado (imagem tratada como decorativa).', suggestion: 'Se a imagem informa algo, descreva-a no alt.' });
    }

    if (lower === 'a' && getAttr(el, 'target')?.value === '_blank' && !hasAttr(el, 'rel')) add('rel="noopener noreferrer"', 'nova aba sem rel expõe window.opener');

    const interactive = el.tag === 'button' || el.tag === 'Button' || lower === 'a' || el.tag === 'Link' || getAttr(el, 'role')?.value === 'button';
    if (interactive && !hasAttr(el, 'aria-label', 'aria-labelledby', 'title') && isIconOnly(el)) {
      const guess = guessIconLabel(el.inner);
      if (guess) {
        add(`aria-label="${guess}"`, 'botão só com ícone precisa de nome acessível');
        manual.push({ line: el.line, issue: `aria-label="${guess}" inferido pelo ícone.`, suggestion: 'Confirme se o rótulo descreve a ação real.' });
      } else manual.push({ line: el.line, issue: 'Controle só com ícone, sem nome acessível.', suggestion: 'Adicione aria-label descrevendo a ação.' });
    }

    if (FIELD_TAGS.has(el.tag) && !/^(hidden|submit|button|image|reset)$/.test(getAttr(el, 'type')?.value ?? '') && !isLabelled(els, idx)) {
      const ph = getAttr(el, 'placeholder')?.value;
      if (ph) {
        add(`aria-label="${ph.replace(/"/g, '&quot;')}"`, 'campo sem rótulo (placeholder some ao digitar)');
        manual.push({ line: el.line, issue: 'Campo rotulado só via aria-label (placeholder).', suggestion: 'Prefira um <label> visível — ou FocusField, que mantém o rótulo flutuando.' });
      } else manual.push({ line: el.line, issue: 'Campo de formulário sem rótulo.', suggestion: 'Associe um <label htmlFor> ou use FocusField.' });
    }

    manual.push(...elementManual(el));
  });
}

function elementManual(el: ScannedElement): ManualItem[] {
  const out: ManualItem[] = [];
  const lower = el.tag.toLowerCase();
  if ((lower === 'div' || lower === 'span' || lower === 'li') && hasAttr(el, 'onClick', 'onclick', '@click', 'v-on:click') && !hasAttr(el, 'role')) {
    out.push({ line: el.line, issue: `<${el.tag}> clicável não é alcançável por teclado nem anunciado como botão.`, suggestion: 'Troque por <button type="button"> (ou um <a href> se navega).' });
  }
  if (lower === 'a' && !hasAttr(el, 'href') && hasAttr(el, 'onClick', 'onclick', '@click')) {
    out.push({ line: el.line, issue: '<a> sem href não recebe foco por teclado.', suggestion: 'Ação → <button type="button">; navegação → href real.' });
  }
  const href = getAttr(el, 'href')?.value;
  if (lower === 'a' && (href === '#' || href === '')) out.push({ line: el.line, issue: 'Link de placeholder (href="#").', suggestion: 'Aponte para o destino real ou use <button>.' });
  const tab = getAttr(el, 'tabIndex', 'tabindex');
  const tabN = Number((tab?.raw ?? '').replace(/[{}"']/g, ''));
  if (tab && tabN > 0) out.push({ line: el.line, issue: `tabIndex=${tabN} quebra a ordem natural de foco.`, suggestion: 'Use 0 (ou reordene o DOM).' });
  return out;
}

function a11yManualOnly(els: ScannedElement[]): ManualItem[] {
  return els.flatMap(elementManual);
}

// ——— Instruções de setup ———
function markupSetup(theme: Polarity, accent: SceneAccent, material: Material, changes: Change[], hasCss: boolean): string[] {
  const out = [
    "Tailwind: `presets: [carameloPreset]` em tailwind.config (import { carameloPreset } from '@caramelo/design-system/tailwind').",
    "Estilos: `import '@caramelo/design-system/styles.css'` uma vez na raiz do app (variáveis --cm-*, Lumen e motion).",
  ];
  if (theme === 'light') out.push('Tema claro editorial: `data-caramelo-theme="light"` no <html> (ou no contêiner da cena).');
  else out.push('Tema escuro cinematográfico é o padrão — nada a configurar. Para alternar, use <ThemeToggle />.');
  out.push('Caramel #FF701A destaca detalhes sólidos; cm-brand-action e os gradientes combinam as cinco cores na assinatura e no motion.');
  if (accent !== 'caramel') out.push(`Cor dos detalhes: \`data-cm-accent="${accent}"\` no contêiner — afeta papéis sólidos; CTAs e gradientes continuam com o espectro combinado.`);
  if (changes.some((c) => c.reason.includes('dark: removida'))) out.push('Variantes dark: removidas — os papéis semânticos já trocam com o tema.');
  if (material === 'lumen') out.push('Para o ponto focal da cena, troque o CTA principal por <MagneticButton variant="accent" fill> ou <GlowButton> (get_interaction: magnetic-fill / edge-glow).');
  else out.push('Material Print: use <Button> e <LayerSplit> do pacote para a física de clique completa (get_interaction: press-physics).');
  if (hasCss) out.push('Blocos <style> também foram convertidos para rgb(var(--cm-*)).');
  return out;
}

function cssSetup(theme: Polarity, accent: SceneAccent, changes: Change[]): string[] {
  const out = ["Carregue `@caramelo/design-system/styles.css` antes desta folha (define --cm-*, --caramelo-font-* e motion)."];
  if (changes.some((c) => c.kind === 'theme')) out.push('Variáveis de tema mantiveram o formato original (ex.: triplets HSL do shadcn) — componentes existentes não precisam mudar.');
  if (theme === 'light') out.push('Tema claro: `data-caramelo-theme="light"` no <html> para os papéis --cm-* acompanharem.');
  if (accent !== 'caramel') out.push(`Cor dos detalhes: \`data-cm-accent="${accent}"\` no contêiner. Gradientes mantêm o espectro combinado.`);
  return out;
}
