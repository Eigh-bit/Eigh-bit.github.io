import { defineConfig } from 'astro/config';
import academic from './scripts/academic-integration.mjs';

function normalizeBasePath(value: string | undefined): string {
  const path = value?.trim().replace(/^\/+|\/+$/g, '');
  return path ? `/${path}` : '/';
}

const site = process.env.ASTRO_SITE?.replace(/\/+$/, '') || 'http://127.0.0.1:4321';

export default defineConfig({
  site,
  base: normalizeBasePath(process.env.ASTRO_BASE_PATH),
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [academic()],
});
