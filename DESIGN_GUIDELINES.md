# Design Guidelines — Shubhadeep Datta Portfolio

> **WINDOWS XP "LUNA" ERA (2026-07) — supersedes the CRT/Mac notes below.**
> The site was reskinned from Mac-style chrome to an authentic **Windows XP Luna** desktop, still shown on the CRT tube (scanlines + bezel remain). Reference values come from the XP.css project (botoxparty/XP.css).
> - **Palette**: desktop = Luna blue gradient (`--desktop-top/bottom`); windows = `--xp-face` `#ece9d8`; interactive accent remapped to XP blue (`--gold` → `#0a54e0`, dark `#4aa1ff`); amber/gold kept for achievement. Dark theme is "Royale Noir" (charcoal windows). Text on the desktop is white; text inside windows is near-black.
> - **Fonts**: Trebuchet MS (`--font-title`) for titles/headings, Tahoma stack (`--font-ui`) for body/UI, Lucida Console (`--font-mono`) for the terminal. DM Serif / Outfit / Space Mono all removed. **Avoid tiny (<12px) text** — labels are 12–14px.
> - **Reusable chrome** (`styles.css` "WINDOWS XP LUNA CHROME"): `.xp-window` (six-layer blue inset frame + 8px top corners), `.xp-titlebar` (blue gradient + min/max/close buttons, close is red), `.xp-window-body` (ECE9D8), `.xp-button` (raised bevel, orange hover). Use these for any new panel — terminal, project explorer, contact form, and every timeline card are built from them.
> - **Navigation** = a left-docked XP **taskbar** (blue panel, beveled buttons, active shown pressed). The bottom status HUD is the XP **taskbar clock** (green Start-style name button, active-section task button, clock tray).
> - **Sections**: Projects has a working cmd.exe **terminal** (`js/terminal.js`, commands drive `window.projectExplorer`) + the **My Projects** explorer window. Experience = XP windows on a single rail (awards = amber badges). Education = XP windows **alternating** left/right on a center rail. Both timelines **backtrack** (reveal/hide as they scroll in and out — `initializeTimelineReveal` toggles `.visible` both ways).
> - Restraint: this is a faithful XP recreation, not a parody — keep bevels subtle, use real XP interaction patterns, and don't shrink text into "AI-made" fine print.

> **CRT ERA ADDENDUM (2026-07, revised) — supersedes conflicting details below.**
> The site carries a retro-computer / CRT-monitor treatment (reference: shader.se) **over the original editorial typography**:
> - **Typography is the original trio**: DM Serif Display for display headings (italic accents), Outfit for body/UI, system mono (`--font-mono`) for tokens/labels/code. A Space Mono experiment was reverted — retro chrome, classic type.
> - **Dark ("midnight") is the default theme**; light mode remains as a "paper terminal" variant. The bezel color (`#0a0a0c`) is hardware — it does not change with theme.
> - **CRT chrome** is injected by `app.js` and styled at the end of `styles.css`: scanlines, aperture grille (dark only), phosphor flicker, corner-bend bezel + tube vignette, v-sync jitter, and a bottom status HUD (section / scroll % / clock). The retrace sweep was removed as too busy. All layers are `pointer-events: none` and respect `prefers-reduced-motion`.
> - **First-visit loader**: a game-style boot screen (fake boot log + segmented progress bar + blinking "PRESS ENTER") gates the first entry per session, ending in a tube power-on bloom. Skippable by any input, auto-enters after 12s, skipped entirely under reduced motion.
> - **Page transitions**: internal links between index/contact play a CRT power-off (screen collapses to a bright line) before navigating; the destination answers with a fast power-on flash (`crtNavigate` in `app.js`).
> - **Barrel scroll**: content blocks tilt on rotateX with a **cubic falloff** (flat reading zone at center) and per-frame lerp smoothing (`BARREL_MAX_ANGLE` / `BARREL_SMOOTHING` in `app.js`), disabled on touch/small screens/reduced motion.
> - **Scroll is free**: CSS scroll-snap and nav click-locks were removed — one continuous smooth scroll, with the sidebar indicator driven by IntersectionObserver.
> - **Section kickers (`// 01 —`) were removed**; headings stand alone. The **teal/cyan = interactive, amber = achievement** accent semantics carry over unchanged.
> - **Projects panel**: the fake terminal/VS-Code explorer was replaced by the Project Workspace (`js/project-workspace.js` + `.pw-*` styles) — a refined list + detail explorer that keeps the `showProjectInTerminal`/`focusRepoCard` API for the stage-manager cards and brain nodes.
> - **Timeline system**: Experience (git-log) and Education (`.edu-tl-*`) now share ONE rail language — a single left rail, square teal phosphor nodes, glass cards that slide in, and a scroll-reveal that draws the rail / pops the node / staggers the bullets. They diverge only in content framing: Experience = git commits (hashes, `tag:` refs, amber branch nodes for wins); Education = linear milestones with a teal year pill and an **amber score badge** (scores read as achievements, per the teal=interactive / amber=achievement rule). When adding another timeline, reuse this rail system rather than inventing a third.
> - **Init-order caution**: `app.js` runs one shared `requestAnimationFrame` loop (`animateFloatingSystems`) that drives the globe AND `barrelTick()`. Any state it touches (e.g. `barrelUnits`) MUST be declared in the top state block, not beside the barrel code lower down — a `let` referenced before its declaration throws a temporal-dead-zone error on frame 1, which aborts the rest of top-level init (including removing `.theme-booting`, so every transition/animation silently freezes). This exact bug caused a full-site "everything went rigid" regression; keep loop-referenced state hoisted.
> - Restraint rules: effect opacities stay tiny, no green-matrix palette, no pixel-arcade fonts, every effect maps to a real CRT behavior (v-sync, power-on/off) rather than generic "glitch."

