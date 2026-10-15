/**
 * Interações de mouse do LP.
 *
 *  - Rastro de imagens (hero, contato, rodapé): cartões surgem atrás do cursor, giram
 *    alternando o lado e caem. Pool fixo, sem RAF permanente, sem substituir o cursor;
 *    nunca cobre CTAs; some ao rolar, clicar, focar ou trocar de aba.
 *  - Tilt: o cartaz/hero inclina alguns graus em direção ao ponteiro (CSS faz o easing).
 *
 * Ambos só existem com mouse/trackpad (hover + pointer fine) e movimento completo.
 */

import { motion } from '../tokens/motion';
import { isBrowser, readMotionEnv, watchMotionEnv } from './env';

export const INTERACTIVE_SELECTOR =
  'a,button,input,select,textarea,summary,label,[role="button"],[contenteditable="true"],[tabindex]:not([tabindex="-1"])';

export interface PointerTrailOptions {
  /** Área onde o rastro acontece (position: relative será aplicado) */
  container: HTMLElement;
  /** Camada absoluta (pointer-events: none) que contém os slots */
  layer: HTMLElement;
  /** Slots já renderizados (imagens ou cartões); reutilizados em rodízio */
  slots: HTMLElement[];
  minDistance?: number;
  minInterval?: number;
  lifetime?: number;
  /** Largura do cartão em px (padrão: clamp(130, 13.5vw, 196)) */
  width?: () => number;
  /** Proporção largura/altura (padrão 16/10) */
  aspect?: number;
  /** Seletor dos alvos que o rastro evita cobrir */
  avoid?: string;
}

export function createPointerTrail(opts: PointerTrailOptions): () => void {
  if (!isBrowser || !opts.slots.length || !Element.prototype.animate) return () => {};
  const cfg = motion.cinematic.pointerTrail;
  const minDistance = opts.minDistance ?? cfg.minDistance;
  const minInterval = opts.minInterval ?? cfg.minInterval;
  const lifetime = opts.lifetime ?? cfg.lifetime;
  const aspect = opts.aspect ?? 16 / 10;
  const avoid = opts.avoid ?? INTERACTIVE_SELECTOR;
  const widthOf = opts.width ?? (() => Math.min(196, Math.max(130, window.innerWidth * 0.135)));
  const slots = opts.slots.map((el) => ({ el, animation: null as Animation | null }));

  let enabled = false;
  let last: { x: number; y: number; time: number } | null = null;
  let bounds: DOMRect | null = null;
  let controls: DOMRect[] = [];
  let cursor = 0;
  let sequence = 0;
  let suspendedUntil = 0;

  const cancel = (slot: (typeof slots)[number]) => {
    if (slot.animation) {
      slot.animation.onfinish = null;
      slot.animation.cancel();
      slot.animation = null;
    }
    slot.el.dataset.active = 'false';
    slot.el.style.opacity = '0';
  };
  const clear = () => {
    slots.forEach(cancel);
    last = null;
    bounds = null;
    controls = [];
  };

  const measure = () => {
    bounds = opts.container.getBoundingClientRect();
    controls = Array.from(opts.container.querySelectorAll<HTMLElement>(avoid))
      .filter((e) => {
        const s = getComputedStyle(e);
        return s.visibility !== 'hidden' && s.display !== 'none';
      })
      .map((e) => e.getBoundingClientRect());
  };

  const move = (event: PointerEvent) => {
    if (!enabled || event.pointerType !== 'mouse' || event.buttons || document.hidden) return clear();
    const now = performance.now();
    if (now < suspendedUntil) return;
    if (!bounds) measure();
    if (event.target instanceof Element && event.target.closest(avoid)) {
      last = null;
      return;
    }
    const point = { x: event.clientX, y: event.clientY, time: now };
    if (!last) {
      last = point;
      return;
    }
    const dx = point.x - last.x;
    const dy = point.y - last.y;
    if (Math.hypot(dx, dy) < minDistance || now - last.time < minInterval) return;

    const b = bounds!;
    const width = widthOf();
    const height = width / aspect;
    if (b.height < height + 24 || b.width < width) return;
    const x = Math.max(b.left + width / 2, Math.min(b.right - width / 2, point.x));
    const y = Math.max(b.top + height / 2 + 12, Math.min(b.bottom - height / 2 - 12, point.y));
    const fp = { l: x - width / 2 - 32, r: x + width / 2 + 32, t: y - height / 2 - 24, b: y + height / 2 + 44 };
    // Não cobre CTAs nem seus alvos reais
    if (controls.some((c) => c.width && c.height && fp.l < c.right && fp.r > c.left && fp.t < c.bottom && fp.b > c.top)) {
      last = point;
      return;
    }

    const slot = slots[cursor++ % slots.length];
    cancel(slot);
    const angle = (sequence % 2 ? -1 : 1) * (4 + (sequence % 5));
    const drift = Math.max(-18, Math.min(18, dx * 0.06));
    slot.el.style.width = `${width}px`;
    slot.el.style.height = `${height}px`;
    slot.el.style.left = `${x - b.left - width / 2}px`;
    slot.el.style.top = `${y - b.top - height / 2}px`;
    slot.el.style.zIndex = String(++sequence);
    slot.el.dataset.active = 'true';
    const animation = slot.el.animate(
      [
        { opacity: 0, transform: `translate3d(0,14px,0) rotate(${angle - 5}deg) scale(.82)`, offset: 0 },
        { opacity: 1, transform: `translate3d(0,0,0) rotate(${angle}deg) scale(1)`, offset: 0.12 },
        { opacity: 1, transform: `translate3d(${drift * 0.45}px,-4px,0) rotate(${angle}deg) scale(1)`, offset: 0.56 },
        { opacity: 0, transform: `translate3d(${drift}px,22px,0) rotate(${angle + 5}deg) scale(.94)`, offset: 1 },
      ],
      { duration: lifetime, easing: motion.easings.trail, fill: 'none' }
    );
    slot.animation = animation;
    animation.onfinish = () => {
      if (slot.animation !== animation) return;
      slot.animation = null;
      slot.el.dataset.active = 'false';
    };
    last = point;
  };

  const ac = new AbortController();
  const signal = ac.signal;
  const sync = () => {
    const env = readMotionEnv();
    enabled = env.fine && env.full;
    if (!enabled) clear();
  };
  sync();
  const unwatch = watchMotionEnv(sync);
  opts.container.addEventListener('pointermove', move, { passive: true, signal });
  opts.container.addEventListener('pointerenter', () => measure(), { passive: true, signal });
  opts.container.addEventListener('pointerleave', clear, { passive: true, signal });
  window.addEventListener(
    'scroll',
    () => {
      suspendedUntil = performance.now() + motion.cinematic.pointerTrail.scrollPause;
      clear();
    },
    { capture: true, passive: true, signal }
  );
  window.addEventListener('resize', clear, { passive: true, signal });
  window.addEventListener('blur', clear, { signal });
  document.addEventListener('visibilitychange', clear, { signal });
  document.addEventListener('pointerdown', clear, { capture: true, passive: true, signal });
  document.addEventListener('focusin', clear, { signal });

  return () => {
    ac.abort();
    unwatch();
    clear();
  };
}

