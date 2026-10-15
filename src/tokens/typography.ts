/**
 * Sistema Tipográfico — Um Cara Caramelo (V2 2026)
 * Fontes confirmadas por Luiz (LP · ADR-006): Montserrat, Inter e Covered By Your Grace,
 * auto-hospedadas (WOFF2 latin/latin-ext + OFL em styles/fonts).
 *
 * 1. Display  — Montserrat 800–900: títulos de cena, números, wordmark. Tracking negativo forte.
 * 2. Texto    — Inter 400–600: leitura, interface, navegação, rótulos meta.
 * 3. Mão      — Covered By Your Grace 400: intervenções curtas, sempre levemente giradas.
 * 4. Técnica  — monoespaçada do sistema: comandos, tokens, atalhos (sem webfont).
 */

export const typography = {
  fonts: {
    display: ['Montserrat', 'Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'].join(', '),
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(', '),
    handwriting: ['"Covered By Your Grace"', 'cursive'].join(', '),
    mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', '"Liberation Mono"', 'Menlo', 'monospace'].join(', '),
  },

  /** Pesos disponíveis nos arquivos variáveis */
  weights: {
    display: { min: 400, max: 900, title: 900, heading: 800, subtitle: 700 },
    sans: { min: 400, max: 800, body: 400, strong: 600, meta: 500 },
    handwriting: 400,
  },

  /**
   * Escala medida no LP (editorial.css / hero.css). Tamanhos fluidos com clamp:
   * o título cresce com a tela, a entrelinha fica compacta e o tracking negativo
   * mantém a massa de cartaz da Montserrat 900.
   */
  sizes: {
    hero: { size: 'clamp(72px, 12.9vw, 184px)', lineHeight: '0.88', tracking: '-0.073em', weight: '900', use: 'Assinatura da cena de abertura (UM CARA CARAMELO).' },
    display: { size: 'clamp(44px, 6.7vw, 96px)', lineHeight: '0.98', tracking: '-0.065em', weight: '900', use: 'Título de seção, caixa alta.' },
    'display-sm': { size: 'clamp(40px, 5.4vw, 76px)', lineHeight: '1.03', tracking: '-0.065em', weight: '900', use: 'Título de bloco (portas, ofertas, FAQ).' },
    title: { size: 'clamp(30px, 3.7vw, 53px)', lineHeight: '1.02', tracking: '-0.065em', weight: '900', use: 'Título de cartão/painel.' },
    subtitle: { size: 'clamp(19px, 2.15vw, 30px)', lineHeight: '1.25', tracking: '-0.045em', weight: '700', use: 'Legenda de projeto, subtítulo.' },
    heading: { size: '24px', lineHeight: '1.1', tracking: '-0.04em', weight: '800', use: 'Cabeçalho de lista/oferta.' },
    lead: { size: '15px', lineHeight: '1.65', tracking: '0em', weight: '400', use: 'Texto de apoio ao lado do título (cor fg-muted).' },
    body: { size: '16px', lineHeight: '1.5', tracking: '0em', weight: '400', use: 'Leitura.' },
    support: { size: '13px', lineHeight: '1.6', tracking: '0em', weight: '400', use: 'Descrições curtas, FAQ, cartões.' },
    meta: { size: '11px', lineHeight: '1.4', tracking: '0.1em', weight: '500', use: 'Meta de seção em caixa alta (número, contexto).' },
    hand: { size: 'clamp(23px, 2.2vw, 32px)', lineHeight: '1.15', tracking: '0em', weight: '400', use: 'Nota manuscrita, rotate(-3deg), acento.' },
    mono: { size: '12px', lineHeight: '1.6', tracking: '0em', weight: '500', use: 'Comandos, tokens, chips.' },
  },

  /** Regras de legibilidade (UX) */
  rules: {
    measure: '45–75 caracteres por linha (max-w-[65ch])',
    minBody: '16px em mobile para leitura; 13px só para texto de apoio curto',
    minMeta: '11px para meta em caixa alta (tracking 0.1em) — nunca menor em informação essencial',
    numbers: 'tabular-nums em preços, contadores e índices (01 / 04)',
    balance: 'text-wrap: balance em títulos; pretty em parágrafos',
    display: 'Montserrat sem compressão artificial: ajuste o tamanho por linha, nunca o font-stretch',
    hand: 'Manuscrita só em frases curtas, girada entre -4° e 8°, nunca em botões ou parágrafos',
  },
} as const;

export type CarameloTypography = typeof typography;
