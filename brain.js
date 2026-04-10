    import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
    import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

    const brainStage = document.getElementById("brainStage");
    const brainTooltip = document.getElementById("brainTooltip");
    const brainTooltipTitle = document.getElementById("brainTooltipTitle");
    const brainTooltipDesc = document.getElementById("brainTooltipDesc");

    if (brainStage && brainTooltip && brainTooltipTitle && brainTooltipDesc) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 0.1, 3.5);
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

      const brainRoot = new THREE.Group();
      brainRoot.rotation.set(0.08, -0.48, 0.03);
      scene.add(brainRoot);

      const pointer = new THREE.Vector2();
      const raycaster = new THREE.Raycaster();
      const nodeMeshes = [];
      const wireMaterials = [];
      const glowMaterials = [];

      const projectNodes = [
        {
          key: "carelink",
          x: -0.95,
          y: 0.36,
          z: 0.35,
          title: "CareLink",
          description: "Winner app for caregiving coordination with adherence and reminders.",
        },
        {
          key: "ai-companion",
          x: 0.06,
          y: 0.88,
          z: -0.1,
          title: "AI Anti Self-Harm Companion",
          description: "NLP emotional support assistant with sentiment-aware distress detection.",
        },
        {
          key: "smart-glove",
          x: 0.9,
          y: 0.33,
          z: 0.26,
          title: "Smart Glove Safety Device",
          description: "Wearable emergency communication via gesture-triggered safety logic.",
        },
        {
          key: "habit-forge",
          x: -0.55,
          y: -0.73,
          z: 0.4,
          title: "Habit Tracker Forge",
          description: "Habit analytics product with reminders, streaks, and persistent storage.",
        },
        {
          key: "hack-me",
          x: 0.7,
          y: -0.57,
          z: 0.46,
          title: "HACK-ME-IF-YOU-CAN",
          description: "Gamified quiz with dynamic scoring, qualifiers, and leaderboard flow.",
        },
      ];

      const nodeGeometry = new THREE.SphereGeometry(0.042, 20, 20);
      const nodeDefaultColor = new THREE.Color(0xbfe3ff);
      const nodeHoverColor = new THREE.Color(0xecf8ff);

      let hoveredNode = null;
      let pointerInside = false;
      let pointerClient = { x: 0, y: 0 };

      function createWireMaterial(opacity) {
        const mat = new THREE.MeshBasicMaterial({
          color: 0x8acfff,
          wireframe: true,
          transparent: true,
          opacity,
          depthWrite: false,
        });
        wireMaterials.push(mat);
        return mat;
      }

      function createGlowMaterial(opacity) {
        const mat = new THREE.MeshBasicMaterial({
          color: 0x69bbff,
          transparent: true,
          opacity,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        glowMaterials.push(mat);
        return mat;
      }

      function sculptHemisphere(isLeft) {
        const geom = new THREE.IcosahedronGeometry(1.02, 5);
        const pos = geom.attributes.position;

        for (let i = 0; i < pos.count; i += 1) {
          let x = pos.getX(i);
          let y = pos.getY(i);
          let z = pos.getZ(i);

          const fold = 1 + Math.sin(y * 12.5) * 0.04 + Math.cos(z * 16.5) * 0.03 + Math.sin(x * 9.7) * 0.02;

          x *= fold * 1.1;
          y *= fold * 0.92;
          z *= fold * 0.95;

          const separator = isLeft ? Math.min(x, 0.04) : Math.max(x, -0.04);
          x = separator;

          pos.setXYZ(i, x, y, z);
        }

        geom.computeVertexNormals();

        const wireMesh = new THREE.Mesh(geom, createWireMaterial(0.62));
        const glowMesh = new THREE.Mesh(geom.clone(), createGlowMaterial(0.13));
        glowMesh.scale.setScalar(1.04);

        const hemisphere = new THREE.Group();
        wireMesh.position.x = isLeft ? -0.32 : 0.32;
        glowMesh.position.x = wireMesh.position.x;
        hemisphere.add(wireMesh, glowMesh);

        return hemisphere;
      }

      function createProceduralBrain() {
        const group = new THREE.Group();
        const left = sculptHemisphere(true);
        const right = sculptHemisphere(false);
        group.add(left);
        group.add(right);

        const stemGeometry = new THREE.CylinderGeometry(0.16, 0.23, 0.75, 16, 1, true);
        const stemWire = new THREE.Mesh(stemGeometry, createWireMaterial(0.56));
        stemWire.position.y = -0.98;
        stemWire.position.z = 0.08;
        group.add(stemWire);

        const stemGlow = new THREE.Mesh(stemGeometry.clone(), createGlowMaterial(0.11));
        stemGlow.scale.setScalar(1.07);
        stemGlow.position.copy(stemWire.position);
        group.add(stemGlow);

        return group;
      }

      function fitBrainModel(model) {
        const bounds = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        bounds.getSize(size);
        bounds.getCenter(center);

        model.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 2.5 / maxDim;
        brainRoot.scale.setScalar(scale);

        const spread = maxDim * 0.72;
        projectNodes.forEach(project => {
          const material = new THREE.MeshBasicMaterial({
            color: nodeDefaultColor.clone(),
            transparent: true,
            opacity: 0.96,
          });
          const node = new THREE.Mesh(nodeGeometry, material);
          node.position.set(project.x * spread, project.y * spread, project.z * spread);
          node.userData = {
            key: project.key,
            title: project.title,
            description: project.description,
          };
          brainRoot.add(node);
          nodeMeshes.push(node);
        });
      }

      function setBrainGlow(active) {
        wireMaterials.forEach(mat => {
          mat.opacity = active ? 0.9 : 0.62;
        });

        glowMaterials.forEach(mat => {
          mat.opacity = active ? 0.28 : 0.13;
        });
      }

      const loader = new GLTFLoader();
      loader.load(
        "./brain.glb",
        gltf => {
          const model = gltf.scene;
          model.traverse(child => {
            if (child.isMesh) {
              const wire = createWireMaterial(0.62);
              const glow = createGlowMaterial(0.12);
              child.material = wire;

              const glowMesh = new THREE.Mesh(child.geometry.clone(), glow);
              glowMesh.position.copy(child.position);
              glowMesh.rotation.copy(child.rotation);
              glowMesh.scale.copy(child.scale).multiplyScalar(1.04);
              child.parent.add(glowMesh);
            }
          });

          fitBrainModel(model);
          brainRoot.add(model);
        },
        undefined,
        () => {
          const procedural = createProceduralBrain();
          fitBrainModel(procedural);
          brainRoot.add(procedural);
        }
      );

      function resizeScene() {
        const rect = brainStage.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          return;
        }

        renderer.setSize(rect.width, rect.height, false);
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
      }

      function clearHoverState() {
        if (hoveredNode) {
          hoveredNode.material.color.copy(nodeDefaultColor);
          hoveredNode.scale.setScalar(1);
          hoveredNode = null;
        }

        brainTooltip.classList.remove("visible");
        brainTooltip.setAttribute("aria-hidden", "true");
      }

      function placeTooltip(clientX, clientY) {
        const rect = brainStage.getBoundingClientRect();
        const tooltipRect = brainTooltip.getBoundingClientRect();
        const pad = 10;

        const x = clientX - rect.left + 16;
        const y = clientY - rect.top + 16;

        const left = Math.min(Math.max(pad, x), rect.width - tooltipRect.width - pad);
        const top = Math.min(Math.max(pad, y), rect.height - tooltipRect.height - pad);

        brainTooltip.style.left = `${left}px`;
        brainTooltip.style.top = `${top}px`;
      }

      function setHoverState(node, clientX, clientY) {
        if (hoveredNode !== node) {
          clearHoverState();
          hoveredNode = node;
          hoveredNode.material.color.copy(nodeHoverColor);
          hoveredNode.scale.setScalar(1.28);
        }

        brainTooltipTitle.textContent = node.userData.title;
        brainTooltipDesc.textContent = node.userData.description;
        brainTooltip.classList.add("visible");
        brainTooltip.setAttribute("aria-hidden", "false");
        placeTooltip(clientX, clientY);
      }

      function updateHover() {
        if (!pointerInside || nodeMeshes.length === 0) {
          clearHoverState();
          return;
        }

        raycaster.setFromCamera(pointer, camera);
        const intersections = raycaster.intersectObjects(nodeMeshes, false);
        const target = intersections.length > 0 ? intersections[0].object : null;

        if (target) {
          setHoverState(target, pointerClient.x, pointerClient.y);
        } else {
          clearHoverState();
        }
      }

      brainStage.addEventListener("pointerenter", () => {
        setBrainGlow(true);
      });

      brainStage.addEventListener("pointerleave", () => {
        pointerInside = false;
        clearHoverState();
        setBrainGlow(false);
      });

      brainStage.addEventListener("pointermove", event => {
        const rect = brainStage.getBoundingClientRect();
        pointerClient = { x: event.clientX, y: event.clientY };
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        pointerInside = true;
        updateHover();
      });

      brainStage.addEventListener("pointerdown", () => {
        if (!hoveredNode) {
          return;
        }

        if (typeof window.activateWindow === "function") {
          window.activateWindow("window-repos");
        }

        if (typeof window.focusRepoCard === "function") {
          window.focusRepoCard(hoveredNode.userData.key);
        }
      });

      window.addEventListener("resize", resizeScene);
      if (window.ResizeObserver) {
        const observer = new ResizeObserver(resizeScene);
        observer.observe(brainStage);
      }
      resizeScene();

      function animate() {
        requestAnimationFrame(animate);
        brainRoot.rotation.y += 0.0024;
        if (pointerInside) {
          updateHover();
        }
        renderer.render(scene, camera);
      }

      animate();
    }
