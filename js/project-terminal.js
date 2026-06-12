/* ──────────────────────────────────────────────────────────────
   PROJECT TERMINAL — Interactive VS-Code-style project explorer
   ────────────────────────────────────────────────────────────── */

const PROJECTS = [
  {
    key: "carelink",
    name: "CareLink",
    repo: "CareLink",
    description: "Healthcare coordination platform — medication reminders, adherence scoring, shared caregiver timelines, and AI wellness check-ins. Won 1st place at the App Development Hackathon.",
    tech: ["React Native", "TypeScript", "Firebase", "AI"],
    github: "https://github.com/slenderongithub/CareLink",
    status: "active",
    highlight: "Hackathon Winner",
    structure: [
      { name: "backend", type: "folder", children: [
        { name: "server.js", type: "file" },
        { name: "package.json", type: "file" }
      ]},
      { name: "components", type: "folder", children: [
        { name: "AdherenceChart.tsx", type: "file" },
        { name: "ReminderItem.tsx", type: "file" }
      ]},
      { name: "screens", type: "folder", children: [
        { name: "HomeScreen.tsx", type: "file" },
        { name: "CaregiverScreen.tsx", type: "file" }
      ]},
      { name: "App.tsx", type: "file" },
      { name: "app.json", type: "file" },
      { name: "tsconfig.json", type: "file" },
      { name: "README.md", type: "file" },
      { name: "package.json", type: "file" }
    ]
  },
  {
    key: "smart-glove",
    name: "Smart-Glove-Safety-Device",
    repo: "Smart-Glove-Safety-Device",
    description: "Embedded safety wearable with gesture-triggered emergency signaling and low-latency sensor interpretation. Top 4 finalist among 1000+ teams.",
    tech: ["Arduino", "C++", "IoT", "Embedded"],
    github: "https://github.com/slenderongithub/Smart-Glove-Safety-Device",
    status: "prototype",
    highlight: "Top 4 Finalist",
    structure: [
      { name: "main.py", type: "file" },
      { name: "modeling.py", type: "file" },
      { name: "neuralnet.py", type: "file" },
      { name: "tableinsert.py", type: "file" },
      { name: "README.md", type: "file" }
    ]
  },
  {
    key: "habit-forge",
    name: "HabitTrackerForge",
    repo: "HabitTrackerForge",
    description: "Productivity behavior engine with reminder scheduling, streak persistence, and visual habit progress analytics for trend clarity and retention.",
    tech: ["Python", "React", "FastAPI", "PostgreSQL"],
    github: "https://github.com/slenderongithub/HabitTrackerForge",
    status: "active",
    highlight: "Full-Stack",
    structure: [
      { name: "backend", type: "folder", children: [
        { name: "main.py", type: "file" },
        { name: "database.py", type: "file" }
      ]},
      { name: "index.html", type: "file" },
      { name: "admin.html", type: "file" },
      { name: "signin.html", type: "file" },
      { name: "signup.html", type: "file" },
      { name: "streaks.html", type: "file" },
      { name: "hobbies.html", type: "file" },
      { name: "forge-app.css", type: "file" },
      { name: "forge-core.js", type: "file" },
      { name: "render.yaml", type: "file" }
    ]
  },
  {
    key: "hack-me",
    name: "HACK-ME-IF-YOU-CAN",
    repo: "HACK-ME-IF-YOU-CAN",
    description: "Competitive quiz platform with timed mechanics, score progression, and leaderboard-style motivation through challenge-based rounds.",
    tech: ["JavaScript", "HTML", "CSS", "Game UX"],
    github: "https://github.com/slenderongithub/HACK-ME-IF-YOU-CAN",
    status: "active",
    highlight: "Gamified Learning",
    structure: [
      { name: "backend", type: "folder", children: [
        { name: "server.js", type: "file" },
        { name: "db.json", type: "file" }
      ]},
      { name: "frontend", type: "folder", children: [
        { name: "assets", type: "folder", children: [
          { name: "quiz.png", type: "file" }
        ]},
        { name: "index.html", type: "file" },
        { name: "login.html", type: "file" },
        { name: "signup.html", type: "file" },
        { name: "quiz.html", type: "file" },
        { name: "score.html", type: "file" },
        { name: "leaderboard.html", type: "file" }
      ]},
      { name: "README.md", type: "file" }
    ]
  },
  {
    key: "ai-companion",
    name: "AI-Anti-Self-Harm-Companion",
    repo: "AI-Anti-Self-Harm-Companion",
    description: "Privacy-first NLP support assistant with intent and sentiment interpretation layers for emotionally sensitive interactions and early risk signal detection.",
    tech: ["Python", "NLP", "ML", "TensorFlow"],
    github: "https://github.com/slenderongithub/AI-Anti-Self-Harm-Companion",
    status: "research",
    highlight: "Mental Health AI",
    structure: [
      { name: "screenshots", type: "folder", children: [
        { name: "companion-demo.png", type: "file" }
      ]},
      { name: "app.py", type: "file" },
      { name: "plot_radar_graph.py", type: "file" },
      { name: "plot_confusion_matrix.py", type: "file" },
      { name: "plot_pr_curves.py", type: "file" },
      { name: "plot_violin_graph.py", type: "file" },
      { name: "server.js", type: "file" },
      { name: "package.json", type: "file" },
      { name: "requirements.txt", type: "file" },
      { name: "README.md", type: "file" }
    ]
  },
  {
    key: "pest-detection",
    name: "Pest-Detection",
    repo: "pest-detection",
    description: "AI-powered crop disease identification from plant photos with smart treatment recommendations by crop type and early warning prevention system.",
    tech: ["Python", "TensorFlow", "OpenCV", "Flask"],
    github: "https://github.com/slenderongithub/pest-detection",
    status: "active",
    highlight: "AgriTech AI",
    structure: [
      { name: "app", type: "folder", children: [
        { name: "routes.py", type: "file" },
        { name: "models.py", type: "file" }
      ]},
      { name: "notebooks", type: "folder", children: [
        { name: "pest_training.ipynb", type: "file" }
      ]},
      { name: "app.py", type: "file" },
      { name: "download_model.py", type: "file" },
      { name: "requirements.txt", type: "file" },
      { name: "LICENSE", type: "file" },
      { name: "README.md", type: "file" }
    ]
  },
  {
    key: "portfolio",
    name: "Portfolio",
    repo: "Portfolio",
    description: "Interactive portfolio with 3D brain visualization, live GitHub sync, skills globe, and scroll-driven animations. Built with vanilla JS.",
    tech: ["JavaScript", "Three.js", "HTML", "CSS"],
    github: "https://github.com/slenderongithub/Portfolio",
    status: "active",
    highlight: "This Site",
    structure: [
      { name: "js", type: "folder", children: [
        { name: "app.js", type: "file" },
        { name: "project-terminal.js", type: "file" },
        { name: "brain.js", type: "file" },
        { name: "lens.js", type: "file" }
      ]},
      { name: "index.html", type: "file" },
      { name: "contact.html", type: "file" },
      { name: "styles.css", type: "file" },
      { name: "package.json", type: "file" },
      { name: "README.md", type: "file" }
    ]
  },
  {
    key: "fedskinlesion",
    name: "FedSkinLesion",
    repo: "FedSkinLesion",
    description: "Federated learning for medical AI — decentralized skin lesion diagnosis across hospital networks with strict privacy boundaries.",
    tech: ["Python", "PyTorch", "Federated Learning"],
    github: "https://github.com/slenderongithub/FedSkinLesion",
    status: "research",
    highlight: "Privacy-First ML",
    structure: [
      { name: "models", type: "folder", children: [
        { name: "resnet.py", type: "file" },
        { name: "client_model.py", type: "file" }
      ]},
      { name: "server", type: "folder", children: [
        { name: "aggregator.py", type: "file" },
        { name: "strategy.py", type: "file" }
      ]},
      { name: "main.py", type: "file" },
      { name: "pyproject.toml", type: "file" },
      { name: "requirements.txt", type: "file" },
      { name: "README.md", type: "file" }
    ]
  },
];

