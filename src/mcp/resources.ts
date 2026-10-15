/**
 * Recursos Oficiais expostos via MCP — Um Cara Caramelo (V2 2026)
 */

import { interactions } from '../tokens/interactions';
import { semanticRoles } from '../tokens/semantic';
import { semanticTable, tokensCss, tokensPayload } from './tools';

const manual = `# Um Cara Caramelo — Manual de Identidade e Interação (V2 2026)

## Princípio central
**STILLNESS = CAMADAS ALINHADAS • MOVEMENT = CAMADAS SE SEPARAM**
"Detalhe é estratégia: toda resposta chega antes da dúvida."

## Dois materiais, uma identidade
| Material | Onde | Assinatura |
|---|---|---|
| **Lumen** | Produto digital, apps, dashboards, landing pages | Palco escuro, aresta de luz de 1px, hairlines, glow do acento, raios concêntricos (3/5/8/12/16/22px) |
| **Print** | Editorial, campanhas, cartazes | Sombra gráfica sólida, arestas retas, retícula Ben-Day, desalinhamento CMYK |
Regra: **um material por superfície** — nunca sombra sólida e glow no mesmo elemento.

## Cor
- Base: Ink (#101014 → stage #0A0A0D) e Warm Cream (#FFF4E8).
- Assinatura: Caramel #FF701A. Acentos de cena: Sky #25BFFF, Pink #FF3D8D, Violet #7657FF, Yellow #FFD52A.
- Funcional: Signal Mint #3DDC97 — só sucesso, nunca decorativo.
- **Regra de ouro: 1 acento dominante por cena.** Troque com \`data-cm-accent="sky"\` no contêiner.
- Código nunca usa hex: usa **papéis semânticos** (stage, surface-1..3, line, fg, fg-muted, accent, accent-ink, accent-contrast…).
- Texto sobre Caramel é Ink (6.86:1) — **nunca Cream sobre Caramel (2.55:1)**.
- fg-faint é só para não-texto (ícones decorativos, disabled).

## Tipografia (fontes do LP — ADR-006)
1. **Montserrat 800–900** (font-display): títulos de cena, números, wordmark. Entrelinha 0.88–1.03,
   tracking −0.065em (hero −0.073em). Escala: text-cm-hero · text-cm-display · text-cm-display-sm ·
   text-cm-title · text-cm-subtitle · text-cm-heading (ou classes .cm-type-*).
2. **Inter 400–600** (font-sans): leitura e interface; apoio 13–15px; meta 11px caixa alta tracking 0.1em (text-cm-meta).
3. **Covered By Your Grace 400** (font-handwriting): notas curtas giradas −3°/−4° no acento. Nunca em botões ou parágrafos.
4. Mono do sistema (ui-monospace): comandos, tokens, atalhos.
Fontes auto-hospedadas (WOFF2 + OFL) dentro do styles.css — sem request ao Google em runtime.

## Motion cinematográfico (sites do Luiz)
- Smooth scroll Lenis (lerp 0.075) só com mouse; âncoras com offset do cabeçalho e foco no destino.
- Títulos linha a linha por máscara (900ms power4.out, 90ms entre linhas); mídia por recorte (950ms power3.inOut).
- Entradas que já começam legíveis (opacidade .65, 18px) — nunca esconder conteúdo de quem lê.
- Profundidade ao sair da hero, barra de progresso + navegação por cenas, pilha de cartões sticky,
  ofertas sticky que chegam, palavras que acendem, comparador antes/depois.
- Mouse: rastro de imagens (nunca cobre CTAs), tilt de cartaz ≤3.5°, cartões que sobem 7px.
- Regras: conteúdo legível sem JS; uma dona de transform por superfície; geometria medida só no refresh;
  foco de teclado nunca chega num elemento mascarado; experiência completa só com ponteiro fino e tela
  grande — touch e movimento reduzido recebem fluxo nativo; ?motion=off desliga tudo.

## Física de interação (UX)
- Press ≤ 100ms (\`active:scale-[0.97] duration-instant\`) — o gesto precisa "pegar".
- Hover/cor ~160ms (\`duration-micro ease-out-expo\`).
- Indicadores, menus, trocas: 240–320ms (\`ease-drawer\`).
- Revelações narrativas: 480–640ms — nunca em controles.
- Nada que bloqueie a próxima ação passa de 400ms (Doherty).
- Foco de teclado: anel Electric Sky com respiro (\`focus-visible:shadow-focus\`) — distinto do acento.
- \`prefers-reduced-motion\`: sem deslocamento, escala, blur ou paralaxe; só opacidade ≤160ms.
- Nunca \`transition-all\`: liste as propriedades.

## Acessibilidade mínima
Contraste AA (4.5:1 texto, 3:1 texto grande/ícones), alvo ≥ 24px (40px recomendado, 44px mobile),
rótulo real em todo campo (placeholder não é rótulo), nome acessível em botões de ícone,
<button> para ações e <a href> para navegação.

## Setup
\`\`\`ts
// tailwind.config.ts
import { carameloPreset } from '@caramelo/design-system/tailwind';
export default { presets: [carameloPreset], content: ['./src/**/*.{ts,tsx}'] };
// raiz do app
import '@caramelo/design-system/styles.css';
\`\`\`
Tema claro: \`data-caramelo-theme="light"\` no <html>. Alternador: \`<ThemeToggle />\`.`;

