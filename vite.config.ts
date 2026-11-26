import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  // GitHub Pages project site: https://<user>.github.io/PC/
  base: '/PC/',
  plugins: [
    react(),
    tailwindcss(),
    // Keep generated, unbundled assets available in the production output.
    {
      name: 'copy-unbundled-src-assets',
      apply: 'build',
      closeBundle() {
        const distDir = path.resolve(projectRoot, 'dist');
        const srcAssets = path.resolve(projectRoot, 'src/assets');
        const distAssets = path.resolve(distDir, 'src/assets');
        if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
          fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': projectRoot,
    },
  },
  server: {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    hmr: process.env.DISABLE_HMR !== 'true',
    // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));
