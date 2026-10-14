/**
 * Recursos Oficiais expostos via MCP — Um Cara Caramelo
 */

import { colors, contrastRatios } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { shadows } from '../tokens/shadows';
import { motion } from '../tokens/motion';

export const mcpResources = [
  {
    uri: 'caramelo://guidelines/manual',
    name: 'Manual Canônico de Identidade Visual V1 2026',
    description: 'Documento-mestre com todas as diretrizes de design, tipografia, regras cromáticas e motion.',
    mimeType: 'text/markdown',
    load: () => `# Um Cara Caramelo — Manual de Identidade Visual V1 (2026)
## Princípio Central
**STILLNESS = CAMADAS ALINHADAS  •  MOVEMENT = CAMADAS SE SEPARAM**
"Estratégia precisa ser sentida. Marca não é só o que ela diz. É o que ela faz você fazer."

## Regra de Ouro Cromática
Usar apenas **1 cor de destaque elétrico dominante por cena**.
- Ink Black (#101014): Base principal
- Warm Cream (#FFF4E8): Base clara editorial (WCAG 17.5:1)
- Caramel Orange (#FF701A): Assinatura da marca para CTAs
- Electric Sky (#25BFFF): Acento digital
- Hot Pink (#FF3D8D): Provocação
- Electric Violet (#7657FF): Transição
- Acid Yellow (#FFD52A): Alerta e humor

## Tipografia em Três Vozes
1. Grotesca Pesada (Display): Títulos de cena, números, CTAs principais.
2. Sans Funcional (Inter): Leitura confortável, interface e navegação.
3. Manuscrita: Intervenção humana, notas, setas. (NUNCA em botões ou parágrafos longos).

## Texturas Táteis
- Halftone Ben-Day em sombras e fundos.
- Print Grain analógico sutil.
- CMYK Misregistration pontual nas bordas em aceleração.`,
  },
  {
    uri: 'caramelo://tokens/json',
    name: 'Tokens Canônicos de Design em JSON',
    description: 'Tokens estruturados de cores, contrastes, tipografia, espaçamentos e sombras.',
    mimeType: 'application/json',
    load: () => JSON.stringify({ colors, contrastRatios, typography, shadows, motion }, null, 2),
  },
  {
    uri: 'caramelo://components/catalog',
    name: 'Catálogo de Componentes de Interface',
    description: 'Lista e especificações de todos os componentes React do Design System.',
    mimeType: 'text/markdown',
    load: () => `# Catálogo de Componentes Caramelo
- **Wordmark**: Assinatura oficial em 2 linhas, alinhamento óptico, suporte a offset CMYK.
- **Lockup**: Variações Institucional, Explicativo, Autoral e Bio.
- **Button**: Botões cinéticos com sombras gráficas sólidas e física de clique.
- **DisplayHeading**: Voz 1 grotesca com entrelinha compacta.
- **Text**: Voz 2 funcional e acessível.
- **HandwrittenNote**: Voz 3 manuscrita humana.
- **Card**: Contêiner com suporte a retícula Ben-Day e borda gráfica de 2px.
- **Badge**: Badges nas 5 cores elétricas de acento.
- **Input**: Campos de formulário com foco em Electric Sky (#25BFFF).
- **LayerSplit**: Contêiner dinâmico onde camadas se separam no hover.`,
  },
];
