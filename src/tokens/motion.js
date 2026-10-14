/**
 * Motion & Interação — Um Cara Caramelo (Manual V1 2026)
 * "STILLNESS = CAMADAS ALINHADAS  •  MOVEMENT = CAMADAS SE SEPARAM"
 */
export const motion = {
    // Durações
    durations: {
        instant: '100ms',
        fast: '200ms',
        deliberate: '350ms',
        cinematic: '600ms',
        slow: '900ms',
    },
    // Curvas de aceleração (Cinéticas e intencionais)
    easings: {
        // Resposta imediata para cliques e botões
        kinetic: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        // Efeito snap tátil
        snap: 'cubic-bezier(0.16, 1, 0.3, 1)',
        // Separação de camadas (Stillness -> Movement)
        layerSeparation: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        // Saída suave e limpa
        exit: 'cubic-bezier(0.4, 0, 1, 1)',
    },
    // Efeitos canônicos
    effects: {
        // Deslocamento de registro CMYK pontual
        chromaticShiftHover: 'translate(-2px, -2px)',
        chromaticShiftActive: 'translate(1px, 1px)',
        // Eco de frame / Paralaxe
        layerSplitOffset: '4px',
    },
};
