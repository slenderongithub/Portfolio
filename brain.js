const brainStage = document.getElementById("brainStage");
const brainTooltip = document.getElementById("brainTooltip");
const brainTooltipTitle = document.getElementById("brainTooltipTitle");
const brainTooltipDesc = document.getElementById("brainTooltipDesc");
const brainTooltipTags = document.getElementById("brainTooltipTags");
const brainShell = brainStage ? brainStage.closest(".brain-shell") : null;

const projectNodes = [
  {
    key: "carelink",
    title: "CareLink",
    description: "Caregiving coordination app with reminders, adherence scoring, and AI health insights.",
    tags: ["React Native", "TypeScript", "Healthcare"],
    position: { x: -0.95, y: 0.52, z: 0.34 },
  },
  {
    key: "smart-glove",
    title: "Smart Glove Safety Device",
    description: "Wearable emergency communication device using gesture-triggered safety alerts.",
    tags: ["Arduino", "IoT", "Embedded"],
    position: { x: 1.02, y: 0.34, z: -0.22 },
  },
  {
    key: "habit-forge",
    title: "Habit Tracker Forge",
    description: "Productivity tracker with reminders, streak intelligence, and behavioral analytics.",
    tags: ["Python", "React", "Analytics"],
    position: { x: -0.52, y: -0.86, z: 0.44 },
  },
  {
    key: "hack-me",
    title: "HACK-ME-IF-YOU-CAN",
    description: "Gamified quiz system with dynamic scoring and replay-focused challenge rounds.",
    tags: ["JavaScript", "HTML", "CSS"],
    position: { x: 0.86, y: -0.62, z: 0.52 },
  },
  {
    key: "ai-companion",
    title: "AI Anti Self-Harm Companion",
    description: "NLP support assistant with sentiment-aware response patterns and privacy-first design.",
    tags: ["Python", "NLP", "ML"],
    position: { x: 0.08, y: 0.98, z: -0.08 },
  },
];

const brainPalettes = {
  light: {
    domeWire: 0x4d86ff,
    domeWireSoft: 0x8ec3ff,
    domeFill: 0xcfe5ff,
    nodeCore: 0xf4c85a,
    nodeHover: 0xffe18f,
    nodeHalo: 0x6fa8ff,
  },
  dark: {
    domeWire: 0xe0b169,
    domeWireSoft: 0xf2cf9b,
    domeFill: 0x4a3723,
    nodeCore: 0xf2bf73,
    nodeHover: 0xffd99e,
    nodeHalo: 0xe8b678,
  },
};

if (brainStage && brainTooltip && brainTooltipTitle && brainTooltipDesc && brainTooltipTags) {
  initializeInteractiveBrain();
}

