const brainStage = document.getElementById("brainStage");
const brainTooltip = document.getElementById("brainTooltip");
const brainTooltipTitle = document.getElementById("brainTooltipTitle");
const brainTooltipDesc = document.getElementById("brainTooltipDesc");
const brainTooltipTags = document.getElementById("brainTooltipTags");
const brainShell = brainStage ? brainStage.closest(".brain-shell") : null;
let projectNodes = [];
const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const brainPalettes = {
  light: {
    domeWire: 0xffffff,
    domeWireSoft: 0xcfe0ff,
    domeFill: 0xbcd6ff,
    nodeCore: 0xffd75e,
    nodeHover: 0xfff0b8,
    nodeHalo: 0xffffff,
  },
  dark: {
    domeWire: 0x8fc4ff,
    domeWireSoft: 0xbcd6ff,
    domeFill: 0x16294a,
    nodeCore: 0xffd75e,
    nodeHover: 0xfff0b8,
    nodeHalo: 0x9fcaff,
  },
};
(async () => {
  if (window.loadProjectsFromGitHub) {
    const { projectNodes: ghProjects } = await window.loadProjectsFromGitHub();
    projectNodes = ghProjects;
  }
  if (brainStage && brainTooltip && brainTooltipTitle && brainTooltipDesc && brainTooltipTags) {
    initializeInteractiveBrain();
  }
})();
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
    const totalFallback = projectNodes.length;
    projectNodes.forEach((project, idx) => {
      const node = document.createElement("button");
      node.type = "button";
      node.style.position = "absolute";
      node.style.left = `${50 + project.position.x * 23}%`;
      node.style.top = `${50 - project.position.y * 23}%`;
      node.style.transform = "translate(-50%, -50%) scale(0)";
      node.style.width = "12px";
      node.style.height = "12px";
      node.style.borderRadius = "50%";
      node.style.border = "none";
      node.style.background = "radial-gradient(circle, rgba(255, 236, 160, 0.98) 0%, rgba(241, 190, 74, 0.9) 72%, rgba(228, 171, 49, 0.85) 100%)";
      node.style.boxShadow = darkThemeActive
        ? "0 0 0 4px rgba(159, 202, 255, 0.42), 0 0 18px rgba(159, 202, 255, 0.45)"
        : "0 0 0 4px rgba(255, 255, 255, 0.6), 0 0 14px rgba(255, 235, 150, 0.5)";
      node.style.pointerEvents = "auto";
      node.style.cursor = "pointer";
      node.style.padding = "0";
      node.style.opacity = "0";
      node.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      const revealThreshold = 0.02 + (idx / Math.max(1, totalFallback - 1)) * 0.18;
      node.dataset.revealThreshold = String(revealThreshold);
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

    function updateFallbackReveal() {
      const progress = typeof window.heroScrollProgress === "number" ? window.heroScrollProgress : 0;
      host.querySelectorAll("button").forEach(btn => {
        const threshold = parseFloat(btn.dataset.revealThreshold || "0");
        if (progress >= threshold) {
          btn.style.opacity = "1";
          btn.style.transform = "translate(-50%, -50%) scale(1)";
        }
      });
      requestAnimationFrame(updateFallbackReveal);
    }
    updateFallbackReveal();
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
        new THREE.TetrahedronGeometry(1.08, 0),
        new THREE.MeshBasicMaterial({
          color: initialPalette.domeWireSoft,
          wireframe: true,
          transparent: true,
          opacity: 0.2,
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
      const totalNodes = projectNodes.length;
      projectNodes.forEach((project, index) => {
        const position = new THREE.Vector3(project.position.x, project.position.y, project.position.z).multiplyScalar(1.32);
        const node = new THREE.Mesh(
          nodeGeometry,
          new THREE.MeshBasicMaterial({
            color: nodeDefaultColor.clone(),
            transparent: true,
            opacity: 0,
          }),
        );
        node.position.copy(position);
        node.scale.setScalar(0);
        node.userData = {
          project,
          basePosition: position.clone(),
          index,
          revealThreshold: 0.02 + (index / Math.max(1, totalNodes - 1)) * 0.18,
          revealed: false,
        };
        const halo = new THREE.Mesh(
          new THREE.RingGeometry(0.094, 0.118, 28),
          new THREE.MeshBasicMaterial({
            color: initialPalette.nodeHalo,
            transparent: true,
            opacity: 0,
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
        if (!prefersReducedMotion) {
          brainGroup.rotation.y += 0.00195;
          brainGroup.rotation.x = Math.sin(tick * 0.6) * 0.055;
        }


        const scrollProgress = typeof window.heroScrollProgress === "number" ? window.heroScrollProgress : 0;

        raycastNodes.forEach(node => {
          const { basePosition, index, revealThreshold } = node.userData;
          if (prefersReducedMotion) {
            node.position.copy(basePosition);
          } else {
            node.position.x = basePosition.x + Math.sin(tick * 0.95 + index * 0.7) * 0.012;
            node.position.y = basePosition.y + Math.cos(tick * 1.15 + index * 0.55) * 0.018;
          }


          const nodeProgress = Math.max(0, Math.min(1, (scrollProgress - revealThreshold) / 0.12));
          const targetOpacity = nodeProgress * 0.98;
          const targetScale = nodeProgress;


          const currentOpacity = node.material.opacity;
          const currentScale = node.scale.x;
          node.material.opacity = currentOpacity + (targetOpacity - currentOpacity) * 0.12;
          const newScale = currentScale + (targetScale - currentScale) * 0.12;
          if (node !== hoveredNode) {
            node.scale.setScalar(Math.max(0.001, newScale));
          }

          const halo = node.children[0];
          if (halo) {
            halo.lookAt(camera.position);
            const pulse = prefersReducedMotion ? 1 : 1 + Math.sin(tick * 2.4 + index) * 0.1;
            halo.scale.setScalar(pulse);
            halo.material.opacity = nodeProgress * 0.64;
          }
        });
        if (pointerInside) {
          updateHover();
        }
        renderer.render(scene, camera);
      }
      animate();
    } catch (error) {
      mountDomFallbackNodes();
      console.error("Interactive 3D brain failed to initialize. Using DOM fallback nodes.", error);
    }
  })();
}
