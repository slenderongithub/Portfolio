/* ──────────────────────────────────────────────────────────────
   RANSOM HEADINGS — swap any [data-ransom] element's text for the
   cut-out letter scraps in images/ransom/*.png. The original text
   stays as the element's accessible name (aria-label); the scraps
   are decorative. Words are grouped so they wrap whole, not mid-word.
   The hero name uses the same .rn-word/.rn-letter markup inline.
   ────────────────────────────────────────────────────────────── */
(function initRansom() {
  "use strict";

  function ransomize(el) {
    const text = el.textContent.trim();
    if (!text) return;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    text.split(/\s+/).forEach(word => {
      const w = document.createElement("span");
      w.className = "rn-word";
      w.setAttribute("aria-hidden", "true");
      for (const ch of word) {
        const key = ch.toLowerCase();
        if (!/[a-z]/.test(key)) continue;   // only a-z have a scrap
        const img = document.createElement("img");
        img.className = "rn-letter";
        img.src = `./images/ransom/${key}.png`;
        img.alt = "";
        img.decoding = "async";
        w.appendChild(img);
      }
      el.appendChild(w);
    });
    el.classList.add("rn-ready");
  }

  const run = () => document.querySelectorAll("[data-ransom]").forEach(ransomize);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
