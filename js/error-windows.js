/* ──────────────────────────────────────────────────────────────
   XP ERROR DIALOGS
   Clicking the close (X) button on an Experience or Academic card
   spawns an authentic Windows XP error dialog in the centre of the
   screen. They cascade and stack — each must be closed by hand,
   just like the real thing.
   ────────────────────────────────────────────────────────────── */
(function initErrorWindows() {
  "use strict";

  const ERROR_ICON =
    '<svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true">' +
    '<circle cx="16" cy="16" r="14" fill="#e33">' +
    '</circle><circle cx="16" cy="16" r="14" fill="none" stroke="#b01c1c" stroke-width="1.5"/>' +
    '<path d="M10 10l12 12M22 10L10 22" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></svg>';

  const MESSAGES = [
    { title: "Cannot Close Window", msg: "This achievement is <b>read-only</b> and cannot be closed." },
    { title: "shubhadeep.exe", msg: "This window is not responding to your request to forget it." },
    { title: "Access Denied", msg: "You do not have permission to close this memory. 🙂" },
    { title: "Error", msg: "This window is load-bearing. Closing it may cause nostalgia." },
    { title: "Fatal Exception", msg: "0xC0FFEE — cannot delete progress that already happened." },
  ];

  let spawnIndex = 0;
  let audioCtx = null;

  function ding() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      [880, 660].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.09 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.16);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.18);
      });
    } catch (e) { /* audio not available — dialog still shows */ }
  }

  /* Drag any window by its titlebar (used by the error dialogs and,
     via window.xpDrag, the recycle-bin window). */
  function makeDraggable(win, handle) {
    if (!win || !handle) return;
    handle.style.cursor = "move";
    let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
    handle.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".xp-tb-btn, button")) return;
      const rect = win.getBoundingClientRect();
      win.style.left = rect.left + "px";
      win.style.top = rect.top + "px";
      win.style.right = "auto";
      win.style.bottom = "auto";
      ox = rect.left; oy = rect.top; sx = e.clientX; sy = e.clientY;
      dragging = true;
      if (handle.setPointerCapture) { try { handle.setPointerCapture(e.pointerId); } catch (err) {} }
      e.preventDefault();
    });
    handle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const nx = Math.max(4, Math.min(window.innerWidth - 48, ox + e.clientX - sx));
      const ny = Math.max(4, Math.min(window.innerHeight - 34, oy + e.clientY - sy));
      win.style.left = nx + "px";
      win.style.top = ny + "px";
    });
    const stop = (e) => {
      dragging = false;
      if (handle.releasePointerCapture && e && e.pointerId != null) {
        try { handle.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    };
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  }

  function spawnError() {
    const pick = MESSAGES[spawnIndex % MESSAGES.length];
    const dialog = document.createElement("div");
    dialog.className = "xp-window xp-error";
    dialog.setAttribute("role", "alertdialog");
    dialog.innerHTML =
      '<div class="xp-titlebar">' +
        '<span class="xp-titlebar-text">' + pick.title + "</span>" +
        '<div class="xp-titlebar-btns"><button class="xp-tb-btn xp-close" type="button" aria-label="Close"></button></div>' +
      "</div>" +
      '<div class="xp-window-body xp-error-body">' +
        '<div class="xp-error-row">' +
          '<span class="xp-error-icon">' + ERROR_ICON + "</span>" +
          '<p class="xp-error-msg">' + pick.msg + "</p>" +
        "</div>" +
        '<div class="xp-error-actions"><button class="xp-button xp-error-ok" type="button">OK</button></div>' +
      "</div>";

    const width = Math.min(430, window.innerWidth * 0.92);
    const off = (spawnIndex % 8) * 26;
    dialog.style.left = Math.max(8, window.innerWidth / 2 - width / 2 + off) + "px";
    dialog.style.top = Math.max(8, window.innerHeight / 2 - 96 + off) + "px";
    spawnIndex += 1;

    document.body.appendChild(dialog);
    makeDraggable(dialog, dialog.querySelector(".xp-titlebar"));
    if (window.xpSound) window.xpSound.error(); else ding();

    function close() { dialog.remove(); }
    const okBtn = dialog.querySelector(".xp-error-ok");
    const xBtn = dialog.querySelector(".xp-close");
    if (okBtn) okBtn.addEventListener("click", close);
    if (xBtn) xBtn.addEventListener("click", close);
    if (okBtn) okBtn.focus({ preventScroll: true });
    dialog.addEventListener("keydown", event => {
      if (event.key === "Escape" || event.key === "Enter") { event.preventDefault(); close(); }
    });
  }

  /* Wire the decorative close buttons on timeline cards. Delegated so it
     also covers cards revealed later; the error dialogs' own close
     buttons live under .xp-error and are excluded. */
  document.addEventListener("click", event => {
    const btn = event.target.closest(".xp-close");
    if (!btn) return;
    if (btn.closest(".xp-error")) return;                 // dialog's own X
    if (btn.closest("#projectWorkspace")) return;         // explorer close is functional
    const card = btn.closest(".tl-window, .edu-tl-item .xp-window, .terminal-window, .form-wrap");
    if (!card) return;
    event.preventDefault();
    spawnError();
  });

  window.xpDrag = makeDraggable;
})();
