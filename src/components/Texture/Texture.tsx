import React from 'react';
import { cn } from '../../utils/cn';

export interface HalftoneOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: 'subtle' | 'normal' | 'dense';
}

export const HalftoneOverlay: React.FC<HalftoneOverlayProps> = ({
  density = 'subtle',
  className,
  children,
  ...props
}) => {
  const densityClass = {
    subtle: 'caramelo-halftone-subtle',
    normal: 'caramelo-halftone',
    dense: 'caramelo-halftone-dense',
  }[density];

  return (
    <div className={cn('relative', className)} {...props}>
      <div className={cn('absolute inset-0 pointer-events-none z-0', densityClass)} />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export interface MisregistrationTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div';
}

export const MisregistrationText: React.FC<MisregistrationTextProps> = ({
  as: Component = 'span',
  className,
  children,
  ...props
}) => {
  return (
    <Component
      className={cn('caramelo-misregistration inline-block cursor-default select-none', className)}
      {...props}
    >
      {children}
    </Component>
  );
};
