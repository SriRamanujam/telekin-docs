// Fails on content that looks private. Patterns are generic; the founder's
// real hostnames and names go in an untracked .denylist file (one per line).
// Failures name the file, line and pattern, never the matched text.
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { walk, report } from './lib.mjs';
import { PATTERNS } from './private-patterns.mjs';

const BINARY = /\.(png|jpe?g|gif|webp|ico|woff2?)$/i;
const tracked = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f && f !== 'package-lock.json' && !BINARY.test(f) && existsSync(f));
const built = existsSync('dist') ? walk('dist', ['.html', '.xml', '.txt', '.js', '.css', '.json']) : [];
// Generic patterns are for prose: in dist, only html, xml and txt get them.
const GENERIC_DIST = /\.(html|xml|txt)$/;
const files = [...new Set([...tracked, ...built])];

const raw = existsSync('.denylist')
  ? readFileSync('.denylist', 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'))
  : [];
const deny = raw.filter((s) => s.length >= 3);
if (deny.length < raw.length) console.warn('private: ignoring denylist entries shorter than 3 characters');

if (!deny.length) {
  if (process.env.REQUIRE_DENYLIST === '1') {
    console.error('private: no denylist entries loaded');
    process.exit(1);
  }
  console.warn('private: no denylist entries loaded; only generic patterns checked');
}

const failures = [];
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  // These files quote the fixtures the patterns are meant to catch, and
  // bundled JS/CSS is not prose; they still get the denylist scan.
  const selfPatterns =
    file === 'scripts/check-private.test.mjs' ||
    file === 'scripts/private-patterns.mjs' ||
    file.startsWith('docs/superpowers/plans/') ||
    (file.startsWith('dist/') && !GENERIC_DIST.test(file));
  lines.forEach((line, i) => {
    const lower = line.toLowerCase();
    if (!selfPatterns) {
      for (const [test, why] of PATTERNS) if (test(line)) failures.push(`${file}:${i + 1}: ${why}`);
    }
    for (const word of deny) if (lower.includes(word.toLowerCase())) failures.push(`${file}:${i + 1}: denylisted string`);
  });
}
report('private', failures);
