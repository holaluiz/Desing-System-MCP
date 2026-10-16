/**
 * Lógica das Ferramentas MCP — Um Cara Caramelo (Laboratório de Interação)
 * Contraste, mapeamento de cores, tokens e gerador de componentes.
 * Auditoria e transformação vivem em ./engine (audit.ts / transform.ts).
 */

import { brandSpectrum, colors, contrastRatios, neutral } from '../tokens/colors';
import { interactions } from '../tokens/interactions';
import { motion } from '../tokens/motion';
import { darkTheme, hexToTriplet, lightTheme, sceneAccents, semanticRoles, type SemanticRole } from '../tokens/semantic';
import { shadows } from '../tokens/shadows';
import { lumenRadii, spacing, targets } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import { BRAND_SWATCHES, classify, nearestBrand, roleHex, type Polarity } from './engine/brand';
import { contrastRatio, deltaE, formatOklch, parseColor, toHex, type HueFamily } from './engine/color';
import { roleFor, type MapOptions } from './engine/tailwind-map';
import { brandAssetMetadata, logoMarkup } from './brand-assets';

// ═══════════════════════════════════════════════════════════════════
// 1. Contraste WCAG (qualquer formato) + alternativas da marca
// ═══════════════════════════════════════════════════════════════════

export function calculateContrast(foreground: string, background: string, textSize: 'normal' | 'large' | 'ui' = 'normal') {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) {
    return { error: `Cor inválida: ${!fg ? foreground : background}. Aceito: #hex, rgb(), hsl(), oklch(), triplets "222 47% 11%" ou "16 16 20", nomes básicos.` };
  }
  const ratio = contrastRatio(fg, bg.a < 1 ? { ...bg, a: 1 } : bg);
  const min = textSize === 'normal' ? 4.5 : 3;
  const result = {
    foreground: toHex(fg),
    background: toHex(bg),
    ratio: `${ratio.toFixed(2)}:1`,
    requirement: `${min}:1 (${textSize === 'normal' ? 'texto normal' : textSize === 'large' ? 'texto grande ≥24px ou ≥18.66px bold' : 'componente de interface / ícone'})`,
    AA: ratio >= min,
    AAA: textSize === 'ui' ? null : ratio >= (textSize === 'normal' ? 7 : 4.5),
    nearestBrand: { foreground: nearestBrand(fg), background: nearestBrand(bg) },
    alternatives: [] as Array<{ token: string; hex: string; ratio: string; deltaE: number }>,
    recommendation: '',
  };
  if (ratio >= min) {
    result.recommendation = ratio >= 7 ? 'Contraste excelente (AAA).' : 'Passa AA. Para texto longo, prefira ≥7:1 (text-fg-muted ou acima).';
    return result;
  }
  // Tintas da marca + papéis semânticos que passam sobre ESTE fundo, ordenados pela proximidade da cor original
  const candidates = new Map<string, string>();
  for (const s of BRAND_SWATCHES) candidates.set(s.token, s.hex);
  for (const theme of ['dark', 'light'] as Polarity[])
    for (const role of ['fg', 'fg-2', 'fg-muted', 'fg-dim', 'accent-ink', 'accent-contrast', 'on-status'] as SemanticRole[])
      candidates.set(`${role} (${theme === 'dark' ? 'escuro' : 'claro'})`, roleHex(role, theme));
  result.alternatives = Array.from(candidates.entries())
    .map(([token, hex]) => {
      const c = parseColor(hex)!;
      return { token, hex, r: contrastRatio(c, bg), d: deltaE(fg, c) };
    })
    .filter((c) => c.r >= min)
    .sort((a, b) => a.d - b.d)
    .slice(0, 4)
    .map((c) => ({ token: c.token, hex: c.hex, ratio: `${c.r.toFixed(2)}:1`, deltaE: +c.d.toFixed(1) }));
  result.recommendation = `Falha WCAG (${ratio.toFixed(2)}:1 < ${min}:1). ${
    result.alternatives.length ? `Mais próxima que passa: ${result.alternatives[0].token} ${result.alternatives[0].hex}.` : 'Troque o fundo por um papel de superfície (stage/surface-*).'
  } Em código, use papéis (text-fg-muted, text-accent-ink, text-accent-contrast) — o contraste fica garantido nos dois temas.`;
  return result;
}

