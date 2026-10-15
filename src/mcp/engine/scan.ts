/**
 * Scanner tolerante de JSX/TSX/HTML — encontra elementos, atributos e listas de classes
 * sem depender de um parser completo (o código recebido pode estar incompleto).
 */

export interface ScannedAttr {
  name: string;
  /** Texto bruto do valor, incluindo aspas/chaves */
  raw: string | null;
  /** Valor estático quando for string literal */
  value: string | null;
  start: number;
  end: number;
  valueStart: number;
  valueEnd: number;
}

export interface ScannedElement {
  tag: string;
  start: number;
  end: number;
  selfClosing: boolean;
  attrs: ScannedAttr[];
  line: number;
  /** Conteúdo entre <tag> e </tag> (quando encontrado) */
  inner: string | null;
  /** Índice do elemento pai (-1 = raiz do trecho) */
  parent: number;
  /** Posição do fechamento </tag> (null = não encontrado/void) */
  close: number | null;
}

export class LineIndex {
  private offsets: number[] = [0];
  constructor(code: string) {
    for (let i = 0; i < code.length; i++) if (code[i] === '\n') this.offsets.push(i + 1);
  }
  lineAt(index: number): number {
    let lo = 0;
    let hi = this.offsets.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.offsets[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  }
}

export function skipString(code: string, start: number): number {
  const q = code[start];
  for (let k = start + 1; k < code.length; k++) {
    const c = code[k];
    if (c === '\\') {
      k++;
      continue;
    }
    if (q === '`' && c === '$' && code[k + 1] === '{') {
      k = skipBalanced(code, k + 1) - 1;
      continue;
    }
    if (c === q) return k;
    if (q !== '`' && c === '\n') return k; // string quebrada: para na linha
  }
  return code.length - 1;
}

export function skipBalanced(code: string, start: number): number {
  let depth = 0;
  for (let k = start; k < code.length; k++) {
    const c = code[k];
    if (c === '"' || c === "'" || c === '`') {
      k = skipString(code, k);
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return k + 1;
    }
  }
  return code.length;
}

const TAG_RE = /^<([A-Za-z][\w.:-]*)/;
const VOID = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'area', 'col', 'embed', 'track', 'wbr']);

export function scanElements(code: string, lines = new LineIndex(code)): ScannedElement[] {
  const out: ScannedElement[] = [];
  let i = 0;
  while ((i = code.indexOf('<', i)) !== -1) {
    const m = TAG_RE.exec(code.slice(i, i + 80));
    const prev = code[i - 1];
    // Ignora genéricos TS (useState<string>) e comparações (a<b)
    if (!m || (prev && /[\w$)\]]/.test(prev))) {
      i++;
      continue;
    }
    const tag = m[1];
    let j = i + m[0].length;
    const attrs: ScannedAttr[] = [];
    let selfClosing = false;
    let closed = false;
    while (j < code.length) {
      const c = code[j];
      if (/\s/.test(c)) {
        j++;
        continue;
      }
      if (c === '>') {
        j++;
        closed = true;
        break;
      }
      if (c === '/' && code[j + 1] === '>') {
        j += 2;
        selfClosing = true;
        closed = true;
        break;
      }
      if (c === '{') {
        j = skipBalanced(code, j); // {...spread}
        continue;
      }
      const nameMatch = /^[^\s=>/{}"'`]+/.exec(code.slice(j, j + 120));
      if (!nameMatch) {
        j++;
        continue;
      }
      const name = nameMatch[0];
      const aStart = j;
      j += name.length;
      while (/\s/.test(code[j] ?? '')) j++;
      let raw: string | null = null;
      let value: string | null = null;
      let vs = j;
      let ve = j;
      if (code[j] === '=') {
        j++;
        while (/\s/.test(code[j] ?? '')) j++;
        vs = j;
        const q = code[j];
        if (q === '"' || q === "'") {
          ve = skipString(code, j) + 1;
          value = code.slice(j + 1, ve - 1);
        } else if (q === '{') {
          ve = skipBalanced(code, j);
          const inner = code.slice(j + 1, ve - 1).trim();
          const lit = /^(["'`])([^"'`$]*)\1$/.exec(inner);
          if (lit) value = lit[2];
        } else {
          const um = /^[^\s>]+/.exec(code.slice(j));
          ve = j + (um ? um[0].length : 0);
          value = um ? um[0] : '';
        }
        raw = code.slice(vs, ve);
        j = ve;
      }
      attrs.push({ name, raw, value, start: aStart, end: j, valueStart: vs, valueEnd: ve });
    }
    if (!closed) break;

    out.push({ tag, start: i, end: j, selfClosing, attrs, line: lines.lineAt(i), inner: null, parent: -1, close: null });
    i = j;
  }
  linkTree(code, out);
  return out;
}

const isContainer = (el: ScannedElement) => !el.selfClosing && !VOID.has(el.tag.toLowerCase());

/**
 * Liga cada elemento ao pai e ao seu fechamento real (pilha de tags),
 * tolerando tags não fechadas — necessário para herdar fundo/cor do ancestral.
 */
function linkTree(code: string, els: ScannedElement[]): void {
  type Ev = { pos: number; open?: number; closeTag?: string };
  const events: Ev[] = els.map((_, idx) => ({ pos: els[idx].start, open: idx }));
  const re = /<\/([A-Za-z][\w.:-]*)\s*>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) events.push({ pos: m.index, closeTag: m[1] });
  events.sort((a, b) => a.pos - b.pos);

  const stack: number[] = [];
  for (const ev of events) {
    if (ev.open !== undefined) {
      const el = els[ev.open];
      el.parent = stack.length ? stack[stack.length - 1] : -1;
      if (isContainer(el)) stack.push(ev.open);
      continue;
    }
    for (let k = stack.length - 1; k >= 0; k--) {
      const el = els[stack[k]];
      if (el.tag !== ev.closeTag) continue;
      el.close = ev.pos;
      el.inner = code.slice(el.end, ev.pos);
      stack.length = k;
      break;
    }
  }
}

