/**
 * Caramelo Design System — Servidor MCP Oficial de UX/UI
 * Laboratório de Interação • Um Cara Caramelo (V1 2026)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { auditUxUi, transformToCaramelo, generateComponent, calculateContrast } from './tools';
import { mcpResources } from './resources';
import { colors, contrastRatios } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { shadows } from '../tokens/shadows';
import { motion } from '../tokens/motion';

const server = new McpServer({
  name: 'caramelo-design-system-mcp',
  version: '1.0.0',
});

// ==========================================
// 1. FERRAMENTAS (TOOLS)
// ==========================================

/**
 * Tool: audit_ux_ui
 * Audita código de interface ou tela contra os 12 critérios canônicos Caramelo
 */
server.tool(
  'audit_ux_ui',
  'Audita código de interface (HTML, JSX, TSX, CSS ou Tailwind) contra os 12 critérios canônicos do Caramelo Design System. Identifica clichês corporativos, erros de contraste WCAG, falta de física tátil nos botões, violações da regra de 1 cor de destaque dominante e esterilidade digital. Retorna relatório técnico, pontuação (0-100) e orientações de correção.',
  {
    code: z.string().describe('Código HTML, JSX, TSX ou CSS da tela ou componente a ser auditado.'),
    targetContext: z
      .enum(['web-app', 'landing-page', 'dashboard', 'mobile'])
      .optional()
      .default('web-app')
      .describe('Contexto da aplicação para refinar a auditoria.'),
  },
  async ({ code, targetContext }) => {
    const report = auditUxUi(code, targetContext);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(report, null, 2),
        },
      ],
    };
  }
);

/**
 * Tool: transform_to_caramelo
 * Converte qualquer componente genérico de UI para o padrão autoral Caramelo
 */
server.tool(
  'transform_to_caramelo',
  'Transforma qualquer componente genérico (ex: shadcn/ui, Bootstrap, Tailwind genérico) em uma peça autoral com a identidade Um Cara Caramelo (física tátil, sombras gráficas sólidas, tipografia hierarquizada e acabamento editorial).',
  {
    componentCode: z.string().describe('Código atual do componente que você deseja elevar.'),
    variant: z
      .enum(['dark', 'light', 'accent'])
      .optional()
      .default('dark')
      .describe('Variante de superfície (dark = Ink Black, light = Warm Cream, accent = Caramel Orange).'),
  },
  async ({ componentCode, variant }) => {
    const elevatedCode = transformToCaramelo(componentCode, variant);
    return {
      content: [
        {
          type: 'text',
          text: elevatedCode,
        },
      ],
    };
  }
);

/**
 * Tool: generate_caramelo_component
 * Gera componentes oficiais sob medida prontos para produção
 */
server.tool(
  'generate_caramelo_component',
  'Gera o código de um componente completo no padrão do Design System Caramelo (Button, Hero, Card, LayerSplit, Input, Badge, etc.).',
  {
    componentType: z
      .enum(['button', 'hero', 'card', 'layer_split', 'input', 'badge', 'lockup'])
      .describe('Tipo do componente a ser gerado.'),
    title: z.string().describe('Título ou texto principal do componente.'),
    framework: z
      .enum(['react-tailwind', 'html-tailwind', 'pure-css'])
      .optional()
      .default('react-tailwind')
      .describe('Framework ou formato do código retornado.'),
  },
  async ({ componentType, title, framework }) => {
    const generated = generateComponent(componentType, title, framework);
    return {
      content: [
        {
          type: 'text',
          text: generated,
        },
      ],
    };
  }
);

/**
 * Tool: check_contrast_wcag
 * Valida ratio de contraste entre duas cores e sugere a alternativa canônica
 */
server.tool(
  'check_contrast_wcag',
  'Calcula a razão de contraste entre duas cores hexadecimais, verifica conformidade WCAG 2.1 (AA e AAA) e indica as recomendações canônicas de contraste da marca.',
  {
    foregroundHex: z.string().describe('Cor do texto ou elemento de primeiro plano (ex: #FFF4E8).'),
    backgroundHex: z.string().describe('Cor do fundo da cena (ex: #101014).'),
  },
  async ({ foregroundHex, backgroundHex }) => {
    const result = calculateContrast(foregroundHex, backgroundHex);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
);

/**
 * Tool: get_design_tokens
 * Retorna os tokens canônicos em JSON, CSS ou formato Tailwind
 */
server.tool(
  'get_design_tokens',
  'Retorna a especificação completa de tokens do Design System Caramelo (paleta de cores oficial V1 2026, tipografia em 3 vozes, contrastes WCAG, sombras gráficas e curvas de aceleração de movimento).',
  {
    format: z
      .enum(['json', 'css', 'tailwind', 'all'])
      .optional()
      .default('all')
      .describe('Formato de exportação dos tokens.'),
  },
  async ({ format }) => {
    let payload: unknown;

    if (format === 'json') {
      payload = { colors, contrastRatios, typography, shadows, motion };
    } else if (format === 'tailwind') {
      payload = {
        theme: {
          colors,
          fontFamily: typography.fonts,
          boxShadow: shadows,
        },
      };
    } else {
      payload = {
        system: 'Um Cara Caramelo — Laboratório de Interação',
        version: '1.0.0 (2026)',
        principle: 'STILLNESS = CAMADAS ALINHADAS • MOVEMENT = CAMADAS SE SEPARAM',
        colors,
        contrastRatios,
        typography,
        shadows,
        motion,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  }
);

// ==========================================
// 2. RECURSOS (RESOURCES)
// ==========================================

for (const res of mcpResources) {
  server.resource(
    res.name,
    res.uri,
    {
      description: res.description,
      mimeType: res.mimeType,
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: res.load(),
        },
      ],
    })
  );
}

// ==========================================
// 3. PROMPTS
// ==========================================

server.prompt(
  'audit-ux-ui',
  'Audita e eleva a experiência de uma página inteira para o padrão Caramelo V1 2026.',
  {
    code: z.string().describe('Código da página ou componente a ser auditado.'),
  },
  async ({ code }) => ({
    description: 'Auditoria de UX/UI com os 12 critérios canônicos Caramelo',
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Por favor, atue como o Head de Interação e Diretor de Arte do ecossistema Um Cara Caramelo.
Analise e audite o seguinte código:

\`\`\`
${code}
\`\`\`

Aplique os 12 critérios canônicos do Manual V1 2026. Identifique clichês corporativos, falhas de contraste, falta de resposta física nos botões e sugira a versão final refatorada.`,
        },
      },
    ],
  })
);

// ==========================================
// 4. INICIALIZAÇÃO VIA STDIO
// ==========================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[caramelo-design-system-mcp] Servidor MCP ativo via stdio.');
}

main().catch((error) => {
  console.error('[caramelo-design-system-mcp] Erro fatal:', error);
  process.exit(1);
});
