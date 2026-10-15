import React from 'react';
import { cn } from '../../utils/cn';

/** Atalho de teclado — voz técnica (mono) */
export const Kbd: React.FC<React.HTMLAttributes<HTMLElement>> = ({ className, ...props }) => (
  <kbd className={cn('cm-kbd', className)} {...props} />
);

/** Chip de metadado mono (ex.: "React", "Hover", "CSS") */
export const Chip: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, ...props }) => (
  <span className={cn('cm-chip', className)} {...props} />
);
