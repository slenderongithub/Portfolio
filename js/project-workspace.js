/* ──────────────────────────────────────────────────────────────
   PROJECT WORKSPACE — refined explorer panel
   List on the left, detail pane on the right. Exposes
   window.showProjectInTerminal / window.focusRepoCard for the
   project-gallery cards and the hero brain nodes.
   ────────────────────────────────────────────────────────────── */

const PROJECTS = [
  {
    key: "carelink",
    name: "CareLink",
    tagline: "Healthcare coordination platform",
    description: "Healthcare coordination platform — medication reminders, adherence scoring, shared caregiver timelines, and AI wellness check-ins. Won 1st place at the App Development Hackathon.",
    tech: ["React Native", "TypeScript", "Firebase", "AI"],
    github: "https://github.com/slenderongithub/CareLink",
    status: "active",
    highlight: "Hackathon Winner",
    files: ["App.tsx", "screens/HomeScreen.tsx", "screens/CaregiverScreen.tsx", "components/AdherenceChart.tsx", "backend/server.js"],
  },
  {
    key: "smart-glove",
    name: "Smart Glove",
    tagline: "Gesture-triggered emergency wearable",
    description: "Embedded safety wearable with gesture-triggered emergency signaling and low-latency sensor interpretation. Top 4 finalist among 1000+ teams.",
    tech: ["Arduino", "C++", "IoT", "Embedded"],
    github: "https://github.com/slenderongithub/Smart-Glove-Safety-Device",
    status: "prototype",
    highlight: "Top 4 Finalist",
    files: ["main.py", "modeling.py", "neuralnet.py", "tableinsert.py"],
  },
  {
    key: "habit-forge",
    name: "HabitTrackerForge",
    tagline: "Habit analytics & streak engine",
    description: "Productivity behavior engine with reminder scheduling, streak persistence, and visual habit progress analytics for trend clarity and retention.",
    tech: ["Python", "React", "FastAPI", "PostgreSQL"],
    github: "https://github.com/slenderongithub/HabitTrackerForge",
    status: "active",
    highlight: "Full-Stack",
    files: ["backend/main.py", "backend/database.py", "forge-core.js", "streaks.html", "render.yaml"],
  },
  {
    key: "hack-me",
    name: "Hack-Me-If-You-Can",
    tagline: "Gamified security quiz platform",
    description: "Competitive quiz platform with timed mechanics, score progression, and leaderboard-style motivation through challenge-based rounds.",
    tech: ["JavaScript", "HTML", "CSS", "Game UX"],
    github: "https://github.com/slenderongithub/HACK-ME-IF-YOU-CAN",
    status: "active",
    highlight: "Gamified Learning",
    files: ["backend/server.js", "frontend/quiz.html", "frontend/leaderboard.html", "backend/db.json"],
  },
  {
    key: "ai-companion",
    name: "AI Companion",
    tagline: "NLP support assistant research",
    description: "Privacy-first NLP support assistant with intent and sentiment interpretation layers for emotionally sensitive interactions and early risk signal detection.",
    tech: ["Python", "NLP", "ML", "TensorFlow"],
    github: "https://github.com/slenderongithub/AI-Anti-Self-Harm-Companion",
    status: "research",
    highlight: "Mental Health AI",
    files: ["app.py", "server.js", "plot_pr_curves.py", "plot_confusion_matrix.py", "requirements.txt"],
  },
  {
    key: "pest-detection",
    name: "Pest Detection",
    tagline: "Crop disease detection AI",
    description: "AI-powered crop disease identification from plant photos with smart treatment recommendations by crop type and early warning prevention system.",
    tech: ["Python", "TensorFlow", "OpenCV", "Flask"],
    github: "https://github.com/slenderongithub/pest-detection",
    status: "active",
    highlight: "AgriTech AI",
    files: ["app.py", "app/routes.py", "app/models.py", "notebooks/pest_training.ipynb", "download_model.py"],
  },
  {
    key: "portfolio",
    name: "Portfolio",
    tagline: "This site — interactive 3D portfolio",
    description: "Interactive portfolio with 3D brain visualization, live GitHub sync, skills globe, and scroll-driven animations. Built with vanilla JS.",
    tech: ["JavaScript", "Three.js", "HTML", "CSS"],
    github: "https://github.com/slenderongithub/Portfolio",
    status: "active",
    highlight: "This Site",
    files: ["index.html", "styles.css", "js/app.js", "js/brain.js", "js/project-workspace.js"],
  },
  {
    key: "fedskinlesion",
    name: "FedSkinLesion",
    tagline: "Federated medical imaging ML",
    description: "Federated learning for medical AI — decentralized skin lesion diagnosis across hospital networks with strict privacy boundaries.",
    tech: ["Python", "PyTorch", "Federated Learning"],
    github: "https://github.com/slenderongithub/FedSkinLesion",
    status: "research",
    highlight: "Privacy-First ML",
    files: ["main.py", "models/resnet.py", "server/aggregator.py", "server/strategy.py", "pyproject.toml"],
  },
];