// ═══════════════════════════════════════════════════════════════════
// 2. Mapeamento de cores de qualquer sistema → marca
// ═══════════════════════════════════════════════════════════════════

export function mapColors(inputs: string[], polarity: Polarity = 'light') {
  const parsed = inputs.map((input) => ({ input, rgb: parseColor(input) }));
  const counts = new Map<HueFamily, number>();
  for (const p of parsed) {
    if (!p.rgb) continue;
    const f = classify(p.rgb).family;
    if (f !== 'neutral') counts.set(f, (counts.get(f) ?? 0) + 1);
  }
  const primary = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const opts: MapOptions = { primaryFamily: primary, strategy: 'unify', material: 'lumen', theme: polarity, polarity };

  return parsed.map(({ input, rgb }) => {
    if (!rgb) return { input, error: 'formato não reconhecido' };
    const c = classify(rgb);
    const role = (kind: 'bg' | 'text' | 'line') => {
      const r = roleFor(kind, c.family, c.shade, opts);
      return r.role ?? r.literal;
    };
    const vs = (theme: Polarity, against: SemanticRole) => +contrastRatio(rgb, parseColor(roleHex(against, theme))!).toFixed(2);
    return {
      input,
      hex: toHex(rgb),
      oklch: formatOklch(rgb),
      family: c.family,
      shade: c.shade,
      nearestBrand: nearestBrand(rgb),
      asRole: { background: role('bg'), text: role('text'), border: role('line') },
      contrast: { onDarkStage: vs('dark', 'stage'), onLightStage: vs('light', 'stage') },
    };
  });
}

// ═══════════════════════════════════════════════════════════════════
// 3. Tokens
// ═══════════════════════════════════════════════════════════════════

function semanticCss(theme: Record<SemanticRole, string>, indent = '  '): string {
  return (Object.keys(theme) as SemanticRole[]).map((r) => `${indent}--cm-${r}: ${hexToTriplet(theme[r])};`).join('\n');
}

export function tokensCss(): string {
  const accents = Object.entries(sceneAccents)
    .map(
      ([name, a]) =>
        `[data-cm-accent="${name}"] { --cm-accent: ${hexToTriplet(a.dark.accent)}; --cm-accent-bright: ${hexToTriplet(a.dark.bright)}; --cm-accent-ink: ${hexToTriplet(a.dark.ink)}; --cm-accent-soft: ${hexToTriplet(a.dark.soft)}; --cm-accent-contrast: ${hexToTriplet(a.dark.contrast)}; }\n` +
        `[data-caramelo-theme="light"] [data-cm-accent="${name}"], [data-caramelo-theme="light"][data-cm-accent="${name}"] { --cm-accent: ${hexToTriplet(a.light.accent)}; --cm-accent-bright: ${hexToTriplet(a.light.bright)}; --cm-accent-ink: ${hexToTriplet(a.light.ink)}; --cm-accent-soft: ${hexToTriplet(a.light.soft)}; --cm-accent-contrast: ${hexToTriplet(a.light.contrast)}; }`
    )
    .join('\n');
  return `/* Caramelo Design System — tokens (gerado pelo MCP). Prefira importar '@caramelo/design-system/styles.css'. */
:root {
  color-scheme: dark;
  --caramelo-color-ink: #101014;
${semanticCss(darkTheme)}
  --cm-spectrum-gradient: ${brandSpectrum.gradient};
  --cm-spectrum: var(--cm-spectrum-gradient);
  --cm-spectrum-soft: linear-gradient(110deg, #FFAE7B 0%, #FF8FBD 24%, #B6A5FF 48%, #8ADEFF 72%, #FFE889 100%);
  --cm-spectrum-glow: ${shadows['glow-sm']};
  --cm-spectrum-glow-strong: ${shadows.glow};
  --cm-glow-sm: var(--cm-spectrum-glow);
  --cm-glow: var(--cm-spectrum-glow-strong);
  --cm-focus-ring: 0 0 0 2px rgb(var(--cm-stage)), 0 0 0 4px rgb(var(--cm-focus));
${Object.entries(lumenRadii)
  .map(([k, v]) => `  --cm-radius-${k}: ${v};`)
  .join('\n')}
  --cm-ease-out: ${motion.easings.out};
  --cm-ease-quint: ${motion.easings.quint};
  --cm-ease-drawer: ${motion.easings.drawer};
  --cm-ease-standard: ${motion.easings.standard};
  --cm-ease-in: ${motion.easings.in};
  --cm-ease-spring: ${motion.easings.spring};
${(['instant', 'micro', 'quick', 'base', 'smooth', 'cinematic'] as const).map((d) => `  --cm-dur-${d}: ${motion.durations[d]};`).join('\n')}
  --caramelo-font-display: Montserrat, Inter, system-ui, sans-serif;
  --caramelo-font-sans: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
  --caramelo-font-handwriting: "Covered By Your Grace", cursive;
  --caramelo-font-mono: ui-monospace, SFMono-Regular, Consolas, monospace;
}

[data-caramelo-theme="light"] {
  color-scheme: light;
${semanticCss(lightTheme)}
}

/* Caramel #FF701A destaca detalhes sólidos; assinatura e motion combinam as cinco cores. neutral é explícito. */
${accents}

@media (prefers-reduced-motion: reduce) {
  :root { --cm-dur-quick: 120ms; --cm-dur-base: 160ms; --cm-dur-smooth: 160ms; --cm-dur-cinematic: 160ms; }
}`;
}

