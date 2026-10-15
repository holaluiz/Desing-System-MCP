/**
 * Cenas de scroll — o "ScrollTrigger" do design system, sem dependências.
 *
 * Contrato (herdado do LP):
 *  - a geometria é medida só no refresh (resize, fontes, mudança de layout) — os frames
 *    apenas calculam progresso e escrevem transform/variáveis;
 *  - um único loop de rAF, ativo só enquanto há scroll ou suavização pendente;
 *  - `scrub` em segundos suaviza o progresso (como scrub: .35 no GSAP).
 *
 * Posições no formato do ScrollTrigger: "<borda do elemento> <linha da viewport>"
 *   "top bottom" (padrão de início), "bottom top" (padrão de fim), "top 90%",
 *   "center center", "top top+=84" (soma px), "bottom bottom-=16".
 */

import { isBrowser } from './env';

export interface ScrollSceneOptions {
  start?: string;
  end?: string;
  /** Suavização em segundos (0 = segue o scroll exatamente) */
  scrub?: number;
  /** Recebe o progresso 0–1 (já suavizado) */
  onUpdate?: (progress: number) => void;
  /** Entrou/saiu do intervalo start–end */
  onToggle?: (active: boolean) => void;
  /** Elemento medido (padrão: o próprio elemento da cena) */
  trigger?: HTMLElement;
  /**
   * Medição própria (topo no documento + altura). Use em elementos sticky: meça a posição
   * de fluxo, não a "grudada" — o LP remove o sticky por um instante no refresh.
   * Se a cena transforma o próprio elemento medido, use `measureUntransformed`.
   */
  measure?: () => { top: number; height: number };
}

export interface ScrollScene {
  readonly progress: number;
  /** Rolagem do documento onde a cena começa/termina (útil para pular até um passo) */
  readonly startScroll: number;
  readonly endScroll: number;
  refresh(): void;
  destroy(): void;
}

interface Position {
  elFrac: number;
  elPx: number;
  vpFrac: number;
  vpPx: number;
}

function parseLength(token: string): { frac: number; px: number } {
  if (token === 'top' || token === 'left') return { frac: 0, px: 0 };
  if (token === 'center') return { frac: 0.5, px: 0 };
  if (token === 'bottom' || token === 'right') return { frac: 1, px: 0 };
  if (token.endsWith('%')) return { frac: parseFloat(token) / 100, px: 0 };
  return { frac: 0, px: parseFloat(token) || 0 };
}

export function parseScrollPosition(value: string): Position {
  const [elTok = 'top', vpRaw = 'bottom'] = value.trim().split(/\s+/);
  const m = /^([a-z]+|-?[\d.]+%?|-?[\d.]+px)([+-]=-?[\d.]+)?$/.exec(vpRaw);
  const vpBase = m ? m[1] : vpRaw;
  const shift = m?.[2] ? (m[2][0] === '+' ? 1 : -1) * parseFloat(m[2].slice(2)) : 0;
  const el = parseLength(elTok);
  const vp = parseLength(vpBase);
  return { elFrac: el.frac, elPx: el.px, vpFrac: vp.frac, vpPx: vp.px + shift };
}

interface SceneState {
  el: HTMLElement;
  trigger: HTMLElement;
  start: Position;
  end: Position;
  scrub: number;
  onUpdate?: (p: number) => void;
  onToggle?: (a: boolean) => void;
  customMeasure?: () => { top: number; height: number };
  startScroll: number;
  endScroll: number;
  target: number;
  current: number;
  active: boolean | null;
  emitted: number;
}

const scenes = new Set<SceneState>();
let frame = 0;
let lastTime = 0;
let listening = false;
let resizeObserver: ResizeObserver | null = null;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function measure(s: SceneState) {
  let top: number;
  let height: number;
  if (s.customMeasure) ({ top, height } = s.customMeasure());
  else {
    const rect = s.trigger.getBoundingClientRect();
    top = rect.top + window.scrollY;
    height = rect.height;
  }
  const vh = window.innerHeight;
  const at = (p: Position) => top + p.elFrac * height + p.elPx - (p.vpFrac * vh + p.vpPx);
  s.startScroll = at(s.start);
  s.endScroll = at(s.end);
}

