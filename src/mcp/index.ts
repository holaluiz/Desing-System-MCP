/**
 * Caramelo Design System — Servidor MCP Oficial de UX/UI
 * Laboratório de Interação • Um Cara Caramelo (V2 2026)
 *
 * Transforma qualquer interface ou design system na identidade visual e na
 * interatividade Caramelo — com medição real (contraste, acessibilidade, motion).
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { interactions, getInteraction } from '../tokens/interactions';
import { audit } from './engine/audit';
import { recipes } from './engine/recipes';
import { transform } from './engine/transform';
import { renderAudit, renderTransform } from './format';
import { mcpPrompts } from './prompts';
import { mcpResources } from './resources';
import { calculateContrast, generateComponent, mapColors, tokensPayload } from './tools';

const server = new McpServer({
  name: 'caramelo-design-system-mcp',
  version: '2.0.0',
});

const MAX_CODE = 400_000;
const text = (t: string) => ({ content: [{ type: 'text' as const, text: t }] });
const json = (v: unknown) => text(typeof v === 'string' ? v : JSON.stringify(v, null, 2));
const tooBig = (code: string) => (code.length > MAX_CODE ? text(`Código grande demais (${code.length} caracteres; máximo ${MAX_CODE}). Envie por arquivo/seção.`) : null);

const codeArg = z.string().min(1).describe('Código: JSX/TSX, HTML, Vue/Svelte template, CSS, ou tema de variáveis (shadcn, Bootstrap, MUI, Material 3…).');
const formatArg = z.enum(['markdown', 'json']).optional().default('markdown').describe('markdown = relatório legível; json = dados estruturados.');
const ACCENTS = ['caramel', 'sky', 'pink', 'violet', 'yellow'] as const;

// ==========================================
// 1. FERRAMENTAS
// ==========================================

server.registerTool(
  'audit_ux_ui',
  {
    title: 'Auditar UX/UI',
    description:
      'Audita interface (JSX/TSX, HTML, CSS, Tailwind) com medição real: contraste WCAG calculado com herança de fundo (nos dois temas quando há papéis), acessibilidade de controles e campos, física de interação (hover/press/foco), motion (transition-all, >400ms, reduced-motion), disciplina de acento, material e tipografia. Retorna nota 0–100 por categoria, achados por linha e quais o transform_to_caramelo corrige sozinho.',
    inputSchema: {
      code: codeArg,
      context: z.enum(['web-app', 'landing-page', 'dashboard', 'mobile']).optional().default('web-app').describe('Contexto: ajusta alvos de toque, ponto focal e interações recomendadas.'),
      format: formatArg,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  async ({ code, context, format }) => {
    const big = tooBig(code);
    if (big) return big;
    const report = audit(code, context);
    return format === 'json' ? json(report) : text(renderAudit(report));
  }
);

server.registerTool(
  'transform_to_caramelo',
  {
    title: 'Transformar para Caramelo',
    description:
      'Converte qualquer interface ou design system para a identidade visual e a interatividade Caramelo. Cores viram papéis semânticos (funcionam nos dois temas e com qualquer acento de cena), temas de variáveis (shadcn, Bootstrap, MUI, Material 3, Chakra) recebem valores Caramelo no mesmo formato, sombras/raios/motion viram tokens, e só a interação que falta é adicionada (press 80ms, hover luminoso, foco Electric Sky, halo em campos, reduced-motion). Corrige a11y segura (type, alt, rel, aria-label inferido). Devolve o código, a nota de auditoria antes→depois, cada mudança por linha e o que exige decisão humana.',
    inputSchema: {
      code: codeArg,
      material: z.enum(['lumen', 'print']).optional().default('lumen').describe('lumen = produto digital (luz, glow, raios concêntricos) · print = editorial (sombra sólida, arestas retas).'),
      theme: z.enum(['dark', 'light']).optional().describe('Tema-alvo. Omitido = mantém a polaridade da origem (design claro → editorial Warm Cream).'),
      accent: z.enum(ACCENTS).optional().default('caramel').describe('Acento dominante da cena.'),
      strategy: z.enum(['unify', 'preserve']).optional().default('unify').describe('unify = 1 acento (regra de ouro) · preserve = cada matiz vira a tinta da marca mais próxima.'),
      enhanceInteractions: z.boolean().optional().default(true).describe('Adicionar a física de interação que estiver faltando.'),
      fixA11y: z.boolean().optional().default(true).describe('Aplicar correções de acessibilidade seguras.'),
      format: formatArg,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  async ({ code, material, theme, accent, strategy, enhanceInteractions, fixA11y, format }) => {
    const big = tooBig(code);
    if (big) return big;
    const before = audit(code);
    const result = transform(code, { material, theme, accent, strategy, enhanceInteractions, fixA11y });
    const after = audit(result.code);
    if (format === 'json') return json({ ...result, audit: { before: before.score, after: after.score, remaining: after.findings } });
    return text(renderTransform(result, code, before, after));
  }
);

server.registerTool(
  'map_colors',
  {
    title: 'Mapear cores para a marca',
    description:
      'Recebe cores de qualquer sistema (hex, rgb, hsl, oklch, triplets do shadcn) e devolve: família, tinta Caramelo mais próxima (ΔE OKLab), papel semântico equivalente como fundo/texto/borda e contraste sobre o palco nos dois temas.',
    inputSchema: {
      colors: z.array(z.string()).min(1).max(64).describe('Lista de cores da origem.'),
      sourcePolarity: z.enum(['light', 'dark']).optional().default('light').describe('A origem é um design claro ou escuro? (define como os neutros viram papéis).'),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  async ({ colors, sourcePolarity }) => json(mapColors(colors, sourcePolarity))
);

server.registerTool(
  'check_contrast_wcag',
  {
    title: 'Checar contraste WCAG',
    description: 'Contraste WCAG 2.x entre duas cores em qualquer formato (com alfa). Se falhar, sugere as tintas/papéis Caramelo mais próximos da cor original que passam sobre aquele fundo.',
    inputSchema: {
      foreground: z.string().describe('Cor do texto/ícone (ex.: #8B8B98, rgb(…), 215 16% 47%).'),
      background: z.string().describe('Cor do fundo (ex.: #101014).'),
      textSize: z.enum(['normal', 'large', 'ui']).optional().default('normal').describe('normal = 4.5:1 · large (≥24px ou ≥18.66px bold) = 3:1 · ui (ícones, bordas de controle) = 3:1.'),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  async ({ foreground, background, textSize }) => json(calculateContrast(foreground, background, textSize))
);

server.registerTool(
  'list_interactions',
  {
    title: 'Listar microinterações',
    description: 'Catálogo de microinterações Caramelo — cada uma com o problema de UX que resolve, quando usar, quando evitar, motion e acessibilidade.',
    inputSchema: {
      category: z.enum(['feedback', 'navegacao', 'inputs', 'superficie', 'texto', 'tema', 'scroll', 'cursor', 'midia']).optional(),
      material: z.enum(['lumen', 'print', 'both']).optional(),
      trigger: z.enum(['hover', 'click', 'focus', 'drag', 'scroll', 'load', 'keyboard']).optional(),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  async ({ category, material, trigger }) => {
    const list = interactions.filter(
      (i) => (!category || i.category === category) && (!material || i.material === material || i.material === 'both') && (!trigger || i.trigger.includes(trigger))
    );
    return text(
      list.length
        ? list.map((i) => `- **${i.id}** — ${i.name} · ${i.category} · ${i.material}\n  ${i.intent}\n  Quando: ${i.whenToUse} · Evite: ${i.avoid}`).join('\n')
        : 'Nenhuma interação com esses filtros.'
    );
  }
);

const interactionIds = interactions.map((i) => i.id) as [string, ...string[]];

server.registerTool(
  'get_interaction',
  {
    title: 'Obter microinteração',
    description: 'Spec completa e código pronto de uma microinteração: componente React do pacote e/ou HTML com as classes do styles.css (+ JS mínimo quando depende de ponteiro).',
    inputSchema: {
      id: z.enum(interactionIds).describe('Id da interação (veja list_interactions).'),
      format: z.enum(['react', 'html', 'both']).optional().default('both'),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  async ({ id, format }) => {
    const spec = getInteraction(id)!;
    const r = recipes[id];
    const out = [
      `## ${spec.name} (\`${spec.id}\`)`,
      `**Problema de UX que resolve:** ${spec.intent}`,
      `**Quando usar:** ${spec.whenToUse}`,
      `**Evite:** ${spec.avoid}`,
      `**Motion:** ${spec.motion.duration} · curva ${spec.motion.easing} · anima ${spec.motion.properties.join(', ')}`,
      `**Acessibilidade:** ${spec.a11y.join(' · ')}`,
    ];
    if (r && format !== 'html') out.push('', '### React', '```tsx', r.react, '```');
    if (r?.html && format !== 'react') out.push('', '### HTML + CSS (styles.css)', '```html', r.html, '```');
    if (r?.js && format !== 'react') out.push('', '### JS mínimo', '```js', r.js, '```');
    if (r && !r.html && format === 'html') out.push('', '_Sem versão HTML pura: depende de medição/teclado — use o componente React._');
    if (r?.notes?.length) out.push('', ...r.notes.map((n) => `- ${n}`));
    return text(out.join('\n'));
  }
);

server.registerTool(
  'get_design_tokens',
  {
    title: 'Tokens de design',
    description: 'Tokens Caramelo: json (tudo), css (variáveis --cm-* com os dois temas e acentos de cena), tailwind (classes do preset), semantic (cada papel com uso, valores e contraste) ou all.',
    inputSchema: {
      format: z.enum(['json', 'css', 'tailwind', 'semantic', 'all']).optional().default('all'),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  async ({ format }) => json(tokensPayload(format))
);

server.registerTool(
  'generate_caramelo_component',
  {
    title: 'Gerar componente Caramelo',
    description: 'Gera um componente pronto para produção no padrão Caramelo — Lumen (MagneticButton, Surface, FocusField, SpotlightTabs, GlideMenu, Reveal…), cinematográfico do LP (cinematic_hero com rastro e máscara, portfolio_deck com pilha sticky, manifesto com palavras que acendem) ou Print (Button, LayerSplit, Lockup…).',
    inputSchema: {
      componentType: z.enum(['button', 'hero', 'cinematic_hero', 'card', 'feature_grid', 'portfolio_deck', 'manifesto', 'form', 'input', 'tabs', 'menu', 'badge', 'command', 'layer_split', 'lockup']),
      title: z.string().optional().default('').describe('Título ou texto principal.'),
      framework: z.enum(['react-tailwind', 'html-tailwind', 'pure-css']).optional().default('react-tailwind'),
      material: z.enum(['lumen', 'print']).optional().default('lumen'),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  async ({ componentType, title, framework, material }) => text(generateComponent(componentType, title, framework, material))
);

// ==========================================
// 2. RECURSOS
// ==========================================

for (const res of mcpResources) {
  server.registerResource(res.name, res.uri, { title: res.name, description: res.description, mimeType: res.mimeType }, async (uri) => ({
    contents: [{ uri: uri.href, mimeType: res.mimeType, text: res.load() }],
  }));
}

// ==========================================
// 3. PROMPTS
// ==========================================

for (const p of mcpPrompts) {
  server.registerPrompt(p.name, { title: p.title, description: p.description, argsSchema: p.args }, async (args: Record<string, string | undefined>) => ({
    description: p.description,
    messages: [{ role: 'user' as const, content: { type: 'text' as const, text: p.text(args) } }],
  }));
}

// ==========================================
// 4. INICIALIZAÇÃO VIA STDIO
// ==========================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[caramelo-design-system-mcp] Servidor MCP v2 ativo via stdio.');
}

main().catch((error) => {
  console.error('[caramelo-design-system-mcp] Erro fatal:', error);
  process.exit(1);
});
