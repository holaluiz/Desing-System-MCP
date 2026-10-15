/**
 * Tokens Semânticos — Um Cara Caramelo (V2 2026)
 *
 * Componentes e apps NUNCA devem referenciar hex diretamente: usam papéis
 * (stage, surface, fg, line, accent…). Assim o mesmo código funciona em
 * modo escuro (assinatura cinematográfica) e claro (editorial). A cor funcional
 * de base pode ser trocada sem tocar nas classes; a identidade usa o espectro completo.
 *
 * Em CSS cada papel vira `--cm-<papel>` com um triplet RGB ("16 16 20"),
 * consumido como `rgb(var(--cm-surface-1))` ou `rgb(var(--cm-accent) / .3)`.
 */

import { colors, neutral } from './colors';

export type SemanticRole =
  | 'stage'
  | 'surface-1'
  | 'surface-2'
  | 'surface-3'
  | 'line-soft'
  | 'line'
  | 'line-strong'
  | 'fg'
  | 'fg-2'
  | 'fg-muted'
  | 'fg-dim'
  | 'fg-faint'
  | 'accent'
  | 'accent-bright'
  | 'accent-ink'
  | 'accent-soft'
  | 'accent-contrast'
  | 'focus'
  | 'success'
  | 'success-soft'
  | 'warning'
  | 'warning-soft'
  | 'danger'
  | 'danger-soft'
  | 'info'
  | 'info-soft'
  | 'on-status';

export type SemanticTheme = Record<SemanticRole, string>;

/** Modo escuro — assinatura cinematográfica (padrão) */
export const darkTheme: SemanticTheme = {
  stage: neutral[950],
  'surface-1': neutral[900],
  'surface-2': neutral[800],
  'surface-3': neutral[750],
  'line-soft': '#1A1A20',
  line: neutral[700],
  'line-strong': neutral[600],
  fg: neutral[50],
  'fg-2': neutral[200],
  'fg-muted': neutral[300],
  'fg-dim': neutral[400],
  'fg-faint': neutral[500],
  accent: colors.cream.DEFAULT,
  'accent-bright': colors.cream.pure,
  'accent-ink': neutral[50],
  'accent-soft': neutral[800],
  'accent-contrast': colors.ink.DEFAULT,
  focus: colors.sky.DEFAULT,
  success: colors.mint.DEFAULT,
  'success-soft': colors.mint.surface,
  warning: colors.yellow.DEFAULT,
  'warning-soft': colors.yellow.surface,
  danger: colors.pink.DEFAULT,
  'danger-soft': colors.pink.surface,
  info: colors.sky.DEFAULT,
  'info-soft': colors.sky.surface,
  'on-status': colors.ink.DEFAULT,
};

/** Modo claro — editorial Warm Cream */
export const lightTheme: SemanticTheme = {
  stage: neutral[50],
  'surface-1': '#FFFAF4',
  'surface-2': colors.cream.muted,
  'surface-3': '#EEDCC6',
  'line-soft': '#F0E2D2',
  line: colors.cream.border,
  'line-strong': '#D4BC9F',
  fg: neutral[900],
  'fg-2': '#2E2C2A',
  'fg-muted': '#5E5A55',
  'fg-dim': '#6B6862',
  'fg-faint': '#A39C93',
  accent: colors.cream.DEFAULT,
  'accent-bright': colors.cream.pure,
  'accent-ink': neutral[900],
  'accent-soft': colors.cream.muted,
  'accent-contrast': colors.ink.DEFAULT,
  focus: colors.sky.deep,
  success: colors.mint.deep,
  'success-soft': colors.mint.light,
  warning: colors.yellow.deep,
  'warning-soft': colors.yellow.light,
  danger: colors.pink.deep,
  'danger-soft': colors.pink.light,
  info: colors.sky.deep,
  'info-soft': colors.sky.light,
  'on-status': colors.cream.DEFAULT,
};