const ICONS = {
  folder: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8L10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" fill="#f59e0b"/><path d="M2 10h20v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z" fill="#fbbf24"/></svg>`,
  folderOpen: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8L10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" fill="#f59e0b"/><path d="M2 10h20v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z" fill="#fbbf24"/><path d="M4 8h16l2 10H2L4 8z" fill="#fcd34d" opacity="0.95"/></svg>`,
  file: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#64748b"/><path d="M14 2v6h6" fill="#475569"/></svg>`,
  filePy: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#3776ab"/><path d="M14 2v6h6" fill="#1e3a8a"/><text x="7" y="17" font-size="8" fill="#ffd343" font-family="system-ui, sans-serif" font-weight="900">Py</text></svg>`,
  fileJs: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#eab308"/><path d="M14 2v6h6" fill="#ca8a04"/><text x="7" y="17" font-size="8" fill="#000000" font-family="system-ui, sans-serif" font-weight="900">JS</text></svg>`,
  fileTsx: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#2563eb"/><path d="M14 2v6h6" fill="#1d4ed8"/><text x="6" y="17" font-size="8" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900">TS</text></svg>`,
  fileCpp: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#00599c"/><path d="M14 2v6h6" fill="#004480"/><text x="5" y="16" font-size="6.5" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900">C++</text></svg>`,
  fileHtml: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#f97316"/><path d="M14 2v6h6" fill="#ea580c"/><text x="6" y="17" font-size="8" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900">&lt;&gt;</text></svg>`,
  fileCss: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#3b82f6"/><path d="M14 2v6h6" fill="#2563eb"/><text x="8" y="17" font-size="9" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900">#</text></svg>`,
  fileMd: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#0f766e"/><path d="M14 2v6h6" fill="#115e59"/><text x="6" y="17" font-size="8" fill="#5eead4" font-family="system-ui, sans-serif" font-weight="900">M↓</text></svg>`,
  fileYaml: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#b91c1c"/><path d="M14 2v6h6" fill="#991b1b"/><text x="5" y="17" font-size="8" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900">Yml</text></svg>`,
  fileJson: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#f59e0b"/><path d="M14 2v6h6" fill="#d97706"/><text x="7" y="17" font-size="8" fill="#000000" font-family="system-ui, sans-serif" font-weight="900">{}</text></svg>`,
  fileTxt: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#64748b"/><path d="M14 2v6h6" fill="#475569"/><text x="7" y="17" font-size="8" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900">Tx</text></svg>`,
  chevron: `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2l4 3-4 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  github: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>`,
};

