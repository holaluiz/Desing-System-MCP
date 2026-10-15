import React from 'react';
import { mix } from '../../motion/scroll';
import { cn } from '../../utils/cn';
import { useMotionEnv, useScrollScene } from './hooks';

export interface MotionFrame {
  x?: number;
  y?: number;
  /** Percentual da própria largura/altura */
  xPercent?: number;
  yPercent?: number;
  rotate?: number;
  scale?: number;
  opacity?: number;
}

export interface ParallaxProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'div' | 'span' | 'section' | 'figure' | 'header';
  from?: MotionFrame;
  to: MotionFrame;
  /** Padrão "top bottom" → "bottom top" (atravessa a viewport inteira) */
  start?: string;
  end?: string;
  /** Suavização em segundos (LP: 0.32–0.5) */
  scrub?: number;
  /** Só com tela grande e mouse (como a hero do LP). Padrão: true */
  desktopOnly?: boolean;
}

const pick = (f: MotionFrame | undefined, k: keyof MotionFrame, d: number) => f?.[k] ?? d;

/**
 * Profundidade dirigida pelo scroll — `scroll-depth` (LP).
 * Ex.: linhas da hero derivam y −30/−55px, x ∓12px e opacidade .72 ao sair (scrub .5).
 * Escreve transform direto no elemento (sem re-render) e respeita movimento reduzido.
 */
export const Parallax: React.FC<ParallaxProps> = ({
  as = 'div',
  from,
  to,
  start = 'top bottom',
  end = 'bottom top',
  scrub = 0.5,
  desktopOnly = true,
  className,
  style,
  children,
  ...props
}) => {
  const ref = React.useRef<HTMLElement>(null);
  const env = useMotionEnv();
  const enabled = env.full && (!desktopOnly || (env.fine && env.wide));

  useScrollScene(
    ref,
    {
      enabled,
      start,
      end,
      scrub,
      onUpdate: (p) => {
        const el = ref.current;
        if (!el) return;
        const v = (k: keyof MotionFrame, d: number) => mix(pick(from, k, d), pick(to, k, d), p);
        el.style.transform =
          `translate3d(calc(${v('xPercent', 0)}% + ${v('x', 0)}px), calc(${v('yPercent', 0)}% + ${v('y', 0)}px), 0) ` +
          `rotate(${v('rotate', 0)}deg) scale(${v('scale', 1)})`;
        if (from?.opacity !== undefined || to.opacity !== undefined) el.style.opacity = String(v('opacity', 1));
      },
    },
    [JSON.stringify(from), JSON.stringify(to)]
  );

  React.useEffect(() => {
    const el = ref.current;
    if (!enabled && el) {
      el.style.removeProperty('transform');
      el.style.removeProperty('opacity');
    }
  }, [enabled]);

  return React.createElement(as, { ref, className: cn(enabled && 'will-change-transform', className), style, ...props }, children);
};
