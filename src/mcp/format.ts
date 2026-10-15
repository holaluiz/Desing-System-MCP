/**
 * Relatórios em Markdown para os clientes MCP — curtos no topo (veredito, números),
 * detalhados embaixo (código, mudanças por linha, decisões humanas, setup).
 */

import type { AuditReport, Finding } from './engine/audit';
import type { ChangeKind } from './engine/edits';
import type { TransformReport } from './engine/transform';

const KIND_LABEL: Record<ChangeKind, string> = {
  color: 'Cores → papéis semânticos',
  theme: 'Variáveis de tema',
  shadow: 'Sombras → elevação',
  radius: 'Raios',
  motion: 'Motion (tempo/curva)',
  type: 'Tipografia (3 vozes)',
  interaction: 'Reforços de interação',
  a11y: 'Acessibilidade',
  cleanup: 'Limpeza (variantes dark:)',
};

const SEV_LABEL = { critical: 'Críticos', warning: 'Avisos', suggestion: 'Sugestões' } as const;

const code = (s: string) => '`' + s.replace(/`/g, 'ˋ') + '`';

export function fenceLang(report: { language: 'markup' | 'css' }, src: string): string {
  if (report.language === 'css') return 'css';
  return /className=|import\s|export\s/.test(src) ? 'tsx' : 'html';
}

export function renderAudit(r: AuditReport): string {
  const out: string[] = [];
  out.push(`## Auditoria UX/UI Caramelo — ${r.score}/100 (${r.grade})`);
  out.push(`_${r.verdict}_  ·  contexto: ${r.context}`);
  out.push('');
  out.push('| Categoria | Nota | Achados |');
  out.push('|---|---:|---:|');
  for (const [cat, v] of Object.entries(r.categories)) out.push(`| ${cat} | ${v.score} | ${v.findings} |`);
  out.push('');
  out.push(
    `Medido: ${r.stats.elements} elementos · ${r.stats.interactive} interativos · ${r.stats.contrastPairs} pares de contraste · ${r.stats.literalColors} cores literais · ${r.stats.semanticTokens} papéis semânticos.`
  );

  for (const sev of ['critical', 'warning', 'suggestion'] as const) {
    const list = r.findings.filter((f) => f.severity === sev);
    if (!list.length) continue;
    out.push('', `### ${SEV_LABEL[sev]} (${list.length})`);
    for (const f of list.slice(0, 30)) out.push(findingLine(f));
    if (list.length > 30) out.push(`- … mais ${list.length - 30}`);
  }
  if (r.strengths.length) out.push('', '### Pontos fortes', ...r.strengths.map((s) => `- ${s}`));
  if (r.nextSteps.length) out.push('', '### Próximos passos', ...r.nextSteps.map((s) => `- ${s}`));
  return out.join('\n');
}

function findingLine(f: Finding): string {
  const where = f.line > 1 || f.snippet ? `L${f.line}` : 'cena';
  const snip = f.snippet ? ` ${code(f.snippet.length > 60 ? f.snippet.slice(0, 57) + '…' : f.snippet)}` : '';
  return `- **${where} · ${f.rule}**${snip} — ${f.issue} → ${f.fix}${f.autoFix ? ' _(auto)_' : ''}`;
}

export function renderTransform(t: TransformReport, original: string, before?: AuditReport, after?: AuditReport): string {
  const out: string[] = [];
  const themeLabel = t.target.theme === 'dark' ? 'tema escuro' : 'tema claro';
  out.push(`## Transformação Caramelo · ${t.target.material === 'lumen' ? 'Lumen' : 'Print'} · ${themeLabel} · base funcional ${t.target.accent}`);
  if (before && after) {
    const delta = after.score - before.score;
    out.push(`**Auditoria:** ${before.score}/${before.grade} → **${after.score}/${after.grade}** (${delta >= 0 ? '+' : ''}${delta})`);
  }
  const primary = t.source.palette[0];
  out.push(
    `**Origem:** design ${t.source.polarity === 'dark' ? 'escuro' : 'claro'}${primary ? ` · ${t.source.palette.map((p) => p.becomes).join(' · ')}` : ' · sem cor cromática'} · estratégia ${t.target.strategy}`
  );
  const kinds = Object.entries(t.summary).filter(([, n]) => n);
  if (kinds.length) {
    out.push('', '| Mudança | Qtde |', '|---|---:|');
    for (const [k, n] of kinds) out.push(`| ${KIND_LABEL[k as ChangeKind]} | ${n} |`);
  } else out.push('', '_Nada a mudar — o código já fala a língua Caramelo._');

  out.push('', '### Código', '```' + fenceLang(t, original), t.code.trim(), '```');

  if (t.changes.length) {
    out.push('', '### O que mudou');
    const seen = new Set<string>();
    let shown = 0;
    for (const c of t.changes) {
      const key = `${c.from}→${c.to}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (shown++ >= 45) break;
      out.push(`- L${c.line} ${code(c.from)} → ${code(c.to)} — ${c.reason}`);
    }
    const unique = new Set(t.changes.map((c) => `${c.from}→${c.to}`)).size;
    if (unique > 45) out.push(`- … mais ${unique - 45} mudanças únicas`);
  }
  if (t.manual.length) {
    out.push('', '### Precisa de decisão humana');
    for (const m of t.manual) out.push(`- L${m.line} — ${m.issue} ${m.suggestion}`);
  }
  if (after && after.findings.length) {
    const rest = after.findings.filter((f) => f.severity !== 'suggestion');
    if (rest.length) {
      out.push('', '### Ainda aponta a auditoria');
      for (const f of rest.slice(0, 10)) out.push(findingLine(f));
    }
  }
  if (t.setup.length) out.push('', '### Setup', ...t.setup.map((s) => `- ${s}`));
  return out.join('\n');
}
