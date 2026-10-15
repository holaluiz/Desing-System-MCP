import React from 'react';
import { ISOTYPE_DOTS, ISOTYPE_PATHS, ISOTYPE_VIEWBOX } from '../../brand/isotype';
import { brandSpectrum } from '../../tokens/colors';
import { cn } from '../../utils/cn';

export interface IsotypeProps extends Omit<React.SVGProps<SVGSVGElement>, 'title'> {
  variant?: 'spectrum' | 'ink' | 'cream' | 'current';
  size?: number | string;
  title?: string;
  decorative?: boolean;
  interactive?: boolean;
}

/** Canonical crowned C, traced from the supplied artwork. No embedded bitmap. */
export const Isotype = React.forwardRef<SVGSVGElement, IsotypeProps>(function Isotype(
  { variant = 'spectrum', size = 40, title = 'Um Cara Caramelo', decorative = false, interactive = false, className, ...props },
  ref,
) {
  const id = `cm-isotype-${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const fill = variant === 'spectrum' ? `url(#${id}-gradient)` : variant === 'ink' ? '#101014' : variant === 'cream' ? '#FFF4E8' : 'currentColor';
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={ISOTYPE_VIEWBOX}
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-labelledby={decorative ? undefined : `${id}-title`}
      className={cn('cm-isotype', interactive && 'cm-isotype--interactive', className)}
      {...props}
    >
      {!decorative && <title id={`${id}-title`}>{title}</title>}
      <defs>
        <linearGradient id={`${id}-gradient`} x1="0%" y1="15%" x2="100%" y2="85%">
          {brandSpectrum.stops.map((color, i) => <stop key={color} offset={`${[0, 24, 48, 72, 100][i]}%`} stopColor={color} />)}
        </linearGradient>
        <g id={`${id}-shape`}>
          {ISOTYPE_PATHS.map((d, i) => <path key={i} d={d} />)}
          {ISOTYPE_DOTS.map(({ cx, cy, r }, i) => <circle key={i} cx={cx} cy={cy} r={r} />)}
        </g>
      </defs>
      {interactive && <g className="cm-isotype__echo" aria-hidden="true"><use href={`#${id}-shape`} fill={`url(#${id}-gradient)`} /></g>}
      <g className="cm-isotype__ink"><use href={`#${id}-shape`} fill={fill} /></g>
    </svg>
  );
});
