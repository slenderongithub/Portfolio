
const themeToggle = document.getElementById("themeToggle");
const stageScene = document.getElementById("stageScene");
const sidebar = document.getElementById("sidebar");
const sidebarHamburger = document.getElementById("sidebarHamburger");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");
const sidebarNavItems = Array.from(document.querySelectorAll(".sidebar-nav-item[data-window]"));
const windows = Array.from(document.querySelectorAll(".stage-window"));
const openTriggers = Array.from(document.querySelectorAll("[data-open]"));
const dotCanvas = document.getElementById("dotCanvas");
const dotCtx = dotCanvas ? dotCanvas.getContext("2d") : null;


const DOT_SPACING = 32;
const DOT_BASE_ALPHA = 0.12;
const DOT_GLOW_RADIUS = 112;
const DOT_RADIUS = 1.4;
const DOT_GLOW_BOOST = 0.14;
const MIN_SECTION_SCROLL_DURATION = 220;
const MAX_SECTION_SCROLL_DURATION = 520;
const NAV_RELEASE_SETTLE_DELAY = 180;
const SCROLL_SETTLE_POSITION_EPSILON = 1.5;
const SCROLL_SETTLE_VELOCITY_EPSILON = 0.35;
const SCROLL_SETTLE_FRAMES_REQUIRED = 2;
const OFFSCREEN_COORD = -9999;
const isTouchOnly = window.matchMedia && window.matchMedia('(hover: none)').matches;
const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;


let dotWidth = 0;
let dotHeight = 0;
const dotMouse = { x: OFFSCREEN_COORD, y: OFFSCREEN_COORD };
let activeWindowId = "window-home";
let scrollRafId = null;
let isSectionAutoScrolling = false;
let sectionAutoScrollUnlockTimeoutId = null;
let navActivationLockWindowId = null;
let navLockReleaseTimeoutId = null;
let navReleaseSettleRafId = null;
let navReleaseLastScrollTop = null;
let navReleaseStableFrameCount = 0;
let themeToggleClickTimeoutId = null;


function openSidebar() {
  if (!sidebar || !sidebarHamburger || !sidebarBackdrop) return;
  sidebar.classList.add("is-open");
  sidebarHamburger.classList.add("is-open");
  sidebarBackdrop.classList.add("is-visible");
}

function closeSidebar() {
  if (!sidebar || !sidebarHamburger || !sidebarBackdrop) return;
  sidebar.classList.remove("is-open");
  sidebarHamburger.classList.remove("is-open");
  sidebarBackdrop.classList.remove("is-visible");
}

function isMobile() {
  return window.innerWidth < 768;
}

