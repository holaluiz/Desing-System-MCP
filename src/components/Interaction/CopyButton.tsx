import React from 'react';
import { cn } from '../../utils/cn';
import { IconCheck, IconCopy } from './icons';
import { TextSwap } from './TextSwap';

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* cai no fallback */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export interface CopyButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
  /** Rótulo visível (ativa a variante com texto). Sem ele, botão só de ícone com aria-label. */
  label?: string;
  copiedLabel?: string;
  /** Tempo até voltar ao estado inicial (ms) */
  timeout?: number;
  onCopied?: (value: string) => void;
}

/**
 * Copiar com Troca de Ícone — microinteração `copy-swap`.
 * O ícone se dissolve em check com "pop"; o leitor de tela ouve "Copiado".
 */
export const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  { value, label, copiedLabel = 'Copiado', timeout = 1600, onCopied, className, onClick, ...props },
  ref
) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    const ok = await writeClipboard(value);
    if (!ok) return;
    setCopied(true);
    onCopied?.(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), timeout);
  };

  const idleLabel = label ?? 'Copiar';

  return (
    <>
      <button
        ref={ref}
        type="button"
        className={cn('cm-copy', label && 'cm-copy--labeled', className)}
        data-copied={copied ? '' : undefined}
        aria-label={label ? undefined : copied ? copiedLabel : idleLabel}
        onClick={handleClick}
        {...props}
      >
        <span className="cm-copy__icons" aria-hidden="true">
          <IconCopy className="cm-copy__icon cm-copy__icon--idle" />
          <IconCheck className="cm-copy__icon cm-copy__icon--done" />
        </span>
        {label && <TextSwap key={copied ? 'done' : 'idle'} text={copied ? copiedLabel : label} />}
      </button>
      <span className="cm-sr-only" role="status" aria-live="polite">
        {copied ? copiedLabel : ''}
      </span>
    </>
  );
});

export interface CommandCopyProps {
  /** Comando único, ou um por gerenciador de pacotes: { npm: '…', pnpm: '…' } */
  command: string | Record<string, string>;
  /** Trecho destacado em negrito (ex.: nome do pacote) */
  highlight?: string;
  defaultManager?: string;
  className?: string;
}

/**
 * Linha de comando com troca de gerenciador e entrada letra a letra.
 * Cada troca reescreve o comando com 7ms entre letras — a mudança é percebida sem piscar.
 */
export const CommandCopy: React.FC<CommandCopyProps> = ({ command, highlight, defaultManager, className }) => {
  const managers = typeof command === 'string' ? null : Object.keys(command);
  const [manager, setManager] = React.useState(defaultManager ?? managers?.[0] ?? '');
  const text = typeof command === 'string' ? command : command[manager] ?? '';

  const hlStart = highlight ? text.indexOf(highlight) : -1;
  const hlEnd = hlStart >= 0 && highlight ? hlStart + highlight.length : -1;
  const chars = Array.from(text);

  return (
    <div className={cn('cm-command', className)}>
      {managers && (
        <div className="cm-command__managers" role="group" aria-label="Gerenciador de pacotes">
          {managers.map((m) => (
            <button key={m} type="button" className="cm-command__pm" aria-pressed={m === manager} onClick={() => setManager(m)}>
              {m}
            </button>
          ))}
        </div>
      )}
      <span className="cm-command__prompt" aria-hidden="true">
        $
      </span>
      <code className="cm-command__text">
        <span className="cm-sr-only">{text}</span>
        <span key={manager} aria-hidden="true">
          {chars.map((ch, i) => {
            const el = (
              <span key={i} className="cm-command__ch" style={{ '--i': i } as React.CSSProperties}>
                {ch}
              </span>
            );
            return i >= hlStart && i < hlEnd ? <b key={i}>{el}</b> : el;
          })}
        </span>
      </code>
      <CopyButton value={text} aria-label={`Copiar comando ${manager}`.trim()} />
    </div>
  );
};
