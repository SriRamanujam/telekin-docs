// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { SITE_URL } from './src/site-config.mjs';

export default defineConfig({
	site: SITE_URL,
	integrations: [
		starlight({
			title: 'Telekin',
			head: [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' } }],
			sidebar: [{ label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] }],
		}),
	],
});