function getFileIcon(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  const map = {
    py: ICONS.filePy,
    js: ICONS.fileJs,
    tsx: ICONS.fileTsx,
    ts: ICONS.fileTsx,
    cpp: ICONS.fileCpp,
    h: ICONS.fileCpp,
    html: ICONS.fileHtml,
    css: ICONS.fileCss,
    md: ICONS.fileMd,
    yaml: ICONS.fileYaml,
    yml: ICONS.fileYaml,
    json: ICONS.fileJson,
    txt: ICONS.fileTxt,
    toml: ICONS.fileYaml,
  };
  return map[ext] || ICONS.file;
}

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FORTUNES = [
  "\"The best way to predict the future is to invent it.\" — Alan Kay",
  "\"Talk is cheap. Show me the code.\" — Linus Torvalds",
  "\"First, solve the problem. Then, write the code.\" — John Johnson",
  "\"Code is like humor. When you have to explain it, it's bad.\" — Cory House",
  "\"Simplicity is the soul of efficiency.\" — Austin Freeman",
  "\"Any fool can write code that a computer can understand. Good programmers write code that humans can understand.\" — Martin Fowler",
  "\"It's not a bug — it's an undocumented feature.\" — Anonymous",
  "\"The only way to do great work is to love what you do.\" — Steve Jobs",
  "\"In the middle of difficulty lies opportunity.\" — Albert Einstein",
  "\"Debugging is twice as hard as writing the code in the first place.\" — Brian Kernighan",
  "\"Make it work, make it right, make it fast.\" — Kent Beck",
  "\"Stay hungry, stay foolish.\" — Steve Jobs",
  "\"The computer was born to solve problems that did not exist before.\" — Bill Gates",
  "\"Programs must be written for people to read, and only incidentally for machines to execute.\" — Harold Abelson",
];

const ASCII_ABOUT_CARD = [
  '<span style="color:#67e8f9">╭──────────────────────────────────────╮</span>',
  '<span style="color:#67e8f9">│</span>  <span style="color:#fbbf24;font-weight:700">README.md</span>                           <span style="color:#67e8f9">│</span>',
  '<span style="color:#67e8f9">├──────────────────────────────────────┤</span>',
  '<span style="color:#67e8f9">│</span>  <span style="color:#a8e66b">Name:</span>    Shubhadeep Datta            <span style="color:#67e8f9">│</span>',
  '<span style="color:#67e8f9">│</span>  <span style="color:#a8e66b">School:</span>  VIT-AP University            <span style="color:#67e8f9">│</span>',
  '<span style="color:#67e8f9">│</span>  <span style="color:#a8e66b">Focus:</span>   AI/ML, Full-Stack, IoT       <span style="color:#67e8f9">│</span>',
  '<span style="color:#67e8f9">│</span>  <span style="color:#a8e66b">Status:</span>  Building things              <span style="color:#67e8f9">│</span>',
  '<span style="color:#67e8f9">╰──────────────────────────────────────╯</span>',
];

