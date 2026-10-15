import React from 'react';
import { cn } from '../../utils/cn';
import { mergeRefs, usePointerVars } from './hooks';

type SurfaceElement = 'div' | 'section' | 'article' | 'aside' | 'li' | 'a' | 'button';

export interface SurfaceProps extends React.AllHTMLAttributes<HTMLElement> {
  as?: SurfaceElement;
  /** 1 = card · 2 = elevado · 3 = destaque · sunken = afundado no palco */
  level?: 1 | 2 | 3 | 'sunken';
  /** Holofote que segue o cursor + borda que acende (microinteração `spotlight-surface`) */
  spotlight?: boolean;
  /** Halo do acento — reservado ao card de destaque da cena (ex.: plano recomendado) */
  glow?: boolean;
  /** Sobe 2px no hover e afunda no clique */
  interactive?: boolean;
}

/** Superfície do material Lumen: aresta de luz, hairline de 1px, raio concêntrico. */
export const Surface = React.forwardRef<HTMLElement, SurfaceProps>(function Surface(
  { as = 'div', level = 1, spotlight = false, glow = false, interactive = false, className, children, ...props },
  forwardedRef
) {
  const ref = React.useRef<HTMLElement>(null);
  usePointerVars(ref, spotlight);

  return React.createElement(
    as,
    {
      ref: mergeRefs(ref, forwardedRef),
      className: cn(
        'cm-surface',
        level === 2 && 'cm-surface--2',
        level === 3 && 'cm-surface--3',
        level === 'sunken' && 'cm-surface--sunken',
        spotlight && 'cm-surface--spotlight',
        glow && 'cm-surface--glow',
        interactive && 'cm-surface--interactive',
        className
      ),
      ...(as === 'button' && props.type === undefined ? { type: 'button' } : null),
      ...props,
    },
    children
  );
});
