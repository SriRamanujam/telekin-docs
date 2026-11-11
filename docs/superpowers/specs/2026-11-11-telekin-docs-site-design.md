# Telekin docs site: design

**Date:** 2026-11-11

**Status:** Draft, awaiting the founder's approval.

Real hostnames, domains and repo names are kept out of this document on
purpose. They're given to the builder separately:
- `<docs-domain>`: the docs site's public domain.
- `<org>/<docs-repo>`: the new public GitHub repository, under the company's
  GitHub org.
- `<server URL>`: the MCP endpoint each user receives privately.

## Intent

Telekin is the hosted product built on the open-source okf-mcp server. It is
a knowledge catalog that all of a person's AI tools share, so every AI
"already knows" their world.

Right now a handful of testers use it, guided by two Markdown files in
the company's private business repo:
- `docs/recall-test/tester-guide.md`;
- `docs/recall-test/claude-code-setup.md`.

The founder wants a real docs site that:
1. gets testers set up on whichever AI tool they use, and helps them get
   the most out of it (setup guides, generic MCP instructions, tips,
   tricks and an FAQ);
2. becomes the first version of the **public Telekin docs** at
   `<docs-domain>`, so nothing has to be rewritten at launch.

The founder likes the Diataxis framework, and the site follows it.

Success looks like this: a new tester goes from invite to a working
connection and their first "it remembered" moment using only the site.
Their questions get answered by a page, not a DM to the founder.

## Audience

- **Now:** testers. They're a mix of developers (Claude Code, Cursor) and
  non-technical people (claude.ai).
- **Later:** the public. Individuals first, then teams.
- **Writing level:** a non-technical claude.ai user must be able to follow
  the Claude pages and the tutorial. Developer pages can assume a terminal.

## Goals

- Setup guides for every major AI client that can connect today, a
  generic guide for any MCP client, and honest "not yet" pages for clients
  that can't connect yet.
- Diataxis structure: tutorials, how-to guides, reference and explanation,
  each kept to its own kind.
- An FAQ.
- Tips and tricks, placed where Diataxis puts them (see Information
  architecture).
- A tester section that's fenced off so it can be deleted at launch.
- PR preview deploys, so the founder can review changes as a rendered site.

## Non-goals (for this version)

- Docs for operators self-hosting okf-mcp. Those stay in the okf-mcp repo;
  this site links to it.
- API or developer reference for building on Telekin.
- Translations, a blog, a changelog page, versioned docs.
- Login or gating. The site is public; nothing on it is secret.
- Being found by search engines, before signup exists (see Access and
  indexing).
- Marketing landing pages. The docs may say what Telekin is, but the
  landing page is a separate effort.

## Anti-goals (would make this a failure even if it works)

- **Inaccurate setup steps.** Client menus and config formats change
  often. Never write a client page from memory. Each one is checked against
  that client's current official docs, and shows a "Last checked:
  YYYY-MM-DD" line.
- **Promising what isn't built.** ChatGPT (and anything else that needs
  OAuth) gets a "coming soon" page with the reason, not instructions. Don't
  describe pricing as final.
- **Leaking anything private.** No real server URLs, keys, internal
  hostnames or personal names. Examples use placeholders (`<server URL>`,
  `<your key>`, catalog `t01`) and a fictional person.
- **Cold, jargon-heavy writing.** The brand voice is warm and plain. "MCP",
  "changeset" and "OKF" are explained the first time they appear on a page,
  or avoided on pages for non-technical users.

## Constraints

