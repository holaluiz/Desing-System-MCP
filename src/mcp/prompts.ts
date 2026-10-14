/**
 * Prompts Oficiais expostos via MCP — Um Cara Caramelo
 */

export const mcpPrompts = [
  {
    name: 'audit-ux-ui',
    description: 'Audita e eleva a experiência de uma página inteira para o padrão Caramelo V1 2026.',
    arguments: [
      {
        name: 'code',
        description: 'Código da página ou componente a ser auditado.',
        required: true,
      },
    ],
    generate: (args: { code: string }) => ({
      description: 'Auditoria de UX/UI com os 12 critérios canônicos Caramelo',
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Por favor, atue como o Diretor de Arte e Head de Interação do ecossistema Um Cara Caramelo.
Analise o seguinte código de interface e realize uma auditoria rigorosa contra os 12 critérios canônicos:

${args.code}

Critérios essenciais a auditar:
1. Contraste e WCAG (Cream sobre Ink 17.5:1, Sky sobre Ink 9.02:1).
2. Disciplina cromática: apenas 1 cor de destaque elétrico por cena.
3. Física de botões: resposta cinética imediata no clique e sombra sólida.
4. Tipografia em 3 vozes: Grotesca pesada em títulos, Sans funcional no corpo, Manuscrita em anotações (nunca em botões).
5. Texturas e materialidade: retículas halftone e bordas gráficas sem esterilidade digital.

Retorne:
- Diagnóstico técnico detalhado.
- Pontuação de 0 a 100.
- Código completamente refatorado pronto para copiar e colar.`,
          },
        },
      ],
    }),
  },
  {
    name: 'transform-to-caramelo',
    description: 'Transforma qualquer componente genérico de startup no padrão autoral Caramelo.',
    arguments: [
      {
        name: 'componentCode',
        description: 'Código do componente a transformar.',
        required: true,
      },
    ],
    generate: (args: { componentCode: string }) => ({
      description: 'Transformação para Caramelo Design System',
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Transforme o seguinte componente genérico em uma peça autoral no padrão Um Cara Caramelo:

${args.componentCode}

Aplique:
- Fundo Ink Black (#101014) ou Warm Cream (#FFF4E8).
- Sombras gráficas sólidas (ex: 4px 4px 0px #101014 ou #FF701A).
- Princípio Stillness = Camadas alinhadas / Movement = Camadas se separam.
- Tipografia na Voz 1 (Grotesca Pesada) e Voz 2 (Sans Funcional).`,
          },
        },
      ],
    }),
  },
];
