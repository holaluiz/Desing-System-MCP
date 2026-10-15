import React from 'react';
import { showRevealed } from '../../motion/auto';
import { readMotionEnv } from '../../motion/env';
import { observeReveal } from '../../motion/reveal';
import { cn } from '../../utils/cn';
import { mergeRefs } from './hooks';

export type RevealVariant = 'blur' | 'rise' | 'tilt' | 'clip' | 'calm';

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'li' | 'header' | 'footer' | 'span' | 'figure';
  /**
   * blur  — entra em foco (Lumen, 480ms)
   * rise  — LP: começa legível (opacidade .65) e sobe 18px (550ms power2.out)
   * tilt  — LP: cartão chega 45px abaixo, girado ±1.1° (850ms, 130ms entre itens)
   * clip  — LP: mídia revelada por recorte (950ms power3.inOut)
   * calm  — listas longas: 16px; instantâneo para quem está rolando rápido
   */
  variant?: RevealVariant;
  /** Posição na sequência (stagger conforme a variante) */
  index?: number;
  /** Direção do recorte (variant="clip") */
  from?: 'bottom' | 'top' | 'left' | 'right';
  /** scroll (padrão) ou load — entrada ao montar, para a hero */
  trigger?: 'scroll' | 'load';
  /** Atraso extra em ms */
  delay?: number;
  /** Revela só uma vez (padrão) ou sempre que entra na viewport */
  once?: boolean;
  /** Linha de disparo estilo ScrollTrigger ("top 92%") — variantes do LP */
  start?: string;
  /** Variante blur: margem/limiar do IntersectionObserver */
  rootMargin?: string;
  threshold?: number;
}

/**
 * Revelação no scroll — `blur-reveal` (Lumen) e as entradas do LP (`soft-rise`,
 * `tilt-entrance`, `clip-reveal`, `calm-reveal`). Conteúdo visível sem JavaScript;
 * se o foco de teclado chega antes da animação, o elemento aparece na hora.
 */
export const Reveal = React.forwardRef<HTMLElement, RevealProps>(function Reveal(
  {
    as = 'div',
    variant = 'blur',
    index = 0,
    from,
    trigger = 'scroll',
    delay = 0,
    once = true,
    start,
    rootMargin = '0px 0px -10% 0px',
    threshold = 0.15,
    className,
    style,
    children,
    ...props
  },
  forwardedRef
) {
  const ref = React.useRef<HTMLElement>(null);
  const [revealed, setRevealed] = React.useState(false);
  const lp = variant !== 'blur';

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (lp) {
      if (trigger === 'load') {
        const id = requestAnimationFrame(() => requestAnimationFrame(() => showRevealed(el, !readMotionEnv().full)));
        return () => cancelAnimationFrame(id);
      }
      return observeReveal(el, {
        start,
        once,
        calm: variant === 'calm',
        onReveal: (instant) => showRevealed(el, instant),
        onHide: () => el.removeAttribute('data-cm-shown'),
      });
    }
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          if (once) io.disconnect();
        } else if (!once) setRevealed(false);
      },
      { rootMargin, threshold }
    );
    io.observe(el);
    const onFocus = (e: FocusEvent) => {
      if (el.contains(e.target as Node)) setRevealed(true);
    };
    document.addEventListener('focusin', onFocus);
    return () => {
      io.disconnect();
      document.removeEventListener('focusin', onFocus);
    };
  }, [lp, variant, trigger, once, start, rootMargin, threshold]);

  const vars = { '--cm-i': index, ...(delay ? { '--cm-delay': `${delay}ms` } : null), ...style } as React.CSSProperties;
  const elementProps: Record<string, unknown> = lp
    ? { ref: mergeRefs(ref, forwardedRef), className, 'data-cm-reveal': variant, 'data-cm-from': from, style: vars, ...props }
    : { ref: mergeRefs(ref, forwardedRef), className: cn('cm-reveal', className), 'data-revealed': revealed ? 'true' : 'false', style: vars, ...props };
  return React.createElement(as, elementProps, children);
});
