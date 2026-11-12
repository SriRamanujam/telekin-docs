// Every built page must tell search engines not to index it, and
// robots.txt must disallow everything, until public signup exists.
import { readFileSync, existsSync } from 'node:fs';
import { walk, report } from './lib.mjs';

const failures = [];
const META = /<meta[^>]*name="robots"[^>]*content="noindex, nofollow"/;

for (const file of walk('dist', ['.html'])) {
  if (!META.test(readFileSync(file, 'utf8'))) failures.push(`${file}: no robots noindex meta`);
}
if (!existsSync('dist/robots.txt')) {
  failures.push('dist/robots.txt missing');
} else if (!/^Disallow: \/\s*$/m.test(readFileSync('dist/robots.txt', 'utf8'))) {
  failures.push('dist/robots.txt does not contain "Disallow: /"');
}
report('noindex', failures);
