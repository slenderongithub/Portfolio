# Implementation Plan — Shubhadeep Datta Portfolio

Companion to `PROJECT_AUDIT.md`. Tasks are grouped into phases ordered roughly by risk-reduction-per-effort. Each phase is independently shippable — none blocks the others except where noted under "Depends on."

Checkboxes are for tracking; nothing in this file should be treated as already done.

---

## Phase 0 — Quick Wins (no architecture change, low risk, do first)

- [ ] **Delete dead "AI description enhancer" feature** — remove `js/description-enhancer.js`, its `<script>` tag in `index.html`, and the `window.setGeminiApiKey`/`window.clearDescriptionCache` console API.
  - Effort: XS (15 min) · Benefit: Removes H-2's security footgun and shrinks the JS surface with zero behavior change (feature was never invoked).
  - Depends on: nothing.
- [ ] **Remove or wire up `terminalCards`** in `js/github-loader.js` — either delete the unused computation or actually render it somewhere.
  - Effort: XS (15 min) · Benefit: Closes M-1; removes a maintenance trap.
- [ ] **Reconcile "Dumbathon" orphan entry** in `data/projects-details.json` — delete it or confirm it maps to a real, intentionally-hidden repo and document why.
  - Effort: XS (10 min) · Benefit: Closes M-6.
- [ ] **Pin `devicon` CDN version** in `index.html` (`devicon@latest` → a specific release tag matching what's currently rendering correctly).
  - Effort: XS (10 min) · Benefit: Closes M-7; prevents a silent future breakage.
- [ ] **Add or remove `.sm-hint` element** for the Stage Manager cards — decide whether the hint text ships, then make CSS and markup match.
  - Effort: XS (15 min) · Benefit: Closes L-3; finishes the in-progress uncommitted feature cleanly.
- [ ] **Audit and trim stray `console.log`/`console.warn`** calls that aren't part of the intentional terminal flavor text (e.g. in `description-enhancer.js`, once deleted this mostly resolves itself; check `github-loader.js` and `brain.js` too).
  - Effort: XS (20 min) · Benefit: Closes L-2.

**Phase 0 total effort: ~1.5 hours. Ship as a single small PR.**

---

## Phase 1 — SEO & Shareability (highest benefit-to-effort ratio)

- [ ] Add Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) to both `index.html` and `contact.html`.
  - Effort: S · Benefit: Fixes M-4; link previews on LinkedIn/X/Slack/Discord start working. Needs one new social-preview image asset (1200×630).
- [ ] Add Twitter Card meta tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).
  - Effort: XS · Benefit: Complements OG tags for X/Twitter previews.
- [ ] Add a static `robots.txt` (allow all, point to sitemap).
  - Effort: XS · Benefit: Standard crawler hygiene.
- [ ] Add a two-URL `sitemap.xml` (`/`, `/contact`).
  - Effort: XS · Benefit: Minor crawl-efficiency improvement; low cost to add.
- [ ] Add `<link rel="canonical">` to both pages.
  - Effort: XS · Benefit: Prevents duplicate-content ambiguity if the site is ever mirrored or proxied.

**Phase 1 total effort: ~2 hours (mostly the OG image). No code risk — additive only.**

---

## Phase 2 — Content/Data Consolidation (addresses H-1, the top maintainability risk)

- [ ] **Design one canonical project schema** — a single JSON file (e.g. `data/projects.json`) with fields covering everything currently spread across `projects-descriptions.json`, `projects-details.json`, and `project-terminal.js`'s `PROJECTS` array: `key`, `name`, `repo`, `shortBlurb`, `longDescription`, `bulletPoints`, `tech[]`, `status`, `highlight`, `github`, `structure[]` (file tree for the VS Code view).
  - Effort: M · Benefit: Single source of truth; eliminates the #1 maintainability risk in the audit.
  - Depends on: none, but should land before any further content edits to avoid re-duplicating work.
- [ ] **Refactor `project-terminal.js`** to consume the new `data/projects.json` (via `fetch`, same pattern already used by `github-loader.js`) instead of its hardcoded `PROJECTS` const.
  - Effort: M · Depends on: the schema task above.
