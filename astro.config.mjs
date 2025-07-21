// @ts-check
import { loadEnv } from 'vite';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  site: env.SITE_URL,
  integrations: [mdx(), sitemap()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    },

    // https://docs.astro.build/ja/guides/integrations-guide/cloudflare/#imageservice
    imageService: "compile"
  }),
});
