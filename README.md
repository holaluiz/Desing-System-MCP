# Um Cara Caramelo — Design System (V1 2026)
### Repositório Central de Design System para Replicação em Todos os Apps
**Laboratório de Interação • Luiz, Head de Interação**

> **"STILLNESS = CAMADAS ALINHADAS  •  MOVEMENT = CAMADAS SE SEPARAM"**  
> *"Estratégia precisa ser sentida. Marca não é só o que ela diz. É o que ela faz você fazer."*

---

## 01. Visão Geral

Este repositório é a **única fonte da verdade visual e interativa** para todas as aplicações, plataformas, landing pages e ferramentas digitais do ecossistema **Um Cara Caramelo**.

Ele foi desenhado para ser consumido e replicado sem atrito em qualquer projeto web (Next.js, Vite/React, Remix, Astro ou Tailwind CSS puro).

### O que este pacote entrega:
1. **Tokens Canônicos Plataforma-Agnósticos:** Cores oficiais V1 2026, escalas tipográficas em 3 vozes, espaçamentos, elevações gráficas e curvas de motion.
2. **Preset Plug-and-Play para Tailwind CSS:** Injeção direta de paletas, fontes e sombras sólidas em qualquer projeto com Tailwind.
3. **Biblioteca de Componentes React Tipados:** Wordmarks com registro de impressão, lockups hierárquicos, botões cinéticos com resposta tátil, cards com halftone, inputs acessíveis e contêineres de separação de camadas.
4. **Camada de Texturas e Efeitos Táteis:** Retículas Ben-Day, granulação de película (print grain), offsets CMYK (*misregistration*) e sombras gráficas duras.
5. **Showcase Interativo Local:** Uma aplicação visual viva para testar e inspecionar todos os componentes e tokens.

---

## 02. Estrutura do Repositório

```
design-system/
├── dist/                      # Pacote compilado (ESM, CJS, .d.ts, styles.css)
├── src/
│   ├── index.ts               # Entrada unificada da biblioteca
│   ├── tokens/                # Tokens canônicos (cores, tipografia, motion, JSON)
│   │   ├── colors.ts          # Paleta V1 2026 e contrastes WCAG
│   │   ├── typography.ts      # 3 Vozes: Grotesca Pesada, Sans, Manuscrita
│   │   ├── shadows.ts         # Sombras gráficas sólidas
│   │   ├── motion.ts          # Princípio Stillness/Movement
│   │   └── tokens.json        # Tokens universais para qualquer stack
│   ├── styles/                # CSS master, variáveis e texturas
│   │   ├── variables.css      # Custom properties (:root)
│   │   ├── textures.css       # Halftone, grain, misregistration
│   │   └── typography.css     # Webfonts e utilitários
│   ├── tailwind/              # Preset pronto para Tailwind
│   │   └── preset.ts          # carameloPreset
│   ├── components/            # Componentes React tipados
│   │   ├── Wordmark/          # UM CARA CARAMELO (registro de impressão)
│   │   ├── Lockup/            # Institucional, Explicativo, Autoral, Bio
│   │   ├── Button/            # Botões cinéticos com resposta tátil
│   │   ├── Typography/        # DisplayHeading, Text, HandwrittenNote, Eyebrow
│   │   ├── Card/              # Cards com halftone e cortes gráficos
│   │   ├── Badge/             # Badges elétricos
│   │   ├── Input/             # Campos acessíveis com foco Electric Sky
│   │   ├── Texture/           # HalftoneOverlay, MisregistrationText
│   │   └── Motion/            # LayerSplit (camadas que se separam no hover)
│   └── utils/
│       └── cn.ts              # Utilitário clsx + tailwind-merge
└── apps/
    └── showcase/              # App Vite interativo para documentação viva
```

---

## 03. Paleta Canônica de Cores (Manual V1 2026)

| Nome | Hex | Função | Ratio sobre Ink Black |
|---|---|---|---|
| **Ink Black** | `#101014` | Base Principal (Fundo escuro, contraste) | Base |
| **Warm Cream** | `#FFF4E8` | Base Clara (Editorial, respiro humano) | 17.50:1 (AAA) |
| **Caramel Orange** | `#FF701A` | Assinatura Oficial (CTAs, momentos-chave) | 6.86:1 (AA) |
| **Electric Sky** | `#25BFFF` | Acento Digital (Links, sinalização fria) | 9.02:1 (AAA) |
| **Hot Pink** | `#FF3D8D` | Acento de Provocação (Comentários críticos) | 5.70:1 (AA) |
| **Electric Violet** | `#7657FF` | Acento de Transição (Estados especiais) | 4.14:1 (AA Large) |
| **Acid Yellow** | `#FFD52A` | Acento Alta Visibilidade (Alertas, humor) | 13.38:1 (AAA) |