- [ ] **Refactor `github-loader.js`** to read the same file for custom descriptions (replacing `projects-descriptions.json`) so the brain tooltip and terminal show identical copy for identical projects.
  - Effort: S · Depends on: the schema task above.
- [ ] **Delete `data/projects-descriptions.json` and `data/projects-details.json`** once both consumers are migrated.
  - Effort: XS · Depends on: the two refactor tasks above.
- [ ] **Reconcile the hero "tech chips" list and the Skills-globe pill list** into one canonical skills array consumed by both (closes L-4).
  - Effort: S · Benefit: Consistent skills representation across the page; independent of the projects-data work above.

**Phase 2 total effort: ~1–1.5 days. This is the single highest-leverage structural improvement in the plan.**

---

## Phase 3 — Scroll/Navigation Engine Simplification (addresses H-3)

This is the highest-risk, highest-reward refactor in the plan — treat as its own branch with manual QA against the current build before merging.

- [ ] **Document current desired behavior precisely** before touching code: what should happen on (a) sidebar nav click, (b) free scroll, (c) `data-open` trigger click (hero CTA "Open Project Stage"), (d) `?section=` URL param on load. Write this as a short spec/checklist to test against.
  - Effort: S · Benefit: Prevents "fixed one thing, silently broke another" during the refactor.
- [ ] **Prototype a simplified version** using CSS `scroll-snap-type: y mandatory` (already present) + a single `IntersectionObserver` with `threshold: 0.5` to update the active sidebar item, removing the manual lock/timer/settle-polling machinery (`lockNavClicks`, `beginSectionAutoScroll`, `lockNavActivation`, `scheduleNavActivationRelease`, `getCandidateWindowIdAtScrollTop`) in favor of letting the browser's native scroll-snap handle programmatic scrolls and only suppressing the observer's active-item updates during the ~300–500ms a programmatic scroll is in flight (a single boolean flag + one `scrollend` listener, not a hand-rolled settle-detection loop).
  - Effort: L · Benefit: Removes ~200 lines of the most fragile code in the codebase; `scrollend` (now supported in all evergreen browsers) replaces the manual "is scroll settled" polling entirely.
  - Depends on: the spec task above.
- [ ] **Manually test against the spec** on desktop (mouse wheel, trackpad momentum) and mobile (touch scroll, hamburger nav) before merging.
  - Effort: M · Depends on: the prototype task above.

**Phase 3 total effort: ~1–2 days including QA. Recommend doing this only after Phase 0/1/2 are shipped and stable, since it's the riskiest change.**

---

## Phase 4 — Security & CSP Hardening

- [ ] **Proxy GitHub API calls through a Netlify function** (mirrors the existing `contact.js` pattern) with a server-side `GITHUB_TOKEN` (optional, raises rate limit from 60/hr to 5,000/hr) and a short server-side cache (e.g. 5–10 minutes) to avoid hitting GitHub on every page load.
  - Effort: M · Benefit: Closes M-5; makes the brain/terminal project data resilient to traffic spikes and removes the unauthenticated-client-side-fetch pattern entirely.
- [ ] **Move inline theme-boot script to an external file** and switch the CSP to a hash-based `script-src` (compute the SHA-256 hash of the final script content and add `'sha256-...'` to the CSP) so `'unsafe-inline'` can be dropped from `script-src`.
  - Effort: M · Benefit: Closes the biggest hole in an otherwise strong CSP (M-3).
  - Depends on: deciding whether Netlify's static hosting can inject a build-time hash, or whether the hash is computed manually and committed (acceptable for a site with infrequent script changes).
- [ ] **Move `contact.html`'s inline `<style>` block into `styles.css`** under a `contact-*` namespace, then evaluate whether `style-src 'unsafe-inline'` can also be dropped in favor of the external stylesheet only.
  - Effort: M · Benefit: Contributes to closing M-3 and M-2 simultaneously.
  - Depends on: none, but pairs naturally with the sidebar-deduplication task in Phase 5.

**Phase 4 total effort: ~1 day.**

---

## Phase 5 — Structural Deduplication (`contact.html`)

