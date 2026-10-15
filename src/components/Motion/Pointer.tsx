import React from 'react';
import { createPointerTrail, createTilt } from '../../motion/pointer';
import { motion } from '../../tokens/motion';
import { cn } from '../../utils/cn';

export interface PointerTrailProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'header' | 'footer';
  /** Imagens (URLs) ou cartões (nós React) que surgem atrás do cursor, em rodízio */
  items: Array<string | React.ReactNode>;
  /** Tamanho do pool (LP: 8) */
  pool?: number;
  /** Proporção do cartão (padrão 16/10) */
  aspect?: number;
}

/**
 * Rastro de imagens do mouse — `pointer-trail` (LP: hero, contato e rodapé).
 * Cartões surgem a cada 64px/85ms, giram alternando o lado e caem em 1.1s.
 * Nunca cobrem CTAs, nunca viram alvo de clique, somem ao rolar/clicar/focar.
 * Só existe com mouse e movimento completo — em touch é apenas o conteúdo.
 */
export const PointerTrail: React.FC<PointerTrailProps> = ({
  as = 'div',
  items,
  pool = motion.cinematic.pointerTrail.pool,
  aspect,
  className,
  children,
  ...props
}) => {
  const containerRef = React.useRef<HTMLElement>(null);
  const layerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    const layer = layerRef.current;
    if (!container || !layer) return;
    return createPointerTrail({ container, layer, slots: Array.from(layer.children) as HTMLElement[], aspect });
  }, [items.length, pool, aspect]);

  return React.createElement(
    as,
    { ref: containerRef, className: cn('cm-trail', className), ...props },
    children,
    <div ref={layerRef} className="cm-trail__layer" aria-hidden="true" key="cm-trail-layer">
      {Array.from({ length: pool }, (_, i) => {
        const item = items[i % Math.max(1, items.length)];
        return (
          <div key={i} className="cm-trail__slot" data-active="false">
            {typeof item === 'string' ? <img src={item} alt="" draggable={false} decoding="async" /> : item}
          </div>
        );
      })}
    </div>
  );
};

export interface TiltSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Graus máximos (LP Maker: 3.5; hero do workshop: 2 × 3) */
  max?: number;
  maxX?: number;
  maxY?: number;
  /** Perspectiva em px */
  perspective?: number;
}

/**
 * Cartaz que inclina com o ponteiro — `pointer-tilt` (LP).
 * O espaço externo recebe o ponteiro; só a superfície interna gira (uma dona de transform).
 * Controles dentro dele não disparam o tilt; reseta ao sair, rolar ou trocar de janela.
 */
export const TiltSurface: React.FC<TiltSurfaceProps> = ({ max, maxX, maxY, perspective, className, style, children, ...props }) => {
  const outer = React.useRef<HTMLDivElement>(null);
  const inner = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!outer.current || !inner.current) return;
    return createTilt(outer.current, { max, maxX, maxY, target: inner.current });
  }, [max, maxX, maxY]);
  return (
    <div
      ref={outer}
      className="cm-tilt-space"
      style={perspective ? ({ '--cm-tilt-perspective': `${perspective}px` } as React.CSSProperties) : undefined}
    >
      <div ref={inner} className={cn('cm-tilt', className)} style={style} {...props}>
        {children}
      </div>
    </div>
  );
};
