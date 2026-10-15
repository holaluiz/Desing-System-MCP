import React from 'react';
import { createScrollScene } from '../../motion/scroll';
import { observeVideo } from '../../motion/video';
import { cn } from '../../utils/cn';
import { useMotionEnv, useScrollScene } from './hooks';

/* ———————————————————————————— StickyStack ———————————————————————————— */

export interface StickyStackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Cartões sticky que chegam — `sticky-stack` (ofertas do LP).
 * Cada filho gruda abaixo do cabeçalho; ao chegar ele vem de scale .97, 22px abaixo,
 * girado ±1° e opacidade .88. Posição medida no fluxo (sem sticky) só no refresh.
 * Foco dentro de um cartão completa a chegada na hora.
 */
export const StickyStack: React.FC<StickyStackProps> = ({ className, children, ...props }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const env = useMotionEnv();
  const stack = env.full && env.fine && env.stage;

  React.useEffect(() => {
    const root = ref.current;
    if (!root || !stack) return;
    const cards = Array.from(root.children) as HTMLElement[];
    const flowTop = (card: HTMLElement) => {
      const prev = card.style.position;
      card.style.position = 'static';
      const r = card.getBoundingClientRect();
      card.style.position = prev;
      return { top: r.top + window.scrollY, height: r.height };
    };
    const scenes = cards.map((card, i) =>
      createScrollScene(card, {
        start: 'top 88%',
        end: `top top+=${i % 2 ? 42 : 24}`,
        scrub: 0.32,
        measure: () => flowTop(card),
        onUpdate: (p) => card.style.setProperty('--cm-p', p.toFixed(4)),
      })
    );
    const onFocus = (e: FocusEvent) => {
      const card = cards.find((c) => c.contains(e.target as Node));
      card?.style.setProperty('--cm-p', '1');
    };
    root.addEventListener('focusin', onFocus);
    return () => {
      scenes.forEach((s) => s.destroy());
      root.removeEventListener('focusin', onFocus);
      cards.forEach((c) => c.style.removeProperty('--cm-p'));
    };
  }, [stack, React.Children.count(children)]);

  return (
    <div ref={ref} className={cn('cm-stack', className)} data-mode={stack ? 'stack' : 'flow'} {...props}>
      {React.Children.map(children, (child) => (
        <div className="cm-stack__card">{child}</div>
      ))}
    </div>
  );
};

/* ———————————————————————————— ScrubWords ———————————————————————————— */

export interface ScrubWordsProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'h2' | 'h3' | 'div' | 'blockquote';
  text: string;
  start?: string;
  end?: string;
}

/**
 * Palavras que acendem com o scroll — `scrub-words` (manifesto do workshop).
 * Cada palavra vai de opacidade .42 e 22px para 1 e 0, em sequência (stagger .07).
 * Leitores de tela recebem a frase inteira uma vez.
 */
export const ScrubWords: React.FC<ScrubWordsProps> = ({ as = 'p', text, start = 'top 75%', end = 'bottom 45%', className, ...props }) => {
  const ref = React.useRef<HTMLElement>(null);
  const env = useMotionEnv();
  const words = text.split(/\s+/).filter(Boolean);
  useScrollScene(ref, {
    enabled: env.full,
    start,
    end,
    scrub: 0.35,
    onUpdate: (p) => ref.current?.style.setProperty('--cm-p', p.toFixed(4)),
  });
  return React.createElement(
    as,
    {
      ref,
      className: cn('cm-scrub-words', className),
      'data-active': env.full ? '' : undefined,
      style: { '--cm-n': words.length } as React.CSSProperties,
      'aria-label': text,
      ...props,
    },
    words.map((w, i) => (
      <React.Fragment key={i}>
        <span className="cm-scrub-words__w" aria-hidden="true" style={{ '--cm-i': i } as React.CSSProperties}>
          {w}
        </span>{' '}
      </React.Fragment>
    ))
  );
};

/* ———————————————————————————— CompareSlider ———————————————————————————— */

export interface CompareSliderProps {
  before: React.ReactNode;
  after: React.ReactNode;
  /** Rótulo do controle (ex.: "Experiência imersiva") */
  label: string;
  /** Texto lido pelo leitor de tela; {value} é substituído */
  valueText?: string;
  /** O scroll conduz o comparador até o usuário tocar nele (workshop) */
  scrollDriven?: boolean;
  defaultValue?: number;
  className?: string;
}

/**
 * Comparador antes/depois — `compare-slider` (workshop do LP).
 * Range nativo e acessível (setas, Home/End). Com scrollDriven, a cena empurra o valor
 * de 0 a 100 enquanto atravessa a tela; quando a pessoa usa o controle, ele é dela.
 */
export const CompareSlider: React.FC<CompareSliderProps> = ({
  before,
  after,
  label,
  valueText = '{value}% da experiência',
  scrollDriven = false,
  defaultValue = 50,
  className,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const rangeRef = React.useRef<HTMLInputElement>(null);
  const manual = React.useRef(false);
  const [value, setValue] = React.useState(defaultValue);
  const env = useMotionEnv();

  React.useEffect(() => {
    const el = ref.current;
    if (!el || !scrollDriven || !env.full) return;
    const scene = createScrollScene(el, {
      start: 'top 70%',
      end: 'bottom 40%',
      scrub: 0.35,
      onUpdate: (p) => {
        if (manual.current || document.activeElement === rangeRef.current) return;
        setValue(Math.round(Math.min(1, Math.max(0, (p - 0.12) / 0.7)) * 100));
      },
      onToggle: (active) => {
        if (!active && document.activeElement !== rangeRef.current) manual.current = false;
      },
    });
    return () => scene.destroy();
  }, [scrollDriven, env.full]);

  return (
    <div ref={ref} className={cn('cm-compare', className)} style={{ '--split': `${100 - value}%` } as React.CSSProperties}>
      <div className="cm-compare__layer cm-compare__layer--after">{after}</div>
      <div className="cm-compare__layer cm-compare__layer--before" aria-hidden="true">
        {before}
      </div>
      <span className="cm-compare__handle" aria-hidden="true" />
      <input
        ref={rangeRef}
        className="cm-compare__range"
        type="range"
        min={0}
        max={100}
        value={value}
        aria-label={label}
        aria-valuetext={valueText.replace('{value}', String(value))}
        onChange={(e) => {
          manual.current = true;
          setValue(Number(e.target.value));
        }}
      />
    </div>
  );
};

/* ———————————————————————————— InViewVideo ———————————————————————————— */

export type InViewVideoProps = React.VideoHTMLAttributes<HTMLVideoElement>;

/**
 * Vídeo que só toca quando visível — `in-view-video` (portfólio do LP).
 * No máximo 2 decodificando, pausa com a aba oculta, sem autoplay com movimento reduzido.
 */
export const InViewVideo = React.forwardRef<HTMLVideoElement, InViewVideoProps>(function InViewVideo({ className, ...props }, forwarded) {
  const ref = React.useRef<HTMLVideoElement>(null);
  React.useImperativeHandle(forwarded, () => ref.current as HTMLVideoElement);
  React.useEffect(() => (ref.current ? observeVideo(ref.current) : undefined), []);
  return <video ref={ref} className={cn('h-full w-full object-cover', className)} muted playsInline loop preload="metadata" {...props} />;
});