Documents the design language as it exists in the current codebase (`styles.css`, `index.html`, `contact.html`), and gives direction for keeping future additions consistent with it. This is a description of what's there plus recommendations — it does not change any code.

---

## 1. Design Philosophy (as observed in the codebase)

The site reads as **"developer-native glassmorphism"** — a translucent, blurred-glass macOS/VS-Code-inspired aesthetic (frosted sidebar, glass cards, fake terminal and VS Code panes) layered over a warm, editorial serif/sans type pairing more commonly seen in design portfolios than developer portfolios. That combination — playful developer chrome (terminal, `neofetch`, `matrix`, VS Code explorer) plus a genuinely elegant serif display face for headings — is the site's distinctive voice. It should be preserved; it's what keeps this from reading as a generic template.

**Core visual ideas already in place, worth protecting:**
- A soft, warm off-white canvas in light mode (`#f5f0e8`) rather than pure white — gives the site a paper-like, non-clinical warmth.
- A near-black, near-space dark mode (`#030508`) rather than a typical dark-gray — reads as "midnight," reinforced by the theme class name `theme-midnight` and cyan/teal accent glow.
- One accent hue that shifts hue-angle between themes rather than just lightening: teal (`#1a9aaa`) in light mode → cyan (`#22d3ee`) in dark mode. This is a deliberate, good choice — it keeps the accent feeling "native" to each theme rather than looking washed out.
- Everything is built from CSS gradients, blurs, and SVG — there is not a single raster image asset in the entire visual system (aside from the downloadable resume PDF). This should remain true; it's a real strength (performance, crispness at any DPI, easy re-theming).

---

## 2. What Should Remain Unchanged

- **The warm off-white/near-black theme pair and the teal→cyan accent shift.** This is the site's signature; any redesign should treat it as a constraint, not a starting point for revision.
- **The DM Serif Display headings + Outfit body + Sora accents type trio.** Distinctive and already well-executed (see §3).
- **Zero raster images.** Keep the "everything is code" constraint — it's both a technical strength and a thematic one (a developer portfolio that is *itself* evidence of engineering care).
- **The playful terminal/hacker-culture Easter eggs** (`matrix`, `rick`, `rm -rf /`, `sudo`, `42`, fortune quotes) — these cost nothing and are good personality signal for the target audience (recruiters/engineers who will actually type `help` into the terminal).
- **The glass-card component pattern** (`.portfolio-glass-card`, `.edu-tl-card`, `.exp-float-card`) as a *visual* language — translucent, blurred, softly bordered cards for content grouping. (The *implementation* of this pattern needs consolidation per `PROJECT_AUDIT.md` L-1 — the look should stay, the CSS specificity mess underneath should not.)

---

## 3. Typography System

