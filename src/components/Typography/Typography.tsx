import React from 'react';
import { cn } from '../../utils/cn';

/**
 * 1. VOZ PRINCIPAL — Montserrat 900 (Display / Editorial)
 * Massa de cartaz: entrelinha compacta e tracking negativo forte (escala do LP).
 */
export interface DisplayHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  size?: 'xl' | 'lg' | 'md';
  uppercase?: boolean;
}

export const DisplayHeading: React.FC<DisplayHeadingProps> = ({
  as: Component = 'h1',
  size = 'lg',
  uppercase = true,
  className,
  children,
  ...props
}) => {
  const sizeStyles = {
    xl: 'text-cm-display',
    lg: 'text-cm-display-sm',
    md: 'text-cm-title',
  }[size];

  return (
    <Component
      className={cn(
        'font-display font-black text-balance',
        uppercase && 'uppercase',
        sizeStyles,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * 2. VOZ DE TEXTO — Inter (Interface / Corpo)
 * Leitura confortável para textos, navegação e controles.
 */
export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: 'p' | 'span' | 'div';
  size?: 'sm' | 'base' | 'lg';
  variant?: 'primary' | 'muted';
}

export const Text: React.FC<TextProps> = ({
  as: Component = 'p',
  size = 'base',
  variant = 'primary',
  className,
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed',
  }[size];

  const variantStyles = {
    primary: 'text-inherit opacity-90',
    muted: 'text-inherit opacity-65',
  }[variant];

  return (
    <Component
      className={cn('font-sans font-normal', sizeStyles, variantStyles, className)}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * 3. VOZ MANUSCRITA — Covered By Your Grace (anotações, rabiscos, pensamentos)
 * Peso único (400) e sempre levemente girada. NUNCA em parágrafos longos, menus, preços ou botões.
 */
export interface HandwrittenNoteProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'caramel' | 'sky' | 'pink' | 'yellow' | 'cream';
  rotate?: '-4' | '-3' | '-2' | '-1' | '0' | '1' | '2' | '5' | '8';
}

export const HandwrittenNote: React.FC<HandwrittenNoteProps> = ({
  color = 'caramel',
  rotate = '-3',
  className,
  children,
  ...props
}) => {
  const colorStyles = {
    caramel: 'text-[#FF701A]',
    sky: 'text-[#25BFFF]',
    pink: 'text-[#FF3D8D]',
    yellow: 'text-[#FFD52A]',
    cream: 'text-[#FFF4E8]',
  }[color];

  const rotateStyles = {
    '-4': '-rotate-[4deg]',
    '-3': '-rotate-3',
    '-2': '-rotate-2',
    '-1': '-rotate-1',
    '0': 'rotate-0',
    '1': 'rotate-1',
    '2': 'rotate-2',
    '5': 'rotate-[5deg]',
    '8': 'rotate-[8deg]',
  }[rotate];

  return (
    <span
      className={cn(
        'font-handwriting inline-block text-cm-hand font-normal select-none',
        colorStyles,
        rotateStyles,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

/**
 * Eyebrow / Label Técnico
 * Caixa alta pontual com tracking expandido para categorias e status.
 */
export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'caramel' | 'sky' | 'pink' | 'violet' | 'yellow' | 'muted';
}

export const Eyebrow: React.FC<EyebrowProps> = ({
  color = 'caramel',
  className,
  children,
  ...props
}) => {
  const colorStyles = {
    caramel: 'text-[#FF701A]',
    sky: 'text-[#25BFFF]',
    pink: 'text-[#FF3D8D]',
    violet: 'text-[#7657FF]',
    yellow: 'text-[#FFD52A]',
    muted: 'opacity-60',
  }[color];

  return (
    <span
      className={cn(
        'font-sans text-cm-meta uppercase inline-flex items-center gap-1.5',
        colorStyles,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