export interface TiltOptions {
  /** Graus máximos (LP Maker: 3.5) — ou separado por eixo */
  max?: number;
  maxX?: number;
  maxY?: number;
  /** Elemento que gira (padrão: o próprio) — mantenha controles FORA dele */
  target?: HTMLElement;
}

/**
 * Tilt por ponteiro: escreve --cm-tilt-x/--cm-tilt-y (deg). O CSS (.cm-tilt) aplica
 * perspectiva + transição power2.out de 400ms — o equivalente do gsap.quickTo do LP.
 */
export function createTilt(el: HTMLElement, opts: TiltOptions = {}): () => void {
  if (!isBrowser) return () => {};
  const cfg = motion.cinematic.pointerTilt;
  const maxX = opts.maxX ?? opts.max ?? cfg.maxDeg;
  const maxY = opts.maxY ?? opts.max ?? cfg.maxDeg;
  const target = opts.target ?? el;
  let bounds: DOMRect | null = null;
  let enabled = false;

  const set = (x: number, y: number) => {
    target.style.setProperty('--cm-tilt-x', `${x.toFixed(2)}deg`);
    target.style.setProperty('--cm-tilt-y', `${y.toFixed(2)}deg`);
  };
  const reset = () => {
    bounds = null;
    set(0, 0);
  };
  const move = (e: PointerEvent) => {
    if (!enabled || e.pointerType === 'touch') return;
    if (e.target instanceof Element && e.target.closest('a,button,input,select,textarea')) return;
    bounds ??= el.getBoundingClientRect();
    const px = Math.max(-0.5, Math.min(0.5, (e.clientX - bounds.left) / bounds.width - 0.5));
    const py = Math.max(-0.5, Math.min(0.5, (e.clientY - bounds.top) / bounds.height - 0.5));
    set(-py * 2 * maxX, px * 2 * maxY);
  };

  const ac = new AbortController();
  const sync = () => {
    const env = readMotionEnv();
    enabled = env.fine && env.full;
    if (!enabled) reset();
  };
  sync();
  const unwatch = watchMotionEnv(sync);
  el.addEventListener('pointermove', move, { passive: true, signal: ac.signal });
  el.addEventListener('pointerleave', reset, { passive: true, signal: ac.signal });
  window.addEventListener('scroll', reset, { passive: true, signal: ac.signal });
  window.addEventListener('blur', reset, { signal: ac.signal });
  return () => {
    ac.abort();
    unwatch();
    target.style.removeProperty('--cm-tilt-x');
    target.style.removeProperty('--cm-tilt-y');
  };
}
