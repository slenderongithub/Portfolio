# Project Audit — Shubhadeep Datta Portfolio

**Scope:** Full static-site codebase audit (architecture, code quality, security, accessibility, SEO, performance, UX/UI).
**Method:** Full read of every HTML/CSS/JS/JSON/config file, git history review, dependency/tooling inspection, syntax checks. No `node_modules` was present and no browser-automation tool was available in this session, so this audit is **code-level only** — visual/interaction QA (contrast, animation feel, responsive breakpoints in a real viewport) is flagged as "needs manual verification" rather than asserted as fact.

---

## 1. Executive Summary

This is a **single-tenant, zero-framework, zero-build static portfolio** (plain HTML/CSS/vanilla JS) deployed on Netlify, with one serverless function (`contact.js`) handling the contact form via Resend with a FormSubmit fallback. It is unusually ambitious for "vanilla JS" — a Three.js icosphere brain, a hand-rolled scroll-snap navigation engine, a 3-D isometric project card stack, a magnifying-glass cursor lens, a fake terminal/VS Code explorer, and a rotating skills globe, all built from scratch without any UI or animation library.

The engineering is generally competent — the contact function in particular is well-hardened (rate limiting, honeypot, origin allowlist, HTML escaping, payload caps). The main risks are **not bugs so much as accumulated complexity and duplication**: the same project data is maintained in up to four different places, an entire client-side "AI description generator" feature is shipped but never called, and the scroll/section-navigation system in `app.js` has grown into ~250 lines of manual lock/timer choreography to do what CSS scroll-snap + `IntersectionObserver` could do far more simply. There is no build tooling, no linter, no test suite, and no CI — acceptable for a portfolio of this size today, but it means regressions (like the currently-uncommitted Stage Manager feature) are caught only by hand.

**Overall grade: solid, characterful, slightly over-engineered in the JS layer, under-tooled for its own ambition.**

---

## 2. Strengths

- **No framework bloat.** Zero runtime dependencies shipped to the browser; the only external script is Three.js, loaded on demand via dynamic `import()` and pinned to `@0.160.0`.
- **Defense-in-depth on the contact function**: origin allowlist, in-memory rate limiting, honeypot field, body-size cap, HTML-escaped email content, graceful Resend → FormSubmit → log fallback chain.
- **Thoughtful CSP** in `netlify.toml` with explicit `script-src`/`style-src`/`connect-src` allowlists, `X-Frame-Options: DENY`, and `object-src 'none'`.
- **Consistent component-scoped CSS naming** (`sidebar-*`, `hero-*`, `edu-tl-*`, `pt-*`, `sm-*`) makes the 1,896-line `styles.css` navigable despite having no preprocessor or methodology.
- **Anti-FOUC theme boot script** (inline, blocking, try/catch-guarded) is a correct, professional pattern for avoiding a flash of the wrong theme.
- **Graceful 3-D degradation**: `brain.js` falls back to DOM nodes if WebGL/Three.js fails to load, rather than leaving a blank hero.
- **No image assets at all** — every visual is SVG, canvas, or CSS gradient, which keeps the page featherweight (1.3 MB total repo, including the resume PDF).
- **Deliberate rate-limit/honeypot/CSP choices show real security awareness**, not just copy-pasted boilerplate.

---

## 3. Weaknesses (headline list — details in §5)

1. Project/skill content is duplicated across 3–4 sources with no single source of truth.
2. An entire "Gemini AI description enhancer" feature is dead code, shipped to production, with a client-side API-key storage pattern that would leak a real key if anyone ever used it.
3. `github-loader.js` computes `terminalCards` that are never consumed anywhere.
4. The scroll-driven section navigation in `app.js` is a large, fragile, hand-built state machine.
5. No linting, formatting, test, or CI configuration exists.
6. `contact.html` duplicates the entire sidebar markup and keeps its own ~280-line embedded `<style>` block instead of using `styles.css`.
7. No SEO essentials: no Open Graph/Twitter meta tags, no `robots.txt`, no `sitemap.xml`, no canonical URL.
8. `unsafe-inline` in the CSP `script-src`/`style-src` weakens the otherwise-good CSP.
9. Unpinned CDN dependency (`devicon@latest`) next to a pinned one (`three@0.160.0`) — inconsistent supply-chain hygiene.
10. Client-side, unauthenticated GitHub API calls with no caching/backoff — will silently degrade under GitHub's 60 req/hr unauthenticated rate limit.

---

## 4. Architecture Overview