export function semanticTable() {
  return (Object.keys(semanticRoles) as SemanticRole[]).map((role) => {
    const d = parseColor(darkTheme[role])!;
    const l = parseColor(lightTheme[role])!;
    return {
      role,
      tailwind: role.startsWith('surface') || role === 'stage' ? `bg-${role}` : role.startsWith('line') ? `border-${role}` : role.endsWith('soft') ? `bg-${role}` : `text-${role} / bg-${role}`,
      css: `rgb(var(--cm-${role}))`,
      dark: darkTheme[role],
      light: lightTheme[role],
      contrastOnStage: { dark: +contrastRatio(d, parseColor(darkTheme.stage)!).toFixed(2), light: +contrastRatio(l, parseColor(lightTheme.stage)!).toFixed(2) },
      use: semanticRoles[role],
    };
  });
}

export function tokensPayload(format: 'json' | 'css' | 'tailwind' | 'semantic' | 'all') {
  if (format === 'css') return tokensCss();
  if (format === 'semantic') return { roles: semanticTable(), sceneAccents, brandSpectrum, usage: 'Superfícies neutras; Caramel #FF701A em detalhes sólidos via accent/accent-ink. CTAs de marca: cm-brand-action; badges: cm-brand-badge; barras: cm-brand-meter. Assinatura e motion preservam os degradês das cinco cores. data-cm-accent="neutral" aplica detalhes neutros explicitamente.' };
  if (format === 'tailwind')
    return {
      install: "import { carameloPreset } from '@caramelo/design-system/tailwind'; export default { presets: [carameloPreset], content: [...] }",
      roles: Object.keys(semanticRoles),
      boxShadow: ['elev-1', 'elev-2', 'elev-3', 'elev-4', 'pressed', 'glow', 'glow-sm', 'focus', 'graphic-sm', 'graphic-md', 'graphic-lg'],
      borderRadius: Object.keys(lumenRadii).map((k) => (k === 'pill' ? 'rounded-pill' : `rounded-cm-${k}`)),
      transitionDuration: ['duration-instant', 'duration-micro', 'duration-quick', 'duration-base', 'duration-smooth', 'duration-cinematic'],
      transitionTimingFunction: ['ease-out-expo', 'ease-out-quint', 'ease-drawer', 'ease-standard', 'ease-in-expo', 'ease-spring', 'ease-kinetic'],
      animation: ['animate-cm-reveal', 'animate-cm-menu-in', 'animate-cm-pop', 'animate-cm-shake', 'animate-cm-pulse'],
      fontFamily: ['font-display', 'font-sans', 'font-handwriting', 'font-mono'],
    };
  const base = { colors, brandSpectrum, neutral, contrastRatios, semantic: { dark: darkTheme, light: lightTheme, sceneAccents }, typography, spacing, lumenRadii, targets, shadows, motion, brandAssets: brandAssetMetadata() };
  if (format === 'json') return base;
  return {
    system: 'Um Cara Caramelo — Laboratório de Interação',
    version: '2.0.0 (2026)',
    principle: 'STILLNESS = CAMADAS ALINHADAS • MOVEMENT = CAMADAS SE SEPARAM',
    materials: { lumen: 'Produto digital: aresta de luz, hairlines, luz espectral combinada, raios concêntricos.', print: 'Editorial/cartaz: sombra sólida, arestas retas, retícula.' },
    ...base,
    interactions: interactions.map((i) => i.id),
  };
}

