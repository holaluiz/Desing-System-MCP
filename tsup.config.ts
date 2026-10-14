import { defineConfig } from 'tsup';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig([
  // 1. Biblioteca React & Tokens (com tipagem .d.ts completa)
  {
    entry: {
      index: 'src/index.ts',
      'tokens/index': 'src/tokens/index.ts',
      'tailwind/index': 'src/tailwind/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: false,
    treeshake: true,
    external: ['react', 'react-dom'],
    onSuccess: async () => {
      const distDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      const cssSource = path.resolve(__dirname, 'src/styles/index.css');
      const cssDest = path.resolve(distDir, 'styles.css');
      if (fs.existsSync(cssSource)) {
        fs.copyFileSync(cssSource, cssDest);
        console.log('Copied styles.css to dist/styles.css');
      }
    },
  },
  // 2. Servidor MCP de UX/UI (Executável CLI rápido)
  {
    entry: {
      'mcp/index': 'src/mcp/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: false,
    sourcemap: true,
    clean: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
