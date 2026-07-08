/* ──────────────────────────────────────────────────────────────
   SCROLL GUIDE — a retro pointer that rides the scroll and, at three
   key features, pops an XP tooltip pointing at them:
     • the brain nodes  • the command prompt  • the skills dome
   The rest of the time it follows the scroll on the right edge.
   Position is lerped every frame for smooth, glued motion.
   ────────────────────────────────────────────────────────────── */
(function initScrollGuide() {
  "use strict";

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = document.querySelector(".stage-scene");

  const guide = document.createElement("div");
  guide.className = "scroll-guide";
  guide.setAttribute("aria-hidden", "true");
  guide.innerHTML =
    '<div class="sg-bubble"><span class="sg-text"></span></div>' +
    '<div class="sg-arrow sg-bob"><svg viewBox="0 0 48 48"><path class="sg-stroke" d="M24 8 V34 M15 26 L24 36 L33 26"/></svg></div>';
  document.body.appendChild(guide);

  const text = guide.querySelector(".sg-text");
  const arrow = guide.querySelector(".sg-arrow");
  const stroke = guide.querySelector(".sg-stroke");
  if (stroke && stroke.getTotalLength) {
    try { guide.style.setProperty("--sg-len", Math.ceil(stroke.getTotalLength())); } catch (e) {}
  }

  const TARGETS = [
    { sel: "#brainStage", msg: "All these nodes are my GitHub repos — hover any one to peek." },
    { sel: "#terminalWindow", msg: "Check out my projects in detail — type or click around." },
    { sel: "#skillsGlobe", msg: "Hold & rotate the dome to explore my tech stack — hover a pill for details." },
  ].map(t => ({ msg: t.msg, el: document.querySelector(t.sel) })).filter(t => t.el);
  if (TARGETS.length === 0) return;

  let curX = window.innerWidth - 120;
  let curY = window.innerHeight * 0.4;
  let running = false;

  function activeTarget() {
    const vh = window.innerHeight;
    const mid = vh * 0.46;
    let best = null, bestD = Infinity;
    for (const t of TARGETS) {
      const r = t.el.getBoundingClientRect();
      if (r.height <= 0) continue;
      if (r.bottom < vh * 0.14 || r.top > vh * 0.9) continue;      // not meaningfully in view
      const d = Math.abs((r.top + Math.min(r.height, vh) / 2) - mid);
      if (d < bestD) { bestD = d; best = { t, r }; }
    }
    return best;
  }

  function frame() {
    const hit = activeTarget();
    let tgtX, tgtY;
    if (hit) {
      const r = hit.r;
      tgtX = Math.max(150, Math.min(window.innerWidth - 150, r.left + r.width / 2));
      tgtY = Math.max(84, Math.min(window.innerHeight - 150, r.top - 84));
      if (text.textContent !== hit.t.msg) text.textContent = hit.t.msg;
      guide.classList.add("sg-point");
      arrow.classList.remove("sg-bob");
    } else {
      const frac = stage ? stage.scrollTop / Math.max(1, stage.scrollHeight - stage.clientHeight) : 0;
      tgtX = window.innerWidth - 108;
      tgtY = window.innerHeight * (0.18 + Math.min(1, Math.max(0, frac)) * 0.64);
      guide.classList.remove("sg-point");
      arrow.classList.add("sg-bob");
    }
    const ease = prefersReduced ? 1 : 0.12;
    curX += (tgtX - curX) * ease;
    curY += (tgtY - curY) * ease;
    guide.style.transform = "translate3d(" + curX.toFixed(1) + "px," + curY.toFixed(1) + "px,0) translate(-50%,0)";
    requestAnimationFrame(frame);
  }

  function start() { if (!running) { running = true; requestAnimationFrame(frame); } }
  /* Delay so the brain nodes have loaded before the first callout. */
  window.setTimeout(start, 1200);
})();
