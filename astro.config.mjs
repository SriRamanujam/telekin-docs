// @ts-check
import { existsSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import { SITE_URL, WAITLIST_URL } from './src/site-config.mjs';

// The tester section is deleted at launch; the sidebar must not break when it is.
const hasTesters = existsSync('./src/content/docs/testers');

export default defineConfig({
  site: SITE_URL,
  integrations: [
    starlight({
      title: 'Telekin',
      description: 'A memory your AIs share, and you own.',
      plugins: [starlightLinksValidator()],
      head: [
        { tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' } },
      ],
      sidebar: [
        { label: 'Start here', items: [{ autogenerate: { directory: 'start' } }] },
        {
          label: 'How-to guides',
          items: [
            { label: 'Connect your AI', items: [{ autogenerate: { directory: 'how-to/connect' } }] },
            { label: 'More guides', items: [{ autogenerate: { directory: 'how-to/guides' } }] },
          ],
        },
        { label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
        { label: 'Explanation', items: [{ autogenerate: { directory: 'explanation' } }] },
        { label: 'FAQ', link: '/faq/' },
        ...(hasTesters ? [{ label: 'For testers', items: [{ autogenerate: { directory: 'testers' } }] }] : []),
        { label: 'Join the waitlist', link: WAITLIST_URL, attrs: { target: '_blank' } },
      ],
    }),
  ],
});
