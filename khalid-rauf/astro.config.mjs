import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  // 'static' is the default — no need to specify it.
  // Individual routes opt into server rendering via `export const prerender = false`,
  // which we've already added to /api/*, /cart.astro, and /checkout.astro.
  adapter: node({
    mode: 'standalone',
  }),
});