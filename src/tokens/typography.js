/**
 * Sistema Tipográfico em Três Vozes — Um Cara Caramelo (Manual V1 2026)
 * 1. Grotesca Pesada (Display/Editorial/Impacto)
 * 2. Sans Funcional (Interface/Corpo/Leitura)
 * 3. Manuscrita (Intervenção Humana/Anotações)
 */
export const typography = {
    fonts: {
        // Voz Principal: Títulos de cena, números, CTAs, Wordmark
        display: [
            '"Inter Display"',
            '"Syne"',
            '"Impact"',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'sans-serif',
        ].join(', '),
        // Voz Secundária: Textos, interface, navegação, metadados
        sans: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            'sans-serif',
        ].join(', '),
        // Voz Manuscrita: Pensamentos, provocações, ironias, setas (proibido em parágrafos longos e botões)
        handwriting: [
            '"Caveat"',
            '"Kalam"',
            '"Gochi Hand"',
            'cursive',
        ].join(', '),
    },
    // Escala Tipográfica Canônica
    sizes: {
        'display-2xl': { size: '4.5rem', lineHeight: '1.05', tracking: '-0.03em', weight: '900' }, // 72-96px
        'display-xl': { size: '3.5rem', lineHeight: '1.1', tracking: '-0.025em', weight: '900' }, // 56-64px
        'display-lg': { size: '2.5rem', lineHeight: '1.15', tracking: '-0.02em', weight: '800' }, // 40-48px
        'heading-lg': { size: '2rem', lineHeight: '1.2', tracking: '-0.015em', weight: '800' }, // 32px
        'heading-md': { size: '1.5rem', lineHeight: '1.3', tracking: '-0.01em', weight: '700' }, // 24px
        'heading-sm': { size: '1.25rem', lineHeight: '1.35', tracking: '0em', weight: '700' }, // 20px
        'body-lg': { size: '1.125rem', lineHeight: '1.6', tracking: '0em', weight: '400' }, // 18px
        'body-md': { size: '1rem', lineHeight: '1.6', tracking: '0em', weight: '400' }, // 16px
        'body-sm': { size: '0.875rem', lineHeight: '1.5', tracking: '0.01em', weight: '400' }, // 14px
        'label-sm': { size: '0.75rem', lineHeight: '1.4', tracking: '0.06em', weight: '700' }, // 12px Caixa Alta
        'label-xs': { size: '0.6875rem', lineHeight: '1.3', tracking: '0.08em', weight: '700' }, // 11px Meta
        'handwriting-lg': { size: '1.75rem', lineHeight: '1.2', tracking: '0em', weight: '700' }, // Anotações
        'handwriting-md': { size: '1.25rem', lineHeight: '1.3', tracking: '0em', weight: '600' },
    },
};