(function initProjectWorkspace() {
  const root = document.getElementById("projectWorkspace");
  const list = document.getElementById("pwList");
  const detail = document.getElementById("pwDetail");
  const count = document.getElementById("pwCount");
  if (!root || !list || !detail) return;

  const STATUS_COLORS = {
    active: "#4ade80",
    prototype: "#fbbf24",
    research: "#a78bfa",
  };
  const GITHUB_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>';

  let activeKey = null;
  let pulseTimer = null;

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function statusColor(status) {
    return STATUS_COLORS[status] || "#94a3b8";
  }

  function renderDetail(project) {
    detail.innerHTML =
      '<div class="pw-detail-inner">' +
        '<h3 class="pw-title">' + esc(project.name) + "</h3>" +
        '<div class="pw-badges">' +
          (project.highlight
            ? '<span class="pw-badge highlight">' + esc(project.highlight) + "</span>"
            : "") +
          '<span class="pw-badge status" style="--pw-status: ' + statusColor(project.status) + '">' +
            esc(project.status) +
          "</span>" +
        "</div>" +
        '<p class="pw-desc">' + esc(project.description) + "</p>" +
        '<p class="pw-section-label">Stack</p>' +
        '<div class="pw-chips">' +
          project.tech.map(item => '<span class="pw-chip">' + esc(item) + "</span>").join("") +
        "</div>" +
        '<p class="pw-section-label">Key files</p>' +
        '<div class="pw-files">' +
          project.files.map(file => '<span class="pw-file">' + esc(file) + "</span>").join("") +
        "</div>" +
        '<a class="pw-github" href="' + esc(project.github) + '" target="_blank" rel="noreferrer noopener">' +
          GITHUB_ICON + "<span>View on GitHub</span>" +
        "</a>" +
      "</div>";
  }

  function select(key) {
    const project = PROJECTS.find(item => item.key === key);
    if (!project || key === activeKey) return;
    activeKey = key;
    list.querySelectorAll(".pw-item").forEach(item => {
      item.classList.toggle("active", item.dataset.key === key);
    });
    renderDetail(project);
  }

  function pulse() {
    root.classList.remove("pw-pulse");
    void root.offsetWidth;
    root.classList.add("pw-pulse");
    if (pulseTimer !== null) clearTimeout(pulseTimer);
    pulseTimer = window.setTimeout(() => root.classList.remove("pw-pulse"), 1000);
  }

  function openWorkspace(scroll) {
    const wasHidden = root.hidden;
    root.hidden = false;
    if (scroll !== false) root.scrollIntoView({ behavior: "smooth", block: "center" });
    if (wasHidden && window.xpSound) window.xpSound.ding();
    pulse();
  }

  function closeWorkspace() {
    root.hidden = true;
  }

  function focusProject(key) {
    const project = PROJECTS.find(item => item.key === key);
    if (!project) return;
    openWorkspace(false);
    if (key !== activeKey) select(key);
    const activeItem = list.querySelector('.pw-item[data-key="' + key + '"]');
    if (activeItem && typeof activeItem.scrollIntoView === "function") {
      activeItem.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    root.scrollIntoView({ behavior: "smooth", block: "center" });
    pulse();
  }

  PROJECTS.forEach(project => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "pw-item";
    item.dataset.key = project.key;

    const name = document.createElement("span");
    name.className = "pw-item-name";
    const dot = document.createElement("span");
    dot.className = "pw-item-dot";
    dot.style.setProperty("--pw-status", statusColor(project.status));
    const label = document.createElement("span");
    label.textContent = project.name;
    name.appendChild(dot);
    name.appendChild(label);

    const tag = document.createElement("span");
    tag.className = "pw-item-tag";
    tag.textContent = project.tagline;

    item.appendChild(name);
    item.appendChild(tag);
    item.addEventListener("click", () => select(project.key));
    list.appendChild(item);
  });

  list.addEventListener("keydown", event => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const index = PROJECTS.findIndex(item => item.key === activeKey);
    const nextIndex = event.key === "ArrowDown"
      ? Math.min(PROJECTS.length - 1, index + 1)
      : Math.max(0, index - 1);
    const nextProject = PROJECTS[nextIndex];
    select(nextProject.key);
    const nextItem = list.querySelector('.pw-item[data-key="' + nextProject.key + '"]');
    if (nextItem) nextItem.focus();
  });

  if (count) count.textContent = PROJECTS.length + " objects";
  select(PROJECTS[0].key);

  const closeBtn = document.getElementById("pwCloseBtn");
  if (closeBtn) closeBtn.addEventListener("click", closeWorkspace);

  /* When a stage card or brain node opens a project, mirror it into
     the terminal so the two stay visibly connected. */
  function focusProjectFromCard(key) {
    const project = PROJECTS.find(item => item.key === key);
    focusProject(key);
    if (project && typeof window.terminalOnOpen === "function") {
      window.terminalOnOpen(project.name, project.key);
    }
  }

  /* Public API for the terminal + stage cards + brain nodes */
  window.projectExplorer = {
    open: () => openWorkspace(true),
    close: closeWorkspace,
    focus: focusProject,
    has: key => PROJECTS.some(p => p.key === key),
    list: () => PROJECTS.map(p => ({ key: p.key, name: p.name, tagline: p.tagline, status: p.status })),
  };
  window.showProjectInTerminal = focusProjectFromCard;
  window.focusRepoCard = focusProjectFromCard;
})();