// ═══════════════════════════════════════════════════════════════════
// 4. Gerador de componentes
// ═══════════════════════════════════════════════════════════════════

export type ComponentType =
  | 'logo'
  | 'isotype'
  | 'button'
  | 'hero'
  | 'card'
  | 'feature_grid'
  | 'form'
  | 'input'
  | 'tabs'
  | 'menu'
  | 'badge'
  | 'command'
  | 'layer_split'
  | 'lockup'
  | 'cinematic_hero'
  | 'portfolio_deck'
  | 'manifesto';

const esc = (s: string) => s.replace(/[<>{}]/g, '');

export function generateComponent(type: ComponentType, title: string, framework: 'react-tailwind' | 'html-tailwind' | 'pure-css' = 'react-tailwind', material: 'lumen' | 'print' = 'lumen'): string {
  if (type === 'logo' || type === 'isotype') return logoMarkup(framework === 'react-tailwind' ? 'react' : framework === 'pure-css' ? 'svg' : 'html');
  const t = esc(title);
  if (framework !== 'react-tailwind') {
    const html = htmlTemplate(type, t, material);
    if (html) return `<!-- Requer: <link rel="stylesheet" href="@caramelo/design-system/styles.css"> (classes cm-* em CSS puro) -->\n${html}`;
  }
  return material === 'print' ? printTemplate(type, t) : lumenTemplate(type, t);
}

