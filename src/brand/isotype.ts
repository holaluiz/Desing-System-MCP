import geometry from './isotype-geometry.json';
import { brandSpectrum } from '../tokens/colors';

/** C and dot traced from the supplied LABCaramelo icon, without executing it. */
export const ISOTYPE_VIEWBOX = geometry.viewBox;
export const ISOTYPE_PATHS: readonly string[] = geometry.paths;
export const ISOTYPE_DOTS: readonly { cx: number; cy: number; r: number }[] = geometry.dots;
export const ISOTYPE_TILE_RADIUS = geometry.tileRadius;

export type IsotypeVariant = 'caramel' | 'spectrum' | 'ink' | 'cream';

export const isotypeMeta = {
  name: 'Isotipo Um Cara Caramelo',
  source: geometry.source,
  provenance: 'Recurso PNG 256×256 extraído estaticamente de icone.exe (LABCaramelo 0.1.2), sem execução.',
  viewBox: ISOTYPE_VIEWBOX,
  description: 'C manuscrito com ponto; geometria vetorial fiel ao ícone LABCaramelo fornecido. Versão principal Ink sobre bloco Caramel arredondado.',
  defaultVariant: 'caramel',
  variants: {
    caramel: '@caramelo/design-system/assets/brand/isotipo.svg',
    spectrum: '@caramelo/design-system/assets/brand/isotipo-spectrum.svg',
    ink: '@caramelo/design-system/assets/brand/isotipo-ink.svg',
    cream: '@caramelo/design-system/assets/brand/isotipo-cream.svg',
  },
  publicPath: '/caramelo/brand/isotipo.svg',
  palette: brandSpectrum.stops,
  guidelines: [
    'Usar o SVG vetorial ou o componente Isotype; não redesenhar o símbolo com letras, emoji ou outro ícone.',
    'Preservar o gesto manuscrito, o ponto e as proporções do original. Não esticar nem cortar.',
    'A variante caramel é a principal: símbolo Ink sobre bloco #FF701A. Spectrum reúne as cinco cores; Ink e Cream são alternativas transparentes de contraste.',
    'Reservar respiro de pelo menos 12% da altura; usar 32px ou mais em interfaces e 48px quando possível.',
    'Glitch e desvio cromático respondem ao gesto; movimento reduzido mantém o símbolo estático.',
    'Aplicar em interfaces da marca Caramelo. Preservar a identidade de clientes e logos de terceiros.',
  ],
} as const;

const xml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!);

/** Standalone transparent SVG, suitable for download, a favicon or an MCP resource. */
export function isotypeSvg({ variant = 'caramel', title = 'Um Cara Caramelo' }: { variant?: IsotypeVariant; title?: string } = {}): string {
  const gradient = `<defs><linearGradient id="caramelo-isotype-spectrum" x1="0%" y1="15%" x2="100%" y2="85%">${brandSpectrum.stops.map((color, i) => `<stop offset="${[0, 24, 48, 72, 100][i]}%" stop-color="${color}"/>`).join('')}</linearGradient></defs>`;
  const fill = variant === 'ink' || variant === 'caramel' ? '#101014' : variant === 'cream' ? '#FFF4E8' : 'url(#caramelo-isotype-spectrum)';
  const tile = variant === 'caramel' ? `<rect width="256" height="256" rx="${ISOTYPE_TILE_RADIUS}" fill="#FF701A"/>` : '';
  const paths = ISOTYPE_PATHS.map((d) => `<path d="${d}"/>`).join('');
  const dots = ISOTYPE_DOTS.map(({ cx, cy, r }) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ISOTYPE_VIEWBOX}" role="img" aria-labelledby="caramelo-isotype-title"><title id="caramelo-isotype-title">${xml(title)}</title>${variant === 'spectrum' ? gradient : ''}${tile}<g fill="${fill}">${paths}${dots}</g></svg>`;
}
