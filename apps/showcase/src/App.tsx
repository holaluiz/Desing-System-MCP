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
  Textarea,
  Select,
  Checkbox,
  Toggle,
  Alert,
  Avatar,
  Divider,
  HalftoneOverlay,
  MisregistrationText,
  LayerSplit,
} from '@caramelo/design-system';

export default function App() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [toggleActive, setToggleActive] = useState<boolean>(true);
  const [toggleSky, setToggleSky] = useState<boolean>(false);
  const [checkboxChecked, setCheckboxChecked] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<string>('all');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(label);
    setTimeout(() => setCopiedToken(null), 2200);
  };

  // Cores canônicas oficiais (Manual V1 2026)
  const palette = [
    { name: 'Ink Black', hex: '#101014', rgb: '16, 16, 20', role: 'Base Principal (Fundo escuro, contraste, massa tipográfica)', ratio: 'Base', textDark: false },
    { name: 'Warm Cream', hex: '#FFF4E8', rgb: '255, 244, 232', role: 'Base Clara (Respiro editorial, contraponto humano)', ratio: '17.50:1 (AAA)', textDark: true },
    { name: 'Caramel Orange', hex: '#FF701A', rgb: '255, 112, 26', role: 'Assinatura Oficial (CTAs, momentos-chave, marcações)', ratio: '6.86:1 (AA)', textDark: false },
    { name: 'Electric Sky', hex: '#25BFFF', rgb: '37, 191, 255', role: 'Acento Digital (Interação, links, sinalização, profundidade fria)', ratio: '9.02:1 (AAA)', textDark: true },
    { name: 'Hot Pink', hex: '#FF3D8D', rgb: '255, 61, 141', role: 'Acento de Provocação (Comentários críticos, intervenções gráficas)', ratio: '5.70:1 (AA)', textDark: false },
    { name: 'Electric Violet', hex: '#7657FF', rgb: '118, 87, 255', role: 'Acento de Transição (Energia secundária, estados especiais)', ratio: '4.14:1 (AA Large)', textDark: false },
    { name: 'Acid Yellow', hex: '#FFD52A', rgb: '255, 213, 42', role: 'Acento Alta Visibilidade (Alertas, marcação rápida, humor)', ratio: '13.38:1 (AAA)', textDark: true },
  ];

  // Escala de espaçamento canônica
  const spacingScale = [
    { token: '1', px: '4px', rem: '0.25rem', width: 'w-1', use: 'Micro-gaps, offsets, borders' },
    { token: '2', px: '8px', rem: '0.5rem', width: 'w-2', use: 'Paddings compactos, badges, ícones' },
    { token: '3', px: '12px', rem: '0.75rem', width: 'w-3', use: 'Espaçamentos internos de botões sm' },
    { token: '4', px: '16px', rem: '1rem', width: 'w-4', use: 'Padrão base de padding, gaps de grid' },
    { token: '6', px: '24px', rem: '1.5rem', width: 'w-6', use: 'Padding de cards e painéis editoriais' },
    { token: '8', px: '32px', rem: '2rem', width: 'w-8', use: 'Separação entre blocos de conteúdo' },
    { token: '12', px: '48px', rem: '3rem', width: 'w-12', use: 'Respiros de seções médias' },
    { token: '16', px: '64px', rem: '4rem', width: 'w-16', use: 'Gaps de layout hero e títulos' },
    { token: '24', px: '96px', rem: '6rem', width: 'w-24', use: 'Grandes respiros de páginas completas' },
    { token: '32', px: '128px', rem: '8rem', width: 'w-32', use: 'Silêncio visual entre atos narrativos' },
  ];

  // Escala de tipografia canônica
  const typographyScale = [
    { name: 'Display 2XL', size: '4.5rem (72px)', leading: '0.92', tracking: '-0.035em', weight: 'Black / 900', voice: 'Grotesca Pesada', sample: 'LABORATÓRIO' },
    { name: 'Display XL', size: '3.5rem (56px)', leading: '0.96', tracking: '-0.03em', weight: 'Black / 900', voice: 'Grotesca Pesada', sample: 'ESTRATÉGIA PRECISA SER SENTIDA' },
    { name: 'Display LG', size: '2.5rem (40px)', leading: '1.05', tracking: '-0.02em', weight: 'Extrabold / 800', voice: 'Grotesca Pesada', sample: 'PRESENÇA DE CARTAZ' },
    { name: 'Heading LG', size: '2.0rem (32px)', leading: '1.20', tracking: '-0.015em', weight: 'Bold / 700', voice: 'Grotesca Pesada', sample: 'Sistemas com Intenção e Ritmo' },
    { name: 'Heading MD', size: '1.5rem (24px)', leading: '1.30', tracking: '-0.01em', weight: 'Bold / 700', voice: 'Grotesca Pesada', sample: 'Arquitetura Editorial e Gráfica' },
    { name: 'Heading SM', size: '1.25rem (20px)', leading: '1.35', tracking: '0em', weight: 'Bold / 700', voice: 'Sans Funcional', sample: 'Componentes e Microinterações' },
    { name: 'Body LG', size: '1.125rem (18px)', leading: '1.60', tracking: '0em', weight: 'Regular / 400', voice: 'Sans Funcional', sample: 'Marca não é só o que ela diz. É o que ela faz você fazer.' },
    { name: 'Body MD', size: '1.0rem (16px)', leading: '1.60', tracking: '0em', weight: 'Regular / 400', voice: 'Sans Funcional', sample: 'Texto confortável para interfaces, formulários, tabelas e parágrafos contínuos.' },
    { name: 'Body SM', size: '0.875rem (14px)', leading: '1.50', tracking: '0.01em', weight: 'Regular / 400', voice: 'Sans Funcional', sample: 'Legendas, metadados de suporte e descrições técnicas.' },
    { name: 'Label SM', size: '0.75rem (12px)', leading: '1.40', tracking: '0.08em', weight: 'Bold / 700 (Caixa Alta)', voice: 'Sans Funcional', sample: 'SINALIZAÇÃO • STATUS • TAGS' },
    { name: 'Handwriting LG', size: '1.75rem (28px)', leading: '1.20', tracking: '0em', weight: 'Handwritten / 700', voice: 'Manuscrita (Intervenção)', sample: '“Elegância + pequena confissão patética.”' },
    { name: 'Handwriting MD', size: '1.25rem (20px)', leading: '1.30', tracking: '0em', weight: 'Handwritten / 600', voice: 'Manuscrita (Intervenção)', sample: '← isso aqui foi desenhado à mão!' },
  ];

  // Sombras gráficas sólidas
  const shadowList = [
    { name: 'graphic-sm', css: '2px 2px 0px #101014', role: 'Badges, botões pequenos e checkboxes' },
    { name: 'graphic-md', css: '4px 4px 0px #101014', role: 'Botões padrão, inputs e cards' },
    { name: 'graphic-lg', css: '8px 8px 0px #101014', role: 'Superfícies de alto impacto e heros' },
    { name: 'graphic-caramel', css: '4px 4px 0px #FF701A', role: 'Destaque e assinatura sobre fundo escuro' },
    { name: 'graphic-sky', css: '4px 4px 0px #25BFFF', role: 'Acento interativo digital' },
    { name: 'graphic-cream', css: '4px 4px 0px #FFF4E8', role: 'Elevação para elementos pretos sobre fundo claro' },
    { name: 'offset-cmyk', css: '-2px -1px 0 rgba(37,191,255,0.5), 2px 1px 0 rgba(255,61,141,0.5)', role: 'Registro de impressão em aceleração' },
  ];

  const sections = [
    { id: 'all', label: 'Tudo' },
    { id: 'principles', label: '01. Princípios' },
    { id: 'colors', label: '02. Cores & WCAG' },
    { id: 'typography', label: '03. Tipografia' },
    { id: 'spacing', label: '04. Espaçamento' },
    { id: 'shadows', label: '05. Sombras' },
    { id: 'textures', label: '06. Texturas' },
    { id: 'motion', label: '07. Motion' },
    { id: 'brand', label: '08. Wordmark' },
    { id: 'buttons', label: '09. Botões' },
    { id: 'forms', label: '10. Formulários' },
    { id: 'cards', label: '11. Cards' },
    { id: 'feedback', label: '12. Alertas' },
    { id: 'dodont', label: '13. Do & Don’t' },
  ];

  const shouldShow = (id: string) => activeSection === 'all' || activeSection === id;

  return (
    <div className="min-h-screen bg-[#101014] text-[#FFF4E8] font-sans selection:bg-[#FF701A] selection:text-[#101014]">
      {/* Toast de Cópia */}
      {copiedToken && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#FF701A] text-[#101014] border-2 border-[#101014] px-4 py-2 font-display font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_#FFF4E8] animate-bounce">
          ✓ Copiado: {copiedToken}
        </div>
      )}

      {/* Header Sticky com Assinatura Oficial */}
      <header className="border-b-2 border-[#27272F] bg-[#141419]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar fallback="UC" size="sm" accentBorder="caramel" />
            <Lockup type="institucional" size="sm" variant="cream" />
          </div>

          <div className="flex items-center gap-2">
            <Badge color="caramel">V1 2026</Badge>
            <span className="text-xs font-mono text-neutral-400">@caramelo/design-system</span>
          </div>
        </div>

        {/* Barra de Filtro de Seções */}
        <div className="border-t border-[#27272F] bg-[#101014] overflow-x-auto">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-2 whitespace-nowrap">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeSection === s.id
                    ? 'bg-[#FF701A] text-[#101014] border-[#101014] shadow-[2px_2px_0px_#101014]'
                    : 'text-[#FFF4E8]/70 border-transparent hover:text-[#FFF4E8] hover:border-[#27272F]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero Principal da Especificação */}
      <section className="relative border-b-2 border-[#27272F] py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 caramelo-halftone-subtle opacity-35 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow color="caramel">DOCUMENTO CANÔNICO & GUIA VIVO</Eyebrow>
            <span className="text-xs text-neutral-500">•</span>
            <span className="text-xs text-neutral-400 font-mono">LABORATÓRIO DE INTERAÇÃO</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <DisplayHeading size="xl" className="leading-[0.90]">
                SISTEMA VISUAL & <br />
                <span className="text-[#FF701A]">DESIGN SYSTEM V1</span>
              </DisplayHeading>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Text size="lg" variant="muted">
                  A especificação completa de tokens, física de interação, superfícies táteis e componentes para todos os apps.
                </Text>
                <HandwrittenNote color="yellow" rotate="-1">
                  100% autoral, zero clichê corporativo
                </HandwrittenNote>
              </div>
            </div>

            {/* Caixa Central de Princípio */}
            <div className="p-5 bg-[#1F1F26] border-2 border-[#FF701A] shadow-[5px_5px_0px_#FF701A] max-w-md">
              <span className="text-[0.65rem] font-black uppercase tracking-widest text-[#FF701A] block mb-1">
                PRINCÍPIO CENTRAL DE PROJETO
              </span>
              <p className="font-display font-black text-base uppercase leading-tight text-[#FFF4E8]">
                STILLNESS = CAMADAS ALINHADAS <br />
                MOVEMENT = CAMADAS SE SEPARAM
              </p>
              <p className="text-xs text-neutral-400 mt-2 font-sans">
                "Nunca criar um efeito antes de saber qual comportamento ou percepção ele precisa provocar."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Central Exaustivo */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex flex-col gap-24">
        {/* ======================================================== */}
        {/* 01. PRINCÍPIOS & DNA VISUAL                              */}
        {/* ======================================================== */}
        {shouldShow('principles') && (
          <section id="principles" className="flex flex-col gap-8">
            <div className="flex items-baseline justify-between border-b-2 border-[#27272F] pb-4">
              <div>
                <Eyebrow color="caramel">01. DNA & Fundamentos</Eyebrow>
                <DisplayHeading as="h2" size="md">Os 6 Pilares da Linguagem Visual</DisplayHeading>
              </div>
              <HandwrittenNote color="sky" rotate="1">
                não parecer "bonitinho". parecer dirigido.
              </HandwrittenNote>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Cinematográfico', badge: 'Luz & Câmera', desc: 'Composição com intenção narrativa. Luz quente de golden hour contrastando com sombras frias e recortes incomuns.' },
                { title: 'Gráfico & Editorial', badge: 'Massa & Peso', desc: 'Tipografia pesada com presença de pôster, recortes diagonais, sombras sólidas e hierarquia visual sem timidez.' },
                { title: 'Tátil & Impresso', badge: 'Matéria Física', desc: 'Retículas Ben-Day / Halftone, granulação fina e microdesalinhamentos CMYK (misregistration) trazem a tela para o mundo real.' },
                { title: 'Física Cinética', badge: 'Microinteração', desc: 'Stillness = camadas alinhadas. Movement = camadas se separam. Cada clique tem resposta física e peso perceptível.' },
                { title: 'Belo Horizonte', badge: 'Matéria Urbana', desc: 'Concreto, viadutos, pilares, fiação aérea, horizonte da Serra do Curral. Brasilidade vivida e crua, sem folclore turístico.' },
                { title: 'Humano & Autoral', badge: '3 Vozes', desc: 'A voz institucional forte é sempre contrabalançada pela camada manuscrita de ironia, dúvida e anotação viva.' },
              ].map((p, i) => (
                <Card key={i} variant="dark" halftone interactive className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge color="caramel">{p.badge}</Badge>
                      <span className="text-xs font-mono text-neutral-500">0{i + 1}</span>
                    </div>
                    <h3 className="font-display font-black text-xl uppercase mb-2">{p.title}</h3>
                    <Text size="sm" variant="muted">{p.desc}</Text>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 02. CORES & CONTRASTE WCAG                               */}
        {/* ======================================================== */}
        {shouldShow('colors') && (
          <section id="colors" className="flex flex-col gap-8">
            <div className="flex items-baseline justify-between border-b-2 border-[#27272F] pb-4">
              <div>
                <Eyebrow color="caramel">02. Sistema Cromático</Eyebrow>
                <DisplayHeading as="h2" size="md">Paleta Oficial Canônica V1 (2026)</DisplayHeading>
              </div>
              <HandwrittenNote color="pink" rotate="-1">
                regra: apenas 1 acento dominante por cena!
              </HandwrittenNote>
            </div>

            <Text size="base" variant="muted" className="max-w-3xl">
              Base sóbria em Ink Black e Warm Cream. As cores elétricas funcionam como tintas gráficas de destaque e nunca devem poluir simultaneamente a mesma tela.
            </Text>

            {/* Grid de Cores com Cópia Rápida */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {palette.map((c) => (
                <div
                  key={c.hex}
                  onClick={() => copyToClipboard(c.hex, c.name)}
                  className="bg-[#18181D] border-2 border-[#27272F] p-5 cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:border-[#FFF4E8] flex flex-col justify-between group select-none shadow-[3px_3px_0px_#101014]"
                >
                  <div
                    className="w-full h-24 border-2 border-[#101014] flex items-center justify-center font-display font-black text-sm tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
                    style={{ backgroundColor: c.hex, color: c.textDark ? '#101014' : '#FFF4E8' }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">CLIQUE P/ COPIAR</span>
                  </div>

                  <div className="mt-4 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-base uppercase text-[#FFF4E8]">{c.name}</span>
                      <span className="text-xs font-mono font-bold text-[#FF701A]">{c.hex}</span>
                    </div>
                    <span className="text-xs text-neutral-400 font-sans leading-snug">{c.role}</span>
                    <div className="mt-2 pt-2 border-t border-[#27272F] flex items-center justify-between text-[0.65rem] font-bold">
                      <span className="text-neutral-500 font-mono">RGB: {c.rgb}</span>
                      <span className="text-[#25BFFF]">WCAG: {c.ratio}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabela de Contraste WCAG 2.1 */}
            <Card variant="dark" className="overflow-x-auto p-6">
              <h3 className="font-display font-black text-lg uppercase text-[#FF701A] mb-4">
                Matriz Canônica de Contraste e Acessibilidade (WCAG 2.1)
              </h3>
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b-2 border-[#27272F] text-neutral-400 uppercase tracking-wider">
                    <th className="py-2.5">Combinação</th>
                    <th className="py-2.5">Ratio</th>
                    <th className="py-2.5">Nível WCAG</th>
                    <th className="py-2.5">Uso Recomendado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272F]/50">
                  <tr>
                    <td className="py-3 font-bold text-[#FFF4E8]">Warm Cream (#FFF4E8) sobre Ink Black</td>
                    <td className="py-3 font-mono text-[#25BFFF]">17.50:1</td>
                    <td className="py-3"><Badge color="sky" size="sm">AAA</Badge></td>
                    <td className="py-3 text-neutral-300">Leitura principal de texto longo, interface e artigos.</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-[#FF701A]">Caramel Orange (#FF701A) sobre Ink Black</td>
                    <td className="py-3 font-mono text-[#FF701A]">6.86:1</td>
                    <td className="py-3"><Badge color="caramel" size="sm">AA</Badge></td>
                    <td className="py-3 text-neutral-300">Botões de ação principal (CTAs), marcações e destaques de seção.</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-[#25BFFF]">Electric Sky (#25BFFF) sobre Ink Black</td>
                    <td className="py-3 font-mono text-[#25BFFF]">9.02:1</td>
                    <td className="py-3"><Badge color="sky" size="sm">AAA</Badge></td>
                    <td className="py-3 text-neutral-300">Links interativos, anéis de foco de acessibilidade e sinalização.</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-[#FFD52A]">Acid Yellow (#FFD52A) sobre Ink Black</td>
                    <td className="py-3 font-mono text-[#FFD52A]">13.38:1</td>
                    <td className="py-3"><Badge color="yellow" size="sm">AAA</Badge></td>
                    <td className="py-3 text-neutral-300">Alertas de alta visibilidade e anotações manuscritas de humor.</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-[#101014] bg-[#FFF4E8] px-2 inline-block my-1">Ink Black sobre Warm Cream</td>
                    <td className="py-3 font-mono text-[#101014]">17.50:1</td>
                    <td className="py-3"><Badge color="ink" size="sm">AAA</Badge></td>
                    <td className="py-3 text-neutral-300">Leitura editorial diurna em páginas e documentos claros.</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </section>
        )}

        {/* ======================================================== */}
        {/* 03. TIPOGRAFIA EM TRÊS VOZES                             */}
        {/* ======================================================== */}
        {shouldShow('typography') && (
          <section id="typography" className="flex flex-col gap-8">
            <div className="flex items-baseline justify-between border-b-2 border-[#27272F] pb-4">
              <div>
                <Eyebrow color="sky">03. Tipografia & Hierarquia</Eyebrow>
                <DisplayHeading as="h2" size="md">O Sistema Tipográfico em 3 Vozes</DisplayHeading>
              </div>
              <HandwrittenNote color="yellow" rotate="-2">
                voz 1: impacto • voz 2: função • voz 3: humanidade
              </HandwrittenNote>
            </div>

            {/* As 3 Vozes em Destaque */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="dark" className="border-t-4 border-t-[#FF701A]">
                <Badge color="caramel" className="mb-3">Voz 1 — Grotesca Pesada</Badge>
                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-[#FFF4E8] mb-2">
                  PRESENÇA DE CARTAZ
                </h3>
                <Text size="sm" variant="muted">
                  Pesos Heavy e Black, entrelinha compacta (leading 0.90-1.05). Usada em Wordmarks, títulos de cena, números dramáticos e CTAs principais.
                </Text>
                <div className="mt-4 p-3 bg-[#141419] border border-[#27272F] text-xs font-mono text-[#FF701A]">
                  font-display font-black uppercase
                </div>
              </Card>

              <Card variant="dark" className="border-t-4 border-t-[#25BFFF]">
                <Badge color="sky" className="mb-3">Voz 2 — Sans Funcional</Badge>
                <h3 className="font-sans font-bold text-2xl tracking-normal text-[#FFF4E8] mb-2">
                  Legibilidade Confortável
                </h3>
                <Text size="sm" variant="muted">
                  Família Inter limpa e neutra. Pesos Regular e Bold para textos corridos, navegação, metadados, tabelas e inputs.
                </Text>
                <div className="mt-4 p-3 bg-[#141419] border border-[#27272F] text-xs font-mono text-[#25BFFF]">
                  font-sans font-normal text-base
                </div>
              </Card>

              <Card variant="dark" className="border-t-4 border-t-[#FF3D8D]">
                <Badge color="pink" className="mb-3">Voz 3 — Manuscrita</Badge>
                <div className="my-2">
                  <HandwrittenNote color="yellow" rotate="-2" className="text-2xl">
                    “Elegância + pequena confissão patética.”
                  </HandwrittenNote>
                </div>
                <Text size="sm" variant="muted">
                  Gesto humano espontâneo (Caveat / Kalam). Usado para comentários irônicos, dúvidas, setas e correções. NUNCA em botões ou parágrafos longos!
                </Text>
                <div className="mt-4 p-3 bg-[#141419] border border-[#27272F] text-xs font-mono text-[#FFD52A]">
                  font-handwriting font-bold -rotate-2
                </div>
              </Card>
            </div>

            {/* Escala Completa de Tamanhos */}
            <Card variant="dark" className="p-6">
              <h3 className="font-display font-black text-lg uppercase text-[#25BFFF] mb-6">
                Escala Tipográfica Oficial (Display-2XL ao Label-XS)
              </h3>
              <div className="flex flex-col divide-y divide-[#27272F]">
                {typographyScale.map((t, i) => (
                  <div key={i} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="w-64 flex-shrink-0">
                      <div className="font-display font-black text-sm uppercase text-[#FF701A]">{t.name}</div>
                      <div className="text-xs text-neutral-400 font-mono mt-0.5">{t.size} • {t.weight}</div>
                      <div className="text-[0.65rem] text-neutral-500 font-sans">{t.voice}</div>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                      <div
                        className={
                          t.name.includes('Handwriting')
                            ? 'font-handwriting text-[#FFD52A]'
                            : t.name.includes('Display') || t.name.includes('Heading')
                            ? 'font-display font-black uppercase text-[#FFF4E8]'
                            : 'font-sans text-neutral-200'
                        }
                        style={{ fontSize: `clamp(1rem, ${t.size.split(' ')[0]}, 3rem)` }}
                      >
                        {t.sample}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}

        {/* ======================================================== */}
        {/* 04. ESCALA DE ESPAÇAMENTO EDITORIAL                      */}
        {/* ======================================================== */}
        {shouldShow('spacing') && (
          <section id="spacing" className="flex flex-col gap-8">
            <div className="flex items-baseline justify-between border-b-2 border-[#27272F] pb-4">
              <div>
                <Eyebrow color="pink">04. Espaçamento & Ritmo</Eyebrow>
                <DisplayHeading as="h2" size="md">Régua Editorial de Espaçamento</DisplayHeading>
              </div>
              <HandwrittenNote color="caramel" rotate="1">
                proporção matemática com respiração humana
              </HandwrittenNote>
            </div>

            <Text size="base" variant="muted" className="max-w-3xl">
              O design Caramelo utiliza uma escala baseada em múltiplos de 4px e 8px, garantindo que o respiro entre os elementos seja rítmico e cinematográfico.
            </Text>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spacingScale.map((s) => (
                <div
                  key={s.token}
                  onClick={() => copyToClipboard(`p-${s.token} / gap-${s.token}`, s.token)}
                  className="p-4 bg-[#18181D] border-2 border-[#27272F] flex items-center justify-between gap-4 cursor-pointer hover:border-[#FF701A] transition-all select-none"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 font-mono font-black text-sm text-[#FF701A]">p-{s.token}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#FFF4E8]">{s.px} ({s.rem})</span>
                      <span className="text-[0.65rem] text-neutral-400">{s.use}</span>
                    </div>
                  </div>

                  {/* Barra Visual */}
                  <div
                    className="h-6 bg-[#FF701A] border border-[#101014] flex-shrink-0"
                    style={{ width: s.px === '4px' ? '8px' : s.px }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 05. SOMBRAS & ELEVAÇÕES GRÁFICAS                         */}
        {/* ======================================================== */}
        {shouldShow('shadows') && (
          <section id="shadows" className="flex flex-col gap-8">
            <div className="flex items-baseline justify-between border-b-2 border-[#27272F] pb-4">
              <div>
                <Eyebrow color="yellow">05. Elevações & Sombras</Eyebrow>
                <DisplayHeading as="h2" size="md">Sombras Gráficas Hard-Edge</DisplayHeading>
              </div>
              <HandwrittenNote color="pink" rotate="-2">
                proibido usar sombras borradas corporativas!
              </HandwrittenNote>
            </div>

            <Text size="base" variant="muted" className="max-w-3xl">
              No Caramelo, as sombras são blocos sólidos de cor com deslocamento geométrico de 2px a 8px. Isso cria a estética de pôster impresso e elimina a esterilidade digital de softwares corporativos.
            </Text>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {shadowList.map((sh) => (
                <div
                  key={sh.name}
                  onClick={() => copyToClipboard(sh.css, sh.name)}
                  className="p-5 bg-[#18181D] border-2 border-[#27272F] flex flex-col justify-between h-48 cursor-pointer hover:border-[#FFF4E8] transition-all select-none"
                >
                  <div
                    className="w-full h-16 bg-[#FFF4E8] border-2 border-[#101014] flex items-center justify-center text-[#101014] font-display font-black text-xs uppercase"
                    style={{ boxShadow: sh.css }}
                  >
                    {sh.name}
                  </div>

                  <div className="mt-3">
                    <span className="font-display font-bold text-xs uppercase text-[#FF701A] block">{sh.name}</span>
                    <span className="text-[0.65rem] text-neutral-400 block mt-0.5">{sh.role}</span>
                    <span className="text-[0.60rem] font-mono text-neutral-500 block mt-1">{sh.css}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 06. TEXTURAS TÁTEIS & HALFTONE                           */}
        {/* ======================================================== */}
        {shouldShow('textures') && (
          <section id="textures" className="flex flex-col gap-8">
            <div className="flex items-baseline justify-between border-b-2 border-[#27272F] pb-4">
              <div>
                <Eyebrow color="caramel">06. Textura & Matéria</Eyebrow>
                <DisplayHeading as="h2" size="md">Linguagem Tátil: Halftone, Grain & Misregistration</DisplayHeading>
              </div>
              <HandwrittenNote color="sky" rotate="1">
                imperfeição controlada &gt; perfeição estéril
              </HandwrittenNote>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Halftone Ben-Day */}
              <HalftoneOverlay density="normal">
                <Card variant="dark" className="flex flex-col justify-between h-full">
                  <div>
                    <Badge color="caramel" className="mb-3">Halftone / Ben-Day</Badge>
                    <h3 className="font-display font-black text-xl uppercase mb-2">Retícula Pontilhada</h3>
                    <Text size="sm" variant="muted">
                      Simula as retículas de impressão de quadrinhos clássicos e cartazes urbanos em sombras e fundos escuros.
                    </Text>
                  </div>
                  <div className="mt-4 p-3 bg-[#101014] border border-[#27272F] text-xs font-mono text-[#FF701A]">
                    &lt;HalftoneOverlay density="normal"&gt;
                  </div>
                </Card>
              </HalftoneOverlay>

              {/* Misregistration CMYK */}
              <Card variant="dark" className="flex flex-col justify-between">
                <div>
                  <Badge color="pink" className="mb-3">Misregistration CMYK</Badge>
                  <h3 className="font-display font-black text-xl uppercase mb-2">Registro de Impressão</h3>
                  <Text size="sm" variant="muted" className="mb-4">
                    Microdesalinhamento cromático pontual nas bordas em momentos de movimento ou hover interativo.
                  </Text>
                  <div className="py-2">
                    <MisregistrationText className="font-display font-black text-xl uppercase text-[#FFF4E8]">
                      DESALINHAMENTO ÓPTICO
                    </MisregistrationText>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-[#101014] border border-[#27272F] text-xs font-mono text-[#FF3D8D]">
                  .caramelo-misregistration
                </div>
              </Card>

              {/* Print Grain */}
              <Card variant="dark" className="caramelo-grain flex flex-col justify-between">
                <div>
                  <Badge color="sky" className="mb-3">Print Grain</Badge>
                  <h3 className="font-display font-black text-xl uppercase mb-2">Película e Papel</h3>
                  <Text size="sm" variant="muted">
                    Grão analógico ultrafino que confere aspereza e sensação física à superfície da tela digital.
                  </Text>
                </div>
                <div className="mt-4 p-3 bg-[#101014] border border-[#27272F] text-xs font-mono text-[#25BFFF]">
                  .caramelo-grain
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 07. MOTION & FÍSICA CINÉTICA                             */}
        {/* ======================================================== */}
        {shouldShow('motion') && (
          <section id="motion" className="flex flex-col gap-8">
            <div className="flex items-baseline justify-between border-b-2 border-[#27272F] pb-4">
              <div>
                <Eyebrow color="sky">07. Física de Movimento</Eyebrow>
                <DisplayHeading as="h2" size="md">Stillness vs Movement: Separação de Camadas</DisplayHeading>
              </div>
              <HandwrittenNote color="yellow" rotate="-1">
                movimento é resposta e linguagem, não enfeite
              </HandwrittenNote>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Demonstração Interativa do LayerSplit */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Teste o Hover e o Clique no Contêiner Abaixo:
                </span>
                <LayerSplit accentColor="caramel">
                  <div className="flex items-center justify-between mb-3">
                    <Badge color="caramel">Física Canônica</Badge>
                    <HandwrittenNote color="yellow" rotate="-2">passe o mouse!</HandwrittenNote>
                  </div>
                  <h3 className="font-display font-black text-2xl uppercase mb-2">
                    STILLNESS → MOVEMENT
                  </h3>
                  <p className="font-sans text-sm text-neutral-300 leading-relaxed">
                    No repouso, a camada superior está perfeitamente alinhada à sua sombra.
                    Ao passar o mouse (aceleração), as camadas se separam em paralaxe.
                  </p>
                </LayerSplit>
              </div>

              {/* Especificação das Curvas de Movimento */}
              <Card variant="dark" className="p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-black text-lg uppercase text-[#FF701A] mb-4">
                    Curvas de Easing Oficiais
                  </h3>
                  <div className="flex flex-col gap-3 text-xs font-mono">
                    <div className="p-3 bg-[#141419] border border-[#27272F]">
                      <span className="text-[#25BFFF] font-bold">kinetic:</span> cubic-bezier(0.2, 0.8, 0.2, 1)
                      <span className="block text-[0.65rem] text-neutral-400 mt-0.5">Resposta imediata e tátil em botões.</span>
                    </div>
                    <div className="p-3 bg-[#141419] border border-[#27272F]">
                      <span className="text-[#FF701A] font-bold">snap:</span> cubic-bezier(0.16, 1, 0.3, 1)
                      <span className="block text-[0.65rem] text-neutral-400 mt-0.5">Física mecânica em toggles e abas.</span>
                    </div>
                    <div className="p-3 bg-[#141419] border border-[#27272F]">
                      <span className="text-[#FF3D8D] font-bold">layerSeparation:</span> cubic-bezier(0.34, 1.56, 0.64, 1)
                      <span className="block text-[0.65rem] text-neutral-400 mt-0.5">Separação elástica de camadas no LayerSplit.</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 08. WORDMARKS & ASSINATURAS                              */}
        {/* ======================================================== */}
        {shouldShow('brand') && (
          <section id="brand" className="flex flex-col gap-8">
            <div className="flex items-baseline justify-between border-b-2 border-[#27272F] pb-4">
              <div>
                <Eyebrow color="caramel">08. Marca & Assinaturas</Eyebrow>
                <DisplayHeading as="h2" size="md">Wordmarks e Hierarquia de Lockups</DisplayHeading>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="dark" className="p-6 flex flex-col justify-between">
                <span className="text-xs font-bold uppercase text-neutral-400 mb-4">Wordmark Warm Cream (Fundo Escuro)</span>
                <Wordmark size="lg" variant="cream" />
                <span className="text-[0.65rem] text-neutral-500 mt-4">Alinhamento óptico em 2 linhas</span>
              </Card>

              <Card variant="dark" className="p-6 flex flex-col justify-between">
                <span className="text-xs font-bold uppercase text-neutral-400 mb-4">Wordmark Caramel Orange (Assinatura)</span>
                <Wordmark size="lg" variant="caramel" />
                <span className="text-[0.65rem] text-neutral-500 mt-4">Assinatura de alto impacto</span>
              </Card>

              <Card variant="light" className="p-6 flex flex-col justify-between">
                <span className="text-xs font-bold uppercase text-neutral-600 mb-4">Wordmark Ink Black (Fundo Claro)</span>
                <Wordmark size="lg" variant="ink" />
                <span className="text-[0.65rem] text-neutral-600 mt-4">Editorial em superfícies Warm Cream</span>
              </Card>
            </div>

            {/* Hierarquia de Lockups */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 bg-[#18181D] border-2 border-[#27272F]">
                <Badge color="caramel" size="sm" className="mb-3">1. Institucional</Badge>
                <Lockup type="institucional" size="sm" variant="cream" />
              </div>
              <div className="p-5 bg-[#18181D] border-2 border-[#27272F]">
                <Badge color="sky" size="sm" className="mb-3">2. Explicativo</Badge>
                <Lockup type="explicativo" size="sm" variant="cream" />
              </div>
              <div className="p-5 bg-[#18181D] border-2 border-[#27272F]">
                <Badge color="pink" size="sm" className="mb-3">3. Autoral</Badge>
                <Lockup type="autoral" size="sm" variant="cream" />
              </div>
              <div className="p-5 bg-[#18181D] border-2 border-[#27272F]">
                <Badge color="yellow" size="sm" className="mb-3">4. Bio Social</Badge>
                <Lockup type="bio" size="sm" variant="cream" />
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 09. BOTÕES & AÇÕES                                       */}
        {/* ======================================================== */}
        {shouldShow('buttons') && (
          <section id="buttons" className="flex flex-col gap-8">
            <div className="flex items-baseline justify-between border-b-2 border-[#27272F] pb-4">
              <div>
                <Eyebrow color="caramel">09. Botões & Ações</Eyebrow>
                <DisplayHeading as="h2" size="md">Botões Cinéticos & Estados Interativos</DisplayHeading>
              </div>
              <HandwrittenNote color="sky" rotate="1">
                resposta tátil com transição cinética
              </HandwrittenNote>
            </div>

            {/* Variantes Principais */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-[#18181D] border border-[#27272F] flex flex-col gap-2">
                <span className="text-xs text-neutral-400 font-bold uppercase">Primary (Caramel)</span>
                <Button variant="primary">Ação Principal</Button>
              </div>

              <div className="p-4 bg-[#18181D] border border-[#27272F] flex flex-col gap-2">
                <span className="text-xs text-neutral-400 font-bold uppercase">Ink (Dark)</span>
                <Button variant="ink">Assinar Conteúdo</Button>
              </div>

              <div className="p-4 bg-[#18181D] border border-[#27272F] flex flex-col gap-2">
                <span className="text-xs text-neutral-400 font-bold uppercase">Cream (Light)</span>
                <Button variant="cream">Ver Projetos</Button>
              </div>

              <div className="p-4 bg-[#18181D] border border-[#27272F] flex flex-col gap-2">
                <span className="text-xs text-neutral-400 font-bold uppercase">Electric Sky</span>
                <Button variant="sky">Copiar Código</Button>
              </div>

              <div className="p-4 bg-[#18181D] border border-[#27272F] flex flex-col gap-2">
                <span className="text-xs text-neutral-400 font-bold uppercase">Ghost</span>
                <Button variant="ghost">Voltar</Button>
              </div>
            </div>

            {/* Tamanhos e Estados */}
            <Card variant="dark" className="p-6 flex flex-col gap-6">
              <h3 className="font-display font-black text-base uppercase text-[#FF701A]">
                Tamanhos, Ícones e Estados Desabilitados
              </h3>

              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="sm">Botão Pequeno (sm)</Button>
                <Button variant="primary" size="md">Botão Médio (md)</Button>
                <Button variant="primary" size="lg">Botão Grande (lg)</Button>
                <Button variant="primary" disabled>Desabilitado</Button>
              </div>
            </Card>
          </section>
        )}

        {/* ======================================================== */}
        {/* 10. FORMULÁRIOS & CONTROLES                              */}
        {/* ======================================================== */}
        {shouldShow('forms') && (
          <section id="forms" className="flex flex-col gap-8">
            <div className="flex items-baseline justify-between border-b-2 border-[#27272F] pb-4">
              <div>
                <Eyebrow color="sky">10. Formulários & Controles</Eyebrow>
                <DisplayHeading as="h2" size="md">Inputs, Textareas, Selects e Switches</DisplayHeading>
              </div>
              <HandwrittenNote color="pink" rotate="-1">
                labels reais e foco visível em Electric Sky
              </HandwrittenNote>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input
                label="Nome Completo"
                placeholder="Luiz, Head de Interação"
                hint="Rótulo real e acessível"
              />

              <Input
                label="Email Corporativo"
                defaultValue="luiz@umcaracaramelo.com.br"
                hint="Foco em Electric Sky (#25BFFF)"
              />

              <Input
                label="Chave Secreta"
                defaultValue="invalid_token"
                error="Chave não reconhecida pela infraestrutura."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Textarea
                label="Manifesto ou Descrição do Projeto"
                placeholder="Descreva a percepção ou comportamento que essa experiência deve provocar..."
                rows={4}
                hint="Entrelinha e respiro confortáveis"
              />

              <div className="flex flex-col gap-6">
                <Select
                  label="Território da Marca"
                  options={[
                    { value: 'social', label: 'Conteúdo Social & Carrosséis' },
                    { value: 'web', label: 'Web & Experiências Digitais' },
                    { value: 'video', label: 'Vídeo Cinematográfico & Direção' },
                    { value: 'lab', label: 'Laboratório de Interação' },
                  ]}
                  hint="Seta customizada com hard-border"
                />

                {/* Toggles e Checkboxes */}
                <div className="p-4 bg-[#18181D] border-2 border-[#27272F] flex flex-col gap-4">
                  <Toggle
                    checked={toggleActive}
                    onChange={setToggleActive}
                    accentColor="caramel"
                    label="Ativar Separação de Camadas (Movement)"
                    description="Permite que a interface responda ao gesto do usuário"
                  />

                  <Toggle
                    checked={toggleSky}
                    onChange={setToggleSky}
                    accentColor="sky"
                    label="Modo de Alta Precisão (Electric Sky)"
                    description="Acentos de sinalização e profundidade fria"
                  />

                  <Divider variant="dashed" />

                  <Checkbox
                    checked={checkboxChecked}
                    onChange={(e) => setCheckboxChecked(e.target.checked)}
                    accentColor="caramel"
                    label="Concordo com a regra de 1 acento dominante por cena"
                    description="Princípio de disciplina cromática do Manual V1 2026"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 11. CARDS & SUPERFÍCIES                                  */}
        {/* ======================================================== */}
        {shouldShow('cards') && (
          <section id="cards" className="flex flex-col gap-8">
            <div className="flex items-baseline justify-between border-b-2 border-[#27272F] pb-4">
              <div>
                <Eyebrow color="pink">11. Superfícies & Painéis</Eyebrow>
                <DisplayHeading as="h2" size="md">Cards Editoriais e Assimétricos</DisplayHeading>
              </div>
              <HandwrittenNote color="yellow" rotate="-2">
                evitar grids corporativos repetitivos
              </HandwrittenNote>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="dark" halftone interactive>
                <div className="flex items-center justify-between mb-3">
                  <Badge color="caramel">Superfície Escura</Badge>
                  <span className="text-xs font-mono text-neutral-500">Ink Surface</span>
                </div>
                <h4 className="font-display font-black text-xl uppercase mb-2">Painel Cinematográfico</h4>
                <p className="text-sm text-neutral-300">
                  Fundo #1F1F26 com retícula halftone suave e sombra sólida preta de 4px.
                </p>
              </Card>

              <Card variant="light" interactive>
                <div className="flex items-center justify-between mb-3">
                  <Badge color="ink">Superfície Clara</Badge>
                  <span className="text-xs font-mono text-neutral-600">Warm Cream</span>
                </div>
                <h4 className="font-display font-black text-xl uppercase mb-2 text-[#101014]">Respiro Editorial</h4>
                <p className="text-sm text-[#101014]/80">
                  Fundo #FFF4E8 com borda dura de 2px e tipografia em Ink Black.
                </p>
              </Card>

              <Card variant="accent" interactive>
                <div className="flex items-center justify-between mb-3">
                  <Badge color="yellow">Acento de Destaque</Badge>
                  <span className="text-xs font-mono text-[#FF701A]">Caramel Edge</span>
                </div>
                <h4 className="font-display font-black text-xl uppercase mb-2">Momento Crítico</h4>
                <p className="text-sm text-neutral-300">
                  Borda e sombra em Caramel Orange (#FF701A) para sinalizar conversão ou encerramento.
                </p>
              </Card>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 12. FEEDBACK & ALERTAS                                   */}
        {/* ======================================================== */}
        {shouldShow('feedback') && (
          <section id="feedback" className="flex flex-col gap-8">
            <div className="flex items-baseline justify-between border-b-2 border-[#27272F] pb-4">
              <div>
                <Eyebrow color="yellow">12. Banners & Feedback</Eyebrow>
                <DisplayHeading as="h2" size="md">Alertas e Confissões de Marca</DisplayHeading>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Alert variant="caramel" badge="Assinatura" title="Experiência em Produção">
                Este sistema foi concebido para o ecossistema Um Cara Caramelo. Toda peça gerada deve carregar intenção e contraste.
              </Alert>

              <Alert variant="sky" badge="Digital" title="Conexão Estabelecida via MCP">
                O servidor de Model Context Protocol está operando localmente na porta de transporte stdio.
              </Alert>

              <Alert variant="confession" badge="Voz 3" title="Confissão Patética">
                Nós passamos três dias discutindo se a sombra deveria ter 3px ou 4px de deslocamento. O resultado é que ela tem 4px e você sente a diferença no polegar.
              </Alert>

              <Alert variant="pink" badge="Provocação" title="Teste da Mediocridade">
                Se a interface que você está construindo parece com a de um banco digital genérico, pare imediatamente e adicione textura.
              </Alert>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 13. DO'S & DON'TS (GUIA COMPARATIVO)                     */}
        {/* ======================================================== */}
        {shouldShow('dodont') && (
          <section id="dodont" className="flex flex-col gap-8">
            <div className="flex items-baseline justify-between border-b-2 border-[#27272F] pb-4">
              <div>
                <Eyebrow color="caramel">13. Critérios Canônicos</Eyebrow>
                <DisplayHeading as="h2" size="md">O que Fazer vs O que NUNCA Fazer</DisplayHeading>
              </div>
              <HandwrittenNote color="pink" rotate="-1">
                auditoria estética do Laboratório
              </HandwrittenNote>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card DO */}
              <div className="p-6 bg-[#18181D] border-2 border-[#25BFFF] shadow-[4px_4px_0px_#25BFFF] flex flex-col gap-3">
                <Badge color="sky">DO (Correto)</Badge>
                <h4 className="font-display font-black text-lg uppercase text-[#FFF4E8]">Práticas Canônicas</h4>
                <ul className="text-xs text-neutral-300 font-sans space-y-2 list-disc list-inside">
                  <li>Usar apenas <strong>1 cor de destaque elétrico dominante por cena</strong>.</li>
                  <li>Usar sombras gráficas sólidas (hard-edge) com deslocamento visível.</li>
                  <li>Limitar a fonte manuscrita a observações curtas, provocações e setas.</li>
                  <li>Garantir resposta tátil no clique de botões (active translate).</li>
                  <li>Permitir que os títulos cortem a borda quando houver intenção de cartaz.</li>
                  <li>Preservar áreas de respiro visual generosas entre momentos intensos.</li>
                </ul>
              </div>

              {/* Card DON'T */}
              <div className="p-6 bg-[#18181D] border-2 border-[#FF3D8D] shadow-[4px_4px_0px_#FF3D8D] flex flex-col gap-3">
                <Badge color="pink">DON'T (Proibido)</Badge>
                <h4 className="font-display font-black text-lg uppercase text-[#FFF4E8]">Erros Clichês</h4>
                <ul className="text-xs text-neutral-300 font-sans space-y-2 list-disc list-inside">
                  <li><strong>NUNCA</strong> usar sombras borradas corporativas (soft drop-shadows).</li>
                  <li><strong>NUNCA</strong> misturar múltiplas cores elétricas na mesma tela sem motivo.</li>
                  <li><strong>NUNCA</strong> aplicar fonte manuscrita em botões, preços ou parágrafos longos.</li>
                  <li><strong>NUNCA</strong> criar efeitos de movimento sem saber qual resposta eles provocam.</li>
                  <li><strong>NUNCA</strong> transformar o alter ego Caramelo em um mascote corporativo solto.</li>
                  <li><strong>NUNCA</strong> depender de gradientes neon genéricos estilo cyberpunk.</li>
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Rodapé Canônico */}
      <footer className="border-t-2 border-[#27272F] py-12 px-6 bg-[#141419] mt-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Lockup type="autoral" size="md" variant="cream" />
          
          <div className="flex flex-col items-center md:items-end gap-1 text-center md:text-right">
            <Text size="sm" variant="muted">
              Um Cara Caramelo — Laboratório de Interação • Belo Horizonte • 2026
            </Text>
            <span className="text-xs font-mono text-neutral-500">
              Sistema Visual V1.0 • Built with Vite, React 19, TypeScript & Tailwind CSS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
