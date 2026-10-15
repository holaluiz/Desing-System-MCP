import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  CompareSlider,
  IconArrowRight,
  LineReveal,
  MagneticButton,
  Parallax,
  PointerTrail,
  Reveal,
  ScrubWords,
  StickyDeck,
  StickyStack,
  TiltSurface,
  typography,
  GlowButton,
  Isotype,
} from '@caramelo/design-system';

/* ——— Arte de recorte (composição do LP: gradiente, órbita, glifo girado e grão) ——— */
type Tone = 'caramel' | 'sky' | 'violet' | 'pink' | 'yellow' | 'ink';
export function ArtTile({ tone, glyph, label, className, style }: { tone: Tone; glyph: string; label?: string; className?: string; style?: CSSProperties }) {
  const phase = ['caramel', 'sky', 'pink', 'violet', 'yellow'].indexOf(tone);
  const tileStyle: CSSProperties = tone === 'ink'
    ? { background: 'linear-gradient(140deg,#2a2a33,#18181d 55%,#0a0a0d)', color: '#FFF4E8' }
    : { color: '#FFF4E8', '--cm-chromatic-phase': phase } as CSSProperties;
  return (
    <div className={`relative h-full w-full overflow-hidden ${tone === 'ink' ? '' : 'cm-chromatic-tile'} ${className ?? ''}`} style={{ ...tileStyle, ...style }} aria-hidden="true">
      <span className="absolute -right-[38%] -top-[55%] aspect-square w-[90%] rounded-full border border-cream/30" />
      <b className="absolute inset-0 grid place-items-center font-display font-black leading-none" style={{ fontSize: 'clamp(48px, 9vw, 150px)', transform: 'rotate(-12deg)', letterSpacing: '-0.06em' }}>
        {glyph}
      </b>
      {label && <span className="absolute bottom-3 left-3 font-sans text-[11px] font-medium uppercase tracking-meta opacity-80">{label}</span>}
      <span className="pointer-events-none absolute inset-0 opacity-80" style={{ backgroundImage: 'url(/film-grain.svg)' }} />
    </div>
  );
}

