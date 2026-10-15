/**
 * Receitas de código das microinterações (get_interaction).
 * React = componente do pacote. HTML = classes do styles.css (+ JS mínimo quando a
 * interação depende de ponteiro/medição). As specs (intenção, motion, a11y) vêm de
 * tokens/interactions.ts — aqui fica só o "como".
 */

export interface Recipe {
  react: string;
  html?: string;
  js?: string;
  notes?: string[];
}

const POINTER_JS = `// Escreve a posição do ponteiro em --mx/--my (px) — usado por .cm-glow-btn e .cm-surface--spotlight
document.querySelectorAll('.cm-glow-btn, .cm-surface--spotlight').forEach((el) => {
  let frame = 0;
  el.addEventListener('pointermove', (e) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', \`\${e.clientX - r.left}px\`);
      el.style.setProperty('--my', \`\${e.clientY - r.top}px\`);
    });
  });
});`;

export const recipes: Record<string, Recipe> = {
  'magnetic-fill': {
    react: `import { MagneticButton, IconArrowRight } from '@caramelo/design-system';

<MagneticButton variant="accent" size="lg" fill swap icon={<IconArrowRight />}>
  Começar agora
</MagneticButton>`,
    html: `<button type="button" class="cm-btn cm-btn--accent cm-btn--lg cm-btn--fill cm-magnetic">
  <span class="cm-btn__fill" aria-hidden="true"></span>
  <span class="cm-btn__label">Começar agora <span class="cm-arrow" aria-hidden="true">→</span></span>
</button>`,
    js: `// Ímã: desligado em touch e com movimento reduzido
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches;
if (!reduce) document.querySelectorAll('.cm-magnetic').forEach((el) => {
  const max = 8, strength = 0.3, clamp = (v) => Math.max(-max, Math.min(max, v));
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--cm-mag-x', clamp((e.clientX - r.left - r.width / 2) * strength) + 'px');
    el.style.setProperty('--cm-mag-y', clamp((e.clientY - r.top - r.height / 2) * strength) + 'px');
  });
  el.addEventListener('pointerleave', () => { el.style.setProperty('--cm-mag-x', '0px'); el.style.setProperty('--cm-mag-y', '0px'); });
});`,
    notes: ['Um por cena: é o ponto focal.', 'variant: surface | accent | cream | ghost · magnetic={false} desliga o ímã.'],
  },
  'edge-glow': {
    react: `import { GlowButton, IconArrowRight } from '@caramelo/design-system';

<GlowButton tone="cream" icon={<IconArrowRight />} href="/demo">Ver em ação</GlowButton>`,
    html: `<a class="cm-glow-btn" href="/demo">Ver em ação <span class="cm-arrow" aria-hidden="true">→</span></a>`,
    js: POINTER_JS,
    notes: ['Só em fundo escuro; tone="ink" para a versão escura.'],
  },
  'text-swap': {
    react: `import { TextSwap } from '@caramelo/design-system';

<a href="/sobre"><TextSwap text="Sobre o lab" /></a>`,
    html: `<a href="/sobre">
  <span class="cm-swap">
    <span class="cm-sr-only">Sobre o lab</span>
    <span class="cm-swap__a" aria-hidden="true">Sobre o lab</span>
    <span class="cm-swap__b" aria-hidden="true">Sobre o lab</span>
  </span>
</a>`,
    notes: ['O hover vem do pai (a, button ou .cm-swap-host) — zero layout shift.'],
  },
  'stagger-letters': {
    react: `import { TextSwap } from '@caramelo/design-system';

<button type="button" className="cm-btn"><TextSwap text="Explorar" stagger /></button>`,
    html: `<button type="button" class="cm-btn" aria-label="Explorar">
  <span class="cm-swap cm-swap--stagger" aria-hidden="true">
    <span class="cm-swap__a"><span class="cm-swap__ch" style="--i:0">E</span><span class="cm-swap__ch" style="--i:1">x</span><!-- … uma por letra --></span>
    <span class="cm-swap__b"><span class="cm-swap__ch" style="--i:0">E</span><span class="cm-swap__ch" style="--i:1">x</span><!-- … --></span>
  </span>
</button>`,
    notes: ['Até ~14 caracteres (18ms × letra precisa ficar abaixo de 400ms).'],
  },
  'spotlight-tabs': {
    react: `import { SpotlightTabs } from '@caramelo/design-system';

<SpotlightTabs
  ariaLabel="Visualização"
  defaultValue="lista"
  items={[
    { id: 'lista', label: 'Lista', content: <Lista /> },
    { id: 'grade', label: 'Grade', content: <Grade /> },
    { id: 'mapa', label: 'Mapa', content: <Mapa /> },
  ]}
/>`,
    notes: ['O indicador é medido em JS (posição + largura) — use o componente.', 'Setas ←→, Home/End; activation="manual" exige Enter/Espaço.'],
  },
  'underline-tabs': {
    react: `<SpotlightTabs variant="underline" ariaLabel="Seções" items={[{ id: 'visao', label: 'Visão geral' }, { id: 'uso', label: 'Uso' }]} />`,
  },
  'expanding-tabs': {
    react: `import { SpotlightTabs } from '@caramelo/design-system';
import { Home, Search, Bell } from 'lucide-react';

<SpotlightTabs
  variant="expand"
  ariaLabel="Navegação"
  items={[
    { id: 'inicio', label: 'Início', icon: <Home size={16} /> },
    { id: 'buscar', label: 'Buscar', icon: <Search size={16} /> },
    { id: 'avisos', label: 'Avisos', icon: <Bell size={16} /> },
  ]}
/>`,
  },
  'blur-glide-menu': {
    react: `import { GlideMenu } from '@caramelo/design-system';

<GlideMenu
  label="Ações do projeto"
  trigger="Ações"
  items={[
    { id: 'renomear', label: 'Renomear', shortcut: 'R', onSelect: renomear },
    {
      id: 'mover', label: 'Mover para',
      items: [
        { id: 'arquivo', label: 'Arquivo', onSelect: () => mover('arquivo') },
        { id: 'lab', label: 'Laboratório', onSelect: () => mover('lab') },
      ],
    },
    { id: 'sep', label: '', separator: true },
    { id: 'excluir', label: 'Excluir', tone: 'danger', onSelect: confirmarExclusao },
  ]}
/>`,
    notes: ['Teclado completo (↑↓ → ← Esc) e devolução de foco ao gatilho — use o componente.', 'Máximo 2 níveis.'],
  },
  'glide-highlight': {
    react: `import { GlideGroup, GlideItem } from '@caramelo/design-system';

<GlideGroup as="nav" aria-label="Atalhos" className="grid grid-cols-3 gap-1">
  <GlideItem as="a" href="/docs">Docs</GlideItem>
  <GlideItem as="a" href="/tokens">Tokens</GlideItem>
  <GlideItem as="a" href="/mcp">MCP</GlideItem>
</GlideGroup>`,
  },
  'scrub-number': {
    react: `import { ScrubNumber } from '@caramelo/design-system';

<ScrubNumber label="Raio" defaultValue={12} min={0} max={48} step={1} unit="px" />`,
    notes: ['role=spinbutton; ↑↓ ±passo, Shift ×10. Digitação continua possível.'],
  },
  'focus-field': {
    react: `import { FocusField } from '@caramelo/design-system';

<FocusField label="E-mail" type="email" autoComplete="email" hint="Usamos só para o acesso." />
<FocusField label="Senha" type="password" error="Mínimo de 8 caracteres." />`,
    html: `<div class="cm-field">
  <input id="email" class="cm-field__input" type="email" placeholder=" " aria-describedby="email-hint" />
  <label for="email" class="cm-field__label">E-mail</label>
  <span class="cm-field__beam" aria-hidden="true"></span>
</div>
<p id="email-hint" class="cm-field__hint">Usamos só para o acesso.</p>`,
    notes: ['placeholder=" " é obrigatório no HTML puro: o rótulo flutua via :placeholder-shown.', 'Erro: data-invalid no .cm-field + aria-invalid no input + role="alert" na dica.'],
  },
  'copy-swap': {
    react: `import { CopyButton, CommandCopy } from '@caramelo/design-system';

<CopyButton value="npm i @caramelo/design-system" />
<CommandCopy command={{ npm: 'npm i @caramelo/design-system', pnpm: 'pnpm add @caramelo/design-system' }} />`,
    html: `<button type="button" class="cm-copy" aria-label="Copiar" data-value="npm i @caramelo/design-system">
  <span class="cm-copy__icons" aria-hidden="true">
    <svg class="cm-copy__icon cm-copy__icon--idle" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>
    <svg class="cm-copy__icon cm-copy__icon--done" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 5 5 9-10"/></svg>
  </span>
  <span class="cm-sr-only" role="status" aria-live="polite"></span>
</button>`,
    js: `document.querySelectorAll('.cm-copy').forEach((btn) => {
  btn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(btn.dataset.value);
    btn.setAttribute('data-copied', '');
    btn.querySelector('[role=status]').textContent = 'Copiado';
    setTimeout(() => { btn.removeAttribute('data-copied'); btn.querySelector('[role=status]').textContent = ''; }, 1600);
  });
});`,
  },
  'theme-reveal': {
    react: `import { ThemeToggle } from '@caramelo/design-system';

<ThemeToggle persist />`,
    notes: ['Usa View Transitions (máscara diagonal); sem suporte ou com movimento reduzido, troca instantânea.', 'Aplica data-caramelo-theme no <html> — todos os papéis --cm-* acompanham.'],
  },
  'spotlight-surface': {
    react: `import { Surface } from '@caramelo/design-system';

<Surface as="article" spotlight interactive className="p-6">
  <h3 className="font-display text-lg">Tokens semânticos</h3>
  <p className="text-fg-muted">Um código, dois temas, cinco acentos.</p>
</Surface>`,
    html: `<article class="cm-surface cm-surface--spotlight cm-surface--interactive" style="padding:24px">…</article>`,
    js: POINTER_JS,
  },
  'blur-reveal': {
    react: `import { Reveal } from '@caramelo/design-system';

{features.map((f, i) => (
  <Reveal key={f.id} index={i}>
    <FeatureCard {...f} />
  </Reveal>
))}`,
    html: `<section class="cm-reveal" data-revealed="false" style="--cm-i:0">…</section>`,
    js: `const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting) { e.target.dataset.revealed = 'true'; io.unobserve(e.target); }
}), { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
document.querySelectorAll('.cm-reveal').forEach((el) => io.observe(el));`,
    notes: ['index escalona em 40ms (--cm-stagger-item).', 'Sem JS o conteúdo aparece (@media (scripting: none)).'],
  },
  'shine-sweep': {
    react: `<MagneticButton variant="accent" className="cm-shine">Assinar o Pro</MagneticButton>`,
    html: `<button type="button" class="cm-btn cm-btn--accent cm-shine"><span class="cm-btn__label">Assinar o Pro</span></button>`,
  },
  'arrow-nudge': {
    react: `<a href="/casos" className="inline-flex items-center gap-1">Ver casos <span className="cm-arrow" aria-hidden="true">→</span></a>`,
    html: `<a href="/casos">Ver casos <span class="cm-arrow" aria-hidden="true">→</span></a>`,
  },
  'underline-grow': {
    react: `<a href="/manifesto" className="cm-underline">Manifesto</a>`,
    html: `<a href="/manifesto" class="cm-underline">Manifesto</a>`,
  },
  'layer-split': {
    react: `import { LayerSplit, Eyebrow } from '@caramelo/design-system';

<LayerSplit accentColor="caramel" className="max-w-md">
  <Eyebrow color="caramel">Princípio de movimento</Eyebrow>
  <h3 className="font-display font-black text-2xl uppercase">Stillness → Movement</h3>
</LayerSplit>`,
    html: `<div class="caramelo-layer-split">…</div>`,
  },
  'press-physics': {
    react: `import { Button } from '@caramelo/design-system';

<Button variant="primary">Explorar o lab</Button>`,
    html: `<button type="button" class="rounded-none border-2 border-ink bg-caramel px-5 py-3 font-display font-black uppercase text-ink shadow-graphic-sm transition-[transform,box-shadow] duration-150 ease-kinetic hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-graphic-md active:translate-x-[1px] active:translate-y-[1px] active:shadow-none focus-visible:outline-none focus-visible:shadow-focus motion-reduce:transform-none">
  Explorar o lab
</button>`,
  },
  misregistration: {
    react: `import { MisregistrationText } from '@caramelo/design-system';

<MisregistrationText as="h1" className="font-display text-6xl font-black uppercase">Um Cara Caramelo</MisregistrationText>`,
    html: `<h1 class="caramelo-misregistration">Um Cara Caramelo</h1>`,
  },
};

