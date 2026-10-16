import { useState, type ReactNode } from 'react';
import {
  CARAMELO_PROJECT_PROMPT,
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
  Isotype,
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
  type SemanticRole,
} from '@caramelo/design-system';
import { Bell, Home, Search, Settings } from 'lucide-react';
import { CinematicHero, CinematicSection, SectionHead, TypeSpecimen } from './Cinematic';
import { EnginePlayground } from './EnginePlayground';

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

function GlitchTrigger({ children, className }: { children: ReactNode; className?: string }) {
  const [glitchRun, setGlitchRun] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);

  return (
    <button type="button" onClick={() => { setGlitchRun((run) => run + 1); setGlitchActive(true); }} className={`cm-spectrum-trigger rounded-cm-md focus-visible:outline-none focus-visible:shadow-focus ${className ?? ''}`}>
      <span key={glitchRun} className="cm-glitch block" data-cm-glitch-active={glitchActive ? '' : undefined} onAnimationEnd={(event) => { if (event.target === event.currentTarget) setGlitchActive(false); }}>{children}</span>
    </button>
  );
}

function SpectrumStudy() {
  return (
    <section id="paleta" aria-labelledby="paleta-titulo" className="scroll-mt-20">
      <SectionHead
        id="paleta-titulo"
        index="00 · Identidade em movimento"
        context="Orange · Sky · Pink · Violet · Yellow"
        title={<>Cinco cores.<br /><span className="cm-spectrum-text">Uma assinatura.</span></>}
        lead="As cinco cores se encontram nos degradês, no blur e no movimento líquido. O laranja dá força aos detalhes; o glitch separa as camadas de cor no instante da interação."
      />
      <div className="grid gap-4 md:grid-cols-[1.15fr_1fr]">
        <Surface className="relative isolate flex min-h-[320px] flex-col justify-between overflow-hidden p-6 sm:p-8">
          <div className="cm-liquid-field" aria-hidden="true" />
          <span className="relative font-mono text-[11px] uppercase tracking-meta text-fg-2">01 / Mistura líquida</span>
          <div className="relative max-w-sm">
            <p className="font-display text-4xl font-black leading-none tracking-display sm:text-5xl">A cor também<br />se move.</p>
            <p className="mt-4 max-w-[30ch] text-sm leading-relaxed text-fg-2">Laranja, azul, rosa, violeta e amarelo no mesmo campo de luz.</p>
          </div>
        </Surface>
        <Surface className="flex min-h-[320px] flex-col justify-between gap-8 p-6 sm:p-8">
          <span className="font-mono text-[11px] uppercase tracking-meta text-fg-dim">02 / Glitch de interação</span>
          <GlitchTrigger className="border border-line bg-stage px-5 py-8 text-left">
            <span className="block font-display text-4xl font-black leading-none tracking-display sm:text-5xl">TOCOU.<br />MUDOU.</span>
            <span className="mt-5 block text-sm text-fg-muted">Passe o cursor, use o teclado ou toque. ↗</span>
          </GlitchTrigger>
          <p className="text-xs text-fg-dim">Seu gesto ativa o desvio cromático. A leitura continua no centro.</p>
        </Surface>
      </div>
    </section>
  );
}

const ROLE_GROUPS: Array<{ title: string; roles: SemanticRole[] }> = [
  { title: 'Superfícies', roles: ['stage', 'surface-1', 'surface-2', 'surface-3'] },
  { title: 'Texto', roles: ['fg', 'fg-2', 'fg-muted', 'fg-dim', 'fg-faint'] },
  { title: 'Assinatura combinada', roles: [] },
  { title: 'Laranja de destaque', roles: ['accent', 'accent-bright', 'accent-ink', 'accent-soft', 'accent-contrast'] },
  { title: 'Status & foco', roles: ['focus', 'success', 'warning', 'danger', 'info'] },
];

const BRAND_TOKENS = [
  { name: 'spectrum', label: 'As cinco cores da marca juntas.', background: 'var(--cm-spectrum-gradient)' },
  { name: 'spectrum-soft', label: 'Mistura clara para ações com texto Ink.', background: 'var(--cm-spectrum-soft)' },
  { name: 'spectrum-glow', label: 'Luz difusa com os cinco canais.', background: 'rgb(var(--cm-surface-2))', boxShadow: 'var(--cm-spectrum-glow)' },
  { name: 'brand-action', label: 'Ação com a paleta completa e contraste.', background: 'var(--cm-spectrum-soft)' },
];

