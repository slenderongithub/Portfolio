    const stageManager = document.getElementById("stageManager");
    const stageToggle = document.getElementById("stageToggle");
    const stageScene = document.getElementById("stageScene");
    const dockItems = Array.from(document.querySelectorAll(".dock-item"));
    const windows = Array.from(document.querySelectorAll(".stage-window"));
    const openTriggers = Array.from(document.querySelectorAll("[data-open]"));

    let activeWindowId = "window-home";
    let tiltX = 0;
    let tiltY = 0;

    stageToggle.addEventListener("click", () => {
      stageManager.classList.toggle("collapsed");
    });

    function isMobileView() {
      return window.innerWidth <= 980;
    }

    function updateWindowStack() {
      const activeIndex = windows.findIndex(win => win.id === activeWindowId);

      windows.forEach((win, index) => {
        const offset = (index - activeIndex + windows.length) % windows.length;
        const isActive = offset === 0;

        win.classList.toggle("active", isActive);

        if (isMobileView()) {
          if (isActive) {
            win.style.transform = "translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)";
            win.style.opacity = "1";
            win.style.visibility = "visible";
            win.style.pointerEvents = "auto";
            win.style.zIndex = "400";
            win.style.filter = "brightness(1) saturate(1) blur(0px)";
          } else {
            win.style.transform = "translate3d(0, 16px, -80px) rotateX(0deg) rotateY(0deg) scale(0.98)";
            win.style.opacity = "0";
            win.style.visibility = "hidden";
            win.style.pointerEvents = "none";
            win.style.zIndex = "1";
            win.style.filter = "brightness(0.9) saturate(0.86) blur(1.2px)";
          }
          return;
        }

        if (isActive) {
          win.style.transform = `translate3d(0, 0, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1)`;
          win.style.opacity = "1";
          win.style.visibility = "visible";
          win.style.filter = "brightness(1) saturate(1) blur(0px)";
          win.style.pointerEvents = "auto";
          win.style.zIndex = "400";
          return;
        }

        const shouldShowInBackStack = offset <= 2;

        if (!shouldShowInBackStack) {
          win.style.transform = "translate3d(10%, 0, -360px) rotateY(10deg) scale(0.9)";
          win.style.opacity = "0";
          win.style.visibility = "hidden";
          win.style.pointerEvents = "none";
          win.style.zIndex = "1";
          win.style.filter = "brightness(0.82) saturate(0.8) blur(4px)";
          return;
        }

        const x = 6 + (offset * 4);
        const y = offset * 13;
        const z = -130 - (offset * 120);
        const rotateY = 5 + (offset * 3.2);
        const scale = Math.max(0.86, 0.97 - (offset * 0.05));
        const opacity = offset === 1 ? 0.2 : 0.1;
        const blur = offset === 1 ? 1.2 : 2.6;
        const brightness = offset === 1 ? 0.94 : 0.87;

        win.style.transform = `translate3d(${x}%, ${y}px, ${z}px) rotateY(${rotateY}deg) scale(${scale})`;
        win.style.opacity = String(opacity);
        win.style.visibility = "visible";
        win.style.filter = `brightness(${brightness}) saturate(0.84) blur(${blur}px)`;
        win.style.pointerEvents = "none";
        win.style.zIndex = String(340 - offset);
      });

      dockItems.forEach(item => {
        item.classList.toggle("active", item.dataset.window === activeWindowId);
      });
    }

    function activateWindow(windowId) {
      if (!windows.find(win => win.id === windowId)) {
        return;
      }
      activeWindowId = windowId;
      updateWindowStack();
    }

    dockItems.forEach(item => {
      item.addEventListener("click", () => activateWindow(item.dataset.window));
    });

    openTriggers.forEach(trigger => {
      trigger.addEventListener("click", event => {
        event.preventDefault();
        activateWindow(trigger.dataset.open);
      });
    });

    stageScene.addEventListener("pointermove", event => {
      if (isMobileView()) {
        return;
      }

      const rect = stageScene.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;

      tiltY = (nx - 0.5) * 5.2;
      tiltX = (0.5 - ny) * 3.8;

      updateWindowStack();
    });

    stageScene.addEventListener("pointerleave", () => {
      tiltX = 0;
      tiltY = 0;
      updateWindowStack();
    });

    window.addEventListener("resize", updateWindowStack);

    const repoOrbit = document.getElementById("repoOrbit");
    const repoCards = Array.from(document.querySelectorAll(".repo-orbit-card"));
    const expOrbit = document.getElementById("expOrbit");
    const expCards = Array.from(document.querySelectorAll(".exp-float-card"));
    const eduOrbit = document.getElementById("eduOrbit");
    const eduCards = Array.from(document.querySelectorAll(".edu-float-card"));

    function createFloatingOrbit(orbitEl, cards, config = {}) {
      if (!orbitEl || cards.length === 0) {
        return null;
      }

      const state = {
        angle: 0,
        dragging: false,
        lastX: 0,
        radiusX: config.radiusX ?? 230,
        radiusZ: config.radiusZ ?? 180,
        waveY: config.waveY ?? 22,
        idleSpeed: config.idleSpeed ?? 0.0018,
        dragSpeed: config.dragSpeed ?? 0.006,
        wheelSpeed: config.wheelSpeed ?? 0.0013,
      };

      function layout() {
        const total = cards.length;
        cards.forEach((card, index) => {
          const angle = state.angle + (index / total) * Math.PI * 2;
          const x = Math.cos(angle) * state.radiusX;
          const z = Math.sin(angle) * state.radiusZ;
          const y = Math.sin(angle * 1.8) * state.waveY;
          const depth = (z + state.radiusZ) / (state.radiusZ * 2);
          const scale = 0.76 + depth * 0.28;
          const brightness = 0.66 + depth * 0.42;

          card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${(-angle * 180 / Math.PI) + 90}deg) scale(${scale})`;
          card.style.zIndex = String(Math.floor(260 + depth * 320));
          card.style.filter = `brightness(${brightness})`;
        });
      }

      orbitEl.addEventListener("wheel", event => {
        event.preventDefault();
        state.angle += event.deltaY * state.wheelSpeed;
        layout();
      }, { passive: false });

      orbitEl.addEventListener("pointerdown", event => {
        state.dragging = true;
        state.lastX = event.clientX;
        orbitEl.classList.add("dragging");
        orbitEl.setPointerCapture(event.pointerId);
      });

      orbitEl.addEventListener("pointermove", event => {
        if (!state.dragging) {
          return;
        }
        const dx = event.clientX - state.lastX;
        state.lastX = event.clientX;
        state.angle += dx * state.dragSpeed;
        layout();
      });

      orbitEl.addEventListener("pointerup", () => {
        state.dragging = false;
        orbitEl.classList.remove("dragging");
      });

      orbitEl.addEventListener("pointercancel", () => {
        state.dragging = false;
        orbitEl.classList.remove("dragging");
      });

      layout();

      return {
        tick() {
          if (!state.dragging) {
            state.angle += state.idleSpeed;
            layout();
          }
        },
        focusIndex(index) {
          if (cards.length === 0) {
            return;
          }
          state.angle = -((index / cards.length) * Math.PI * 2);
          layout();
        },
      };
    }

    const repoOrbitState = createFloatingOrbit(repoOrbit, repoCards, {
      radiusX: 240,
      radiusZ: 190,
      waveY: 24,
      idleSpeed: 0.002,
    });

    const expOrbitState = createFloatingOrbit(expOrbit, expCards, {
      radiusX: 228,
      radiusZ: 176,
      waveY: 21,
      idleSpeed: 0.00185,
    });

    const eduOrbitState = createFloatingOrbit(eduOrbit, eduCards, {
      radiusX: 220,
      radiusZ: 170,
      waveY: 20,
      idleSpeed: 0.00175,
    });

    function focusRepoCard(projectKey) {
      const target = repoCards.find(card => card.dataset.key === projectKey);
      repoCards.forEach(card => card.classList.toggle("focused", card === target));

      if (!target || !repoOrbitState) {
        return;
      }

      const targetIndex = repoCards.indexOf(target);
      repoOrbitState.focusIndex(targetIndex);
    }

    const skillCosmos = document.getElementById("skillCosmos");
    const skillNodes = Array.from(document.querySelectorAll(".skill-node"));
    const skillDynamics = [];
    let skillRadius = 130;
    let skillCenterX = 0;
    let skillCenterY = 0;
    let skillTick = 0;

    function updateSkillMetrics() {
      if (!skillCosmos) {
        return;
      }

      const rect = skillCosmos.getBoundingClientRect();
      skillCenterX = rect.width / 2;
      skillCenterY = rect.height / 2;
      skillRadius = Math.max(104, Math.min(rect.width, rect.height) * 0.33);
    }

    function layoutSkillSphere() {
      if (!skillCosmos || skillNodes.length === 0) {
        return;
      }

      skillNodes.forEach((node, index) => {
        const dynamics = skillDynamics[index];
        const theta = dynamics.theta + skillTick * dynamics.speed;
        const phi = dynamics.phi + Math.sin(skillTick * 0.72 + dynamics.phase) * 0.46;
        const radius = skillRadius * (0.84 + Math.sin(skillTick * 0.95 + dynamics.phase) * 0.14);

        const x = Math.cos(theta) * Math.sin(phi) * radius;
        const y = Math.cos(phi) * radius * 0.72;
        const z = Math.sin(theta) * Math.sin(phi) * radius;

        const depth = (z + skillRadius) / (skillRadius * 2);
        const scale = 0.62 + depth * 0.62;
        const opacity = 0.46 + depth * 0.54;
        const brightness = 0.78 + depth * 0.34;

        node.style.transform = `translate3d(${skillCenterX + x}px, ${skillCenterY + y}px, ${z}px) translate(-50%, -50%) scale(${scale})`;
        node.style.opacity = String(opacity);
        node.style.zIndex = String(Math.floor(120 + depth * 240));
        node.style.filter = `brightness(${brightness})`;
      });
    }

    if (skillCosmos && skillNodes.length > 0) {
      skillNodes.forEach((_, index) => {
        skillDynamics.push({
          theta: (index / skillNodes.length) * Math.PI * 2,
          phi: Math.acos(1 - ((index + 0.5) / skillNodes.length) * 2),
          phase: index * 0.91,
          speed: 0.65 + (index % 5) * 0.14,
        });
      });

      updateSkillMetrics();
      layoutSkillSphere();
      window.addEventListener("resize", () => {
        updateSkillMetrics();
        layoutSkillSphere();
      });
    }

    function animateFloatingSystems() {
      if (repoOrbitState) {
        repoOrbitState.tick();
      }
      if (expOrbitState) {
        expOrbitState.tick();
      }
      if (eduOrbitState) {
        eduOrbitState.tick();
      }

      if (skillCosmos && skillNodes.length > 0) {
        skillTick += 0.016;
        layoutSkillSphere();
      }

      requestAnimationFrame(animateFloatingSystems);
    }

    animateFloatingSystems();

    window.activateWindow = activateWindow;
    window.focusRepoCard = focusRepoCard;

    updateWindowStack();
