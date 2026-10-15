import React from 'react';
import { cn } from '../../utils/cn';
import { IconCheck } from './icons';
import { mergeRefs, usePrefersReducedMotion } from './hooks';

type NativeProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> &
  Pick<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'>;

export interface FocusFieldProps extends NativeProps {
  /** Rótulo visível — flutua no foco e nunca desaparece (não é placeholder) */
  label: string;
  hint?: string;
  /** Mensagem de erro — ativa aria-invalid e uma tremida curta */
  error?: string;
  /** Mostra o check de sucesso com "pop" */
  valid?: boolean;
  /** Renderiza <textarea> */
  multiline?: boolean;
  containerClassName?: string;
}

/**
 * Campo com Foco Luminoso — microinteração `focus-field`.
 * Rótulo flutuante, borda que acende e traço de luz no topo.
 */
export const FocusField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, FocusFieldProps>(function FocusField(
  { label, hint, error, valid = false, multiline = false, id, className, containerClassName, placeholder, rows, ...props },
  forwardedRef
) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  const hintId = `${fieldId}-hint`;
  const reduced = usePrefersReducedMotion();
  const [shake, setShake] = React.useState(false);
  const localRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (error && !reduced) setShake(true);
  }, [error, reduced]);

  const describedBy = [props['aria-describedby'], error || hint ? hintId : undefined].filter(Boolean).join(' ') || undefined;
  const shared = {
    id: fieldId,
    className: cn('cm-field__input', className),
    placeholder: placeholder ?? ' ',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  };

  return (
    <div className={containerClassName}>
      <div
        className={cn('cm-field', multiline && 'cm-field--area')}
        data-invalid={error ? '' : undefined}
        data-shake={shake ? '' : undefined}
        onAnimationEnd={() => setShake(false)}
      >
        {multiline ? (
          <textarea
            ref={mergeRefs(localRef, forwardedRef) as React.Ref<HTMLTextAreaElement>}
            rows={rows ?? 4}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            {...shared}
          />
        ) : (
          <input ref={mergeRefs(localRef, forwardedRef) as React.Ref<HTMLInputElement>} {...props} {...shared} />
        )}
        <label htmlFor={fieldId} className="cm-field__label">
          {label}
        </label>
        <span className="cm-field__beam" aria-hidden="true" />
        {valid && !error && (
          <span className="cm-field__status" aria-hidden="true">
            <IconCheck />
          </span>
        )}
      </div>
      {(error || hint) && (
        <p id={hintId} className="cm-field__hint" data-tone={error ? 'error' : undefined} role={error ? 'alert' : undefined}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});
