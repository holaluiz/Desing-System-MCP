import { useDeferredValue, useMemo, useState } from 'react';
import { Chip, CopyButton, SpotlightTabs, Surface } from '@caramelo/design-system';
import { audit, transform, type AuditReport, type Material } from '@caramelo/design-system/engine';

const SAMPLES: Record<string, { label: string; code: string }> = {
  card: {
    label: 'Card Tailwind',
    code: `<div class="bg-white p-6 rounded-xl shadow-md">
  <span class="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-600">Novo</span>
  <h3 class="mt-3 text-lg font-semibold text-slate-900">Plano Pro</h3>
  <p class="text-slate-400 text-sm">Tudo do básico, mais automações.</p>
  <input placeholder="Seu e-mail" class="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none" />
  <button class="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg transition-all duration-500">Assinar</button>
  <button class="absolute right-4 top-4 h-5 w-5"><XIcon /></button>
</div>`,
  },
  shadcn: {
    label: 'Tema shadcn',
    code: `:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
}`,
  },
  css: {
    label: 'CSS puro',
    code: `body { background: #f9fafb; color: #111827; font-family: Roboto, Arial, sans-serif; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 10px 15px rgba(0,0,0,.1); }
.btn { background: #7c3aed; color: #fff; border-radius: 6px; transition: all .3s ease-in-out; }
.btn:hover { background: #6d28d9; }
.input:focus { outline: none; }
.muted { color: #9ca3af; }`,
  },
  vue: {
    label: 'Vue',
    code: `<template>
  <nav class="flex gap-4 bg-slate-900 p-4">
    <a v-for="item in items" :href="item.href" :class="['px-3 py-2 rounded text-slate-300 hover:text-white', active === item.id ? 'bg-slate-700 text-white' : '']">{{ item.label }}</a>
    <button @click="open = !open" class="ml-auto rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-900">Novo</button>
  </nav>
</template>`,
  },
};

const CATEGORY_LABEL: Record<string, string> = {
  acessibilidade: 'Acessibilidade',
  contraste: 'Contraste',
  interacao: 'Interação',
  motion: 'Motion',
  identidade: 'Identidade',
  tipografia: 'Tipografia',
  ux: 'UX',
};

function Score({ label, report, highlight }: { label: string; report: AuditReport; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[11px] uppercase tracking-wider text-fg-dim">{label}</span>
      <span className={`font-display text-5xl font-extrabold tabular-nums tracking-tight ${highlight ? 'cm-spectrum-text' : 'text-fg-2'}`}>
        {report.score}
        <span className="ml-1 text-2xl text-fg-dim">{report.grade}</span>
      </span>
    </div>
  );
}

