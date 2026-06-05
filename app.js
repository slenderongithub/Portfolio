    const themeToggle = document.getElementById("themeToggle");
    const stageScene = document.getElementById("stageScene");
    const topbar = document.querySelector(".topbar");
    const topNav = document.querySelector(".top-nav");
    const topNavSlider = document.getElementById("topNavSlider");
    const topNavItems = Array.from(document.querySelectorAll(".top-nav-item"));
    const windows = Array.from(document.querySelectorAll(".stage-window"));
    const openTriggers = Array.from(document.querySelectorAll("[data-open]"));
    const dotCanvas = document.getElementById("dotCanvas");
    const dotCtx = dotCanvas ? dotCanvas.getContext("2d") : null;

    const DOT_SPACING = 32;
    const DOT_BASE_ALPHA = 0.12;
    const DOT_GLOW_RADIUS = 112;
    const DOT_RADIUS = 1.4;
    const DOT_GLOW_BOOST = 0.14;
    const BOX_DOT_SPACING = 30;
    const BOX_DOT_BASE_ALPHA = 0.08;
    const BOX_DOT_GLOW_RADIUS = 122;
    const BOX_DOT_RADIUS = 1.2;
    const BOX_DOT_GLOW_BOOST = 0.18;
    const MIN_SECTION_SCROLL_DURATION = 220;
    const MAX_SECTION_SCROLL_DURATION = 520;
    const NAV_LOCK_EXTRA_DURATION = 520;
    const NAV_RELEASE_SETTLE_DELAY = 180;
    const NAV_CLICK_LOCK_BUFFER = 60;
    const SCROLL_SETTLE_POSITION_EPSILON = 1.5;
    const SCROLL_SETTLE_VELOCITY_EPSILON = 0.35;
    const SCROLL_SETTLE_FRAMES_REQUIRED = 2;
    const OFFSCREEN_COORD = -9999;

    let dotWidth = 0;
    let dotHeight = 0;
    const dotMouse = { x: OFFSCREEN_COORD, y: OFFSCREEN_COORD };
    const boxDotLayers = new Map();

    let activeWindowId = "window-home";
    let scrollRafId = null;
    let isSectionAutoScrolling = false;
    let sectionAutoScrollUnlockTimeoutId = null;
    let navActivationLockWindowId = null;
    let navLockReleaseTimeoutId = null;
    let navReleaseSettleRafId = null;
    let navReleaseLastScrollTop = null;
    let navReleaseStableFrameCount = 0;
    let navClickSwitchLocked = false;
    let navClickUnlockTimeoutId = null;
    let topNavMotionInitialized = false;
    let themeToggleClickTimeoutId = null;

    function lockNavClicks(durationMs) {
      navClickSwitchLocked = true;

      if (navClickUnlockTimeoutId !== null) {
        clearTimeout(navClickUnlockTimeoutId);
      }

      navClickUnlockTimeoutId = window.setTimeout(() => {
        navClickSwitchLocked = false;
        navClickUnlockTimeoutId = null;
      }, Math.max(0, durationMs));
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

    function moveTopNavSlider(windowId, immediate = false) {
      if (!topNav || !topNavSlider) {
        return;
      }

      const targetItem = topNavItems.find(item => item.dataset.window === windowId);
      if (!targetItem) {
        return;
      }

      if (immediate) {
        topNavSlider.style.transition = "none";
      }

      topNavSlider.style.left = `${targetItem.offsetLeft - topNav.scrollLeft}px`;
      topNavSlider.style.width = `${targetItem.offsetWidth}px`;

      if (immediate) {
        requestAnimationFrame(() => {
          topNavSlider.style.transition = "";
        });
      }
    }

    function syncInitialTopNavState() {
      const activeItem = topNavItems.find(item => item.classList.contains("active")) || topNavItems[0];
      if (!activeItem) {
        return;
      }

      const initialWindowId = activeItem.dataset.window;
      if (initialWindowId) {
        activeWindowId = initialWindowId;
      }

      moveTopNavSlider(activeWindowId, true);
    }

    function lockNavActivation(windowId, durationMs) {
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
      if (windowId && navActivationLockWindowId && navActivationLockWindowId !== windowId) {
        return;
      }

      navActivationLockWindowId = null;
    }

    function scheduleNavActivationRelease(windowId, delayMs = NAV_RELEASE_SETTLE_DELAY, targetTop = null) {
      if (navLockReleaseTimeoutId !== null) {
        clearTimeout(navLockReleaseTimeoutId);
      }

      if (navReleaseSettleRafId !== null) {
        cancelAnimationFrame(navReleaseSettleRafId);
        navReleaseSettleRafId = null;
      }

      navReleaseLastScrollTop = null;
      navReleaseStableFrameCount = 0;

      const finalizeRelease = () => {
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
        releaseNavActivationLock(windowId);
        endSectionAutoScroll();
      };

      if (typeof targetTop === "number" && stageScene) {
        const fallbackMs = Math.max(delayMs + 900, 1600);

        navLockReleaseTimeoutId = window.setTimeout(() => {
          finalizeRelease();
        }, fallbackMs);

        const checkSettled = () => {
          if (!stageScene) {
            finalizeRelease();
            return;
          }

          const currentTop = stageScene.scrollTop;
          const deltaToTarget = Math.abs(currentTop - targetTop);
          const deltaSinceLast = navReleaseLastScrollTop === null
            ? Number.POSITIVE_INFINITY
            : Math.abs(currentTop - navReleaseLastScrollTop);
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
            finalizeRelease();
            return;
          }

          navReleaseSettleRafId = requestAnimationFrame(checkSettled);
        };

        navReleaseSettleRafId = requestAnimationFrame(checkSettled);
        return;
      }

      navLockReleaseTimeoutId = window.setTimeout(() => {
        finalizeRelease();
      }, Math.max(0, delayMs));
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
      } catch (error) {
        // Ignore localStorage errors and keep runtime theme state.
      }

      redrawBoxDotCanvases();
    }

    function initializeTheme() {
      let initialMode = "light";

      try {
        const savedPortfolioTheme = window.localStorage.getItem("portfolio-theme");
        const savedGenericTheme = window.localStorage.getItem("theme");

        if (savedPortfolioTheme === "light" || savedPortfolioTheme === "dark") {
          initialMode = savedPortfolioTheme;
        } else if (savedGenericTheme === "light" || savedGenericTheme === "dark") {
          initialMode = savedGenericTheme;
        } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
          initialMode = "dark";
        }
      } catch (error) {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
          initialMode = "dark";
        }
      }

      setTheme(initialMode);
    }

    function triggerThemeToggleClickEffect() {
      if (!themeToggle) {
        return;
      }

      themeToggle.classList.remove("clicked");
      void themeToggle.offsetWidth;
      themeToggle.classList.add("clicked");

      if (themeToggleClickTimeoutId !== null) {
        clearTimeout(themeToggleClickTimeoutId);
      }

      themeToggleClickTimeoutId = window.setTimeout(() => {
        if (!themeToggle) {
          return;
        }
        themeToggle.classList.remove("clicked");
        themeToggleClickTimeoutId = null;
      }, 620);
    }

    function getDotThemePalette() {
      const styles = window.getComputedStyle(document.body);

      return {
        bg: styles.getPropertyValue("--dot-bg").trim() || "#f4f9ff",
        baseRgb: styles.getPropertyValue("--dot-base-rgb").trim() || "123, 168, 223",
        glowRgb: styles.getPropertyValue("--dot-glow-rgb").trim() || "84, 184, 255",
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
      if (!dotCanvas) {
        return;
      }

      dotWidth = Math.max(1, Math.floor(window.innerWidth));
      dotHeight = Math.max(1, Math.floor(window.innerHeight));

      if (dotCanvas.width !== dotWidth || dotCanvas.height !== dotHeight) {
        dotCanvas.width = dotWidth;
        dotCanvas.height = dotHeight;
      }
    }

    function drawDotBackground() {
      if (!dotCtx || !dotCanvas) {
        return;
      }

      if (dotWidth <= 0 || dotHeight <= 0) {
        resizeDotCanvas();
      }

      const palette = getDotThemePalette();

      dotCtx.clearRect(0, 0, dotWidth, dotHeight);

      drawDotGrid(
        dotCtx,
        dotWidth,
        dotHeight,
        dotMouse,
        { baseRgb: palette.baseRgb, glowRgb: palette.glowRgb },
        {
          spacing: DOT_SPACING,
          baseAlpha: DOT_BASE_ALPHA,
          glowRadius: DOT_GLOW_RADIUS,
          radius: DOT_RADIUS,
          glowBoost: DOT_GLOW_BOOST,
        },
      );

      requestAnimationFrame(drawDotBackground);
    }

    function drawBoxDotCanvas(layer, palette = getDotThemePalette()) {
      if (!layer || !layer.ctx || !layer.canvas) {
        return;
      }

      const { ctx, canvas, mouse } = layer;
      const width = canvas.width;
      const height = canvas.height;

      if (width <= 0 || height <= 0) {
        return;
      }

      ctx.clearRect(0, 0, width, height);
      drawDotGrid(
        ctx,
        width,
        height,
        mouse,
        { baseRgb: palette.baseRgb, glowRgb: palette.glowRgb },
        {
          spacing: BOX_DOT_SPACING,
          baseAlpha: BOX_DOT_BASE_ALPHA,
          glowRadius: BOX_DOT_GLOW_RADIUS,
          radius: BOX_DOT_RADIUS,
          glowBoost: BOX_DOT_GLOW_BOOST,
        },
      );
    }

    function resizeBoxDotCanvases() {
      boxDotLayers.forEach(layer => {
        const width = Math.max(1, Math.floor(layer.windowEl.clientWidth));
        const height = Math.max(1, Math.floor(layer.windowEl.clientHeight));

        if (layer.canvas.width !== width || layer.canvas.height !== height) {
          layer.canvas.width = width;
          layer.canvas.height = height;
        }
      });
    }

    function redrawBoxDotCanvases() {
      if (boxDotLayers.size === 0) {
        return;
      }

      const palette = getDotThemePalette();
      boxDotLayers.forEach(layer => drawBoxDotCanvas(layer, palette));
    }

    function initializeBoxDotCanvases() {
      windows.forEach(win => {
        const canvas = document.createElement("canvas");
        canvas.className = "box-dot-canvas";
        canvas.setAttribute("aria-hidden", "true");
        win.prepend(canvas);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          canvas.remove();
          return;
        }

        const layer = {
          windowEl: win,
          canvas,
          ctx,
          mouse: { x: OFFSCREEN_COORD, y: OFFSCREEN_COORD },
        };

        boxDotLayers.set(win.id, layer);

        win.addEventListener("pointermove", event => {
          const rect = win.getBoundingClientRect();
          layer.mouse.x = event.clientX - rect.left;
          layer.mouse.y = event.clientY - rect.top;
          drawBoxDotCanvas(layer);
        }, { passive: true });

        win.addEventListener("pointerleave", () => {
          layer.mouse.x = OFFSCREEN_COORD;
          layer.mouse.y = OFFSCREEN_COORD;
          drawBoxDotCanvas(layer);
        });
      });

      resizeBoxDotCanvases();
      redrawBoxDotCanvases();
    }

    function setActiveWindowState(windowId) {
      const targetExists = windows.some(win => win.id === windowId);
      if (!targetExists) {
        return;
      }

      if (activeWindowId === windowId) {
        return;
      }

      activeWindowId = windowId;

      windows.forEach(win => {
        win.classList.toggle("active", win.id === activeWindowId);
      });

      topNavItems.forEach(item => {
        item.classList.toggle("active", item.dataset.window === activeWindowId);
      });

      moveTopNavSlider(activeWindowId);

      // When navigating to the Skills section, re-measure pill sizes and
      // redraw the star field so they reflect the actual rendered dimensions
      // (they may have been zero if the globe was off-screen at page load).
      if (windowId === "window-skills" && typeof skillsGlobeState !== "undefined" && skillsGlobeState) {
        window.setTimeout(() => skillsGlobeState.remeasure?.(), 80);
      }
    }

    function getSectionScrollDuration(distance) {
      const scaledDuration = 180 + (distance * 0.22);
      return Math.min(MAX_SECTION_SCROLL_DURATION, Math.max(MIN_SECTION_SCROLL_DURATION, scaledDuration));
    }

    function getSectionNavClearance() {
      if (!stageScene || !topbar) {
        return 12;
      }

      const stageRect = stageScene.getBoundingClientRect();
      const topbarRect = topbar.getBoundingClientRect();
      const overlap = topbarRect.bottom - stageRect.top;
      const extraGap = window.innerWidth > 980 ? 14 : 8;

      return Math.max(extraGap, overlap + extraGap);
    }

    function getCandidateWindowIdAtScrollTop(scrollTop) {
      if (windows.length === 0) {
        return null;
      }

      const probeTop = scrollTop + getSectionNavClearance() + 24;
      let candidateWindow = windows[0];

      windows.forEach(win => {
        if (win.offsetTop <= probeTop) {
          candidateWindow = win;
        }
      });

      return candidateWindow.id;
    }

    function scrollToWindow(windowId, behavior = "smooth") {
      const target = windows.find(win => win.id === windowId);
      if (!target) {
        return;
      }

      if (!stageScene) {
        return;
      }

      const top = Math.max(0, target.offsetTop - getSectionNavClearance());

      if (behavior === "smooth") {
        const distance = Math.abs(stageScene.scrollTop - top);
        const duration = getSectionScrollDuration(distance);
        const switchLockDuration = duration + NAV_RELEASE_SETTLE_DELAY + NAV_CLICK_LOCK_BUFFER;

        lockNavClicks(switchLockDuration);
        beginSectionAutoScroll(switchLockDuration + 40);
        lockNavActivation(windowId, switchLockDuration + NAV_LOCK_EXTRA_DURATION);
        setActiveWindowState(windowId);
        stageScene.scrollTo({ top, behavior: "smooth" });
        scheduleNavActivationRelease(windowId, duration + NAV_RELEASE_SETTLE_DELAY, top);
        return;
      }

      endSectionAutoScroll();
      lockNavClicks(220);
      lockNavActivation(windowId, 160);
      setActiveWindowState(windowId);
      stageScene.scrollTo({ top, behavior: "auto" });
      scheduleNavActivationRelease(windowId, 120);
    }

    function activateWindow(windowId) {
      if (!windowId) {
        return;
      }

      if (navClickSwitchLocked) {
        return;
      }

      if (isSectionAutoScrolling && navActivationLockWindowId === windowId) {
        return;
      }

      if (!isSectionAutoScrolling && !navActivationLockWindowId && activeWindowId === windowId) {
        return;
      }

      scrollToWindow(windowId, "smooth");
    }

    function updateActiveWindowByScroll() {
      if (navActivationLockWindowId) {
        setActiveWindowState(navActivationLockWindowId);
        return;
      }

      if (!stageScene || windows.length === 0) {
        return;
      }

      const candidateWindowId = getCandidateWindowIdAtScrollTop(stageScene.scrollTop);
      if (!candidateWindowId) {
        return;
      }

      setActiveWindowState(candidateWindowId);
    }

    function updateWindowScrollDynamics() {
      const sceneCenter = stageScene.scrollTop + (stageScene.clientHeight * 0.5);
      const falloff = Math.max(stageScene.clientHeight * 0.75, 1);

      windows.forEach(win => {
        const center = win.offsetTop + (win.offsetHeight * 0.5);
        const distance = Math.abs(center - sceneCenter);
        const normalized = Math.min(distance / falloff, 1);

        const scale = 1 - (normalized * 0.035);
        const translateY = normalized * 16;
        const brightness = 1 - (normalized * 0.08);
        const saturation = 1 - (normalized * 0.07);
        const opacity = 1 - (normalized * 0.14);

        win.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
        win.style.filter = `brightness(${brightness}) saturate(${saturation})`;
        win.style.opacity = String(opacity);
      });
    }

    function updateTopNavScrollMotion(force = false) {
      if (!topNav) {
        return;
      }

      if (topNavMotionInitialized && !force) {
        return;
      }

      // Keep the nav steady so content never appears to slip under the header.
      topNav.style.setProperty("--nav-shift-y", "0px");
      topNav.style.setProperty("--nav-scale", "1");
      topNav.style.setProperty("--nav-bg-alpha", "0.58");
      topNav.style.setProperty("--nav-border-alpha", "0.38");
      topNavMotionInitialized = true;
    }

    function handleSceneScroll() {
      if (scrollRafId !== null) {
        return;
      }

      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = null;
        if (!isSectionAutoScrolling) {
          updateActiveWindowByScroll();
        }
        updateTopNavScrollMotion();
      });
    }

    if (dotCanvas) {
      window.addEventListener("pointermove", event => {
        dotMouse.x = event.clientX;
        dotMouse.y = event.clientY;
      }, { passive: true });

      window.addEventListener("pointerleave", () => {
        dotMouse.x = OFFSCREEN_COORD;
        dotMouse.y = OFFSCREEN_COORD;
      });
    }

    topNavItems.forEach(item => {
      item.addEventListener("click", event => {
        event.preventDefault();
        activateWindow(item.dataset.window);
      });
    });

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const nextMode = document.body.classList.contains("theme-midnight") ? "light" : "dark";
        triggerThemeToggleClickEffect();
        setTheme(nextMode);
      });
    }

    openTriggers.forEach(trigger => {
      trigger.addEventListener("click", event => {
        event.preventDefault();
        activateWindow(trigger.dataset.open);
      });
    });

    stageScene.addEventListener("scroll", handleSceneScroll, { passive: true });

    window.addEventListener("resize", () => {
      updateActiveWindowByScroll();
      updateTopNavScrollMotion(true);
      moveTopNavSlider(activeWindowId, true);
      resizeDotCanvas();
      resizeBoxDotCanvases();
      redrawBoxDotCanvases();
    });

    const repoTerminalGrid = document.getElementById("repoTerminalGrid");
    let repoCards = Array.from(document.querySelectorAll(".repo-terminal-card"));
    let projectDetails = {};
    const expOrbit = document.getElementById("expOrbit");
    const expCards = Array.from(document.querySelectorAll(".exp-float-card"));
    const expPrevButton = document.querySelector(".exp-nav-prev");
    const expNextButton = document.querySelector(".exp-nav-next");

    function escapeHtml(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    async function loadProjectDetails() {
      try {
        const response = await fetch("./projects-details.json");
        if (response.ok) {
          projectDetails = await response.json();
        }
      } catch (error) {
        console.warn("Could not load project detail copy:", error);
      }
    }

    function updateRepoCards() {
      repoCards = Array.from(document.querySelectorAll(".repo-terminal-card"));

      repoCards.forEach(card => {
        card.addEventListener("click", () => {
          focusRepoCard(card.dataset.key);
        });
      });
    }

    async function populateRepoTerminal() {
      if (!repoTerminalGrid || typeof window.loadProjectsFromGitHub !== "function") {
        updateRepoCards();
        return;
      }

      await loadProjectDetails();

      try {
        const { terminalCards } = await window.loadProjectsFromGitHub();

        if (!terminalCards || terminalCards.length === 0) {
          updateRepoCards();
          return;
        }

        const detailsByName = Object.fromEntries(
          Object.entries(projectDetails).map(([name, details]) => [name.toLowerCase(), details]),
        );

        repoTerminalGrid.innerHTML = terminalCards.map(card => {
          const details = detailsByName[card.name.toLowerCase()] || {};
          const description = details.description || card.description || "Project repository";
          const points = Array.isArray(details.points) && details.points.length > 0
            ? details.points
            : [
                "Built the core workflow with clear project structure and reusable implementation pieces.",
                "Kept the interface practical so the project can be explored, tested, and extended quickly.",
                "Focused on clean delivery with readable logic and a maintainable codebase.",
              ];

          return `
            <article class="repo-terminal-card" data-key="${escapeHtml(card.key)}">
              <div class="repo-terminal-head">
                <div class="repo-terminal-dots"><span></span><span></span><span></span></div>
                <span class="repo-terminal-label">${escapeHtml(card.name.toLowerCase())}.repo</span>
              </div>
              <div class="repo-terminal-body">
                <div class="repo-terminal-line">
                  <span class="repo-terminal-prompt">$</span>
                  <span class="repo-terminal-text">git clone <a class="repo-terminal-anchor" href="${escapeHtml(card.url)}" target="_blank" rel="noreferrer noopener">github.com/slenderongithub/${escapeHtml(card.name)}</a></span>
                </div>
                <div class="repo-terminal-line">
                  <span class="repo-terminal-prompt">$</span>
                  <span class="repo-terminal-comment"># ${escapeHtml(description)}</span>
                </div>
                ${points.slice(0, 3).map(point => `
                  <div class="repo-terminal-line">
                    <span class="repo-terminal-prompt">&gt;</span>
                    <span class="repo-terminal-text">${escapeHtml(point)}</span>
                  </div>
                `).join("")}
              </div>
            </article>
          `;
        }).join("");

        updateRepoCards();
      } catch (error) {
        console.warn("Could not populate repository terminal:", error);
        updateRepoCards();
      }
    }

    function initializeExperienceCarousel() {
      if (!expOrbit || expCards.length === 0) {
        return null;
      }

      let current = 0;
      let autoTimer = null;

      function render() {
        const leadCardWidth = expCards[0]?.getBoundingClientRect().width || 320;
        const xStep = window.innerWidth <= 680
          ? Math.max(160, Math.min(leadCardWidth * 0.64, 210))
          : Math.max(250, Math.min(leadCardWidth * 0.72, 330));

        expCards.forEach((card, index) => {
          const offset = index - current;
          const absOffset = Math.abs(offset);

          const z = absOffset === 0 ? 84 : -120 - absOffset * 70;
          const x = offset * xStep;
          const rotY = offset * -21;
          const scale = absOffset === 0 ? 1 : Math.max(0.68, 0.86 - absOffset * 0.11);
          const opacity = absOffset === 0 ? 1 : Math.max(0.18, 0.57 - absOffset * 0.2);
          const brightness = absOffset === 0 ? 1 : Math.max(0.68, 0.9 - absOffset * 0.12);

          card.style.transform = `translate3d(${x}px, 0px, ${z}px) rotateY(${rotY}deg) scale(${scale})`;
          card.style.opacity = String(opacity);
          card.style.zIndex = String(220 - absOffset);
          card.style.pointerEvents = absOffset > 1 ? "none" : "auto";
          card.style.filter = `brightness(${brightness})`;
          card.classList.toggle("active", index === current);
        });
      }

      function goTo(index) {
        current = (index + expCards.length) % expCards.length;
        render();
      }

      function goNext() {
        goTo(current + 1);
      }

      function goPrev() {
        goTo(current - 1);
      }

      function stopAuto() {
        if (autoTimer !== null) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      }

      function startAuto() {
        stopAuto();
        autoTimer = window.setInterval(() => {
          if (activeWindowId !== "window-experience") {
            return;
          }
          goNext();
        }, 4300);
      }

      expCards.forEach((card, index) => {
        card.addEventListener("click", () => {
          goTo(index);
        });
      });

      expOrbit.addEventListener("mouseenter", stopAuto);
      expOrbit.addEventListener("mouseleave", startAuto);

      if (expPrevButton) {
        expPrevButton.addEventListener("click", () => {
          stopAuto();
          goPrev();
          startAuto();
        });
      }

      if (expNextButton) {
        expNextButton.addEventListener("click", () => {
          stopAuto();
          goNext();
          startAuto();
        });
      }

      document.addEventListener("keydown", event => {
        if (activeWindowId !== "window-experience") {
          return;
        }

        if (event.key === "ArrowLeft") {
          goPrev();
        } else if (event.key === "ArrowRight") {
          goNext();
        }
      });

      window.addEventListener("resize", render);

      render();
      startAuto();
    }

    populateRepoTerminal();
    initializeExperienceCarousel();

    function initializeEducationTimeline() {
      const timeline = document.getElementById("eduTimeline");
      const timelineLine = document.getElementById("eduTimelineLine");
      const timelineItems = Array.from(document.querySelectorAll(".edu-tl-item"));

      if (!timeline || !timelineLine || timelineItems.length === 0) {
        return null;
      }

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle("visible", entry.isIntersecting);
        });
      }, {
        threshold: 0.15,
        root: stageScene || null,
        rootMargin: "0px 0px -80px 0px",
      });

      timelineItems.forEach(item => observer.observe(item));

      function updateTimelineLine() {
        const timelineRect = timeline.getBoundingClientRect();
        const timelineHeight = timeline.offsetHeight;

        if (timelineHeight <= 0) {
          return;
        }

        const rootTop = stageScene ? stageScene.getBoundingClientRect().top : 0;
        const rootHeight = stageScene ? stageScene.clientHeight : window.innerHeight;
        const progress = ((rootTop + rootHeight) - timelineRect.top) / (timelineHeight + rootHeight * 0.5);
        const clamped = Math.max(0, Math.min(1, progress));

        timelineLine.style.height = `${clamped * timelineHeight}px`;
      }

      if (stageScene) {
        stageScene.addEventListener("scroll", updateTimelineLine, { passive: true });
      } else {
        window.addEventListener("scroll", updateTimelineLine, { passive: true });
      }

      window.addEventListener("resize", updateTimelineLine);
      updateTimelineLine();
    }

    initializeEducationTimeline();

    function focusRepoCard(projectKey) {
      const target = repoCards.find(card => card.dataset.key === projectKey);
      repoCards.forEach(card => card.classList.toggle("focused", card === target));

      if (!target) {
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }

    function initializeSkillsGlobe() {
      const globeRoot = document.getElementById("skillsGlobe");
      const bgCanvas = document.getElementById("skillsBgCanvas");
      const globeCanvas = document.getElementById("skillsGlobeCanvas");
      const pillLayer = document.getElementById("skillsPillLayer");

      if (!globeRoot || !bgCanvas || !globeCanvas || !pillLayer) {
        return null;
      }

      const bgCtx = bgCanvas.getContext("2d");
      const globeCtx = globeCanvas.getContext("2d");

      if (!bgCtx || !globeCtx) {
        return null;
      }

      const skillItems = [
        { name: "Docker", iconClass: "devicon-docker-plain", iconBg: "#1d63ed", iconColor: "#ffffff" },
        { name: "NumPy", iconClass: "devicon-numpy-plain", iconBg: "#4dabcf", iconColor: "#ffffff" },
        { name: "GitHub", iconClass: "devicon-github-original", iconBg: "#ffffff", iconColor: "#000000" },
        { name: "Jupyter", iconClass: "devicon-jupyter-plain", iconBg: "#f37626", iconColor: "#ffffff" },
        { name: "Redis", iconClass: "devicon-redis-plain", iconBg: "#d82c20", iconColor: "#ffffff" },
        { name: "Next.js", iconClass: "devicon-nextjs-plain", iconBg: "#000000", iconColor: "#ffffff" },
        { name: "PostgreSQL", iconClass: "devicon-postgresql-plain", iconBg: "#336791", iconColor: "#ffffff" },
        { name: "HuggingFace", iconBg: "#ffcc33", iconColor: "#000000", placeholder: "🤗" },
        { name: "TypeScript", iconClass: "devicon-typescript-plain", iconBg: "#3178c6", iconColor: "#ffffff" },
        { name: "Scikit-Learn", iconClass: "devicon-scikitlearn-plain", iconBg: "#f7931e", iconColor: "#ffffff" },
        { name: "Git", iconClass: "devicon-git-plain", iconBg: "#f05032", iconColor: "#ffffff" },
        { name: "Plotly", iconBg: "#3f4f75", iconColor: "#ffffff", placeholder: "📊" },
        { name: "LangChain", iconBg: "#1c3c3c", iconColor: "#6ee7b7", placeholder: "🦜" },
        { name: "Python", iconClass: "devicon-python-plain", iconBg: "#3776ab", iconColor: "#ffd343" },
        { name: "Power BI", iconBg: "#f2c811", iconColor: "#000000", placeholder: "⚡" },
        { name: "Supabase", iconClass: "devicon-supabase-plain", iconBg: "#3ecf8e", iconColor: "#ffffff" },
        { name: "TailwindCSS", iconClass: "devicon-tailwindcss-plain", iconBg: "#0ea5e9", iconColor: "#ffffff" },
        { name: "TensorFlow", iconClass: "devicon-tensorflow-original", iconBg: "#ff6f00", iconColor: "#ffffff" },
        { name: "MongoDB", iconClass: "devicon-mongodb-plain", iconBg: "#4db33d", iconColor: "#ffffff" },
        { name: "FastAPI", iconClass: "devicon-fastapi-plain", iconBg: "#05998b", iconColor: "#ffffff" },
        { name: "XGBoost", iconBg: "#189fdd", iconColor: "#ffffff", placeholder: "XG" },
        { name: "Vercel", iconClass: "devicon-vercel-plain", iconBg: "#ffffff", iconColor: "#000000" },
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

      const pills = skillItems.map((skill, index) => {
        const pill = document.createElement("div");
        pill.className = "skills-pill";

        const iconWrap = document.createElement("div");
        iconWrap.className = "skills-pill-icon";
        iconWrap.style.background = skill.iconBg;

        if (skill.iconClass) {
          const icon = document.createElement("i");
          icon.className = `${skill.iconClass} colored`;
          if (skill.iconColor) {
            icon.style.color = skill.iconColor;
          }
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

        return {
          el: pill,
          baseX: spherePoints[index][0],
          baseY: spherePoints[index][1],
          baseZ: spherePoints[index][2],
          width: 120,
          height: 32,
        };
      });

      let centerX = 0;
      let centerY = 0;
      let sphereRadius = 220;
      let fov = 900;
      let rotationX = 0.25;
      let rotationY = 0;
      let velocityX = 0;
      let velocityY = 0.0035;
      let dragging = false;
      let lastPointerX = 0;
      let lastPointerY = 0;
      let stars = [];
      let darkThemeActive = document.body.classList.contains("theme-midnight");

      function measurePills() {
        pills.forEach(pill => {
          const rect = pill.el.getBoundingClientRect();
          if (rect.width > 0) {
            pill.width = rect.width;
            pill.height = rect.height || 32;
          }
        });
      }

      function rebuildStars(width, height) {
        const starCount = width <= 520 ? 140 : 220;
        stars = Array.from({ length: starCount }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.1 + 0.2,
          a: Math.random() * 0.55 + 0.08,
        }));
      }

      let lastGlobeW = 0;
      let lastGlobeH = 0;

      function resizeCanvases() {
        const rect = globeRoot.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          return;
        }

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const nextWidth = Math.max(1, Math.floor(rect.width * dpr));
        const nextHeight = Math.max(1, Math.floor(rect.height * dpr));
        const dimensionsChanged = bgCanvas.width !== nextWidth || bgCanvas.height !== nextHeight;

        [
          [bgCanvas, bgCtx],
          [globeCanvas, globeCtx],
        ].forEach(([canvas, ctx]) => {
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
          Math.min(rect.width, rect.height) * (window.innerWidth <= 680 ? 0.44 : 0.46),
        );
        fov = Math.max(760, sphereRadius * 4.2);

        // Only rebuild stars when the canvas actually changed size — avoids a
        // flash of freshly-randomised stars every time the user scrolls back.
        if (dimensionsChanged || lastGlobeW === 0) {
          lastGlobeW = rect.width;
          lastGlobeH = rect.height;
          rebuildStars(rect.width, rect.height);
          drawStarField();
        }

        // Only re-measure pill sizes when they are actually rendered on screen.
        measurePills();
      }

      function drawStarField() {
        const rect = globeRoot.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          return;
        }

        bgCtx.clearRect(0, 0, rect.width, rect.height);

        const starRgb = "255, 255, 255";

        stars.forEach(star => {
          bgCtx.beginPath();
          bgCtx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          bgCtx.fillStyle = `rgba(${starRgb}, ${star.a})`;
          bgCtx.fill();
        });
      }

      function applyRotation(baseX, baseY, baseZ) {
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);

        const x2 = baseX * cosY + baseZ * sinY;
        const z2 = -baseX * sinY + baseZ * cosY;
        const y3 = baseY * cosX - z2 * sinX;
        const z3 = baseY * sinX + z2 * cosX;

        return [x2, y3, z3];
      }

      function drawWireGlobe() {
        const rect = globeRoot.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          return;
        }

        globeCtx.clearRect(0, 0, rect.width, rect.height);

        const wireColor = darkThemeActive ? "34, 211, 238" : "77, 134, 255";
        const glowColor = darkThemeActive ? "96, 165, 250" : "77, 134, 255";
        const latAlpha = darkThemeActive ? 0.28 : 0.19;
        const lonAlpha = darkThemeActive ? 0.23 : 0.16;
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

            if (step === 0) {
              globeCtx.moveTo(px, py);
            } else {
              globeCtx.lineTo(px, py);
            }
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

            if (step === 0) {
              globeCtx.moveTo(px, py);
            } else {
              globeCtx.lineTo(px, py);
            }
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
        dragging = true;
        lastPointerX = clientX;
        lastPointerY = clientY;
        velocityX = 0;
        velocityY = 0;
        globeRoot.classList.add("dragging");
      }

      function updateDrag(clientX, clientY) {
        if (!dragging) {
          return;
        }

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
        if (!dragging) {
          return;
        }

        dragging = false;
        globeRoot.classList.remove("dragging");
      }

      globeRoot.addEventListener("pointerdown", event => {
        startDrag(event.clientX, event.clientY);
        globeRoot.setPointerCapture(event.pointerId);
        event.preventDefault();
      });

      globeRoot.addEventListener("pointermove", event => {
        updateDrag(event.clientX, event.clientY);
      });

      globeRoot.addEventListener("pointerup", stopDrag);
      globeRoot.addEventListener("pointercancel", stopDrag);
      globeRoot.addEventListener("lostpointercapture", stopDrag);
      globeRoot.addEventListener("dragstart", event => event.preventDefault());

      // Use ResizeObserver so we only react to changes on the globe container
      // itself, not every unrelated window-resize event that fires while other
      // sections are visible.
      if (window.ResizeObserver) {
        const globeResizeObserver = new ResizeObserver(() => {
          resizeCanvases();
        });
        globeResizeObserver.observe(globeRoot);
      } else {
        window.addEventListener("resize", resizeCanvases);
      }

      resizeCanvases();
      layoutPills();
      drawWireGlobe();

      // Measure pill widths once fonts/icons have loaded.
      window.setTimeout(measurePills, 120);
      // Second pass in case devicon fonts were still loading.
      window.setTimeout(measurePills, 900);

      return {
        tick() {
          // Skip rendering when the Skills section is not the active window —
          // this keeps rotation state frozen so coming back feels seamless.
          if (activeWindowId !== "window-skills") {
            return;
          }

          const themeIsDark = document.body.classList.contains("theme-midnight");
          if (themeIsDark !== darkThemeActive) {
            darkThemeActive = themeIsDark;
            drawStarField();
          }

          if (!dragging) {
            rotationY += velocityY;
            velocityX *= 0.95;
            rotationX += velocityX;
            rotationX = Math.max(-1.2, Math.min(1.2, rotationX));
          }

          drawWireGlobe();
          layoutPills();
        },
        // Called when the Skills section becomes active so pill sizes and the
        // canvas are refreshed after potentially being invisible at page load.
        remeasure() {
          resizeCanvases();
          measurePills();
        },
      };
    }

    const skillsGlobeState = initializeSkillsGlobe();

    function animateFloatingSystems() {
      if (skillsGlobeState) {
        skillsGlobeState.tick();
      }

      requestAnimationFrame(animateFloatingSystems);
    }

    animateFloatingSystems();

    window.activateWindow = activateWindow;
    window.focusRepoCard = focusRepoCard;

    initializeBoxDotCanvases();
    initializeTheme();
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-booting");
    }, 80);
    resizeDotCanvas();
    drawDotBackground();
    syncInitialTopNavState();
    setActiveWindowState(activeWindowId);
    updateTopNavScrollMotion();