- Astro **Starlight** (founder's choice). It's static output, so no Astro
  adapter is needed. Use Starlight's built-in search (Pagefind).
- Hosted on **Cloudflare Workers static assets** (founder's choice; Pages
  is in maintenance mode), deployed through **Workers Builds**:
  - production deploys from `main`;
  - **preview builds on every PR** post the preview URLs back on the PR;
  - the custom domain is `<docs-domain>`.
- A **new private repo**, `<org>/<docs-repo>`, separate from okf-mcp, with
  this design in it (founder's choice). Workers Builds deploys from a
  private repo through Cloudflare's GitHub app. Make it public around
  launch. Until then, don't use Starlight's "Edit this page" links. License
  the docs content CC BY 4.0, and the site code (config, components) MIT,
  unless the founder says otherwise. This is the builder's call, marked for
  the founder's review.
- The server's Claude Code tool names (`mcp__okf-mcp__*`) depend on the
  server name `okf-mcp` in `claude mcp add`. Claude Code pages keep that
  name, and explain it in one line ("Telekin runs on the open-source
  okf-mcp server").

## Approaches considered

| Approach | Trade-off | Outcome |
|---|---|---|
| **A. Starlight on Cloudflare Workers, public repo** | Free; PR previews; easy custom domain; adds one vendor account. | **Chosen.** Previews matter most when one person reviews many generated pages. |
| B. Starlight on GitHub Pages | No new vendor; no PR previews. | Rejected: reviewing generated docs without previews is slow. |
| C. The founder's own cluster | Plays to the founder's strengths. But public docs uptime depends on homelab infra, it's ops work for a static site, and it mixes homelab and business infra. | Rejected. |
| A private, tester-only site (e.g. one published page) | Fastest, but gets rewritten at launch. | Rejected in favor of starting the public docs now. |

Cloudflare **Pages** was considered and dropped for Workers, since new
Cloudflare features go to Workers only.

## Information architecture

Starlight sidebar, one group per Diataxis type. Page titles are working
titles.

```
Start here (tutorials)
  Your first 15 minutes: connect one AI, get interviewed, see it remember
  Fill Telekin from documents you already have
How-to guides
  Connect your AI
    Claude (claude.ai web, desktop, mobile)
    Claude Code: basic
    Claude Code: enhanced (the CLAUDE.md block plus the SessionStart hook)
    Cursor
    [other clients: see "Client coverage"]
    ChatGPT (coming soon: needs OAuth)
    Any other MCP client (generic)
  Get your AI to use Telekin without being asked
  Use two AIs on one memory
  Review, undo and export what your AI wrote
  Keep private or work material out
  Troubleshoot a connection
Reference
  Connection settings (URL, Authorization header, X-OKF-Catalogs)
  What your AI can do (the tools, in plain language)
  Prompt library (copy-paste prompts)
  What a concept looks like (OKF basics)
  Glossary
Explanation
  How Telekin works (concepts, drafts, publishing, history)
  Why your AI sometimes forgets to check, and what fixes it
  Your data (who can see it, ownership, export, deletion)
  How Telekin compares (built-in memory, Mem0-style tools, Basic Memory, Obsidian)
FAQ
For testers (removable at launch)
  About the test (timeline, what's stored, what happens at the end)
  Surveys (day 3 and day 14)
  What to report, and how
```

- **Tips and tricks** aren't a Diataxis type. They live in:
  - "Get your AI to use Telekin without being asked" (how-to);
  - the prompt library (reference);
  - "Why your AI sometimes forgets to check" (explanation).

  A short "Tips" landing page may link into these. That's the builder's
  call.
- **FAQ:** its own top-level page. Each answer is two or three sentences
  and links to the page with the full answer. The starting set:
  - Is my data used to train AI?
  - Who can see my data?
  - What will it cost after the test?
  - Which AIs work with it?
  - Can I self-host it?
  - Can I delete everything?
  - Does it work on my phone or offline?
  - Can my team share a catalog?
  - How is it different from my AI's built-in memory?
  - How is it different from Obsidian or Basic Memory?
- **The tester section** is the only place that mentions the test, surveys,
  "the founder's test server" or tester terms. Every other page reads as
  public docs. Deleting the section at launch must not break any link from
  the rest of the site.

## Client coverage

Before writing client pages, the builder checks each candidate against its
current official docs for three things: remote **streamable HTTP** MCP, a
**custom `Authorization` header** (bearer key), and **write** tools. Then:
- **Clients that support all three** get a full how-to page.
- **Clients that need OAuth or lack HTTP support** get a short "not yet"
  page that says why.
- **Clients that can't be confirmed** are left out, and listed for the
  founder.

Already known:
- **claude.ai** works: custom connector, "No sign in", request header.
  Free plans allow one connector.
- **Claude Code** works (`claude mcp add --transport http ... --header`).
- **Cursor** works (`mcp.json` `headers`).
- **ChatGPT** custom connectors are OAuth-only, so not yet.

Candidates to check: Claude Desktop, Claude mobile, VS Code (GitHub Copilot
agent mode), Windsurf, OpenAI Codex CLI, Gemini CLI, Zed, Cline, Continue,
JetBrains AI Assistant, LM Studio.

## Content sources

Move these existing materials into the new structure. Don't link to them.
The `docs/...` paths below are in the private business repo, not this one.
The founder gives the builder access to them.
- **`docs/recall-test/tester-guide.md`** becomes the claude.ai, Claude Code
  and Cursor how-tos, the troubleshooting page, the interview tutorial, the
  "extra line" (in the "without being asked" how-to) and the tester
  section.
- **`docs/recall-test/claude-code-setup.md`** becomes "Claude Code:
  enhanced".
- **The FAQ section of `docs/recall-test/recruiting-pitch.md`** goes into
  the FAQ and the "How Telekin compares" page. Drop its founder-only notes.
- **`docs/research/2026-11-11-basic-memory-comparison.md`** feeds "How
  Telekin compares". Only include verified claims, and don't put
  competitor pricing on the site.
- **The okf-mcp server's tool descriptions**, in the okf-mcp repo, are the
  source for the "What your AI can do" reference. Describe what a tool
  does for the user, not its parameters.

Once the site is live, the two recall-test files in this repo become stubs
that point to the site.

## Voice and style

- Warm, plain and second person. The brand voice carries the warmth. The
  feeling is "your AI already knows you", and "never explain yourself
  twice". Use "telepathy for your AIs" sparingly.
- Short pages. One task per how-to. Number the steps, and describe what the
  user sees after each important one.
- Copy buttons on every prompt and command (Starlight code blocks do this).
- Use Starlight asides for warnings, e.g. "include the word `Bearer` and a
  space".
- Each page states its Diataxis type through its sidebar group only; don't
  label pages "Tutorial:" in their titles.

## Access and indexing (founder's decision)

- **The whole site is `noindex`** until public signup exists: a robots meta
  tag on every page plus a `robots.txt` that disallows everything. It's one
  setting to remove at launch.
- **Setup pages and the first tutorial** say the server URL and key come
  "from your invite".
- **A "Want access? Join the waitlist" link** goes on the home page, in
  the header or sidebar, and in the "before you start" part of setup
  pages. It points to `<waitlist link>`: an email address until there's a
  form. Keep it in one config value, so swapping it later is one change.

## Settled after review

Decisions made after the builder check. Items marked "planner's call" were
settled without the founder; the founder can override any of them.

- **Describe only what exists (planner's call).**
  - Anything not built yet (signup, OAuth, billing, teams, self-serve
    export, a web viewer) is described as "planned", with no dates and no
    prices.
  - The "Your data" page and the FAQ state today's facts plainly: the
    operator can technically read catalogs; export and deletion are done on
    request; Telekin itself doesn't train AI models.
  - What a connected AI client does with what it reads is governed by that
    client's own policy. Say so, and link to it.
- **Review, undo and export (planner's call).**
  - Today, review and undo happen by asking the AI: it has history and
    revert tools. The how-to teaches that, with prompts.
  - Export is "ask us" until a self-serve export exists.
- **Recall (planner's call).** The server update for proactive recall
  hasn't shipped. Keep the "extra line" custom instruction in the "without
  being asked" how-to, and don't label it "until the next update". The site
  is updated when the update ships.
- **Claude Code: enhanced (planner's call).** Write a simpler public
  version. Drop the founder conventions (AGENTS.md, the `by:` credit
  argument, "this is a test server"). Keep the hook, the core reading and
  writing rules, the verification steps and the undo steps.
- **Tool list (planner's call).**
  - The hosted server runs the private hosted copy of okf-mcp, in sync with
    the public repo.
  - "What your AI can do" covers user-facing tools only. Leave out
    `maintenance_*` and admin tools.
  - The builder confirms the list against the live server's tool list (the
    founder can run it) before publishing.
- **Prompts (planner's call).**
  - The prompts are written for the AI, not the reader, so naming tools
    in them ("open a changeset… publish") is fine.
  - Keep the tested interview prompt word for word during the test.
  - The text around a prompt stays plain-language.
- **Infrastructure (planner's call).** The plan splits the work:
  - **The builder** creates the public repo with `gh` and builds the site.
  - **The founder** registers the domain and puts it on Cloudflare DNS,
    creates the Cloudflare account, connects Workers Builds to the repo,
    and attaches `<docs-domain>`. These are a checklist in the plan, placed
    where they block.

## Left to the builder

- Theme, colors and logo placeholder. Keep Starlight's defaults plus a
  simple wordmark, until there's a brand.
- Sidebar order within groups, and the exact page titles and slugs.
- Whether to use Starlight components (Tabs, Steps, Cards). Steps for
  how-tos and Tabs for OS variants are recommended.
- Repo tooling: link checking in CI (recommended, since tester-section
  removal must not break links), formatting, and a PR template.
- How the "Last checked" date is shown (frontmatter rendered in the page,
  or a line in the body).
