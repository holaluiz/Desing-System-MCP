/**
 * Motion declarativo para HTML puro (sem React):
 *
 *   <h2 data-cm-reveal="lines">Linha um<br>Linha dois</h2>
 *   <article data-cm-reveal="rise">…</article>       rise | tilt | clip | blur
 *   <div data-cm-scrub data-cm-start="top bottom" data-cm-end="bottom top">…</div>  → --cm-p (0–1)
 *   <div data-cm-tilt="3.5">…</div>
 *   <section data-cm-trail><div class="cm-trail__layer"><img class="cm-trail__slot">…</div>…</section>
 *   <div class="cm-progress" data-cm-progress><i class="cm-progress__fill"></i></div>
 *   <video data-cm-autoplay muted playsinline src="…"></video>
 *
 *   import { initCaramelMotion } from '@caramelo/design-system/motion';
 *   initCaramelMotion();            // smooth scroll + tudo acima
 */

import { syncMotionAttribute } from './env';
import { createPointerTrail, createTilt } from './pointer';
import { observeReveal } from './reveal';
import { createScrollScene, measureUntransformed } from './scroll';
import { createSmoothScroll, type SmoothScrollOptions } from './smooth-scroll';
import { observeVideo } from './video';

export interface InitMotionOptions {
  /** Smooth scroll do LP (padrão: ligado) */
  smooth?: boolean | SmoothScrollOptions;
  root?: ParentNode;
}

/** Marca o elemento como revelado (instantâneo quando o foco chegou ou o usuário rolou rápido) */
export function showRevealed(el: HTMLElement, instant: boolean) {
  if (instant) el.setAttribute('data-cm-instant', '');
  el.setAttribute('data-cm-shown', '');
  if (instant) requestAnimationFrame(() => requestAnimationFrame(() => el.removeAttribute('data-cm-instant')));
}

/** Embrulha cada linha (separada por <br>) numa máscara — estrutura do LP (.motion-line) */
export function splitLines(el: HTMLElement): () => void {
  if (el.querySelector(':scope > .cm-line')) return () => {};
  const original = Array.from(el.childNodes);
  const groups: Node[][] = [[]];
  original.forEach((node) => {
    if (node.nodeName === 'BR') groups.push([]);
    else groups[groups.length - 1].push(node);
  });
  el.replaceChildren(
    ...groups.map((nodes, i) => {
      const mask = document.createElement('span');
      mask.className = 'cm-line';
      const inner = document.createElement('span');
      inner.className = 'cm-line__inner';
      inner.style.setProperty('--cm-line', String(i));
      inner.append(...nodes);
      mask.append(inner);
      return mask;
    })
  );
  return () => el.replaceChildren(...original);
}

export function initCaramelMotion(options: InitMotionOptions = {}): () => void {
  if (typeof document === 'undefined') return () => {};
  const root = options.root ?? document;
  const cleanups: Array<() => void> = [syncMotionAttribute()];

  if (options.smooth !== false) {
    const controller = createSmoothScroll(typeof options.smooth === 'object' ? options.smooth : {});
    cleanups.push(() => controller.destroy());
  }

  root.querySelectorAll<HTMLElement>('[data-cm-reveal]').forEach((el) => {
    if (el.dataset.cmReveal === 'lines') cleanups.push(splitLines(el));
    cleanups.push(
      observeReveal(el, {
        start: el.dataset.cmStart,
        calm: el.hasAttribute('data-cm-calm'),
        onReveal: (instant) => showRevealed(el, instant),
      })
    );
  });

  root.querySelectorAll<HTMLElement>('[data-cm-scrub]').forEach((el) => {
    const scene = createScrollScene(el, {
      start: el.dataset.cmStart ?? 'top bottom',
      end: el.dataset.cmEnd ?? 'bottom top',
      scrub: Number(el.dataset.cmScrub) || 0,
      // O CSS do autor costuma transformar o próprio elemento com --cm-p (receita do MCP)
      measure: () => measureUntransformed(el),
      onUpdate: (p) => el.style.setProperty('--cm-p', p.toFixed(4)),
    });
    cleanups.push(() => scene.destroy());
  });

  root.querySelectorAll<HTMLElement>('[data-cm-progress]').forEach((el) => {
    const scene = createScrollScene(document.documentElement, {
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (p) => el.style.setProperty('--cm-progress', p.toFixed(4)),
    });
    cleanups.push(() => scene.destroy());
  });

  root.querySelectorAll<HTMLElement>('[data-cm-tilt]').forEach((el) => {
    cleanups.push(createTilt(el, { max: Number(el.dataset.cmTilt) || undefined }));
  });

  root.querySelectorAll<HTMLElement>('[data-cm-trail]').forEach((container) => {
    const layer = container.querySelector<HTMLElement>('.cm-trail__layer');
    if (!layer) return;
    cleanups.push(createPointerTrail({ container, layer, slots: Array.from(layer.children) as HTMLElement[] }));
  });

  root.querySelectorAll<HTMLVideoElement>('video[data-cm-autoplay]').forEach((v) => cleanups.push(observeVideo(v)));

  return () => cleanups.reverse().forEach((c) => c());
}
