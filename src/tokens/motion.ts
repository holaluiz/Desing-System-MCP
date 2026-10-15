/**
 * Motion & Interação — Um Cara Caramelo (Manual V2 2026)
 * "STILLNESS = CAMADAS ALINHADAS  •  MOVEMENT = CAMADAS SE SEPARAM"
 * "DETALHE É ESTRATÉGIA: toda resposta chega antes da dúvida."
 *
 * Regras de tempo (UX):
 *  - Feedback de toque/clique em ≤ 100ms (instant) — o gesto precisa "pegar".
 *  - Hover e cor em ~160ms (micro) — rápido o bastante para não parecer lag.
 *  - Indicadores, menus e trocas de conteúdo em 240–320ms.
 *  - Revelações narrativas em 480–640ms, nunca em controles.
 *  - Nada que bloqueie a próxima ação passa de 400ms (limiar de Doherty).
 */

export const motion = {
  // Durações
  durations: {
    instant: '80ms',
    micro: '160ms',
    quick: '240ms',
    base: '320ms',
    smooth: '480ms',
    cinematic: '640ms',
    slow: '900ms',
    // Aliases V1 (compatibilidade)
    fast: '200ms',
    deliberate: '350ms',
  },

  // Curvas de aceleração (Cinéticas e intencionais)
  easings: {
    // ——— V2 Lumen ———
    /** Padrão de entrada e hover: começa rápido, pousa suave (expo-out) */
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    /** Revelações e textos: um pouco mais de corpo (quint-out) */
    quint: 'cubic-bezier(0.22, 1, 0.36, 1)',
    /** Gavetas, indicadores deslizantes, painéis (curva de sheet nativa) */
    drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
    /** Mudanças de cor/opacidade sem deslocamento */
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    /** Saídas: acelera para fora do caminho */
    in: 'cubic-bezier(0.7, 0, 0.84, 0)',
    /** Overshoot sutil para "pop" de confirmação */
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',

    // ——— Cinemático (LP) — equivalentes CSS das curvas GSAP usadas no site ———
    /** power1.out — trocas curtas de palavra/estado */
    power1Out: 'cubic-bezier(0.5, 1, 0.89, 1)',
    /** power2.out — entradas leves, hover de cartões (420ms), tilt */
    power2Out: 'cubic-bezier(0.33, 1, 0.68, 1)',
    /** power2.inOut — troca espacial de cartões na pilha */
    power2InOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    /** power3.out — cartões que chegam, diálogos, revelação de lista */
    power3Out: 'cubic-bezier(0.25, 1, 0.5, 1)',
    /** power3.inOut — recorte de mídia (clip-path) */
    power3InOut: 'cubic-bezier(0.76, 0, 0.24, 1)',
    /** power4.out — títulos revelados por máscara, palavras da hero */
    power4Out: 'cubic-bezier(0.22, 1, 0.36, 1)',
    /** Editorial do LP — zoom de mídia, letra do método */
    editorial: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
    /** Rastro de imagens do ponteiro */
    trail: 'cubic-bezier(0.2, 0.65, 0.3, 1)',

    // ——— V1 Print (mantidos; kinetic também é a curva-base da aula-head) ———
    kinetic: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    snap: 'cubic-bezier(0.16, 1, 0.3, 1)',
    layerSeparation: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
  },

  /** Molas para bibliotecas JS (Framer Motion / Motion One / React Spring) */
  springs: {
    snappy: { type: 'spring', stiffness: 520, damping: 34, mass: 0.8 },
    smooth: { type: 'spring', stiffness: 300, damping: 30, mass: 1 },
    magnetic: { type: 'spring', stiffness: 180, damping: 16, mass: 0.6 },
  },

  /** Intervalos de escalonamento */
  stagger: {
    letter: '18ms',
    item: '40ms',
    section: '80ms',
  },

  /** Distâncias de deslocamento canônicas */
  distance: {
    nudge: '2px',
    shift: '6px',
    reveal: '16px',
    magneticMax: '8px',
  },

  /** Desfoques usados em transições (blur-glide) */
  blur: {
    sm: '2px',
    md: '8px',
    lg: '16px',
  },

  // Efeitos canônicos V1
  effects: {
    chromaticShiftHover: 'translate(-2px, -2px)',
    chromaticShiftActive: 'translate(1px, 1px)',
    layerSplitOffset: '4px',
    pressScale: '0.97',
  },

  /**
   * Motion cinematográfico — valores medidos nos sites do Luiz (LP, workshop, biblioteca de prompts).
   * Princípios: conteúdo legível sem JS; uma "dona" de transform por superfície; geometria medida
   * só no refresh (resize/fontes), nunca por frame; foco de teclado nunca chega num elemento mascarado.
   */
  cinematic: {
    smoothScroll: { lerp: 0.075, wheelMultiplier: 1, smoothWheel: true, syncTouch: false, anchorDuration: '0.8s' },
    /** Títulos linha a linha por máscara (yPercent 105 → 0) */
    lineReveal: { duration: '900ms', stagger: '90ms', distance: '105%', ease: 'power4Out', start: 'top 92%' },
    /** Palavras da hero ao carregar */
    heroWords: { duration: '1080ms', stagger: '120ms', delay: '80ms', ease: 'power4Out' },
    /** Mídia revelada de baixo para cima (clip-path inset 100% → 0) */
    clipReveal: { duration: '950ms', stagger: '90ms', ease: 'power3InOut' },
    /** Entrada leve: começa LEGÍVEL (opacidade .65), só desliza 18px */
    softRise: { duration: '550ms', distance: '18px', fromOpacity: 0.65, ease: 'power2Out', start: 'top 94%' },
    /** Cartões que chegam girados (portas) */
    tiltEntrance: { duration: '850ms', stagger: '130ms', distance: '45px', rotation: '1.1deg', fromOpacity: 0.45, ease: 'power3Out' },
    /** Hover de cartão: sobe 7px, gira ±0.4°, seta avança 4px */
    hoverLift: { duration: '420ms', lift: '-7px', rotation: '0.4deg', arrow: '4px', ease: 'power2Out' },
    /** Profundidade ao sair da hero (scrub) */
    scrollDepth: { scrub: 0.5, rowY: ['-30px', '-55px'], rowX: '12px', opacity: 0.72, mediaRotation: '1deg' },
    /** Pilha de cartões sticky (Work) */
    stickyDeck: { scrub: 0.35, handoff: '300ms', exitX: '72%', exitY: '-10%', enterY: '7%', ease: 'power2InOut' },
    /** Cartões sticky que chegam (ofertas) */
    stickyStack: { scrub: 0.32, scale: 0.97, rotation: '1deg', y: '22px', fromOpacity: 0.88, inset: ['24px', '42px'] },
    /** Rastro de imagens do mouse */
    pointerTrail: { pool: 8, minDistance: 64, minInterval: 85, lifetime: 1100, scrollPause: 140, ease: 'trail' },
    /** Cartaz/hero que inclina com o ponteiro */
    pointerTilt: { maxDeg: 3.5, heroX: 2, heroY: 3, duration: '400ms', ease: 'power2Out' },
    /** Palavras que acendem com o scroll (manifesto) */
    scrubWords: { fromOpacity: 0.42, distance: '22px', stagger: 0.07 },
    /** Entradas em cascata só com CSS (aula-head) */
    stagedEntrance: { rise: '650ms', headline: '800ms', card: '650ms', pop: '500ms', ease: 'kinetic' },
    /** Revelação de lista sem atrapalhar quem rola rápido (biblioteca de prompts) */
    calmReveal: { duration: '400ms', distance: '16px', skipIfScrolledWithin: 160, ease: 'power3Out' },
    /** Barra de progresso + navegação por cenas */
    sceneNav: { barHeight: '2px', dot: '4px', activeDot: '18px', readingLine: 0.4 },
    /** Mídia: zoom suave no hover; vídeos só tocam visíveis, no máximo 2 decodificando */
    media: { hoverScale: 1.025, hoverDuration: '500ms', maxDecoders: 2 },
    /** Limiares de experiência completa (abaixo disso: fluxo nativo) */
    gates: {
      fine: '(hover: hover) and (pointer: fine)',
      wide: '(min-width: 1000px) and (min-height: 760px)',
      stage: '(min-width: 1000px) and (min-height: 650px)',
      deck: '(min-width: 900px) and (min-height: 520px)',
    },
  },

  /** Política de movimento reduzido (prefers-reduced-motion: reduce) */
  reducedMotion: {
    rule: 'Remover deslocamentos, escalas, blur e paralaxe. Manter apenas crossfade de opacidade ≤ 160ms.',
    maxDuration: '160ms',
    /** ?motion=off na URL desliga tudo (QA e preferência explícita), como nos sites do LP */
    urlSwitch: '?motion=off',
    attribute: 'html[data-motion="full" | "reduced" | "off"]',
  },
} as const;

export type CarameloMotion = typeof motion;
