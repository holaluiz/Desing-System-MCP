import React from 'react';
import { cn } from '../../utils/cn';
import { useControllableState, useIsomorphicLayoutEffect } from './hooks';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
}

export interface SpotlightTabsProps {
  items: TabItem[];
  /** Rótulo acessível do grupo de abas (obrigatório) */
  ariaLabel: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** pill = spotlight · underline = traço de luz · expand = ícones que revelam o rótulo */
  variant?: 'pill' | 'underline' | 'expand';
  /** auto: setas já selecionam · manual: setas movem o foco, Enter/Espaço seleciona */
  activation?: 'auto' | 'manual';
  className?: string;
  panelClassName?: string;
}

/**
 * Abas com Spotlight Deslizante — microinterações `spotlight-tabs`, `underline-tabs`, `expanding-tabs`.
 * O indicador desliza da aba anterior para a nova (constância de objeto).
 */
export const SpotlightTabs: React.FC<SpotlightTabsProps> = ({
  items,
  ariaLabel,
  value,
  defaultValue,
  onValueChange,
  variant = 'pill',
  activation = 'auto',
  className,
  panelClassName,
}) => {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const firstEnabled = items.find((i) => !i.disabled)?.id ?? '';
  const [selected, setSelected] = useControllableState(value, defaultValue ?? firstEnabled, onValueChange);
  const listRef = React.useRef<HTMLDivElement>(null);
  const tabRefs = React.useRef(new Map<string, HTMLButtonElement>());

  const measure = React.useCallback(() => {
    const list = listRef.current;
    const tab = tabRefs.current.get(selected);
    if (!list || !tab) return;
    list.style.setProperty('--cm-ind-x', `${tab.offsetLeft}px`);
    list.style.setProperty('--cm-ind-w', `${tab.offsetWidth}px`);
  }, [selected]);

  useIsomorphicLayoutEffect(() => {
    measure();
  }, [measure]);

  // Acompanha mudanças de largura (fontes carregando, variante expand, resize)
  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const frame = requestAnimationFrame(() => list.setAttribute('data-ready', ''));
    if (typeof ResizeObserver === 'undefined') return () => cancelAnimationFrame(frame);
    const ro = new ResizeObserver(() => measure());
    ro.observe(list);
    tabRefs.current.forEach((el) => ro.observe(el));
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [measure, items]);

  const enabled = items.filter((i) => !i.disabled);
  const focusTab = (id: string) => tabRefs.current.get(id)?.focus();

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, id: string) => {
    const idx = enabled.findIndex((i) => i.id === id);
    let next: TabItem | undefined;
    if (e.key === 'ArrowRight') next = enabled[(idx + 1) % enabled.length];
    else if (e.key === 'ArrowLeft') next = enabled[(idx - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    if (!next) return;
    e.preventDefault();
    focusTab(next.id);
    if (activation === 'auto') setSelected(next.id);
  };

  const active = items.find((i) => i.id === selected);
  const hasPanels = items.some((i) => i.content !== undefined);

  return (
    <div className="cm-tabs-root">
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        className={cn('cm-tabs', variant === 'underline' && 'cm-tabs--underline', variant === 'expand' && 'cm-tabs--expand', className)}
      >
        <span className="cm-tabs__indicator" aria-hidden="true" />
        {items.map((item) => {
          const isSelected = item.id === selected;
          return (
            <button
              key={item.id}
              ref={(el) => {
                if (el) tabRefs.current.set(item.id, el);
                else tabRefs.current.delete(item.id);
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${item.id}`}
              aria-selected={isSelected}
              aria-controls={hasPanels ? `${uid}-panel-${item.id}` : undefined}
              aria-label={variant === 'expand' ? item.label : undefined}
              title={variant === 'expand' ? item.label : undefined}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              className="cm-tabs__tab"
              onClick={() => setSelected(item.id)}
              onKeyDown={(e) => onKeyDown(e, item.id)}
            >
              {item.icon}
              <span className="cm-tabs__label" aria-hidden={variant === 'expand' ? true : undefined}>
                <span>{item.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {hasPanels && active && (
        <div
          key={active.id}
          role="tabpanel"
          id={`${uid}-panel-${active.id}`}
          aria-labelledby={`${uid}-tab-${active.id}`}
          tabIndex={0}
          className={cn('cm-tabs__panel', panelClassName)}
        >
          {active.content}
        </div>
      )}
    </div>
  );
};
