/**
 * Entradas no scroll — IntersectionObserver compartilhado, com três garantias do LP:
 *  1. o conteúdo é legível sem JS (o CSS só esconde quando html[data-motion="full"]);
 *  2. se o FOCO de teclado chega num elemento ainda não revelado, ele aparece na hora;
 *  3. (opcional) quem rola rápido não espera animação: revela instantâneo se houve
 *     scroll nos últimos 160ms (padrão "calmo" da biblioteca de prompts).
 */

import { motion } from '../tokens/motion';
import { isBrowser, readMotionEnv } from './env';

export interface RevealOptions {
  /** Revela uma vez (padrão) ou sempre que entra */
  once?: boolean;
  /** Linha de disparo no formato "top 92%" ou rootMargin CSS */
  start?: string;
  threshold?: number;
  /** Revela sem animação se o usuário rolou há pouco (listas longas) */
  calm?: boolean;
  onReveal: (instant: boolean) => void;
  onHide?: () => void;
}

interface Entry {
  el: HTMLElement;
  opts: RevealOptions;
  revealed: boolean;
}

const entries = new Map<Element, Entry>();
const observers = new Map<string, IntersectionObserver>();
let lastScrollAt = 0;
let globalListeners = false;

/** "top 92%" → rootMargin "0px 0px -8% 0px" (dispara quando o topo cruza 92% da viewport) */
export function startToRootMargin(start = 'top 92%'): string {
  if (/px|%\s/.test(start) && start.split(/\s+/).length === 4) return start;
  const vp = start.trim().split(/\s+/)[1] ?? '100%';
  const pct = vp === 'bottom' ? 100 : vp === 'center' ? 50 : vp === 'top' ? 0 : parseFloat(vp);
  return `0px 0px ${-(100 - (Number.isFinite(pct) ? pct : 100))}% 0px`;
}

function reveal(entry: Entry, instant: boolean) {
  if (entry.revealed) return;
  entry.revealed = true;
  entry.opts.onReveal(instant);
  if (entry.opts.once !== false) {
    observers.forEach((o) => o.unobserve(entry.el));
    entries.delete(entry.el);
  }
}

function ensureGlobal() {
  if (globalListeners || !isBrowser) return;
  globalListeners = true;
  window.addEventListener('scroll', () => (lastScrollAt = performance.now()), { passive: true });
  // Navegação por teclado nunca chega num controle ou título mascarado
  document.addEventListener('focusin', (event) => {
    const target = event.target as Node;
    entries.forEach((entry) => {
      if (!entry.revealed && entry.el.contains(target)) reveal(entry, true);
    });
  });
}

function observerFor(rootMargin: string, threshold: number): IntersectionObserver {
  const key = `${rootMargin}|${threshold}`;
  let o = observers.get(key);
  if (!o) {
    o = new IntersectionObserver(
      (list) =>
        list.forEach((e) => {
          const entry = entries.get(e.target);
          if (!entry) return;
          if (e.isIntersecting) {
            const calmSkip = entry.opts.calm && performance.now() - lastScrollAt < motion.cinematic.calmReveal.skipIfScrolledWithin;
            reveal(entry, !!calmSkip);
          } else if (entry.opts.once === false && entry.revealed) {
            entry.revealed = false;
            entry.opts.onHide?.();
          }
        }),
      { rootMargin, threshold }
    );
    observers.set(key, o);
  }
  return o;
}

/** Observa um elemento. Sem IntersectionObserver ou sem motion, revela imediatamente. */
export function observeReveal(el: HTMLElement, opts: RevealOptions): () => void {
  if (!isBrowser || typeof IntersectionObserver === 'undefined' || !readMotionEnv().full) {
    opts.onReveal(true);
    return () => {};
  }
  ensureGlobal();
  const entry: Entry = { el, opts, revealed: false };
  entries.set(el, entry);
  const o = observerFor(startToRootMargin(opts.start), opts.threshold ?? 0);
  o.observe(el);
  return () => {
    o.unobserve(el);
    entries.delete(el);
  };
}