/* ——— Hero no estilo do LP ——— */
export function CinematicHero() {
  return (
    <PointerTrail
      as="section"
      id="topo"
      appearance="stickers"
      className="relative isolate overflow-clip pb-12 pt-16 sm:pt-20"
      style={{ backgroundImage: 'radial-gradient(rgb(var(--cm-fg) / .1) .65px, transparent .8px)', backgroundSize: '56px 56px' }}
    >
      <div className="cm-liquid-field opacity-30" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-8">
        <Reveal variant="rise" trigger="load" delay={420}>
          <p className="cm-type-meta mb-10 text-fg-dim">
            <span>Design system + MCP · Laboratório de interação</span>
            <span>Belo Horizonte · 2026</span>
          </p>
        </Reveal>

        <h1 className="sr-only">Qualquer interface na sua identidade</h1>
        <div className="grid gap-4 sm:gap-5" aria-hidden="true">
          <Parallax start="top top" end="bottom top" to={{ y: -30, x: -12, opacity: 0.72 }} className="grid grid-cols-[minmax(0,1fr)_minmax(0,.42fr)] items-center gap-4 sm:gap-6">
            <LineReveal as="div" trigger="load" delay={80} className="cm-type-hero whitespace-nowrap text-[clamp(34px,9.6vw,150px)]">
              QUALQUER
            </LineReveal>
            <Reveal variant="clip" trigger="load" index={2} delay={200} className="h-[clamp(64px,9.5vw,150px)] overflow-hidden rounded-cm-lg">
              <div className="cm-chromatic-tile grid h-full place-items-center">
                <Isotype variant="cream" decorative size="78%" className="cm-hero-isotype" />
              </div>
            </Reveal>
          </Parallax>
          <Parallax start="top top" end="bottom top" to={{ y: -55, x: 12, opacity: 0.72 }} className="grid grid-cols-[minmax(0,.5fr)_minmax(0,1fr)] items-center gap-4 sm:gap-6">
            <div className="grid grid-cols-2 gap-3">
              <Reveal variant="clip" trigger="load" index={1} delay={200} className="h-[clamp(64px,9.5vw,150px)] overflow-hidden rounded-cm-lg">
                <ArtTile tone="violet" glyph="UX" />
              </Reveal>
              <Reveal variant="clip" trigger="load" index={0} delay={200} className="h-[clamp(64px,9.5vw,150px)] overflow-hidden rounded-cm-lg">
                <ArtTile tone="sky" glyph="↗" />
              </Reveal>
            </div>
            <LineReveal as="div" trigger="load" delay={200} className="cm-type-hero whitespace-nowrap text-right text-[clamp(34px,9.6vw,150px)]">
              INTERFACE<sup className="text-fg-2">®</sup>
            </LineReveal>
          </Parallax>
          <LineReveal as="div" trigger="load" delay={320} className="cm-type-hero whitespace-nowrap text-[clamp(28px,7.2vw,112px)]">
            <span className="cm-spectrum-text">NA SUA</span> IDENTIDADE.
          </LineReveal>
        </div>

        <Reveal variant="rise" trigger="load" delay={520}>
          <div className="mt-10 grid items-center gap-6 md:grid-cols-[1.3fr_1fr]">
            <div className="flex flex-wrap gap-3">
              <MagneticButton variant="accent" size="lg" fill swap icon={<IconArrowRight />} href="#motor">
                Testar o motor
              </MagneticButton>
              <GlowButton tone="ink" href="#cinematico" icon={<IconArrowRight />}>
                Ver os motions
              </GlowButton>
            </div>
            <p className="cm-type-lead max-w-sm md:justify-self-end">
              Tokens, tipografia e motion dos sites do Luiz num sistema só — e um MCP que transforma qualquer interface nessa identidade.
            </p>
          </div>
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-4">
            <span className="cm-type-hand">← passe o mouse aqui em cima</span>
            <a href="#interacoes" className="inline-flex items-center gap-3 rounded-cm-xs text-[11px] font-medium uppercase tracking-meta text-fg-muted focus-visible:outline-none focus-visible:shadow-focus">
              Role para ver <span aria-hidden="true" className="text-xl">↓</span>
            </a>
          </div>
        </Reveal>
      </div>
    </PointerTrail>
  );
}

/* ——— Cabeçalho de seção (meta + título por máscara) ——— */
export function SectionHead({ index, context, title, lead, id }: { index: string; context: string; title: ReactNode; lead?: ReactNode; id: string }) {
  return (
    <div className="mb-12">
      <Reveal variant="rise">
        <p className="cm-type-meta mb-6 border-b border-line pb-4 text-fg-dim">
          <span className="text-fg-2">{index}</span>
          <span>{context}</span>
        </p>
      </Reveal>
      <div className="grid items-end gap-6 lg:grid-cols-[1.4fr_1fr]">
        <LineReveal as="h2" id={id} className="cm-type-display-sm">
          {title}
        </LineReveal>
        {lead && (
          <Reveal variant="rise">
            <p className="cm-type-lead max-w-md">{lead}</p>
          </Reveal>
        )}
      </div>
    </div>
  );
}

