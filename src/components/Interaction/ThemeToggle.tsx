import React from 'react';
import { cn } from '../../utils/cn';

export type CarameloTheme = 'dark' | 'light';

export interface ThemeToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  theme?: CarameloTheme;
  defaultTheme?: CarameloTheme;
  onThemeChange?: (theme: CarameloTheme) => void;
  /** Elemento que recebe data-caramelo-theme (padrão: <html>) */
  getTarget?: () => HTMLElement;
  /** Persiste a escolha em localStorage (padrão: true) */
  persist?: boolean;
  storageKey?: string;
}

const readStored = (key: string): CarameloTheme | null => {
  try {
    const v = window.localStorage.getItem(key);
    return v === 'dark' || v === 'light' ? v : null;
  } catch {
    return null;
  }
};

/**
 * Troca de Tema com Revelação Diagonal — microinteração `theme-reveal`.
 * Usa a View Transitions API quando disponível; troca instantânea com movimento reduzido.
 */
export const ThemeToggle = React.forwardRef<HTMLButtonElement, ThemeToggleProps>(function ThemeToggle(
  { theme, defaultTheme = 'dark', onThemeChange, getTarget, persist = true, storageKey = 'caramelo-theme', className, ...props },
  ref
) {
  const maskId = `cm-tt-${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [internal, setInternal] = React.useState<CarameloTheme>(defaultTheme);
  const current = theme ?? internal;

  const apply = React.useCallback(
    (next: CarameloTheme) => {
      const target = getTarget?.() ?? document.documentElement;
      target.setAttribute('data-caramelo-theme', next);
      if (persist) {
        try {
          window.localStorage.setItem(storageKey, next);
        } catch {
          /* armazenamento indisponível */
        }
      }
    },
    [getTarget, persist, storageKey]
  );

  React.useEffect(() => {
    if (theme !== undefined) {
      apply(theme);
      return;
    }
    const stored = persist ? readStored(storageKey) : null;
    const initial = stored ?? defaultTheme;
    setInternal(initial);
    apply(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next: CarameloTheme = current === 'dark' ? 'light' : 'dark';
    const commit = () => {
      apply(next);
      if (theme === undefined) setInternal(next);
      onThemeChange?.(next);
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!doc.startViewTransition || reduced) return commit();
    const root = document.documentElement;
    root.setAttribute('data-cm-theme-transition', '');
    doc.startViewTransition(commit).finished.finally(() => root.removeAttribute('data-cm-theme-transition'));
  };

  return (
    <button
      ref={ref}
      type="button"
      className={cn('cm-theme-toggle', className)}
      data-mode={current}
      aria-label={current === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={current === 'dark' ? 'Tema claro' : 'Tema escuro'}
      onClick={toggle}
      {...props}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true" focusable={false}>
        <mask id={maskId}>
          <rect x="-4" y="-4" width="32" height="32" fill="#fff" />
          <circle className="cm-theme-toggle__cut" cx="24" cy="0" r="7" fill="#000" />
        </mask>
        <circle className="cm-theme-toggle__core" cx="12" cy="12" r="5" fill="currentColor" stroke="none" mask={`url(#${maskId})`} />
        <g className="cm-theme-toggle__rays">
          <path d="M12 1.75v2M12 20.25v2M1.75 12h2M20.25 12h2M4.75 4.75l1.4 1.4M17.85 17.85l1.4 1.4M4.75 19.25l1.4-1.4M17.85 6.15l1.4-1.4" />
        </g>
      </svg>
    </button>
  );
});
