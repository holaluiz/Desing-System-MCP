import React from 'react';
import { cn } from '../../utils/cn';
import { IconChevronLeft, IconChevronRight } from './icons';
import { useIsomorphicLayoutEffect } from './hooks';

export interface GlideMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Atalho exibido em <kbd> (ex.: "⌘D") */
  shortcut?: string;
  /** Submenu — desliza com desfoque ao entrar */
  items?: GlideMenuItem[];
  onSelect?: () => void;
  tone?: 'danger';
  disabled?: boolean;
  /** Linha divisória antes deste item */
  separator?: boolean;
}

export interface GlideMenuProps {
  /** Conteúdo do botão gatilho */
  trigger: React.ReactNode;
  items: GlideMenuItem[];
  /** Rótulo acessível do menu raiz (padrão: texto do gatilho) */
  label?: string;
  align?: 'start' | 'end';
  triggerClassName?: string;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

type Level = { title: string; items: GlideMenuItem[] };
type Anim = 'in-fwd' | 'in-back' | undefined;

const CLOSE_MS = 180;
const LEAVE_MS = 260;

/**
 * Menu com Deslize e Desfoque — microinteração `blur-glide-menu`.
 * ↑↓ navegam · → ou Enter entram no submenu · ← volta · Esc fecha e devolve o foco.
 */
export const GlideMenu: React.FC<GlideMenuProps> = ({
  trigger,
  items,
  label,
  align = 'start',
  triggerClassName,
  className,
  onOpenChange,
}) => {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const rootTitle = label ?? (typeof trigger === 'string' ? trigger : 'Menu');
  const [state, setState] = React.useState<'closed' | 'open' | 'closing'>('closed');
  const [stack, setStack] = React.useState<Level[]>([{ title: rootTitle, items }]);
  const [anim, setAnim] = React.useState<Anim>(undefined);
  const [leaving, setLeaving] = React.useState<{ level: Level; anim: 'out-fwd' | 'out-back'; depth: number } | null>(null);
  const [active, setActive] = React.useState(0);
  const [height, setHeight] = React.useState<number | undefined>(undefined);
  const [hl, setHl] = React.useState<{ y: number; h: number } | null>(null);

  const level = stack[stack.length - 1];
  const depth = stack.length - 1;
  const isOpen = state === 'open';

  const setOpen = React.useCallback(
    (open: boolean, restoreFocus = true) => {
      if (open) {
        setStack([{ title: rootTitle, items }]);
        setAnim(undefined);
        setLeaving(null);
        setActive(0);
        setState('open');
        onOpenChange?.(true);
      } else {
        setState((s) => (s === 'closed' ? s : 'closing'));
        onOpenChange?.(false);
        if (restoreFocus) triggerRef.current?.focus();
      }
    },
    [items, rootTitle, onOpenChange]
  );

  // Desmonta após a animação de saída
  React.useEffect(() => {
    if (state !== 'closing') return;
    const t = window.setTimeout(() => setState('closed'), CLOSE_MS);
    return () => window.clearTimeout(t);
  }, [state]);

  React.useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setLeaving(null), LEAVE_MS);
    return () => window.clearTimeout(t);
  }, [leaving]);

  // Fecha ao clicar fora
  React.useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false, false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [isOpen, setOpen]);

  // Altura animada entre painéis + foco no item ativo
  useIsomorphicLayoutEffect(() => {
    if (!isOpen) return;
    if (panelRef.current) setHeight(panelRef.current.offsetHeight);
  }, [isOpen, stack]);

  React.useEffect(() => {
    if (!isOpen) return;
    itemRefs.current[active]?.focus({ preventScroll: true });
  }, [isOpen, stack, active]);

  // Posição do destaque compartilhado
  useIsomorphicLayoutEffect(() => {
    const el = itemRefs.current[active];
    if (!isOpen || !el) {
      setHl(null);
      return;
    }
    setHl({ y: el.offsetTop, h: el.offsetHeight });
  }, [isOpen, stack, active]);

  const enter = (item: GlideMenuItem) => {
    if (!item.items) return;
    setLeaving({ level, anim: 'out-fwd', depth });
    setStack((s) => [...s, { title: item.label, items: item.items! }]);
    setAnim('in-fwd');
    setActive(0);
  };

  const back = () => {
    if (depth === 0) return;
    const parent = stack[stack.length - 2];
    const fromId = stack[stack.length - 1].title;
    setLeaving({ level, anim: 'out-back', depth });
    setStack((s) => s.slice(0, -1));
    setAnim('in-back');
    setActive(Math.max(0, parent.items.findIndex((i) => i.label === fromId)));
  };

  const select = (item: GlideMenuItem) => {
    if (item.disabled) return;
    if (item.items) return enter(item);
    item.onSelect?.();
    setOpen(false);
  };

  const move = (dir: 1 | -1, from = active) => {
    const list = level.items;
    for (let step = 1; step <= list.length; step++) {
      const i = (from + dir * step + list.length) % list.length;
      if (!list[i].disabled) return setActive(i);
    }
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const item = level.items[active];
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        move(-1);
        break;
      case 'Home':
        e.preventDefault();
        move(1, -1);
        break;
      case 'End':
        e.preventDefault();
        move(-1, level.items.length);
        break;
      case 'ArrowRight':
        if (item?.items) {
          e.preventDefault();
          enter(item);
        }
        break;
      case 'ArrowLeft':
      case 'Backspace':
        if (depth > 0) {
          e.preventDefault();
          back();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false, false);
        break;
    }
  };

  const renderItems = (lvl: Level, interactive: boolean) =>
    lvl.items.map((item, i) => (
      <React.Fragment key={item.id}>
        {item.separator && <div className="cm-menu__sep" role="separator" />}
        <button
          ref={interactive ? (el) => { itemRefs.current[i] = el; } : undefined}
          type="button"
          role="menuitem"
          tabIndex={-1}
          aria-haspopup={item.items ? 'menu' : undefined}
          aria-disabled={item.disabled || undefined}
          data-active={interactive && i === active ? '' : undefined}
          data-tone={item.tone}
          className="cm-menu__item"
          onClick={interactive ? () => select(item) : undefined}
          onPointerMove={interactive && !item.disabled ? () => i !== active && setActive(i) : undefined}
        >
          {item.icon && <span className="cm-menu__icon">{item.icon}</span>}
          <span>{item.label}</span>
          {(item.shortcut || item.items) && (
            <span className="cm-menu__trail">
              {item.shortcut && <kbd className="cm-kbd">{item.shortcut}</kbd>}
              {item.items && <IconChevronRight width={14} height={14} />}
            </span>
          )}
        </button>
      </React.Fragment>
    ));

  const renderHeader = (lvl: Level, d: number, interactive: boolean) =>
    d > 0 ? (
      <div className="cm-menu__header">
        <button
          type="button"
          className="cm-menu__back"
          aria-label={`Voltar para ${stack[Math.max(0, d - 1)]?.title ?? rootTitle}`}
          tabIndex={-1}
          onClick={interactive ? back : undefined}
        >
          <IconChevronLeft width={14} height={14} />
        </button>
        <span>{lvl.title}</span>
      </div>
    ) : null;

  return (
    <div ref={rootRef} className={cn('cm-menu-root', className)}>
      <button
        ref={triggerRef}
        type="button"
        className={cn('cm-btn cm-btn--sm', triggerClassName)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={state !== 'closed' ? `${uid}-menu` : undefined}
        onClick={() => setOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !isOpen) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="cm-btn__label">
          {trigger}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {state !== 'closed' && (
        <div
          id={`${uid}-menu`}
          className={cn('cm-menu', align === 'end' && 'cm-menu--end')}
          data-state={state === 'open' ? 'open' : 'closed'}
          onKeyDown={onMenuKeyDown}
        >
          <div ref={viewportRef} className="cm-menu__viewport" style={{ height }}>
            {leaving && (
              <div className="cm-menu__panel" data-leaving="" data-anim={leaving.anim} aria-hidden="true">
                {renderHeader(leaving.level, leaving.depth, false)}
                {renderItems(leaving.level, false)}
              </div>
            )}
            <div
              ref={panelRef}
              key={`${depth}-${level.title}`}
              className="cm-menu__panel"
              data-anim={anim}
              role="menu"
              aria-label={level.title}
              aria-orientation="vertical"
            >
              {renderHeader(level, depth, true)}
              <span
                className="cm-menu__highlight"
                aria-hidden="true"
                data-visible={hl ? '' : undefined}
                style={hl ? ({ '--cm-hl-y': `${hl.y}px`, '--cm-hl-h': `${hl.h}px` } as React.CSSProperties) : undefined}
              />
              {renderItems(level, true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
