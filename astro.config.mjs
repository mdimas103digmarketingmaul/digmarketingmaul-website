import { defineConfig } from 'astro/config';
import { standaloneDev } from './scripts/standalone-dev.mjs';

export default defineConfig({
  site: 'https://digmarketingmaul.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Preserve whitespace-sensitive inline content during the architecture migration.
  compressHTML: false,
  vite: { plugins: [standaloneDev()] },
});
