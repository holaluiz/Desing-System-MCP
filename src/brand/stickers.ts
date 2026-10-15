/** Original user-supplied artwork, extracted without recoloring or redraw. */
export interface TrailSticker {
  readonly id: string;
  readonly label: string;
  readonly file: string;
  readonly width: number;
  readonly height: number;
}

export const STICKER_PUBLIC_PATH = '/caramelo/stickers' as const;

export const STICKER_SOURCE = {
  "source": "rastro mouse.png",
  "sourceWidth": 1122,
  "sourceHeight": 1402,
  "sourceSha256": "1c990f473a4af293128a4523cd36d5a24060a7bad2e69caad29d77774ca1088a",
  "format": "webp-lossless",
  "count": 28
} as const;

export const TRAIL_STICKERS = [
  {
    "id": "cadeira",
    "label": "Cadeira de plástico",
    "file": "cadeira.webp",
    "width": 278,
    "height": 336
  },
  {
    "id": "copo",
    "label": "Copo de bar",
    "file": "copo.webp",
    "width": 208,
    "height": 255
  },
  {
    "id": "lata",
    "label": "Lata de bebida",
    "file": "lata.webp",
    "width": 198,
    "height": 289
  },
  {
    "id": "spray",
    "label": "Lata de spray",
    "file": "spray.webp",
    "width": 187,
    "height": 332
  },
  {
    "id": "violao",
    "label": "Violão",
    "file": "violao.webp",
    "width": 328,
    "height": 390
  },
  {
    "id": "bola",
    "label": "Bola de futebol",
    "file": "bola.webp",
    "width": 262,
    "height": 255
  },
  {
    "id": "chinelo",
    "label": "Chinelo",
    "file": "chinelo.webp",
    "width": 223,
    "height": 302
  },
  {
    "id": "onibus",
    "label": "Ônibus",
    "file": "onibus.webp",
    "width": 427,
    "height": 243
  },
  {
    "id": "capacete",
    "label": "Capacete",
    "file": "capacete.webp",
    "width": 267,
    "height": 285
  },
  {
    "id": "poste",
    "label": "Poste com fios",
    "file": "poste.webp",
    "width": 327,
    "height": 311
  },
  {
    "id": "luminaria",
    "label": "Luminária de rua",
    "file": "luminaria.webp",
    "width": 320,
    "height": 255
  },
  {
    "id": "rolo",
    "label": "Rolo de pintura",
    "file": "rolo.webp",
    "width": 272,
    "height": 291
  },
  {
    "id": "caderno",
    "label": "Caderno",
    "file": "caderno.webp",
    "width": 252,
    "height": 285
  },
  {
    "id": "camera",
    "label": "Câmera",
    "file": "camera.webp",
    "width": 256,
    "height": 239
  },
  {
    "id": "bilhete",
    "label": "Bilhete de ônibus",
    "file": "bilhete.webp",
    "width": 286,
    "height": 175
  },
  {
    "id": "caneca",
    "label": "Caneca com coração",
    "file": "caneca.webp",
    "width": 240,
    "height": 213
  },
  {
    "id": "folha",
    "label": "Folha de bananeira",
    "file": "folha.webp",
    "width": 381,
    "height": 262
  },
  {
    "id": "planta",
    "label": "Planta no vaso",
    "file": "planta.webp",
    "width": 344,
    "height": 375
  },
  {
    "id": "raio",
    "label": "Raio",
    "file": "raio.webp",
    "width": 159,
    "height": 257
  },
  {
    "id": "coracao",
    "label": "Coração",
    "file": "coracao.webp",
    "width": 170,
    "height": 216
  },
  {
    "id": "olho",
    "label": "Olho",
    "file": "olho.webp",
    "width": 239,
    "height": 231
  },
  {
    "id": "arcos",
    "label": "Arcos sobre a água",
    "file": "arcos.webp",
    "width": 393,
    "height": 263
  },
  {
    "id": "caramelo",
    "label": "Cão caramelo",
    "file": "caramelo.webp",
    "width": 351,
    "height": 251
  },
  {
    "id": "palmeira",
    "label": "Palmeira",
    "file": "palmeira.webp",
    "width": 200,
    "height": 216
  },
  {
    "id": "estrelas",
    "label": "Estrelas",
    "file": "estrelas.webp",
    "width": 202,
    "height": 187
  },
  {
    "id": "coroa",
    "label": "Coroa",
    "file": "coroa.webp",
    "width": 207,
    "height": 178
  },
  {
    "id": "seta",
    "label": "Seta",
    "file": "seta.webp",
    "width": 247,
    "height": 147
  },
  {
    "id": "conexoes",
    "label": "Conexões",
    "file": "conexoes.webp",
    "width": 183,
    "height": 180
  }
] as const satisfies readonly TrailSticker[];

/** Resolve the complete canonical set against a public asset directory. */
export function resolveTrailStickers(basePath: string = STICKER_PUBLIC_PATH): string[] {
  const base = basePath.replace(/\/+$/, '');
  return TRAIL_STICKERS.map((sticker) => `${base}/${sticker.file}`);
}
