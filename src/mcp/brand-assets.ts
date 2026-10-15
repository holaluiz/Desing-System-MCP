import fs from 'node:fs';
import path from 'node:path';
import { isotypeMeta, isotypeSvg, type IsotypeVariant } from '../brand/isotype';
import { TRAIL_STICKERS } from '../brand/stickers';

export const brandUsage = `# Arquivos canônicos Caramelo

Logo: use o C coroado vetorizado do arquivo original, via Isotype ou isotipo.svg. Preserve geometria e proporção. Spectrum reúne as cinco cores; Ink e Cream atendem contraste. Não reconstruir com texto UC, C., emoji ou ícone genérico.

Rastro do mouse: em interfaces Caramelo, use sempre as figurinhas canônicas de rastro mouse.png, com transparência e object-fit:contain. Não substituir por pôsteres, cartões tipográficos, imagens de banco ou ícones. Copie os arquivos do pacote assets/stickers para public/caramelo/stickers. <PointerTrail appearance="stickers"> usa o conjunto por padrão; HTML: <section data-cm-trail data-cm-assets-base="/caramelo/stickers"> com initCaramelMotion(). O rastro é decorativo, ignora touch/movimento reduzido e não cobre controles.

Aplicar a marca apenas em contexto Caramelo. Preserve logos e identidade visual de clientes ou terceiros ao transformar código; a troca de logo precisa fazer parte do escopo autorizado.
`;

export function stickerCatalog() {
  return {
    source: 'rastro mouse.png',
    publicDirectory: '/caramelo/stickers',
    packageDirectory: '@caramelo/design-system/assets/stickers/',
    setup: 'Copie os arquivos WebP indicados para public/caramelo/stickers; imagens são transparentes e não devem receber moldura ou recorte cover.',
    stickers: TRAIL_STICKERS.map((sticker) => ({ ...sticker, uri: `caramelo://brand/stickers/${sticker.id}`, publicPath: `/caramelo/stickers/${sticker.file}`, packagePath: `@caramelo/design-system/assets/stickers/${sticker.file}` })),
  };
}

/** Only known manifest entries can be read; the API does not accept filesystem paths. */
export function stickerBlob(id: string) {
  const sticker = TRAIL_STICKERS.find((item) => item.id === id);
  if (!sticker) throw new Error('Figurinha não encontrada; consulte o catálogo canônico.');
  const executable = process.argv[1] && fs.existsSync(process.argv[1]) ? fs.realpathSync(process.argv[1]) : path.join(process.cwd(), 'dist/mcp/index.js');
  const directories = [path.resolve(path.dirname(executable), '../assets/stickers'), path.resolve(process.cwd(), 'dist/assets/stickers'), path.resolve(process.cwd(), 'src/assets/stickers')];
  const filename = directories.map((directory) => path.join(directory, sticker.file)).find((candidate) => fs.existsSync(candidate));
  if (!filename) throw new Error('Arquivo canônico ausente. Execute npm run build para incluir os assets no pacote MCP.');
  return { uri: `caramelo://brand/stickers/${sticker.id}`, mimeType: 'image/webp', blob: fs.readFileSync(filename).toString('base64') };
}

export function brandAssetMetadata() {
  return { isotype: isotypeMeta, trail: stickerCatalog(), guidelines: brandUsage };
}

export function logoMarkup(format: 'react' | 'html' | 'svg', variant: IsotypeVariant = 'spectrum', title = 'Um Cara Caramelo') {
  if (format === 'svg') return isotypeSvg({ variant, title });
  if (format === 'react') return `import { Isotype } from '@caramelo/design-system';\n\n<a href="/" aria-label="Um Cara Caramelo — início"><Isotype variant="${variant}" size={40} decorative interactive /></a>`;
  const filename = variant === 'spectrum' ? 'isotipo.svg' : `isotipo-${variant}.svg`;
  return `<a href="/" aria-label="Um Cara Caramelo — início"><img src="/caramelo/brand/${filename}" alt="" width="40" height="40" /></a>`;
}