function lumenTemplate(type: ComponentType, t: string): string {
  switch (type) {
    case 'cinematic_hero':
      return `import { LineReveal, Parallax, PointerTrail, Reveal, MagneticButton, IconArrowRight } from '@caramelo/design-system';

// Hero Caramelo: copie assets/stickers para public/caramelo/stickers; rastro sempre com figurinhas canônicas.
// e profundidade ao sair. Monte <SmoothScroll /> na raiz e defina --cm-header-height.
export function CinematicHero({ posters }: { posters: string[] }) {
  return (
    <PointerTrail as="section" appearance="stickers" className="relative bg-stage px-6 pb-16 pt-32 text-fg">
      <p className="cm-type-meta mb-10 text-fg-dim"><span>Laboratório de interação</span><span>2026</span></p>
      <Parallax start="top top" end="bottom top" to={{ y: -30, x: -12, opacity: 0.72 }}>
        <LineReveal as="h1" trigger="load" className="cm-type-hero">
          ${t ? t.replace(/\s+/, '<br />') : 'UM CARA<br />CARAMELO'}
        </LineReveal>
      </Parallax>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {posters.slice(0, 3).map((src, i) => (
          <Reveal key={src} variant="clip" trigger="load" index={2 - i} className="cm-media-zoom aspect-[16/10] rounded-cm-lg">
            <img src={src} alt="" className="h-full w-full object-cover" />
          </Reveal>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
        <MagneticButton variant="accent" size="lg" fill swap icon={<IconArrowRight />}>Ver trabalhos</MagneticButton>
        <span className="cm-type-hand">← feito à mão, com intenção</span>
      </div>
    </PointerTrail>
  );
}`;
    case 'portfolio_deck':
      return `import { LineReveal, StickyDeck, InViewVideo } from '@caramelo/design-system';

export function Portfolio({ projetos }: { projetos: Array<{ id: string; titulo: string; ano: string; video: string; poster: string }> }) {
  return (
    <section id="work" className="bg-stage px-6 py-24 text-fg">
      <LineReveal as="h2" className="cm-type-display mb-12">${t || 'Trabalho<br />selecionado'}</LineReveal>
      <StickyDeck
        counterLabel="Projeto"
        items={projetos.map((p) => ({ id: p.id, title: p.titulo, meta: p.ano, media: <InViewVideo src={p.video} poster={p.poster} /> }))}
      />
    </section>
  );
}`;
    case 'manifesto':
      return `import { ScrubWords, Parallax, Isotype } from '@caramelo/design-system';

export function Manifesto() {
  return (
    <section className="cm-chromatic-tile relative overflow-hidden px-6 py-32 text-cream">
      <ScrubWords as="p" className="cm-type-display-sm max-w-5xl" text="${t || 'Marca não é só o que ela diz. É o que ela faz você fazer.'}" />
      <Parallax className="absolute -right-10 top-10 opacity-20" from={{ rotate: -12 }} to={{ rotate: 18 }} aria-hidden="true"><Isotype variant="cream" size={160} decorative /></Parallax>
    </section>
  );
}`;
    case 'button':
      return `import { MagneticButton, IconArrowRight } from '@caramelo/design-system';

export function PrimaryAction() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Ponto focal da cena: ímã + preenchimento de baixo para cima + troca de texto */}
      <MagneticButton variant="accent" size="lg" fill swap icon={<IconArrowRight />}>
        ${t || 'Começar agora'}
      </MagneticButton>
      <MagneticButton variant="ghost" magnetic={false} fill={false}>
        Ver documentação
      </MagneticButton>
    </div>
  );
}`;
    case 'hero':
      return `import { Reveal, MagneticButton, GlowButton, CommandCopy, Chip, IconArrowRight } from '@caramelo/design-system';

export function Hero() {
  return (
    <section className="cm-ambient relative overflow-hidden bg-stage px-6 pb-24 pt-28 text-fg">
      <div className="cm-grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <Reveal index={0}>
          <Chip><span className="cm-dot cm-dot--pulse" aria-hidden="true" /> Novo · V2 2026</Chip>
        </Reveal>
        <Reveal index={1} as="header">
          <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight text-balance md:text-7xl">
            <span className="cm-text-gradient">${t || 'Estratégia precisa ser sentida.'}</span>
          </h1>
        </Reveal>
        <Reveal index={2}>
          <p className="mx-auto mt-5 max-w-xl text-lg text-fg-muted text-pretty">
            Marca não é só o que ela diz. É o que ela faz você fazer.
          </p>
        </Reveal>
        <Reveal index={3} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <MagneticButton variant="accent" size="lg" fill swap icon={<IconArrowRight />}>Iniciar experiência</MagneticButton>
          <GlowButton tone="ink" href="#casos">Ver casos</GlowButton>
        </Reveal>
        <Reveal index={4} className="mt-10 w-full max-w-md">
          <CommandCopy command={{ npm: 'npm i @caramelo/design-system', pnpm: 'pnpm add @caramelo/design-system' }} />
        </Reveal>
      </div>
    </section>
  );
}`;
    case 'card':
      return `import { Surface, Chip } from '@caramelo/design-system';

export function FeatureCard() {
  return (
    <Surface as="article" spotlight interactive className="flex flex-col gap-3 p-6">
      <Chip>Lumen</Chip>
      <h3 className="font-display text-xl font-bold tracking-tight">${t || 'Luz que responde ao gesto'}</h3>
      <p className="text-fg-muted">O holofote segue o cursor e a borda acende no ponto mais próximo — o card responde sem se mover.</p>
      <a href="#" className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-accent-ink focus-visible:outline-none focus-visible:shadow-focus rounded-cm-xs">
        Saiba mais <span className="cm-arrow" aria-hidden="true">→</span>
      </a>
    </Surface>
  );
}`;
    case 'feature_grid':
      return `import { Reveal, Surface } from '@caramelo/design-system';

const features = [
  { title: 'Papéis semânticos', body: 'Um código, dois temas e cinco cores em uma assinatura.' },
  { title: 'Física de interação', body: 'Press em 80ms, hover em 160ms, nada acima de 400ms.' },
  { title: 'Acessível por padrão', body: 'Foco Electric Sky, contraste AA garantido pelo token.' },
];

export function FeatureGrid() {
  return (
    <section className="bg-stage px-6 py-24 text-fg">
      <h2 className="mx-auto max-w-2xl text-center font-display text-4xl font-extrabold tracking-tight text-balance">${t || 'Detalhe é estratégia'}</h2>
      <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} index={i}>
            <Surface spotlight className="h-full p-6">
              <h3 className="font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-fg-muted">{f.body}</p>
            </Surface>
          </Reveal>
        ))}
      </div>
    </section>
  );
}`;
    case 'form':
    case 'input':
      return `import { FocusField, MagneticButton } from '@caramelo/design-system';

export function ContactForm() {
  return (
    <form className="flex max-w-md flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <h2 className="font-display text-2xl font-bold tracking-tight">${t || 'Fale com o laboratório'}</h2>
      {/* Rótulo flutuante (nunca some), borda acende e um traço de luz percorre o topo */}
      <FocusField label="Nome" autoComplete="name" required />
      <FocusField label="E-mail" type="email" autoComplete="email" hint="Respondemos em até 1 dia útil." required />
      <FocusField label="Mensagem" multiline rows={4} />
      <MagneticButton type="submit" variant="accent" fill magnetic={false}>Enviar</MagneticButton>
    </form>
  );
}`;
    case 'tabs':
      return `import { SpotlightTabs } from '@caramelo/design-system';

export function ViewSwitcher() {
  return (
    <SpotlightTabs
      ariaLabel="${t || 'Visualização'}"
      defaultValue="visao"
      items={[
        { id: 'visao', label: 'Visão geral', content: <p className="text-fg-muted">…</p> },
        { id: 'tokens', label: 'Tokens', content: <p className="text-fg-muted">…</p> },
        { id: 'motion', label: 'Motion', content: <p className="text-fg-muted">…</p> },
      ]}
    />
  );
}`;
    case 'menu':
      return `import { GlideMenu } from '@caramelo/design-system';

export function ProjectActions() {
  return (
    <GlideMenu
      label="${t || 'Ações do projeto'}"
      trigger="Ações"
      items={[
        { id: 'duplicar', label: 'Duplicar', shortcut: 'D' },
        { id: 'mover', label: 'Mover para', items: [{ id: 'arquivo', label: 'Arquivo' }, { id: 'lab', label: 'Laboratório' }] },
        { id: 'sep', label: '', separator: true },
        { id: 'excluir', label: 'Excluir', tone: 'danger' },
      ]}
    />
  );
}`;
    case 'badge':
      return `import { Chip } from '@caramelo/design-system';

export function StatusBadges() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Chip><span className="cm-dot cm-dot--pulse" aria-hidden="true" /> ${t || 'Ao vivo'}</Chip>
      <span className="cm-brand-badge inline-flex h-6 items-center rounded-pill px-2.5 text-xs font-medium">Novo</span>
      <span className="inline-flex h-6 items-center rounded-pill bg-success-soft px-2.5 text-xs font-medium text-success">Ativo</span>
      <span className="inline-flex h-6 items-center rounded-pill bg-danger-soft px-2.5 text-xs font-medium text-danger">Falhou</span>
    </div>
  );
}`;
    case 'command':
      return `import { CommandCopy } from '@caramelo/design-system';

export function Install() {
  return <CommandCopy command={{ npm: 'npm i ${t || '@caramelo/design-system'}', pnpm: 'pnpm add ${t || '@caramelo/design-system'}', yarn: 'yarn add ${t || '@caramelo/design-system'}' }} />;
}`;
    default:
      return printTemplate(type, t);
  }
}

