// Fails on content that looks private. Patterns are generic; the founder's
// real hostnames and names go in an untracked .denylist file (one per line).
import { readFileSync, existsSync } from 'node:fs';
import { walk, report } from './lib.mjs';

const files = [
  ...walk('src', ['.md', '.mdx', '.astro', '.mjs', '.ts']),
  ...walk('public', ['.txt', '.html', '.json']),
  'astro.config.mjs',
  'README.md',
];

const patterns = [
  // An Authorization value that isn't one of our placeholders.
  [/Bearer\s+(?!<your key>|<key>|\$\{)[A-Za-z0-9._~+\/-]{12,}/, 'bearer token that is not a placeholder'],
  [/\b(?:\d{1,3}\.){3}\d{1,3}\b/, 'IPv4 address'],
  [/\b[a-z0-9-]+\.(?:internal|lan|local|home\.arpa)\b/i, 'internal hostname'],
];

const deny = existsSync('.denylist')
  ? readFileSync('.denylist', 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'))
  : [];

const failures = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const [re, why] of patterns) {
    const m = text.match(re);
    if (m) failures.push(`${file}: ${why}: "${m[0]}"`);
  }
  for (const word of deny) {
    if (text.toLowerCase().includes(word.toLowerCase())) failures.push(`${file}: denylisted string`);
  }
}
if (!deny.length) console.warn('private: no .denylist file; only generic patterns checked');
report('private', failures);
