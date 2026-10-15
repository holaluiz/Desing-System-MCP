import React from 'react';
import { Wordmark } from '../Wordmark';
import { Isotype } from '../Isotype';
import { cn } from '../../utils/cn';

export interface LockupProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'institucional' | 'explicativo' | 'autoral' | 'bio';
  variant?: 'cream' | 'ink';
  size?: 'sm' | 'md' | 'lg';
  withIsotype?: boolean;
}

export const Lockup: React.FC<LockupProps> = ({
  type = 'institucional',
  variant = 'cream',
  size = 'md',
  withIsotype = true,
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
        <span className="cm-brand-badge self-start px-1.5 py-0.5 font-sans text-xs font-semibold">
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
    <div className={cn('inline-flex items-center gap-3 select-none', className)} {...props}>
      {withIsotype && <Isotype variant={isLight ? 'ink' : 'spectrum'} size={{ sm: 44, md: 60, lg: 80 }[size]} decorative />}
      <div className="flex min-w-0 flex-col gap-1.5">
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
    </div>
  );
};
