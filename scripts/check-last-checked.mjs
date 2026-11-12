// Every client setup page must show when it was last checked against the
// client's official docs. Index pages are exempt.
import { readFileSync } from 'node:fs';
import { walk, report } from './lib.mjs';

const failures = [];
for (const file of walk('src/content/docs/how-to/connect', ['.md', '.mdx'])) {
  if (file.endsWith('index.mdx') || file.endsWith('index.md')) continue;
  const text = readFileSync(file, 'utf8');
  if (!/<LastChecked date="\d{4}-\d{2}-\d{2}" \/>/.test(text)) failures.push(`${file}: missing <LastChecked date="YYYY-MM-DD" />`);
}
report('last-checked', failures);