(function initProjectTerminal() {
  const termWrap = document.getElementById("projectTerminalWrap");
  const terminal = document.getElementById("projectTerminal");
  const termBody = document.getElementById("projectTerminalBody");
  const termOutput = document.getElementById("projectTerminalOutput");
  const termInput = document.getElementById("projectTerminalInput");
  const vscode = document.getElementById("projectVscode");
  const vscodeWrap = document.getElementById("projectVscodeWrap");
  const hint = document.getElementById("projectTerminalHint");

  if (!termWrap || !terminal || !termBody || !termOutput || !termInput || !vscode || !vscodeWrap) return;

  let history = [];
  let historyIndex = -1;
  let vsCodeOpen = false;

  const ALL_COMMANDS = [
    "help", "run projects", "ls", "ls -la", "clear", "about",
    "hello", "hi", "hey", "whoami", "date", "pwd",
    "cat README.md", "echo", "history",
    "neofetch", "matrix", "rick", "rm -rf /",
    "ping google.com", "fortune", "skills", "contact",
    "github", "resume", "sudo", "exit", "quit",
    "open carelink", "open smart-glove", "open habit-forge",
    "open hack-me", "open ai-companion", "open pest-detection",
    "open portfolio", "open fedskinlesion",
  ];

  appendOutput('Type <span style="color:#a8e66b">"help"</span> for available commands.', "comment");

  termInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const cmd = termInput.value.trim();
      termInput.value = "";
      historyIndex = -1;
      if (!cmd) return;
      history.push(cmd);
      appendOutput(`shubhadeep@portfolio:~$ ${esc(cmd)}`, "prompt-echo");
      handleCommand(cmd.toLowerCase(), cmd);
    } else if (e.key === "ArrowUp") {

      e.preventDefault();
      if (history.length === 0) return;
      if (historyIndex === -1) {
        historyIndex = history.length - 1;
      } else if (historyIndex > 0) {
        historyIndex--;
      }
      termInput.value = history[historyIndex];
    } else if (e.key === "ArrowDown") {

      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex < history.length - 1) {
        historyIndex++;
        termInput.value = history[historyIndex];
      } else {
        historyIndex = -1;
        termInput.value = "";
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const partial = termInput.value.trim().toLowerCase();
      if (!partial) return;
      const matches = ALL_COMMANDS.filter(c => c.startsWith(partial) && c !== partial);
      if (matches.length === 1) {
        termInput.value = matches[0];
      } else if (matches.length > 1) {
        appendOutput(`shubhadeep@portfolio:~$ ${esc(termInput.value)}`, "prompt-echo");
        appendOutput(matches.map(m => `  ${m}`).join("\n"), "info");
      }
    }
  });


  termBody.addEventListener("click", function () {
    if (!vsCodeOpen) termInput.focus();
  });

  function appendOutput(text, cls) {
    const line = document.createElement("div");
    line.className = "pt-output-line" + (cls ? " pt-" + cls : "");
    line.innerHTML = text;
    termOutput.appendChild(line);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function typewriterOutput(text, cls, speed = 28) {
    const line = document.createElement("div");
    line.className = "pt-output-line" + (cls ? " pt-" + cls : "");
    termOutput.appendChild(line);
    let i = 0;
    function type() {
      if (i < text.length) {
        line.textContent += text[i];
        i++;
        termBody.scrollTop = termBody.scrollHeight;
        setTimeout(type, speed);
      }
    }
    type();
  }

  function runMatrixEffect(durationMs = 3000) {
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";
    const columns = 48;
    const interval = 80;
    let elapsed = 0;
    const timer = setInterval(() => {
      if (elapsed >= durationMs) {
        clearInterval(timer);
        appendOutput("\n<span style=\"color:#4ade80\">Wake up, Neo...</span> Welcome back.\n", "");
        return;
      }
      let row = "";
      for (let c = 0; c < columns; c++) {
        const opacity = (Math.random() * 0.7 + 0.3).toFixed(2);
        const ch = chars[Math.floor(Math.random() * chars.length)];
        row += `<span style="color:rgba(74,222,128,${opacity})">${ch}</span>`;
      }
      appendOutput(row, "");
      elapsed += interval;
    }, interval);
  }

  function handleCommand(cmd, rawCmd) {

    if (cmd === "run projects" || cmd === "run project") {
      runProjects();

    } else if (cmd === "help") {
      appendOutput("", "");
      appendOutput('<span style="color:#fbbf24;font-weight:700">Available Commands</span>', "");
      appendOutput("", "");
      appendOutput("  <span style=\"color:#a8e66b\">run projects</span>  — open the project explorer", "info");
      appendOutput("  <span style=\"color:#a8e66b\">open &lt;name&gt;</span>   — open a specific project", "info");
      appendOutput("  <span style=\"color:#a8e66b\">ls</span>            — list projects", "info");
      appendOutput("  <span style=\"color:#a8e66b\">about</span>         — about this terminal", "info");
      appendOutput("  <span style=\"color:#a8e66b\">skills</span>        — tech stack", "info");
      appendOutput("  <span style=\"color:#a8e66b\">contact</span>       — reach out", "info");
      appendOutput("  <span style=\"color:#a8e66b\">github</span>        — visit GitHub profile", "info");
      appendOutput("  <span style=\"color:#a8e66b\">neofetch</span>      — system info", "info");
      appendOutput("  <span style=\"color:#a8e66b\">cat README.md</span> — about me", "info");
      appendOutput("  <span style=\"color:#a8e66b\">clear</span>         — clear terminal", "info");
      appendOutput("  <span style=\"color:#a8e66b\">help</span>          — show this help", "info");
      appendOutput("", "");

    } else if (cmd === "clear") {
      termOutput.innerHTML = "";
      closeVSCodeView();

    } else if (cmd === "ls" || cmd === "ls -la") {
      PROJECTS.forEach((p) => {
        appendOutput(`  ${esc(p.name)}/  <span style="color:#6b7280">[${esc(p.status)}]</span>`, "info");
      });
      appendOutput(`\n  <span style="color:#6b7280">${PROJECTS.length} repositories</span>\n`, "");

    } else if (cmd === "about") {
      appendOutput("", "");
      appendOutput("<span style=\"color:#fbbf24\">Interactive project terminal v2.0</span>", "info");
      appendOutput("Built with vanilla JS. No frameworks, no dependencies.", "info");
      appendOutput("Shubhadeep Datta © 2025\n", "info");

    } else if (cmd === "hello" || cmd === "hi" || cmd === "hey") {
      typewriterOutput("Hey there. Welcome to my corner of the internet.", "info", 32);

    } else if (cmd === "whoami") {
      typewriterOutput("A curious soul who clicked on a terminal. I like you already.", "comment", 30);

    } else if (cmd === "date") {
      const now = new Date();
      const formatted = now.toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
      appendOutput(`  ${formatted}`, "info");
      appendOutput("", "");

    } else if (cmd === "pwd") {
      appendOutput("  /home/shubhadeep/portfolio\n", "info");

    } else if (cmd === "cat readme.md" || cmd === "cat readme") {
      appendOutput("", "");
      ASCII_ABOUT_CARD.forEach(line => appendOutput(line, ""));
      appendOutput("", "");

    } else if (cmd.startsWith("echo ")) {
      const msg = rawCmd.slice(5);
      appendOutput(`  ${esc(msg)}`, "info");
      appendOutput("", "");

    } else if (cmd === "echo") {
      appendOutput("", "");

    } else if (cmd === "history") {
      if (history.length === 0) {
        appendOutput("  No commands yet.\n", "comment");
      } else {
        history.forEach((h, i) => {
          appendOutput(`  <span style="color:#6b7280">${String(i + 1).padStart(4)}</span>  ${esc(h)}`, "info");
        });
        appendOutput("", "");
      }

    } else if (cmd === "neofetch") {
      const uptime = Math.floor((Date.now() - performance.timeOrigin) / 1000);
      const mins = Math.floor(uptime / 60);
      const secs = uptime % 60;
      appendOutput("", "");
      appendOutput('  <span style="color:#67e8f9;font-weight:700">shubhadeep</span>@<span style="color:#a8e66b;font-weight:700">portfolio</span>', "");
      appendOutput("  ─────────────────────", "");
      appendOutput(`  <span style="color:#fbbf24">OS:</span>       Portfolio OS v2.0`, "");
      appendOutput(`  <span style="color:#fbbf24">Shell:</span>    zsh (interactive)`, "");
      appendOutput(`  <span style="color:#fbbf24">Uptime:</span>   ${mins}m ${secs}s`, "");
      appendOutput(`  <span style="color:#fbbf24">Projects:</span> ${PROJECTS.length} repositories`, "");
      appendOutput(`  <span style="color:#fbbf24">Theme:</span>    ${document.body.classList.contains("theme-midnight") ? "Midnight" : "Light"}`, "");
      appendOutput(`  <span style="color:#fbbf24">Engine:</span>   Vanilla JS, zero deps`, "");
      appendOutput(`  <span style="color:#fbbf24">Status:</span>   Building`, "");
      appendOutput("", "");
      appendOutput('  <span style="background:#ef4444;color:#ef4444">  </span><span style="background:#f97316;color:#f97316">  </span><span style="background:#eab308;color:#eab308">  </span><span style="background:#22c55e;color:#22c55e">  </span><span style="background:#3b82f6;color:#3b82f6">  </span><span style="background:#8b5cf6;color:#8b5cf6">  </span><span style="background:#ec4899;color:#ec4899">  </span><span style="background:#67e8f9;color:#67e8f9">  </span>', "");
      appendOutput("", "");

    } else if (cmd === "matrix") {
      appendOutput("  <span style=\"color:#4ade80\">Entering the Matrix...</span>\n", "");

      runMatrixEffect(3000);

    } else if (cmd === "rick") {
      appendOutput("", "");
      appendOutput("  Never gonna give you up...", "info");
      appendOutput("  Never gonna let you down...", "info");
      appendOutput("  Never gonna run around and desert you...", "info");
      appendOutput("", "");
      appendOutput("  <span style=\"color:#6b7280\">Nice try though.</span>\n", "");

    } else if (cmd === "rm -rf /" || cmd === "rm -rf /*") {
      appendOutput("  <span style=\"color:#f87171;font-weight:700\">Permission denied.</span> This portfolio is indestructible.\n", "");

    } else if (cmd === "ping google.com") {
      appendOutput("  PING google.com (142.250.190.78): 56 data bytes", "info");
      const pings = [
        "  64 bytes from 142.250.190.78: time=0.42ms — faster than my bug fixes",
        "  64 bytes from 142.250.190.78: time=0.38ms — still faster than npm install",
        "  64 bytes from 142.250.190.78: time=0.44ms — but slower than my motivation at 3am",
      ];
      pings.forEach((p, i) => {
        setTimeout(() => {
          appendOutput(p, "info");
          if (i === pings.length - 1) {
            appendOutput("\n  <span style=\"color:#6b7280\">--- google.com ping statistics ---</span>", "");
            appendOutput("  <span style=\"color:#6b7280\">3 packets transmitted, 3 received, 0% packet loss</span>\n", "");
          }
        }, (i + 1) * 600);
      });

    } else if (cmd === "fortune") {
      const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      appendOutput("", "");
      appendOutput(`  <span style="color:#c084fc">${esc(fortune)}</span>`, "");
      appendOutput("", "");

    } else if (cmd === "skills") {
      appendOutput("", "");
      appendOutput("  <span style=\"color:#fbbf24;font-weight:700\">Languages</span>    Python · JavaScript · TypeScript · C++", "");
      appendOutput("  <span style=\"color:#fbbf24;font-weight:700\">Frontend</span>     React · Next.js · HTML · CSS · Tailwind", "");
      appendOutput("  <span style=\"color:#fbbf24;font-weight:700\">Backend</span>      FastAPI · Node.js · Flask", "");
      appendOutput("  <span style=\"color:#fbbf24;font-weight:700\">AI/ML</span>        TensorFlow · PyTorch · Scikit-Learn · NLP", "");
      appendOutput("  <span style=\"color:#fbbf24;font-weight:700\">Data</span>         PostgreSQL · MongoDB · Firebase · Redis", "");
      appendOutput("  <span style=\"color:#fbbf24;font-weight:700\">DevOps</span>       Docker · Git · GitHub · Vercel · AWS", "");
      appendOutput("", "");

    } else if (cmd === "contact") {
      appendOutput("", "");
      appendOutput("  <span style=\"color:#fbbf24\">email</span>   <span style=\"color:#67e8f9\">slenderisprogramming@gmail.com</span>", "");
      appendOutput("  <span style=\"color:#fbbf24\">github</span>  <span style=\"color:#67e8f9\">github.com/slenderongithub</span>", "");
      appendOutput("  <span style=\"color:#fbbf24\">web</span>     <a href=\"./contact.html\" style=\"color:#a8e66b;text-decoration:underline\">contact page</a>", "");
      appendOutput("", "");

    } else if (cmd === "github") {
      appendOutput("  Opening GitHub profile...\n", "info");
      window.open("https://github.com/slenderongithub", "_blank");

    } else if (cmd === "resume" || cmd === "cv") {
      typewriterOutput("Working on it... check back soon.", "comment", 30);

    } else if (cmd.startsWith("open ")) {
      const projectName = cmd.slice(5).trim();
      const project = PROJECTS.find(p =>
        p.key === projectName ||
        p.name.toLowerCase() === projectName ||
        p.name.toLowerCase().replace(/-/g, " ") === projectName
      );
      if (project) {
        appendOutput(`  Opening ${esc(project.name)}...\n`, "loading");
        if (!vsCodeOpen) {
          runProjects();
          setTimeout(() => showProject(project), 2000);
        } else {
          showProject(project);
        }
      } else {
        appendOutput(`  Project "${esc(projectName)}" not found.`, "error");
        appendOutput('  Type <span style="color:#a8e66b">"ls"</span> to see available projects.\n', "comment");
      }

    } else if (cmd === "sudo" || cmd.startsWith("sudo ")) {
      appendOutput("  Nice try. You don't have root here.\n", "comment");

    } else if (cmd === "exit" || cmd === "quit") {
      appendOutput("  There's no escaping this portfolio.\n", "comment");

    } else if (cmd === "vim" || cmd === "nano" || cmd === "emacs") {
      appendOutput(`  ${esc(cmd)}: I use VS Code.\n`, "comment");

    } else if (cmd === "npm install" || cmd === "yarn install") {
      appendOutput("  <span style=\"color:#6b7280\">This is vanilla JS. No node_modules needed.</span>\n", "");

    } else if (cmd === "man") {
      appendOutput("  What manual page do you want? Try <span style=\"color:#a8e66b\">\"help\"</span> instead.\n", "comment");

    } else if (cmd === "42") {
      appendOutput("  The answer to life, the universe, and everything.\n", "info");

    } else if (cmd === "motd" || cmd === "banner") {
      appendOutput('Type <span style="color:#a8e66b">"help"</span> for available commands.', "comment");
      appendOutput("", "");

    } else {
      appendOutput(`  zsh: command not found: ${esc(cmd)}`, "error");
      appendOutput('  Type <span style="color:#a8e66b">"help"</span> for available commands.\n', "comment");
    }
  }


  function runProjects() {
    if (vsCodeOpen) {
      appendOutput("  Workspace is already open.\n", "comment");
      return;
    }

    termInput.disabled = true;
    if (hint) hint.style.display = "none";

    const loadingLines = [
      { text: "> Scanning repositories...", delay: 0 },
      { text: "> Indexing project files...", delay: 400 },
      { text: `> Found ${PROJECTS.length} repositories`, delay: 800 },
      { text: "> Opening workspace...", delay: 1200 },
    ];

    loadingLines.forEach(({ text, delay }) => {
      setTimeout(() => appendOutput(text, "loading"), delay);
    });

    setTimeout(() => {
      openVSCodeView();
    }, 1800);
  }

  function openVSCodeView() {
    vsCodeOpen = true;
    termWrap.style.display = "none";
    vscodeWrap.style.display = "block";


    vscode.innerHTML = "";
    vscode.style.display = "";


    const tree = document.createElement("div");
    tree.className = "pt-vscode-tree";

    const treeHeader = document.createElement("div");
    treeHeader.className = "pt-tree-header";
    treeHeader.textContent = "EXPLORER";
    tree.appendChild(treeHeader);

    const treeList = document.createElement("div");
    treeList.className = "pt-tree-list";

    PROJECTS.forEach((project, idx) => {
      const folder = createFolderNode(project, idx === 0);
      treeList.appendChild(folder);
    });

    tree.appendChild(treeList);


    const preview = document.createElement("div");
    preview.className = "pt-vscode-preview";
    preview.id = "ptVscodePreview";


    preview.innerHTML = renderProjectPreview(PROJECTS[0]);


    const activityBar = document.createElement("div");
    activityBar.className = "pt-activity-bar";
    activityBar.innerHTML = `
      <div class="pt-activity-icon pt-activity-active" title="Explorer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
      </div>
    `;

    vscode.appendChild(activityBar);
    vscode.appendChild(tree);
    vscode.appendChild(preview);


    requestAnimationFrame(() => {
      vscode.classList.add("pt-vscode-visible");
    });

    termInput.disabled = false;
  }

  function createFolderNode(project, expandedByDefault) {
    const wrapper = document.createElement("div");
    wrapper.className = "pt-folder-group";

    const folderRow = document.createElement("div");
    folderRow.className = "pt-tree-item pt-tree-folder";
    if (expandedByDefault) folderRow.classList.add("pt-expanded");
    folderRow.innerHTML = `
      <span class="pt-tree-chevron">${ICONS.chevron}</span>
      <span class="pt-tree-icon">${expandedByDefault ? ICONS.folderOpen : ICONS.folder}</span>
      <span class="pt-tree-label">${esc(project.name)}</span>
    `;

    const childrenContainer = document.createElement("div");
    childrenContainer.className = "pt-tree-children";
    if (!expandedByDefault) childrenContainer.style.display = "none";

    function renderNodes(nodes, container, depth) {
      nodes.forEach((node) => {
        if (node.type === "folder") {
          const subFolderGroup = document.createElement("div");
          subFolderGroup.className = "pt-folder-group";

          const subFolderRow = document.createElement("div");
          subFolderRow.className = "pt-tree-item pt-tree-folder";
          subFolderRow.style.paddingLeft = `${1 + depth * 0.6}rem`;
          subFolderRow.innerHTML = `
            <span class="pt-tree-chevron">${ICONS.chevron}</span>
            <span class="pt-tree-icon">${ICONS.folder}</span>
            <span class="pt-tree-label">${esc(node.name)}</span>
          `;

          const subChildrenContainer = document.createElement("div");
          subChildrenContainer.className = "pt-tree-children";
          subChildrenContainer.style.display = "none";

          renderNodes(node.children || [], subChildrenContainer, depth + 1);

          subFolderRow.addEventListener("click", (e) => {
            e.stopPropagation();
            const isExpanded = subFolderRow.classList.toggle("pt-expanded");
            subChildrenContainer.style.display = isExpanded ? "" : "none";
            subFolderRow.querySelector(".pt-tree-icon").innerHTML = isExpanded
              ? ICONS.folderOpen
              : ICONS.folder;
          });

          subFolderGroup.appendChild(subFolderRow);
          subFolderGroup.appendChild(subChildrenContainer);
          container.appendChild(subFolderGroup);
        } else {
          const fileRow = document.createElement("div");
          fileRow.className = "pt-tree-item pt-tree-file";
          fileRow.style.paddingLeft = `${1 + depth * 0.6 + 0.5}rem`;
          fileRow.innerHTML = `
            <span class="pt-tree-icon">${getFileIcon(node.name)}</span>
            <span class="pt-tree-label">${esc(node.name)}</span>
          `;
          container.appendChild(fileRow);
        }
      });
    }

    renderNodes(project.structure || [], childrenContainer, 1);

    folderRow.addEventListener("click", () => {
      const isExpanded = folderRow.classList.toggle("pt-expanded");
      childrenContainer.style.display = isExpanded ? "" : "none";
      folderRow.querySelector(".pt-tree-icon").innerHTML = isExpanded
        ? ICONS.folderOpen
        : ICONS.folder;
      showProject(project);
      highlightTreeItem(folderRow);
    });

    wrapper.appendChild(folderRow);
    wrapper.appendChild(childrenContainer);

    if (expandedByDefault) {
      setTimeout(() => highlightTreeItem(folderRow), 50);
    }

    return wrapper;
  }

  function highlightTreeItem(el) {
    const allItems = vscode.querySelectorAll(".pt-tree-item");
    allItems.forEach((item) => item.classList.remove("pt-tree-active"));
    el.classList.add("pt-tree-active");
  }

  function showProject(project) {
    const preview = document.getElementById("ptVscodePreview");
    if (!preview) return;
    preview.innerHTML = renderProjectPreview(project);

    preview.classList.remove("pt-preview-enter");
    void preview.offsetWidth;
    preview.classList.add("pt-preview-enter");
  }

  function getFlatFileList(structure) {
    const list = [];
    function traverse(nodes, pathPrefix = "") {
      nodes.forEach(node => {
        if (node.type === "folder") {
          traverse(node.children || [], pathPrefix + node.name + "/");
        } else {
          list.push(pathPrefix + node.name);
        }
      });
    }
    traverse(structure || []);
    return list;
  }

  function renderProjectPreview(project) {
    const badges = project.tech
      .map(
        (t) =>
          `<span class="pt-badge">${esc(t)}</span>`
      )
      .join("");

    const statusColors = {
      active: "#4ade80",
      prototype: "#fbbf24",
      research: "#a78bfa",
    };
    const statusColor = statusColors[project.status] || "#94a3b8";

    return `
      <div class="pt-preview-tab-bar">
        <div class="pt-preview-tab pt-preview-tab-active">
          <span class="pt-preview-tab-icon">${ICONS.fileMd}</span>
          README.md
        </div>
      </div>
      <div class="pt-preview-content">
        <div class="pt-preview-breadcrumb">
          ${esc(project.name)} › README.md
        </div>
        <h2 class="pt-preview-title">${esc(project.name)}</h2>
        ${project.highlight ? `<span class="pt-preview-highlight">${esc(project.highlight)}</span>` : ""}
        <span class="pt-preview-status" style="--status-color: ${statusColor}">${esc(project.status)}</span>
        <p class="pt-preview-desc">${esc(project.description)}</p>
        <div class="pt-preview-badges">${badges}</div>
        <div class="pt-preview-files">
          <h4>Project Structure</h4>
          <div class="pt-preview-file-list">
            ${getFlatFileList(project.structure).map((f) => `<span class="pt-preview-file">${getFileIcon(f)} ${esc(f)}</span>`).join("")}
          </div>
        </div>
        <a class="pt-preview-github-btn" href="${esc(project.github)}" target="_blank" rel="noreferrer noopener">
          ${ICONS.github}
          <span>View on GitHub</span>
        </a>
      </div>
    `;
  }

  function closeVSCodeView() {
    if (!vsCodeOpen) return;
    vsCodeOpen = false;
    vscodeWrap.style.display = "none";
    vscode.classList.remove("pt-vscode-visible");
    termWrap.style.display = "block";
    if (hint) hint.style.display = "";
    termInput.disabled = false;
    termInput.focus();
  }


  const closeBtn = vscodeWrap.querySelector(".pt-close-dot");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      closeVSCodeView();
    });
  }

  /* Expose focusProject for brain.js compatibility */
  window.focusRepoCard = function (projectKey) {
    if (!vsCodeOpen) {
      // Auto-open the terminal if not already open
      appendOutput("shubhadeep@portfolio:~$ run projects", "prompt-echo");
      runProjects();
      setTimeout(() => {
        const target = PROJECTS.find((p) => p.key === projectKey);
        if (target) showProject(target);
      }, 2000);
    } else {
      const target = PROJECTS.find((p) => p.key === projectKey);
      if (target) showProject(target);
    }
  };
})();