> [!IMPORTANT]
> **Regra Cromática Canônica:** Usar **apenas 1 cor de destaque dominante por cena**. A paleta inteira existe no sistema, mas nunca deve poluir simultaneamente a mesma peça.

---

## 04. Tipografia em Três Vozes

As mesmas fontes do LP (ADR-006), auto-hospedadas em WOFF2 com licença OFL dentro do `styles.css`:

1. **Display — Montserrat 800–900:** títulos de cena, números, wordmark. Entrelinha 0.88–1.03 e tracking −0.065em (hero −0.073em).  
   Escala pronta: `text-cm-hero`, `text-cm-display`, `text-cm-display-sm`, `text-cm-title`, `text-cm-subtitle`, `text-cm-heading` (ou classes `.cm-type-*`).
2. **Texto — Inter 400–600:** leitura, interface e navegação; apoio 13–15px; meta 11px em caixa alta com tracking 0.1em (`text-cm-meta`).
3. **Mão — Covered By Your Grace 400:** notas curtas, giradas −3°/−4°, na cor do acento (`.cm-type-hand`).  
   - **Proibição:** NUNCA usar em parágrafos longos, menus, preços ou botões.
4. **Técnica — mono do sistema** (`ui-monospace`): comandos, tokens, atalhos.

### Motion cinematográfico (dos sites do Luiz)
Smooth scroll Lenis (lerp 0.075, só mouse), títulos linha a linha por máscara, mídia por recorte, entradas que já começam legíveis, profundidade ao rolar, barra de progresso + navegação por cenas, pilha de cartões sticky, ofertas sticky que chegam, palavras que acendem, comparador antes/depois, rastro de imagens e tilt no mouse, cascata só com CSS e vídeo que só toca visível.

```tsx
import { SmoothScroll, LineReveal, Reveal, Parallax, PointerTrail, StickyDeck } from '@caramelo/design-system';
// HTML puro: import { initCaramelMotion } from '@caramelo/design-system/motion' + atributos data-cm-*
```
Tudo respeita `prefers-reduced-motion`, funciona sem JS e desliga com `?motion=off`. `lenis` é dependência opcional (`npm i lenis`).

---

## 05. Como Replicar e Usar em Qualquer App

### Passo 1: Instalar no app de destino
No diretório do seu app (ex: um app Next.js ou Vite), instale a dependência:

```bash
# Opção A: Vinculando localmente no mesmo ambiente
npm install "file:../Design System"

# Opção B: Vinculando via Git (privado ou público)
npm install git+https://github.com/seu-usuario/caramelo-design-system.git
```

### Passo 2: Configurar o Tailwind CSS
No `tailwind.config.ts` ou `tailwind.config.js` do seu app:

```ts
import type { Config } from 'tailwindcss';
import { carameloPreset } from '@caramelo/design-system/tailwind';

export default {
  presets: [carameloPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@caramelo/design-system/**/*.{js,ts,jsx,tsx}', // Importante para estilizar os componentes importados
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

### Passo 3: Importar os Estilos Globais
No arquivo de entrada do app (ex: `app/layout.tsx` no Next.js ou `src/main.tsx` no Vite):

```tsx
import '@caramelo/design-system/styles.css';
```

### Passo 4: Usar os Componentes React
```tsx
import {
  Wordmark,
  Lockup,
  Button,
  DisplayHeading,
  Text,
  HandwrittenNote,
  Card,
  Badge,
} from '@caramelo/design-system';

