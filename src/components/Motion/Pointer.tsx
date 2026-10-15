import React from 'react';
import { createPointerTrail, createTilt } from '../../motion/pointer';
import { motion } from '../../tokens/motion';
import { cn } from '../../utils/cn';
import { resolveTrailStickers } from '../../brand/stickers';
import { useMotionEnv } from './hooks';

export interface PointerTrailProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'header' | 'footer';
  /** Imagens (URLs) ou cartões (nós React) que surgem atrás do cursor, em rodízio */
  items?: Array<string | React.ReactNode>;
  /** Caminho público das figurinhas canônicas (copie os assets do pacote). */
  assetBasePath?: string;
  appearance?: 'stickers' | 'cards';
  /** Pool finito; por padrão inclui o conjunto completo de figurinhas. */
  pool?: number;
  /** Proporção do cartão (padrão 16/10) */
  aspect?: number;
}

/**
 * Rastro das figurinhas canônicas — `pointer-trail` (hero, contato e rodapé).
 * Surgem a cada 64px/85ms, giram alternando o lado e caem em 1.1s.
 * Nunca cobrem CTAs, nunca viram alvo de clique, somem ao rolar/clicar/focar.
 * Só existe com mouse e movimento completo — em touch é apenas o conteúdo.
 */
export const PointerTrail: React.FC<PointerTrailProps> = ({
  as = 'div',
  items,
  assetBasePath = '/caramelo/stickers',
  appearance = items ? 'cards' : 'stickers',
  pool,
  aspect,
  className,
  children,
  ...props
}) => {
  const trailItems = items ?? resolveTrailStickers(assetBasePath);
  const slotCount = pool ?? Math.max(motion.cinematic.pointerTrail.pool, trailItems.length);
  const ratio = aspect ?? (appearance === 'stickers' ? 1 : 16 / 10);
  const env = useMotionEnv();
  const enabled = env.fine && env.full;
  const containerRef = React.useRef<HTMLElement>(null);
  const layerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    const layer = layerRef.current;
    if (!container || !layer || !enabled) return;
    return createPointerTrail({ container, layer, slots: Array.from(layer.children) as HTMLElement[], aspect: ratio });
  }, [trailItems.length, slotCount, ratio, enabled]);

  return React.createElement(
    as,
    { ref: containerRef, className: cn('cm-trail', appearance === 'stickers' && 'cm-trail--stickers', className), ...props },
    children,
    <div ref={layerRef} className="cm-trail__layer" aria-hidden="true" key="cm-trail-layer">
      {enabled && Array.from({ length: slotCount }, (_, i) => {
        const item = trailItems[i % Math.max(1, trailItems.length)];
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
