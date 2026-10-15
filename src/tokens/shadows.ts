/**
 * Sombras e Elevações — Um Cara Caramelo (V2 2026)
 *
 * Dois materiais, uma identidade:
 *  - PRINT  (editorial, cartaz): sombras sólidas hard-edge, presença impressa.
 *  - LUMEN  (produto, digital): luz interna de 1px + profundidade macia + glow das cinco cores combinadas.
 * Regra: um material por superfície. Nunca misture hard-shadow e glow no mesmo elemento.
 */

export const shadows = {
  none: 'none',

  // ——— PRINT ———
  'graphic-sm': '2px 2px 0px #101014',
  'graphic-md': '4px 4px 0px #101014',
  'graphic-lg': '8px 8px 0px #101014',
  'graphic-caramel': '4px 4px 0px #FF701A',
  'graphic-sky': '4px 4px 0px #25BFFF',
  'graphic-cream': '4px 4px 0px #FFF4E8',
  'offset-cmyk': '-2px -1px 0px rgba(37, 191, 255, 0.4), 2px 1px 0px rgba(255, 61, 141, 0.4)',

  // ——— LUMEN ———
  /** Repouso: aresta de luz superior + contato */
  'elev-1': 'inset 0 1px 0 rgba(255, 244, 232, 0.04), 0 1px 2px rgba(0, 0, 0, 0.4)',
  /** Cards e botões elevados */
  'elev-2': 'inset 0 1px 0 rgba(255, 244, 232, 0.05), 0 8px 20px -6px rgba(0, 0, 0, 0.55)',
  /** Hover de cards, painéis flutuantes */
  'elev-3': 'inset 0 1px 0 rgba(255, 244, 232, 0.06), 0 16px 34px -8px rgba(0, 0, 0, 0.6)',
  /** Menus, popovers, diálogos */
  'elev-4': 'inset 0 1px 0 rgba(255, 244, 232, 0.06), 0 0 0 1px rgba(255, 244, 232, 0.06), 0 24px 60px -12px rgba(0, 0, 0, 0.72)',
  /** Estado pressionado / campo afundado */
  pressed: 'inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 -1px 1px rgba(255, 244, 232, 0.05)',
  /** Glow discreto (hover de CTA) */
  'glow-sm': '0 0 14px rgba(255,112,26,.1), 4px 0 18px rgba(255,61,141,.1), -4px 0 18px rgba(37,191,255,.1), 0 4px 20px rgba(118,87,255,.1), 0 -3px 16px rgba(255,213,42,.1)',
  /** Glow de assinatura: cinco ecos cromáticos combinados (CTA herói) */
  glow: '0 0 20px rgba(255,112,26,.24), 6px 0 26px rgba(255,61,141,.24), -6px 0 26px rgba(37,191,255,.24), 0 6px 30px rgba(118,87,255,.24), 0 -4px 22px rgba(255,213,42,.24)',
  'glow-sky': '0 0 0 1px rgba(150, 220, 255, 0.45), 0 0 11px 3px rgba(37, 191, 255, 0.7), 0 0 28px 8px rgba(37, 191, 255, 0.35)',
  /** Anel de foco de teclado (2px de respiro + 2px Electric Sky) */
  focus: '0 0 0 2px #0A0A0D, 0 0 0 4px #25BFFF',
} as const;

export type CarameloShadows = typeof shadows;
