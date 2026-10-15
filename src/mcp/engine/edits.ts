/**
 * Edições pontuais sobre o código-fonte + registro de mudanças com linha.
 * Todas as transformações do motor produzem Edits; aplicamos de trás para frente
 * para que as posições continuem válidas.
 */

export interface Edit {
  start: number;
  end: number;
  text: string;
}

export type ChangeKind = 'color' | 'shadow' | 'radius' | 'motion' | 'type' | 'interaction' | 'a11y' | 'theme' | 'cleanup';

export interface Change {
  line: number;
  kind: ChangeKind;
  from: string;
  to: string;
  reason: string;
}

export function applyEdits(code: string, edits: Edit[]): string {
  const sorted = [...edits].sort((a, b) => b.start - a.start || b.end - a.end);
  let out = code;
  let floor = Infinity;
  for (const e of sorted) {
    if (e.end > floor) continue; // sobreposição: a edição mais à direita vence
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
    floor = e.start;
  }
  return out;
}

/** Classifica uma mudança de classe Tailwind para o resumo do relatório */
export function kindOfClassChange(from: string, to: string, reason: string): ChangeKind {
  if (from.startsWith('<')) return 'interaction';
  if (to === '∅') return 'cleanup';
  const base = from.split(':').pop() ?? from;
  if (/^-?shadow/.test(base) || /^!?shadow/.test(base)) return /cor|papel|tinta/.test(reason) ? 'color' : 'shadow';
  if (/^rounded/.test(base)) return 'radius';
  if (/^(transition|duration|ease|delay|animate)/.test(base)) return 'motion';
  if (/^font-/.test(base)) return 'type';
  return 'color';
}
