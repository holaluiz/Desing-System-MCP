/**
 * Prompts Oficiais expostos via MCP — Um Cara Caramelo (V2 2026)
 * Cada prompt orienta o cliente a usar as ferramentas do motor (medição real),
 * não a "opinar" sobre o código.
 */

import { z } from 'zod';
import { CARAMELO_PROJECT_PROMPT } from '../brand/project-prompt';

export interface CarameloPrompt {
  name: string;
  title: string;
  description: string;
  args: Record<string, z.ZodType<string | undefined>>;
  // método (bivariante): cada prompt declara só os argumentos que usa
  text(args: Record<string, string | undefined>): string;
}

export const mcpPrompts: CarameloPrompt[] = [
  {
    name: 'apply-to-project',
    title: 'Aplicar Caramelo no projeto',
    description: 'Frase pronta para aplicar a identidade Caramelo ao projeto inteiro, preservando funcionalidades e validando as telas.',
    args: {},
    text: () => CARAMELO_PROJECT_PROMPT,
  },
  {
    name: 'audit-ux-ui',
    title: 'Auditar UX/UI',
    description: 'Audita uma tela ou componente com o motor Caramelo e propõe a versão elevada.',
    args: { code: z.string().describe('Código da página ou componente.') },
    text: ({ code }: { code: string }) => `Atue como Head de Interação do Laboratório Um Cara Caramelo.

1. Rode \`audit_ux_ui\` neste código e leia a nota por categoria.
2. Rode \`transform_to_caramelo\` (material lumen) e compare a nota antes/depois.
3. Para cada item em "Precisa de decisão humana", proponha a correção concreta.
4. Sugira no máximo 2 microinterações do catálogo (\`get_interaction\`) que resolvam um problema de UX real desta tela — explique qual comportamento cada uma provoca. Considere glitch cromático no feedback de gesto; as cinco cores combinadas são a assinatura, sem seletor de cor de identidade.

\`\`\`
${code}
\`\`\``,
  },
  {
    name: 'transform-to-caramelo',
    title: 'Transformar para Caramelo',
    description: 'Converte um componente ou sistema inteiro para a identidade visual e a interatividade Caramelo.',
    args: {
      code: z.string().describe('Código do componente, página ou folha de estilo/tema.'),
      material: z.string().optional().describe('lumen (padrão) ou print.'),
    },
    text: ({ code, material }: { code: string; material?: string }) => `Transforme este código para a identidade Um Cara Caramelo.

1. Chame \`transform_to_caramelo\` com material "${material === 'print' ? 'print' : 'lumen'}".
2. Revise o relatório: confirme os aria-labels inferidos e resolva os itens de decisão humana.
3. Se houver um CTA principal, troque-o pelo componente de assinatura (MagneticButton fill ou GlowButton).
   Preserve gradientes multicolor e use as cinco cores juntas em luz, blur/liquid ou glitch no gesto, com leitura legível e movimento reduzido estático. Use Caramel #FF701A como destaque forte nos detalhes sólidos; accent tem padrão caramel e CTAs usam cm-brand-action com as cores combinadas.
4. Entregue o código final completo e a lista de setup (preset Tailwind + styles.css).
5. Para logo e rastro Caramelo, consulte get_brand_asset: use o isotipo canônico e sempre as figurinhas oficiais no rastro. Preserve marcas de terceiros que não façam parte do escopo de troca.

\`\`\`
${code}
\`\`\``,
  },
  {
    name: 'convert-design-system',
    title: 'Converter design system',
    description: 'Migra o tema de outro design system (shadcn, Bootstrap, MUI, Material 3…) para os tokens Caramelo.',
    args: { theme: z.string().describe('CSS de variáveis do tema (globals.css, _variables.css…).') },
    text: ({ theme }: { theme: string }) => `Migre este tema para Caramelo sem quebrar os componentes existentes.

1. Chame \`transform_to_caramelo\` com o CSS abaixo (o motor mantém o formato de cada variável).
2. Chame \`map_colors\` com as cores de marca da origem para mostrar o de→para.
3. Liste o que mudou por papel (fundo, texto, acento, status, foco, bordas) e o contraste final.

\`\`\`css
${theme}
\`\`\``,
  },
  {
    name: 'elevate-interaction',
    title: 'Elevar interação',
    description: 'Escolhe e aplica as microinterações certas para uma tela, com justificativa de UX.',
    args: { code: z.string().describe('Código da tela.'), goal: z.string().optional().describe('Objetivo de negócio/UX da tela.') },
    text: ({ code, goal }: { code: string; goal?: string }) => `Objetivo da tela: ${goal ?? 'não informado — deduza pelo conteúdo'}.

1. Chame \`list_interactions\` e escolha no máximo 3 receitas — cada uma precisa resolver um problema de UX desta tela (feedback, orientação, continuidade espacial, confiança).
2. Para cada escolhida, chame \`get_interaction\` e aplique o código.
3. Respeite: 1 ponto focal por cena, nada acima de 400ms em controles, prefers-reduced-motion.
   Combine as cinco cores da marca; para glitch de gesto, use chromatic-glitch (400ms steps em hover/foco, sem movimento no modo reduzido).
   Se houver rastro de mouse Caramelo, use as figurinhas canônicas via PointerTrail appearance="stickers" e copie os assets indicados por get_brand_asset. Nunca use cartões, pôsteres ou imagens genéricas como substitutos.

\`\`\`
${code}
\`\`\``,
  },
];
