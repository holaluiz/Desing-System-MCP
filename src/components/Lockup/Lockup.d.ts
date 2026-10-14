import React from 'react';
export interface LockupProps extends React.HTMLAttributes<HTMLDivElement> {
    type?: 'institucional' | 'explicativo' | 'autoral' | 'bio';
    variant?: 'cream' | 'ink';
    size?: 'sm' | 'md' | 'lg';
}
export declare const Lockup: React.FC<LockupProps>;
//# sourceMappingURL=Lockup.d.ts.map