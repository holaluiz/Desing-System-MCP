/**
 * Vídeos que tocam só quando vistos — como o portfólio do LP:
 *  - no máximo 2 decodificando ao mesmo tempo (os mais visíveis vencem);
 *  - pausa tudo com a aba oculta;
 *  - com movimento reduzido não há autoplay (fica o pôster; o controle é do usuário).
 */

import { motion } from '../tokens/motion';
import { isBrowser, readMotionEnv } from './env';

const ratios = new Map<HTMLVideoElement, number>();
let observer: IntersectionObserver | null = null;
let hiddenListener = false;

function update() {
  const max = motion.cinematic.media.maxDecoders;
  const allow = readMotionEnv().full && !document.hidden;
  const chosen = new Set(
    allow
      ? [...ratios.entries()]
          .filter(([, r]) => r >= 0.25)
          .sort((a, b) => b[1] - a[1])
          .slice(0, max)
          .map(([v]) => v)
      : []
  );
  ratios.forEach((_, video) => {
    if (chosen.has(video)) {
      if (video.paused && video.dataset.cmUserPaused !== 'true') {
        video.muted = true;
        video.play().catch(() => {});
      }
    } else if (!video.paused) video.pause();
  });
}

export function observeVideo(video: HTMLVideoElement): () => void {
  if (!isBrowser || typeof IntersectionObserver === 'undefined') return () => {};
  observer ??= new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => ratios.set(e.target as HTMLVideoElement, e.isIntersecting ? e.intersectionRatio : 0));
      update();
    },
    { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
  );
  if (!hiddenListener) {
    hiddenListener = true;
    document.addEventListener('visibilitychange', update);
  }
  video.muted = true;
  video.playsInline = true;
  ratios.set(video, 0);
  observer.observe(video);
  return () => {
    observer?.unobserve(video);
    ratios.delete(video);
    video.pause();
  };
}
