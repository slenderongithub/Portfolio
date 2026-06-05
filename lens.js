/**
 * lens.js — Glass magnifying lens effect
 *
 * Geometry notes
 * ──────────────
 * The clone is position:fixed, full-viewport. We zoom it 2× by
 * setting transform-origin to the cursor position and applying
 * scale(2). Because the scale anchor IS the cursor, content at
 * the cursor stays put while everything around it expands outward.
 *
 * clip-path: circle(R_pre at cx cy) where R_pre = HALF / ZOOM
 *   → after scale(2) that circle becomes HALF radius (= 90 px)
 *   → 180 px diameter visible window, centred on cursor ✓
 *
 * The decoration div (ring + highlight + glow) is simply
 * positioned at (cx − HALF, cy − HALF) to sit exactly over the
 * clipped circle.
 */

(function () {
  'use strict';

  /* ── constants ──────────────────────────────────────────── */
  var LENS_SIZE = 180;
  var HALF      = LENS_SIZE / 2;          // 90 px
  var ZOOM      = 2;
  var PRE_R     = HALF / ZOOM;            // 45 px — clip radius before scale

  /* ── find the toggle button ─────────────────────────────── */
  var btn = document.getElementById('lensToggle');
  if (!btn) return;

  /* ── state ──────────────────────────────────────────────── */
  var active  = false;
  var cloneEl = null;
  var cx = 0, cy = 0;   // current cursor position (clientX/Y)

  /* ─────────────────────────────────────────────────────────
   * Inject styles
   * ─────────────────────────────────────────────────────────*/
  var styleEl = document.createElement('style');
  styleEl.id  = 'glass-lens-styles';
  styleEl.textContent = [
    /* ── Toggle button ───────────────────────────────────── */
    '#lensToggle {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  gap: 0.38rem;',
    '  min-height: 44px;',
    '  padding: 0 0.86rem;',
    '  border: 1px solid rgba(39,69,104,0.22);',
    '  border-radius: 999px;',
    '  background: rgba(255,255,255,0.52);',
    '  backdrop-filter: blur(14px) saturate(130%);',
    '  -webkit-backdrop-filter: blur(14px) saturate(130%);',
    '  color: #1e314d;',
    '  font: 700 0.7rem "Sora", sans-serif;',
    '  letter-spacing: 0.1em;',
    '  text-transform: uppercase;',
    '  cursor: pointer;',
    '  box-shadow: 0 6px 16px rgba(31,60,96,0.08);',
    '  transition: border-color 0.22s, transform 0.22s, background 0.22s, box-shadow 0.22s;',
    '  user-select: none;',
    '}',
    'body.theme-midnight #lensToggle {',
    '  border-color: rgba(148,163,184,0.2);',
    '  background: rgba(15,23,42,0.72);',
    '  color: #94a3b8;',
    '}',
    '#lensToggle:hover {',
    '  transform: translateY(-1px);',
    '  border-color: rgba(63,125,255,0.52);',
    '  box-shadow: 0 8px 22px rgba(31,60,96,0.14);',
    '}',
    'body.theme-midnight #lensToggle:hover {',
    '  border-color: rgba(34,211,238,0.44);',
    '}',
    '#lensToggle.lens-on {',
    '  border-color: rgba(63,125,255,0.6);',
    '  background: rgba(63,125,255,0.1);',
    '  color: #3f7dff;',
    '}',
    'body.theme-midnight #lensToggle.lens-on {',
    '  border-color: rgba(34,211,238,0.52);',
    '  background: rgba(34,211,238,0.08);',
    '  color: #22d3ee;',
    '}',

    /* ── Decoration layer (ring + highlight + glow) ──────── */
    '#glass-lens-decor {',
    '  position: fixed;',
    '  top: 0;',
    '  left: 0;',
    '  width: ' + LENS_SIZE + 'px;',
    '  height: ' + LENS_SIZE + 'px;',
    '  border-radius: 50%;',
    '  pointer-events: none;',
    '  z-index: 9999;',
    '  opacity: 0;',
    '  transform: translate(0,0) scale(0.55);',
    '  transition: opacity 0.2s ease, transform 0.2s ease;',
    '  will-change: transform;',
    '  box-shadow: 0 0 28px rgba(255,255,255,0.09);',
    '}',
    '#glass-lens-decor.lens-visible {',
    '  opacity: 1;',
    '}',

    /* Convex glass highlight — subtle white shimmer at top-left */
    '#glass-lens-highlight {',
    '  position: absolute;',
    '  inset: 0;',
    '  border-radius: 50%;',
    '  background: radial-gradient(',
    '    ellipse at 28% 22%,',
    '    rgba(255,255,255,0.15)  0%,',
    '    rgba(255,255,255,0.06) 34%,',
    '    transparent            63%',
    '  );',
    '}',

    /* ── Clone overlay ───────────────────────────────────── */
    '#glass-lens-clone {',
    '  position: fixed;',
    '  top: 0;',
    '  left: 0;',
    '  width: 100%;',
    '  height: 100%;',
    '  pointer-events: none;',
    '  z-index: 9997;',
    '  will-change: transform, clip-path;',
    '  /* clip-path and transform-origin set inline by JS */',
    '}',
  ].join('\n');
  document.head.appendChild(styleEl);

  /* ─────────────────────────────────────────────────────────
   * Build decoration DOM
   * ─────────────────────────────────────────────────────────*/
  var lensDecor = document.createElement('div');
  lensDecor.id  = 'glass-lens-decor';
  lensDecor.setAttribute('aria-hidden', 'true');

  var lensHL    = document.createElement('div');
  lensHL.id     = 'glass-lens-highlight';

  lensDecor.appendChild(lensHL);
  document.body.appendChild(lensDecor);

  /* ─────────────────────────────────────────────────────────
   * Build the page clone
   * ─────────────────────────────────────────────────────────*/
  function buildClone() {
    if (cloneEl) { cloneEl.remove(); cloneEl = null; }

    /* Clone the visible content wrapper */
    var source = document.querySelector('.dot-content') || document.body;
    cloneEl    = source.cloneNode(true);
    cloneEl.id = 'glass-lens-clone';
    cloneEl.setAttribute('aria-hidden', 'true');

    /* Strip scripts */
    cloneEl.querySelectorAll('script').forEach(function (el) { el.remove(); });

    /* Canvases can't be cloned meaningfully — remove them.
       The dot-background canvas is fixed behind real content anyway;
       the lens focuses on DOM text / card content. */
    cloneEl.querySelectorAll('canvas').forEach(function (el) { el.remove(); });

    /* Remove the lens toggle from the clone so there's no recursive weirdness */
    var cloneBtn = cloneEl.querySelector('#lensToggle');
    if (cloneBtn) cloneBtn.remove();

    /* Remove the decoration overlay itself if somehow inside the source */
    var cloneDecor = cloneEl.querySelector('#glass-lens-decor');
    if (cloneDecor) cloneDecor.remove();

    /* Kill all interactivity */
    cloneEl.querySelectorAll('[tabindex]').forEach(function (el) {
      el.removeAttribute('tabindex');
    });
    cloneEl.style.pointerEvents = 'none';
    cloneEl.style.userSelect    = 'none';

    document.body.appendChild(cloneEl);
  }

  /* ─────────────────────────────────────────────────────────
   * Sync lens position / zoom every mousemove
   * ─────────────────────────────────────────────────────────*/
  function syncLens(x, y) {
    /* Decoration: move without overriding the scale class approach.
       We set a CSS custom property so the transform in the class
       rule also carries the translation. */
    lensDecor.style.transform =
      'translate(' + (x - HALF) + 'px, ' + (y - HALF) + 'px)' +
      (lensDecor.classList.contains('lens-visible') ? ' scale(1)' : ' scale(0.55)');

    if (!cloneEl) return;

    /* Scale the clone 2× anchored at the cursor.
     * Because the anchor IS the cursor, the content under the cursor
     * stays exactly at the cursor position in the viewport.
     *
     * clip-path uses the pre-scale coordinate system:
     *   radius = HALF / ZOOM = 45 px  →  after scale(2)  →  90 px = HALF ✓
     *   circle centre = (x, y)        →  after scale      →  still at (x, y) ✓
     */
    cloneEl.style.transformOrigin = x + 'px ' + y + 'px';
    cloneEl.style.transform       = 'scale(' + ZOOM + ')';
    cloneEl.style.clipPath        =
      'circle(' + PRE_R + 'px at ' + x + 'px ' + y + 'px)';
  }

  /* ─────────────────────────────────────────────────────────
   * Activate / deactivate
   * ─────────────────────────────────────────────────────────*/
  function activate() {
    active = true;
    buildClone();
    syncLens(cx, cy);

    /* rAF so the browser paints the clone before the fade-in */
    requestAnimationFrame(function () {
      lensDecor.classList.add('lens-visible');
    });

    document.body.style.cursor = 'none';
    btn.textContent = '× Lens';
    btn.classList.add('lens-on');
    btn.setAttribute('aria-pressed', 'true');
  }

  function deactivate() {
    active = false;

    lensDecor.classList.remove('lens-visible');
    /* Keep transform at current position while fading out */
    syncLens(cx, cy);

    if (cloneEl) {
      var dying = cloneEl;
      cloneEl   = null;
      /* Fade the clone out, then remove */
      dying.style.transition = 'opacity 0.2s ease';
      dying.style.opacity    = '0';
      setTimeout(function () { dying.remove(); }, 220);
    }

    document.body.style.cursor = '';
    btn.textContent = 'Lens';
    btn.classList.remove('lens-on');
    btn.setAttribute('aria-pressed', 'false');
  }

  /* ─────────────────────────────────────────────────────────
   * Events
   * ─────────────────────────────────────────────────────────*/
  btn.addEventListener('click', function () {
    if (active) deactivate();
    else activate();
  });

  window.addEventListener('mousemove', function (e) {
    cx = e.clientX;
    cy = e.clientY;
    if (active) syncLens(cx, cy);
  }, { passive: true });

  /* When cursor leaves the browser window, hide decoration
     but keep active state so it comes back when cursor returns */
  document.addEventListener('mouseleave', function () {
    if (!active) return;
    lensDecor.classList.remove('lens-visible');
    if (cloneEl) cloneEl.style.clipPath = 'circle(0px at ' + cx + 'px ' + cy + 'px)';
  });

  document.addEventListener('mouseenter', function () {
    if (!active) return;
    lensDecor.classList.add('lens-visible');
    syncLens(cx, cy);
  });

  /* ESC to dismiss */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && active) deactivate();
  });

})();
