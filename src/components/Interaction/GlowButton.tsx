import React from 'react';
import { cn } from '../../utils/cn';
import { mergeRefs, usePointerVars } from './hooks';

export interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** cream = pill clara com glow (assinatura) · ink = pill escura */
  tone?: 'cream' | 'ink';
  icon?: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
}

/**
 * Brilho de Borda que Segue o Cursor — microinteração `edge-glow`.
 * A luz do acento percorre a borda no ponto mais próximo do ponteiro.
 * Um por cena, sempre sobre fundo escuro.
 */
export const GlowButton = React.forwardRef<HTMLElement, GlowButtonProps>(function GlowButton(
  { tone = 'cream', icon, href, target, rel, type, className, children, ...props },
  forwardedRef
) {
  const ref = React.useRef<HTMLElement>(null);
  usePointerVars(ref);

  const classes = cn('cm-glow-btn', tone === 'ink' && 'cm-glow-btn--ink', className);
  const content = (
    <>
      {children}
      {icon && (
        <span className="cm-arrow" aria-hidden="true">
          {icon}
        </span>
      )}
    </>
  );

  if (href !== undefined) {
    return (
      <a
        ref={mergeRefs(ref, forwardedRef) as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={target === '_blank' ? rel ?? 'noopener noreferrer' : rel}
        className={classes}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button ref={mergeRefs(ref, forwardedRef) as React.Ref<HTMLButtonElement>} type={type ?? 'button'} className={classes} {...props}>
      {content}
    </button>
  );
});
