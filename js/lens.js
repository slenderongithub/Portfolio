(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

  var LENS_D = 180;
  var LENS_R = LENS_D / 2;
  var ZOOM   = 2;
  var active  = false;
  var lensWrap = null;
  var cloneEl  = null;
  var cx = 0, cy = 0;

  function getScrollContainer() {
    return document.querySelector('.stage-scene') || null;
  }

  var css = document.createElement('style');
  css.textContent = [
    '@media(hover:none){#gl-btn{display:none !important;}}',
    '#gl-btn{',
      'position:fixed;bottom:1.6rem;right:1rem;z-index:10000;',
      'width:52px;height:52px;border-radius:50%;',
      'border:1.5px solid rgba(39,69,104,.22);',
      'background:rgba(255,255,255,.72);',
      'backdrop-filter:blur(14px) saturate(140%);',
      '-webkit-backdrop-filter:blur(14px) saturate(140%);',
      'box-shadow:0 6px 20px rgba(31,60,96,.13),inset 0 1px 0 rgba(255,255,255,.7);',
      'color:#1e314d;cursor:pointer;',
      'display:flex;align-items:center;justify-content:center;',
      'transition:transform .22s cubic-bezier(.22,.61,.36,1),border-color .2s,box-shadow .2s,background .2s;',
      'user-select:none;',
    '}',
    '#gl-btn:hover{transform:scale(1.1);border-color:rgba(63,125,255,.5);}',
    '#gl-btn.on{border-color:rgba(63,125,255,.7);background:rgba(63,125,255,.13);color:#3f7dff;}',
    '#gl-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}',
    '#gl-wrap{',
      'position:fixed;z-index:9998;',
      'width:', LENS_D, 'px;height:', LENS_D, 'px;',
      'border-radius:50%;overflow:hidden;',
      'pointer-events:none;',
      'box-shadow:',
        '0 0 0 1.5px rgba(255,255,255,.55),',
        '0 0 0 3px rgba(120,160,255,.25),',
        '0 8px 32px rgba(30,50,100,.18);',
    '}',
    '#gl-sheen{',
      'position:absolute;inset:0;z-index:2;border-radius:50%;pointer-events:none;',
      'background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.18) 0%,transparent 60%);',
    '}',
    '#gl-clone{',
      'position:absolute;top:0;left:0;',
      'pointer-events:none !important;',
      'user-select:none;',
      'transform-origin:0 0;',
      'will-change:transform;',
    '}',
    '#gl-clone *{pointer-events:none !important;}',
  ].join('');
  document.head.appendChild(css);

  var SVG_ON  = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>';
  var SVG_OFF = '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  var btn = document.createElement('button');
  btn.id   = 'gl-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Toggle magnifying lens');
  btn.innerHTML = SVG_ON;
  document.body.appendChild(btn);

  function getPageBg() {
    return getComputedStyle(document.body).backgroundColor || '#f5f0e8';
  }

  function syncScrollPositions(sourceNode, cloneNode) {
    if (!sourceNode || !cloneNode) return;

    if (sourceNode.scrollTop !== undefined && cloneNode.scrollTop !== undefined) {
      if (cloneNode.scrollTop !== sourceNode.scrollTop) {
        cloneNode.scrollTop = sourceNode.scrollTop;
      }
    }
    if (sourceNode.scrollLeft !== undefined && cloneNode.scrollLeft !== undefined) {
      if (cloneNode.scrollLeft !== sourceNode.scrollLeft) {
        cloneNode.scrollLeft = sourceNode.scrollLeft;
      }
    }

    var sourceChildren = sourceNode.children;
    var cloneChildren = cloneNode.children;
    if (sourceChildren && cloneChildren) {
      var len = Math.min(sourceChildren.length, cloneChildren.length);
      for (var i = 0; i < len; i++) {
        syncScrollPositions(sourceChildren[i], cloneChildren[i]);
      }
    }
  }

  function buildLens() {
    if (lensWrap) { lensWrap.remove(); lensWrap = null; cloneEl = null; }

    var source = document.querySelector('.dot-content') || document.body;
    var sourceRect = source.getBoundingClientRect();

    cloneEl = source.cloneNode(true);
    cloneEl.id = 'gl-clone';

    var pageBg = getPageBg();

    cloneEl.style.setProperty('position',   'absolute',                'important');
    cloneEl.style.setProperty('top',         '0',                      'important');
    cloneEl.style.setProperty('left',        '0',                      'important');
    cloneEl.style.setProperty('width',       sourceRect.width + 'px',  'important');
    cloneEl.style.setProperty('height',      sourceRect.height + 'px', 'important');
    cloneEl.style.setProperty('min-height',  '0',                      'important');
    cloneEl.style.setProperty('max-height',  'none',                   'important');
    cloneEl.style.setProperty('overflow',    'hidden',                 'important');
    cloneEl.style.setProperty('background',  pageBg,                   'important');


    cloneEl.dataset.sourceTop  = sourceRect.top;
    cloneEl.dataset.sourceLeft = sourceRect.left;

    cloneEl.querySelectorAll('script, #gl-btn, #gl-wrap').forEach(function (n) { n.remove(); });
    cloneEl.querySelectorAll('canvas').forEach(function (n) { n.remove(); });
    cloneEl.querySelectorAll('[tabindex]').forEach(function (n) { n.removeAttribute('tabindex'); });


    cloneEl.querySelectorAll('*').forEach(function (el) {
      el.style.setProperty('transition',      'none', 'important');
      el.style.setProperty('animation',       'none', 'important');
      el.style.setProperty('scroll-behavior', 'auto', 'important');
      el.style.setProperty('scroll-snap-type', 'none', 'important');
    });

    var sheen = document.createElement('div');
    sheen.id = 'gl-sheen';

    lensWrap = document.createElement('div');
    lensWrap.id = 'gl-wrap';
    lensWrap.style.background = pageBg;
    lensWrap.appendChild(cloneEl);
    lensWrap.appendChild(sheen);
    document.body.appendChild(lensWrap);

    syncScrollPositions(source, cloneEl);
  }

  function syncLens(x, y) {
    if (!lensWrap || !cloneEl) return;

    lensWrap.style.left = (x - LENS_R) + 'px';
    lensWrap.style.top  = (y - LENS_R) + 'px';

    var sourceTop  = parseFloat(cloneEl.dataset.sourceTop  || '0');
    var sourceLeft = parseFloat(cloneEl.dataset.sourceLeft || '0');

    var source = document.querySelector('.dot-content') || document.body;
    syncScrollPositions(source, cloneEl);

    var cloneX = x - sourceLeft;
    var cloneY = y - sourceTop;

    var tx = LENS_R - cloneX * ZOOM;
    var ty = LENS_R - cloneY * ZOOM;

    cloneEl.style.transform =
      'translate(' + tx + 'px,' + ty + 'px) scale(' + ZOOM + ')';
  }

  var rebuildTimer = null;

  function startRebuildTimer() {
    stopRebuildTimer();
    rebuildTimer = window.setInterval(function () {
      if (active) {
        buildLens();
        syncLens(cx, cy);
      }
    }, 3000);
  }

  function stopRebuildTimer() {
    if (rebuildTimer !== null) {
      clearInterval(rebuildTimer);
      rebuildTimer = null;
    }
  }

  function activate() {
    active = true;
    buildLens();
    syncLens(cx, cy);
    document.body.style.cursor = 'none';
    btn.innerHTML = SVG_OFF;
    btn.classList.add('on');
    btn.setAttribute('aria-pressed', 'true');
    startRebuildTimer();
  }

  function deactivate() {
    active = false;
    stopRebuildTimer();
    if (lensWrap) {
      var dying = lensWrap;
      lensWrap = null; cloneEl = null;
      dying.style.transition = 'opacity .18s ease';
      dying.style.opacity = '0';
      setTimeout(function () { dying.remove(); }, 200);
    }
    document.body.style.cursor = '';
    btn.innerHTML = SVG_ON;
    btn.classList.remove('on');
    btn.setAttribute('aria-pressed', 'false');
  }

  btn.addEventListener('click', function () {
    active ? deactivate() : activate();
  });

  window.addEventListener('mousemove', function (e) {
    cx = e.clientX;
    cy = e.clientY;
    if (active) syncLens(cx, cy);
  }, { passive: true });


  function onInnerScroll() {
    if (!active) return;
    syncLens(cx, cy);
  }

  var scrollBound = false;
  function bindScroll() {
    if (scrollBound) return;
    var sc = getScrollContainer();
    if (sc) {
      sc.addEventListener('scroll', onInnerScroll, { passive: true });
    }
    window.addEventListener('scroll', onInnerScroll, { passive: true });
    scrollBound = true;
  }

  bindScroll();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindScroll);
  } else {
    requestAnimationFrame(bindScroll);
  }

  document.addEventListener('mouseleave', function () {
    if (lensWrap) lensWrap.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    if (lensWrap) lensWrap.style.opacity = '1';
    if (active) syncLens(cx, cy);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && active) deactivate();
  });
})();
