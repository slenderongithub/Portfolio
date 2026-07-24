/* ──────────────────────────────────────────────────────────────
   PROJECT WORKSPACE — refined explorer panel
   List on the left, detail pane on the right. Exposes
   window.showProjectInTerminal / window.focusRepoCard for the
   project-gallery cards and the hero brain nodes.
   ────────────────────────────────────────────────────────────── */

/* Keys here MUST match the .pg-card data-key values in index.html so the
   gallery cards, the `ls`/`open <name>` terminal commands, and the brain
   nodes all resolve to the same project. Content is sourced from the résumé.
   NOTE: some `github` slugs are best-guesses — confirm the real repo names. */
const PROJECTS = [
  {
    key: "job-digest",
    name: "job-digest",
    tagline: "Local-first job aggregator",
    description: "Read-only job aggregator that scrapes India-relevant sources (Greenhouse, Lever, Unstop, Internshala, LinkedIn public, Naukri), filters by eligibility rules, then ranks survivors against your résumé with a free LLM — writing a local HTML digest of only the new matches each day. Runs a local scam-check heuristic on every listing. No auto-apply, nothing leaves your machine except the scraper's own requests.",
    tech: ["Python", "Playwright", "Gemini API", "YAML"],
    github: "https://github.com/slenderongithub/job-digest",
    status: "active",
    highlight: "Privacy-First",
    files: ["run.py", "jobdigest/sources/greenhouse.py", "jobdigest/filters/scam_check.py", "config/companies.yaml", "requirements.txt"],
  },
  {
    key: "typical",
    name: "Typical",
    tagline: "Gaze-verified typing trainer",
    description: "On-device gaze-integrity engine (MediaPipe FaceLandmarker in a Web Worker) that computer-vision-verifies typing focus via calibrated pitch/blendshape baselines — zero video ever leaves the browser. Two-tier Next.js 16 app (IndexedDB guest mode → PostgreSQL/Prisma accounts) with dual-layer anti-cheat combining client-side gaze verification and server-side keystroke-timing bot detection.",
    tech: ["Next.js", "TypeScript", "MediaPipe", "PostgreSQL"],
    github: "https://github.com/slenderongithub/Typical",
    status: "active",
    highlight: "Computer Vision",
    files: ["app/page.tsx", "workers/gaze.worker.ts", "lib/anticheat.ts", "prisma/schema.prisma", "package.json"],
  },
  {
    key: "carelink",
    name: "CareLink",
    tagline: "Healthcare coordination app",
    description: "Cross-platform caregiving app (6 screens, 11 reusable components) with medication adherence tracking, live GPS fitness monitoring, role-based family rooms with real-time presence, and a Gemini 1.5 Flash-powered AI health assistant. Won 1st Prize in the Healthcare for the Elderly category among 50+ teams.",
    tech: ["React Native", "Expo", "TypeScript", "Gemini API"],
    github: "https://github.com/slenderongithub/CareLink",
    status: "active",
    highlight: "Hackathon Winner",
    files: ["App.tsx", "screens/HomeScreen.tsx", "screens/CaregiverScreen.tsx", "components/AdherenceChart.tsx", "lib/gemini.ts"],
  },
  {
    key: "baitblock",
    name: "BaitBlock",
    tagline: "Explainable clickbait detection",
    description: "Full-stack clickbait detector with dual interchangeable backends (Node.js heuristic + Python SBERT/spaCy) behind one REST API, producing an explainable 0–100 risk score. Ships a 4-tier article acquisition pipeline (HTTP → AMP/RSS → headless → Wayback Machine) with production-grade SSRF protection on every redirect hop, and a pytest regression suite at 50%+ coverage.",
    tech: ["Python", "Node.js", "SBERT", "spaCy"],
    github: "https://github.com/slenderongithub/BaitBlock",
    status: "active",
    highlight: "Full-Stack NLP",
    files: ["api/server.js", "python/score.py", "python/acquire.py", "python/ssrf_guard.py", "tests/test_score.py"],
  },
  {
    key: "fix-protocol-mcp",
    name: "fix-protocol-mcp",
    tagline: "FIX 4.4 trading-protocol MCP server",
    description: "Protocol-compliant FIX 4.4 server — the standard messaging protocol for order entry and execution reporting in trading systems — exposing four tools to parse, validate, build, and explain messages against a bundled field dictionary with zero external API dependency. 100% pass rate across 34 pytest tests; merged into the community awesome-mcp-servers directory after passing Glama's automated build/introspection verification.",
    tech: ["Python", "FastMCP", "Docker", "pytest"],
    github: "https://github.com/slenderongithub/fix-protocol-mcp",
    status: "active",
    highlight: "Merged to awesome-mcp-servers",
    files: ["server.py", "tools/parse.py", "tools/validate.py", "data/fix44.dict", "tests/test_protocol.py"],
  },
  {
    key: "federated-learning-benchmark",
    name: "Federated Learning Benchmark",
    tagline: "Normalisation strategies under non-IID FL",
    description: "NFSU research: a Federated Learning pipeline built from scratch — FedAvg aggregation, non-IID client partitioning across 5 clients — with no external FL framework. Benchmarked 7 normalisation strategies over 20 communication rounds, reaching 88.36% peak accuracy; GroupNorm emerged as the optimal accuracy-fairness trade-off. Automated test harness loops training across all configs and auto-generates comparison plots.",
    tech: ["Python", "PyTorch", "Federated Learning"],
    github: "https://github.com/slenderongithub/federated-learning-benchmark",
    status: "research",
    highlight: "NFSU Research",
    files: ["main.py", "fl/fedavg.py", "fl/partition.py", "fl/norm_strategies.py", "harness/run_all.py"],
  },
  {
    key: "leafscan-pestdetection",
    name: "LeafScan",
    tagline: "Pest detection & recommendation",
    description: "Temperature-calibrated ResNet-50 for 9 pest species — 0.761 Macro-F1, 95% Top-3 accuracy — with Grad-CAM explainability. Temperature scaling reduced calibration error by 45%. One shared package serves both a Streamlit UI and a Starlette REST API, containerised with Docker.",
    tech: ["Python", "PyTorch", "Streamlit", "Docker"],
    github: "https://github.com/slenderongithub/LeafScan",
    status: "active",
    highlight: "AgriTech AI",
    files: ["leafscan/model.py", "leafscan/calibrate.py", "leafscan/gradcam.py", "app/streamlit_app.py", "app/api.py"],
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