/* ═══════════════ Motion cinematográfico (LP) ═══════════════ */
const MOTION_INIT = `import { initCaramelMotion } from '@caramelo/design-system/motion';
initCaramelMotion(); // smooth scroll + data-cm-* (reveal, scrub, tilt, trail, progress, vídeo)`;

const HEAD_SNIPPET = `<!-- No <head>: define o estado antes da primeira pintura (evita piscar) -->
<script>document.documentElement.dataset.motion = new URLSearchParams(location.search).get('motion') === 'off' ? 'off' : matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';</script>`;

Object.assign(recipes, {
  'smooth-scroll': {
    react: `import { SmoothScroll } from '@caramelo/design-system';

// Uma vez na raiz do app. Requer \`npm i lenis\` (opcional: sem ele, scroll nativo).
<SmoothScroll />  // lerp 0.075 · só mouse/trackpad · âncoras com offset de --cm-header-height`,
    html: HEAD_SNIPPET,
    js: MOTION_INIT,
    notes: [
      'Defina --cm-header-height no :root com a altura do cabeçalho fixo.',
      'getSmoothScroll().stop()/start() ao abrir/fechar diálogos.',
      'scrollToTarget(el) rola com offset e move o foco.',
    ],
  },
  'line-mask-reveal': {
    react: `import { LineReveal } from '@caramelo/design-system';

<LineReveal as="h2" className="cm-type-display">
  Marca não é só<br />o que ela diz.
</LineReveal>

{/* Hero: ao carregar */}
<LineReveal as="h1" trigger="load" className="cm-type-hero">UM CARA<br />CARAMELO</LineReveal>`,
    html: `<h2 class="cm-type-display" data-cm-reveal="lines">Marca não é só<br>o que ela diz.</h2>`,
    js: MOTION_INIT,
  },
  'clip-reveal': {
    react: `import { Reveal, InViewVideo } from '@caramelo/design-system';

{films.map((f, i) => (
  <Reveal key={f.id} variant="clip" index={i} trigger="load" className="overflow-hidden rounded-cm-lg">
    <InViewVideo src={f.src} poster={f.poster} />
  </Reveal>
))}`,
    html: `<figure data-cm-reveal="clip" style="--cm-i:0"><img src="capa.webp" alt="…"></figure>`,
    js: MOTION_INIT,
  },
  'soft-rise': {
    react: `<Reveal variant="rise"><p className="cm-type-lead">…</p></Reveal>`,
    html: `<div data-cm-reveal="rise">…</div>`,
    js: MOTION_INIT,
  },
  'tilt-entrance': {
    react: `<div className="grid gap-4 md:grid-cols-2">
  <Reveal variant="tilt" index={0} className="cm-lift rounded-cm-lg bg-cream p-8 text-ink">…</Reveal>
  <Reveal variant="tilt" index={1} className="cm-lift rounded-cm-lg bg-violet-hover p-8 text-cream">…</Reveal>
</div>`,
    html: `<a class="cm-lift" data-cm-reveal="tilt" style="--cm-i:0" href="#trabalho">…<span class="cm-lift__arrow" aria-hidden="true">↗</span></a>`,
    js: MOTION_INIT,
  },
  'calm-reveal': {
    react: `{items.map((item) => <Reveal key={item.id} variant="calm">…</Reveal>)}`,
    html: `<article data-cm-reveal="calm" data-cm-calm>…</article>`,
    js: MOTION_INIT,
  },
  'scroll-depth': {
    react: `import { Parallax } from '@caramelo/design-system';

{/* Linhas da hero derivando ao sair (LP) */}
<Parallax start="top top" end="bottom top" to={{ y: -30, x: -12, opacity: 0.72 }}>
  <span className="cm-type-hero">UM CARA</span>
</Parallax>
<Parallax start="top top" end="bottom top" to={{ y: -55, x: 12, opacity: 0.72 }}>
  <span className="cm-type-hero">CARAMELO</span>
</Parallax>

{/* Selo que gira com o scroll do contato */}
<Parallax start="top bottom" end="bottom bottom" from={{ rotate: -12, scale: 0.88 }} to={{ rotate: 8, scale: 1.04 }} scrub={0.4}>…</Parallax>`,
    html: `<!-- data-cm-scrub = suavização em segundos; o JS escreve --cm-p (0–1) -->
<div data-cm-scrub="0.5" data-cm-start="top top" data-cm-end="bottom top"
     style="transform: translateY(calc(var(--cm-p, 0) * -55px))">…</div>`,
    js: MOTION_INIT,
  },
  'scroll-progress': {
    react: `import { ScrollProgress, SceneNav } from '@caramelo/design-system';

<ScrollProgress />
<SceneNav scenes={[{ id: 'hero', label: 'Início' }, { id: 'work', label: 'Trabalho' }, { id: 'contato', label: 'Contato' }]} />`,
    html: `<div class="cm-progress" data-cm-progress aria-hidden="true"><i class="cm-progress__fill"></i></div>`,
    js: MOTION_INIT,
  },
  'pointer-trail': {
    react: `import { PointerTrail } from '@caramelo/design-system';

<PointerTrail as="section" items={projetos.map((p) => p.poster)} className="min-h-[80vh]">
  <h1 className="cm-type-hero">UM CARA CARAMELO</h1>
</PointerTrail>`,
    html: `<section data-cm-trail class="cm-trail">
  <h1 class="cm-type-hero">UM CARA CARAMELO</h1>
  <div class="cm-trail__layer" aria-hidden="true">
    <div class="cm-trail__slot"><img src="poster-1.webp" alt=""></div>
    <div class="cm-trail__slot"><img src="poster-2.webp" alt=""></div>
    <!-- … 8 slots -->
  </div>
</section>`,
    js: MOTION_INIT,
    notes: ['Use pôsteres reais do portfólio (16:10).', 'items aceita nós React — cartões tipográficos funcionam bem.'],
  },
  'pointer-tilt': {
    react: `import { TiltSurface } from '@caramelo/design-system';

<TiltSurface max={3.5} className="rounded-cm-xl bg-ink p-10">
  <p className="cm-type-title">HEAD DE INTERAÇÃO</p>
</TiltSurface>
{/* Controles (botões) ficam FORA do TiltSurface */}`,
    html: `<div class="cm-tilt-space" data-cm-tilt="3.5"><div class="cm-tilt">…</div></div>`,
    js: MOTION_INIT,
  },
  'hover-lift': {
    react: `<a href="#trabalho" className="cm-lift flex min-h-[340px] flex-col rounded-cm-lg bg-cream p-8 text-ink">
  <span className="cm-type-meta">Quero contratar <span className="cm-lift__arrow" aria-hidden="true">↗</span></span>
  <h3 className="cm-type-title mt-auto">Direção de interação</h3>
</a>`,
    html: `<a class="cm-lift" href="#">… <span class="cm-lift__arrow" aria-hidden="true">↗</span></a>`,
  },
  'media-zoom': {
    react: `<a href={p.href} className="cm-media-host block">
  <div className="cm-media-zoom aspect-[1.48] rounded-cm-md"><img src={p.capa} alt={p.titulo} /></div>
</a>`,
    html: `<div class="cm-media-zoom"><img src="capa.webp" alt="…"></div>`,
  },
  'sticky-deck': {
    react: `import { StickyDeck, InViewVideo } from '@caramelo/design-system';

<StickyDeck
  counterLabel="Projeto"
  items={projetos.map((p) => ({
    id: p.id,
    title: p.titulo,
    meta: p.ano,
    media: <InViewVideo src={p.video} poster={p.poster} />,
  }))}
/>`,
    notes: ['Defina --cm-header-height para o palco grudar abaixo do cabeçalho.', 'Abaixo de 900×520, em touch ou com movimento reduzido vira lista.'],
  },
  'sticky-stack': {
    react: `import { StickyStack } from '@caramelo/design-system';

<StickyStack>
  <article className="rounded-cm-xl bg-surface-2 p-8">Oferta 1…</article>
  <article className="rounded-cm-xl bg-surface-2 p-8">Oferta 2…</article>
</StickyStack>`,
  },
  'scrub-words': {
    react: `import { ScrubWords } from '@caramelo/design-system';

<ScrubWords as="p" className="cm-type-display-sm" text="Marca não é só o que ela diz. É o que ela faz você fazer." />`,
  },
  'compare-slider': {
    react: `import { CompareSlider } from '@caramelo/design-system';

<CompareSlider
  label="Experiência imersiva"
  valueText="{value}% de experiência imersiva"
  scrollDriven
  before={<PaginaEstatica />}
  after={<Experiencia />}
/>`,
  },
  'staged-entrance': {
    react: `<section className="cm-enter--bg">
  <p className="cm-enter" style={{ '--cm-delay': '.16s' } as React.CSSProperties}>Aula 03</p>
  <h1 className="cm-enter cm-enter--headline" style={{ '--cm-delay': '.28s' } as React.CSSProperties}>Direção de interação</h1>
  <article className="cm-enter cm-enter--card" style={{ '--cm-delay': '.4s' } as React.CSSProperties}>…</article>
  <button className="cm-enter cm-enter--pop" style={{ '--cm-delay': '.54s' } as React.CSSProperties}>Começar</button>
</section>`,
    html: `<h1 class="cm-enter cm-enter--headline" style="--cm-delay:.28s">…</h1>`,
  },
  'in-view-video': {
    react: `import { InViewVideo } from '@caramelo/design-system';

<InViewVideo src="/filmes/projeto.webm" poster="/filmes/projeto.webp" />`,
    html: `<video data-cm-autoplay muted playsinline loop preload="metadata" poster="p.webp" src="p.webm"></video>`,
    js: MOTION_INIT,
  },
} satisfies Record<string, Recipe>);
