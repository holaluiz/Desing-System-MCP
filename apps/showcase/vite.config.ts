import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@caramelo/design-system/styles.css': path.resolve(__dirname, '../../src/styles/index.css'),
      '@caramelo/design-system/tailwind': path.resolve(__dirname, '../../src/tailwind/index.ts'),
      '@caramelo/design-system/tokens': path.resolve(__dirname, '../../src/tokens/index.ts'),
      '@caramelo/design-system': path.resolve(__dirname, '../../src/index.ts'),
    },
  },
  server: {
    port: 3000,
  },
});
