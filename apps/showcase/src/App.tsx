import { useState } from 'react';
import {
  Wordmark,
  Lockup,
  Button,
  DisplayHeading,
  Text,
  HandwrittenNote,
  Eyebrow,
  Card,
  Badge,
  Input,
  HalftoneOverlay,
  MisregistrationText,
  LayerSplit,
} from '@caramelo/design-system';

export default function App() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'components' | 'tokens' | 'integration'>('components');

  const palette = [
    { name: 'Ink Black', hex: '#101014', role: 'Base Principal (Escuro)', ratio: 'Base', textDark: false },
    { name: 'Warm Cream', hex: '#FFF4E8', role: 'Base Clara (Editorial)', ratio: '17.50:1 (AAA)', textDark: true },
    { name: 'Caramel Orange', hex: '#FF701A', role: 'Assinatura da Marca', ratio: '6.86:1 (AA)', textDark: false },
    { name: 'Electric Sky', hex: '#25BFFF', role: 'Acento Digital & Links', ratio: '9.02:1 (AAA)', textDark: true },
    { name: 'Hot Pink', hex: '#FF3D8D', role: 'Acento de Provocação', ratio: '5.70:1 (AA)', textDark: false },
    { name: 'Electric Violet', hex: '#7657FF', role: 'Acento de Transição', ratio: '4.14:1 (AA Large)', textDark: false },
    { name: 'Acid Yellow', hex: '#FFD52A', role: 'Acento Alta Visibilidade', ratio: '13.38:1 (AAA)', textDark: true },
  ];

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#101014] text-[#FFF4E8] font-sans selection:bg-[#FF701A] selection:text-[#101014]">
      {/* Barra de Topo / Marca */}
      <header className="border-b-2 border-[#27272F] bg-[#141419]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <Lockup type="institucional" size="sm" variant="cream" />
          
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('components')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border ${
                activeTab === 'components'
                  ? 'bg-[#FF701A] text-[#101014] border-[#101014] shadow-[2px_2px_0px_#101014]'
                  : 'text-[#FFF4E8]/70 border-transparent hover:text-[#FFF4E8] hover:border-[#27272F]'
              }`}
            >
              Componentes
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border ${
                activeTab === 'tokens'
                  ? 'bg-[#FF701A] text-[#101014] border-[#101014] shadow-[2px_2px_0px_#101014]'
                  : 'text-[#FFF4E8]/70 border-transparent hover:text-[#FFF4E8] hover:border-[#27272F]'
              }`}
            >
              Tokens & Paleta
            </button>
            <button
              onClick={() => setActiveTab('integration')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border ${
                activeTab === 'integration'
                  ? 'bg-[#FF701A] text-[#101014] border-[#101014] shadow-[2px_2px_0px_#101014]'
                  : 'text-[#FFF4E8]/70 border-transparent hover:text-[#FFF4E8] hover:border-[#27272F]'
              }`}
            >
              Como Replicar nos Apps
            </button>
          </nav>
        </div>
      </header>

      {/* Hero com Assinatura Canônica */}
      <section className="relative border-b-2 border-[#27272F] overflow-hidden py-16 px-6">
        <div className="absolute inset-0 caramelo-halftone-subtle opacity-30 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Badge color="caramel">Manual V1 2026</Badge>
            <Eyebrow color="sky">Design System Repositório Mestre</Eyebrow>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <DisplayHeading size="xl" className="text-[#FFF4E8]">
                ESTRATÉGIA PRECISA <br />
                <span className="text-[#FF701A]">SER SENTIDA.</span>
              </DisplayHeading>
              
              <div className="mt-3 flex items-center gap-3">
                <Text size="lg" variant="muted" className="max-w-xl">
                  Marca não é só o que ela diz. É o que ela faz você fazer.
                </Text>
                <HandwrittenNote color="yellow" rotate="-2">
                  ← base canônica!
                </HandwrittenNote>
              </div>
            </div>

            {/* Princípio Central em Destaque */}
            <div className="p-4 bg-[#1F1F26] border-2 border-[#FF701A] shadow-[4px_4px_0px_#FF701A] max-w-sm">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#FF701A] block mb-1">
                Princípio Central de Motion & UI
              </span>
              <p className="font-display font-black text-sm uppercase leading-tight text-[#FFF4E8]">
                STILLNESS = CAMADAS ALINHADAS <br />
                MOVEMENT = CAMADAS SE SEPARAM
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo por Abas */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {activeTab === 'components' && (
          <div className="flex flex-col gap-16">
            {/* 0. Wordmark & Assinaturas */}
            <section className="flex flex-col gap-6">
              <div className="flex items-baseline justify-between border-b border-[#27272F] pb-3">
                <div>
                  <Eyebrow color="caramel">00. Identidade Gráfica</Eyebrow>
                  <DisplayHeading as="h2" size="md">Wordmark & Lockups</DisplayHeading>
                </div>
                <HandwrittenNote color="yellow" rotate="-1">
                  passe o mouse para ver o offset CMYK
                </HandwrittenNote>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-[#18181D] border-2 border-[#27272F] flex flex-col justify-between">
                  <span className="text-xs text-neutral-400 font-bold uppercase mb-4 block">Wordmark Cream</span>
                  <Wordmark size="lg" variant="cream" />
                  <span className="text-[0.65rem] text-neutral-500 mt-4 block">Fundo escuro principal</span>
                </div>

                <div className="p-6 bg-[#18181D] border-2 border-[#27272F] flex flex-col justify-between">
                  <span className="text-xs text-neutral-400 font-bold uppercase mb-4 block">Wordmark Caramel</span>
                  <Wordmark size="lg" variant="caramel" />
                  <span className="text-[0.65rem] text-neutral-500 mt-4 block">Cor de assinatura</span>
                </div>

                <div className="p-6 bg-[#FFF4E8] border-2 border-[#101014] flex flex-col justify-between text-[#101014]">
                  <span className="text-xs text-neutral-600 font-bold uppercase mb-4 block">Wordmark Ink</span>
                  <Wordmark size="lg" variant="ink" />
                  <span className="text-[0.65rem] text-neutral-600 mt-4 block">Editorial em fundo claro</span>
                </div>
              </div>

              <div className="p-4 bg-[#141419] border border-[#27272F] flex items-center justify-between">
                <span className="text-xs text-neutral-400">Texto com Registro de Impressão:</span>
                <MisregistrationText className="font-display font-black text-xl uppercase text-[#FFF4E8]">
                  DESALINHAMENTO ÓPTICO PONTUAL
                </MisregistrationText>
              </div>
            </section>

            {/* 1. Botões Cinéticos */}
            <section className="flex flex-col gap-6">
              <div className="flex items-baseline justify-between border-b border-[#27272F] pb-3">
                <div>
                  <Eyebrow color="caramel">01. Interação & Resposta</Eyebrow>
                  <DisplayHeading as="h2" size="md">Botões Cinéticos</DisplayHeading>
                </div>
                <HandwrittenNote color="sky" rotate="1">
                  física tátil com sombra gráfica
                </HandwrittenNote>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex flex-col gap-2 p-4 bg-[#18181D] border border-[#27272F]">
                  <span className="text-xs text-neutral-400 font-bold uppercase">Primary (Caramel)</span>
                  <Button variant="primary">Explorar Lab</Button>
                </div>

                <div className="flex flex-col gap-2 p-4 bg-[#18181D] border border-[#27272F]">
                  <span className="text-xs text-neutral-400 font-bold uppercase">Ink (Dark)</span>
                  <Button variant="ink">Assinar Conteúdo</Button>
                </div>

                <div className="flex flex-col gap-2 p-4 bg-[#18181D] border border-[#27272F]">
                  <span className="text-xs text-neutral-400 font-bold uppercase">Cream (Light)</span>
                  <Button variant="cream">Ver Projetos</Button>
                </div>

                <div className="flex flex-col gap-2 p-4 bg-[#18181D] border border-[#27272F]">
                  <span className="text-xs text-neutral-400 font-bold uppercase">Electric Sky</span>
                  <Button variant="sky">Copiar Código</Button>
                </div>

                <div className="flex flex-col gap-2 p-4 bg-[#18181D] border border-[#27272F]">
                  <span className="text-xs text-neutral-400 font-bold uppercase">Ghost</span>
                  <Button variant="ghost">Cancelar</Button>
                </div>
              </div>
            </section>

            {/* 2. Tipografia em Três Vozes */}
            <section className="flex flex-col gap-6">
              <div className="flex items-baseline justify-between border-b border-[#27272F] pb-3">
                <div>
                  <Eyebrow color="sky">02. Voz e Tom Editorial</Eyebrow>
                  <DisplayHeading as="h2" size="md">Tipografia em 3 Vozes</DisplayHeading>
                </div>
                <HandwrittenNote color="pink" rotate="-1">
                  cada voz tem uma função clara
                </HandwrittenNote>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="dark" className="flex flex-col gap-3">
                  <Badge color="caramel">Voz 1 — Grotesca Pesada</Badge>
                  <DisplayHeading as="h3" size="md">
                    PRESENÇA DE PÔSTER
                  </DisplayHeading>
                  <Text size="sm" variant="muted">
                    Display, títulos de cena, chamadas de alto impacto e CTAs principais.
                  </Text>
                </Card>

                <Card variant="dark" className="flex flex-col gap-3">
                  <Badge color="sky">Voz 2 — Sans Funcional</Badge>
                  <Text size="base">
                    Texto de leitura confortável, hierarquia precisa para interfaces, parágrafos, dados e navegação.
                  </Text>
                  <Text size="sm" variant="muted">
                    Inter funcional de alta legibilidade em qualquer dispositivo.
                  </Text>
                </Card>

                <Card variant="dark" className="flex flex-col gap-3">
                  <Badge color="pink">Voz 3 — Manuscrita</Badge>
                  <div className="py-2">
                    <HandwrittenNote color="yellow" rotate="-2">
                      “Elegância + pequena confissão patética.”
                    </HandwrittenNote>
                  </div>
                  <Text size="sm" variant="muted">
                    Intervenções humanas, ironias e pensamentos. Proibido em botões e parágrafos longos!
                  </Text>
                </Card>
              </div>
            </section>

            {/* 3. Cards & Texturas */}
            <section className="flex flex-col gap-6">
              <div className="flex items-baseline justify-between border-b border-[#27272F] pb-3">
                <div>
                  <Eyebrow color="pink">03. Matéria & Espaço</Eyebrow>
                  <DisplayHeading as="h2" size="md">Cards & Texturas Táteis</DisplayHeading>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="dark" halftone interactive>
                  <Eyebrow color="caramel">Halftone Retícula</Eyebrow>
                  <h4 className="font-display font-black text-xl mt-2 mb-1">Superfície Impressa</h4>
                  <p className="text-sm text-neutral-300">
                    Passe o mouse para testar a separação cinética de camadas e retícula Ben-Day.
                  </p>
                </Card>

                <HalftoneOverlay density="normal">
                  <Card variant="light" interactive>
                    <Eyebrow color="caramel">Editorial Cream</Eyebrow>
                    <h4 className="font-display font-black text-xl mt-2 mb-1 text-[#101014]">Contraponto Humano</h4>
                    <p className="text-sm text-[#101014]/80">
                      Warm Cream (#FFF4E8) para respiros editoriais e alta legibilidade em luz diurna.
                    </p>
                  </Card>
                </HalftoneOverlay>

                <LayerSplit accentColor="caramel">
                  <Eyebrow color="yellow">Física de Movimento</Eyebrow>
                  <h4 className="font-display font-black text-xl mt-2 mb-1">Layer Split Interativo</h4>
                  <p className="text-sm text-neutral-300">
                    No repouso as camadas se alinham. No movimento, a tinta e o fundo se separam.
                  </p>
                </LayerSplit>
              </div>
            </section>

            {/* 4. Formulários & Validação */}
            <section className="flex flex-col gap-6">
              <div className="flex items-baseline justify-between border-b border-[#27272F] pb-3">
                <div>
                  <Eyebrow color="yellow">04. Formulários</Eyebrow>
                  <DisplayHeading as="h2" size="md">Inputs & Acessibilidade</DisplayHeading>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Email de Contato"
                  placeholder="voce@dominio.com.br"
                  hint="Foco em Electric Sky (#25BFFF)"
                />

                <Input
                  label="Nome da Operação"
                  defaultValue="Um Cara Caramelo Lab"
                  hint="Estado preenchido com contraste WCAG"
                />

                <Input
                  label="Chave de Acesso"
                  defaultValue="123"
                  error="Formato inválido. Insira ao menos 8 caracteres."
                />
              </div>
            </section>
          </div>
        )}

        {activeTab === 'tokens' && (
          <div className="flex flex-col gap-12">
            <div>
              <Eyebrow color="caramel">Paleta Canônica V1 2026</Eyebrow>
              <DisplayHeading as="h2" size="lg">Base Sóbria. Acentos Elétricos.</DisplayHeading>
              <Text size="base" variant="muted" className="mt-2 max-w-2xl">
                Regra de ouro cromática: usar apenas <strong>1 cor de destaque dominante por cena</strong>.
                Clique em qualquer cor para copiar o código HEX.
              </Text>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {palette.map((item) => (
                <div
                  key={item.hex}
                  onClick={() => copyToClipboard(item.hex)}
                  className="p-5 border-2 border-[#27272F] bg-[#18181D] cursor-pointer transition-all hover:-translate-y-1 hover:border-[#FFF4E8] flex flex-col justify-between h-48 select-none"
                >
                  <div
                    className="w-full h-16 border-2 border-[#101014] flex items-center justify-center font-black font-display text-sm"
                    style={{ backgroundColor: item.hex, color: item.textDark ? '#101014' : '#FFF4E8' }}
                  >
                    {copiedColor === item.hex ? 'COPIADO!' : item.hex}
                  </div>
                  
                  <div className="mt-3">
                    <div className="font-display font-black text-sm uppercase">{item.name}</div>
                    <div className="text-xs text-neutral-400">{item.role}</div>
                    <div className="text-[0.65rem] font-bold text-[#FF701A] mt-1">WCAG: {item.ratio}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tokens JSON preview */}
            <div className="bg-[#141419] border-2 border-[#27272F] p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-bold text-sm uppercase text-[#FF701A]">
                  src/tokens/tokens.json (Padrão Universal)
                </span>
                <Badge color="sky">Plataforma-agnóstico</Badge>
              </div>
              <pre className="text-xs text-neutral-300 font-mono overflow-x-auto p-4 bg-[#101014] border border-[#27272F]">
{`{
  "color": {
    "ink": { "value": "#101014" },
    "cream": { "value": "#FFF4E8" },
    "caramel": { "value": "#FF701A" },
    "sky": { "value": "#25BFFF" },
    "pink": { "value": "#FF3D8D" },
    "violet": { "value": "#7657FF" },
    "yellow": { "value": "#FFD52A" }
  },
  "principle": "STILLNESS = CAMADAS ALINHADAS • MOVEMENT = CAMADAS SE SEPARAM"
}`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'integration' && (
          <div className="flex flex-col gap-10">
            <div>
              <Eyebrow color="sky">Replicação Instantânea</Eyebrow>
              <DisplayHeading as="h2" size="lg">Como Consumir em Todos os Seus Apps</DisplayHeading>
              <Text size="base" variant="muted" className="mt-2 max-w-2xl">
                O repositório foi construído de forma modular para suportar Next.js (App Router), Vite/React, Tailwind CSS puro ou qualquer framework web.
              </Text>
            </div>

            {/* Método 1: Instalação via NPM / Local / Git */}
            <Card variant="dark" className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-lg uppercase text-[#FF701A]">
                  1. Instalação no Seu App
                </h3>
                <Badge color="caramel">Passo 1</Badge>
              </div>
              <Text size="sm">
                No diretório do seu app (ex: Next.js ou Vite), instale o Design System direto do caminho local ou repositório Git:
              </Text>
              <pre className="text-xs font-mono p-4 bg-[#101014] border border-[#27272F] text-[#25BFFF] overflow-x-auto">
{`# Opção A: Vinculando localmente no mesmo computador:
npm install "file:../Design System"

# Opção B: Vinculando via repositório Git privado ou público:
npm install git+https://github.com/seu-usuario/design-system.git`}
              </pre>
            </Card>

            {/* Método 2: Tailwind Preset */}
            <Card variant="dark" className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-lg uppercase text-[#25BFFF]">
                  2. Conectar o Preset do Tailwind (tailwind.config.js / ts)
                </h3>
                <Badge color="sky">Passo 2</Badge>
              </div>
              <Text size="sm">
                Adicione o preset oficial ao seu arquivo <code>tailwind.config.ts</code> ou <code>tailwind.config.js</code>:
              </Text>
              <pre className="text-xs font-mono p-4 bg-[#101014] border border-[#27272F] text-neutral-300 overflow-x-auto">
{`import { carameloPreset } from '@caramelo/design-system/tailwind';

export default {
  presets: [carameloPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@caramelo/design-system/**/*.{js,ts,jsx,tsx}',
  ],
};`}
              </pre>
            </Card>

            {/* Método 3: Importação de Estilos e Componentes */}
            <Card variant="dark" className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-lg uppercase text-[#FF3D8D]">
                  3. Usar no Código (React / Next.js)
                </h3>
                <Badge color="pink">Passo 3</Badge>
              </div>
              <Text size="sm">
                Importe os estilos globais no seu <code>layout.tsx</code> ou <code>main.tsx</code> e use os componentes prontos:
              </Text>
              <pre className="text-xs font-mono p-4 bg-[#101014] border border-[#27272F] text-neutral-300 overflow-x-auto">
{`// No seu layout.tsx ou globals.css:
import '@caramelo/design-system/styles.css';

// Em qualquer página ou componente:
import { 
  Button, 
  Wordmark, 
  Lockup, 
  DisplayHeading, 
  HandwrittenNote, 
  Card 
} from '@caramelo/design-system';

export default function HomePage() {
  return (
    <main className="bg-ink text-cream min-h-screen p-8">
      <Lockup type="institucional" size="md" />
      <DisplayHeading size="lg" className="mt-6">
        NOVA EXPERIÊNCIA DIGITAL
      </DisplayHeading>
      <HandwrittenNote color="yellow">← direto do design system</HandwrittenNote>
      <div className="mt-6">
        <Button variant="primary">Começar Agora</Button>
      </div>
    </main>
  );
}`}
              </pre>
            </Card>
          </div>
        )}
      </main>

      {/* Rodapé Canônico */}
      <footer className="border-t-2 border-[#27272F] py-8 px-6 bg-[#141419] mt-16 text-center">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Lockup type="autoral" size="sm" variant="cream" />
          <Text size="sm" variant="muted">
            Um Cara Caramelo — Laboratório de Interação • Belo Horizonte • 2026
          </Text>
        </div>
      </footer>
    </div>
  );
}
