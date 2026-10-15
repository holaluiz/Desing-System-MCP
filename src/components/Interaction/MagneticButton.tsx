import React from 'react';
import { cn } from '../../utils/cn';
import { mergeRefs, useMagnetic } from './hooks';
import { TextSwap } from './TextSwap';

export interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** surface = neutro elevado · accent = CTA principal · cream = invertido · ghost = sem moldura */
  variant?: 'surface' | 'accent' | 'cream' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  /** Preenchimento de baixo para cima no hover/foco (padrão: true) */
  fill?: boolean;
  /** Atração magnética. Número = intensidade (0–1). Padrão: 0.3 */
  magnetic?: boolean | number;
  /** Troca de texto vertical no hover (apenas quando children é string) */
  swap?: boolean;
  /** Ícone à direita — avança 3px no hover */
  icon?: React.ReactNode;
  block?: boolean;
  /** Quando presente, renderiza um <a> */
  href?: string;
  target?: string;
  rel?: string;
}

/**
 * Botão Magnético com Preenchimento — microinteração `magnetic-fill`.
 * Use em UM CTA por cena. Ímã desligado em touch e com movimento reduzido.
 */
export const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(function MagneticButton(
  {
    variant = 'surface',
    size = 'md',
    fill = true,
    magnetic = true,
    swap = false,
    icon,
    block = false,
    href,
    target,
    rel,
    type,
    disabled,
    className,
    children,
    ...props
  },
  forwardedRef
) {
  const ref = React.useRef<HTMLElement>(null);
  useMagnetic(ref, {
    strength: typeof magnetic === 'number' ? magnetic : 0.3,
    disabled: magnetic === false || disabled,
  });

  const classes = cn(
    'cm-btn',
    variant !== 'surface' && `cm-btn--${variant}`,
    size !== 'md' && `cm-btn--${size}`,
    fill && 'cm-btn--fill',
    block && 'cm-btn--block',
    className
  );

  const content = (
    <>
      {fill && <span className="cm-btn__fill" aria-hidden="true" />}
      <span className="cm-btn__label">
        {swap && typeof children === 'string' ? <TextSwap text={children} /> : children}
        {icon && (
          <span className="cm-arrow" aria-hidden="true">
            {icon}
          </span>
        )}
      </span>
    </>
  );

  if (href !== undefined) {
    return (
      <a
        ref={mergeRefs(ref, forwardedRef) as React.Ref<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        target={target}
        rel={target === '_blank' ? rel ?? 'noopener noreferrer' : rel}
        aria-disabled={disabled || undefined}
        className={classes}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={mergeRefs(ref, forwardedRef) as React.Ref<HTMLButtonElement>}
      type={type ?? 'button'}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {content}
    </button>
  );
});
