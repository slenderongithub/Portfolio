/* ──────────────────────────────────────────────────────────────
   RECYCLE BIN — a Windows XP desktop bin in the bottom-right corner.
   Clicking toggles the bin art (closed ↔ open) and opens an XP window
   of "failed projects / lessons learned". "Restore" is a gag — some
   lessons can't be undone.
   ────────────────────────────────────────────────────────────── */
(function initRecycleBin() {
  "use strict";

  const bin = document.getElementById("recycleBin");
  const win = document.getElementById("recycleWindow");
  if (!bin || !win) return;
  const closeBtn = document.getElementById("rbClose");

  function open() {
    win.classList.add("is-open");
    bin.classList.add("is-open");
    bin.setAttribute("aria-expanded", "true");
    if (window.xpSound && typeof window.xpSound.ding === "function") window.xpSound.ding();
  }
  function close() {
    win.classList.remove("is-open");
    bin.classList.remove("is-open");
    bin.setAttribute("aria-expanded", "false");
  }

  bin.addEventListener("click", () => {
    win.classList.contains("is-open") ? close() : open();
  });
  if (closeBtn) closeBtn.addEventListener("click", close);

  /* Make the window draggable by its titlebar (shared helper from error-windows.js). */
  if (typeof window.xpDrag === "function") {
    window.xpDrag(win, win.querySelector(".xp-titlebar"));
  }

  win.querySelectorAll(".rb-restore").forEach((btn) => {
    const original = btn.textContent;
    let timer = null;
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (window.xpSound && typeof window.xpSound.error === "function") window.xpSound.error();
      btn.textContent = "Can't restore — lesson kept";
      btn.disabled = true;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 1400);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && win.classList.contains("is-open")) close();
  });
})();
