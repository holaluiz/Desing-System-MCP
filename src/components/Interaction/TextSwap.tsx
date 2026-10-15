import React from 'react';
import { cn } from '../../utils/cn';

export interface TextSwapProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  /** Cada letra entra com 18ms de atraso (use em palavras curtas, até ~14 caracteres) */
  stagger?: boolean;
}

/**
 * Troca de Texto Vertical — o rótulo "vira a página" no hover do elemento pai
 * (a, button ou .cm-swap-host) sem alterar a largura. Leitores de tela leem o texto uma vez.
 */
export const TextSwap: React.FC<TextSwapProps> = ({ text, stagger = false, className, ...props }) => {
  const renderCopy = () =>
    stagger
      ? Array.from(text).map((ch, i) => (
          <span key={i} className="cm-swap__ch" style={{ '--i': i } as React.CSSProperties}>
            {ch}
          </span>
        ))
      : text;

  return (
    <span className={cn('cm-swap', stagger && 'cm-swap--stagger', className)} {...props}>
      <span className="cm-sr-only">{text}</span>
      <span className="cm-swap__a" aria-hidden="true">
        {renderCopy()}
      </span>
      <span className="cm-swap__b" aria-hidden="true">
        {renderCopy()}
      </span>
    </span>
  );
};