if (sidebarHamburger) {
  sidebarHamburger.addEventListener("click", () => {
    if (sidebar.classList.contains("is-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });
}

if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener("click", closeSidebar);
}


function endSectionAutoScroll() {
  if (sectionAutoScrollUnlockTimeoutId !== null) {
    clearTimeout(sectionAutoScrollUnlockTimeoutId);
    sectionAutoScrollUnlockTimeoutId = null;
  }
  isSectionAutoScrolling = false;
}

function beginSectionAutoScroll(durationMs) {
  endSectionAutoScroll();
  isSectionAutoScrolling = true;
  sectionAutoScrollUnlockTimeoutId = window.setTimeout(() => {
    sectionAutoScrollUnlockTimeoutId = null;
    isSectionAutoScrolling = false;
  }, Math.max(0, durationMs));
}

function lockNavActivation(windowId) {
  if (navLockReleaseTimeoutId !== null) {
    clearTimeout(navLockReleaseTimeoutId);
    navLockReleaseTimeoutId = null;
  }
  if (navReleaseSettleRafId !== null) {
    cancelAnimationFrame(navReleaseSettleRafId);
    navReleaseSettleRafId = null;
  }
  navReleaseLastScrollTop = null;
  navReleaseStableFrameCount = 0;
  navActivationLockWindowId = windowId;
}

function releaseNavActivationLock(windowId) {
  if (windowId && navActivationLockWindowId && navActivationLockWindowId !== windowId) return;
  navActivationLockWindowId = null;
}

function scheduleNavActivationRelease(windowId, delayMs = NAV_RELEASE_SETTLE_DELAY, targetTop = null) {
  if (navLockReleaseTimeoutId !== null) clearTimeout(navLockReleaseTimeoutId);
  if (navReleaseSettleRafId !== null) {
    cancelAnimationFrame(navReleaseSettleRafId);
    navReleaseSettleRafId = null;
  }
  navReleaseLastScrollTop = null;
  navReleaseStableFrameCount = 0;

  const finalizeRelease = () => {
    if (navLockReleaseTimeoutId !== null) { clearTimeout(navLockReleaseTimeoutId); navLockReleaseTimeoutId = null; }
    if (navReleaseSettleRafId !== null) { cancelAnimationFrame(navReleaseSettleRafId); navReleaseSettleRafId = null; }
    navReleaseLastScrollTop = null;
    navReleaseStableFrameCount = 0;
    releaseNavActivationLock(windowId);
    endSectionAutoScroll();
  };

  if (typeof targetTop === "number" && stageScene) {
    const fallbackMs = Math.max(delayMs + 900, 1600);
    navLockReleaseTimeoutId = window.setTimeout(finalizeRelease, fallbackMs);

    const checkSettled = () => {
      if (!stageScene) { finalizeRelease(); return; }
      const currentTop = stageScene.scrollTop;
      const deltaToTarget = Math.abs(currentTop - targetTop);
      const deltaSinceLast = navReleaseLastScrollTop === null ? Infinity : Math.abs(currentTop - navReleaseLastScrollTop);
      const candidateWindowId = getCandidateWindowIdAtScrollTop(currentTop);
      const nearTarget = deltaToTarget <= SCROLL_SETTLE_POSITION_EPSILON;
      const motionLow = deltaSinceLast <= SCROLL_SETTLE_VELOCITY_EPSILON;
      const inTargetSection = candidateWindowId === windowId;
      if (inTargetSection && nearTarget && motionLow) {
        navReleaseStableFrameCount += 1;
      } else {
        navReleaseStableFrameCount = 0;
      }
      navReleaseLastScrollTop = currentTop;
      if (navReleaseStableFrameCount >= SCROLL_SETTLE_FRAMES_REQUIRED) {
        finalizeRelease(); return;
      }
      navReleaseSettleRafId = requestAnimationFrame(checkSettled);
    };
    navReleaseSettleRafId = requestAnimationFrame(checkSettled);
    return;
  }

  navLockReleaseTimeoutId = window.setTimeout(finalizeRelease, Math.max(0, delayMs));
}


function setTheme(mode) {
  const isDark = mode === "dark";
  document.documentElement.classList.toggle("theme-midnight", isDark);
  document.body.classList.toggle("theme-midnight", isDark);
  document.documentElement.classList.toggle("dark-theme", isDark);
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  }
  try {
    window.localStorage.setItem("portfolio-theme", mode);
    window.localStorage.setItem("theme", mode);
  } catch (error) {}
}

function initializeTheme() {
  let initialMode = "dark";
  try {
    const savedPortfolioTheme = window.localStorage.getItem("portfolio-theme");
    const savedGenericTheme = window.localStorage.getItem("theme");
    if (savedPortfolioTheme === "light" || savedPortfolioTheme === "dark") {
      initialMode = savedPortfolioTheme;
    } else if (savedGenericTheme === "light" || savedGenericTheme === "dark") {
      initialMode = savedGenericTheme;
    }
  } catch (error) {}
  setTheme(initialMode);
}

function triggerThemeToggleClickEffect() {
  if (!themeToggle) return;
  themeToggle.classList.remove("clicked");
  void themeToggle.offsetWidth;
  themeToggle.classList.add("clicked");
  if (themeToggleClickTimeoutId !== null) clearTimeout(themeToggleClickTimeoutId);
  themeToggleClickTimeoutId = window.setTimeout(() => {
    if (!themeToggle) return;
    themeToggle.classList.remove("clicked");
    themeToggleClickTimeoutId = null;
  }, 620);
}


function getDotThemePalette() {
  const styles = window.getComputedStyle(document.body);
  return {
    bg: styles.getPropertyValue("--dot-bg").trim() || "#f5f0e8",
    baseRgb: styles.getPropertyValue("--dot-base-rgb").trim() || "168, 148, 118",
    glowRgb: styles.getPropertyValue("--dot-glow-rgb").trim() || "34, 180, 200",
  };
}

function drawDotGrid(ctx, width, height, mouse, palette, settings) {
  const cols = Math.ceil(width / settings.spacing) + 1;
  const rows = Math.ceil(height / settings.spacing) + 1;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * settings.spacing;
      const y = row * settings.spacing;
      const dist = Math.hypot(x - mouse.x, y - mouse.y);
      const proximity = Math.max(0, 1 - dist / settings.glowRadius);
      const alpha = settings.baseAlpha + (proximity * (1 - settings.baseAlpha));
      ctx.beginPath();
      ctx.arc(x, y, settings.radius, 0, Math.PI * 2);
      if (proximity > 0) {
        ctx.fillStyle = `rgba(${palette.glowRgb}, ${Math.min(1, alpha + proximity * settings.glowBoost).toFixed(3)})`;
      } else {
        ctx.fillStyle = `rgba(${palette.baseRgb}, ${settings.baseAlpha.toFixed(3)})`;
      }
      ctx.fill();
    }
  }
}

function resizeDotCanvas() {
  if (!dotCanvas) return;
  dotWidth = Math.max(1, Math.floor(window.innerWidth));
  dotHeight = Math.max(1, Math.floor(window.innerHeight));
  if (dotCanvas.width !== dotWidth || dotCanvas.height !== dotHeight) {
    dotCanvas.width = dotWidth;
    dotCanvas.height = dotHeight;
  }
}

function drawDotBackground() {
  if (!dotCtx || !dotCanvas) return;
  if (dotWidth <= 0 || dotHeight <= 0) resizeDotCanvas();
  const palette = getDotThemePalette();
  dotCtx.clearRect(0, 0, dotWidth, dotHeight);
  drawDotGrid(dotCtx, dotWidth, dotHeight, dotMouse,
    { baseRgb: palette.baseRgb, glowRgb: palette.glowRgb },
    { spacing: DOT_SPACING, baseAlpha: DOT_BASE_ALPHA, glowRadius: DOT_GLOW_RADIUS, radius: DOT_RADIUS, glowBoost: DOT_GLOW_BOOST }
  );
  requestAnimationFrame(drawDotBackground);
}


function updateNavIndicator() {
  const activeItem = document.querySelector(".sidebar-nav-item.active");
  const indicator = document.getElementById("sidebarNavIndicator");
  if (!activeItem || !indicator) return;

  const isDesktop = window.innerWidth >= 768;
  if (isDesktop) {
    indicator.style.display = "block";
    indicator.style.top = `${activeItem.offsetTop}px`;
    indicator.style.height = `${activeItem.offsetHeight}px`;
  } else {
    indicator.style.display = "none";
  }
}