const engineGuide = `# Como o motor transforma qualquer sistema em Caramelo

1. **Lê a origem**: polaridade (design claro/escuro), acento dominante (família cromática mais usada em
   preenchimentos e CTAs), material e tokens já existentes.
2. **Cores → papéis**, com contexto do elemento:
   - neutros por polaridade (em design claro, bg-white = surface-1 e bg-gray-900 = elemento invertido = fg);
   - acento da origem → accent / accent-ink (texto) / accent-soft (tons 50–200) / accent-bright (hover);
   - vermelho → danger, verde → success, amarelo → warning, azul secundário → info;
   - texto sobre preenchimento colorido → accent-contrast / on-status (contraste garantido);
   - variantes \`dark:\` são removidas — os papéis já trocam com o tema.
3. **Temas por variáveis** (shadcn, Bootstrap, MUI, Material 3, Chakra, Radix): cada variável recebe o valor
   Caramelo do papel equivalente **no mesmo formato** (triplet HSL, hex, rgb, oklch) — os componentes não mudam.
4. **Material**: sombras borradas → elev-1..4 (Lumen) ou graphic-sm/md (Print); raios → escala concêntrica.
5. **Motion**: \`transition-all\` → propriedades explícitas; durações → tokens; curvas genéricas → expo-out;
   controles acima de 400ms são encurtados.
6. **Interação** (só o que falta): press 0.97, hover luminoso no CTA, foco Electric Sky, halo em campos,
   regras :active/:focus-visible anexadas em CSS, motion-reduce.
7. **Acessibilidade segura**: type="button", alt="", rel="noopener", aria-label inferido do ícone ou do
   placeholder. O que exige julgamento vira "decisão humana" no relatório.

Estratégias de acento: **unify** (padrão — regra de ouro, 1 acento) ou **preserve** (cada matiz vira a tinta
da marca mais próxima: laranja→caramel, azul→sky, rosa/vermelho→pink, violeta→violet, amarelo→yellow, verde→mint).`;

