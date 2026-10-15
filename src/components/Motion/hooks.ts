import React from 'react';
import { readMotionEnv, watchMotionEnv, type MotionEnv } from '../../motion/env';
import { observeReveal, type RevealOptions } from '../../motion/reveal';
import { createScrollScene, type ScrollSceneOptions } from '../../motion/scroll';
import { showRevealed } from '../../motion/auto';

const SSR_ENV: MotionEnv = { fine: false, reduced: false, wide: false, stage: false, deck: false, off: false, full: true };

/** Estado do ambiente de motion (ponteiro, tela, movimento reduzido), atualizado ao vivo */
export function useMotionEnv(): MotionEnv {
  const [env, setEnv] = React.useState<MotionEnv>(SSR_ENV);
  React.useEffect(() => {
    setEnv(readMotionEnv());
    return watchMotionEnv(setEnv);
  }, []);
  return env;
}

/**
 * Cena de scroll ligada a um ref. `onUpdate` roda fora do React (sem re-render por frame):
 * escreva estilo/variáveis direto no elemento.
 */
export function useScrollScene<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  options: ScrollSceneOptions & { enabled?: boolean },
  deps: React.DependencyList = []
) {
  const latest = React.useRef(options);
  latest.current = options;
  React.useEffect(() => {
    const el = ref.current;
    if (!el || options.enabled === false) return;
    const scene = createScrollScene(el, {
      ...latest.current,
      onUpdate: (p) => latest.current.onUpdate?.(p),
      onToggle: (a) => latest.current.onToggle?.(a),
    });
    return () => scene.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, options.enabled, options.start, options.end, options.scrub, ...deps]);
}

/** Revela o elemento ao entrar na viewport (data-cm-shown), com acabamento por foco */
export function useReveal<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  options: Omit<RevealOptions, 'onReveal'> & { trigger?: 'scroll' | 'load' } = {}
) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (options.trigger === 'load') {
      // Entrada ao carregar: espera um frame para o estado "antes" ser pintado
      const id = requestAnimationFrame(() => requestAnimationFrame(() => showRevealed(el, !readMotionEnv().full)));
      return () => cancelAnimationFrame(id);
    }
    return observeReveal(el, { ...options, onReveal: (instant) => showRevealed(el, instant) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, options.trigger, options.start, options.once, options.calm]);
}

/** true depois de rolar `threshold` px — para a borda do cabeçalho (LP: 40px) */
export function useScrolled(threshold = 40): boolean {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [threshold]);
  return scrolled;
}