function printTemplate(type: ComponentType, t: string): string {
  switch (type) {
    case 'button':
      return `import { Button } from '@caramelo/design-system';

export function ActionButton() {
  // Física Print: sobe no hover (sombra cresce), afunda no clique (sombra some)
  return <Button variant="primary" size="md">${t || 'Explorar o lab'}</Button>;
}`;
    case 'hero':
      return `import { DisplayHeading, Text, HandwrittenNote, Button, Lockup } from '@caramelo/design-system';

export function HeroSection() {
  return (
    <section className="caramelo-halftone-subtle relative flex min-h-[85vh] flex-col justify-between overflow-hidden border-b-2 border-ink-border bg-ink p-8 text-cream md:p-16">
      <header><Lockup type="institucional" size="md" variant="cream" /></header>
      <div className="my-auto max-w-4xl py-12">
        <HandwrittenNote color="yellow" rotate="-1">“Elegância + pequena confissão patética.”</HandwrittenNote>
        <DisplayHeading size="xl" className="mt-4 leading-[0.92]">${t || 'ESTRATÉGIA PRECISA SER SENTIDA.'}</DisplayHeading>
        <Text size="lg" variant="muted" className="mt-6 max-w-xl">Marca não é só o que ela diz. É o que ela faz você fazer.</Text>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button variant="primary" size="lg">Iniciar experiência</Button>
          <Button variant="ink" size="lg">Ver casos canônicos</Button>
        </div>
      </div>
    </section>
  );
}`;
    case 'layer_split':
      return `import { LayerSplit, Eyebrow } from '@caramelo/design-system';

export function MotionCard() {
  return (
    <LayerSplit className="max-w-md">
      <Eyebrow>Princípio de movimento</Eyebrow>
      <h3 className="mb-1 mt-2 font-display text-2xl font-black uppercase">${t || 'STILLNESS → MOVEMENT'}</h3>
      <p className="text-sm text-fg-muted">Passe o cursor: as camadas se separam e revelam a sombra sólida.</p>
    </LayerSplit>
  );
}`;
    case 'lockup':
      return `import { Lockup } from '@caramelo/design-system';

export function BrandLockup() {
  return <Lockup type="autoral" size="lg" variant="cream" />;
}`;
    case 'badge':
      return `import { Badge } from '@caramelo/design-system';

export function Badges() {
  return <Badge>${t || 'Novo'}</Badge>;
}`;
    default:
      return `import { Card, DisplayHeading, Button } from '@caramelo/design-system';

export function CarameloCard() {
  return (
    <Card variant="dark" halftone interactive className="p-6">
      <DisplayHeading size="md">${t || 'Estrutura com intenção'}</DisplayHeading>
      <div className="mt-4"><Button variant="primary">Confirmar</Button></div>
    </Card>
  );
}`;
  }
}