export const mcpResources = [
  {
    uri: 'caramelo://guidelines/manual',
    name: 'Manual de Identidade e Interação V2 2026',
    description: 'Princípios, materiais Lumen/Print, regra cromática, 3 vozes, física de interação, acessibilidade e setup.',
    mimeType: 'text/markdown',
    load: () => manual,
  },
  {
    uri: 'caramelo://guidelines/engine',
    name: 'Guia do Motor de Transformação',
    description: 'Como o MCP converte classes, CSS e temas de terceiros em papéis Caramelo.',
    mimeType: 'text/markdown',
    load: () => engineGuide,
  },
  {
    uri: 'caramelo://tokens/json',
    name: 'Tokens Canônicos (JSON)',
    description: 'Paleta, neutros, temas semânticos, tipografia, espaçamento, raios, sombras e motion.',
    mimeType: 'application/json',
    load: () => JSON.stringify(tokensPayload('json'), null, 2),
  },
  {
    uri: 'caramelo://tokens/css',
    name: 'Tokens em CSS Custom Properties',
    description: 'Variáveis --cm-* (dois temas + acentos de cena) prontas para colar.',
    mimeType: 'text/css',
    load: () => tokensCss(),
  },
  {
    uri: 'caramelo://tokens/semantic',
    name: 'Papéis Semânticos',
    description: 'Cada papel com uso, classe Tailwind, valor nos dois temas e contraste sobre o palco.',
    mimeType: 'application/json',
    load: () => JSON.stringify(semanticTable(), null, 2),
  },
  {
    uri: 'caramelo://interactions/catalog',
    name: 'Catálogo de Microinterações',
    description: 'As receitas de interação, cada uma com o problema de UX que resolve, quando usar, motion e a11y.',
    mimeType: 'text/markdown',
    load: () =>
      `# Microinterações Caramelo\n\n` +
      interactions
        .map(
          (i) =>
            `## ${i.name} (\`${i.id}\`)\n- **Intenção:** ${i.intent}\n- **Quando:** ${i.whenToUse}\n- **Evite:** ${i.avoid}\n- **Motion:** ${i.motion.duration} · ${i.motion.easing}\n- **A11y:** ${i.a11y.join('; ')}\n- **Material:** ${i.material}${i.component ? ` · Componente: \`${i.component}\`` : ''}`
        )
        .join('\n\n'),
  },
  {
    uri: 'caramelo://components/catalog',
    name: 'Catálogo de Componentes',
    description: 'Componentes React do pacote, por material.',
    mimeType: 'text/markdown',
    load: () => `# Componentes Caramelo

## Lumen (produto)
- **MagneticButton** — CTA magnético com preenchimento (variant surface|accent|cream|ghost, fill, swap, icon).
- **GlowButton** — pill com brilho de borda que segue o cursor (tone cream|ink).
- **Surface** — superfície Lumen (level 1|2|3|sunken, spotlight, glow, interactive).
- **SpotlightTabs** — abas com indicador deslizante (variant pill|underline|expand).
- **GlideMenu** — menu com submenus em deslize + desfoque, teclado completo.
- **GlideGroup / GlideItem** — destaque compartilhado que desliza entre itens.
- **FocusField** — campo com rótulo flutuante, feixe de luz e erro com tremida.
- **ScrubNumber** — número ajustável por arraste (spinbutton).
- **CopyButton / CommandCopy** — copiar com troca de ícone e anúncio "Copiado".
- **Reveal** — revelação por desfoque no scroll (index para escalonar).
- **TextSwap** — troca de texto vertical (stagger para letras).
- **ThemeToggle** — troca de tema com revelação diagonal (View Transitions).
- **Kbd / Chip** — atalhos e etiquetas técnicas.

## Motion cinematográfico (LP)
- **SmoothScroll** — Lenis lerp 0.075, só mouse; âncoras com foco.
- **LineReveal** — título linha a linha por máscara (trigger scroll|load).
- **Reveal variant** — blur · rise · tilt · clip · calm.
- **Parallax** — transform dirigido pelo scroll (from/to, scrub).
- **ScrollProgress / SceneNav** — progresso de leitura e cenas laterais.
- **PointerTrail** — rastro de imagens do mouse.
- **TiltSurface** — cartaz que inclina com o ponteiro.
- **StickyDeck** — pilha de cartões sticky (portfólio).
- **StickyStack** — ofertas sticky que chegam.
- **ScrubWords** — palavras que acendem com o scroll.
- **CompareSlider** — antes/depois acessível, opcionalmente dirigido pelo scroll.
- **InViewVideo** — vídeo que só toca visível (máx. 2).
- Classes CSS: cm-lift, cm-media-zoom, cm-enter(--headline|--card|--pop), cm-sheet-in, cm-modal-in.
- HTML puro: initCaramelMotion() de @caramelo/design-system/motion + atributos data-cm-*.

## Print (editorial)
Wordmark, Lockup, Button, DisplayHeading, Text, HandwrittenNote, Eyebrow, Card, Badge, Input, Textarea,
Select, Checkbox, Toggle, Alert, Avatar, Divider, HalftoneOverlay, MisregistrationText, LayerSplit.

Papéis: ${Object.keys(semanticRoles).join(', ')}.`,
  },
];
