/* ──────────────────────────────────────────────────────────────
   PROJECT GALLERY — hover-expand card row
   Replaces the 3-D Stage Manager. A row of glossy project "spines";
   the hovered / focused card expands to a full cover, the rest
   collapse. Clicking (or Enter/Space) opens that project in the
   "My Projects" explorer via the same API the stage cards used.
   Vanilla port of a React + Framer Motion hover-expand gallery.
   ────────────────────────────────────────────────────────────── */

(function initProjectGallery() {
  "use strict";

  const gallery = document.getElementById("projectGallery");
  if (!gallery) return;

  const cards = Array.from(gallery.querySelectorAll(".pg-card"));
  if (cards.length === 0) return;

  /* Expand one card, collapse the rest. */
  function setActive(index) {
    cards.forEach((card, i) => {
      const on = i === index;
      card.classList.toggle("is-active", on);
      card.setAttribute("aria-expanded", on ? "true" : "false");
    });
  }

  /* Open the card's project in the Projects section / explorer. */
  function openProject(card) {
    const key = card.getAttribute("data-key");
    if (typeof window.activateWindow === "function") {
      window.activateWindow("window-repos");
    }
    if (!key) return;

    /* Placeholder cards (data-key not yet wired to a real project) just
       reveal the Projects section; only open the explorer for a known key. */
    const explorer = window.projectExplorer;
    if (explorer && typeof explorer.has === "function" && !explorer.has(key)) return;

    /* small scroll-settle delay before the explorer takes focus */
    window.setTimeout(() => {
      if (typeof window.showProjectInTerminal === "function") {
        window.showProjectInTerminal(key);
      } else if (typeof window.focusRepoCard === "function") {
        window.focusRepoCard(key);
      }
    }, 200);
  }

  /* Debounced hover: the flex-basis transition moves card edges under the
     cursor mid-animation, which can retrigger mouseenter on the neighbour
     and make the row flicker. A short delay (cancelled on mouseleave)
     absorbs that. */
  let hoverTimer = null;
  cards.forEach((card, i) => {
    card.addEventListener("mouseenter", () => {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => setActive(i), 80);
    });
    card.addEventListener("mouseleave", () => clearTimeout(hoverTimer));
    card.addEventListener("focus", () => setActive(i));
    card.addEventListener("click", () => {
      setActive(i);
      openProject(card);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      setActive(i);
      openProject(card);
    });
  });

  /* Honour whichever card ships with .is-active, else default to the first. */
  const initial = cards.findIndex(card => card.classList.contains("is-active"));
  setActive(initial === -1 ? 0 : initial);
})();