function initializeInteractiveBrain() {
  let tooltipVisible = false;
  let darkThemeActive = document.body.classList.contains("theme-midnight");

  function getActivePalette() {
    return darkThemeActive ? brainPalettes.dark : brainPalettes.light;
  }

  function populateTooltipTags(tags) {
    brainTooltipTags.textContent = "";
    tags.forEach(tag => {
      const pill = document.createElement("span");
      pill.className = "brain-tooltip-tag";
      pill.textContent = tag;
      brainTooltipTags.appendChild(pill);
    });
  }

  function positionTooltip(clientX, clientY) {
    const rect = brainStage.getBoundingClientRect();
    const tooltipRect = brainTooltip.getBoundingClientRect();
    const pad = 10;

    const relX = clientX - rect.left + 16;
    const relY = clientY - rect.top + 16;

    const left = Math.min(Math.max(pad, relX), rect.width - tooltipRect.width - pad);
    const top = Math.min(Math.max(pad, relY), rect.height - tooltipRect.height - pad);

    brainTooltip.style.left = `${left}px`;
    brainTooltip.style.top = `${top}px`;
  }

  function showTooltip(project, clientX, clientY) {
    brainTooltipTitle.textContent = project.title;
    brainTooltipDesc.textContent = project.description;
    populateTooltipTags(project.tags);
    brainTooltip.classList.add("visible");
    brainTooltip.setAttribute("aria-hidden", "false");
    positionTooltip(clientX, clientY);
    tooltipVisible = true;
  }

  function hideTooltip() {
    if (!tooltipVisible) {
      return;
    }
    brainTooltip.classList.remove("visible");
    brainTooltip.setAttribute("aria-hidden", "true");
    tooltipVisible = false;
  }

  function openProject(project) {
    if (typeof window.activateWindow === "function") {
      window.activateWindow("window-repos");
    }

    if (typeof window.focusRepoCard === "function") {
      window.setTimeout(() => {
        window.focusRepoCard(project.key);
      }, 220);
    }
  }

  function mountDomFallbackNodes() {
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.position = "absolute";
    host.style.inset = "0";
    host.style.zIndex = "2";
    host.style.pointerEvents = "none";

    projectNodes.forEach(project => {
      const node = document.createElement("button");
      node.type = "button";
      node.style.position = "absolute";
      node.style.left = `${50 + project.position.x * 23}%`;
      node.style.top = `${50 - project.position.y * 23}%`;
      node.style.transform = "translate(-50%, -50%)";
      node.style.width = "12px";
      node.style.height = "12px";
      node.style.borderRadius = "50%";
      node.style.border = "none";
      node.style.background = "radial-gradient(circle, rgba(255, 236, 160, 0.98) 0%, rgba(241, 190, 74, 0.9) 72%, rgba(228, 171, 49, 0.85) 100%)";
      node.style.boxShadow = darkThemeActive
        ? "0 0 0 4px rgba(224, 177, 105, 0.52), 0 0 14px rgba(194, 134, 69, 0.42)"
        : "0 0 0 4px rgba(110, 165, 255, 0.62), 0 0 14px rgba(92, 148, 247, 0.46)";
      node.style.pointerEvents = "auto";
      node.style.cursor = "pointer";
      node.style.padding = "0";

      node.addEventListener("mouseenter", event => {
        node.style.transform = "translate(-50%, -50%) scale(1.25)";
        showTooltip(project, event.clientX, event.clientY);
      });

      node.addEventListener("mousemove", event => {
        positionTooltip(event.clientX, event.clientY);
      });

      node.addEventListener("mouseleave", () => {
        node.style.transform = "translate(-50%, -50%) scale(1)";
        hideTooltip();
      });

      node.addEventListener("click", event => {
        event.preventDefault();
        openProject(project);
      });

      host.appendChild(node);
    });

    brainStage.appendChild(host);
  }

  (async () => {
    try {
      const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
      camera.position.set(0, 0.08, 4.3);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      brainStage.appendChild(renderer.domElement);

      if (brainShell) {
        brainShell.classList.add("brain-3d-ready");
      }

      const brainGroup = new THREE.Group();
      brainGroup.rotation.set(0.08, -0.36, 0.02);
      scene.add(brainGroup);

      const initialPalette = getActivePalette();

      const domeFill = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.44, 1),
        new THREE.MeshBasicMaterial({
          color: initialPalette.domeFill,
          transparent: true,
          opacity: 0.2,
          depthWrite: false,
        }),
      );
      brainGroup.add(domeFill);

      const dome = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.36, 1),
        new THREE.MeshBasicMaterial({
          color: initialPalette.domeWire,
          wireframe: true,
          transparent: true,
          opacity: 0.56,
          depthWrite: false,
        }),
      );
      brainGroup.add(dome);

      const domeSoft = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.08, 0),
        new THREE.MeshBasicMaterial({
          color: initialPalette.domeWireSoft,
          wireframe: true,
          transparent: true,
          opacity: 0.24,
          depthWrite: false,
        }),
      );
      brainGroup.add(domeSoft);

      const nodeGeometry = new THREE.SphereGeometry(0.056, 20, 20);
      const nodeDefaultColor = new THREE.Color(initialPalette.nodeCore);
      const nodeHoverColor = new THREE.Color(initialPalette.nodeHover);
      const raycastNodes = [];
      const pointer = new THREE.Vector2(2, 2);
      const raycaster = new THREE.Raycaster();
      let hoveredNode = null;
      let pointerInside = false;
      let pointerClientX = 0;
      let pointerClientY = 0;

      projectNodes.forEach((project, index) => {
        const position = new THREE.Vector3(project.position.x, project.position.y, project.position.z).multiplyScalar(1.32);

        const node = new THREE.Mesh(
          nodeGeometry,
          new THREE.MeshBasicMaterial({
            color: nodeDefaultColor.clone(),
            transparent: true,
            opacity: 0.98,
          }),
        );

        node.position.copy(position);
        node.userData = {
          project,
          basePosition: position.clone(),
          index,
        };

        const halo = new THREE.Mesh(
          new THREE.RingGeometry(0.094, 0.118, 28),
          new THREE.MeshBasicMaterial({
            color: initialPalette.nodeHalo,
            transparent: true,
            opacity: 0.64,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );

        node.add(halo);
        brainGroup.add(node);
        raycastNodes.push(node);
      });

      function applyBrainPalette(palette) {
        domeFill.material.color.setHex(palette.domeFill);
        dome.material.color.setHex(palette.domeWire);
        domeSoft.material.color.setHex(palette.domeWireSoft);

        nodeDefaultColor.setHex(palette.nodeCore);
        nodeHoverColor.setHex(palette.nodeHover);

        raycastNodes.forEach(node => {
          if (node !== hoveredNode) {
            node.material.color.copy(nodeDefaultColor);
          }

          const halo = node.children[0];
          if (halo && halo.material) {
            halo.material.color.setHex(palette.nodeHalo);
          }
        });

        if (hoveredNode) {
          hoveredNode.material.color.copy(nodeHoverColor);
        }
      }

      function clearHoverState() {
        if (hoveredNode) {
          hoveredNode.material.color.copy(nodeDefaultColor);
          hoveredNode.scale.setScalar(1);
          hoveredNode = null;
        }
        hideTooltip();
      }

      function setHoverState(node) {
        if (hoveredNode !== node) {
          clearHoverState();
          hoveredNode = node;
          hoveredNode.material.color.copy(nodeHoverColor);
          hoveredNode.scale.setScalar(1.25);
        }

        showTooltip(node.userData.project, pointerClientX, pointerClientY);
      }

      function updateHover() {
        if (!pointerInside) {
          clearHoverState();
          return;
        }

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(raycastNodes, false);
        const target = intersects.length > 0 ? intersects[0].object : null;

        if (target) {
          setHoverState(target);
        } else {
          clearHoverState();
        }
      }

      brainStage.addEventListener("pointermove", event => {
        const rect = brainStage.getBoundingClientRect();
        pointerClientX = event.clientX;
        pointerClientY = event.clientY;
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        pointerInside = true;
        updateHover();
      });

      brainStage.addEventListener("pointerleave", () => {
        pointerInside = false;
        clearHoverState();
      });

      brainStage.addEventListener("pointerdown", event => {
        if (!hoveredNode) {
          return;
        }

        event.preventDefault();
        openProject(hoveredNode.userData.project);
      });

      function resize() {
        const rect = brainStage.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          return;
        }

        renderer.setSize(rect.width, rect.height, false);
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
      }

      window.addEventListener("resize", resize);
      if (window.ResizeObserver) {
        const observer = new ResizeObserver(resize);
        observer.observe(brainStage);
      }

      resize();

      let tick = 0;
      function animate() {
        requestAnimationFrame(animate);
        tick += 0.01;

        const isDarkMode = document.body.classList.contains("theme-midnight");
        if (isDarkMode !== darkThemeActive) {
          darkThemeActive = isDarkMode;
          applyBrainPalette(getActivePalette());
        }

        brainGroup.rotation.y += 0.00195;
        brainGroup.rotation.x = Math.sin(tick * 0.6) * 0.055;

        raycastNodes.forEach(node => {
          const { basePosition, index } = node.userData;
          node.position.x = basePosition.x + Math.sin(tick * 0.95 + index * 0.7) * 0.012;
          node.position.y = basePosition.y + Math.cos(tick * 1.15 + index * 0.55) * 0.018;

          const halo = node.children[0];
          if (halo) {
            halo.lookAt(camera.position);
            const pulse = 1 + Math.sin(tick * 2.4 + index) * 0.1;
            halo.scale.setScalar(pulse);
          }
        });

        if (pointerInside) {
          updateHover();
        }

        renderer.render(scene, camera);
      }

      animate();
    } catch (error) {
      // Keep the CSS dome fallback visible and add DOM nodes for hover details.
      mountDomFallbackNodes();
      console.error("Interactive 3D brain failed to initialize. Using DOM fallback nodes.", error);
    }
  })();
}
