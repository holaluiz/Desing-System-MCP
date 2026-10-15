import React from 'react';
import { syncMotionAttribute } from '../../motion/env';
import { createSmoothScroll, getSmoothScroll, type SmoothScrollOptions } from '../../motion/smooth-scroll';

export type SmoothScrollProps = SmoothScrollOptions;

/**
 * Smooth scroll do LP (Lenis, lerp 0.075) — monte uma vez na raiz do app.
 * Só liga com mouse/trackpad e movimento completo; âncoras internas rolam com
 * offset do cabeçalho (--cm-header-height) e levam o foco junto.
 * Também mantém html[data-motion] = full | reduced | off para o CSS.
 */
export const SmoothScroll: React.FC<SmoothScrollProps> = ({ lerp, wheelMultiplier, Lenis }) => {
  React.useEffect(() => {
    const unsync = syncMotionAttribute();
    const controller = createSmoothScroll({ lerp, wheelMultiplier, Lenis });
    return () => {
      controller.destroy();
      unsync();
    };
  }, [lerp, wheelMultiplier, Lenis]);
  return null;
};

/** Acesso ao controlador (scrollTo com offset/foco, stop/start para diálogos) */
export const useSmoothScroll = () => getSmoothScroll;
