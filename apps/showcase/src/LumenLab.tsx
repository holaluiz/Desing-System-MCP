import { useState, type ReactNode } from 'react';
import {
  Chip,
  CommandCopy,
  CopyButton,
  FocusField,
  GlideGroup,
  GlideItem,
  GlideMenu,
  GlowButton,
  IconArrowRight,
  interactions,
  Kbd,
  MagneticButton,
  Reveal,
  SceneNav,
  ScrollProgress,
  ScrubNumber,
  semanticRoles,
  SmoothScroll,
  SpotlightTabs,
  Surface,
  TextSwap,
  ThemeToggle,
  useScrolled,
  type SceneAccent,
  type SemanticRole,
} from '@caramelo/design-system';
import { Bell, Home, Search, Settings } from 'lucide-react';
import { CinematicHero, CinematicSection, SectionHead, TypeSpecimen } from './Cinematic';
import { EnginePlayground } from './EnginePlayground';

const ACCENTS: Array<{ id: SceneAccent; label: string; hex: string }> = [
  { id: 'caramel', label: 'Caramel', hex: '#FF701A' },
  { id: 'sky', label: 'Electric Sky', hex: '#25BFFF' },
  { id: 'pink', label: 'Hot Pink', hex: '#FF3D8D' },
  { id: 'violet', label: 'Electric Violet', hex: '#7657FF' },
  { id: 'yellow', label: 'Acid Yellow', hex: '#FFD52A' },
];

const spec = (id: string) => interactions.find((i) => i.id === id)!;

function Demo({ id, index, children, wide }: { id: string; index: number; children: ReactNode; wide?: boolean }) {
  const s = spec(id);
  return (
    <Reveal index={index % 3} className={wide ? 'md:col-span-2' : undefined}>
      <Surface as="article" spotlight className="flex h-full flex-col gap-4 p-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-bold tracking-tight text-fg">{s.name}</h3>
            <p className="mt-1 text-sm leading-relaxed text-fg-muted">{s.intent}</p>
          </div>
          <Chip className="shrink-0">{s.id}</Chip>
        </header>
        <div className="cm-dots-bg relative flex min-h-[148px] flex-1 flex-wrap items-center justify-center gap-3 rounded-cm-md border border-line-soft bg-stage/60 p-5">
          {children}
        </div>
        <p className="font-mono text-[11px] text-fg-dim">
          {s.motion.duration} · {s.motion.easing}
        </p>
      </Surface>
    </Reveal>
  );
}

function AccentPicker({ value, onChange }: { value: SceneAccent; onChange: (a: SceneAccent) => void }) {
  return (
    <div role="radiogroup" aria-label="Acento da cena" className="flex items-center gap-1.5">
      {ACCENTS.map((a) => (
        <button
          key={a.id}
          type="button"
          role="radio"
          aria-checked={value === a.id}
          aria-label={a.label}
          title={a.label}
          onClick={() => onChange(a.id)}
          className="grid size-7 place-items-center rounded-pill transition-transform duration-micro ease-out-expo hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transition-none"
        >
          <span
            className="size-3.5 rounded-pill transition-shadow duration-micro"
            style={{
              background: a.hex,
              boxShadow: value === a.id ? `0 0 0 2px rgb(var(--cm-stage)), 0 0 0 3.5px ${a.hex}` : undefined,
            }}
          />
        </button>
      ))}
    </div>
  );
}

const ROLE_GROUPS: Array<{ title: string; roles: SemanticRole[] }> = [
  { title: 'Superfícies', roles: ['stage', 'surface-1', 'surface-2', 'surface-3'] },
  { title: 'Texto', roles: ['fg', 'fg-2', 'fg-muted', 'fg-dim', 'fg-faint'] },
  { title: 'Acento da cena', roles: ['accent', 'accent-bright', 'accent-ink', 'accent-soft', 'accent-contrast'] },
  { title: 'Status & foco', roles: ['focus', 'success', 'warning', 'danger', 'info'] },
];