/* ——— Comparador: genérico × Caramelo ——— */
function GenericCard() {
  return (
    <div className="grid h-full place-items-center bg-[#f3f4f6] p-6" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-md">
        <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-600">Novo</span>
        <h3 className="mt-3 text-lg font-semibold text-slate-900">Plano Pro</h3>
        <p className="text-sm text-slate-400">Tudo do básico, mais automações.</p>
        <button type="button" tabIndex={-1} className="mt-4 w-full rounded-lg bg-indigo-600 py-2 text-white">
          Assinar
        </button>
      </div>
    </div>
  );
}
function CarameloCard() {
  return (
    <div className="grid h-full place-items-center bg-stage p-6" style={{ backgroundImage: 'radial-gradient(rgb(var(--cm-fg) / .08) .65px, transparent .8px)', backgroundSize: '28px 28px' }}>
      <div className="w-full max-w-sm rounded-cm-lg border border-line bg-surface-1 p-6 shadow-elev-3">
        <span className="cm-brand-badge rounded-pill px-2.5 py-1 text-xs font-medium">Novo</span>
        <h3 className="mt-3 font-display text-2xl font-black tracking-display">Plano Pro</h3>
        <p className="text-sm text-fg-muted">Tudo do básico, mais automações.</p>
        <span className="cm-brand-action mt-4 flex h-10 w-full items-center justify-center rounded-pill text-sm font-semibold">Assinar →</span>
        <p className="cm-type-hand mt-3 text-xl">sem clichê ↑</p>
      </div>
    </div>
  );
}

/* ——— Entrada em cascata (reproduzível) ——— */
function StagedDemo() {
  const [run, setRun] = useState(0);
  const d = (s: string) => ({ '--cm-delay': s }) as CSSProperties;
  return (
    <div className="flex h-full flex-col gap-4">
      <div key={run} className="cm-enter--bg cm-chromatic-tile relative flex flex-1 flex-col justify-end overflow-hidden rounded-cm-lg p-6 text-cream">
        <p className="cm-enter cm-type-meta" style={d('.16s')}>
          <span>Aula 03</span>
          <span>12 min</span>
        </p>
        <h3 className="cm-enter cm-enter--headline mt-3 font-display text-4xl font-black leading-[0.95] tracking-display" style={d('.28s')}>
          Direção de
          <br />
          interação
        </h3>
        <div className="mt-4 flex items-center justify-between">
          <span className="cm-enter cm-enter--card rounded-pill bg-[#fff4e8]/15 px-3 py-1 text-xs" style={d('.4s')}>
            Módulo 1 · Intenção
          </span>
          <span className="cm-enter cm-enter--pop grid size-11 place-items-center rounded-full bg-yellow text-ink" style={d('.54s')}>
            ▶
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setRun((r) => r + 1)}
        className="self-start rounded-cm-xs text-sm text-fg-2 underline underline-offset-4 focus-visible:outline-none focus-visible:shadow-focus"
      >
        Reproduzir entrada ↻
      </button>
    </div>
  );
}

