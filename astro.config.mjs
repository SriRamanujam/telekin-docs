// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	integrations: [
		starlight({
			title: 'Telekin',
			sidebar: [{ label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] }],
		}),
	],
});
