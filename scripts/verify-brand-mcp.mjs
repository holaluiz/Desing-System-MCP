import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseColor, contrastRatio } from '../dist/engine/index.mjs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const client = new Client({ name: 'caramelo-brand-verification', version: '1.0.0' });
const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(root, 'dist/mcp/index.js')], cwd: os.tmpdir(), stderr: 'pipe' });
const text = (result) => result.content.find((block) => block.type === 'text')?.text ?? '';
try {
  await client.connect(transport);
  const tools = await client.listTools();
  assert(tools.tools.some((tool) => tool.name === 'get_brand_asset'));
  const resources = await client.listResources();
  assert(resources.resources.some((item) => item.uri === 'caramelo://brand/isotype.svg'));
  const catalog = JSON.parse(text(await client.callTool({ name: 'get_brand_asset', arguments: { asset: 'trail-stickers', format: 'metadata' } })));
  assert.equal(catalog.stickers.length, 28);
  assert.equal(new Set(catalog.stickers.map((sticker) => sticker.id)).size, 28);
  for (const sticker of catalog.stickers) {
    assert(fs.existsSync(path.join(root, 'dist/assets/stickers', sticker.file)));
    assert(fs.existsSync(path.join(root, 'apps/showcase/public/caramelo/stickers', sticker.file)));
    assert(resources.resources.some((item) => item.uri === sticker.uri));
  }
  const svg = text(await client.callTool({ name: 'get_brand_asset', arguments: { asset: 'isotype', format: 'svg' } }));
  assert(svg.startsWith('<svg'));
  assert(svg.includes('<path'));
  assert(!/<image|data:image|base64/i.test(svg));
  assert(svg.includes('viewBox="0 0 256 256"'));
  assert(svg.includes('fill="#FF701A"'));
  assert(svg.includes('<rect'));
  assert.equal((svg.match(/<path /g) ?? []).length, 2);
  const metadata = JSON.parse(text(await client.callTool({ name: 'get_brand_asset', arguments: { asset: 'isotype', format: 'metadata' } })));
  assert.equal(metadata.isotype.defaultVariant, 'caramel');
  assert.match(metadata.isotype.description, /manuscrito com ponto/);
  for (const variant of ['caramel', 'spectrum', 'ink', 'cream']) {
    const markup = text(await client.callTool({ name: 'get_brand_asset', arguments: { asset: 'isotype', format: 'svg', variant } }));
    const suffix = variant === 'caramel' ? '' : `-${variant}`;
    const resource = await client.readResource({ uri: `caramelo://brand/isotype${suffix}.svg` });
    assert.equal(resource.contents[0].text, markup);
    assert.equal(fs.readFileSync(path.join(root, `dist/assets/brand/isotipo${suffix}.svg`), 'utf8').trim(), markup);
    if (variant === 'spectrum') assert.equal((markup.match(/<stop /g) ?? []).length, 5);
    else assert(!markup.includes('<stop'));
    const html = text(await client.callTool({ name: 'get_brand_asset', arguments: { asset: 'isotype', format: 'html', variant } }));
    assert(html.includes(`/caramelo/brand/isotipo${suffix}.svg`));
  }
  const tokens = JSON.parse(text(await client.callTool({ name: 'get_design_tokens', arguments: { format: 'json' } })));
  assert.equal(tokens.semantic.dark.accent, '#FF701A');
  assert.equal(tokens.semantic.light['accent-ink'], '#AB3B00');
  assert.equal(tokens.semantic.sceneAccents.neutral.dark.accent, '#FFF4E8');
  assert.equal(tokens.brandSpectrum.stops.length, 5);
  for (const theme of [tokens.semantic.dark, tokens.semantic.light]) {
    for (const role of ['stage', 'surface-1', 'surface-2', 'surface-3', 'accent-soft']) {
      assert(contrastRatio(parseColor(theme['accent-ink']), parseColor(theme[role])) >= 4.5, `Laranja de texto precisa de AA sobre ${role}`);
    }
  }
  const svgResource = await client.readResource({ uri: 'caramelo://brand/isotype.svg' });
  assert.equal(svgResource.contents[0].text, svg);
  for (const sticker of [catalog.stickers[0], catalog.stickers.at(-1)]) {
    const response = await client.callTool({ name: 'get_brand_asset', arguments: { asset: 'trail-stickers', format: 'file', stickerId: sticker.id } });
    const resource = response.content.find((block) => block.type === 'resource')?.resource;
    assert.equal(resource.mimeType, 'image/webp');
    const bytes = Buffer.from(resource.blob, 'base64');
    const expected = fs.readFileSync(path.join(root, 'src/assets/stickers', sticker.file));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), createHash('sha256').update(expected).digest('hex'));
    const direct = await client.readResource({ uri: sticker.uri });
    assert.equal(direct.contents[0].blob, resource.blob);
  }
  const invalid = await client.callTool({ name: 'get_brand_asset', arguments: { asset: 'trail-stickers', format: 'file', stickerId: '../package.json' } });
  assert.match(text(invalid), /não encontrada/);
  const logo = text(await client.callTool({ name: 'generate_caramelo_component', arguments: { componentType: 'logo', framework: 'react-tailwind' } }));
  assert(logo.includes('Isotype'));
  const hero = text(await client.callTool({ name: 'generate_caramelo_component', arguments: { componentType: 'cinematic_hero' } }));
  assert(hero.includes('appearance="stickers"'));
  assert(!hero.includes('items={posters}'));
  const trail = text(await client.callTool({ name: 'get_interaction', arguments: { id: 'pointer-trail' } }));
  assert(trail.includes('canônicas'));
  assert(!trail.includes('poster-1.webp'));
  const manifesto = text(await client.callTool({ name: 'generate_caramelo_component', arguments: { componentType: 'manifesto' } }));
  assert(manifesto.includes('cm-chromatic-tile'));
  assert(!manifesto.includes('bg-accent'));
  assert(manifesto.includes('variant="cream"'));
  console.log('MCP validado fora do workspace: novo logo em quatro variantes, laranja nos detalhes, degradê de cinco cores, 28 figurinhas e geradores canônicos.');
} finally {
  await client.close();
}