function htmlTemplate(type: ComponentType, t: string, material: 'lumen' | 'print'): string | null {
  if (material === 'print') return null;
  switch (type) {
    case 'button':
      return `<button type="button" class="cm-btn cm-btn--accent cm-btn--lg cm-btn--fill">
  <span class="cm-btn__fill" aria-hidden="true"></span>
  <span class="cm-btn__label">${t || 'Começar agora'} <span class="cm-arrow" aria-hidden="true">→</span></span>
</button>`;
    case 'card':
      return `<article class="cm-surface cm-surface--interactive" style="padding:24px">
  <span class="cm-chip">Lumen</span>
  <h3 class="cm-heading" style="font-size:20px;margin:12px 0 6px">${t || 'Luz que responde ao gesto'}</h3>
  <p style="color:rgb(var(--cm-fg-muted))">O card responde sem se mover.</p>
  <a href="#" class="cm-underline">Saiba mais <span class="cm-arrow" aria-hidden="true">→</span></a>
</article>`;
    case 'input':
    case 'form':
      return `<form style="display:grid;gap:16px;max-width:420px">
  <div class="cm-field">
    <input id="email" class="cm-field__input" type="email" placeholder=" " autocomplete="email" />
    <label for="email" class="cm-field__label">E-mail</label>
    <span class="cm-field__beam" aria-hidden="true"></span>
  </div>
  <button type="submit" class="cm-btn cm-btn--accent cm-btn--fill"><span class="cm-btn__fill" aria-hidden="true"></span><span class="cm-btn__label">${t || 'Enviar'}</span></button>
</form>`;
    case 'hero':
      return `<section class="cm-stage cm-ambient" style="padding:112px 24px;text-align:center">
  <span class="cm-chip"><span class="cm-dot cm-dot--pulse" aria-hidden="true"></span> Novo · V2 2026</span>
  <h1 class="cm-heading cm-text-gradient" style="font-size:clamp(40px,7vw,72px);margin:24px auto 0;max-width:16ch">${t || 'Estratégia precisa ser sentida.'}</h1>
  <p style="color:rgb(var(--cm-fg-muted));max-width:36rem;margin:20px auto 0;font-size:18px">Marca não é só o que ela diz. É o que ela faz você fazer.</p>
  <div style="margin-top:36px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
    <a class="cm-btn cm-btn--accent cm-btn--lg cm-btn--fill" href="#"><span class="cm-btn__fill" aria-hidden="true"></span><span class="cm-btn__label">Iniciar experiência</span></a>
    <a class="cm-glow-btn cm-glow-btn--ink" href="#casos">Ver casos</a>
  </div>
</section>`;
    default:
      return null;
  }
}

