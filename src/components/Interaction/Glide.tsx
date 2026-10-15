import React from 'react';
import { cn } from '../../utils/cn';

type GlideCtx = { show: (el: HTMLElement) => void; hide: () => void };
const GlideContext = React.createContext<GlideCtx | null>(null);

export interface GlideGroupProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'div' | 'nav' | 'section';
  /** Raio do destaque (ex.: "12px") — padrão --cm-radius-lg */
  radius?: string;
}

type Rect = { x: number; y: number; w: number; h: number };

/**
 * Destaque Deslizante em Grupo — microinteração `glide-highlight`.
 * Um único fundo de hover desliza entre os <GlideItem>, seguindo mouse e teclado.
 */
export const GlideGroup: React.FC<GlideGroupProps> = ({ as = 'div', radius, className, style, children, onPointerLeave, onBlur, ...props }) => {
  const ref = React.useRef<HTMLElement>(null);
  const [rect, setRect] = React.useState<Rect | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [instant, setInstant] = React.useState(true);

  const show = React.useCallback(
    (el: HTMLElement) => {
      const root = ref.current;
      if (!root) return;
      const r = el.getBoundingClientRect();
      const c = root.getBoundingClientRect();
      setRect({ x: r.left - c.left - root.clientLeft, y: r.top - c.top - root.clientTop, w: r.width, h: r.height });
      // Primeira aparição: posiciona sem deslizar a partir de um lugar antigo
      setInstant(!visible);
      setVisible(true);
    },
    [visible]
  );

  const hide = React.useCallback(() => {
    setVisible(false);
    setInstant(true);
  }, []);

  const ctx = React.useMemo(() => ({ show, hide }), [show, hide]);

  return React.createElement(
    as,
    {
      ref,
      className: cn('cm-glide', className),
      style: { ...(radius ? { '--cm-glide-radius': radius } : null), ...style } as React.CSSProperties,
      onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
        onPointerLeave?.(e);
        if (!ref.current?.contains(document.activeElement)) hide();
      },
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        onBlur?.(e);
        if (!ref.current?.contains(e.relatedTarget as Node)) hide();
      },
      ...props,
    },
    <span
      className="cm-glide__highlight"
      aria-hidden="true"
      data-visible={visible ? '' : undefined}
      data-instant={instant ? '' : undefined}
      style={
        rect
          ? ({ '--cm-gl-x': `${rect.x}px`, '--cm-gl-y': `${rect.y}px`, '--cm-gl-w': `${rect.w}px`, '--cm-gl-h': `${rect.h}px` } as React.CSSProperties)
          : undefined
      }
    />,
    <GlideContext.Provider value={ctx}>{children}</GlideContext.Provider>
  );
};

export interface GlideItemProps extends React.AllHTMLAttributes<HTMLElement> {
  as?: 'button' | 'a' | 'div' | 'li';
}

export const GlideItem: React.FC<GlideItemProps> = ({ as = 'button', className, onPointerEnter, onFocus, children, ...props }) => {
  const ctx = React.useContext(GlideContext);
  return React.createElement(
    as,
    {
      className: cn('cm-glide__item', className),
      ...(as === 'button' && props.type === undefined ? { type: 'button' } : null),
      onPointerEnter: (e: React.PointerEvent<HTMLElement>) => {
        onPointerEnter?.(e);
        ctx?.show(e.currentTarget);
      },
      onFocus: (e: React.FocusEvent<HTMLElement>) => {
        onFocus?.(e);
        ctx?.show(e.currentTarget);
      },
      ...props,
    },
    children
  );
};
