import { defineConfig } from 'tsup';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Embute os @import locais num único styles.css. Os @import url(...) externos
 * (Google Fonts) sobem para o topo — CSS só aceita @import antes das regras.
 */
function bundleCss(entry: string): string {
  const external: string[] = [];
  const seen = new Set<string>();
  const inline = (file: string): string => {
    if (seen.has(file)) return '';
    seen.add(file);
    return fs.readFileSync(file, 'utf8').replace(/@import\s+(url\([^)]*\)|'[^']*'|"[^"]*")\s*;\s*/g, (stmt, target: string) => {
      const local = /^['"](\.{1,2}\/[^'"]+\.css)['"]$/.exec(target);
      if (local) return inline(path.resolve(path.dirname(file), local[1])) + '\n';
      external.push(stmt.trim());
      return '';
    });
  };
  const body = inline(entry);
  return [...external, '', body].join('\n');
}

export default defineConfig([
  // 1. Biblioteca React & Tokens (com tipagem .d.ts completa)
  {
    entry: {
      index: 'src/index.ts',
      'tokens/index': 'src/tokens/index.ts',
      'tailwind/index': 'src/tailwind/index.ts',
      'engine/index': 'src/mcp/engine/index.ts',
      'motion/index': 'src/motion/index.ts',
      'brand/index': 'src/brand/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: false,
    treeshake: true,
    external: ['react', 'react-dom', 'lenis'],
    onSuccess: async () => {
      const distDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      const cssSource = path.resolve(__dirname, 'src/styles/index.css');
      const cssDest = path.resolve(distDir, 'styles.css');
      if (fs.existsSync(cssSource)) {
        fs.writeFileSync(cssDest, bundleCss(cssSource));
        console.log('Bundled styles.css → dist/styles.css');
      }
      // Fontes auto-hospedadas (WOFF2 + licenças OFL) referenciadas por ./fonts/ no styles.css
      const fontsSource = path.resolve(__dirname, 'src/styles/fonts');
      if (fs.existsSync(fontsSource)) {
        fs.cpSync(fontsSource, path.resolve(distDir, 'fonts'), { recursive: true });
        console.log('Copied fonts → dist/fonts');
      }
      const assetsSource = path.resolve(__dirname, 'src/assets');
      if (fs.existsSync(assetsSource)) {
        fs.cpSync(assetsSource, path.resolve(distDir, 'assets'), { recursive: true });
        console.log('Copied canonical brand assets → dist/assets');
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