function setActiveWindowState(windowId) {
  const targetExists = windows.some(win => win.id === windowId);
  if (!targetExists) return;
  if (activeWindowId === windowId) return;
  activeWindowId = windowId;
  windows.forEach(win => { win.classList.toggle("active", win.id === activeWindowId); });


  sidebarNavItems.forEach(item => {
    item.classList.toggle("active", item.dataset.window === activeWindowId);
  });
  updateNavIndicator();

  if (windowId === "window-skills" && typeof skillsGlobeState !== "undefined" && skillsGlobeState) {
    window.setTimeout(() => skillsGlobeState.remeasure?.(), 80);
  }
}

function getSectionScrollDuration(distance) {
  const scaledDuration = 180 + (distance * 0.22);
  return Math.min(MAX_SECTION_SCROLL_DURATION, Math.max(MIN_SECTION_SCROLL_DURATION, scaledDuration));
}

function getSectionNavClearance() {
  if (!stageScene) return 12;
  return 14;
}

function getCandidateWindowIdAtScrollTop(scrollTop) {
  if (windows.length === 0) return null;
  const probeTop = scrollTop + getSectionNavClearance() + 24;
  let candidateWindow = windows[0];
  windows.forEach(win => {
    if (win.offsetTop <= probeTop) candidateWindow = win;
  });
  return candidateWindow.id;
}

function scrollToWindow(windowId, behavior = "smooth") {
  const target = windows.find(win => win.id === windowId);
  if (!target || !stageScene) return;
  const top = Math.max(0, target.offsetTop - getSectionNavClearance());
  if (behavior === "smooth") {
    const distance = Math.abs(stageScene.scrollTop - top);
    const duration = getSectionScrollDuration(distance);
    beginSectionAutoScroll(duration + NAV_RELEASE_SETTLE_DELAY + 100);
    lockNavActivation(windowId);
    setActiveWindowState(windowId);
    stageScene.scrollTo({ top, behavior: "smooth" });
    scheduleNavActivationRelease(windowId, duration + NAV_RELEASE_SETTLE_DELAY, top);
    return;
  }
  endSectionAutoScroll();
  lockNavActivation(windowId);
  setActiveWindowState(windowId);
  stageScene.scrollTo({ top, behavior: "auto" });
  scheduleNavActivationRelease(windowId, 120);
}

function activateWindow(windowId) {
  if (!windowId) return;
  if (isSectionAutoScrolling && navActivationLockWindowId === windowId) return;
  if (!isSectionAutoScrolling && !navActivationLockWindowId && activeWindowId === windowId) return;
  if (window.xpSound) window.xpSound.navigate();
  scrollToWindow(windowId, "smooth");
}

function updateActiveWindowByScroll() {
  if (navActivationLockWindowId) {
    setActiveWindowState(navActivationLockWindowId);
  }
}

let sectionObserver = null;

function initializeSectionObserver() {
  if (!stageScene || windows.length === 0) return;

  sectionObserver = new IntersectionObserver((entries) => {

    if (isSectionAutoScrolling) {
      if (navActivationLockWindowId) {
        setActiveWindowState(navActivationLockWindowId);
      }
      return;
    }

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveWindowState(entry.target.id);
      }
    });
  }, {
    root: stageScene,
    rootMargin: "-50% 0px -50% 0px",
    threshold: 0
  });

  windows.forEach((win) => {
    sectionObserver.observe(win);
  });
}


let crtHudScrollEl = null;
let crtHudSectionEl = null;
function updateScrollProgress() {
  if (!stageScene) return;
  const scrollable = stageScene.scrollHeight - stageScene.clientHeight;
  const pct = scrollable > 0 ? Math.round((stageScene.scrollTop / scrollable) * 100) : 0;
  if (crtHudScrollEl) {
    crtHudScrollEl.textContent = pct + "%";
  }
  if (crtHudSectionEl) {
    const activeWin = windows.find(win => win.id === activeWindowId);
    const label = activeWin && activeWin.dataset.label
      ? activeWin.dataset.label
      : (/contact/i.test(window.location.pathname) ? "Contact" : "");
    crtHudSectionEl.textContent = label || "";
  }
}


const heroBio = document.querySelector(".hero-bio");
const heroCtas = document.querySelector(".hero-ctas");
const heroChips = document.querySelector(".hero-chips");

function updateHeroScrollReveal() {
  if (!stageScene) return;
  const scrollTop = stageScene.scrollTop;
  const vh = window.innerHeight;
  const isDesktop = window.innerWidth >= 1081;

  if (isDesktop) {
    const scrollRange = vh * 2.2;
    const progress = Math.min(1, scrollTop / Math.max(1, scrollRange));


    window.heroScrollProgress = progress;


    document.documentElement.style.setProperty('--hero-progress', progress);

    if (heroBio) heroBio.classList.toggle("hero-visible", progress >= 0.15);
    if (heroCtas) heroCtas.classList.toggle("hero-visible", progress >= 0.35);
    if (heroChips) heroChips.classList.toggle("hero-visible", progress >= 0.55);
  } else {

    window.heroScrollProgress = 1;
    document.documentElement.style.setProperty('--hero-progress', '1');
    if (heroBio) heroBio.classList.add("hero-visible");
    if (heroCtas) heroCtas.classList.add("hero-visible");
    if (heroChips) heroChips.classList.add("hero-visible");
  }
}


function handleSceneScroll() {
  if (scrollRafId !== null) return;
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null;
    if (!isSectionAutoScrolling) {
      updateActiveWindowByScroll();
    }
    updateScrollProgress();
    updateHeroScrollReveal();
  });
}