export function EnginePlayground() {
  const [sample, setSample] = useState('card');
  const [code, setCode] = useState(SAMPLES.card.code);
  const [material, setMaterial] = useState<Material>('lumen');
  const deferred = useDeferredValue(code);

  const result = useMemo(() => {
    try {
      const before = audit(deferred);
      const t = transform(deferred, { material });
      const after = audit(t.code);
      return { before, t, after, error: null as string | null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, [deferred, material]);

  const pickSample = (id: string) => {
    setSample(id);
    setCode(SAMPLES[id].code);
  };

  const uniqueChanges = useMemo(() => {
    if (!('t' in result) || !result.t) return [];
    const seen = new Set<string>();
    return result.t.changes.filter((c) => {
      const k = `${c.from}→${c.to}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [result]);

  return (
    <Surface className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-line-soft p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 min-w-0 overflow-x-auto px-4 sm:mx-0 sm:px-0 [&>*]:w-max">
          <SpotlightTabs
            ariaLabel="Exemplos de entrada"
            variant="underline"
            value={sample}
            onValueChange={pickSample}
            items={Object.entries(SAMPLES).map(([id, s]) => ({ id, label: s.label }))}
          />
        </div>
        <SpotlightTabs
          ariaLabel="Material"
          value={material}
          onValueChange={(v) => setMaterial(v as Material)}
          items={[
            { id: 'lumen', label: 'Lumen' },
            { id: 'print', label: 'Print' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <label className="flex flex-col border-b border-line-soft lg:border-b-0 lg:border-r">
          <span className="flex items-center justify-between px-4 pb-2 pt-3 font-mono text-[11px] uppercase tracking-wider text-fg-dim">
            Entrada · qualquer sistema
            <Chip>editável</Chip>
          </span>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="min-h-[300px] w-full flex-1 resize-y bg-transparent px-4 pb-4 font-mono text-[12.5px] leading-relaxed text-fg-2 outline-none focus-visible:shadow-[inset_0_0_0_2px_rgb(var(--cm-focus))]"
          />
        </label>
        <div className="flex min-w-0 flex-col">
          <span className="flex items-center justify-between px-4 pb-2 pt-3 font-mono text-[11px] uppercase tracking-wider text-fg-dim">
            Saída · identidade Caramelo
            {'t' in result && result.t && <CopyButton value={result.t.code} aria-label="Copiar código transformado" />}
          </span>
          <pre className="max-h-[420px] min-h-[300px] flex-1 overflow-auto whitespace-pre-wrap break-words px-4 pb-4 font-mono text-[12.5px] leading-relaxed text-fg-2">
            <code>{'t' in result && result.t ? result.t.code : result.error}</code>
          </pre>
        </div>
      </div>

      {'t' in result && result.t && result.before && result.after && (
        <div className="grid gap-6 border-t border-line-soft p-4 sm:p-6 lg:grid-cols-[minmax(0,280px)_1fr]">
          <div className="flex flex-col gap-5">
            <div className="flex items-end gap-4" aria-live="polite">
              <Score label="Antes" report={result.before} />
              <span className="pb-3 font-mono text-fg-dim" aria-hidden="true">→</span>
              <Score label="Depois" report={result.after} highlight />
            </div>
            <ul className="flex flex-col gap-2" aria-label="Nota por categoria">
              {Object.entries(result.after.categories).map(([cat, v]) => {
                const before = result.before.categories[cat as keyof AuditReport['categories']].score;
                return (
                  <li key={cat} className="grid grid-cols-[96px_1fr_32px] items-center gap-2 text-xs">
                    <span className="text-fg-muted">{CATEGORY_LABEL[cat]}</span>
                    <span className="relative h-1.5 overflow-hidden rounded-pill bg-surface-3">
                      <span className="absolute inset-y-0 left-0 rounded-pill bg-fg-faint" style={{ width: `${before}%` }} />
                      <span
                        className="cm-brand-meter absolute inset-y-0 left-0 rounded-pill transition-[width] duration-smooth ease-out-expo motion-reduce:transition-none"
                        style={{ width: `${v.score}%` }}
                      />
                    </span>
                    <span className="text-right font-mono tabular-nums text-fg-2">{v.score}</span>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-fg-dim">
              {result.t.source.polarity === 'dark' ? 'Design escuro' : 'Design claro'} ·{' '}
              {result.t.source.palette[0]?.becomes ?? 'sem cor cromática'}
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <div>
              <h4 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-fg-dim">O que mudou · {uniqueChanges.length}</h4>
              <ul className="flex max-h-[260px] flex-col gap-1.5 overflow-auto pr-1">
                {uniqueChanges.slice(0, 40).map((c, i) => (
                  <li key={i} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs">
                    <span className="font-mono text-fg-faint">L{c.line}</span>
                    <code className="rounded-cm-xs bg-surface-3 px-1.5 py-0.5 font-mono text-fg-dim line-through decoration-fg-faint/60">{c.from}</code>
                    <span className="text-fg-faint" aria-hidden="true">→</span>
                    <code className="cm-brand-badge max-w-full break-all rounded-cm-xs px-1.5 py-0.5 font-mono">{c.to}</code>
                    <span className="text-fg-dim">{c.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            {result.t.manual.length > 0 && (
              <div>
                <h4 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-fg-dim">Decisão humana</h4>
                <ul className="flex flex-col gap-1 text-xs text-fg-muted">
                  {result.t.manual.map((m, i) => (
                    <li key={i}>
                      <span className="font-mono text-fg-faint">L{m.line}</span> {m.issue} <span className="text-fg-dim">{m.suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </Surface>
  );
}
