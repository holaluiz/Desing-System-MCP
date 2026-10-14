/**
 * Sombras e Elevações Gráficas — Um Cara Caramelo
 * "Imperfeição controlada > Perfeição digital estéril."
 * Sombras sólidas, hard-edge e com presença de cartaz impresso.
 */

export const shadows = {
  none: 'none',
  // Sombra gráfica sólida preta (Ink)
  'graphic-sm': '2px 2px 0px #101014',
  'graphic-md': '4px 4px 0px #101014',
  'graphic-lg': '8px 8px 0px #101014',
  
  // Sombra gráfica com acento de marca (Caramel)
  'graphic-caramel': '4px 4px 0px #FF701A',
  
  // Sombra gráfica com acento elétrico (Sky)
  'graphic-sky': '4px 4px 0px #25BFFF',
  
  // Sombra para superfícies claras sobre fundo escuro
  'graphic-cream': '4px 4px 0px #FFF4E8',

  // Deslocamento de registro CMYK / Offset de impressão
  'offset-cmyk': '-2px -1px 0px rgba(37, 191, 255, 0.4), 2px 1px 0px rgba(255, 61, 141, 0.4)',
} as const;
