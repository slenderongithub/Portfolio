/* ──────────────────────────────────────────────────────────────
   COMMAND PROMPT — a small, quirky cmd.exe for the Projects section.
   Commands drive the project explorer (window.projectExplorer) and
   the rest of the site. No dependencies.
   ────────────────────────────────────────────────────────────── */
(function initTerminal() {
  "use strict";

  const body = document.getElementById("terminalBody");
  const output = document.getElementById("terminalOutput");
  const input = document.getElementById("terminalInput");
  if (!body || !output || !input) return;

  const history = [];
  let historyIndex = -1;

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function print(html, cls) {
    const line = document.createElement("div");
    line.className = "terminal-line" + (cls ? " " + cls : "");
    line.innerHTML = html;
    output.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  function printText(text, cls) { print(esc(text), cls); }
  function blank() { print("&nbsp;"); }

  function printEcho(cmd) { print('<span class="t-dim">C:\\Portfolio&gt;</span> ' + esc(cmd)); }

  const explorer = () => window.projectExplorer || null;

  /* ── command table ── */
  const COMMANDS = {
    help() {
      blank();
      print('<span class="t-yellow">Available commands</span>');
      const rows = [
        ["help", "show this list", 4],
        ["hello", "who is this guy?", 5],
        ["run projects", "open the project explorer", 12],
        ["ls / dir", "list the projects", 8],
        ["open <name>", "open a project (e.g. open carelink)", 11],
        ["skills", "the tech stack", 6],
        ["contact", "how to reach me", 7],
        ["whoami", "existential help", 6],
        ["date / time", "clock check", 11],
        ["cls", "clear the screen", 3],
      ];
      rows.forEach(([label, desc, len]) => {
        const pad = " ".repeat(Math.max(2, 16 - len));
        print('  <span class="t-green">' + esc(label) + "</span>" + pad + '<span class="t-dim">' + esc(desc) + "</span>");
      });
      blank();
    },

    hello() {
      blank();
      print("Hey — I'm <span class=\"t-white\">Shubhadeep Datta</span>.");
      print("CS student at VIT-AP who turns caffeine and curiosity into AI apps,");
      print("embedded gadgets, and the occasional hackathon trophy.");
      print('I like shipping things that actually work. Type <span class="t-green">run projects</span> to poke around.');
      blank();
    },

    whoami() {
      print("shubhadeep — full-stack tinkerer, ML dabbler, professional rubber-duck debugger.");
    },

    projects() { COMMANDS["run projects"](); },
    run() { COMMANDS["run projects"](); },
    "run projects"() {
      const ex = explorer();
      if (!ex) { print("Explorer not available right now.", "t-red"); return; }
      print("Opening <span class=\"t-white\">My Projects</span>...", "t-green");
      ex.open();
    },

    ls() { listProjects(); },
    dir() { listProjects(); },

    skills() {
      blank();
      const groups = [
        ["Languages", "Python · JavaScript · TypeScript · C++"],
        ["Frontend", "React · Next.js · TailwindCSS"],
        ["Backend", "FastAPI · Node.js · Flask"],
        ["AI / ML", "TensorFlow · PyTorch · Scikit-Learn · NLP"],
        ["Data", "PostgreSQL · MongoDB · Firebase · Redis"],
        ["Tooling", "Docker · Git · Vercel · AWS · Linux"],
      ];
      groups.forEach(([k, v]) => print('  <span class="t-yellow">' + k + "</span>" + " ".repeat(Math.max(1, 11 - k.length)) + esc(v)));
      blank();
    },

    contact() {
      blank();
      print('  <span class="t-yellow">email </span> slenderisprogramming@gmail.com');
      print('  <span class="t-yellow">github</span> github.com/slenderongithub');
      print('  <span class="t-yellow">page  </span> <a href="./contact.html" style="color:#5fdc6b">open the contact window &rarr;</a>');
      blank();
    },

    about() {
      blank();
      print("Portfolio System — built from scratch in vanilla JS, dressed up as Windows XP.");
      print('No frameworks were harmed in the making of this site.');
      blank();
    },

    date() { printText(new Date().toDateString()); },
    time() { printText(new Date().toLocaleTimeString()); },

    cls() { output.innerHTML = ""; },
    clear() { output.innerHTML = ""; },

    sudo() { print("This is Windows, not Linux. Also: nice try. 😏", "t-dim"); },
    coffee() { print("Brewing... ☕  Error: COFFEE.SYS not found. Please insert caffeine and retry.", "t-yellow"); },
    matrix() { print("Wake up, Neo... just kidding, this is Windows XP. Follow the blue butterfly. 🦋", "t-green"); },
    exit() { print("It is now safe to turn off your— actually, please stay. There's more to see.", "t-dim"); },
    shutdown() { COMMANDS.exit(); },
    cd() { print("There's no place like C:\\Portfolio.", "t-dim"); },
    color() { print("The color is already the best color: Luna Blue.", "t-dim"); },
  };

  function listProjects() {
    const ex = explorer();
    blank();
    print(' Directory of C:\\Portfolio');
    blank();
    if (!ex) { print("(project list unavailable)", "t-dim"); blank(); return; }
    const list = ex.list();
    list.forEach(p => {
      print('  <span class="t-cyan">&lt;DIR&gt;</span>  <span class="t-white">' + esc(p.name) + "</span>" +
        " ".repeat(Math.max(1, 22 - p.name.length)) + '<span class="t-dim">' + esc(p.tagline) + "</span>");
    });
    blank();
    print("  " + list.length + ' project(s).  Type <span class="t-green">open &lt;name&gt;</span> or <span class="t-green">run projects</span>.', "t-dim");
    blank();
  }

  function openByName(rawName) {
    const ex = explorer();
    if (!ex) { print("Explorer not available.", "t-red"); return; }
    const query = rawName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const match = ex.list().find(p => {
      const key = p.key.replace(/[^a-z0-9]/g, "");
      const name = p.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return key === query || name === query || key.includes(query) || name.includes(query);
    });
    if (!match) {
      print('Project "' + esc(rawName) + '" not found.', "t-red");
      print('Type <span class="t-green">ls</span> to see what\'s available.', "t-dim");
      return;
    }
    print("Opening <span class=\"t-white\">" + esc(match.name) + "</span>...", "t-green");
    ex.focus(match.key);
  }

  function handle(raw) {
    const cmd = raw.trim();
    if (!cmd) return;
    const lower = cmd.toLowerCase();

    // open / start <name>
    const openMatch = lower.match(/^(open|start|run)\s+(.+)$/);
    if (openMatch && openMatch[1] !== "run") {
      openByName(cmd.slice(openMatch[1].length).trim());
      return;
    }
    if (lower === "run projects" || lower === "run project") { COMMANDS["run projects"](); return; }
    if (openMatch && openMatch[1] === "run") { openByName(openMatch[2]); return; }

    if (lower.startsWith("echo ")) { printText(cmd.slice(5)); return; }

    if (Object.prototype.hasOwnProperty.call(COMMANDS, lower)) {
      COMMANDS[lower]();
      return;
    }

    print("'" + esc(cmd.split(/\s+/)[0]) + "' is not recognized as an internal or external command,", "t-dim");
    print("operable program or batch file.", "t-dim");
    print('Type <span class="t-green">help</span> for a list of commands.', "t-dim");
  }

  /* ── boot banner ── */
  print('<span class="t-dim">Microsoft Windows XP [Version 5.1.2600]</span>');
  print('<span class="t-dim">(c) Copyright 1985-2001 Microsoft Corp.</span>');
  blank();
  print('Type <span class="t-green">help</span> for commands. Try <span class="t-green">hello</span> or <span class="t-green">run projects</span>.');
  blank();

  /* ── input handling ── */
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      const cmd = input.value;
      input.value = "";
      historyIndex = -1;
      printEcho(cmd);
      if (cmd.trim()) history.push(cmd);
      handle(cmd);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      historyIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex < history.length - 1) { historyIndex += 1; input.value = history[historyIndex]; }
      else { historyIndex = -1; input.value = ""; }
    } else if (event.key === "Tab") {
      event.preventDefault();
      const partial = input.value.trim().toLowerCase();
      if (!partial) return;
      const pool = ["help", "hello", "whoami", "run projects", "ls", "dir", "skills", "contact", "about", "date", "time", "cls", "open "];
      const match = pool.find(c => c.startsWith(partial) && c !== partial);
      if (match) input.value = match;
    }
  });

  body.addEventListener("click", () => {
    if (window.getSelection && String(window.getSelection())) return;
    input.focus({ preventScroll: true });
  });

  /* Card / brain clicks echo here so the terminal + explorer feel linked */
  window.terminalOnOpen = function (name) {
    printEcho("open " + String(name).toLowerCase().replace(/\s+/g, "-"));
    print("Opening <span class=\"t-white\">" + esc(name) + "</span> in My Projects...", "t-green");
  };
})();
