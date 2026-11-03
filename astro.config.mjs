// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Generación estática: `npm run build` produce dist/ sin servidor de aplicaciones.
export default defineConfig({
  output: 'static',
  integrations: [react()],
  build: { format: 'file' },
});
