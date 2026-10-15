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
      '@caramelo/design-system/motion': path.resolve(__dirname, '../../src/motion/index.ts'),
      '@caramelo/design-system/engine': path.resolve(__dirname, '../../src/mcp/engine/index.ts'),
      '@caramelo/design-system': path.resolve(__dirname, '../../src/index.ts'),
    },
  },
  server: {
    port: 3000,
    // Os estilos do pacote (e as fontes WOFF2 que eles referenciam) vivem na raiz do repositório
    fs: { allow: [path.resolve(__dirname, '../..')] },
  },
});
