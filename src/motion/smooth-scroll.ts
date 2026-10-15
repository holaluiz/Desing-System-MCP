/**
 * Smooth scroll do LP — Lenis com lerp 0.075, só para mouse/trackpad.
 *  - touch, movimento reduzido e ?motion=off usam o scroll nativo;
 *  - teclas de rolagem assumem na hora uma animação em andamento;
 *  - âncoras rolam com offset do cabeçalho e levam o FOCO junto (acessibilidade);
 *  - `lenis` é dependência opcional: sem ela, tudo cai no scroll nativo.
 */

import type Lenis from 'lenis';
import { motion } from '../tokens/motion';
import { headerOffset, isBrowser, readMotionEnv, watchMotionEnv } from './env';
import { refreshScrollScenes } from './scroll';

type LenisCtor = new (options?: Record<string, unknown>) => Lenis;

export interface SmoothScrollOptions {
  /** Inércia da roda (LP: 0.075 — menor = mais suave) */
  lerp?: number;
  wheelMultiplier?: number;
  /** Passe o construtor se preferir não depender do import dinâmico de 'lenis' */
  Lenis?: LenisCtor;
}

export interface ScrollToOptions {
  /** Desconto em px (padrão: −altura do cabeçalho −20) */
  offset?: number;
  /** Segundos (padrão 0.8 — âncoras do LP) */
  duration?: number;
  /** Move o foco para o destino sem rolar de novo (padrão: true para elementos) */
  focus?: boolean;
  onComplete?: () => void;
}

export interface SmoothScrollController {
  readonly lenis: Lenis | null;
  readonly smooth: boolean;
  scrollTo(target: number | string | HTMLElement, options?: ScrollToOptions): void;
  stop(): void;
  start(): void;
  destroy(): void;
}

const SCROLL_KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];

function resolveTarget(target: number | string | HTMLElement): { top: number; el: HTMLElement | null } {
  if (typeof target === 'number') return { top: target, el: null };
  const el = typeof target === 'string' ? (document.querySelector(target) as HTMLElement | null) : target;
  if (!el) return { top: window.scrollY, el: null };
  return { top: el.getBoundingClientRect().top + window.scrollY, el };
}

function focusTarget(el: HTMLElement) {
  if (!el.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(el.tagName)) {
    el.setAttribute('tabindex', '-1');
    el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true });
  }
  el.focus({ preventScroll: true });
}

function nativeController(): SmoothScrollController {
  return {
    lenis: null,
    smooth: false,
    scrollTo(target, options = {}) {
      const { top, el } = resolveTarget(target);
      const offset = options.offset ?? (el ? -(headerOffset() + 20) : 0);
      const env = readMotionEnv();
      window.scrollTo({ top: Math.max(0, top + offset), behavior: env.full ? 'smooth' : 'instant' });
      if (el && options.focus !== false) focusTarget(el);
      options.onComplete?.();
    },
    stop() {},
    start() {},
    destroy() {},
  };
}

let current: SmoothScrollController | null = null;

/** O controlador ativo (ou um nativo, se o smooth scroll não estiver ligado) */
export function getSmoothScroll(): SmoothScrollController {
  return current ?? nativeController();
}

/** Rola até um alvo pelo controlador ativo — use em âncoras, steppers e "pular para" */
export function scrollToTarget(target: number | string | HTMLElement, options?: ScrollToOptions) {
  getSmoothScroll().scrollTo(target, options);
}

async function loadLenis(given?: LenisCtor): Promise<LenisCtor | null> {
  if (given) return given;
  try {
    const mod = (await import('lenis')) as unknown as { default: LenisCtor };
    return mod.default;
  } catch {
    return null;
  }
}

/**
 * Liga o smooth scroll global. Reage às mudanças de ambiente (ex.: o usuário ativa
 * "reduzir movimento" com a página aberta) recriando ou desligando o Lenis.
 */
export function createSmoothScroll(options: SmoothScrollOptions = {}): SmoothScrollController {
  if (!isBrowser) return nativeController();
  const cfg = motion.cinematic.smoothScroll;
  let lenis: Lenis | null = null;
  let raf = 0;
  let destroyed = false;
  let keyHandler: ((e: KeyboardEvent) => void) | null = null;
  let anchorHandler: ((e: MouseEvent) => void) | null = null;

  const teardownLenis = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    keyHandler = null;
    lenis?.destroy();
    lenis = null;
    document.documentElement.removeAttribute('data-cm-smooth');
  };

  const setup = async () => {
    const env = readMotionEnv();
    if (!env.fine || !env.full) {
      teardownLenis();
      return;
    }
    if (lenis) return;
    const Ctor = await loadLenis(options.Lenis);
    if (!Ctor || destroyed || lenis) return;
    lenis = new Ctor({
      lerp: options.lerp ?? cfg.lerp,
      smoothWheel: cfg.smoothWheel,
      wheelMultiplier: options.wheelMultiplier ?? cfg.wheelMultiplier,
      syncTouch: cfg.syncTouch,
      autoResize: true,
    });
    document.documentElement.setAttribute('data-cm-smooth', '');
    const loop = (time: number) => {
      if (!document.hidden) lenis?.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    // Teclado nativo assume uma animação de roda/âncora em andamento
    keyHandler = (event: KeyboardEvent) => {
      if (!lenis || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (!SCROLL_KEYS.includes(event.key) || lenis.isScrolling !== 'smooth') return;
      const t = event.target;
      if (t instanceof Element && (t.closest('input,textarea,select') || (t as HTMLElement).isContentEditable)) return;
      if (event.key === ' ' && t instanceof Element && t.closest('button,[role="button"]')) return;
      // reset() é privado nos tipos do Lenis 1.1, mas é o que o LP usa para soltar a animação
      (lenis as unknown as { reset(): void }).reset();
    };
    document.addEventListener('keydown', keyHandler);
    refreshScrollScenes();
  };

  // Âncoras internas: offset do cabeçalho + foco no destino
  anchorHandler = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const link = (event.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
    if (!link || link.hasAttribute('data-cm-native') || link.hash.length < 2) return;
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    controller.scrollTo(target);
    history.replaceState(null, '', link.hash);
  };
  document.addEventListener('click', anchorHandler);

  const unwatch = watchMotionEnv(() => void setup());
  void setup();

  const controller: SmoothScrollController = {
    get lenis() {
      return lenis;
    },
    get smooth() {
      return !!lenis;
    },
    scrollTo(target, opts = {}) {
      if (!lenis) return nativeController().scrollTo(target, opts);
      const { top, el } = resolveTarget(target);
      const offset = opts.offset ?? (el ? -(headerOffset() + 20) : 0);
      if (el && opts.focus !== false) focusTarget(el);
      lenis.scrollTo(Math.max(0, top + offset), {
        duration: opts.duration ?? parseFloat(cfg.anchorDuration),
        onComplete: () => opts.onComplete?.(),
      });
    },
    stop() {
      lenis?.stop();
    },
    start() {
      lenis?.start();
    },
    destroy() {
      destroyed = true;
      unwatch();
      teardownLenis();
      if (anchorHandler) document.removeEventListener('click', anchorHandler);
      if (current === controller) current = null;
    },
  };
  current?.destroy();
  current = controller;
  return controller;
}