- [ ] **Extract the sidebar markup into a single shared source.** Given the no-build-step constraint, the simplest fix is a tiny shared JS module that injects the sidebar HTML into both pages at load time (a `<div id="sidebar-mount"></div>` + one `renderSidebar()` call from a shared `sidebar.js`), rather than introducing a full build/templating pipeline.
  - Effort: M · Benefit: Closes M-2; one place to fix nav bugs, add sections, or update a11y attributes.
- [ ] **Move `contact.html`'s embedded `<style>` block into `styles.css`.**
  - Effort: S · Benefit: Restores a single styling source of truth; pairs with Phase 4's CSP task.

**Phase 5 total effort: ~4–6 hours.**

---

## Phase 6 — Tooling: Lint, Format, CI, Minimal Tests

- [ ] **Add ESLint** with a lightweight config (no framework-specific rules needed — just `no-unused-vars`, `no-undef` guarded for the intentional globals, `eqeqeq`, etc.) covering `js/*.js` and `netlify/functions/*.js`.
  - Effort: S · Benefit: Would have caught H-2/M-1 (unused exports) automatically going forward.
- [ ] **Add Prettier** with a shared config for consistent formatting across the existing files (many already follow a consistent style, but a config locks it in for future contributions).
  - Effort: XS.
- [ ] **Add a GitHub Actions workflow** (`.github/workflows/ci.yml`) that runs on push/PR: `node --check` on all JS files (already scripted for `contact.js`, extend to all), ESLint, Prettier `--check`.
  - Effort: S · Benefit: Closes H-4's CI gap; the currently-uncommitted, not-fully-wired Stage Manager feature (L-3) is exactly the kind of thing this would flag.
- [ ] **Add a handful of Playwright smoke tests**: page loads, each sidebar nav item switches to the correct section, theme toggle persists across reload, terminal `help`/`ls`/`open carelink` commands produce expected output, contact form client-side validation blocks empty submission.
  - Effort: M · Benefit: Cheap insurance against regressions in the JS-heaviest parts of the site; addresses L-6.
  - Depends on: none, but is most valuable once Phase 3's scroll-engine simplification lands (fewer moving parts to test against).

**Phase 6 total effort: ~1–1.5 days for lint/format/CI; +1 day for the Playwright smoke suite.**

---

## Phase 7 — Accessibility & Manual QA Pass (needs a real browser session)

- [ ] **Run an automated accessibility audit** (axe DevTools or Lighthouse) against both pages in light and dark theme.
  - Effort: S (tooling) + M (fixing findings).
- [ ] **Manually verify color contrast** of muted text (`--muted`, glass-card text) against both the static background and the dynamic dot-grid canvas background, in both themes.
  - Effort: S.
- [ ] **Verify the magnifying-lens `cursor: none` behavior** doesn't strand keyboard/switch-access users — confirm the lens toggle button remains keyboard-operable and that `cursor: none` only applies while the lens is actively engaged by a mouse user.
  - Effort: S.
- [ ] **Cross-browser/viewport pass**: Safari (backdrop-filter support), Firefox (scroll-snap + `scrollend` support if Phase 3 lands), and at least 3 real mobile widths.
  - Effort: M.

**Phase 7 total effort: ~1 day, gated on having a real browser/device available (not possible in this audit session).**

---

## Suggested Sequencing

```
Phase 0 (quick wins)        ──┐
Phase 1 (SEO)                 ├─▶ ship together, low risk, ~1 day total
                              ┘
Phase 2 (data consolidation) ──▶ ship next, ~1–1.5 days, unlocks cleaner Phase 3/5 work
Phase 4 (security/CSP)       ──▶ can run in parallel with Phase 2
Phase 5 (dedup contact.html) ──▶ do after Phase 4's CSP work for max benefit together
Phase 6 (tooling/CI)         ──▶ do early enough to catch regressions in Phase 3
Phase 3 (scroll engine)      ──▶ do last among code changes — highest risk, needs Phase 6's
                                  CI/tests in place first as a safety net
Phase 7 (a11y/manual QA)     ──▶ ongoing, whenever a real browser/device session is available
```
