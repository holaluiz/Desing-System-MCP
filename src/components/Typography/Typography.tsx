import React from 'react';
import { cn } from '../../utils/cn';

/**
 * 1. VOZ PRINCIPAL — Grotesca Pesada (Display / Editorial)
 * Larga, pesada, impactante. Usada em títulos, números e chamadas.
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
    xl: 'text-4xl md:text-6xl lg:text-7xl leading-[0.92] tracking-[-0.035em]',
    lg: 'text-3xl md:text-5xl leading-[0.96] tracking-[-0.03em]',
    md: 'text-2xl md:text-3xl leading-[1.05] tracking-[-0.02em]',
  }[size];

  return (
    <Component
      className={cn(
        'font-display font-black font-extrabold',
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
 * 2. VOZ SECUNDÁRIA — Sans Funcional (Interface / Corpo)
 * Limpa, regular/medium. Leitura confortável para textos e navegação.
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
 * 3. VOZ MANUSCRITA — Intervenção Humana (Anotações, rabiscos, pensamentos)
 * REGRA CANÔNICA: NUNCA usar em parágrafos longos, menus, preços ou botões.
 */
export interface HandwrittenNoteProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'caramel' | 'sky' | 'pink' | 'yellow' | 'cream';
  rotate?: '-2' | '-1' | '0' | '1' | '2';
}

export const HandwrittenNote: React.FC<HandwrittenNoteProps> = ({
  color = 'caramel',
  rotate = '-1',
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
    '-2': '-rotate-2',
    '-1': '-rotate-1',
    '0': 'rotate-0',
    '1': 'rotate-1',
    '2': 'rotate-2',
  }[rotate];

  return (
    <span
      className={cn(
        'font-handwriting inline-block text-xl md:text-2xl font-bold select-none',
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
        'font-sans text-[0.6875rem] font-black uppercase tracking-[0.09em] inline-flex items-center gap-1.5',
        colorStyles,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
