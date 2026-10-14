import React from 'react';
/**
 * 1. VOZ PRINCIPAL — Grotesca Pesada (Display / Editorial)
 * Larga, pesada, impactante. Usada em títulos, números e chamadas.
 */
export interface DisplayHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div';
    size?: 'xl' | 'lg' | 'md';
    uppercase?: boolean;
}
export declare const DisplayHeading: React.FC<DisplayHeadingProps>;
/**
 * 2. VOZ SECUNDÁRIA — Sans Funcional (Interface / Corpo)
 * Limpa, regular/medium. Leitura confortável para textos e navegação.
 */
export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    as?: 'p' | 'span' | 'div';
    size?: 'sm' | 'base' | 'lg';
    variant?: 'primary' | 'muted';
}
export declare const Text: React.FC<TextProps>;
/**
 * 3. VOZ MANUSCRITA — Intervenção Humana (Anotações, rabiscos, pensamentos)
 * REGRA CANÔNICA: NUNCA usar em parágrafos longos, menus, preços ou botões.
 */
export interface HandwrittenNoteProps extends React.HTMLAttributes<HTMLSpanElement> {
    color?: 'caramel' | 'sky' | 'pink' | 'yellow' | 'cream';
    rotate?: '-2' | '-1' | '0' | '1' | '2';
}
export declare const HandwrittenNote: React.FC<HandwrittenNoteProps>;
/**
 * Eyebrow / Label Técnico
 * Caixa alta pontual com tracking expandido para categorias e status.
 */
export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
    color?: 'caramel' | 'sky' | 'pink' | 'violet' | 'yellow' | 'muted';
}
export declare const Eyebrow: React.FC<EyebrowProps>;
//# sourceMappingURL=Typography.d.ts.map