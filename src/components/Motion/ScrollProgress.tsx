import React from 'react';
import { createScrollScene } from '../../motion/scroll';
import { scrollToTarget } from '../../motion/smooth-scroll';
import { motion } from '../../tokens/motion';
import { cn } from '../../utils/cn';

/**
 * Barra de progresso de leitura (2px, acento) fixa abaixo do cabeçalho — LP.
 * Some com movimento reduzido. Decorativa: aria-hidden.
 */
export const ScrollProgress: React.FC<{ className?: string }> = ({ className }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const scene = createScrollScene(document.documentElement, {
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (p) => el.style.setProperty('--cm-progress', p.toFixed(4)),
    });
    return () => scene.destroy();
  }, []);
  return (
    <div ref={ref} className={cn('cm-progress', className)} aria-hidden="true">
      <i className="cm-progress__fill" />
    </div>
  );
};

export interface SceneNavItem {
  /** id da <section> */
  id: string;
  label: string;
}

/**
 * Navegação lateral por cenas — LP. A cena ativa é a última cujo topo passou da linha
 * de leitura (40% da viewport); o ponto alonga de 4px para 18px e recebe
 * aria-current="location". Geometria medida só no refresh.
 */
export const SceneNav: React.FC<{ scenes: SceneNavItem[]; label?: string; className?: string; onSceneChange?: (id: string) => void }> = ({
  scenes,
  label = 'Cenas da página',
  className,
  onSceneChange,
}) => {
  const [active, setActive] = React.useState(-1);
  const onChange = React.useRef(onSceneChange);
  onChange.current = onSceneChange;
  const key = scenes.map((s) => s.id).join('|');

  React.useEffect(() => {
    let offsets: number[] = [];
    let current = -1;
    const measure = () => {
      offsets = scenes.map((s) => {
        const el = document.getElementById(s.id);
        return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
      });
    };
    measure();
    const scene = createScrollScene(document.documentElement, {
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: () => {
        const line = window.scrollY + window.innerHeight * motion.cinematic.sceneNav.readingLine;
        let index = 0;
        offsets.forEach((o, i) => {
          if (line >= o) index = i;
        });
        if (index !== current) {
          current = index;
          setActive(index);
          onChange.current?.(scenes[index]?.id);
        }
      },
    });
    const remeasure = () => requestAnimationFrame(measure);
    window.addEventListener('resize', remeasure);
    document.fonts?.ready.then(remeasure).catch(() => {});
    return () => {
      scene.destroy();
      window.removeEventListener('resize', remeasure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <nav className={cn('cm-scene-nav', className)} aria-label={label}>
      {scenes.map((s, i) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="cm-scene-dot"
          aria-current={i === active ? 'location' : undefined}
          onClick={(e) => {
            const el = document.getElementById(s.id);
            if (!el) return;
            e.preventDefault();
            scrollToTarget(el);
          }}
        >
          <i aria-hidden="true" />
          <span className="cm-scene-name">{s.label}</span>
        </a>
      ))}
    </nav>
  );
};
