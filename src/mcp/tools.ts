/**
 * Lógica das Ferramentas MCP — Um Cara Caramelo (Laboratório de Interação)
 * Motor de Auditoria, Transformação e Otimização de UX/UI
 */

import { colors, contrastRatios } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { shadows } from '../tokens/shadows';
import { motion } from '../tokens/motion';

/**
 * 1. Calcular Luminância Relativa e Contraste WCAG
 */
function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function calculateContrast(fgHex: string, bgHex: string) {
  try {
    const l1 = getLuminance(fgHex);
    const l2 = getLuminance(bgHex);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    const ratio = Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));

    const passesAA = ratio >= 4.5;
    const passesAALarge = ratio >= 3.0;
    const passesAAA = ratio >= 7.0;

    let recommendation = 'Contraste adequado conforme os padrões canônicos.';
    if (!passesAA) {
      recommendation = `ALERTA WCAG: O ratio ${ratio}:1 não atinge o mínimo de 4.5:1. Recomendação Caramelo: Use Warm Cream (#FFF4E8) sobre Ink Black (#101014) com ratio 17.5:1 ou Electric Sky (#25BFFF) com ratio 9.02:1.`;
    }

    return {
      ratio: `${ratio}:1`,
      passesAA,
      passesAALarge,
      passesAAA,
      recommendation,
    };
  } catch {
    return {
      ratio: 'Erro no cálculo',
      passesAA: false,
      passesAALarge: false,
      passesAAA: false,
      recommendation: 'Formato de cor HEX inválido. Use formato #RRGGBB.',
    };
  }
}

/**
 * 2. Auditoria de UX & UI
 */
export function auditUxUi(code: string, targetContext: string = 'web-app') {
  const findings: Array<{
    severity: 'critical' | 'warning' | 'suggestion';
    category: string;
    issue: string;
    fix: string;
  }> = [];

  let score = 100;

  // Checagem de clichês de UI corporativa
  if (/shadow-(md|lg|xl|2xl|inner)/i.test(code) && !/shadow-\[.*\]/i.test(code)) {
    score -= 10;
    findings.push({
      severity: 'warning',
      category: 'Linguagem Tátil & Sombras',
      issue: 'Uso de sombras borradas genéricas (soft blur) típicas de UI corporativa estéril.',
      fix: 'Substitua por sombras gráficas sólidas (hard-edge), como shadow-[3px_3px_0px_#101014] ou shadow-[4px_4px_0px_#FF701A].',
    });
  }

  // Checagem de disciplina cromática (Mais de 2 cores elétricas na mesma cena)
  const colorMatches = [
    code.includes('sky') || code.includes('25BFFF'),
    code.includes('pink') || code.includes('FF3D8D'),
    code.includes('violet') || code.includes('7657FF'),
    code.includes('yellow') || code.includes('FFD52A'),
  ].filter(Boolean).length;

  if (colorMatches > 1) {
    score -= 15;
    findings.push({
      severity: 'warning',
      category: 'Regra Cromática Canônica',
      issue: 'Múltiplos acentos elétricos competindo na mesma interface.',
      fix: 'Regra de ouro Caramelo: Escolha apenas 1 cor de destaque dominante por cena (ex: Caramel Orange #FF701A para CTAs ou Electric Sky #25BFFF para digital).',
    });
  }

  // Checagem de microinteração e física de botões
  if (/<button|<a|cursor-pointer/i.test(code)) {
    const hasActiveFeedback = /active:translate|active:scale|active:shadow/i.test(code);
    if (!hasActiveFeedback) {
      score -= 15;
      findings.push({
        severity: 'critical',
        category: 'Microinteração & Princípio do Movimento',
        issue: 'Botões ou links interativos sem resposta cinética no clique (active state).',
        fix: 'Aplique a física tátil Caramelo: hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[1px] active:translate-y-[1px] com transição cúbica kinetic: cubic-bezier(0.2, 0.8, 0.2, 1).',
      });
    }
  }

  // Checagem de voz tipográfica
  if (!/font-black|font-extrabold|uppercase/i.test(code) && /<h1|<h2|<h3/i.test(code)) {
    score -= 10;
    findings.push({
      severity: 'suggestion',
      category: 'Tipografia em Três Vozes',
      issue: 'Títulos sem presença de pôster/cartaz editorial.',
      fix: 'Utilize a Voz 1 (Grotesca Pesada): font-display font-black tracking-tight com entrelinha compacta (leading-[0.92]).',
    });
  }

  // Checagem de textura e materialidade
  if (!/halftone|grain|border-2/i.test(code)) {
    score -= 10;
    findings.push({
      severity: 'suggestion',
      category: 'Materialidade & Textura',
      issue: 'A interface parece plana e digitalmente estéril, sem sensação de papel, tinta ou retícula.',
      fix: 'Adicione texturas táteis sutis: bordas sólidas de 2px, retícula halftone pontilhada em segundo plano ou detalhes de impressão CMYK no hover.',
    });
  }

  // Checagem de formulários e acessibilidade
  if (/<input|<textarea|<select/i.test(code)) {
    if (!/label|aria-label|htmlFor/i.test(code)) {
      score -= 20;
      findings.push({
        severity: 'critical',
        category: 'Acessibilidade & Clareza',
        issue: 'Campos de formulário sem labels explícitos ou identificação para leitores de tela.',
        fix: 'Adicione labels reais e visíveis com tracking expandido (text-xs font-bold uppercase tracking-wider) e anel de foco em Electric Sky (#25BFFF).',
      });
    }
  }

  return {
    score: Math.max(0, score),
    verdict: score >= 85 ? 'EXCELENTE — Alinhado à estética Caramelo' : score >= 60 ? 'MÉDIO — Precisa de refinamento tátil e tipográfico' : 'CRÍTICO — Interface genérica corporativa',
    targetContext,
    totalFindings: findings.length,
    findings,
    canonicalChecklist: [
      '1. Há intenção clara antes do layout?',
      '2. Há um ponto focal dominante bem definido?',
      '3. Apenas 1 cor de destaque elétrico domina a cena?',
      '4. Tipografia respeita a hierarquia das 3 vozes?',
      '5. Botões possuem resposta física e cinética imediata?',
      '6. Texturas (halftone/grain) adicionam matéria sem poluir a leitura?',
      '7. Stillness = camadas alinhadas; Movement = camadas se separam?',
    ],
  };
}

