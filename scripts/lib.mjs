import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Every file under `dir` (recursively) whose name ends with one of `exts`. */
export function walk(dir, exts) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, exts));
    else if (exts.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}

/** Print failures and exit 1, or print an OK line. */
export function report(label, failures) {
  if (failures.length) {
    console.error(`${label}: ${failures.length} problem(s)`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`${label}: OK`);
}
