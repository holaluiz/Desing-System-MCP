/**
 * @caramelo/design-system/motion — núcleo de motion cinematográfico (sem React, sem GSAP).
 * Os componentes React (SmoothScroll, LineReveal, Parallax, StickyDeck…) usam este núcleo;
 * em HTML puro, chame initCaramelMotion() e use os atributos data-cm-*.
 */

export * from './env';
export * from './scroll';
export * from './smooth-scroll';
export * from './reveal';
export * from './pointer';
export * from './video';
export { initCaramelMotion } from './auto';
