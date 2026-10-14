import React from 'react';
import { Wordmark } from '../Wordmark';
import { cn } from '../../utils/cn';

export interface LockupProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'institucional' | 'explicativo' | 'autoral' | 'bio';
  variant?: 'cream' | 'ink';
  size?: 'sm' | 'md' | 'lg';
}

export const Lockup: React.FC<LockupProps> = ({
  type = 'institucional',
  variant = 'cream',
  size = 'md',
  className,
  ...props
}) => {
  const isLight = variant === 'ink';
  const subtitleColor = isLight ? 'text-[#101014]/75' : 'text-[#FFF4E8]/80';

  if (type === 'bio') {
    return (
      <div className={cn('flex flex-col gap-0.5 select-none', className)} {...props}>
        <span className={cn('font-bold text-sm tracking-tight', isLight ? 'text-[#101014]' : 'text-[#FFF4E8]')}>
          Luiz | Head de Interação
        </span>
        <span className="font-sans text-xs text-[#FF701A] font-semibold">
          @umcaracaramelo
        </span>
      </div>
    );
  }

  const taglines = {
    institucional: 'LABORATÓRIO DE INTERAÇÃO',
    explicativo: 'Conteúdo social • Web • Experiências digitais',
    autoral: 'por Luiz, Head de Interação',
  };

  return (
    <div className={cn('inline-flex flex-col gap-1.5 select-none', className)} {...props}>
      <Wordmark variant={variant} size={size} />
      <span
        className={cn(
          'text-[0.65rem] md:text-xs font-bold tracking-[0.08em] uppercase font-sans border-t pt-1 border-current/20',
          subtitleColor
        )}
      >
        {taglines[type]}
      </span>
    </div>
  );
};