export default function Home() {
  return (
    <main className="min-h-screen bg-ink text-cream p-8">
      {/* Assinatura Oficial */}
      <Lockup type="institucional" size="md" variant="cream" />

      {/* Tipografia em 3 vozes */}
      <div className="mt-8">
        <DisplayHeading size="xl">
          LABORATÓRIO DE <span className="text-caramel">INTERAÇÃO</span>
        </DisplayHeading>
        
        <HandwrittenNote color="yellow" rotate="-2">
          ← presença de cartaz!
        </HandwrittenNote>
      </div>

      <Text size="base" className="mt-4 max-w-lg">
        Construindo sistemas de interface, conteúdo cinematográfico e experiências digitais.
      </Text>

      {/* Botões cinéticos */}
      <div className="mt-6 flex items-center gap-4">
        <Button variant="primary">Explorar Projetos</Button>
        <Button variant="ink">Acessar Lab</Button>
      </div>
    </main>
  );
}
```

---

## 06. Como Consumir sem React (HTML Puro, Vue, Mobile ou Figma)

Se você estiver em um projeto sem React ou precisar dos tokens em outra plataforma:

1. **Tokens JSON:** Disponíveis em `src/tokens/tokens.json`.
2. **CSS Custom Properties:** Importe apenas `dist/styles.css` e use as variáveis nativas:
   - `var(--caramelo-color-ink)`
   - `var(--caramelo-color-caramel)`
   - `var(--caramelo-shadow-md)`
   - `var(--caramelo-ease-kinetic)`

---

## 07. Servidor MCP de UX/UI (Model Context Protocol)

Este repositório também funciona como um **Servidor MCP nativo (v2)**: assistentes de IA (Cursor, Windsurf, Claude Desktop, Claude Code, Antigravity) auditam e **transformam qualquer interface ou design system** na identidade visual e na interatividade Caramelo. O motor mede — contraste WCAG, foco, física de clique, motion — em vez de opinar.

### Ferramentas MCP
| Tool | O que faz |
|---|---|
| `transform_to_caramelo` | Converte JSX/TSX, HTML, Vue ou CSS. Cores viram **papéis semânticos** (funcionam nos dois temas e com qualquer acento de cena); temas por variáveis (shadcn, Bootstrap, MUI, Material 3, Chakra) recebem valores Caramelo **no mesmo formato**; sombras, raios e motion viram tokens; adiciona só a interação que falta (press 80ms, hover luminoso, foco Electric Sky, halo em campos, reduced-motion) e corrige a11y segura. Devolve nota de auditoria antes → depois, cada mudança por linha e o que exige decisão humana. Opções: `material` (lumen/print), `theme`, `accent`, `strategy` (unify/preserve). |
| `audit_ux_ui` | Nota 0–100 por categoria (acessibilidade, contraste, interação, motion, identidade, tipografia, UX), com contraste calculado por herança de fundo e achados por linha marcados como `auto` quando o transform resolve. |
| `map_colors` | Cores de qualquer formato (hex, rgb, hsl, oklch, triplets shadcn) → tinta da marca mais próxima (ΔE OKLab), papel semântico equivalente e contraste. |
| `check_contrast_wcag` | Contraste WCAG em qualquer formato; se falhar, sugere as tintas/papéis Caramelo mais próximos que passam. |
| `list_interactions` / `get_interaction` | Catálogo de microinterações (problema de UX, quando usar/evitar, motion, a11y) e o código pronto: componente React + HTML com classes `cm-*` + JS mínimo. |
| `get_design_tokens` | `json`, `css` (variáveis `--cm-*` com temas e acentos), `tailwind`, `semantic` ou `all`. |
| `generate_caramelo_component` | Componentes prontos — Lumen (MagneticButton, Surface, FocusField, SpotlightTabs, GlideMenu, Reveal…) ou Print. |

### Recursos & Prompts
- **Recursos:** `caramelo://guidelines/manual`, `caramelo://guidelines/engine`, `caramelo://tokens/json`, `caramelo://tokens/css`, `caramelo://tokens/semantic`, `caramelo://interactions/catalog`, `caramelo://components/catalog`.
- **Prompts:** `audit-ux-ui`, `transform-to-caramelo`, `convert-design-system`, `elevate-interaction`.

### Motor programático
O mesmo motor está disponível para scripts e builds:
```ts
import { transform, audit } from '@caramelo/design-system/engine';

const before = audit(code);
const { code: next, changes, manual } = transform(code, { material: 'lumen', accent: 'sky' });
```
A vitrine (`npm run showcase`) traz um playground que roda o motor no navegador.

### Como Configurar nos Seus Editores e IAs:

#### No Cursor (`.cursor/mcp.json` ou Configurações de MCP):
```json
{
  "mcpServers": {
    "caramelo-design-system": {
      "command": "node",
      "args": [
        "d:/meus documentos/Design System/dist/mcp/index.js"
      ]
    }
  }
}
```

#### No Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "caramelo-design-system": {
      "command": "node",
      "args": [
        "d:/meus documentos/Design System/dist/mcp/index.js"
      ]
    }
  }
}
```

#### No Windsurf / VS Code / Antigravity:
Aponte o executável para `node "d:/meus documentos/Design System/dist/mcp/index.js"`.

---

## 08. Comandos de Manutenção

- `npm run build`: Compila a biblioteca (`tsup`) gerando ESM, CJS, `.d.ts`, `dist/styles.css` e o binário MCP.
- `npm run mcp`: Inicia o servidor MCP diretamente via stdio.
- `npm run dev`: Executa a compilação em modo watch contínuo.
- `npm run showcase`: Inicia o app Vite de documentação viva em `http://localhost:3000`.
