import React from 'react';

const isBrowser = typeof window !== 'undefined';

/** Igual a useLayoutEffect no browser e silencioso no SSR */
export const useIsomorphicLayoutEffect = isBrowser ? React.useLayoutEffect : React.useEffect;

function matches(query: string): boolean {
  return isBrowser && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
}

/** true quando o usuário pediu movimento reduzido no sistema operacional */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (!isBrowser || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

/** Combina refs (do forwardRef + ref interno) */
export function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(value);
      else if (ref && typeof ref === 'object') (ref as React.MutableRefObject<T | null>).current = value;
    }
  };
}

/**
 * Escreve a posição do ponteiro em --mx / --my (px, relativos ao elemento).
 * Usado por GlowButton e Surface spotlight. Throttle por requestAnimationFrame.
 */
export function usePointerVars<T extends HTMLElement>(ref: React.RefObject<T | null>, enabled = true) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    };
    el.addEventListener('pointermove', onMove);
    return () => {
      el.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [ref, enabled]);
}

export interface MagneticOptions {
  /** Fração da distância do cursor ao centro (0–1). Padrão 0.3 */
  strength?: number;
  /** Deslocamento máximo em px. Padrão 8 (token motion.distance.magneticMax) */
  max?: number;
  disabled?: boolean;
}

/**
 * Efeito magnético: o elemento é atraído pelo cursor via --cm-mag-x / --cm-mag-y.
 * Desligado automaticamente em ponteiro grosso (touch) e com movimento reduzido.
 */
export function useMagnetic<T extends HTMLElement>(ref: React.RefObject<T | null>, options: MagneticOptions = {}) {
  const { strength = 0.3, max = 8, disabled = false } = options;
  React.useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;
    if (matches('(pointer: coarse)') || matches('(prefers-reduced-motion: reduce)')) return;

    let frame = 0;
    const clamp = (v: number) => Math.max(-max, Math.min(max, v));
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.setProperty('--cm-mag-x', `${clamp(dx * strength).toFixed(2)}px`);
        el.style.setProperty('--cm-mag-y', `${clamp(dy * strength).toFixed(2)}px`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.setProperty('--cm-mag-x', '0px');
      el.style.setProperty('--cm-mag-y', '0px');
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, [ref, strength, max, disabled]);
}

/** Estado controlado/não-controlado no padrão dos componentes nativos */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void
): [T, (next: T) => void] {
  const [internal, setInternal] = React.useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : internal;
  const setValue = React.useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );
  return [current, setValue];
}
