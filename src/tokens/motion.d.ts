/**
 * Motion & Interação — Um Cara Caramelo (Manual V1 2026)
 * "STILLNESS = CAMADAS ALINHADAS  •  MOVEMENT = CAMADAS SE SEPARAM"
 */
export declare const motion: {
    readonly durations: {
        readonly instant: "100ms";
        readonly fast: "200ms";
        readonly deliberate: "350ms";
        readonly cinematic: "600ms";
        readonly slow: "900ms";
    };
    readonly easings: {
        readonly kinetic: "cubic-bezier(0.2, 0.8, 0.2, 1)";
        readonly snap: "cubic-bezier(0.16, 1, 0.3, 1)";
        readonly layerSeparation: "cubic-bezier(0.34, 1.56, 0.64, 1)";
        readonly exit: "cubic-bezier(0.4, 0, 1, 1)";
    };
    readonly effects: {
        readonly chromaticShiftHover: "translate(-2px, -2px)";
        readonly chromaticShiftActive: "translate(1px, 1px)";
        readonly layerSplitOffset: "4px";
    };
};
export type CarameloMotion = typeof motion;
//# sourceMappingURL=motion.d.ts.map