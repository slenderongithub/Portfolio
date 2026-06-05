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
 * No decoration layer — the magnification window is the cursor.
 */

(function () {
  'use strict';

  /* ── constants ──────────────────────────────────────────── */
  var LENS_SIZE = 180;
  var HALF      = LENS_SIZE / 2;   // 90 px
  var ZOOM      = 2;
  var PRE_R     = HALF / ZOOM;     // 45 px — clip radius before scale

  /* ── find the toggle button ─────────────────────────────── */
  var btn = document.getElementById('lensToggle');
  if (!btn) return;

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

    var cloneBtn = cloneEl.querySelector('#lensToggle');
    if (cloneBtn) cloneBtn.remove();

    cloneEl.querySelectorAll('[tabindex]').forEach(function (el) {
      el.removeAttribute('tabindex');
    });
    cloneEl.style.pointerEvents = 'none';
    cloneEl.style.userSelect    = 'none';

    document.body.appendChild(cloneEl);
  }

  /* ─────────────────────────────────────────────────────────
   * Sync zoom every mousemove
   * ─────────────────────────────────────────────────────────*/
  function syncLens(x, y) {
    if (!cloneEl) return;
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
    document.body.style.cursor = 'none';
    btn.textContent = '× Lens';
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

  document.addEventListener('mouseleave', function () {
    if (!active || !cloneEl) return;
    cloneEl.style.clipPath = 'circle(0px at ' + cx + 'px ' + cy + 'px)';
  });

  document.addEventListener('mouseenter', function () {
    if (!active) return;
    syncLens(cx, cy);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && active) deactivate();
  });

})();
