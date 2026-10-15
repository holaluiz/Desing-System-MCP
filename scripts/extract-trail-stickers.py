"""Extract original artwork only; retain source RGBA pixels and alpha edges.

Three pairs have touching white borders in the supplied sheet. Their separation
paths stay within those borders. All other pieces use connected alpha regions.
Requires Pillow and NumPy. Run from any directory; no generated artwork is used.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, features
import hashlib
import importlib.util
import json
import sys
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'src/assets/stickers'
OUT.mkdir(parents=True, exist_ok=True)
PNG_OUT = ROOT / 'artifacts/brand/stickers-png'
QC_OUT = ROOT / 'artifacts/brand/sticker-qc'
PNG_OUT.mkdir(parents=True, exist_ok=True)
QC_OUT.mkdir(parents=True, exist_ok=True)
SOURCE = ROOT / 'rastro mouse.png'
source = Image.open(SOURCE).convert('RGBA')
pixels = np.asarray(source)
module_spec = importlib.util.spec_from_file_location('analysis', ROOT / 'scripts/analyze-sticker-sheet.py')
analysis = importlib.util.module_from_spec(module_spec)
module_spec.loader.exec_module(analysis)
regions, labels = analysis.components(source.getchannel('A').point(lambda v: 255 if v > 128 else 0), with_labels=True)

# Stable IDs, Portuguese labels and markers inside each original opaque region.
ARTWORK = [
    ('cadeira', 'Cadeira de plástico', (140, 150)),
    ('copo', 'Copo de bar', (380, 175)),
    ('lata', 'Lata de bebida', (550, 170)),
    ('spray', 'Lata de spray', (708, 200)),
    ('violao', 'Violão', (940, 250)),
    ('bola', 'Bola de futebol', (130, 440)),
    ('chinelo', 'Chinelo', (365, 450)),
    ('onibus', 'Ônibus', (650, 465)),
    ('capacete', 'Capacete', (990, 500)),
    ('poste', 'Poste com fios', (115, 700)),
    ('luminaria', 'Luminária de rua', (410, 620)),
    ('rolo', 'Rolo de pintura', (550, 680)),
    ('caderno', 'Caderno', (775, 700)),
    ('camera', 'Câmera', (990, 715)),
    ('bilhete', 'Bilhete de ônibus', (150, 890)),
    ('caneca', 'Caneca com coração', (390, 900)),
    ('folha', 'Folha de bananeira', (650, 930)),
    ('planta', 'Planta no vaso', (970, 970)),
    ('raio', 'Raio', (70, 1050)),
    ('coracao', 'Coração', (230, 1040)),
    ('olho', 'Olho', (385, 1120)),
    ('arcos', 'Arcos sobre a água', (670, 1140)),
    ('caramelo', 'Cão caramelo', (170, 1280)),
    ('palmeira', 'Palmeira', (421, 1280)),
    ('estrelas', 'Estrelas', (580, 1300)),
    ('coroa', 'Coroa', (780, 1300)),
    ('seta', 'Seta', (1000, 1300)),
    ('conexoes', 'Conexões', (987, 1190)),
]

def polygon(points):
    image = Image.new('1', source.size)
    ImageDraw.Draw(image).polygon(points, fill=1)
    return np.asarray(image, dtype=bool)

guitar = polygon([(780, 0), (1122, 0), (1122, 300), (1050, 310),
                  (1020, 338), (1000, 358), (990, 365), (980, 370),
                  (970, 374), (960, 378), (950, 381), (940, 384),
                  (920, 386), (780, 386)])
leaf = polygon([(440, 820), (860, 820), (860, 1045), (550, 1088),
                (492, 1083), (478, 1081), (465, 1074), (461, 1065),
                (468, 1050), (472, 1040), (475, 1026), (470, 1000)])
lightning = np.indices(labels.shape)[1] <= 151
separators = {'violao': guitar, 'capacete': ~guitar,
              'folha': leaf, 'olho': ~leaf,
              'raio': lightning, 'coracao': ~lightning}

owners = np.zeros(labels.shape, dtype=np.uint8)
for index, (identifier, caption, (x, y)) in enumerate(ARTWORK, 1):
    label = labels[y, x]
    if not label:
        raise ValueError(f'Marker for {identifier} must touch opaque original artwork')
    support = labels == label
    if identifier in separators:
        support &= separators[identifier]
    if identifier == 'caramelo':
        # The original includes the turquoise droplets to the dog's right.
        satellite = next(item[2] for item in regions if item[1] == (269, 1269, 341, 1345))
        support |= labels == satellite
    owners[support] = index

# Give every alpha fringe to its closest opaque region, without collecting the
# adjacent sticker. Growth is limited to eight pixels; colors are never changed.
for _ in range(8):
    expanded = owners.copy()
    for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)):
        neighbor = np.roll(owners, (dy, dx), axis=(0, 1))
        if dy < 0: neighbor[dy:] = 0
        if dy > 0: neighbor[:dy] = 0
        if dx < 0: neighbor[:, dx:] = 0
        if dx > 0: neighbor[:, :dx] = 0
        available = (expanded == 0) & (neighbor != 0)
        expanded[available] = neighbor[available]
    owners = expanded

manifest = []
previews = []
has_webp = features.check('webp')
only = set(sys.argv[1:])
for index, (identifier, caption, _) in enumerate(ARTWORK, 1):
    copy = pixels.copy()
    copy[owners != index, 3] = 0
    copy[copy[:, :, 3] == 0] = 0
    image = Image.fromarray(copy, 'RGBA')
    bbox = image.getchannel('A').getbbox()
    image = image.crop(bbox)
    padded = Image.new('RGBA', (image.width + 12, image.height + 12))
    padded.alpha_composite(image, (6, 6))
    image = padded
    if not only or identifier in only:
        image.save(PNG_OUT / f'{identifier}.png', optimize=True)
        if has_webp:
            image.save(OUT / f'{identifier}.webp', lossless=True, quality=100, method=6)
    manifest.append({'id': identifier, 'label': caption, 'file': f'{identifier}.webp' if has_webp else f'{identifier}.png', 'width': image.width, 'height': image.height, 'sourceBounds': list(bbox)})
    previews.append((identifier, image))

metadata = {'source': SOURCE.name, 'sourceWidth': source.width, 'sourceHeight': source.height,
            'sourceSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
            'format': 'webp-lossless' if has_webp else 'png', 'count': len(manifest), 'stickers': manifest}
(OUT / 'manifest.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

brand = ROOT / 'src/brand'
brand.mkdir(exist_ok=True)
source_contract = {key: value for key, value in metadata.items() if key != 'stickers'}
contract = [{key: value for key, value in item.items() if key != 'sourceBounds'} for item in manifest]
typescript = '''/** Original user-supplied artwork, extracted without recoloring or redraw. */
export interface TrailSticker {
  readonly id: string;
  readonly label: string;
  readonly file: string;
  readonly width: number;
  readonly height: number;
}

export const STICKER_PUBLIC_PATH = '/caramelo/stickers' as const;

export const STICKER_SOURCE = ''' + json.dumps(source_contract, ensure_ascii=False, indent=2) + ''' as const;

export const TRAIL_STICKERS = ''' + json.dumps(contract, ensure_ascii=False, indent=2) + ''' as const satisfies readonly TrailSticker[];

/** Resolve the complete canonical set against a public asset directory. */
export function resolveTrailStickers(basePath: string = STICKER_PUBLIC_PATH): string[] {
  const base = basePath.replace(/\\/+$/, '');
  return TRAIL_STICKERS.map((sticker) => `${base}/${sticker.file}`);
}
'''
(brand / 'stickers.ts').write_text(typescript, encoding='utf-8')

contact = Image.new('RGB', (7 * 220, 4 * 245), '#19191f')
draw = ImageDraw.Draw(contact)
font = ImageFont.load_default(size=15)
for index, (identifier, image) in enumerate(previews):
    x, y = (index % 7) * 220, (index // 7) * 245
    image.thumbnail((196, 208), Image.Resampling.LANCZOS)
    contact.paste(image, (x + (220 - image.width) // 2, y + (212 - image.height) // 2), image)
    draw.text((x + 10, y + 220), f'{index + 1:02}  {identifier}', font=font, fill='#fff4e8')
contact.save(QC_OUT / 'contact-sheet.jpg', quality=90, optimize=True)
print(json.dumps({'count': len(manifest), 'format': metadata['format'],
                  'sourceSha256': metadata['sourceSha256'],
                  'ids': [item['id'] for item in manifest]}, ensure_ascii=False))