/** Base neutra por padrão; cores individuais apenas por opt-in explícito com data-cm-accent. */
export const sceneAccents = {
  neutral: {
    dark: { accent: darkTheme.accent, bright: darkTheme['accent-bright'], ink: darkTheme['accent-ink'], soft: darkTheme['accent-soft'], contrast: darkTheme['accent-contrast'] },
    light: { accent: lightTheme.accent, bright: lightTheme['accent-bright'], ink: lightTheme['accent-ink'], soft: lightTheme['accent-soft'], contrast: lightTheme['accent-contrast'] },
  },
  caramel: { dark: { accent: colors.caramel.DEFAULT, bright: colors.caramel.bright, ink: colors.caramel.DEFAULT, soft: colors.caramel.surface, contrast: colors.ink.DEFAULT }, light: { accent: colors.caramel.DEFAULT, bright: colors.caramel.hover, ink: colors.caramel.deep, soft: '#FFE6D3', contrast: colors.ink.DEFAULT } },
  sky: { dark: { accent: colors.sky.DEFAULT, bright: '#5CD0FF', ink: colors.sky.DEFAULT, soft: colors.sky.surface, contrast: colors.ink.DEFAULT }, light: { accent: colors.sky.DEFAULT, bright: colors.sky.hover, ink: colors.sky.deep, soft: colors.sky.light, contrast: colors.ink.DEFAULT } },
  pink: { dark: { accent: colors.pink.DEFAULT, bright: '#FF6BA8', ink: colors.pink.DEFAULT, soft: colors.pink.surface, contrast: colors.ink.DEFAULT }, light: { accent: colors.pink.DEFAULT, bright: colors.pink.hover, ink: colors.pink.deep, soft: colors.pink.light, contrast: colors.ink.DEFAULT } },
  // Violet puro (#7657FF) não atinge 4.5:1 nem com Ink nem com Cream → o preenchimento usa violet.hover (cream: 5.91:1)
  violet: { dark: { accent: colors.violet.hover, bright: colors.violet.DEFAULT, ink: '#9A85FF', soft: colors.violet.surface, contrast: colors.cream.DEFAULT }, light: { accent: colors.violet.hover, bright: colors.violet.DEFAULT, ink: colors.violet.deep, soft: colors.violet.light, contrast: colors.cream.DEFAULT } },
  yellow: { dark: { accent: colors.yellow.DEFAULT, bright: '#FFE066', ink: colors.yellow.DEFAULT, soft: colors.yellow.surface, contrast: colors.ink.DEFAULT }, light: { accent: colors.yellow.DEFAULT, bright: colors.yellow.hover, ink: colors.yellow.deep, soft: colors.yellow.light, contrast: colors.ink.DEFAULT } },
} as const;

export type SceneAccent = keyof typeof sceneAccents;

/** "#FF701A" → "255 112 26" (formato consumido pelas variáveis --cm-*) */
export function hexToTriplet(hex: string): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)).join(' ');
}

/** Descrição de uso de cada papel — usada pela documentação e pelo MCP */
export const semanticRoles: Record<SemanticRole, string> = {
  stage: 'Fundo de palco da página (o plano mais profundo).',
  'surface-1': 'Cards e painéis apoiados no palco.',
  'surface-2': 'Superfícies elevadas, inputs, popovers.',
  'surface-3': 'Hover de itens, indicadores, chips.',
  'line-soft': 'Divisores discretos dentro de superfícies.',
  line: 'Bordas padrão (hairline de 1px).',
  'line-strong': 'Bordas de foco passivo, hover de borda.',
  fg: 'Texto principal e ícones ativos.',
  'fg-2': 'Texto secundário de alta legibilidade.',
  'fg-muted': 'Descrições e texto de apoio (AAA).',
  'fg-dim': 'Metadados, legendas, placeholders (AA).',
  'fg-faint': 'Somente não-texto: ícones decorativos, estados desabilitados.',
  accent: 'Base funcional neutra (Warm Cream). CTAs de marca combinam o espectro com cm-brand-action; cores individuais são opt-in.',
  'accent-bright': 'Hover neutro luminoso (branco).',
  'accent-ink': 'Texto de destaque neutro: foreground seguro do tema atual.',
  'accent-soft': 'Superfície neutra de seleção e badges (surface-2).',
  'accent-contrast': 'Texto sobre preenchimento de acento.',
  focus: 'Anel de foco de teclado (Electric Sky — distinto do acento).',
  success: 'Sucesso (Signal Mint).',
  'success-soft': 'Fundo de sucesso.',
  warning: 'Atenção (Acid Yellow).',
  'warning-soft': 'Fundo de atenção.',
  danger: 'Erro/destrutivo (Hot Pink).',
  'danger-soft': 'Fundo de erro.',
  info: 'Informação (Electric Sky).',
  'info-soft': 'Fundo de informação.',
  'on-status': 'Texto sobre preenchimentos de status.',
};
