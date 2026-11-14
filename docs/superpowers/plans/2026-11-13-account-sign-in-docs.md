# Account sign-in docs: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every page that tells a person how to get connected describes the account sign-in experience (setup email, signing in, approving in the browser, making your own key), and nothing describes sign-in codes or keys sent with an invite.

**Architecture:** Two new pages hold the steps that many pages share: setting up an account, and making a key for a developer tool. Every other page links to them instead of repeating them. Existing pages are edited in place, keeping their structure, voice and components (`Steps`, `LastChecked`, `Waitlist`).

**Tech Stack:** Astro 7 with Starlight, MDX content under `src/content/docs/`, checks in `scripts/` (`npm run check`, `npm test`, `npm run build`).

**Design (approved by the founder, 2026-11-13):** everyone is moving to real sign-in accounts, so the docs describe the sign-in experience only; no fallback section for old invites.

---

## How it works now (the facts every page must match)

The product is the okf-mcp server, version 0.15. Before writing a label, check it in the okf-mcp source (read-only), at `~/repos/okf_mcp/.worktrees/m14-design` (its `main` content):
- console pages: `src/http/ui/js/pages/my-keys.js`, `my-grants.js`, `account.js`, the shell `src/http/ui/js/core/shell.js`;
- sign-in, setup and reset pages: `src/http/signin.rs`, `src/http/pages.rs`;
- the OAuth consent page: `src/oauth/consent.rs`, `src/oauth/authorize.rs`;
- behaviour: `docs/operations.md`, "Signing in and self-service" and "OAuth connectors".