export function LumenLab({ onSwitchToPrint }: { onSwitchToPrint: () => void }) {
  const [accent, setAccent] = useState<SceneAccent>('caramel');
  const [fieldError, setFieldError] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const scrolled = useScrolled(40);

  return (
    <div data-cm-accent={accent} className="cm-stage min-h-screen overflow-x-clip">
      <SmoothScroll />
      <ScrollProgress />
      <SceneNav
        scenes={[
          { id: 'topo', label: 'Início' },
          { id: 'interacoes', label: 'Interações' },
          { id: 'cinematico', label: 'Cinemático' },
          { id: 'motor', label: 'Motor MCP' },
          { id: 'tipografia', label: 'Tipografia' },
          { id: 'tokens', label: 'Tokens' },
        ]}
      />
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-cm-md focus:bg-surface-2 focus:px-3 focus:py-2">
        Pular para o conteúdo
      </a>

      {/* ——— Barra superior ——— */}
      <header className="cm-header sticky top-0 z-40 bg-stage/80 backdrop-blur-md" data-scrolled={scrolled ? '' : undefined}>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="#topo" className="flex items-center gap-2.5 rounded-cm-sm focus-visible:outline-none focus-visible:shadow-focus">
            <span className="grid size-7 place-items-center rounded-cm-sm bg-accent font-display text-[11px] font-extrabold text-accent-contrast">UC</span>
            <span className="hidden font-display text-sm font-black tracking-title sm:inline">Caramelo DS</span>
            <Chip>V2 · Lumen</Chip>
          </a>
          <GlideGroup as="nav" aria-label="Seções" className="hidden items-center gap-1 md:flex">
            <GlideItem as="a" href="#interacoes" className="px-3 py-1.5 text-sm text-fg-muted">Interações</GlideItem>
            <GlideItem as="a" href="#cinematico" className="px-3 py-1.5 text-sm text-fg-muted">Cinemático</GlideItem>
            <GlideItem as="a" href="#motor" className="px-3 py-1.5 text-sm text-fg-muted">Motor MCP</GlideItem>
            <GlideItem as="a" href="#tipografia" className="px-3 py-1.5 text-sm text-fg-muted">Tipografia</GlideItem>
          </GlideGroup>
          <div className="flex items-center gap-2">
            <AccentPicker value={accent} onChange={setAccent} />
            <ThemeToggle />
            <button
              type="button"
              onClick={onSwitchToPrint}
              className="hidden h-8 items-center rounded-pill border border-line px-3 text-xs font-medium text-fg-muted transition-[color,border-color] duration-micro hover:border-line-strong hover:text-fg focus-visible:outline-none focus-visible:shadow-focus sm:inline-flex"
            >
              Print V1
            </button>
          </div>
        </div>
      </header>

      {/* ——— Hero (LP) ——— */}
      <CinematicHero />

      {/* ——— Instalação + números ——— */}
      <div className="mx-auto mb-24 grid max-w-6xl items-center gap-8 px-4 sm:px-6 md:grid-cols-[1fr_1.2fr]">
        <Reveal variant="rise">
          <CommandCopy command={{ npm: 'npm i @caramelo/design-system', pnpm: 'pnpm add @caramelo/design-system', yarn: 'yarn add @caramelo/design-system' }} />
        </Reveal>
        <Reveal variant="rise" delay={80}>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            {[
              ['8', 'ferramentas MCP'],
              [String(interactions.length), 'interações'],
              [String(Object.keys(semanticRoles).length), 'papéis'],
              ['2 × 5', 'temas × acentos'],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="text-[11px] font-medium uppercase tracking-meta text-fg-dim">{l}</dt>
                <dd className="font-display text-3xl font-black tabular-nums tracking-display">{n}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      <main id="conteudo" className="mx-auto flex max-w-6xl flex-col gap-28 px-4 pb-28 sm:px-6">
        {/* ——— Interações ——— */}
        <section id="interacoes" aria-labelledby="interacoes-titulo" className="scroll-mt-20">
          <SectionHead
            id="interacoes-titulo"
            index="01 · Interações"
            context="Microinterações Lumen"
            title={
              <>
                Toda resposta chega
                <br />
                antes da dúvida.
              </>
            }
            lead="Cada receita resolve um problema de UX específico. Press em 80ms, hover em 160ms, indicadores em 320ms — e nada que bloqueie a próxima ação passa de 400ms."
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Demo id="magnetic-fill" index={0}>
              <MagneticButton variant="accent" fill swap icon={<IconArrowRight />}>
                Começar
              </MagneticButton>
            </Demo>
            <Demo id="edge-glow" index={1}>
              <GlowButton icon={<IconArrowRight />}>Ver em ação</GlowButton>
            </Demo>
            <Demo id="text-swap" index={2}>
              <a href="#interacoes" className="rounded-cm-xs text-fg focus-visible:outline-none focus-visible:shadow-focus">
                <TextSwap text="Sobre o lab" />
              </a>
              <MagneticButton variant="surface" magnetic={false} fill={false}>
                <TextSwap text="Explorar" stagger />
              </MagneticButton>
            </Demo>

            <Demo id="spotlight-tabs" index={3} wide>
              <div className="flex w-full flex-col items-center gap-5">
                <SpotlightTabs
                  ariaLabel="Visualização"
                  items={[
                    { id: 'lista', label: 'Lista' },
                    { id: 'grade', label: 'Grade' },
                    { id: 'mapa', label: 'Mapa' },
                    { id: 'linha', label: 'Linha do tempo' },
                  ]}
                />
                <SpotlightTabs
                  ariaLabel="Navegação compacta"
                  variant="expand"
                  items={[
                    { id: 'inicio', label: 'Início', icon: <Home size={16} aria-hidden="true" /> },
                    { id: 'buscar', label: 'Buscar', icon: <Search size={16} aria-hidden="true" /> },
                    { id: 'avisos', label: 'Avisos', icon: <Bell size={16} aria-hidden="true" /> },
                    { id: 'ajustes', label: 'Ajustes', icon: <Settings size={16} aria-hidden="true" /> },
                  ]}
                />
              </div>
            </Demo>
            <Demo id="blur-glide-menu" index={4}>
              <div className="flex flex-col items-center gap-3">
                <GlideMenu
                  label="Ações do projeto"
                  trigger="Ações"
                  items={[
                    { id: 'renomear', label: 'Renomear', shortcut: 'R', onSelect: () => setLastAction('Renomear') },
                    { id: 'duplicar', label: 'Duplicar', shortcut: 'D', onSelect: () => setLastAction('Duplicar') },
                    {
                      id: 'mover',
                      label: 'Mover para',
                      items: [
                        { id: 'arquivo', label: 'Arquivo', onSelect: () => setLastAction('Mover → Arquivo') },
                        { id: 'lab', label: 'Laboratório', onSelect: () => setLastAction('Mover → Laboratório') },
                        { id: 'clientes', label: 'Clientes', onSelect: () => setLastAction('Mover → Clientes') },
                      ],
                    },
                    { id: 'sep', label: '', separator: true },
                    { id: 'excluir', label: 'Excluir', tone: 'danger', onSelect: () => setLastAction('Excluir') },
                  ]}
                />
                <p className="text-xs text-fg-dim" aria-live="polite">
                  {lastAction ? `Última ação: ${lastAction}` : (
                    <>
                      <Kbd>↑</Kbd> <Kbd>↓</Kbd> <Kbd>→</Kbd> <Kbd>←</Kbd> <Kbd>Esc</Kbd>
                    </>
                  )}
                </p>
              </div>
            </Demo>

            <Demo id="glide-highlight" index={5}>
              <GlideGroup as="nav" aria-label="Atalhos" className="grid w-full grid-cols-2 gap-1">
                {['Docs', 'Tokens', 'Motion', 'MCP'].map((l) => (
                  <GlideItem key={l} as="a" href="#tokens" className="px-3 py-2 text-left text-sm text-fg-muted">
                    {l}
                  </GlideItem>
                ))}
              </GlideGroup>
            </Demo>
            <Demo id="scrub-number" index={6}>
              <div className="flex w-full flex-col gap-3">
                <ScrubNumber label="Raio" defaultValue={12} min={0} max={48} unit="px" />
                <ScrubNumber label="Opacidade" defaultValue={80} min={0} max={100} step={5} unit="%" />
              </div>
            </Demo>
            <Demo id="focus-field" index={7}>
              <form className="flex w-full flex-col gap-3" onSubmit={(e) => e.preventDefault()} noValidate>
                <FocusField label="E-mail" type="email" autoComplete="email" hint="Usamos só para o acesso." />
                <FocusField label="Senha" type="password" error={fieldError ? 'Mínimo de 8 caracteres.' : undefined} />
                <button
                  type="button"
                  onClick={() => setFieldError((v) => !v)}
                  className="self-start rounded-cm-xs text-xs text-accent-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:shadow-focus"
                >
                  {fieldError ? 'Limpar erro' : 'Simular erro'}
                </button>
              </form>
            </Demo>

            <Demo id="copy-swap" index={8}>
              <div className="flex items-center gap-3">
                <code className="rounded-cm-sm border border-line bg-surface-2 px-3 py-1.5 font-mono text-xs text-fg-2">#FF701A</code>
                <CopyButton value="#FF701A" />
                <CopyButton value="rgb(var(--cm-accent))" label="Copiar token" />
              </div>
            </Demo>
            <Demo id="theme-reveal" index={9}>
              <div className="flex flex-col items-center gap-2">
                <ThemeToggle />
                <p className="text-xs text-fg-dim">Escuro cinematográfico ↔ claro editorial</p>
              </div>
            </Demo>
            <Demo id="spotlight-surface" index={10}>
              <p className="max-w-[22ch] text-center text-sm text-fg-muted">Passe o cursor por este card — a luz e a borda seguem você.</p>
            </Demo>

            <Demo id="arrow-nudge" index={11}>
              <a href="#motor" className="cm-underline text-sm text-fg">
                Manifesto
              </a>
              <a href="#motor" className="inline-flex items-center gap-1 rounded-cm-xs text-sm text-accent-ink focus-visible:outline-none focus-visible:shadow-focus">
                Ver casos <span className="cm-arrow" aria-hidden="true">→</span>
              </a>
              <MagneticButton variant="accent" magnetic={false} fill={false} className="cm-shine">
                Assinar o Pro
              </MagneticButton>
            </Demo>
          </div>
        </section>

        {/* ——— Motion cinematográfico (LP) ——— */}
        <CinematicSection />

        {/* ——— Motor MCP ——— */}
        <section id="motor" aria-labelledby="motor-titulo" className="scroll-mt-20">
          <SectionHead
            id="motor-titulo"
            index="03 · Motor MCP"
            context="transform_to_caramelo · audit_ux_ui"
            title={
              <>
                Cole qualquer coisa.
                <br />
                Saia Caramelo.
              </>
            }
            lead="O mesmo motor das tools do MCP, rodando aqui no navegador. Edite a entrada; troque o acento no topo e veja o resultado acompanhar."
          />
          <EnginePlayground accent={accent} />
        </section>

        {/* ——— Tipografia ——— */}
        <TypeSpecimen />

        {/* ——— Tokens ——— */}
        <section id="tokens" aria-labelledby="tokens-titulo" className="scroll-mt-20">
          <SectionHead
            id="tokens-titulo"
            index="05 · Tokens"
            context="Papéis semânticos"
            title={
              <>
                Papéis,
                <br />
                não cores.
              </>
            }
            lead="O código usa bg-surface-1, text-fg-muted, bg-accent. Tema e acento trocam tudo de uma vez — experimente os controles do topo."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLE_GROUPS.map((g, gi) => (
              <Reveal key={g.title} index={gi} variant="tilt">
                <Surface className="h-full p-4">
                  <h3 className="mb-3 text-[11px] font-medium uppercase tracking-meta text-fg-dim">{g.title}</h3>
                  <ul className="flex flex-col gap-2">
                    {g.roles.map((r) => (
                      <li key={r} className="flex items-center gap-3">
                        <span className="size-8 shrink-0 rounded-cm-sm border border-line" style={{ background: `rgb(var(--cm-${r}))` }} aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block font-mono text-xs text-fg-2">{r}</span>
                          <span className="block truncate text-[11px] text-fg-dim" title={semanticRoles[r]}>
                            {semanticRoles[r]}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </Surface>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line-soft">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-8 text-sm text-fg-dim sm:flex-row sm:items-center sm:px-6">
          <p>Um Cara Caramelo · Laboratório de Interação · 2026</p>
          <button
            type="button"
            onClick={onSwitchToPrint}
            className="inline-flex items-center gap-1 rounded-cm-xs text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:shadow-focus"
          >
            Catálogo Print (V1) <span className="cm-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