| Role | Font | Observed usage |
|---|---|---|
| Display / headings | **"DM Serif Display"**, serif, italic accents | `.hero-heading`, `.section-heading`, `.edu-timeline-title`, `.pt-preview-title`, card titles — `font-weight: 400` at every tier, with `font-style: italic` on the accent span or the whole heading. |
| Body / UI | **"Outfit"**, sans-serif, weights 300/400/500/600/700 | Body copy, nav labels, buttons, form fields. The default body font (`body { font-family: "Outfit" }`). |
| Code / tokens | System monospace stack via `var(--font-mono)` | Terminal, VS Code explorer, contact form labels, section kickers (`// 01 — projects`), hero tech chips, skills-globe pill labels, date/status pills — anywhere text represents a *token* (skill, date, command, identifier) rather than prose. |

> Sora was removed from the system (2026-07): skill labels and tooltips now use the shared `--font-mono` token, reducing the loaded font families to two plus the system mono stack. **Rule of thumb going forward: prose is Outfit, headlines are DM Serif Display, and anything that names a thing (tech, date, command, file, version) is mono.**

**Recommended type scale (already implicit in the CSS, worth formalizing as it's extended):**
- Display headings: `clamp(2.2rem, 5vw, 4.4rem)`, line-height `1.06` — used consistently for hero/section headings. Keep using `clamp()` here; don't introduce fixed breakpoint font sizes for this tier.
- Card/sub-headings: `clamp(1.65rem, 3.2vw, 2.4rem)` (experience/education card titles) and `clamp(1.8rem, 3vw, 2.8rem)` (project preview titles) — two closely related but distinct scales exist; when adding new card types, pick whichever of these two is closer rather than inventing a third.
- Body copy: `1rem` / line-height `1.8` for prose (`.hero-bio`, `.contact-desc`), `0.79–0.94rem` for card body text and list items.
- UI chrome (buttons, labels, badges): `0.6–0.78rem`, almost always `text-transform: uppercase` with `letter-spacing: 0.08–0.16em` — this uppercase-tracked-caps treatment is the site's consistent "label" idiom; use it for any new badge/pill/label component rather than inventing a new label style.

---

## 4. Spacing System

No formal spacing scale (e.g. a `--space-1..8` token set) exists today — spacing is authored ad hoc in `rem`/`px` per component. Observed values cluster around a **~4px/0.25rem base rhythm**, e.g.:

- Micro gaps (icon-to-label, pill internals): `4–10px` / `0.3–0.6rem`.
- Component internal padding: `0.7–1.5rem` for cards and buttons, `2–2.2rem` for page-level containers.
- Section-to-section spacing: large and deliberate — `margin: 0 auto 22rem` between `.stage-window` sections, reinforcing the "one full-viewport idea at a time" scroll-snap experience.

**Recommendation for future work:** formalize a small custom-property spacing scale (e.g. `--space-xs: 0.25rem; --space-sm: 0.5rem; --space-md: 1rem; --space-lg: 1.5rem; --space-xl: 2.5rem; --space-2xl: 6rem;`) and migrate new components to it. Don't retrofit existing working components purely for the sake of the token system — only apply it going forward and opportunistically during other edits, to avoid the effort of Phase 3-scale churn for a cosmetic-only change.

---

## 5. Color Palette

### Light theme (`:root`)
| Token | Value | Role |
|---|---|---|
| `--bg-0` / `--dot-bg` | `#f5f0e8` | Page background |
| `--bg-1` | `#ede7db` | Secondary surface |
| `--bg-2` | `#e5ddd0` | Tertiary surface |
| `--text` | `#1a2032` | Primary text |
| `--muted` | `#5a6478` | Secondary/caption text |
| `--line` | `rgba(30,40,60,0.16)` | Borders/dividers |
| `--gold` (accent) | `#1a9aaa` (teal, despite the variable name) | Links, active states, headline accents |
| `--gold-strong` | `#148898` | Hover/pressed accent |
| `--gold-soft` | `rgba(26,154,170,0.14)` | Accent-tinted backgrounds |

### Dark theme (`.theme-midnight`)
| Token | Value | Role |
|---|---|---|
| `--dot-bg` | `#030508` | Page background |
| `--text` | `#f4f7fb` | Primary text |
| `--gold` (accent) | `#22d3ee` (cyan) | Same role as light, shifted hue |
| `--gold-strong` | `#60a5fa` (blue) | Hover/pressed accent |

**Naming note:** the accent custom property is literally named `--gold` in the CSS despite holding a teal/cyan value in both themes. This is a pre-existing naming quirk, not a bug — flagged here so future contributors don't "fix" the color thinking it's a mistake, and so any rename is a deliberate, searched-and-replaced decision rather than an accidental one.

**Two-accent semantics (formalized 2026-07):** the system now has an explicit second accent — **amber = achievement/highlight** (`--amber` / `--amber-soft`: `#a16207` light, `#f4c85a` dark). It is used for the brain's project nodes and the "Hackathon Winner"-style badges, while teal/cyan remains reserved for interactive/navigation state. Dark-mode `--gold-strong` is now `#06b6d4` (was a stray blue `#60a5fa`), and dark mode now overrides `--muted` to `#94a3b8` globally rather than per-component. Do not introduce a third accent hue.

**Recommendation:** if the palette is ever revisited, keep the **hue-shift-between-themes** principle (§1) rather than just adjusting lightness/saturation of one hue. It's the single most distinctive part of the current color system.

**Semantic status colors** (used in the project terminal's status badges) are a small, separate palette and should stay decoupled from the main accent system: `active` → green `#4ade80`, `prototype` → amber `#fbbf24`, `research` → violet `#a78bfa`. Any new project status value should pick a new hue from this same "muted-neon-on-dark" family rather than reusing the primary accent (which is reserved for interactive/navigation state).

---

## 6. Animation Principles

Observed conventions, worth codifying as rules for new work:

1. **One shared easing curve for UI motion**: `--ease: cubic-bezier(0.22, 0.61, 0.36, 1)` is used pervasively for hovers, nav indicator movement, and card transitions. New interactive elements should reuse this token rather than introducing a new curve, unless the motion is explicitly meant to feel different (e.g. the bouncier `cubic-bezier(0.34, 1.56, 0.64, 1)` reserved for playful/springy micro-interactions like the theme toggle and sidebar action buttons).
2. **Reveal-on-scroll uses opacity + translate, never layout-affecting properties.** Every scroll-reveal (`hero-visible`, `edu-tl-item.visible`, timeline line growth) animates `opacity`/`transform`, keeping animations on the compositor thread. Keep this discipline for any new scroll-triggered UI.
3. **3-D/perspective effects are isolated to their own components** (Three.js brain, isometric Stage Manager cards, skills globe) and always have a **static fallback** for reduced-capability contexts: the brain has a DOM-node fallback if WebGL fails; the lens and other hover-dependent effects disable themselves on touch (`matchMedia('(hover: none)')`). Any new "flashy" effect should follow this same fallback-first pattern rather than assuming desktop/mouse/WebGL.
4. **`prefers-reduced-motion` is now handled globally (2026-07):** a global CSS media-query kills animations/transitions, and JS gates every continuous animation (globe idle rotation, brain rotation/bobbing/halo pulse, the experience log's typed command). User-*triggered* motion (typed terminal commands, drag) remains active. **Rule: any new auto-playing or continuous animation must check `prefersReducedMotion` from day one.**
5. **The Experience section is a git commit graph (2026-07)** — the former 3-D carousel was replaced with a `git log --graph` metaphor: leadership roles are commits on `main` (teal rail/nodes), hackathon wins branch off with amber nodes and `tag:` refs, bullets render as diff `+` lines, and entries reveal once on scroll (IntersectionObserver, `unobserve` after reveal — a log doesn't un-write itself). This is the template for future "workflow metaphor" sections: pick one real engineering artifact (log, diff, tree, graph) and render actual content through it, rather than decorating content with generic motion.
5. **Theme transitions are explicitly excluded during initial page load** via the `.theme-booting` class (`transition: none !important` on all elements) to avoid a jarring color sweep on first paint — a good pattern; replicate it for any future "apply saved user preference on load" feature.

---

## 7. Component Consistency Rules

- **Card family (consolidated 2026-07)**: `.portfolio-glass-card` is now the single base recipe, written without `!important` and driven by tokens — translucent background (`rgba(255,255,255,0.5)` light / `rgba(4,9,20,0.55)` dark), `backdrop-filter: blur(24px) saturate(140%)`, `border-radius: var(--radius-lg)` (24px), and `box-shadow: var(--shadow-card)` / `--shadow-card-active`. **Any new card-style component should apply this class (or match it via the tokens) rather than introducing a new blur, radius, or shadow recipe.** The radius scale is: `--radius-lg` 24px content cards · `--radius-md` 16px tool windows (terminal, editor, contact form) · `--radius-sm` 12px small tiles · `--radius-pill` for pills/badges.
- **Pill/badge family**: uppercase, tracked-out label text on a `border-radius: 999px` pill with a `1px` accent-tinted border and a very low-opacity accent-tinted fill (`rgba(accent, 0.08–0.14)`) — used for hero tech chips, project tech badges, status badges, education date badges, contact-form intent pills. New badge-like UI should reuse this exact recipe.
- **Section rhythm**: each `.stage-window` is treated as a near-full-viewport "slide" with generous top padding (`6rem`) and large inter-section margins (`22rem`) so the scroll-snap experience reads as one idea at a time. Any new top-level section added to the nav should follow this same full-viewport-slide treatment rather than a normal "scrolling page section" — mixing the two would break the site's core interaction model.
- **Icon system**: all UI icons are hand-authored inline SVG with `stroke="currentColor"` (so they inherit theme color automatically) except third-party tech logos, which come from the Devicon webfont. Do not introduce a second icon font or an SVG-sprite system — the current inline-SVG-plus-one-webfont approach is simple and has zero build tooling to manage it, matching the project's no-build-step philosophy.

---

## 8. Accessibility Guidelines (for future work)

- **Keep using semantic interactive elements** (`<button>`, `<a>`) with `aria-label` for icon-only controls — this is already done consistently (sidebar nav, theme toggle, lens toggle, exp carousel prev/next) and should continue for any new icon-only control.
- **Every custom-drawn canvas/3-D element needs a non-visual fallback path.** The brain and skills globe are decorative-plus-informational (they carry project/skill data); continue ensuring the same information is reachable via a non-canvas UI path (the project terminal already serves this role for projects; consider whether the skills globe's pill data needs an equivalent flat-list fallback for screen-reader/no-JS users).
- **Audit `cursor: none`** (set by `lens.js` while the magnifying lens is active) to confirm it never applies in a way that strands non-mouse input — it should only ever be a mouse-pointer cosmetic effect, never something that affects keyboard/focus visibility.
- **Add `prefers-reduced-motion` handling** (see §6.4) — this is as much an accessibility requirement (vestibular disorders, motion sensitivity) as a UX nicety.
- **Verify color contrast** of `--muted` text and glass-card text against both the static page background and the moving dot-grid canvas behind it, in both themes, before shipping any new text-on-glass component. Glass/blur components are the highest-risk contrast area because their effective background color depends on whatever is behind them.
- **Run an automated audit (axe/Lighthouse) once a real browser session is available** — this document cannot substitute for that; see `PROJECT_AUDIT.md` §6 and `IMPLEMENTATION_PLAN.md` Phase 7.

---

## 9. Overall Visual Philosophy Going Forward

1. **Preserve the "developer culture meets editorial design" duality.** Don't let future additions push entirely into either "generic SaaS glassmorphism" or "raw hacker terminal" — the tension between the serif display headlines and the terminal/VS-Code chrome is the point.
2. **Every new interactive widget should ship with a fallback and a reduced-motion consideration from day one**, matching the existing brain/lens/carousel precedent, rather than being retrofitted later.
3. **Reuse existing recipes (cards, pills, easing curves, spacing rhythm) before inventing new ones.** The system is currently consistent *by convention*, not by an enforced token/component system (see `PROJECT_AUDIT.md` L-1 on `!important` overuse) — the more new work reuses existing patterns verbatim, the less that lack of enforcement will hurt.
4. **Content parity across representations matters as much as visual parity.** Because the same project/skill data currently renders through multiple independent code paths (brain tooltip, terminal README, hero chips, skills globe — see `PROJECT_AUDIT.md` H-1 and `IMPLEMENTATION_PLAN.md` Phase 2), any visual design decision about *how* to present a project or skill should be paired with a content decision about *what* canonical copy feeds all of its presentations, so design consolidation and data consolidation move together rather than one drifting ahead of the other.