```
Portfolio/
├── index.html            Single-page app shell: sidebar nav + 5 "windows"
│                          (home/repos/experience/education/skills), scroll-
│                          snapped and switched by JS, not real routing.
├── contact.html           Separate page, duplicate sidebar markup + its own
│                          inline <style> block (~280 lines) and inline <script>
│                          for the form (fetch → Netlify function).
├── styles.css              1,896 lines, single global stylesheet, no build step,
│                           no CSS variables preprocessor — plain custom properties.
├── js/
│   ├── app.js              (1,010 lines) theme, sidebar, dot-grid canvas bg,
│                            scroll-snap "window" navigation engine, experience
│                            carousel, education timeline reveal, skills globe.
│   ├── brain.js             Three.js icosphere + project nodes in the hero;
│                            DOM fallback if WebGL/Three.js import fails.
│   ├── github-loader.js     Fetches live repos from GitHub REST API (unauth),
│                            merges with data/projects-descriptions.json.
│   ├── description-enhancer.js  Unused Gemini API client-side description
│                            generator (dead code, see Finding S-1).
│   ├── project-terminal.js  (916 lines) Fake shell + VS-Code-style file
│                            explorer with a hardcoded PROJECTS array
│                            (separate from github-loader's data).
│   ├── stage-manager.js     (untracked, new) 3-D isometric card stack, wires
│                            clicks to project-terminal.js's showProjectInTerminal.
│   └── lens.js               Magnifying-glass custom cursor effect (DOM clone
│                             + CSS transform), disabled on touch devices.
├── data/
│   ├── projects-descriptions.json   17 short blurbs keyed by repo name.
│   └── projects-details.json        11 longer descriptions + bullet points,
│                                     including a "Dumbathon" entry unused
│                                     anywhere else in the codebase.
├── netlify/functions/contact.js     Serverless contact-form handler (Resend
│                                    + FormSubmit fallback, rate limit, honeypot).
├── netlify.toml            Build/publish config, redirects, CSP + cache headers.
├── pdf/Shubhadeep_Resume1.pdf
└── package.json             No app dependencies; netlify-cli as a devDependency
                              for local `npx netlify dev` only.
```

**Data flow for "projects" is the most tangled part of the system** — there are effectively four independent representations of the same handful of projects:
1. `data/projects-descriptions.json` (short blurb, keyed by GitHub repo name)
2. `data/projects-details.json` (longer description + bullet points, different key set, includes orphaned entries like "Dumbathon")
3. The hardcoded `PROJECTS` array inside `project-terminal.js` (name, tech stack, file tree, GitHub URL — richest and most curated)
4. Whatever the GitHub REST API returns live, merged with #1, for the hero brain nodes

None of these four is derived from another; each was hand-authored separately. Any project change (rename, new tech stack, updated pitch) has to be made in up to three files by hand.

---

## 5. Detailed Findings

Legend — **Impact**: effect on users/maintainers if left unaddressed. **Difficulty**: rough effort to fix.

### Critical
*(None. No data-loss, outage, or active-exploit-level issues were found.)*

### High

