import React from 'react';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'ink' | 'cream' | 'sky' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=Button.d.ts.map