export function LumenLab({ onSwitchToPrint }: { onSwitchToPrint: () => void }) {
  const [fieldError, setFieldError] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const scrolled = useScrolled(40);

  return (
    <div className="cm-stage min-h-screen overflow-x-clip">
      <SmoothScroll />
      <ScrollProgress />
      <SceneNav
        scenes={[
          { id: 'topo', label: 'Início' },
          { id: 'paleta', label: 'Cores em movimento' },
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
          <a href="#topo" aria-label="Um Cara Caramelo — início" className="flex items-center gap-2.5 rounded-cm-sm focus-visible:outline-none focus-visible:shadow-focus">
            <Isotype size={38} decorative interactive />
            <span className="hidden font-display text-sm font-black tracking-title sm:inline">Caramelo DS</span>
          </a>
          <GlideGroup as="nav" aria-label="Seções" className="hidden items-center gap-1 md:flex">
            <GlideItem as="a" href="#interacoes" className="px-3 py-1.5 text-sm text-fg-muted">Interações</GlideItem>
            <GlideItem as="a" href="#cinematico" className="px-3 py-1.5 text-sm text-fg-muted">Cinemático</GlideItem>
            <GlideItem as="a" href="#motor" className="px-3 py-1.5 text-sm text-fg-muted">Motor MCP</GlideItem>
            <GlideItem as="a" href="#tipografia" className="px-3 py-1.5 text-sm text-fg-muted">Tipografia</GlideItem>
          </GlideGroup>
          <ThemeToggle />
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
              ['9', 'ferramentas MCP'],
              [String(interactions.length), 'interações'],
              [String(Object.keys(semanticRoles).length), 'papéis'],
              ['5 em 1', 'cores da marca'],
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
        <SpectrumStudy />
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
            <Demo id="chromatic-glitch" index={0}>
              <GlitchTrigger className="px-4 py-3 font-display text-2xl font-black text-fg">Sentiu a resposta?</GlitchTrigger>
            </Demo>
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
                  className="self-start rounded-cm-xs text-xs text-fg-2 underline underline-offset-4 focus-visible:outline-none focus-visible:shadow-focus"
                >
                  {fieldError ? 'Limpar erro' : 'Simular erro'}
                </button>
              </form>
            </Demo>

            <Demo id="copy-swap" index={8}>
              <div className="flex items-center gap-3">
                <code className="rounded-cm-sm border border-line bg-surface-2 px-3 py-1.5 font-mono text-xs text-fg-2">--cm-spectrum</code>
                <CopyButton value="var(--cm-spectrum-gradient)" />
                <CopyButton value="cm-brand-action" label="Copiar classe" />
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
              <a href="#motor" className="inline-flex items-center gap-1 rounded-cm-xs text-sm text-fg-2 underline underline-offset-4 focus-visible:outline-none focus-visible:shadow-focus">
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
            lead="O mesmo motor das tools do MCP, rodando aqui no navegador. Edite a entrada e veja a identidade Caramelo preservar a paleta combinada nas camadas visuais."
          />
          <Surface as="article" aria-labelledby="prompt-projeto-titulo" className="mb-6 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-meta text-accent-ink">Prompt pronto</p>
                <h3 id="prompt-projeto-titulo" className="mt-2 font-display text-xl font-bold tracking-tight">Aplicar no projeto inteiro</h3>
              </div>
              <CopyButton value={CARAMELO_PROJECT_PROMPT} label="Copiar prompt" copiedLabel="Prompt copiado" className="h-11 shrink-0 self-start sm:self-auto" />
            </div>
            <p className="mt-5 select-text border-l-2 border-accent pl-4 text-sm leading-relaxed text-fg-2 sm:text-base">{CARAMELO_PROJECT_PROMPT}</p>
            <p className="mt-4 text-xs leading-relaxed text-fg-dim">Com o MCP conectado, copie e cole no chat do seu projeto.</p>
          </Surface>
          <EnginePlayground />
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
            lead="Degradês, botões e luzes combinam as cinco cores. O laranja Caramel (#FF701A) marca detalhes, números e anotações. Texto e superfícies acompanham o tema; foco e status mantêm seus sinais funcionais."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLE_GROUPS.map((g, gi) => (
              <Reveal key={g.title} index={gi} variant="tilt">
                <Surface className="h-full p-4">
                  <h3 className="mb-3 text-[11px] font-medium uppercase tracking-meta text-fg-dim">{g.title}</h3>
                  <ul className="flex flex-col gap-2">
                    {g.roles.length === 0 && BRAND_TOKENS.map((token) => (
                      <li key={token.name} className="flex items-center gap-3">
                        <span className="size-8 shrink-0 rounded-cm-sm border border-line" style={{ background: token.background, boxShadow: token.boxShadow }} aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block font-mono text-xs text-fg-2">{token.name}</span>
                          <span className="block truncate text-[11px] text-fg-dim" title={token.label}>{token.label}</span>
                        </span>
                      </li>
                    ))}
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
            Catálogo Print <span className="cm-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
