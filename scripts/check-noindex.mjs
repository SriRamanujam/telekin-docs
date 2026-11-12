// Every built page must tell search engines not to index it, and
// robots.txt must disallow everything, until public signup exists.
import { readFileSync, existsSync } from 'node:fs';
import { walk, report } from './lib.mjs';

const failures = [];
const META = /<meta[^>]*name="robots"[^>]*content="noindex, nofollow"/;

for (const file of walk('dist', ['.html'])) {
  const html = readFileSync(file, 'utf8');
  if (!META.test(html)) failures.push(`${file}: no robots noindex meta`);
  if (/<link\b[^>]*\brel\s*=\s*["']?sitemap\b/i.test(html)) failures.push(`${file}: has a rel="sitemap" link`);
}
if (!existsSync('dist/robots.txt')) {
  failures.push('dist/robots.txt missing');
} else if (!/^Disallow: \/\s*$/m.test(readFileSync('dist/robots.txt', 'utf8'))) {
  failures.push('dist/robots.txt does not contain "Disallow: /"');
}
if (existsSync('dist/sitemap-index.xml')) failures.push('dist/sitemap-index.xml exists; the sitemap is disabled until launch');
report('noindex', failures);
