import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

/**
 * Deployment base path.
 * - Cloudflare Pages / custom domain / user-site GitHub Pages: leave unset (served at root).
 * - GitHub Pages project site: BASE_PATH=/<repository-name>/ (e.g. /blendex-labs-mobile/).
 */
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'],
      manifest: {
        name: 'Blendex Labs Mobile',
        short_name: 'Blendex',
        description: 'Local-first quality engineering mobile workspace.',
        lang: 'en',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#fafafc',
        theme_color: '#6366f1',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    alias: [
      {
        // Component tests need the client Svelte build (mount), not the server build.
        find: /^svelte$/,
        replacement: fileURLToPath(
          new URL('./node_modules/svelte/src/index-client.js', import.meta.url),
        ),
      },
    ],
  },
});
