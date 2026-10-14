import React from 'react';
import { cn } from '../../utils/cn';

export interface LayerSplitProps extends React.HTMLAttributes<HTMLDivElement> {
  accentColor?: 'caramel' | 'sky' | 'pink' | 'violet' | 'yellow';
}

export const LayerSplit: React.FC<LayerSplitProps> = ({
  accentColor = 'caramel',
  className,
  children,
  ...props
}) => {
  const accentBg = {
    caramel: 'bg-[#FF701A]',
    sky: 'bg-[#25BFFF]',
    pink: 'bg-[#FF3D8D]',
    violet: 'bg-[#7657FF]',
    yellow: 'bg-[#FFD52A]',
  }[accentColor];

  return (
    <div
      className={cn(
        'group relative transition-transform duration-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {/* Sombra de fundo que se revela no movimento */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-200',
          accentBg,
          'translate-x-0 translate-y-0 group-hover:translate-x-2 group-hover:translate-y-2'
        )}
      />
      {/* Camada superior que se desloca */}
      <div
        className={cn(
          'relative z-10 bg-[#1F1F26] border-2 border-[#FFF4E8] p-5 text-[#FFF4E8]',
          'transition-all duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1'
        )}
      >
        {children}
      </div>
    </div>
  );
};
