/**
 * Paleta Canônica Oficial de Cores — Um Cara Caramelo (Manual V1 2026)
 * "Base sóbria. Acentos elétricos como tinta gráfica."
 */
export declare const colors: {
    readonly ink: {
        readonly DEFAULT: "#101014";
        readonly rgb: "16, 16, 20";
        readonly pure: "#000000";
        readonly muted: "#18181D";
        readonly border: "#27272F";
        readonly surface: "#1F1F26";
        readonly surfaceSubtle: "#141419";
    };
    readonly cream: {
        readonly DEFAULT: "#FFF4E8";
        readonly rgb: "255, 244, 232";
        readonly pure: "#FFFFFF";
        readonly muted: "#F5E6D4";
        readonly border: "#E8D2BB";
        readonly surface: "#FDF7F0";
    };
    readonly caramel: {
        readonly DEFAULT: "#FF701A";
        readonly rgb: "255, 112, 26";
        readonly hover: "#E55E0D";
        readonly active: "#CC4E00";
        readonly light: "#FFEFE6";
        readonly muted: "#FF9454";
    };
    readonly sky: {
        readonly DEFAULT: "#25BFFF";
        readonly rgb: "37, 191, 255";
        readonly hover: "#0DA8EA";
        readonly surface: "#0A2533";
        readonly light: "#E6F8FF";
    };
    readonly pink: {
        readonly DEFAULT: "#FF3D8D";
        readonly rgb: "255, 61, 141";
        readonly hover: "#E82576";
        readonly surface: "#330B1C";
        readonly light: "#FFEBF3";
    };
    readonly violet: {
        readonly DEFAULT: "#7657FF";
        readonly rgb: "118, 87, 255";
        readonly hover: "#5D3CE8";
        readonly surface: "#191238";
        readonly light: "#F1EFFF";
    };
    readonly yellow: {
        readonly DEFAULT: "#FFD52A";
        readonly rgb: "255, 213, 42";
        readonly hover: "#E6BD15";
        readonly surface: "#332900";
        readonly light: "#FFFBE6";
    };
};
/** Metadados de Contraste WCAG Canônicos */
export declare const contrastRatios: {
    readonly 'cream-on-ink': {
        readonly ratio: 17.5;
        readonly level: "AAA";
        readonly role: "Leitura principal de texto e interface";
    };
    readonly 'orange-on-ink': {
        readonly ratio: 6.86;
        readonly level: "AA";
        readonly role: "Destaques, CTAs e marcações";
    };
    readonly 'sky-on-ink': {
        readonly ratio: 9.02;
        readonly level: "AAA";
        readonly role: "Acento digital e estados interativos";
    };
    readonly 'pink-on-ink': {
        readonly ratio: 5.7;
        readonly level: "AA";
        readonly role: "Provocações e anotações críticas";
    };
    readonly 'violet-on-ink': {
        readonly ratio: 4.14;
        readonly level: "AA Large";
        readonly role: "Títulos grandes e áreas não textuais";
    };
    readonly 'yellow-on-ink': {
        readonly ratio: 13.38;
        readonly level: "AAA";
        readonly role: "Alertas e sinalização de alta visibilidade";
    };
    readonly 'ink-on-cream': {
        readonly ratio: 17.5;
        readonly level: "AAA";
        readonly role: "Texto editorial em fundo claro";
    };
};
export type CarameloColors = typeof colors;
//# sourceMappingURL=colors.d.ts.map