import React from 'react';
export interface WordmarkProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'cream' | 'ink' | 'caramel';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    withChromaticOffset?: boolean;
}
export declare const Wordmark: React.FC<WordmarkProps>;
//# sourceMappingURL=Wordmark.d.ts.map