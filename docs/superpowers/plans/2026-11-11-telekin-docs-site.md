# Telekin Docs Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first version of the Telekin docs site: Astro Starlight, organized by Diataxis, hidden from search engines, deployable to Cloudflare Workers static assets with PR previews.

**Architecture:**
- **Pages:** a Starlight site whose sidebar has one group per Diataxis type, plus an FAQ and a removable "For testers" group. Content is MDX under `src/content/docs/`.
- **Shared values:** the site URL and the waitlist link live in `src/site-config.mjs`.
- **Checks:** small Node scripts under `scripts/` run after `astro build`. They check four things:
  - `noindex` is on every page;
  - no private strings have leaked;
  - every client page has a "last checked" date;
  - the site still builds without the tester section.
- **Links:** checked at build time by `starlight-links-validator`.

**Tech Stack:** Node 24, Astro 7.4, `@astrojs/starlight` 0.42, `starlight-links-validator` 0.27, Wrangler 4, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-11-telekin-docs-site-design.md`. Read it before starting any task.

**Rules for every task (include them in every subagent prompt):**
- **Greenfield privacy rule:** keep real hostnames, domains, registries, cluster or repo names, IP addresses, personal names and email addresses out of every file and commit message. Use placeholders: `docs.example.com`, `waitlist@example.com`, `<server URL>`, `<your key>`, catalog `t01`, and the fictional person "Sam".
  - Don't read the owner's knowledge catalog or any memory store.
  - The product names Telekin and okf-mcp are fine. So are the okf-mcp tool names.
- **Commits:** end every commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Voice:** warm, plain, second person.
  - Explain "MCP", "changeset" and "OKF" the first time a page uses them, or avoid them on non-technical pages.
  - One task per how-to.
  - Number the steps, using Starlight's `<Steps>`. Say what the reader sees after each important step.
- **Describe only what exists.** Signup, OAuth, billing, teams, self-serve export and a web viewer are "planned": no dates, no prices.
- **Never write a client setup page from memory.** Use `docs/client-coverage.md`, which Task 7 produces.

**Source material:** Some tasks move text from the founder's private business repo. The controller gives its local path as `<business-repo>`. The files:
- `<business-repo>/docs/recall-test/tester-guide.md`
- `<business-repo>/docs/recall-test/claude-code-setup.md`
- `<business-repo>/docs/recall-test/recruiting-pitch.md`: its FAQ section only.
- `<business-repo>/docs/recall-test/survey.md`
- `<business-repo>/docs/research/2026-11-11-basic-memory-comparison.md`

---

## File structure

```
<repo>/
├─ astro.config.mjs            Starlight config: sidebar, head (noindex), plugins
├─ package.json                scripts: dev, build, check, check:testers
├─ wrangler.jsonc              Workers static-assets deploy config
├─ public/robots.txt           Disallow everything until launch
├─ src/site-config.mjs         SITE_URL, WAITLIST_URL (one place to change)
├─ src/content.config.ts       from the Starlight template, unchanged
├─ src/components/
│   ├─ Waitlist.astro          "Want access? Join the waitlist" aside
│   └─ LastChecked.astro       "Last checked: YYYY-MM-DD" line for client pages
├─ src/content/docs/
│   ├─ index.mdx               home (splash)
│   ├─ start/                  tutorials
│   ├─ how-to/                 how-to guides
│   │   └─ connect/            one page per AI client
│   ├─ reference/
│   ├─ explanation/
│   ├─ faq.mdx
│   └─ testers/                removable at launch
├─ scripts/
│   ├─ lib.mjs                 shared helpers (walk files)
│   ├─ check-noindex.mjs
│   ├─ check-private.mjs
│   ├─ check-last-checked.mjs
│   └─ check-testers-removable.mjs
├─ .github/workflows/ci.yml    build plus all checks on PRs and main
├─ docs/client-coverage.md     Task 7's verified client research (not published)
├─ LICENSE                     MIT, for the site code
├─ LICENSE-docs                CC BY 4.0, for src/content/docs
└─ README.md
```

---

### Task 1: Scaffold the Starlight project

**Files:**
- Create: everything from the Starlight template, plus `LICENSE`, `LICENSE-docs`, `README.md`.
- Keep: `docs/superpowers/` (already committed).

- [ ] **Step 1: Scaffold into a temp dir and copy in.** The repo already has files, so don't scaffold in place.

```bash
cd "$(git rev-parse --show-toplevel)"
tmp=$(mktemp -d)
npm create astro@latest -- "$tmp/site" --template starlight --install --no-git --skip-houston --yes
rsync -a --exclude .git "$tmp/site/" ./
rm -rf "$tmp"
```

Expected: `astro.config.mjs`, `package.json`, `src/content/docs/` and `src/content.config.ts` now exist.

- [ ] **Step 2: Pin the versions** the plan was written against, and add the links validator.

```bash
npm install astro@7.4.11 @astrojs/starlight@0.42.10 starlight-links-validator@0.27.0 --save-exact
npm install wrangler@4.160.1 --save-dev --save-exact
```

- [ ] **Step 3: Check that it builds.**

Run: `npx astro build`
Expected: the output ends with `Complete!`, and `dist/index.html` exists.

- [ ] **Step 4: Delete the template's sample pages.** Remove `src/content/docs/guides/` and `src/content/docs/reference/example.md` (whatever sample pages the template made, apart from `index.mdx`).

- [ ] **Step 5: Add the licenses and README.**

`LICENSE`: the standard MIT text, with copyright holder `Hypotheosis` and year `2026`.

`LICENSE-docs`:
```
The documentation content in src/content/docs/ is licensed under the
Creative Commons Attribution 4.0 International License (CC BY 4.0).
https://creativecommons.org/licenses/by/4.0/