/** Ancestrais do elemento, do pai até a raiz */
export function ancestors(els: ScannedElement[], idx: number): ScannedElement[] {
  const out: ScannedElement[] = [];
  for (let p = els[idx].parent; p !== -1; p = els[p].parent) out.push(els[p]);
  return out;
}

/** O elemento está dentro de um ancestral com esta tag? */
export function insideTag(els: ScannedElement[], idx: number, tag: string): boolean {
  return ancestors(els, idx).some((a) => a.tag === tag);
}

export function getAttr(el: ScannedElement, ...names: string[]): ScannedAttr | undefined {
  return el.attrs.find((a) => names.includes(a.name));
}

export function hasAttr(el: ScannedElement, ...names: string[]): boolean {
  return el.attrs.some((a) => names.includes(a.name));
}

/** Texto visível aproximado do conteúdo interno (sem tags, sem expressões de ícone) */
export function visibleText(inner: string | null): { text: string; hasExpression: boolean } {
  if (!inner) return { text: '', hasExpression: false };
  const noTags = inner.replace(/<[^>]*>/g, ' ');
  const hasExpression = /\{[^}]*[A-Za-z_$][^}]*\}/.test(noTags.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, ''));
  const text = noTags.replace(/\{[^}]*\}/g, ' ').replace(/\s+/g, ' ').trim();
  return { text, hasExpression };
}

export interface ClassLiteral {
  /** Posição do conteúdo (sem aspas) */
  start: number;
  end: number;
  value: string;
}

/** Extrai literais de string com classes dentro de um valor de atributo className={…} */
export function classLiteralsIn(code: string, start: number, end: number): ClassLiteral[] {
  const out: ClassLiteral[] = [];
  for (let k = start; k < end; k++) {
    const c = code[k];
    if (c === '"' || c === "'") {
      const close = skipString(code, k);
      out.push({ start: k + 1, end: close, value: code.slice(k + 1, close) });
      k = close;
    } else if (c === '`') {
      const close = skipString(code, k);
      // pedaços estáticos entre ${…}
      let s = k + 1;
      for (let t = k + 1; t < close; t++) {
        if (code[t] === '$' && code[t + 1] === '{') {
          if (t > s) out.push({ start: s, end: t, value: code.slice(s, t) });
          t = skipBalanced(code, t + 1) - 1;
          s = t + 1;
        }
      }
      if (close > s) out.push({ start: s, end: close, value: code.slice(s, close) });
      k = close;
    }
  }
  return out;
}

const UTILITY_RE =
  /^(?:[a-z0-9-]+(?:-\[[^\]]+\])?:|\[[^\]]+\]:)*!?-?(?:bg|text|border|rounded|shadow|p[xytrbl]?|m[xytrbl]?|w|h|size|min-w|max-w|min-h|max-h|flex|grid|gap|space-[xy]|items|justify|font|leading|tracking|ring|outline|opacity|transition|duration|ease|delay|animate|z|top|left|right|bottom|inset|overflow|cursor|select|pointer-events|translate-[xy]|scale|rotate|col|row|place|self|content|order|object|aspect|fill|stroke|from|via|to|divide|backdrop|blur|hidden|block|inline|absolute|relative|fixed|sticky|uppercase|lowercase|capitalize|truncate|underline|italic|sr-only|container|shrink|grow|basis|whitespace|break|line-clamp|decoration|placeholder|caret|accent|appearance|resize|visible|invisible|isolate|mix-blend|filter|drop-shadow|antialiased|tabular-nums)(?:-|$|\[)/;

export function isUtility(token: string): boolean {
  return UTILITY_RE.test(token);
}

/** Uma string "parece" lista de classes Tailwind? */
export function looksLikeClassList(value: string): boolean {
  if (!value.trim() || /[{};=<\n]/.test(value.replace(/\[[^\]]*\]/g, ''))) return false;
  const tokens = value.trim().split(/\s+/);
  const util = tokens.filter(isUtility).length;
  return util >= 1 && util / tokens.length >= 0.6;
}

/** Todos os literais de string do código que parecem listas de classes (cva, cn, objetos de variantes) */
export function findClassLikeStrings(code: string): ClassLiteral[] {
  const out: ClassLiteral[] = [];
  for (let k = 0; k < code.length; k++) {
    const c = code[k];
    // pula comentários
    if (c === '/' && code[k + 1] === '/') {
      const nl = code.indexOf('\n', k);
      k = nl === -1 ? code.length : nl;
      continue;
    }
    if (c === '/' && code[k + 1] === '*') {
      const endC = code.indexOf('*/', k + 2);
      k = endC === -1 ? code.length : endC + 1;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const lits = classLiteralsIn(code, k, skipString(code, k) + 1);
      for (const lit of lits) if (looksLikeClassList(lit.value)) out.push(lit);
      k = skipString(code, k);
    }
  }
  return out;
}

/** Detecta o tipo de entrada */
export function detectLanguage(code: string): 'css' | 'markup' {
  const hasMarkup = /<[A-Za-z][\w.-]*[\s>/]/.test(code);
  const hasRules = code.includes('{') && /[\w-]+\s*:\s*[^;{}\n]+;/.test(code);
  return !hasMarkup && hasRules ? 'css' : 'markup';
}
