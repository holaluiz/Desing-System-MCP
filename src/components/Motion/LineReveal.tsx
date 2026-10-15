import React from 'react';
import { cn } from '../../utils/cn';
import { useReveal } from './hooks';

export interface LineRevealProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'span';
  /** scroll = ao entrar na viewport (padrão) · load = ao montar (títulos da hero) */
  trigger?: 'scroll' | 'load';
  /** Atraso extra em ms (somado aos 90ms entre linhas) */
  delay?: number;
  /** Linha de disparo (padrão "top 92%") */
  start?: string;
}

function splitOnBreaks(children: React.ReactNode): React.ReactNode[][] {
  const lines: React.ReactNode[][] = [[]];
  React.Children.toArray(children).forEach((child) => {
    if (React.isValidElement(child) && child.type === 'br') lines.push([]);
    else lines[lines.length - 1].push(child);
  });
  return lines;
}

/**
 * Título linha a linha por máscara — microinteração `line-mask-reveal` (LP).
 * Cada linha (separada por <br />) sobe de 105% em 900ms (power4.out), 90ms entre linhas.
 * Sem JS ou com movimento reduzido o texto aparece normal.
 */
export const LineReveal: React.FC<LineRevealProps> = ({ as = 'h2', trigger = 'scroll', delay = 0, start, className, style, children, ...props }) => {
  const ref = React.useRef<HTMLElement>(null);
  useReveal(ref, { trigger, start });
  const lines = splitOnBreaks(children);
  return React.createElement(
    as,
    {
      ref,
      'data-cm-reveal': 'lines',
      className: cn(className),
      style: { ...style, ...(delay ? { '--cm-delay': `${delay}ms` } : null) } as React.CSSProperties,
      ...props,
    },
    lines.map((nodes, i) => (
      <span key={i} className="cm-line">
        <span className="cm-line__inner" style={{ '--cm-line': i } as React.CSSProperties}>
          {nodes}
        </span>
      </span>
    ))
  );
};