if (dotCanvas && !isTouchOnly) {
  window.addEventListener("pointermove", event => {
    dotMouse.x = event.clientX;
    dotMouse.y = event.clientY;
  }, { passive: true });
  window.addEventListener("pointerleave", () => {
    dotMouse.x = OFFSCREEN_COORD;
    dotMouse.y = OFFSCREEN_COORD;
  });
} else if (dotCanvas) {
  dotMouse.x = OFFSCREEN_COORD;
  dotMouse.y = OFFSCREEN_COORD;
}


sidebarNavItems.forEach(item => {
  item.addEventListener("click", event => {
    event.preventDefault();
    const windowId = item.dataset.window;
    if (windows.length === 0 || !windows.some(win => win.id === windowId)) {
      crtNavigate(`./index.html?section=${windowId}`);
      return;
    }
    activateWindow(windowId);
    if (isMobile()) closeSidebar();
  });
});


const THEME_TRANSITION_CSS = `
::view-transition-group(root) { animation-duration: 1.5s; animation-timing-function: cubic-bezier(0.62, 0.01, 0.2, 1); }
::view-transition-new(root) { animation-name: xp-theme-reveal-light; }
::view-transition-old(root),
html.theme-midnight::view-transition-old(root) { animation: none; z-index: -1; }
html.theme-midnight::view-transition-new(root) { animation-name: xp-theme-reveal-dark; }
@keyframes xp-theme-reveal-dark {
  from { clip-path: polygon(50% -71%, -50% 71%, -50% 71%, 50% -71%); }
  to   { clip-path: polygon(50% -71%, -50% 71%, 50% 171%, 171% 50%); }
}
@keyframes xp-theme-reveal-light {
  from { clip-path: polygon(171% 50%, 50% 171%, 50% 171%, 171% 50%); }
  to   { clip-path: polygon(171% 50%, 50% 171%, -50% 71%, 50% -71%); }
}`;

function ensureThemeTransitionStyles() {
  let styleEl = document.getElementById("theme-transition-styles");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "theme-transition-styles";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = THEME_TRANSITION_CSS;
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextMode = document.body.classList.contains("theme-midnight") ? "light" : "dark";
    triggerThemeToggleClickEffect();
    if (prefersReducedMotion || typeof document.startViewTransition !== "function") {
      setTheme(nextMode);
      return;
    }
    ensureThemeTransitionStyles();
    document.startViewTransition(() => setTheme(nextMode));
  });
}


openTriggers.forEach(trigger => {
  trigger.addEventListener("click", event => {
    event.preventDefault();
    activateWindow(trigger.dataset.open);
  });
});


if (stageScene) {
  stageScene.addEventListener("scroll", handleSceneScroll, { passive: true });
}


window.addEventListener("resize", () => {
  resizeDotCanvas();
  updateNavIndicator();
  if (!isMobile()) closeSidebar();
});


/* Reveal timeline entries as they scroll into view AND re-hide them
   when they leave, so scrolling back up replays the animation
   (backtracking). Shared by Experience (.tl-item) and Education
   (.edu-tl-item). */
function initializeTimelineReveal(selector) {
  const items = Array.from(document.querySelectorAll(selector));
  if (items.length === 0) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle("visible", entry.isIntersecting);
    });
  }, { threshold: 0.2, root: stageScene || null, rootMargin: "0px 0px -60px 0px" });
  items.forEach(item => observer.observe(item));
}

initializeTimelineReveal("#eduTimeline .edu-tl-item");


