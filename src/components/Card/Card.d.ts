import React from 'react';
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'dark' | 'light' | 'accent' | 'outline';
    halftone?: boolean;
    interactive?: boolean;
    accentColor?: 'caramel' | 'sky' | 'pink' | 'violet' | 'yellow';
}
export declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=Card.d.ts.map