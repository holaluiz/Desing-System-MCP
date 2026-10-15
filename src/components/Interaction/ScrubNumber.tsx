import React from 'react';
import { cn } from '../../utils/cn';
import { useControllableState } from './hooks';
import { IconGrip } from './icons';

export interface ScrubNumberProps {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Pixels de arraste por passo (padrão 4) */
  pixelsPerStep?: number;
  unit?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const decimalsOf = (n: number) => (String(n).split('.')[1] ?? '').length;

/**
 * Campo Numérico de Arrastar — microinteração `scrub-number`.
 * Arraste o rótulo na horizontal; nos limites o campo "bate" e recua.
 * Teclado: ↑↓ ±passo · Shift ×10 · Alt ×0.1 · PageUp/PageDown ×10 · Home/End limites.
 */
export const ScrubNumber: React.FC<ScrubNumberProps> = ({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  pixelsPerStep = 4,
  unit,
  disabled = false,
  id,
  className,
}) => {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const labelId = `${inputId}-label`;
  const [current, setCurrent] = useControllableState(value, defaultValue, onValueChange);
  const [draft, setDraft] = React.useState<string | null>(null);
  const [scrubbing, setScrubbing] = React.useState(false);
  const [nudge, setNudge] = React.useState<'min' | 'max' | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const drag = React.useRef<{ x: number; start: number; moved: boolean; bound: 'min' | 'max' | null } | null>(null);

  const decimals = Math.max(decimalsOf(step), decimalsOf(defaultValue));
  const round = (n: number) => Number(n.toFixed(Math.min(decimals + 1, 6)));
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const format = (n: number) => n.toFixed(decimals);

  const commitValue = (next: number, fromDrag = false) => {
    const raw = round(next);
    const clamped = clamp(raw);
    if (raw !== clamped) {
      const bound = raw < min ? 'min' : 'max';
      if (!fromDrag || drag.current?.bound !== bound) setNudge(bound);
      if (drag.current) drag.current.bound = bound;
    } else if (drag.current) {
      drag.current.bound = null;
    }
    if (clamped !== current) setCurrent(clamped);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLLabelElement>) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, start: current, moved: false, bound: null };
    setDraft(null);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLLabelElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 3) return;
    if (!d.moved) {
      d.moved = true;
      setScrubbing(true);
      document.documentElement.style.cursor = 'ew-resize';
    }
    const factor = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
    commitValue(d.start + Math.round(dx / pixelsPerStep) * step * factor, true);
  };

  const endDrag = (e: React.PointerEvent<HTMLLabelElement>) => {
    const d = drag.current;
    if (!d) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    drag.current = null;
    setScrubbing(false);
    document.documentElement.style.cursor = '';
    if (!d.moved) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  };

  const commitDraft = () => {
    if (draft === null) return;
    const parsed = Number(draft.replace(',', '.'));
    if (draft.trim() !== '' && Number.isFinite(parsed)) commitValue(parsed);
    setDraft(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const factor = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
    const base = draft !== null && Number.isFinite(Number(draft.replace(',', '.'))) ? Number(draft.replace(',', '.')) : current;
    let next: number | null = null;
    if (e.key === 'ArrowUp') next = base + step * factor;
    else if (e.key === 'ArrowDown') next = base - step * factor;
    else if (e.key === 'PageUp') next = base + step * 10;
    else if (e.key === 'PageDown') next = base - step * 10;
    else if (e.key === 'Home' && Number.isFinite(min)) next = min;
    else if (e.key === 'End' && Number.isFinite(max)) next = max;
    else if (e.key === 'Enter') {
      commitDraft();
      return;
    } else if (e.key === 'Escape') {
      setDraft(null);
      return;
    }
    if (next === null) return;
    e.preventDefault();
    setDraft(null);
    commitValue(next);
  };

  const progress = Number.isFinite(min) && Number.isFinite(max) && max > min ? (current - min) / (max - min) : 0;

  return (
    <div
      className={cn('cm-scrub', className)}
      data-scrubbing={scrubbing ? '' : undefined}
      data-nudge={nudge ?? undefined}
      onAnimationEnd={() => setNudge(null)}
      style={{ '--cm-scrub-p': progress } as React.CSSProperties}
    >
      <label
        id={labelId}
        htmlFor={inputId}
        className="cm-scrub__handle"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={(e) => e.preventDefault()}
        title="Arraste para ajustar"
      >
        <IconGrip className="cm-scrub__grip" />
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        className="cm-scrub__input"
        type="text"
        inputMode="decimal"
        role="spinbutton"
        aria-labelledby={labelId}
        aria-valuenow={current}
        aria-valuemin={Number.isFinite(min) ? min : undefined}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        aria-valuetext={unit ? `${format(current)} ${unit}` : undefined}
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        value={draft ?? format(current)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitDraft}
        onKeyDown={onKeyDown}
      />
      {unit && (
        <span className="cm-scrub__unit" aria-hidden="true">
          {unit}
        </span>
      )}
      <span className="cm-scrub__track" aria-hidden="true" />
    </div>
  );
};