function initializeSkillsGlobe() {
  const globeRoot = document.getElementById("skillsGlobe");
  const bgCanvas = document.getElementById("skillsBgCanvas");
  const globeCanvas = document.getElementById("skillsGlobeCanvas");
  const pillLayer = document.getElementById("skillsPillLayer");
  if (!globeRoot || !bgCanvas || !globeCanvas || !pillLayer) return null;
  const bgCtx = bgCanvas.getContext("2d");
  const globeCtx = globeCanvas.getContext("2d");
  if (!bgCtx || !globeCtx) return null;

  const skillItems = [
    { name: "Docker", iconClass: "devicon-docker-plain", iconBg: "#1d63ed", iconColor: "#ffffff", yrs: "2 yrs", note: "Containerised deployments" },
    { name: "NumPy", iconClass: "devicon-numpy-plain", iconBg: "#4dabcf", iconColor: "#ffffff", yrs: "3 yrs", note: "Numerical computing" },
    { name: "GitHub", iconClass: "devicon-github-original", iconBg: "#ffffff", iconColor: "#000000", yrs: "4 yrs", note: "Version control & CI/CD" },
    { name: "Jupyter", iconClass: "devicon-jupyter-plain", iconBg: "#f37626", iconColor: "#ffffff", yrs: "3 yrs", note: "Research notebooks" },
    { name: "Redis", iconClass: "devicon-redis-plain", iconBg: "#d82c20", iconColor: "#ffffff", yrs: "1 yr", note: "In-memory caching" },
    { name: "Next.js", iconClass: "devicon-nextjs-plain", iconBg: "#000000", iconColor: "#ffffff", yrs: "2 yrs", note: "Full-stack React framework" },
    { name: "PostgreSQL", iconClass: "devicon-postgresql-plain", iconBg: "#336791", iconColor: "#ffffff", yrs: "2 yrs", note: "Relational databases" },
    { name: "HuggingFace", iconBg: "#ffcc33", iconColor: "#000000", placeholder: "🤗", yrs: "1 yr", note: "Transformer models & datasets" },
    { name: "TypeScript", iconClass: "devicon-typescript-plain", iconBg: "#3178c6", iconColor: "#ffffff", yrs: "2 yrs", note: "Type-safe JS development" },
    { name: "Scikit-Learn", iconClass: "devicon-scikitlearn-plain", iconBg: "#f7931e", iconColor: "#ffffff", yrs: "3 yrs", note: "Classical ML pipelines" },
    { name: "Git", iconClass: "devicon-git-plain", iconBg: "#f05032", iconColor: "#ffffff", yrs: "4 yrs", note: "Branching & collaboration" },
    { name: "Plotly", iconBg: "#3f4f75", iconColor: "#ffffff", placeholder: "📊", yrs: "2 yrs", note: "Interactive data viz" },
    { name: "LangChain", iconBg: "#1c3c3c", iconColor: "#6ee7b7", placeholder: "🦜", yrs: "1 yr", note: "LLM orchestration" },
    { name: "Python", iconClass: "devicon-python-plain", iconBg: "#3776ab", iconColor: "#ffd343", yrs: "4 yrs", note: "Core language" },
    { name: "Power BI", iconBg: "#f2c811", iconColor: "#000000", placeholder: "⚡", yrs: "1 yr", note: "Business dashboards" },
    { name: "Supabase", iconClass: "devicon-supabase-plain", iconBg: "#3ecf8e", iconColor: "#ffffff", yrs: "1 yr", note: "Backend-as-a-service" },
    { name: "TailwindCSS", iconClass: "devicon-tailwindcss-plain", iconBg: "#0ea5e9", iconColor: "#ffffff", yrs: "2 yrs", note: "Utility-first CSS" },
    { name: "TensorFlow", iconClass: "devicon-tensorflow-original", iconBg: "#ff6f00", iconColor: "#ffffff", yrs: "2 yrs", note: "Federated learning & CNNs" },
    { name: "MongoDB", iconClass: "devicon-mongodb-plain", iconBg: "#4db33d", iconColor: "#ffffff", yrs: "2 yrs", note: "NoSQL document stores" },
    { name: "FastAPI", iconClass: "devicon-fastapi-plain", iconBg: "#05998b", iconColor: "#ffffff", yrs: "2 yrs", note: "High-perf Python APIs" },
    { name: "XGBoost", iconBg: "#189fdd", iconColor: "#ffffff", placeholder: "XG", yrs: "2 yrs", note: "Gradient boosting" },
    { name: "Vercel", iconClass: "devicon-vercel-plain", iconBg: "#ffffff", iconColor: "#000000", yrs: "2 yrs", note: "Edge deployments" },
  ];

  function fibonacciSphere(count) {
    const points = [];
    const phi = Math.PI * (Math.sqrt(5) - 1);
    for (let index = 0; index < count; index += 1) {
      const y = 1 - (index / (count - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const angle = phi * index;
      points.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
    }
    return points;
  }

  const spherePoints = fibonacciSphere(skillItems.length);
  const skillTooltip = document.createElement("div");
  skillTooltip.className = "skill-tooltip";
  skillTooltip.setAttribute("aria-hidden", "true");
  globeRoot.appendChild(skillTooltip);

  const pills = skillItems.map((skill, index) => {
    const pill = document.createElement("div");
    pill.className = "skills-pill";
    const iconWrap = document.createElement("div");
    iconWrap.className = "skills-pill-icon";
    iconWrap.style.background = skill.iconBg;
    if (skill.iconClass) {
      const icon = document.createElement("i");
      icon.className = `${skill.iconClass} colored`;
      if (skill.iconColor) icon.style.color = skill.iconColor;
      iconWrap.appendChild(icon);
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = "skills-pill-placeholder";
      placeholder.style.color = skill.iconColor;
      placeholder.textContent = skill.placeholder || skill.name.slice(0, 2).toUpperCase();
      iconWrap.appendChild(placeholder);
    }
    const name = document.createElement("span");
    name.className = "skills-pill-name";
    name.textContent = skill.name;
    pill.appendChild(iconWrap);
    pill.appendChild(name);
    pillLayer.appendChild(pill);

    pill.addEventListener("mouseenter", () => {
      const parts = [skill.name];
      if (skill.yrs) parts.push(skill.yrs);
      if (skill.note) parts.push(skill.note);
      skillTooltip.textContent = parts.join(" · ");
      skillTooltip.classList.add("visible");
      const pr = pill.getBoundingClientRect();
      const gr = globeRoot.getBoundingClientRect();
      const tx = (pr.left + pr.width / 2) - gr.left;
      const ty = pr.top - gr.top - 10;
      skillTooltip.style.left = tx + "px";
      skillTooltip.style.top = ty + "px";
    });
    pill.addEventListener("mouseleave", () => { skillTooltip.classList.remove("visible"); });

    return {
      el: pill,
      baseX: spherePoints[index][0],
      baseY: spherePoints[index][1],
      baseZ: spherePoints[index][2],
      width: 120, height: 32,
    };
  });

  let centerX = 0, centerY = 0, sphereRadius = 220, fov = 900;
  let rotationX = 0.25, rotationY = 0;
  let velocityX = 0, velocityY = prefersReducedMotion ? 0 : 0.0035;
  let dragging = false, lastPointerX = 0, lastPointerY = 0;
  let stars = [];
  let darkThemeActive = document.body.classList.contains("theme-midnight");

  function measurePills() {
    pills.forEach(pill => {
      const rect = pill.el.getBoundingClientRect();
      if (rect.width > 0) { pill.width = rect.width; pill.height = rect.height || 32; }
    });
  }

  function rebuildStars(width, height) {
    const starCount = width <= 520 ? 140 : 220;
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      r: Math.random() * 1.1 + 0.2, a: Math.random() * 0.55 + 0.08,
    }));
  }

  let lastGlobeW = 0, lastGlobeH = 0;
  function resizeCanvases() {
    const rect = globeRoot.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.max(1, Math.floor(rect.width * dpr));
    const nextHeight = Math.max(1, Math.floor(rect.height * dpr));
    const dimensionsChanged = bgCanvas.width !== nextWidth || bgCanvas.height !== nextHeight;
    [[bgCanvas, bgCtx], [globeCanvas, globeCtx]].forEach(([canvas, ctx]) => {
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    centerX = rect.width / 2;
    centerY = rect.height / 2;
    sphereRadius = Math.max(
      window.innerWidth <= 680 ? 190 : 208,
      Math.min(rect.width, rect.height) * (window.innerWidth <= 680 ? 0.44 : 0.46)
    );
    fov = Math.max(760, sphereRadius * 4.2);
    const needsStars = dimensionsChanged || stars.length === 0;
    lastGlobeW = rect.width;
    lastGlobeH = rect.height;
    if (needsStars) {
      rebuildStars(rect.width, rect.height);
      drawStarField();
    }
    measurePills();
  }

  function drawStarField() {
    if (lastGlobeW <= 0 || lastGlobeH <= 0) return;
    bgCtx.clearRect(0, 0, lastGlobeW, lastGlobeH);
  }

  function applyRotation(baseX, baseY, baseZ) {
    const cosY = Math.cos(rotationY), sinY = Math.sin(rotationY);
    const cosX = Math.cos(rotationX), sinX = Math.sin(rotationX);
    const x2 = baseX * cosY + baseZ * sinY;
    const z2 = -baseX * sinY + baseZ * cosY;
    const y3 = baseY * cosX - z2 * sinX;
    const z3 = baseY * sinX + z2 * cosX;
    return [x2, y3, z3];
  }

  function drawWireGlobe() {
    if (lastGlobeW <= 0 || lastGlobeH <= 0) return;
    globeCtx.clearRect(0, 0, lastGlobeW, lastGlobeH);
    const wireColor = darkThemeActive ? "150, 195, 255" : "245, 250, 255";
    const glowColor = darkThemeActive ? "150, 195, 255" : "220, 235, 255";
    const latAlpha = darkThemeActive ? 0.34 : 0.42;
    const lonAlpha = darkThemeActive ? 0.28 : 0.34;
    const steps = 116;

    const coreGlow = globeCtx.createRadialGradient(centerX, centerY, sphereRadius * 0.2, centerX, centerY, sphereRadius * 1.18);
    coreGlow.addColorStop(0, `rgba(${glowColor}, ${darkThemeActive ? 0.12 : 0.08})`);
    coreGlow.addColorStop(0.58, `rgba(${wireColor}, ${darkThemeActive ? 0.07 : 0.04})`);
    coreGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    globeCtx.beginPath();
    globeCtx.arc(centerX, centerY, sphereRadius * 1.16, 0, Math.PI * 2);
    globeCtx.fillStyle = coreGlow;
    globeCtx.fill();

    const projectPoint = (x, y, z) => {
      const scale = fov / (fov + z * sphereRadius);
      return [centerX + x * sphereRadius * scale, centerY - y * sphereRadius * scale];
    };

    const latCount = 9;
    for (let latIndex = 1; latIndex < latCount; latIndex += 1) {
      const latitude = -Math.PI / 2 + (latIndex / latCount) * Math.PI;
      const yRing = Math.sin(latitude);
      const ringRadius = Math.cos(latitude);
      globeCtx.beginPath();
      for (let step = 0; step <= steps; step += 1) {
        const angle = (step / steps) * Math.PI * 2;
        const [rx, ry, rz] = applyRotation(Math.cos(angle) * ringRadius, yRing, Math.sin(angle) * ringRadius);
        const [px, py] = projectPoint(rx, ry, rz);
        step === 0 ? globeCtx.moveTo(px, py) : globeCtx.lineTo(px, py);
      }
      globeCtx.closePath();
      globeCtx.strokeStyle = `rgba(${wireColor}, ${latAlpha})`;
      globeCtx.lineWidth = 0.78;
      globeCtx.stroke();
    }

    const lonCount = 12;
    for (let lonIndex = 0; lonIndex < lonCount; lonIndex += 1) {
      const baseAngle = (lonIndex / lonCount) * Math.PI * 2;
      globeCtx.beginPath();
      for (let step = 0; step <= steps; step += 1) {
        const angle = (step / steps) * Math.PI * 2;
        const baseX = Math.cos(baseAngle) * Math.cos(angle);
        const baseY = Math.sin(angle);
        const baseZ = Math.sin(baseAngle) * Math.cos(angle);
        const [rx, ry, rz] = applyRotation(baseX, baseY, baseZ);
        const [px, py] = projectPoint(rx, ry, rz);
        step === 0 ? globeCtx.moveTo(px, py) : globeCtx.lineTo(px, py);
      }
      globeCtx.closePath();
      globeCtx.strokeStyle = `rgba(${wireColor}, ${lonAlpha})`;
      globeCtx.lineWidth = 0.72;
      globeCtx.stroke();
    }
  }

  function layoutPills() {
    const computed = pills.map(pill => {
      const [x, y, z] = applyRotation(pill.baseX, pill.baseY, pill.baseZ);
      return { pill, x, y, z };
    });
    computed.sort((a, b) => a.z - b.z);
    computed.forEach(({ pill, x, y, z }, order) => {
      const depth = (z + 1) / 2;
      const scale = fov / (fov + z * sphereRadius);
      const px = centerX + x * sphereRadius * scale;
      const py = centerY - y * sphereRadius * scale;
      const pillScale = 0.55 + depth * 0.55;
      const opacity = 0.18 + depth * 0.82;
      const tx = px - (pill.width * pillScale) / 2;
      const ty = py - (pill.height * pillScale) / 2;
      pill.el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${pillScale})`;
      pill.el.style.opacity = String(opacity);
      pill.el.style.zIndex = String(30 + order);
    });
  }

  function startDrag(clientX, clientY) {
    dragging = true; lastPointerX = clientX; lastPointerY = clientY;
    velocityX = 0; velocityY = 0;
    globeRoot.classList.add("dragging");
  }
  function updateDrag(clientX, clientY) {
    if (!dragging) return;
    const dx = clientX - lastPointerX;
    const dy = clientY - lastPointerY;
    rotationY += dx * 0.005;
    rotationX += dy * 0.005;
    rotationX = Math.max(-1.2, Math.min(1.2, rotationX));
    velocityY = dx * 0.005;
    velocityX = dy * 0.004;
    lastPointerX = clientX;
    lastPointerY = clientY;
  }
  function stopDrag() {
    if (!dragging) return;
    dragging = false;
    globeRoot.classList.remove("dragging");
  }

  globeRoot.addEventListener("pointerdown", event => {
    startDrag(event.clientX, event.clientY);
    globeRoot.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  globeRoot.addEventListener("pointermove", event => updateDrag(event.clientX, event.clientY));
  globeRoot.addEventListener("pointerup", stopDrag);
  globeRoot.addEventListener("pointercancel", stopDrag);
  globeRoot.addEventListener("lostpointercapture", stopDrag);
  globeRoot.addEventListener("dragstart", event => event.preventDefault());

  if (window.ResizeObserver) {
    const globeResizeObserver = new ResizeObserver(() => resizeCanvases());
    globeResizeObserver.observe(globeRoot);
  } else {
    window.addEventListener("resize", resizeCanvases);
  }

  resizeCanvases();
  layoutPills();
  drawWireGlobe();
  window.setTimeout(measurePills, 120);
  window.setTimeout(measurePills, 900);

  return {
    tick() {
      if (activeWindowId !== "window-skills") return;
      const themeIsDark = document.body.classList.contains("theme-midnight");
      if (themeIsDark !== darkThemeActive) {
        darkThemeActive = themeIsDark;
        drawStarField();
      }
      if (!dragging && !prefersReducedMotion) {
        rotationY += velocityY;
        velocityX *= 0.95;
        rotationX += velocityX;
        rotationX = Math.max(-1.2, Math.min(1.2, rotationX));
      }
      drawWireGlobe();
      layoutPills();
    },
    remeasure() { resizeCanvases(); measurePills(); },
  };
}

const skillsGlobeState = initializeSkillsGlobe();

function animateFloatingSystems() {
  if (skillsGlobeState) skillsGlobeState.tick();
  requestAnimationFrame(animateFloatingSystems);
}
animateFloatingSystems();


window.activateWindow = activateWindow;


initializeTheme();
window.setTimeout(() => { document.documentElement.classList.remove("theme-booting"); }, 80);
resizeDotCanvas();
drawDotBackground();


const urlParams = new URLSearchParams(window.location.search);
const targetSection = urlParams.get("section");
if (targetSection && windows.some(win => win.id === targetSection)) {
  activeWindowId = targetSection;
  window.setTimeout(() => {
    scrollToWindow(targetSection, "auto");
  }, 100);
} else {
  if (stageScene) {
    stageScene.scrollTo({ top: 0, behavior: "auto" });
  }
}

setActiveWindowState(activeWindowId);
initializeSectionObserver();

window.heroScrollProgress = 0;
if (heroBio) heroBio.classList.remove("hero-visible");
if (heroCtas) heroCtas.classList.remove("hero-visible");
if (heroChips) heroChips.classList.remove("hero-visible");
updateHeroScrollReveal();

window.addEventListener("load", () => {
  updateNavIndicator();
  if (!targetSection && stageScene) {
    stageScene.scrollTo({ top: 0, behavior: "auto" });
  }
});


/* ════════════════════════════════════════════════════════════
   CRT LAYER — screen chrome, HUD
   ════════════════════════════════════════════════════════════ */

/* Page transitions — CRT power-off, then navigate; the next page
   answers with a fast power-on line. */
function crtNavigate(url) {
  if (window.xpSound) window.xpSound.navigate();
  if (prefersReducedMotion) {
    window.location.href = url;
    return;
  }
  try { window.sessionStorage.setItem("crt-nav", "1"); } catch (error) {}
  document.documentElement.classList.add("crt-off");
  window.setTimeout(() => { window.location.href = url; }, 360);
}

function playPowerOn(fast) {
  const boot = document.createElement("div");
  boot.className = fast ? "crt-boot crt-boot-fast" : "crt-boot";
  document.body.appendChild(boot);
  window.setTimeout(() => boot.remove(), fast ? 600 : 950);
}

document.addEventListener("click", event => {
  const link = event.target.closest("a[href]");
  if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
  const href = link.getAttribute("href") || "";
  if (!/^(\.\/)?(index|contact)\.html/.test(href)) return;
  event.preventDefault();
  crtNavigate(link.href);
});

(function initializeCrtLayer() {
  const layer = document.createElement("div");
  layer.className = "crt-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML =
    '<div class="crt-scanlines"></div>' +
    '<div class="crt-grille"></div>' +
    '<div class="crt-flicker"></div>' +
    '<div class="crt-bezel"></div>';
  document.body.appendChild(layer);

  const hud = document.createElement("div");
  hud.className = "crt-hud";
  hud.setAttribute("aria-hidden", "true");
  hud.innerHTML =
    '<span class="crt-hud-left">shubhadeep <span class="crt-hud-ok">online</span></span>' +
    '<span class="crt-hud-mid"></span>' +
    '<span class="crt-hud-right"><span class="crt-hud-scroll">0%</span>' +
    '<span class="crt-hud-sep">&middot;</span><span class="crt-hud-clock"></span></span>';
  document.body.appendChild(hud);
  crtHudScrollEl = hud.querySelector(".crt-hud-scroll");
  crtHudSectionEl = hud.querySelector(".crt-hud-mid");
  const hudClockEl = hud.querySelector(".crt-hud-clock");

  function updateHudClock() {
    const now = new Date();
    const pad = value => String(value).padStart(2, "0");
    if (hudClockEl) {
      hudClockEl.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    }
  }
  updateHudClock();
  window.setInterval(updateHudClock, 1000);
  updateScrollProgress();

  let alreadyEntered = true;
  let cameFromInternalNav = false;
  try {
    alreadyEntered = !!window.sessionStorage.getItem("crt-entered");
    cameFromInternalNav = window.sessionStorage.getItem("crt-nav") === "1";
    window.sessionStorage.removeItem("crt-nav");
  } catch (error) {}

  if (!prefersReducedMotion && !alreadyEntered) {
    initializeCrtLoader();
  } else if (!prefersReducedMotion && cameFromInternalNav) {
    playPowerOn(true);
  }

  if (!prefersReducedMotion) {
    (function scheduleJitter() {
      window.setTimeout(() => {
        document.documentElement.classList.add("crt-jitter");
        window.setTimeout(() => {
          document.documentElement.classList.remove("crt-jitter");
          scheduleJitter();
        }, 110);
      }, 6000 + Math.random() * 9000);
    })();
  }

})();

/* Game-style loader — first visit per session. Fake boot progress,
   then "PRESS ENTER" (or tap). Any input skips ahead. */
function initializeCrtLoader() {
  const BOOT_LINES = [
    "shubhadeep-OS 5.1.2600 (Luna) booting \u2026",
    "[ 0.000000] Linux version 5.1.xp (build@luna) #2001 SMP",
    "[ 0.004312] BIOS EmpireOS Release 6.00PG detected",
    "[ 0.009118] CPU0: XP Pentium III @ 1000.02MHz cache 256K",
    "[ 0.014772] Calibrating delay loop... 1996.42 BogoMIPS",
    "[ 0.021560] Memory: 511616k/524288k available",
    "[ 0.029904] Mounting root /dev/projects ...... [ OK ]",
    "[ 0.038211] Loading module three.js ......... [ OK ]",
    "[ 0.047880] Loading module skills_globe ..... [ OK ]",
    "[ 0.056013] Starting github-sync.service .... [ OK ]",
    "[ 0.064772] Starting sound-engine.service ... [ OK ]",
    "[ 0.073401] Bringing up interface luna0 ..... [ OK ]",
    "[ 0.081990] Starting recycle-bin.daemon ..... [ OK ]",
    "[ 0.090114] Reached target Portfolio.target",
    "[ 0.098665] shubhadeep-login: session opened for user guest",
  ];
  const loader = document.createElement("div");
  loader.className = "crt-loader";
  loader.setAttribute("role", "button");
  loader.setAttribute("tabindex", "0");
  loader.setAttribute("aria-label", "Enter site");
  loader.innerHTML =
    '<pre class="crt-loader-console" aria-hidden="true"></pre>' +
    '<div class="crt-loader-card">' +
      '<div class="crt-loader-title">Shubhadeep <b>Datta</b></div>' +
      '<div class="crt-loader-sub">Portfolio Edition &#8212; Windows XP</div>' +
      '<div class="crt-loader-bar"><div class="crt-loader-fill"></div></div>' +
      '<div class="crt-loader-enter"></div>' +
    '</div>';
  document.body.appendChild(loader);
  document.documentElement.classList.add("crt-loading");
  loader.focus({ preventScroll: true });

  const fill = loader.querySelector(".crt-loader-fill");
  const consoleEl = loader.querySelector(".crt-loader-console");
  const enter = loader.querySelector(".crt-loader-enter");
  let lineIdx = 0;
  let dismissed = false;
  let progressTimer = null;
  let autoEnterTimer = null;

  function typeLine() {
    if (lineIdx < BOOT_LINES.length) {
      const line = document.createElement("div");
      line.className = "crt-con-line";
      line.innerHTML = BOOT_LINES[lineIdx]
        .replace("[ OK ]", '<span class="crt-con-ok">[ OK ]</span>')
        .replace(/^(\[[^\]]*\])/, '<span class="crt-con-t">$1</span>');
      consoleEl.appendChild(line);
      consoleEl.scrollTop = consoleEl.scrollHeight;
      lineIdx += 1;
      if (fill) fill.style.width = Math.round((lineIdx / BOOT_LINES.length) * 100) + "%";
      progressTimer = window.setTimeout(typeLine, 70 + Math.random() * 95);
    } else {
      loader.classList.add("ready");
      if (enter) enter.textContent = isTouchOnly ? "TAP TO ENTER" : "PRESS ENTER";
      autoEnterTimer = window.setTimeout(dismiss, 12000);
    }
  }

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    if (progressTimer !== null) clearTimeout(progressTimer);
    if (autoEnterTimer !== null) clearTimeout(autoEnterTimer);
    try { window.sessionStorage.setItem("crt-entered", "1"); } catch (error) {}
    document.removeEventListener("keydown", onKeydown);
    document.documentElement.classList.remove("crt-loading");
    loader.classList.add("done");
    if (window.xpSound) window.xpSound.startup();
    playPowerOn(false);
    window.setTimeout(() => loader.remove(), 340);
  }

  function onKeydown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      dismiss();
    }
  }

  loader.addEventListener("click", dismiss);
  document.addEventListener("keydown", onKeydown);
  window.setTimeout(typeLine, 200);
}
