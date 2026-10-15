/**
 * Ambiente de motion — decide QUANDO animar, como nos sites do LP:
 *  - experiência completa só com ponteiro fino (mouse/trackpad) e sem movimento reduzido;
 *  - cenas grandes (sticky/scrub) só acima de limiares de tela;
 *  - ?motion=off desliga tudo; html[data-motion] expõe o estado ao CSS.
 */

import { motion } from '../tokens/motion';

export const MOTION_QUERIES = {
  fine: motion.cinematic.gates.fine,
  reduced: '(prefers-reduced-motion: reduce)',
  wide: motion.cinematic.gates.wide,
  stage: motion.cinematic.gates.stage,
  deck: motion.cinematic.gates.deck,
} as const;

export type MotionGate = keyof typeof MOTION_QUERIES;

export interface MotionEnv {
  fine: boolean;
  reduced: boolean;
  wide: boolean;
  stage: boolean;
  deck: boolean;
  /** ?motion=off ou html[data-motion="off"] */
  off: boolean;
  /** Pode animar (não reduzido, não desligado) */
  full: boolean;
}

export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export function matches(query: string): boolean {
  return isBrowser && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
}

export function motionOff(): boolean {
  if (!isBrowser) return false;
  try {
    if (new URLSearchParams(window.location.search).get('motion') === 'off') return true;
  } catch {
    /* URL indisponível */
  }
  return document.documentElement.getAttribute('data-motion') === 'off';
}

export function readMotionEnv(): MotionEnv {
  const reduced = matches(MOTION_QUERIES.reduced);
  const off = motionOff();
  return {
    fine: matches(MOTION_QUERIES.fine),
    reduced,
    wide: matches(MOTION_QUERIES.wide),
    stage: matches(MOTION_QUERIES.stage),
    deck: matches(MOTION_QUERIES.deck),
    off,
    full: !off && !reduced,
  };
}

/** Avisa quando qualquer condição muda (preferência do SO, tamanho, tipo de ponteiro). */
export function watchMotionEnv(callback: (env: MotionEnv) => void): () => void {
  if (!isBrowser || typeof window.matchMedia !== 'function') return () => {};
  const lists = Object.values(MOTION_QUERIES).map((q) => window.matchMedia(q));
  const handler = () => callback(readMotionEnv());
  lists.forEach((l) => l.addEventListener?.('change', handler));
  return () => lists.forEach((l) => l.removeEventListener?.('change', handler));
}

/**
 * Mantém html[data-motion] = full | reduced | off (o CSS usa para fallbacks).
 * Chamado pelo <SmoothScroll /> / initCaramelMotion(); seguro chamar mais de uma vez.
 */
export function syncMotionAttribute(): () => void {
  if (!isBrowser) return () => {};
  const root = document.documentElement;
  const apply = (env: MotionEnv) => root.setAttribute('data-motion', env.off ? 'off' : env.reduced ? 'reduced' : 'full');
  apply(readMotionEnv());
  return watchMotionEnv(apply);
}

/** Altura do cabeçalho fixo (--cm-header-height), usada para offsets de âncora/sticky */
export function headerOffset(): number {
  if (!isBrowser) return 0;
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cm-header-height')) || 0;
}