1. **The invite is a setup email.** Its link opens a page where the person chooses a password, registers a passkey, or both, and is signed in. The link works once and expires after 24 hours; a newer link replaces it. If it expired, they ask whoever invited them for a new one.
2. **The address.** The setup email's link is on the person's Telekin server. The console is that address (it opens the console, `/ui/`); AI apps connect to the same address with `/mcp` at the end. The docs never print a real address: say "the address in your setup email", and in examples use `https://telekin.example.com/mcp`.
3. **Signing in later:** email and password, or a passkey, on the sign-in page. "Forgot your password?" sends a reset link (works once, for 1 hour). Ten wrong passwords in a row lock the account for 15 minutes.
4. **Apps that sign in in the browser (Claude web and desktop, ChatGPT):** adding the connector opens Telekin's page. If the person isn't signed in, they sign in first. Then they tick the memories (catalogs) to share, choose read or write for each, pick the default, and choose Approve. Deny connects nothing. The connection appears on **My grants**, where it can be revoked.
5. **Developer tools (Claude Code, Cursor, VS Code, Windsurf, Codex CLI, Gemini CLI, Cline):** the person signs in to the console, opens **My keys**, and creates a key: a name (for example the tool's name), the memories it reaches with read or write for each, and when it expires (the server may cap the lifetime). The key is shown once. They put it in an environment variable, as the guides already show, and never paste it into a chat. Revoke it on **My keys**.
6. **What a person can share** is limited by what their account reaches: their teams' memories at the level the team allows, plus any memory shared with them. Asking for more access than that is refused (the console says which limit).
7. **Account page:** change password, add or remove passkeys, see and end sessions, see recent sign-ins.

## Rules for every task

- Keep each page's front matter, components and imports. Keep `<LastChecked date=... />` dates as they are unless you re-check that client's own docs (the date is about the client app's steps, not Telekin's).
- Plain words, short sentences, the site's existing tone. Explain a term the first time a page uses it.
- No sign-in codes, `okfsc_`, "key from your invite", "credentials in your invite", or admin-made keys anywhere, except the glossary entry removed in Task 6.
- No real hostnames, domains, IP addresses, personal names or emails. Placeholders only (`telekin.example.com`, `alice@example.com`).
- After each task: `npm run check && npm test && npm run build` must pass, and `grep -rniE "sign-in code|okfsc|your invite" src/content/docs` shows only what later tasks still have to change.
- Commit after each task with a message ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File map

| File | Change | Task |
|---|---|---|
| `src/content/docs/start/set-up-your-account.mdx` | Create | 1 |
| `src/content/docs/how-to/guides/make-a-key.mdx` | Create | 1 |
| `src/content/docs/start/first-15-minutes.mdx` | Rewrite the start: account, then connect Claude by signing in | 2 |
| `src/content/docs/start/index.mdx` | Mention the setup email and link Task 1's page | 2 |
| `src/content/docs/how-to/connect/index.mdx` | New intro and table column ("How it connects": "Sign in in the browser" or "A key you make") | 3 |
| `src/content/docs/how-to/connect/claude.mdx`, `chatgpt.mdx` | Sign in and approve, instead of a code | 3 |
| `src/content/docs/how-to/connect/claude-code.mdx`, `claude-code-enhanced.mdx`, `cursor.mdx`, `vscode.mdx`, `windsurf.mdx`, `codex-cli.mdx`, `gemini-cli.mdx`, `cline.mdx`, `any-mcp-client.mdx` | "You'll need" points to Make a key | 4 |
| `src/content/docs/how-to/guides/two-ais-one-memory.mdx`, `src/content/docs/reference/connection-settings.mdx` | Credentials wording | 5 |
| `src/content/docs/how-to/guides/troubleshoot.mdx` | New sign-in entries; remove code entries | 5 |
| `src/content/docs/reference/glossary.mdx`, `src/content/docs/faq.mdx`, `src/content/docs/testers/index.mdx` | Terms, answers, tester steps | 6 |

### Task 1: The two shared pages

- [ ] **Step 1:** Create `start/set-up-your-account.mdx` (sidebar order right after the Start here overview, before "Your first 15 minutes"; add a `link` entry in `astro.config.mjs`'s Start here list if that list is explicit). Content: what the setup email is; open the link; choose a password (12 or more characters) or a passkey, or both; you're signed in; the address of your Telekin (the console) and the address apps use (`/mcp` on the end); if the link expired; signing in later and "Forgot your password?"; the lockout; what the Account page is for. Use `Steps`.
- [ ] **Step 2:** Create `how-to/guides/make-a-key.mdx`: when you need a key (developer tools; apps that sign in in the browser don't); sign in, open **My keys**, create one, choose memories and read or write, expiry; copy it once; keep it in an environment variable, never in a chat or a committed file; one key per tool, so you can revoke one without the others; revoke on My keys; what a refusal above your access means.
- [ ] **Step 3:** Run the checks and build; commit `docs: add Set up your account and Make a key`.

### Task 2: Start here and the first 15 minutes

- [ ] **Step 1:** `first-15-minutes.mdx`: "Before you start" becomes "Set up your account" (one short paragraph plus a link to Task 1's page). "Connect Claude" steps 3 to 5 become: paste the address with `/mcp`; Claude opens Telekin's page; sign in if asked; tick your memory, choose read and write, Approve. Keep everything from "Add one line to your preferences" on unchanged.
- [ ] **Step 2:** `start/index.mdx`: the first steps mention the setup email and link the new page.
- [ ] **Step 3:** Checks, build, commit `docs: the first 15 minutes start with your account`.

### Task 3: Connect overview, Claude and ChatGPT

- [ ] **Step 1:** `how-to/connect/index.mdx`: replace "Two kinds of credential are in your invite..." with: some apps sign in in your browser with your Telekin account; developer tools use a key you make yourself (link Make a key). Rename the table's "Uses" column to "How it connects", values "Sign in in the browser" or "A key you make".
- [ ] **Step 2:** `claude.mdx` and `chatgpt.mdx`: the sign-in steps become sign in, choose memories and levels, Approve; mention My grants for revoking. Keep their LastChecked dates and every client-side step.
- [ ] **Step 3:** Checks, build, commit `docs: Claude and ChatGPT connect by signing in`.

### Task 4: The developer-tool guides

- [ ] **Step 1:** In each of the nine files, "You'll need: your server URL and key (from your invite)" (or its variant) becomes "You'll need: your Telekin address with `/mcp` at the end, and a key you make for <tool> ([Make a key](/how-to/guides/make-a-key/))". Replace any other invite wording in the body the same way. `any-mcp-client.mdx` covers both ways (sign in in the browser for OAuth clients, a key otherwise).
- [ ] **Step 2:** Checks, build, commit `docs: developer tools use a key you make`.

### Task 5: Guides and reference

- [ ] **Step 1:** `two-ais-one-memory.mdx` and `reference/connection-settings.mdx`: credential wording as above.
- [ ] **Step 2:** `troubleshoot.mdx`: remove sign-in code entries; add: the setup link expired or was already used; forgot password; "Email or password is incorrect" after many tries (locked for 15 minutes); a memory doesn't appear when approving or making a key (your account doesn't reach it: ask the person who invited you); a key is refused as above your access; a connection stopped working (check My keys or My grants, it may have expired or been revoked).
- [ ] **Step 3:** Checks, build, commit `docs: guides and reference for account sign-in`.

### Task 6: Glossary, FAQ, testers

- [ ] **Step 1:** `glossary.mdx`: remove "sign-in code"; add or update **account**, **console** (your Telekin's web pages), **grant** (an app connection you approved in the browser), **key** (one you make on My keys).
- [ ] **Step 2:** `faq.mdx` and `testers/index.mdx`: every answer or step about codes or keys from an invite now describes the setup email and the two ways to connect. Keep `npm run check:testers` passing.
- [ ] **Step 3:** Final grep: `grep -rniE "sign-in code|okfsc|in your invite|from your invite" src/content/docs` prints nothing.
- [ ] **Step 4:** Checks, `npm run check:testers`, build, commit `docs: glossary, FAQ and tester steps for account sign-in`.