/* ——— Seção: motion cinematográfico ——— */
export function CinematicSection() {
  return (
    <section aria-labelledby="cinematico-titulo" id="cinematico" className="scroll-mt-20">
      <SectionHead
        id="cinematico-titulo"
        index="02 · Cinemático"
        context="Motions dos sites do Luiz"
        title={
          <>
            O scroll é a<br />
            câmera.
          </>
        }
        lead="Smooth scroll com inércia, títulos por máscara, mídia por recorte, profundidade, pilha de projetos, portas que se abrem e rastro de imagens no mouse — os mesmos números do LP."
      />

      {/* Manifesto */}
      <div className="cm-chromatic-tile relative overflow-hidden rounded-cm-2xl px-6 py-20 text-cream sm:px-12">
        <p className="cm-type-meta mb-8 opacity-70">
          <span>scrub-words</span>
          <span>role devagar</span>
        </p>
        <ScrubWords as="p" className="cm-type-display-sm max-w-4xl" text="Marca não é só o que ela diz. É o que ela faz você fazer." />
        <Parallax
          desktopOnly={false}
          className="pointer-events-none absolute -bottom-10 right-6 select-none font-handwriting text-[clamp(120px,18vw,260px)] leading-none opacity-25"
          from={{ rotate: -12 }}
          to={{ rotate: 18 }}
          aria-hidden="true"
        >
          C.
        </Parallax>
      </div>

      {/* Pilha de trabalhos */}
      <div className="mt-24">
        <p className="cm-type-meta mb-4 text-fg-dim">
          <span>sticky-deck</span>
          <span>um projeto por vez</span>
        </p>
        <StickyDeck
          counterLabel="Projeto"
          items={[
            { id: 'lumen', title: 'Lumen — material de produto', meta: '2026', media: <ArtTile tone="caramel" glyph="Lumen" /> },
            { id: 'print', title: 'Print — cartaz editorial', meta: '2025', media: <ArtTile tone="ink" glyph="Print" /> },
            { id: 'motion', title: 'Motion — o scroll como câmera', meta: '2026', media: <ArtTile tone="violet" glyph="Motion" /> },
            { id: 'mcp', title: 'MCP — qualquer interface, sua identidade', meta: '2026', media: <ArtTile tone="sky" glyph="MCP" /> },
          ]}
        />
      </div>

      {/* Portas */}
      <div className="mt-24">
        <LineReveal as="h3" className="cm-type-display-sm mb-10">
          Duas portas,
          <br />
          uma direção.
        </LineReveal>
        <div className="flex flex-col gap-4 md:flex-row">
          <Reveal variant="tilt" index={0} as="article" className="cm-lift flex min-h-[340px] flex-col rounded-cm-lg bg-cream p-7 text-ink md:w-[58%]">
            <a href="#motor" className="flex flex-1 flex-col rounded-cm-sm focus-visible:outline-none focus-visible:shadow-focus">
              <span className="flex items-center justify-between text-[11px] font-medium uppercase tracking-meta">
                Quero transformar uma interface <span className="cm-lift__arrow text-2xl leading-none" aria-hidden="true">↗</span>
              </span>
              <span className="cm-type-title mt-auto block">Rodar o motor no meu código</span>
              <span className="mt-4 max-w-sm text-sm text-[#5e5a55]">Audite, transforme e receba o relatório de cada mudança.</span>
            </a>
          </Reveal>
          <Reveal variant="tilt" index={1} as="article" className="cm-lift cm-chromatic-tile flex min-h-[340px] flex-col rounded-cm-lg p-7 text-cream md:w-[42%]">
            <a href="#interacoes" className="flex flex-1 flex-col rounded-cm-sm focus-visible:outline-none focus-visible:shadow-focus">
              <span className="flex items-center justify-between text-[11px] font-medium uppercase tracking-meta">
                Quero aprender <span className="cm-lift__arrow text-2xl leading-none" aria-hidden="true">↗</span>
              </span>
              <span className="cm-type-title mt-auto block">Ver as receitas</span>
              <span className="mt-4 max-w-sm text-sm text-cream/80">Cada interação com intenção, números e acessibilidade.</span>
            </a>
          </Reveal>
        </div>
      </div>

      {/* Cartaz com tilt + comparador */}
      <div className="mt-24 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-3">
          <p className="cm-type-meta text-fg-dim">
            <span>pointer-tilt</span>
            <span>até 3.5°</span>
          </p>
          <TiltSurface max={3.5} className="relative flex min-h-[380px] flex-col justify-between overflow-hidden rounded-cm-xl bg-ink p-8 text-cream">
            <span className="cm-type-meta text-cream/60">
              <span>Luiz</span>
              <span>Head de interação</span>
            </span>
            <p className="font-display text-[clamp(36px,4.6vw,64px)] font-black leading-[0.92] tracking-display">
              DIREÇÃO
              <br />
              <span className="cm-spectrum-text" data-cm-spectrum-surface="dark">INTERAÇÃO</span>
              <br />
              MOTION
            </p>
            <span className="cm-type-hand self-end text-cream">feito à mão ↗</span>
          </TiltSurface>
        </div>
        <div className="flex flex-col gap-3">
          <p className="cm-type-meta text-fg-dim">
            <span>compare-slider</span>
            <span>arraste ou role</span>
          </p>
          <CompareSlider
            className="min-h-[380px]"
            label="Antes e depois da transformação"
            valueText="{value}% identidade Caramelo"
            scrollDriven
            before={<GenericCard />}
            after={<CarameloCard />}
          />
        </div>
      </div>

      {/* Ofertas sticky + cascata */}
      <div className="mt-24 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="cm-type-meta mb-4 text-fg-dim">
            <span>sticky-stack</span>
            <span>cada oferta tem seu momento</span>
          </p>
          <StickyStack>
            {[
              { n: '01', t: 'Direção de interação', d: 'Diagnóstico, intenção e o sistema de motion do seu produto.', tone: 'caramel' as Tone },
              { n: '02', t: 'Design system + MCP', d: 'Seus tokens e interações dentro do editor de quem desenvolve.', tone: 'sky' as Tone },
            ].map((o) => (
              <article key={o.n} className="rounded-cm-xl border border-line bg-surface-2 p-7 shadow-elev-3">
                <div className="flex items-center gap-4 border-b border-line pb-5">
                  <span className="cm-spectrum-text font-display text-4xl font-black">
                    {o.n}
                  </span>
                  <h4 className="cm-type-heading">{o.t}</h4>
                </div>
                <p className="mt-5 text-sm text-fg-muted">{o.d}</p>
                <div className="mt-6 h-36 overflow-hidden rounded-cm-md">
                  <ArtTile tone={o.tone} glyph={o.n} />
                </div>
              </article>
            ))}
          </StickyStack>
        </div>
        <div className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
          <p className="cm-type-meta text-fg-dim">
            <span>staged-entrance</span>
            <span>só CSS</span>
          </p>
          <div className="h-[340px]">
            <StagedDemo />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ——— Espécime tipográfico ——— */
export function TypeSpecimen() {
  const rows: Array<{ key: keyof typeof typography.sizes; sample: string; cls: string }> = [
    { key: 'hero', sample: 'CARAMELO', cls: 'cm-type-hero' },
    { key: 'display', sample: 'Estratégia sentida', cls: 'cm-type-display' },
    { key: 'title', sample: 'Direção de interação', cls: 'cm-type-title' },
    { key: 'subtitle', sample: 'Lumen — material de produto', cls: 'cm-type-subtitle' },
    { key: 'lead', sample: 'Marca não é só o que ela diz. É o que ela faz você fazer.', cls: 'cm-type-lead' },
    { key: 'meta', sample: 'Laboratório · 2026', cls: 'cm-type-meta' },
    { key: 'hand', sample: '← feito à mão, com intenção', cls: 'cm-type-hand' },
  ];
  return (
    <section aria-labelledby="tipografia-titulo" id="tipografia" className="scroll-mt-20">
      <SectionHead
        id="tipografia-titulo"
        index="04 · Tipografia"
        context="Montserrat · Inter · Covered By Your Grace"
        title={
          <>
            Massa de cartaz,
            <br />
            leitura limpa.
          </>
        }
        lead="As fontes do LP, auto-hospedadas. Montserrat 900 com tracking negativo forte nos títulos, Inter na leitura e a mão do Luiz nas notas."
      />
      <div className="flex flex-col">
        {rows.map((r) => {
          const s = typography.sizes[r.key];
          return (
            <Reveal key={r.key} variant="rise" className="grid gap-3 border-t border-line py-6 md:grid-cols-[220px_1fr] md:items-baseline">
              <div className="font-mono text-xs text-fg-dim">
                <span className="block text-fg-2">text-cm-{r.key}</span>
                <span className="block">
                  {s.weight} · {s.lineHeight} · {s.tracking}
                </span>
              </div>
              <div className={`min-w-0 overflow-hidden ${r.key === 'hero' ? 'whitespace-nowrap' : ''}`}>
                <span className={`${r.cls} ${r.key === 'hero' ? 'text-[clamp(56px,9vw,140px)]' : ''}`}>{r.key === 'meta' ? <><span>{r.sample}</span><span>Belo Horizonte</span></> : r.sample}</span>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