/**
 * 3. Transformação de Componente Genérico para Caramelo
 */
export function transformToCaramelo(code: string, variant: 'dark' | 'light' | 'accent' = 'dark') {
  return `/* Componente Refatorado no Padrão Caramelo V1 2026 */
/* Princípio: STILLNESS = CAMADAS ALINHADAS • MOVEMENT = CAMADAS SE SEPARAM */

import { Button, Card, DisplayHeading, Text, HandwrittenNote, Eyebrow } from '@caramelo/design-system';

export function CarameloComponent() {
  return (
    <Card 
      variant="${variant}" 
      halftone={${variant === 'dark'}} 
      interactive
      className="p-6 transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <Eyebrow color="caramel">Direção de Arte Caramelo</Eyebrow>
        <HandwrittenNote color="yellow" rotate="-2">← tátil e cinematográfico</HandwrittenNote>
      </div>

      <DisplayHeading size="md" className="mb-2">
        ESTRUTURA ELEVADA COM INTENÇÃO
      </DisplayHeading>

      <Text size="base" variant="muted" className="mb-6">
        Adequado à paleta Ink Black (#101014) e Warm Cream (#FFF4E8), com bordas duras de 2px e resposta cinética.
      </Text>

      <div className="flex items-center gap-3">
        <Button variant="primary">Ação Principal</Button>
        <Button variant="${variant === 'dark' ? 'ink' : 'cream'}">Secundário</Button>
      </div>
    </Card>
  );
}`;
}

/**
 * 4. Gerador de Componentes Sob Medida
 */
export function generateComponent(
  componentType: string,
  title: string,
  framework: string = 'react-tailwind'
) {
  switch (componentType.toLowerCase()) {
    case 'button':
      return `import { Button } from '@caramelo/design-system';

export function ActionButton() {
  return (
    <Button 
      variant="primary" 
      size="md"
      className="uppercase font-display font-black shadow-[3px_3px_0px_#101014] hover:shadow-[5px_5px_0px_#101014]"
    >
      ${title || 'EXPLORAR LAB'}
    </Button>
  );
}`;

    case 'hero':
      return `import { DisplayHeading, Text, HandwrittenNote, Button, Lockup } from '@caramelo/design-system';

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] bg-[#101014] text-[#FFF4E8] flex flex-col justify-between p-8 md:p-16 border-b-2 border-[#27272F] overflow-hidden caramelo-halftone-subtle">
      <header>
        <Lockup type="institucional" size="md" variant="cream" />
      </header>

      <div className="max-w-4xl my-auto py-12">
        <div className="mb-4">
          <HandwrittenNote color="yellow" rotate="-1">
            “Elegância + pequena confissão patética.”
          </HandwrittenNote>
        </div>

        <DisplayHeading size="xl" className="leading-[0.92]">
          ${title || 'ESTRATÉGIA PRECISA SER SENTIDA.'}
        </DisplayHeading>

        <Text size="lg" variant="muted" className="mt-6 max-w-xl">
          Marca não é só o que ela diz. É o que ela faz você fazer.
        </Text>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button variant="primary" size="lg">Iniciar Experiência</Button>
          <Button variant="ink" size="lg">Ver Casos Canônicos</Button>
        </div>
      </div>

      <footer className="text-xs uppercase font-bold tracking-widest text-neutral-500 border-t border-[#27272F] pt-4">
        Belo Horizonte • Laboratório de Interação • 2026
      </footer>
    </section>
  );
}`;

    case 'layer_split':
      return `import { LayerSplit, Eyebrow } from '@caramelo/design-system';

export function MotionCard() {
  return (
    <LayerSplit accentColor="caramel" className="max-w-md">
      <Eyebrow color="caramel">Princípio de Movimento</Eyebrow>
      <h3 className="font-display font-black text-2xl uppercase mt-2 mb-1">
        ${title || 'STILLNESS → MOVEMENT'}
      </h3>
      <p className="text-sm text-neutral-300">
        Passe o cursor para observar as camadas se separando em paralaxe tátil.
      </p>
    </LayerSplit>
  );
}`;

    default:
      return `/* Componente Caramelo: ${componentType} */
import { Card, DisplayHeading, Button } from '@caramelo/design-system';

export function Custom${componentType.charAt(0).toUpperCase() + componentType.slice(1)}() {
  return (
    <Card variant="dark" halftone interactive className="p-6">
      <DisplayHeading size="md">${title}</DisplayHeading>
      <div className="mt-4">
        <Button variant="primary">Confirmar</Button>
      </div>
    </Card>
  );
}`;
  }
}
