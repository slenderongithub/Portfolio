/* ──────────────────────────────────────────────────────────────
   EXPERIENCE FOLDERS — replaces the timeline. A row of folders;
   clicking one opens it (papers fan out, magnetic on hover) and
   reveals the full entry in an XP detail window. Award folders link
   to the related project. Vanilla port of a React Folder component.
   ────────────────────────────────────────────────────────────── */
(function initFolderExperience() {
  "use strict";

  const grid = document.getElementById("expFolders");
  const detail = document.getElementById("expFolderDetail");
  if (!grid || !detail) return;

  const EXPERIENCES = [
    {
      title: "Vice President", org: "Northeast Cultural Club", date: "2025", award: null,
      papers: ["2025", "Leadership", "Events"],
      points: [
        "Managed planning cadence, delegation, and delivery across major events.",
        "Aligned performers, volunteers, and campus stakeholders on execution timelines.",
      ],
    },
    {
      title: "CareLink", org: "App Development Hackathon", date: "Hackathon", award: "1st Place", project: "carelink",
      papers: ["1st Place", "Healthcare", "React Native"],
      points: [
        "Built caregiver-patient coordination flows with reminder intelligence and tracking.",
        "Delivered a polished demo under deadline with a clear product story.",
      ],
    },
    {
      title: "Marketing Lead", org: "Microsoft Student Chapter, VIT-AP", date: "2024 — 2025", award: null,
      papers: ["2024–25", "Outreach", "Campaigns"],
      points: [
        "Led outreach strategy and campaign messaging for chapter initiatives.",
        "Coordinated event promotion with cross-team execution and partner support.",
      ],
    },
    {
      title: "Smart Glove", org: "National Hackathon", date: "1000+ teams", award: "Top 4 Finalist", project: "smart-glove",
      papers: ["Top 4", "Wearable", "IoT"],
      points: [
        "Designed a wearable safety concept for rapid emergency communication use cases.",
        "Ranked in the top finalists with strong prototype clarity and impact framing.",
      ],
    },
  ];

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  let openIndex = -1;

  EXPERIENCES.forEach((exp, i) => {
    const item = document.createElement("div");
    item.className = "exp-folder-item";
    const isAward = !!exp.award;
    const papersHtml = exp.papers
      .map(p => '<div class="paper"><span class="paper-tag">' + esc(p) + "</span></div>")
      .join("");
    item.innerHTML =
      '<div class="folder' + (isAward ? " is-award" : "") + '" data-index="' + i + '" role="button" tabindex="0" aria-expanded="false" aria-label="Open ' + esc(exp.title) + ' folder">' +
        '<div class="folder__back">' + papersHtml +
          '<div class="folder__front"></div><div class="folder__front right"></div>' +
        "</div>" +
      "</div>" +
      '<div class="exp-folder-label">' + esc(exp.title) +
        '<span class="exp-folder-role">' + esc(exp.org) + "</span>" +
      "</div>";
    grid.appendChild(item);
  });

  const folders = Array.from(grid.querySelectorAll(".folder"));

  function renderDetail(exp) {
    detail.innerHTML =
      '<div class="xp-titlebar">' +
        '<span class="xp-titlebar-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8L10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/></svg></span>' +
        '<span class="xp-titlebar-text">' + esc(exp.title) + "</span>" +
        '<div class="xp-titlebar-btns"><button class="xp-tb-btn xp-min" tabindex="-1"></button><button class="xp-tb-btn xp-max" tabindex="-1"></button><button class="xp-tb-btn xp-close" type="button" id="expFdClose" aria-label="Close"></button></div>' +
      "</div>" +
      '<div class="xp-window-body exp-fd-body">' +
        '<div class="exp-fd-meta"><span class="exp-fd-date">' + esc(exp.date) + "</span>" +
          (exp.award ? '<span class="exp-fd-award">' + esc(exp.award) + "</span>" : "") +
        "</div>" +
        '<p class="exp-fd-org">' + esc(exp.org) + "</p>" +
        '<ul class="exp-fd-points">' + exp.points.map(p => "<li>" + esc(p) + "</li>").join("") + "</ul>" +
        (exp.project ? '<button class="exp-fd-project" type="button" data-key="' + esc(exp.project) + '">View project ↗</button>' : "") +
      "</div>";

    const close = detail.querySelector("#expFdClose");
    if (close) close.addEventListener("click", closeAll);
    const proj = detail.querySelector(".exp-fd-project");
    if (proj) {
      proj.addEventListener("click", () => {
        const key = proj.getAttribute("data-key");
        if (typeof window.activateWindow === "function") window.activateWindow("window-repos");
        window.setTimeout(() => {
          if (typeof window.showProjectInTerminal === "function") window.showProjectInTerminal(key);
        }, 200);
      });
    }
  }

  function closeAll() {
    openIndex = -1;
    folders.forEach(f => { f.classList.remove("open"); f.setAttribute("aria-expanded", "false"); });
    detail.hidden = true;
  }

  function openFolder(i) {
    if (openIndex === i) { closeAll(); return; }
    openIndex = i;
    folders.forEach((f, j) => {
      const on = j === i;
      f.classList.toggle("open", on);
      f.setAttribute("aria-expanded", on ? "true" : "false");
    });
    renderDetail(EXPERIENCES[i]);
    detail.hidden = false;
    if (window.xpSound && typeof window.xpSound.ding === "function") window.xpSound.ding();
  }

  folders.forEach((folder, i) => {
    folder.addEventListener("click", () => openFolder(i));
    folder.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFolder(i); }
    });
    /* Magnetic papers — nudge toward the cursor while the folder is open. */
    folder.querySelectorAll(".paper").forEach(paper => {
      paper.addEventListener("mousemove", (e) => {
        if (!folder.classList.contains("open")) return;
        const r = paper.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.12;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.12;
        paper.style.setProperty("--mx", dx.toFixed(1) + "px");
        paper.style.setProperty("--my", dy.toFixed(1) + "px");
      });
      paper.addEventListener("mouseleave", () => {
        paper.style.setProperty("--mx", "0px");
        paper.style.setProperty("--my", "0px");
      });
    });
  });
})();
