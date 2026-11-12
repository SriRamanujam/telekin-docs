// Every client setup page must show when it was last checked against the
// client's official docs. Index pages are exempt.
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { walk, report } from './lib.mjs';

const today = new Date().toISOString().slice(0, 10); // UTC
const failures = [];
for (const file of walk('src/content/docs/how-to/connect', ['.md', '.mdx'])) {
  if (['index.mdx', 'index.md'].includes(basename(file))) continue;
  const text = readFileSync(file, 'utf8');
  const m = text.match(/<LastChecked date="(\d{4})-(\d{2})-(\d{2})" \/>/);
  if (!m) {
    failures.push(`${file}: missing <LastChecked date="YYYY-MM-DD" />`);
    continue;
  }
  const iso = `${m[1]}-${m[2]}-${m[3]}`;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) failures.push(`${file}: ${iso} is not a real date`);
  else if (iso > today) failures.push(`${file}: ${iso} is in the future`);
}
report('last-checked', failures);
