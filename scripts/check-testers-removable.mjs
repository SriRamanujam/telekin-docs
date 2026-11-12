// The tester section is deleted at launch. Build a copy of the site without
// it; the links validator fails the build if anything links into it.
import { cpSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const root = resolve('.');
const skip = new Set(['node_modules', 'dist', '.git', '.astro', '.wrangler']);
const skipPrefix = '.testers-check-';
let tmp;
try {
  // The copy lives inside the repo so Node finds ../node_modules without a symlink
  // (a symlinked node_modules breaks Astro's style module lookup).
  tmp = mkdtempSync(join(root, skipPrefix));
  for (const name of readdirSync(root)) {
    if (skip.has(name) || name.startsWith(skipPrefix)) continue;
    cpSync(join(root, name), join(tmp, name), { recursive: true });
  }
  rmSync(join(tmp, 'src/content/docs/testers'), { recursive: true, force: true });
  execSync('npx astro build', { cwd: tmp, stdio: 'inherit' });
  console.log('testers-removable: OK');
} catch (err) {
  console.error(`testers-removable: the site does not build without src/content/docs/testers (${err.message.split('\n')[0]})`);
  process.exitCode = 1;
} finally {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
}