The site code (configuration, components, scripts) is licensed under the
MIT License; see LICENSE.
```

`README.md`:
````markdown
# Telekin docs

The documentation site for Telekin, built with Astro Starlight.

## Develop

```bash
npm ci
npm run dev        # http://localhost:4321
```

## Check before you push

```bash
npm run build && npm run check
npm run check:testers   # the site must build without the tester section
```

## Where things go (Diataxis)

- `src/content/docs/start/`: tutorials (learning by doing)
- `src/content/docs/how-to/`: one task per page
- `src/content/docs/reference/`: facts to look up
- `src/content/docs/explanation/`: understanding and background
- `src/content/docs/testers/`: tester-only pages, deleted at launch.
  Nothing outside this folder may link into it.

Client setup pages must carry `<LastChecked date="YYYY-MM-DD" />`, checked
against the client's current official docs.

The site URL and waitlist link live in `src/site-config.mjs`.
````

- [ ] **Step 6: Make sure `.gitignore` covers the build output.** It should list `node_modules/`, `dist/`, `.astro/` and `.wrangler/`. Append any that are missing.

- [ ] **Step 7: Commit.**

```bash
git add -A
git commit -m "Scaffold Starlight site

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Shared helpers and the noindex check (test first)

**Files:**
- Create: `scripts/lib.mjs`, `scripts/check-noindex.mjs`, `public/robots.txt`, `src/site-config.mjs`
- Modify: `astro.config.mjs`, `package.json`

- [ ] **Step 1: Write the helpers.**

`scripts/lib.mjs`:
```js
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
```

- [ ] **Step 2: Write the failing check.**

`scripts/check-noindex.mjs`:
```js
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
```

Add to the `scripts` in `package.json`:
```json
"check": "node scripts/check-noindex.mjs"
```

- [ ] **Step 3: Check that it fails.**

Run: `npx astro build && npm run check`
Expected: FAIL, with `noindex: N problem(s)` listing the pages, and `dist/robots.txt missing`.

- [ ] **Step 4: Add the site config, the robots file and the head tag.**

`src/site-config.mjs`:
```js
// The one place to change the site URL and the waitlist link.
// The founder sets the real values at deploy time (see Task 19).
export const SITE_URL = 'https://docs.example.com';
export const WAITLIST_URL = 'mailto:waitlist@example.com';
```

`public/robots.txt`:
```
# Hidden from search engines until public signup exists.
User-agent: *
Disallow: /
```

In `astro.config.mjs`, import `SITE_URL`, set `site: SITE_URL`, and add to the `starlight({...})` options:
```js
head: [
  { tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' } },
],
```

- [ ] **Step 5: Check that it passes.**

Run: `npx astro build && npm run check`
Expected: `noindex: OK`.

- [ ] **Step 6: Commit.**

```bash
git add -A
git commit -m "Hide the site from search engines until launch

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Sidebar, components and section landing pages

**Files:**
- Modify: `astro.config.mjs`
- Create:
  - `src/components/Waitlist.astro` and `src/components/LastChecked.astro`;
  - `src/content/docs/index.mdx` (replace the template's);
  - one stub page per folder: `start/index.mdx`, `how-to/connect/index.mdx`, `how-to/guides/index.mdx`, `reference/index.mdx`, `explanation/index.mdx`, `testers/index.mdx` and `faq.mdx`.

- [ ] **Step 1: Write the full `astro.config.mjs`.**

```js
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
        { label: 'Start here', autogenerate: { directory: 'start' } },
        {
          label: 'How-to guides',
          items: [
            { label: 'Connect your AI', autogenerate: { directory: 'how-to/connect' } },
            { label: 'More guides', autogenerate: { directory: 'how-to/guides' } },
          ],
        },
        { label: 'Reference', autogenerate: { directory: 'reference' } },
        { label: 'Explanation', autogenerate: { directory: 'explanation' } },
        { label: 'FAQ', link: '/faq/' },
        ...(hasTesters ? [{ label: 'For testers', autogenerate: { directory: 'testers' } }] : []),
        { label: 'Join the waitlist', link: WAITLIST_URL, attrs: { target: '_blank' } },
      ],
    }),
  ],
});
```

How-to pages live in two folders: `how-to/connect/` (one page per client) and `how-to/guides/` (everything else). There is no `how-to/index.mdx`.

- [ ] **Step 2: Write the components.**

`src/components/Waitlist.astro`:
```astro
---
import { Aside } from '@astrojs/starlight/components';
import { WAITLIST_URL } from '../site-config.mjs';
---
<Aside type="tip" title="Don't have an invite yet?">
  Telekin is in a private test. <a href={WAITLIST_URL}>Join the waitlist</a> and we'll let you know when there's room.