| ID | Finding | Impact | Difficulty |
|----|---------|--------|------------|
| H-1 | **Four parallel sources of truth for project content** (`projects-descriptions.json`, `projects-details.json`, `project-terminal.js`'s `PROJECTS` array, live GitHub API). Content drifts every time one is updated without the others. | High — every future edit risks visible inconsistency between the brain tooltip, the terminal `README.md` view, and the live repo description. | Medium — consolidate into one JSON file consumed by both `github-loader.js` and `project-terminal.js`. |
| H-2 | **Dead "AI description enhancer" feature** (`description-enhancer.js`) is loaded on every page view but `enhanceRepoDescriptions`/`applyDescriptionsFromCache` are never called from anywhere in the codebase. It exposes a console-only API (`window.setGeminiApiKey`) that stores a Google Gemini key in `localStorage` and sends it as a URL query parameter directly from the browser. | Medium-High — pure dead weight today, but it is a live security footgun for future-you: if this "hidden feature" is ever activated (e.g. during dev testing) the API key sits in `localStorage` and travels in a URL, both of which are trivially readable via devtools, browser history, and any XSS. It also increases the audit surface for anyone reviewing the shipped JS. | Low — delete the file and its `<script>` tag, or move key handling server-side if the feature is wanted later. |
| H-3 | **Hand-built scroll-navigation engine** in `app.js` (`lockNavClicks`, `beginSectionAutoScroll`, `lockNavActivation`, `scheduleNavActivationRelease`, `getCandidateWindowIdAtScrollTop`, plus a `requestAnimationFrame` "settle" polling loop) — roughly 250 lines coordinating scroll-snap CSS, `IntersectionObserver`, and manual timers to keep the sidebar's active-item highlight in sync with scroll position. | High for maintainability — this is the most fragile part of the codebase; trackpad momentum scrolling, fast repeated nav clicks, or browser scroll-snap quirks are the most likely source of any "nav highlight is wrong" or "page jumps" bug report. | High — a real simplification requires re-deriving the desired UX from scratch with fewer moving parts (see Implementation Plan Phase 3). |
| H-4 | **No linting, formatting, test, or CI configuration** anywhere in the repo (no `.eslintrc*`, no `.prettierrc*`, no `.github/workflows`, no test framework). `npm run lint:functions` only runs `node --check` (syntax, not lint) on one file. | Medium-High — regressions like the currently-uncommitted, not-fully-wired Stage Manager feature (see L-3) can land without any automated check. | Medium — add ESLint + Prettier configs and a minimal GitHub Actions workflow that runs them plus `node --check` on all JS. |

### Medium

| ID | Finding | Impact | Difficulty |
|----|---------|--------|------------|
| M-1 | **`terminalCards` computed by `github-loader.js` is never consumed.** `loadProjectsFromGitHub()` builds and returns both `projectNodes` (used by `brain.js`) and `terminalCards` (unused anywhere in the codebase). | Medium — wasted GitHub API calls' worth of data transformation, and a maintenance trap for the next person who assumes it's wired up. | Low — either wire it in or delete the dead branch. |
| M-2 | **`contact.html` duplicates the entire sidebar markup** from `index.html` (nav items, hamburger, backdrop, theme toggle) and carries its own ~280-line inline `<style>` block instead of using `styles.css`. | Medium — any sidebar/nav change (new section, renamed icon, a11y fix) must be made in two files by hand, and already risks drift (e.g. `contact.html`'s sidebar omits the `active` state logic that `app.js` drives dynamically only through class toggling, not initial markup). | Medium — extract the sidebar into one HTML partial (even a simple string template injected by a shared script) and move contact-page-specific CSS into `styles.css` under a `contact-*` namespace. |
| M-3 | **CSP `script-src`/`style-src` include `'unsafe-inline'`**, which is required today because of the inline anti-FOUC theme scripts and the inline `<style>`/`<script>` blocks in `contact.html`. This significantly weakens the CSP's XSS mitigation value. | Medium — the CSP is otherwise strong (`object-src 'none'`, explicit allowlists); `unsafe-inline` is the biggest hole in it. | Medium — move the inline theme-boot script to an external file and switch to a nonce or hash-based CSP directive; requires the Netlify build to inject a per-deploy nonce or precomputed hashes. |
| M-4 | **No SEO fundamentals**: no Open Graph or Twitter Card meta tags, no `robots.txt`, no `sitemap.xml`, no canonical link. Only a single `<meta name="description">` per page. | Medium — link previews on LinkedIn/X/Slack/Discord will show no image and a generic title; search engines have no sitemap to crawl efficiently. For a portfolio meant to be shared, this directly reduces its usefulness as a "send this to a recruiter" link. | Low — add OG/Twitter tags, a static `robots.txt`, and a two-URL `sitemap.xml`. |
| M-5 | **Unauthenticated, uncached client-side GitHub API calls** (`github-loader.js` hits `api.github.com` directly from the visitor's browser on every page load). GitHub enforces a 60 requests/hour **per IP** limit for unauthenticated calls, shared across all visitors behind the same NAT/office IP. | Medium — under any real traffic spike (e.g. the portfolio link goes around an office or a class), some visitors will silently get zero brain nodes with only a console warning, no user-visible fallback message. | Medium — proxy the GitHub call through a Netlify function with a server-side token and a short cache (mirrors the pattern already established by `contact.js`). |
| M-6 | **Orphaned/inconsistent project data**: `data/projects-details.json` contains a "Dumbathon" entry that appears nowhere else in the site (not in the curated terminal list, not in the stage manager cards) — dead content with no corresponding project. | Low-Medium — confusing for future maintainers; if "Dumbathon" is a real repo GitHub might surface it in the live-loaded brain nodes with an inconsistent voice/tone versus the curated copy. | Low — remove or reconcile. |
| M-7 | **Inconsistent CDN pinning**: Three.js is pinned to an exact version (`three@0.160.0`) but the devicon stylesheet is loaded via `devicon@latest`, and Google Fonts is loaded unpinned (expected/acceptable for fonts, but worth being consistent about intent). | Low-Medium — an unannounced upstream devicon release could change icon markup/class names and silently break the skills globe icons with no local fallback. | Low — pin to a specific devicon release tag. |
| M-8 | **Duplicate theme-boot IIFE** is copy-pasted verbatim into both `index.html` and `contact.html` `<head>` blocks (intentional for anti-FOUC performance, but still a literal duplication risk — if the theme storage key or logic changes, it must change in two places). | Low-Medium — acceptable trade-off for perf, but should be called out explicitly as an intentional exception rather than silently forked. | Low — extract to a tiny shared snippet generation step if a build step is ever introduced (Phase 3+); otherwise, comment both copies pointing at each other. |

### Low

| ID | Finding | Impact | Difficulty |
|----|---------|--------|------------|
| L-1 | Heavy use of `!important` in the `.portfolio-glass-card` utility block (~30 declarations) in `styles.css`, indicating specificity fights with earlier, more specific selectors (`.edu-tl-card`, `.exp-float-card`) rather than a clean cascade. | Low-Medium — makes future style overrides harder; a sign the "glass card" pattern should have been the base component style from the start. | Medium — consolidate glass-card styling into one base class and remove the later `!important` patch layer. |
| L-2 | 16 `console.log`/`console.warn`/`console.error` calls remain across `js/` and `netlify/` (some intentional for the fake terminal's flavor text, some are real debug leftovers, e.g. `description-enhancer.js`'s cache logging). | Low — noisy console in production; harmless but unpolished. | Low — audit and remove non-terminal-flavor debug logging. |
| L-3 | **Uncommitted Stage Manager feature is incompletely wired**: `styles.css` defines a `.sm-hint` class (hint text below the 3-D card stack) but no corresponding element exists in `index.html`'s current markup — dead CSS until an element is added. | Low — cosmetic only; the hint text simply never renders. | Low — add the element or remove the unused CSS rule. |
| L-4 | Hero "tech chips" list (18 items: Python…AWS) and the Skills-section globe pill list (22 items) overlap only partially — e.g., "Linux" and "AWS" appear only in the hero chips, not the globe, and vice versa for several tools. | Low — minor inconsistency in how the same skill set is represented across two sections of the same page. | Low — reconcile into one canonical skills list consumed by both. |
| L-5 | No automated accessibility check was possible in this session (no browser tool available). Color-contrast of muted/glass-card text against dynamic backgrounds, and the `cursor: none` behavior of the magnifying lens for non-mouse pointer users, should be manually verified against WCAG 2.1 AA. | Unknown until verified — flagged, not confirmed. | Low (verification) / Medium (fixes if needed). |
| L-6 | No automated test suite exists for any of the interactive JS (scroll engine, terminal command parser, lens, globe). For a project this JS-heavy, that's a real gap even for a portfolio site. | Low today (small blast radius, single maintainer) but grows with every added feature. | Medium — even a handful of Playwright smoke tests (open each nav section, run a few terminal commands, toggle theme) would catch most regressions cheaply. |

---

## 6. What Could Not Be Verified in This Session

- **Visual/interaction QA** (does the lens actually track correctly, does the isometric card stack look right at various viewport widths, real color-contrast ratios) — no browser-automation tool was available.
- **`npx netlify dev` / build execution** — no `node_modules` present and no network-installed `netlify-cli`; `npm install` was not run since this audit was instructed to make no changes. Syntax (`node --check`) passed on all 7 JS files and the one Netlify function.
- **Lighthouse/PageSpeed-style performance numbers** — not measurable without a live/browser session; the architecture (no bundler, no image weight, CDN-loaded Three.js only on the hero) suggests it should score well, but this is inferred, not measured.

---

## 7. Summary Scorecard

| Dimension | Assessment |
|---|---|
| Architecture | Workable for its size, but the "no build step" choice is starting to strain under the project's own ambition (4 duplicated data sources, a 250-line hand-rolled scroll engine). |
| Code quality | Generally clean, consistent naming, but dead code (H-2, M-1) and CSS specificity debt (L-1) need cleanup. |
| Security | Backend (contact function) is genuinely well-hardened. Frontend has one real footgun (H-2) and one CSP weak spot (M-3). |
| Accessibility | ARIA labels present on most interactive controls; contrast and focus-management need manual verification. |
| SEO | Missing fundamentals (M-4) — the single biggest easy win in this audit. |
| Performance | Likely good in practice (no images, deferred 3-D, CDN-cached fonts) but unmeasured. |
| Maintainability | The weakest dimension — data duplication (H-1) and the scroll engine (H-3) are the two things most likely to cause pain as the site grows. |
| Tooling | Minimal — no lint/format/CI/tests (H-4). |
