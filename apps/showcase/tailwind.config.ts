import type { Config } from 'tailwindcss';
import { carameloPreset } from '../../src/tailwind/preset';

export default {
  presets: [carameloPreset],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
