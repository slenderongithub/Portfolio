/* ──────────────────────────────────────────────────────────────
   XP SOUND ENGINE
   Synthesises Windows-XP-flavoured cues with the Web Audio API —
   no audio files, and everything is triggered by a user gesture so
   autoplay policies are respected. Exposes window.xpSound.
   ────────────────────────────────────────────────────────────── */
(function initSounds() {
  "use strict";

  let ctx = null;
  let master = null;
  let muted = false;

  function ready() {
    try {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain();
        master.gain.value = 0.62;
        master.connect(ctx.destination);
      }
      if (ctx.state === "suspended") ctx.resume();
      return true;
    } catch (e) { return false; }
  }

  /* one voice */
  function tone(opts) {
    if (!ready() || muted) return;
    const t0 = ctx.currentTime + (opts.delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type || "sine";
    osc.frequency.setValueAtTime(opts.from || opts.freq, t0);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + opts.dur);
    const peak = opts.peak != null ? opts.peak : 0.2;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + (opts.attack || 0.008));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    let node = osc;
    if (opts.lp) {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = opts.lp;
      osc.connect(lp); node = lp;
    }
    node.connect(gain).connect(master);
    osc.start(t0);
    osc.stop(t0 + opts.dur + 0.02);
  }

  const api = {
    setMuted(v) { muted = !!v; },
    click() { tone({ type: "triangle", from: 1500, to: 760, dur: 0.05, peak: 0.16, attack: 0.004 }); },
    navigate() {
      tone({ type: "sine", from: 720, to: 470, dur: 0.11, peak: 0.13, lp: 2200 });
      tone({ type: "sine", from: 360, to: 300, dur: 0.13, peak: 0.06, delay: 0.02 });
    },
    ding() {
      tone({ type: "sine", freq: 1046.5, dur: 0.36, peak: 0.16 });
      tone({ type: "sine", freq: 1568, dur: 0.34, peak: 0.06 });
    },
    error() {
      tone({ type: "sine", freq: 880, dur: 0.18, peak: 0.16 });
      tone({ type: "sine", freq: 659, dur: 0.28, peak: 0.16, delay: 0.11 });
    },
    startup() {
      /* warm ascending chord — evokes the XP boot without copying it */
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((f, i) => {
        tone({ type: "triangle", freq: f, dur: 1.5 - i * 0.12, peak: 0.14, attack: 0.05, delay: i * 0.11, lp: 3200 });
        tone({ type: "sine", freq: f / 2, dur: 1.5, peak: 0.05, attack: 0.08, delay: i * 0.11 });
      });
    },
  };

  window.xpSound = api;

  /* Click cue on interactive chrome. Navigation elements make their own
     sound (played by app.js), so skip those here to avoid doubling up. */
  document.addEventListener("click", event => {
    const el = event.target.closest(
      "button, a.hero-cta, .pill, .pw-item, .pw-menu, .paint-menu, .paint-swatch, .sidebar-action-btn"
    );
    if (!el) return;
    if (el.closest(".sidebar-nav-item") || el.hasAttribute("data-open")) return;
    const href = el.getAttribute && el.getAttribute("href");
    if (href && /(index|contact)\.html/.test(href)) return;
    api.click();
  }, true);
})();
