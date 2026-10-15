import React from 'react';
import { headerOffset } from '../../motion/env';
import { createScrollScene, type ScrollScene } from '../../motion/scroll';
import { scrollToTarget } from '../../motion/smooth-scroll';
import { cn } from '../../utils/cn';
import { useMotionEnv } from './hooks';

export interface DeckItem {
  id: string;
  title: React.ReactNode;
  /** Texto curto à direita da legenda (ano, tipo) */
  meta?: React.ReactNode;
  /** Mídia do cartão (vídeo, imagem, composição) */
  media: React.ReactNode;
}

export interface StickyDeckProps {
  items: DeckItem[];
  /** Rótulo do grupo de passos (acessível) */
  label?: string;
  /** Texto antes do contador (ex.: "Projeto") */
  counterLabel?: string;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Pilha de cartões sticky — `sticky-deck` (Work do LP).
 * O scroll dirige UM cartão por vez: o que sai voa para o lado (±72%, −10%) e o próximo
 * sobe do baralho. Contador 01/04, linha do tempo e botões que rolam até cada cartão.
 * Cartões inativos ficam inert/aria-hidden. Em touch, telas baixas ou movimento
 * reduzido vira uma lista normal, inteira e legível.
 */
export const StickyDeck: React.FC<StickyDeckProps> = ({ items, label = 'Escolher projeto', counterLabel = 'Projeto', className }) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const sceneRef = React.useRef<ScrollScene | null>(null);
  const env = useMotionEnv();
  const scrub = env.full && env.fine && env.deck && items.length > 1;
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || !scrub) return;
    let current = -1;
    const scene = createScrollScene(root, {
      start: `top top+=${headerOffset()}`,
      end: 'bottom bottom',
      scrub: 0.35,
      onUpdate: (p) => {
        root.style.setProperty('--cm-deck-progress', p.toFixed(4));
        const index = Math.min(items.length - 1, Math.floor(p * items.length));
        if (index !== current) {
          current = index;
          setActive(index);
        }
      },
    });
    sceneRef.current = scene;
    return () => {
      scene.destroy();
      sceneRef.current = null;
      root.style.removeProperty('--cm-deck-progress');
    };
  }, [scrub, items.length]);

  const goTo = (index: number) => {
    const s = sceneRef.current;
    if (!s) return;
    scrollToTarget(s.startScroll + (s.endScroll - s.startScroll) * ((index + 0.5) / items.length), { duration: 0.65 });
  };

  return (
    <div
      ref={rootRef}
      className={cn('cm-deck', className)}
      data-mode={scrub ? 'scrub' : 'flow'}
      style={{ '--cm-deck-count': items.length } as React.CSSProperties}
    >
      <div className="cm-deck__stage">
        <div className="cm-deck__toolbar">
          <span className="cm-deck__status" aria-live="polite">
            {counterLabel} <span className="cm-deck__counter">{scrub ? `${pad(active + 1)} / ${pad(items.length)}` : pad(items.length)}</span>
          </span>
          <div className="cm-deck__steps" role="group" aria-label={label}>
            {items.map((item, i) => (
              <button key={item.id} type="button" aria-pressed={i === active} onClick={() => goTo(i)}>
                {pad(i + 1)}
              </button>
            ))}
          </div>
        </div>
        <div className="cm-deck__cards">
          {items.map((item, i) => {
            const state = !scrub ? undefined : i === active ? 'active' : i < active ? 'before' : 'after';
            return (
              <article
                key={item.id}
                className="cm-deck__card"
                data-state={state}
                aria-hidden={scrub && i !== active ? true : undefined}
                inert={scrub && i !== active ? true : undefined}
                style={{ '--cm-z': items.length - i, '--cm-exit-dir': i % 2 ? 1 : -1 } as React.CSSProperties}
              >
                <div className="cm-deck__media">{item.media}</div>
                <div className="cm-deck__caption">
                  <h3 className="cm-type-subtitle">{item.title}</h3>
                  {item.meta && <span className="cm-type-meta">{item.meta}</span>}
                </div>
              </article>
            );
          })}
        </div>
        <div className="cm-deck__timeline" aria-hidden="true">
          <i />
        </div>
      </div>
    </div>
  );
};