</Aside>
```

`src/components/LastChecked.astro`:
```astro
---
interface Props { date: string }
const { date } = Astro.props;
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`LastChecked: bad date "${date}"`);
---
<p><small>Last checked against this app's official docs: {date}. Menus move around; if a step doesn't match what you see, tell us.</small></p>
```

- [ ] **Step 3: Write the home page.** `src/content/docs/index.mdx`:

```mdx
---
title: Telekin
description: A memory your AIs share, and you own.
template: splash
hero:
  tagline: Never explain yourself twice. Telekin gives every AI you use one shared memory of your world, and you can see and undo everything in it.
  actions:
    - text: Your first 15 minutes
      link: /start/first-15-minutes/
      icon: right-arrow
    - text: Connect your AI
      link: /how-to/connect/
      variant: minimal
---
import { CardGrid, LinkCard } from '@astrojs/starlight/components';
import Waitlist from '../../components/Waitlist.astro';

<Waitlist />

<CardGrid>
  <LinkCard title="Start here" description="Connect one AI, let it interview you, and watch it remember." href="/start/first-15-minutes/" />
  <LinkCard title="Connect your AI" description="Claude, Claude Code, Cursor and more." href="/how-to/connect/" />
  <LinkCard title="How Telekin works" description="Concepts, drafts, publishing and history." href="/explanation/how-telekin-works/" />
  <LinkCard title="FAQ" description="Privacy, cost, which AIs work, and more." href="/faq/" />
</CardGrid>
```

These links point to pages that later tasks create. Until then the links validator will fail the build, so in this task create a minimal stub for each linked page. Each stub has frontmatter `title` and one sentence: "This page is being written." Later tasks overwrite the stubs. The stubs are:
- `start/first-15-minutes.mdx`
- `explanation/how-telekin-works.mdx`

- [ ] **Step 4: Write the section index stubs.** Each has a `title`, a one-paragraph description of what the section is for (in Diataxis terms, plainly worded), and `sidebar: { order: 0 }`. Titles:
  - `start/index.mdx`: "Start here"
  - `how-to/connect/index.mdx`: "Connect your AI"
  - `how-to/guides/index.mdx`: "How-to guides"
  - `reference/index.mdx`: "Reference"
  - `explanation/index.mdx`: "Explanation"
  - `faq.mdx`: "FAQ"
  - `testers/index.mdx`: "For testers"

- [ ] **Step 5: Build and check.**

Run: `npx astro build && npm run check`
Expected: the build passes (the links validator reports no invalid links), and `noindex: OK`.

- [ ] **Step 6: Look at it.** Run `npm run dev`, open `http://localhost:4321`, and check:
  - the sidebar shows the groups in order;
  - "Join the waitlist" opens a mail link;
  - the home page shows the tip aside.

- [ ] **Step 7: Commit.**

```bash
git add -A
git commit -m "Add Diataxis sidebar, waitlist and last-checked components

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Private-string check (test first)

**Files:**
- Create: `scripts/check-private.mjs`
- Modify: `package.json`, `.gitignore`

This check fails the build on anything that looks like a real key, an IP address, an internal hostname, or a string from an untracked local denylist. The denylist holds the founder's real hostnames and names, so it is never committed.

- [ ] **Step 1: Write the check.**

`scripts/check-private.mjs`:
```js
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
```

Note that the denylisted string itself is never printed, so it can't leak into CI logs.

- [ ] **Step 2: Add the script and ignore the denylist.** Change the `check` script in `package.json` to:

```json
"check": "node scripts/check-noindex.mjs && node scripts/check-private.mjs"
```

Then append to `.gitignore`:
```
.denylist
```

- [ ] **Step 3: Check that it catches a leak.** Temporarily add the line `Authorization: Bearer abcdef1234567890abcd` to `src/content/docs/faq.mdx`, then run `node scripts/check-private.mjs`.
Expected: FAIL with `bearer token that is not a placeholder`. Then remove the line.

- [ ] **Step 4: Check that it passes.**

Run: `npx astro build && npm run check`
Expected: `noindex: OK` and `private: OK`, with a warning about the missing `.denylist`.

- [ ] **Step 5: Founder action, done outside the repo.** The founder creates `.denylist` in their local checkout, listing their real server hostname, domains and personal names, one per line. It is never committed. In CI, the denylist comes from a repository secret (Task 6).

- [ ] **Step 6: Commit.**

```bash
git add -A
git commit -m "Add check for private strings in content

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Last-checked and tester-removability checks (test first)

