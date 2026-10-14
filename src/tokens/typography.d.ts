/**
 * Sistema Tipográfico em Três Vozes — Um Cara Caramelo (Manual V1 2026)
 * 1. Grotesca Pesada (Display/Editorial/Impacto)
 * 2. Sans Funcional (Interface/Corpo/Leitura)
 * 3. Manuscrita (Intervenção Humana/Anotações)
 */
export declare const typography: {
    readonly fonts: {
        readonly display: string;
        readonly sans: string;
        readonly handwriting: string;
    };
    readonly sizes: {
        readonly 'display-2xl': {
            readonly size: "4.5rem";
            readonly lineHeight: "1.05";
            readonly tracking: "-0.03em";
            readonly weight: "900";
        };
        readonly 'display-xl': {
            readonly size: "3.5rem";
            readonly lineHeight: "1.1";
            readonly tracking: "-0.025em";
            readonly weight: "900";
        };
        readonly 'display-lg': {
            readonly size: "2.5rem";
            readonly lineHeight: "1.15";
            readonly tracking: "-0.02em";
            readonly weight: "800";
        };
        readonly 'heading-lg': {
            readonly size: "2rem";
            readonly lineHeight: "1.2";
            readonly tracking: "-0.015em";
            readonly weight: "800";
        };
        readonly 'heading-md': {
            readonly size: "1.5rem";
            readonly lineHeight: "1.3";
            readonly tracking: "-0.01em";
            readonly weight: "700";
        };
        readonly 'heading-sm': {
            readonly size: "1.25rem";
            readonly lineHeight: "1.35";
            readonly tracking: "0em";
            readonly weight: "700";
        };
        readonly 'body-lg': {
            readonly size: "1.125rem";
            readonly lineHeight: "1.6";
            readonly tracking: "0em";
            readonly weight: "400";
        };
        readonly 'body-md': {
            readonly size: "1rem";
            readonly lineHeight: "1.6";
            readonly tracking: "0em";
            readonly weight: "400";
        };
        readonly 'body-sm': {
            readonly size: "0.875rem";
            readonly lineHeight: "1.5";
            readonly tracking: "0.01em";
            readonly weight: "400";
        };
        readonly 'label-sm': {
            readonly size: "0.75rem";
            readonly lineHeight: "1.4";
            readonly tracking: "0.06em";
            readonly weight: "700";
        };
        readonly 'label-xs': {
            readonly size: "0.6875rem";
            readonly lineHeight: "1.3";
            readonly tracking: "0.08em";
            readonly weight: "700";
        };
        readonly 'handwriting-lg': {
            readonly size: "1.75rem";
            readonly lineHeight: "1.2";
            readonly tracking: "0em";
            readonly weight: "700";
        };
        readonly 'handwriting-md': {
            readonly size: "1.25rem";
            readonly lineHeight: "1.3";
            readonly tracking: "0em";
            readonly weight: "600";
        };
    };
};
export type CarameloTypography = typeof typography;
//# sourceMappingURL=typography.d.ts.map