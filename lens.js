/**
 * lens.js — Glass magnifying lens effect
 *
 * The toggle button is created here (not in HTML) as a fixed
 * circular element in the bottom-right corner, z-index 10000,
 * so it stays visible and clickable even when the lens clone
 * (z-index 9997) is covering the entire page.
 *
 * Geometry
 * ────────
 * Clone: position fixed, full viewport.
 * transform-origin → cursor position, transform → scale(2).
 * Because the scale anchor IS the cursor, content under it stays put.
 * clip-path: circle(PRE_R px at cx cy)  — PRE_R = HALF / ZOOM = 45 px
 *   after scale(2) → visible circle radius = 90 px = 180 px diameter ✓
 */

(function () {
  'use strict';

  /* ── constants ──────────────────────────────────────────── */
  var LENS_SIZE = 180;
  var HALF      = LENS_SIZE / 2;   // 90 px
  var ZOOM      = 2;
  var PRE_R     = HALF / ZOOM;     // 45 px — pre-scale clip radius

  /* ── state ──────────────────────────────────────────────── */
  var active  = false;
  var cloneEl = null;
  var cx = 0, cy = 0;

  /* ─────────────────────────────────────────────────────────
   * Inject styles
   * ─────────────────────────────────────────────────────────*/
  var styleEl = document.createElement('style');
  styleEl.id  = 'glass-lens-styles';
  styleEl.textContent = [
    /* ── Circular fixed button — bottom-right ────────────── */
    '#glass-lens-btn {',
    '  position: fixed;',
    '  bottom: 1.6rem;',
    '  right: 1rem;',
    '  z-index: 10000;',        /* above clone (9997) at all times */
    '  width: 52px;',
    '  height: 52px;',
    '  border-radius: 50%;',
    '  border: 1.5px solid rgba(39,69,104,0.22);',
    '  background: rgba(255,255,255,0.62);',
    '  backdrop-filter: blur(16px) saturate(140%);',
    '  -webkit-backdrop-filter: blur(16px) saturate(140%);',
    '  box-shadow: 0 6px 20px rgba(31,60,96,0.12), inset 0 1px 0 rgba(255,255,255,0.7);',
    '  color: #1e314d;',
    '  cursor: pointer;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  transition: transform 0.22s cubic-bezier(0.22,0.61,0.36,1),',
    '              border-color 0.22s ease,',
    '              box-shadow 0.22s ease,',
    '              background 0.22s ease;',
    '  user-select: none;',
    '}',
    'body.theme-midnight #glass-lens-btn {',
    '  border-color: rgba(148,163,184,0.22);',
    '  background: rgba(15,23,42,0.76);',
    '  box-shadow: 0 6px 20px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.04);',
    '  color: #94a3b8;',
    '}',
    '#glass-lens-btn:hover {',
    '  transform: scale(1.1);',
    '  border-color: rgba(63,125,255,0.5);',
    '  box-shadow: 0 10px 28px rgba(63,125,255,0.18), inset 0 1px 0 rgba(255,255,255,0.7);',
    '}',
    'body.theme-midnight #glass-lens-btn:hover {',
    '  border-color: rgba(34,211,238,0.46);',
    '  box-shadow: 0 10px 28px rgba(34,211,238,0.14), inset 0 1px 0 rgba(255,255,255,0.04);',
    '}',
    '#glass-lens-btn.lens-on {',
    '  border-color: rgba(63,125,255,0.6);',
    '  background: rgba(63,125,255,0.12);',
    '  color: #3f7dff;',
    '}',
    'body.theme-midnight #glass-lens-btn.lens-on {',
    '  border-color: rgba(34,211,238,0.54);',
    '  background: rgba(34,211,238,0.1);',
    '  color: #22d3ee;',
    '}',
    /* Icon inside button */
    '#glass-lens-btn svg {',
    '  width: 20px;',
    '  height: 20px;',
    '  fill: none;',
    '  stroke: currentColor;',
    '  stroke-width: 2;',
    '  stroke-linecap: round;',
    '  stroke-linejoin: round;',
    '  transition: transform 0.22s ease, opacity 0.18s ease;',
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
    '}',
  ].join('\n');
  document.head.appendChild(styleEl);

  /* ─────────────────────────────────────────────────────────
   * Create the circular toggle button
   * ─────────────────────────────────────────────────────────*/
  var btn = document.createElement('button');
  btn.id   = 'glass-lens-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Toggle magnifying lens');
  btn.setAttribute('aria-pressed', 'false');

  /* Magnifying-glass icon (off state) */
  var SVG_LENS = '<svg viewBox="0 0 24 24" aria-hidden="true">'
    + '<circle cx="11" cy="11" r="7"/>'
    + '<line x1="16.5" y1="16.5" x2="22" y2="22"/>'
    + '</svg>';

  /* Close / × icon (on state) */
  var SVG_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true">'
    + '<line x1="18" y1="6" x2="6" y2="18"/>'
    + '<line x1="6" y1="6" x2="18" y2="18"/>'
    + '</svg>';

  btn.innerHTML = SVG_LENS;

  /* Append directly to body — NOT inside .dot-content,
     so it is never included in the page clone. */
  document.body.appendChild(btn);

  /* ─────────────────────────────────────────────────────────
   * Build the page clone
   * ─────────────────────────────────────────────────────────*/
  function buildClone() {
    if (cloneEl) { cloneEl.remove(); cloneEl = null; }

    var source = document.querySelector('.dot-content') || document.body;
    cloneEl    = source.cloneNode(true);
    cloneEl.id = 'glass-lens-clone';
    cloneEl.setAttribute('aria-hidden', 'true');

    cloneEl.querySelectorAll('script').forEach(function (el) { el.remove(); });
    cloneEl.querySelectorAll('canvas').forEach(function (el) { el.remove(); });

    /* The button lives outside .dot-content so it won't be in the
       clone, but guard against edge cases. */
    var cloneBtn = cloneEl.querySelector('#glass-lens-btn');
    if (cloneBtn) cloneBtn.remove();

    cloneEl.querySelectorAll('[tabindex]').forEach(function (el) {
      el.removeAttribute('tabindex');
    });
    cloneEl.style.pointerEvents = 'none';
    cloneEl.style.userSelect    = 'none';

    document.body.appendChild(cloneEl);
  }

  /* ─────────────────────────────────────────────────────────
   * Sync zoom on every mousemove / scroll
   *
   * The clone is position:fixed (y=0 = viewport top, always).
   * When the page has scrolled by scrollY px, the content under
   * the cursor (at viewport y=cy) lives at local clone y = cy+scrollY.
   *
   * Transform: scale(ZOOM) translateY(-scrollY)
   *   with transform-origin: (cx, cy)
   *   → local point (cx, cy+scrollY) maps to viewport (cx, cy) ✓
   *
   * clip-path is in local (pre-transform) coordinates, so its
   * centre must be at the local point that maps to the cursor:
   *   local centre = (cx, cy + scrollY)
   *   after transform → viewport (cx, cy) ✓
   * ─────────────────────────────────────────────────────────*/
  function syncLens(x, y) {
    if (!cloneEl) return;
    var sy = window.scrollY;
    cloneEl.style.transformOrigin = x + 'px ' + y + 'px';
    cloneEl.style.transform       = 'scale(' + ZOOM + ') translateY(-' + sy + 'px)';
    cloneEl.style.clipPath        =
      'circle(' + PRE_R + 'px at ' + x + 'px ' + (y + sy) + 'px)';
  }

  /* ─────────────────────────────────────────────────────────
   * Activate / deactivate
   * ─────────────────────────────────────────────────────────*/
  function activate() {
    active = true;
    buildClone();
    syncLens(cx, cy);
    document.body.style.cursor = 'none';
    btn.innerHTML = SVG_CLOSE;
    btn.classList.add('lens-on');
    btn.setAttribute('aria-pressed', 'true');
  }

  function deactivate() {
    active = false;

    if (cloneEl) {
      var dying = cloneEl;
      cloneEl   = null;
      dying.style.transition = 'opacity 0.2s ease';
      dying.style.opacity    = '0';
      setTimeout(function () { dying.remove(); }, 220);
    }

    document.body.style.cursor = '';
    btn.innerHTML = SVG_LENS;
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

  /* Re-sync on scroll so clone tracks the new visible content */
  window.addEventListener('scroll', function () {
    if (active) syncLens(cx, cy);
  }, { passive: true });

  /* Hide magnification when cursor leaves window */
  document.addEventListener('mouseleave', function () {
    if (!active || !cloneEl) return;
    cloneEl.style.clipPath = 'circle(0px at ' + cx + 'px ' + cy + 'px)';
  });

  document.addEventListener('mouseenter', function () {
    if (!active) return;
    syncLens(cx, cy);
  });

  /* ESC closes the lens */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && active) deactivate();
  });

})();