**Files:**
- Create: `scripts/check-last-checked.mjs`, `scripts/check-testers-removable.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the last-checked check.**

`scripts/check-last-checked.mjs`:
```js
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
```

- [ ] **Step 2: Write the removability check.**

`scripts/check-testers-removable.mjs`:
```js
// The tester section is deleted at launch. Build a copy of the site without
// it; the links validator fails the build if anything links into it.
import { cpSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const root = resolve('.');
const tmp = mkdtempSync(join(tmpdir(), 'telekin-docs-'));
const skip = new Set(['node_modules', 'dist', '.git', '.astro', '.wrangler']);
cpSync(root, tmp, {
  recursive: true,
  filter: (src) => !skip.has(src.slice(root.length + 1).split('/')[0]),
});
rmSync(join(tmp, 'src/content/docs/testers'), { recursive: true, force: true });
symlinkSync(join(root, 'node_modules'), join(tmp, 'node_modules'));
try {
  execSync('npx astro build', { cwd: tmp, stdio: 'inherit' });
  console.log('testers-removable: OK');
} catch {
  console.error('testers-removable: the site does not build without src/content/docs/testers');
  process.exit(1);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
```

- [ ] **Step 3: Add the scripts to `package.json`.**

```json
"check": "node scripts/check-noindex.mjs && node scripts/check-private.mjs && node scripts/check-last-checked.mjs",
"check:testers": "node scripts/check-testers-removable.mjs"
```

- [ ] **Step 4: Check that the removability check catches a bad link.** Temporarily add `[testers](/testers/)` to `faq.mdx`, then run `npm run check:testers`.
Expected: FAIL, with the links validator reporting `/testers/` as invalid. Then remove the link.

- [ ] **Step 5: Check that the last-checked check catches a missing date.** Temporarily create `src/content/docs/how-to/connect/zz-test.mdx`, containing frontmatter `title: x` and no `LastChecked`. Run `node scripts/check-last-checked.mjs`.
Expected: FAIL naming `zz-test.mdx`. Then delete the file.

- [ ] **Step 6: Check that everything passes.**

Run: `npx astro build && npm run check && npm run check:testers`
Expected: every check prints OK.

- [ ] **Step 7: Commit.**

```bash
git add -A
git commit -m "Add last-checked and tester-removability checks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/pull_request_template.md`

- [ ] **Step 1: Write the workflow.**

`.github/workflows/ci.yml`:
```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - name: Write the private denylist from a secret
        env:
          DENYLIST: ${{ secrets.DOCS_DENYLIST }}
        run: printf '%s\n' "$DENYLIST" > .denylist
      - run: npx astro build
      - run: npm run check
      - run: npm run check:testers
```

- [ ] **Step 2: Write the PR template.**

`.github/pull_request_template.md`:
```markdown
## What changed

## Checklist
- [ ] Diataxis: each page I touched stays one kind (tutorial, how-to, reference or explanation)
- [ ] Client pages I touched were re-checked against the client's official docs, and their `LastChecked` date updated
- [ ] Nothing outside `testers/` links into `testers/`
- [ ] Nothing describes unbuilt features as available
```

- [ ] **Step 3: Check the YAML parses.**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml')); print('ok')"`
Expected: `ok`

- [ ] **Step 4: Commit.**

```bash
git add -A
git commit -m "Add CI: build and run all checks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Client coverage research

**Files:**
- Create: `docs/client-coverage.md` (repo docs, not published on the site)

This is research, not code. For each candidate client, read its current official documentation. Use web search, and fetch the vendor's own docs pages, not blogs. Record:
- **HTTP:** does it support remote MCP servers over **streamable HTTP**? (SSE-only counts as "partial".)
- **Header:** can the user set a custom **`Authorization: Bearer` header**, and where (UI field, config file key, CLI flag)?
- **Writes:** are **write** (non-read-only) tools allowed?
- **Plans:** do any plan or tier limits apply?
- **Steps:** the exact current setup steps or config snippet.
- **Source:** the official docs URL, and the date checked (from `date -u +%Y-%m-%d`).

Candidates:
- Claude (claude.ai web), Claude Desktop, Claude mobile (iOS/Android);
- Claude Code, Cursor, VS Code (GitHub Copilot agent mode), Windsurf;
- OpenAI Codex CLI, ChatGPT, Gemini CLI, Zed, Cline, Continue;
- JetBrains AI Assistant, LM Studio.

Already known, to re-confirm:
- **claude.ai:** custom connector; authentication "No sign in"; a request header `Authorization`; Free plans allow one custom connector.
- **Claude Code:**
  ```bash
  claude mcp add --transport http --scope user okf-mcp <server URL> --header "Authorization: Bearer <your key>"
  ```
- **Cursor:** `~/.cursor/mcp.json` with `mcpServers.<name>.url` and `.headers`.
- **ChatGPT:** custom connectors require OAuth, so it's "not yet".

- [ ] **Step 1: Research each client.** Write `docs/client-coverage.md` as a table: client, HTTP, header, writes, verdict (full page / not-yet page / leave out), docs URL, date checked. Below the table, add one section per client with its exact steps or snippet.
  - **Verdict "full page":** all three answers are yes.
  - **Verdict "not-yet page":** it needs OAuth or lacks HTTP support. Record the reason.
  - **Verdict "leave out":** it couldn't be confirmed from official docs. List it under "Unconfirmed: for the founder".
- [ ] **Step 2: Commit.**

```bash
git add docs/client-coverage.md
git commit -m "Research which AI clients can connect today

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Content tasks (8–17)

Every content page:
- **Frontmatter:** has `title` and `description`, plus `sidebar: { order: N }` where order matters.
- **Placeholders:** uses only the placeholders listed in the rules above.
- **Before committing:** passes `npx astro build && npm run check`.
- **Commit message:** names the pages added.

When a task says **verbatim**, copy the text exactly from the source file named, or from this plan.

### Task 8: Tutorials

**Files:**
- Create: `src/content/docs/start/first-15-minutes.mdx` (replaces the stub)
- Create: `src/content/docs/start/from-your-documents.mdx`

- [ ] **Step 1: Write "Your first 15 minutes"** (`sidebar.order: 1`). A tutorial: the reader does it, and it works every time. Use claude.ai as the single path, since it's the most common and needs no terminal, and link to "Connect your AI" for other tools. Structure:
  1. **What you'll have at the end:** one sentence.
  2. **Before you start:** your server URL and key "from your invite", plus `<Waitlist />`.
  3. **Connect Claude:** use `<Steps>`. The steps are verbatim from tester-guide.md's "Claude (claude.ai, Claude Desktop)" steps 1–6, except that the connector name is `Telekin`.
  4. **Add one line to your preferences:** the "extra line", verbatim from tester-guide.md "One extra line for this test", with its intro reworded to drop "for this test" and "until the next server update".
  5. **Let it interview you:** the interview prompt **verbatim** from tester-guide.md "Your first session".
  6. **See it remember:** start a new chat and ask "What do you know about me?". Say what to expect: it searches Telekin and summarizes. Then ask a work question that names one of your projects, and notice it uses what it knows.
  7. **What's next:** link to two-AIs, "without being asked", and "how Telekin works".
- [ ] **Step 2: Write "Fill Telekin from documents you already have"** (`sidebar.order: 2`). Use the doc-dump prompt **verbatim** from tester-guide.md, "Record the durable facts from this in my catalog." Walk through:
  - pasting one document;
  - asking "What did you record?";
  - opening a new chat and asking about it.

  Include a caution aside: don't paste anything your employer considers confidential.
- [ ] **Step 3: Build, check and commit.**

### Task 9: Connect pages for the known clients

**Files:**
- Create in `src/content/docs/how-to/connect/`:
  - `claude.mdx`, `claude-code.mdx`, `claude-code-enhanced.mdx`
  - `cursor.mdx`, `chatgpt.mdx`, `any-mcp-client.mdx`

Each page:
- imports `LastChecked` and `Waitlist`;
- opens with "You'll need: your server URL and key (from your invite)" plus `<Waitlist />`;
- uses `<Steps>`, and ends with "Check it works" and "Undo it" sections;
- carries `<LastChecked date=... />`, with the date from `docs/client-coverage.md`;
- takes its steps from `docs/client-coverage.md` wherever that differs from the tester guide.

- [ ] **Step 1: Write `claude.mdx`** (order 1). Claude on the web, desktop and mobile:
  - **steps:** from tester-guide.md, with the connector named `Telekin`;
  - **notes:** the Free-plan one-connector note, and the "remove and re-add to change it" note;
  - **mobile:** whether connectors added on the web appear there, per client-coverage.md.
- [ ] **Step 2: Write `claude-code.mdx`** (order 2).
  - **The command, verbatim:**
    ```bash
    claude mcp add --transport http --scope user okf-mcp <server URL> \
      --header "Authorization: Bearer <your key>"
    ```
  - **Explain:** the expected output, `/mcp`, and what `--scope user` does.
  - **The note, verbatim:** "Keep the name `okf-mcp`: Telekin runs on the open-source okf-mcp server, and the tool names depend on it."
  - **The catalog header note,** verbatim from tester-guide.md (`X-OKF-Catalogs`, plural, silently ignored if misspelled).
- [ ] **Step 3: Write `claude-code-enhanced.mdx`** (order 3). This is the simpler public version of `<business-repo>/docs/recall-test/claude-code-setup.md`.
  - **Keep:** sections 1–4, the jq merge, the verification and "Undoing it". Use the SessionStart hook script verbatim from the source, with `CATALOG = "t01"`.
  - **Drop:** the "In the surveys" paragraph, the "Optional: maintenance skills" section, and "this is a test server".
  - **Use this CLAUDE.md block instead of the source's:**

````markdown
```markdown
# Telekin

I keep a long-term memory of my world (projects, systems, people,
decisions and my preferences) in Telekin, on the okf-mcp MCP server
(`mcp__okf-mcp__*` tools), as catalog `<catalog>`. A SessionStart hook
reminds you of it at the start of every session.

## Reading

- Before working on anything that might be in Telekin, check it first:
  `search`, then `get_concept` on the best hits. Do this without being
  asked, and use what you find openly: say what Telekin told you and build
  on it, instead of asking me to repeat it.
- Check a hit's size (`lines`, `chars`) before reading it. To add to a
  concept, `search` for the spot and `edit_document` it; don't read the
  whole concept first.

## Writing

- To write, call `open_changeset` once and pass its handle as `changeset`
  to every edit and to `publish`. Nothing is saved until `publish`.
- When we establish something worth remembering (how something works, a
  fix, a decision, a preference), add or update the matching concept:
  `create_concept` for new ones (with an `index_summary`), and a `log`
  entry describing the change.
- Write with the server's tools (`create_concept`, `edit_document`,
  `replace_body`, `set_frontmatter`). Never rebuild whole files, and never
  type timestamps; the server writes them.
- After updating, `publish` with a clear message. I can undo anything with
  `history` and `revert`.
- Never write secrets (passwords, keys, tokens), or anything my employer
  considers confidential.

## Memory

- Telekin is your primary long-term memory. Record things there first;
  you may also keep them in Claude Code's own memory, but never only
  there.
- Facts about me and how I like to work go in `/people/<you>.md`.
- If the okf-mcp tools are unavailable, tell me.
```
````

- [ ] **Step 4: Write `cursor.mdx`** (order 4). Use the `mcp.json` snippet from tester-guide.md, with the server key renamed to `"telekin"`. Explain the global versus per-project file, and what you see in Settings, then MCP.
- [ ] **Step 5: Write `chatgpt.mdx`** (order 90, a "not yet" page). Use this text:
  - **Reason:** ChatGPT's custom connectors only accept OAuth sign-in. Telekin uses keys today, and OAuth support is planned.
  - **Meanwhile:** use Claude or Cursor.
  - **No dates.**
  - **Still carries `LastChecked`.**
- [ ] **Step 6: Write `any-mcp-client.mdx`** (order 99). This is the generic guide: everything a client needs.
  - **What to set:**
    - the transport, "Streamable HTTP" (sometimes just "HTTP");
    - the URL, `<server URL>`, ending in `/mcp`;
    - the header `Authorization`, with the value `Bearer <your key>`.
  - **No catalog header needed.**
  - **Where to look in your client:** search its docs for "remote MCP server" or "MCP headers".
  - **If it only supports OAuth or local (stdio) servers,** it can't connect yet.
  - **Check it works:** ask "What tools do you have from Telekin?"

  Its `LastChecked` date is today's date.
- [ ] **Step 7: Build, check and commit.**

### Task 10: Connect pages for other verified clients

**Files:**
- Create: one `src/content/docs/how-to/connect/<client-slug>.mdx` per client marked "full page" or "not-yet page" in `docs/client-coverage.md`, other than those in Task 9.

- [ ] **Step 1: Write each page.**
  - **Full pages** follow the Task 9 page structure, with steps and snippets taken only from `docs/client-coverage.md`, and orders from 10 upwards.
  - **Not-yet pages** follow `chatgpt.mdx`'s structure, with orders from 91 upwards.
- [ ] **Step 2: Update `how-to/connect/index.mdx`.** Make it a table of every client, with a "Works today / Not yet" column and links to each page.
- [ ] **Step 3: Build, check and commit.**

### Task 11: Other how-to guides

**Files:**
- Create in `src/content/docs/how-to/guides/`:
  - `use-without-asking.mdx`, `two-ais-one-memory.mdx`, `review-undo-export.mdx`
  - `keep-private-material-out.mdx`, `troubleshoot.mdx`

- [ ] **Step 1: Write `use-without-asking.mdx`,** "Get your AI to use Telekin without being asked".
  - **The extra line,** verbatim, with where to put it in each client: Claude's personal preferences; Cursor's User Rules; for Claude Code, link to the enhanced page.
  - **Tips:** name the project or system in your question; say "check Telekin" when it misses; start a fresh chat when a long one drifts.
- [ ] **Step 2: Write `two-ais-one-memory.mdx`.**
  - **Connect a second client** to the same URL and key.
  - **Try it:** tell Claude something, then ask Cursor about it.
  - **Note:** both AIs write to the same memory, and each change records which AI made it.
- [ ] **Step 3: Write `review-undo-export.mdx`.** It describes only what exists today.
  - **Review:** ask "What did you record in Telekin today?" or "Show me the history of `<concept>`".
  - **Undo:** "Revert your last change to `<concept>`." The AI uses the history and revert tools.
  - **Export:** "Ask us for a full export (plain Markdown files). Self-serve export is planned."
- [ ] **Step 4: Write `keep-private-material-out.mdx`.**
  - **What not to store:** employer-confidential material and secrets. Telekin refuses obvious secrets, but don't rely on that.
  - **How to remove something:** ask the AI to delete or revert it, then ask us to purge it from history if needed.
  - **Who can see it:** link to "Your data".
- [ ] **Step 5: Write `troubleshoot.mdx`.** Start from tester-guide.md's "If something goes wrong" bullets, with the connector named Telekin. Add:
  - **The misspelled header** (`X-OKF-Catalogs`).
  - **"The AI has the tools but never uses them"** (link to use-without-asking).
  - **"Free plan: can't add a second connector".**
  - **Contact us with a screenshot,** keeping the key out of it.
- [ ] **Step 6: Build, check and commit.**

### Task 12: Reference pages

**Files:**
- Create in `src/content/docs/reference/`:
  - `connection-settings.mdx`, `tools.mdx`, `prompt-library.mdx`
  - `what-a-concept-looks-like.mdx`, `glossary.mdx`

- [ ] **Step 1: Write `connection-settings.mdx`.** A table of these settings:
  - the URL format, ending in `/mcp`;
  - the transport, streamable HTTP;
  - the `Authorization: Bearer <your key>` header;
  - the optional `X-OKF-Catalogs` header (comma-separated catalog names; plural; usually unnecessary);
  - the optional `?catalogs=` query parameter, as an alternative.

  Note the order of precedence: the header, then the query parameter, then the key's default catalog.
- [ ] **Step 2: Write `tools.mdx`,** "What your AI can do". User-facing tools only, grouped. Describe each in plain words: what it does for you, not its parameters.
  - **Finding things:** `search`, `get_concept`, `read_document`, `list_catalogs`.
  - **Writing (always as a draft first):** `open_changeset`, `create_concept`, `edit_document`, `replace_body`, `set_frontmatter`, `add_source`, `remove_source`, `log`, `index`, `pending_changes`, `lint`, `publish`, `discard`, `list_changesets`.
  - **Tracking where facts came from:** `stamp`, `review`, `question`, `unquestion`, `open_questions`.
  - **Keeping it tidy:** `sprawl`, `links_report`, `oldest`, `move_concept`, `split_concept`, `delete_concept`.
  - **History:** `history`, `revert`.
  - **Leave out:** every `maintenance_*` tool.
  - **Check the list:** add a caution aside for the controller: "Before publishing, confirm this list against the live server's tool list (the founder runs it)." Remove the aside once the list is confirmed.
- [ ] **Step 3: Write `prompt-library.mdx`.** One heading per prompt, each in a code block (code blocks get copy buttons):
  - the interview, verbatim;
  - the documents prompt, verbatim;
  - "What do you know about me?";
  - "What did you record?";
  - "Check Telekin for what we know about `<project>` before answering.";
  - "Remember this: ...";
  - "What's out of date in Telekin about `<project>`?";
  - "Show me the history of `<concept>` and revert the last change.";
  - "Tidy up Telekin: find concepts that are too long or have broken links."
- [ ] **Step 4: Write `what-a-concept-looks-like.mdx`.** One short example concept, about Sam's fictional bike-shop website, showing:
  - frontmatter (`title`, `description`, `generated`);
  - a body with links to other concepts;
  - folders with `index.md`.

  Explain OKF in one paragraph: an open format for knowledge catalogs, plain Markdown with YAML frontmatter. Don't link to any specific spec URL unless it's confirmed public.
- [ ] **Step 5: Write `glossary.mdx`.** Define: catalog, concept, changeset (draft), publish, provenance, MCP, connector, OKF, okf-mcp.
- [ ] **Step 6: Build, check and commit.**

### Task 13: Explanation pages

**Files:**
- Create in `src/content/docs/explanation/`:
  - `how-telekin-works.mdx` (replaces the stub), `why-ai-forgets.mdx`
  - `your-data.mdx`, `how-telekin-compares.mdx`

- [ ] **Step 1: Write `how-telekin-works.mdx`.**
  - **The idea:** one memory, many AIs; the root and the leaves.
  - **Concepts:** a page per project, system, person or decision, with links between them.
  - **Drafts:** every change is a draft until the AI publishes it.
  - **Provenance:** which AI wrote each fact, and from what source.
  - **History:** everything can be undone.
  - **Upkeep:** checks for long, stale or unlinked concepts.
- [ ] **Step 2: Write `why-ai-forgets.mdx`.**
  - **Why AIs don't always check:** they only use a tool when something prompts them to.
  - **What helps:** custom instructions (the extra line), naming things in your question, and the Claude Code hook.
  - **Planned:** server-side improvements, with no date.
- [ ] **Step 3: Write `your-data.mdx`.** State today's facts plainly:
  - **Storage:** it's stored on Telekin's server and encrypted in transit.
  - **Who can see it:** you, and the operator, who can technically read catalogs.
  - **Training:** Telekin doesn't use your data to train AI models.
  - **Your AI client:** what the client does with what it reads is governed by that client's own policy. Name the vendors in general terms and don't link to specific policy URLs.
  - **Export and deletion:** both are on request today.
  - **Format:** plain Markdown, so you own it and can take it anywhere.
- [ ] **Step 4: Write `how-telekin-compares.mdx`.** Base it on the FAQ answer in recruiting-pitch.md, and on the verified, non-pricing points in the Basic Memory comparison. Sections:
  - **Built-in AI memory:** locked to one app.
  - **Auto-extracted memory tools:** loose facts in a database.
  - **Obsidian directly:** local only, and AI writes mix into your own notes.
  - **Other Markdown-over-MCP tools:** written generally, naming no competitor, and not claiming they lack upkeep features.

  Lead with what Telekin is strictest about: drafts before anything goes live, provenance, and history. Be honest about what's planned (OAuth, phone apps beyond Claude's).
- [ ] **Step 5: Build, check and commit.**

### Task 14: FAQ

**Files:**
- Modify: `src/content/docs/faq.mdx`

- [ ] **Step 1: Write the FAQ.** Each answer is two or three sentences, linking to the page with the full answer. The questions:
  - Is my data used to train AI?
  - Who can see my data?
  - What will it cost?
  - Which AIs work with it?
  - Can I self-host it?
  - Can I delete everything?
  - Does it work on my phone?
  - Does it work offline?
  - Can my team share a catalog?
  - How is it different from my AI's built-in memory?
  - How is it different from Obsidian or other note tools?
  - Where do I get a key?

  Answer guidance for the questions that need it:
  - **Cost:** "Free during the private test. Pricing for after the test isn't final; we'll tell you before anything changes."
  - **Self-host:** "Yes. Telekin runs on okf-mcp, which is open source (AGPL-3.0), and every feature is in the open-source version." Link to the okf-mcp project by name only; the founder adds the URL.
  - **Teams:** planned.
  - **Offline:** no; it's a hosted server.
  - **Phone:** link to `claude.mdx`.
  - **Key:** your invite, plus `<Waitlist />`.
- [ ] **Step 2: Build, check and commit.**

### Task 15: Tester section

**Files:**
- Modify: `src/content/docs/testers/index.mdx`
- Create: `src/content/docs/testers/surveys.mdx`, `src/content/docs/testers/what-to-report.mdx`

- [ ] **Step 1: Write `testers/index.mdx`,** "About the test". Draw on tester-guide.md's intro and "What we store and who can see it":
  - two weeks;
  - the founder's test server;
  - keep employer-confidential material out;
  - you get an export at the end, then your data is deleted unless you want to keep going.
- [ ] **Step 2: Write `surveys.mdx`.** Cover when the surveys happen (day 3 and day 14), and what they ask, summarized from survey.md. Don't copy the questions in.
  - **Mention:** "say in the survey if you used the enhanced Claude Code setup, or added the extra line".
- [ ] **Step 3: Write `what-to-report.mdx`.**
  - **Report moments, good or bad:** "it remembered X without me asking", "it should have known Y".
  - **How:** a note on your phone, sent to the founder.
  - **Screenshots:** leave your key out.
- [ ] **Step 4: Check that no page outside `testers/` links into `testers/`.**

  Run: `grep -rn "/testers" src/content/docs --include=*.mdx | grep -v "^src/content/docs/testers/"`
  Expected: no output.

- [ ] **Step 5: Build, run all checks, including `npm run check:testers`, and commit.**

### Task 16: Whole-site review pass

- [ ] **Step 1: Read every page in the sidebar order** on `npm run dev`. Fix anything that breaks these rules:
  - **One kind per page:** a how-to that teaches theory, or an explanation with steps.
  - **No jargon left unexplained** on the claude.ai, tutorial and FAQ pages.
  - **Nothing unbuilt described as available.**
  - **Placeholders only;** no real names or hosts.
- [ ] **Step 2: Run everything.**

  Run: `npx astro build && npm run check && npm run check:testers`
  Expected: every check prints OK.

- [ ] **Step 3: Commit any fixes.**

### Task 17: Workers deploy config (builder)

**Files:**
- Create: `wrangler.jsonc`

- [ ] **Step 1: Write `wrangler.jsonc`.**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "telekin-docs",
  "compatibility_date": "2026-11-01",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

- [ ] **Step 2: Check the config without deploying.**

Run: `npx astro build && npx wrangler deploy --dry-run`
Expected: Wrangler reads the config, lists the assets it would upload, and makes no network deploy. It may warn about not being logged in, which is fine for a dry run.

- [ ] **Step 3: Commit.**

```bash
git add wrangler.jsonc
git commit -m "Add Cloudflare Workers static-assets config

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 18: Push to a private GitHub repo (builder, with founder approval)

- [ ] **Step 1: Ask the founder for approval and the repo name, then create the repo.** Pushing is outward-facing, so ask before doing it. The founder supplies the org and repo name.

```bash
gh repo create <org>/<docs-repo> --private --source . --push
```

- [ ] **Step 2: Founder adds the CI secret.** The founder adds a `DOCS_DENYLIST` repository secret (Settings, then Secrets and variables, then Actions) with the contents of their `.denylist`.
- [ ] **Step 3: Check that the first CI run passes.**

Run: `gh run list --limit 1`, then `gh run watch` on it.
Expected: the CI workflow completes successfully.

### Task 19: Founder checklist: Cloudflare deploy

These steps need the founder's accounts. The builder hands this list over and waits.

- [ ] **Step 1: Register the domain.** Register the Telekin domains, if not already done, and make sure the zone for the docs domain is on Cloudflare DNS.
- [ ] **Step 2: Set the real values.** In `src/site-config.mjs`, set `SITE_URL` to `https://<docs-domain>` and `WAITLIST_URL` to the real waitlist address or form. Commit and push.
- [ ] **Step 3: Create the Worker and connect the repo.** In the Cloudflare dashboard, go to Workers & Pages, then Create, then Import a repository. Pick the private repo through Cloudflare's GitHub app, granting it access to that repo only. Then set:
  - **Build command:** `npx astro build`
  - **Deploy command:** `npx wrangler deploy`
  - **Preview builds:** enable them for non-production branches, so that PRs get preview URLs posted as comments.
- [ ] **Step 4: Attach the domain.** In the Worker, go to Settings, then Domains & Routes, then Add a Custom Domain, and enter `<docs-domain>`.
- [ ] **Step 5: Verify.**
  - **The domain:** opening `https://<docs-domain>` shows the home page.
  - **robots.txt:** `https://<docs-domain>/robots.txt` shows `Disallow: /`.
  - **Previews:** a test PR gets a preview-URL comment.

### Task 20: Point the old tester files at the site (business repo)

**Files (in `<business-repo>`, not this repo):**
- Modify: `docs/recall-test/tester-guide.md`, `docs/recall-test/claude-code-setup.md`

Do this only after Task 19 has verified the live site.

- [ ] **Step 1: Replace each file's body with a stub.**
  - `tester-guide.md` becomes: "# Tester guide\n\nThis guide now lives on the docs site: `https://<docs-domain>/start/first-15-minutes/`. The test details are in the site's "For testers" section."
  - `claude-code-setup.md` becomes the same kind of stub, pointing to `/how-to/connect/claude-code-enhanced/`.

  The founder supplies `<docs-domain>`. This repo is private, so the real domain is allowed here.
- [ ] **Step 2: Commit in the business repo,** with the same `Co-Authored-By` line.