function targetOf(s: SceneState): number {
  const span = s.endScroll - s.startScroll;
  if (span <= 0) return window.scrollY >= s.startScroll ? 1 : 0;
  return clamp01((window.scrollY - s.startScroll) / span);
}

function tick(time: number) {
  frame = 0;
  const dt = lastTime ? Math.min(0.1, (time - lastTime) / 1000) : 1 / 60;
  lastTime = time;
  let pending = false;
  scenes.forEach((s) => {
    s.target = targetOf(s);
    if (s.scrub > 0) {
      const k = 1 - Math.exp(-dt / (s.scrub / 3));
      s.current += (s.target - s.current) * k;
      if (Math.abs(s.target - s.current) < 0.0005) s.current = s.target;
      else pending = true;
    } else s.current = s.target;
    if (s.current !== s.emitted) {
      s.emitted = s.current;
      s.onUpdate?.(s.current);
    }
    const active = s.target > 0 && s.target < 1;
    if (active !== s.active) {
      s.active = active;
      s.onToggle?.(active);
    }
  });
  if (pending) schedule();
  else lastTime = 0;
}

function schedule() {
  if (!frame && isBrowser) frame = requestAnimationFrame(tick);
}

export function refreshScrollScenes() {
  scenes.forEach(measure);
  schedule();
}

let refreshQueued = 0;
function queueRefresh() {
  if (refreshQueued) return;
  refreshQueued = requestAnimationFrame(() => {
    refreshQueued = 0;
    refreshScrollScenes();
  });
}

function listen() {
  if (listening || !isBrowser) return;
  listening = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', queueRefresh, { passive: true });
  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(queueRefresh);
    resizeObserver.observe(document.documentElement);
  }
  // A geometria das cenas depende da tipografia real (Montserrat larga)
  document.fonts?.ready.then(queueRefresh).catch(() => {});
}

function unlisten() {
  if (!listening || scenes.size) return;
  listening = false;
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', queueRefresh);
  resizeObserver?.disconnect();
  resizeObserver = null;
}

const TRANSFORM_PROPS = ['transform', 'translate', 'rotate', 'scale'] as const;

/**
 * Mede o elemento sem as próprias transformações (transform e translate/rotate/scale),
 * anuladas por um instante. Para `measure` de cenas que movem o elemento que medem
 * (parallax, `--cm-p` num transform): sem isso, um refresh no meio do caminho desloca
 * start/end pelo deslocamento atual e a cena salta.
 */
export function measureUntransformed(el: HTMLElement): { top: number; height: number } {
  const { style } = el;
  const saved = TRANSFORM_PROPS.map((p) => [p, style.getPropertyValue(p), style.getPropertyPriority(p)] as const);
  TRANSFORM_PROPS.forEach((p) => style.setProperty(p, 'none', 'important'));
  const r = el.getBoundingClientRect();
  saved.forEach(([p, value, priority]) => (value ? style.setProperty(p, value, priority) : style.removeProperty(p)));
  return { top: r.top + window.scrollY, height: r.height };
}

export function createScrollScene(el: HTMLElement, options: ScrollSceneOptions = {}): ScrollScene {
  const state: SceneState = {
    el,
    trigger: options.trigger ?? el,
    start: parseScrollPosition(options.start ?? 'top bottom'),
    end: parseScrollPosition(options.end ?? 'bottom top'),
    scrub: options.scrub ?? 0,
    onUpdate: options.onUpdate,
    onToggle: options.onToggle,
    customMeasure: options.measure,
    startScroll: 0,
    endScroll: 0,
    target: 0,
    current: 0,
    active: null,
    emitted: -1,
  };
  if (!isBrowser) {
    return { progress: 0, startScroll: 0, endScroll: 0, refresh() {}, destroy() {} };
  }
  measure(state);
  state.current = state.target = targetOf(state);
  scenes.add(state);
  listen();
  schedule();
  return {
    get progress() {
      return state.current;
    },
    get startScroll() {
      return state.startScroll;
    },
    get endScroll() {
      return state.endScroll;
    },
    refresh() {
      measure(state);
      schedule();
    },
    destroy() {
      scenes.delete(state);
      unlisten();
    },
  };
}

/** Interpolação linear de um intervalo [de, para] pelo progresso */
export const mix = (from: number, to: number, p: number) => from + (to - from) * p;
