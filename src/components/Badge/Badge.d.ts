import React from 'react';
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    color?: 'caramel' | 'sky' | 'pink' | 'violet' | 'yellow' | 'ink' | 'cream';
    variant?: 'solid' | 'outline';
    size?: 'sm' | 'md';
}
export declare const Badge: React.FC<BadgeProps>;
//# sourceMappingURL=Badge.d.ts.map