const canvas = document.querySelector("#orbit-canvas");
const fallback = document.querySelector("#orbit-fallback");
const etaReadout = document.querySelector("#eta-readout");
const windowReadout = document.querySelector("#window-readout");
const designDocList = document.querySelector("#design-doc-list");
const designDocContent = document.querySelector("#design-doc-content");
const designDocMeta = document.querySelector("#design-doc-meta");

const TAU = Math.PI * 2;

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function ellipsePoint(a, e, period, t, phase = 0, tilt = 0) {
  const b = a * Math.sqrt(1 - e * e);
  const theta = (TAU * t) / period + phase;
  const x = Math.cos(theta) * a;
  const z = Math.sin(theta) * b;
  const y = Math.sin(theta) * Math.sin(tilt) * b * 0.35;
  return { x, y, z };
}

async function startOrbitPreview() {
  if (!canvas) return;

  let THREE;
  try {
    THREE = await import("https://unpkg.com/three@0.161.0/build/three.module.js");
  } catch {
    fallback.hidden = false;
    return;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x08111d, 560, 1250);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x08111d, 1);

  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 2400);
  camera.position.set(0, 420, 680);
  camera.lookAt(0, 0, 0);

  const keyLight = new THREE.PointLight(0xffffff, 2.6, 1200);
  keyLight.position.set(-260, 160, 140);
  scene.add(keyLight);
  scene.add(new THREE.AmbientLight(0x8fb7cf, 0.42));

  const stars = createStars(THREE);
  scene.add(stars);

  const earth = makeBody(THREE, 42, 0x2f8fc6, 0.46, 0x86d8ff);
  const moon = makeBody(THREE, 13, 0xc3ccd2, 0.18, 0xffffff);
  const asteroid = makeBody(THREE, 18, 0x9a8e7f, 0.1, 0xffc777, true);
  scene.add(earth, moon, asteroid);

  const earthOrbit = makeOrbit(THREE, 0, 0, 0, 0x3ba6d9);
  const moonOrbit = makeOrbit(THREE, 130, 0.08, 0.18, 0x6ec5e8);
  const asteroidOrbit = makeOrbit(THREE, 285, 0.28, -0.22, 0xd79b3a);
  scene.add(earthOrbit, moonOrbit, asteroidOrbit);

  const transfer = makeTransferArc(THREE);
  scene.add(transfer.line);
  scene.add(transfer.ship);

  const routePulse = new THREE.Mesh(
    new THREE.TorusGeometry(58, 0.7, 8, 96),
    new THREE.MeshBasicMaterial({
      color: 0x1f9bd1,
      transparent: true,
      opacity: 0.32,
    }),
  );
  routePulse.rotation.x = Math.PI / 2;
  scene.add(routePulse);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width));
    const height = Math.max(320, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const start = performance.now();

  function animate(now) {
    const elapsed = (now - start) / 1000;
    const t = elapsed * 0.08;

    earth.rotation.y += 0.004;
    stars.rotation.y += 0.0007;
    routePulse.scale.setScalar(1 + Math.sin(elapsed * 2.2) * 0.035);

    const moonPos = ellipsePoint(130, 0.08, 7.2, t, 0.9, 0.18);
    moon.position.set(moonPos.x, moonPos.y, moonPos.z);

    const asteroidPos = ellipsePoint(285, 0.28, 22, t, 2.2, -0.22);
    asteroid.position.set(asteroidPos.x, asteroidPos.y, asteroidPos.z);
    asteroid.rotation.x += 0.003;
    asteroid.rotation.y += 0.006;

    const cycle = (elapsed % 16) / 16;
    const p = smoothstep(cycle);
    const startPoint = new THREE.Vector3(
      asteroid.position.x,
      asteroid.position.y,
      asteroid.position.z,
    );
    const endPoint = new THREE.Vector3(58, 0, 0);
    const mid = startPoint.clone().lerp(endPoint, p);
    mid.y += Math.sin(p * Math.PI) * 85;
    mid.z += Math.sin(p * Math.PI) * 30;
    transfer.ship.position.copy(mid);
    transfer.ship.lookAt(endPoint);
    transfer.line.geometry.setFromPoints(makeArcPoints(startPoint, endPoint, 44));

    const minutes = Math.max(1, Math.round((1 - cycle) * 12));
    const seconds = Math.max(0, Math.round(((1 - cycle) * 720) % 60));
    etaReadout.textContent = `${minutes}m ${String(seconds).padStart(2, "0")}s`;
    const windowValue = Math.sin(elapsed * 0.35) * 3.5 + 1.5;
    windowReadout.textContent =
      windowValue >= 0
        ? `+${windowValue.toFixed(1)}% / min`
        : `${windowValue.toFixed(1)}% / min`;

    camera.position.x = Math.sin(elapsed * 0.08) * 60;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function makeBody(THREE, radius, color, roughness, emissive, irregular = false) {
  const geometry = irregular
    ? new THREE.IcosahedronGeometry(radius, 3)
    : new THREE.SphereGeometry(radius, 48, 24);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.05,
    emissive,
    emissiveIntensity: irregular ? 0.04 : 0.08,
  });
  return new THREE.Mesh(geometry, material);
}

function makeOrbit(THREE, a, e, tilt, color) {
  if (a === 0) {
    return new THREE.Group();
  }
  const points = [];
  for (let i = 0; i <= 220; i += 1) {
    const theta = (i / 220) * TAU;
    const b = a * Math.sqrt(1 - e * e);
    points.push(
      new THREE.Vector3(
        Math.cos(theta) * a,
        Math.sin(theta) * Math.sin(tilt) * b * 0.35,
        Math.sin(theta) * b,
      ),
    );
  }
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.42,
    }),
  );
}

function makeArcPoints(start, end, count) {
  const points = [];
  for (let i = 0; i <= count; i += 1) {
    const p = i / count;
    const point = start.clone().lerp(end, p);
    point.y += Math.sin(p * Math.PI) * 85;
    point.z += Math.sin(p * Math.PI) * 30;
    points.push(point);
  }
  return points;
}

function makeTransferArc(THREE) {
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 1, 1),
    ]),
    new THREE.LineBasicMaterial({
      color: 0x33c7ff,
      transparent: true,
      opacity: 0.8,
    }),
  );

  const ship = new THREE.Mesh(
    new THREE.ConeGeometry(8, 24, 4),
    new THREE.MeshStandardMaterial({
      color: 0xf6fafc,
      metalness: 0.22,
      roughness: 0.35,
      emissive: 0x1f9bd1,
      emissiveIntensity: 0.12,
    }),
  );
  ship.rotation.x = Math.PI / 2;

  return { line, ship };
}

function createStars(THREE) {
  const geometry = new THREE.BufferGeometry();
  const count = 900;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = 700 + Math.random() * 500;
    const theta = Math.random() * TAU;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xd8edf8,
      size: 1.2,
      transparent: true,
      opacity: 0.7,
    }),
  );
}

startOrbitPreview();
startDesignDocs();

async function startDesignDocs() {
  if (!designDocList || !designDocContent || !designDocMeta) return;

  const docs = [
    {
      id: "overview",
      title: "Design Hub Overview",
      file: "docs/design/README.md",
      summary: "Progressive-disclosure hierarchy and consolidation map.",
    },
    {
      id: "vision",
      title: "01 Vision & Pillars",
      file: "docs/design/01-vision-pillars.md",
      summary: "Core promise, pillars, and visual tone.",
    },
    {
      id: "loops",
      title: "02 Core Loops & Systems",
      file: "docs/design/02-core-loops-systems.md",
      summary: "Gameplay loops, economy constraints, and failure model.",
    },
    {
      id: "ui",
      title: "03 UI North Star",
      file: "docs/design/03-ui-north-star.md",
      summary: "Menus, actions, navigation, and alert interaction standard.",
    },
    {
      id: "stages",
      title: "04 Staged Delivery Plan",
      file: "docs/design/04-staged-delivery-plan.md",
      summary: "Implementation order and vertical-slice definition.",
    },
    {
      id: "risks",
      title: "05 Open Questions & Risks",
      file: "docs/design/05-open-questions-risks.md",
      summary: "Outstanding decisions and mitigation targets.",
    },
    {
      id: "consolidation",
      title: "06 Consolidation Log",
      file: "docs/design/06-consolidation-log.md",
      summary: "Normalized duplicate concepts and active contradiction watchlist.",
    },
  ];

  const selectedFromHash = window.location.hash.replace("#design-", "");
  const initialDoc = docs.find((doc) => doc.id === selectedFromHash) ?? docs[0];

  for (const doc of docs) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "design-doc-button";
    button.textContent = doc.title;
    button.addEventListener("click", () => loadDoc(doc));
    designDocList.appendChild(button);
  }

  await loadDoc(initialDoc, false);
}

async function loadDoc(doc, updateHash = true) {
  for (const button of designDocList.querySelectorAll(".design-doc-button")) {
    button.classList.toggle("active", button.textContent === doc.title);
  }

  designDocMeta.textContent = `${doc.title} — ${doc.summary}`;
  designDocContent.textContent = "Loading markdown...";

  try {
    const [{ marked }, response] = await Promise.all([
      import("https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js"),
      fetch(doc.file),
    ]);
    if (!response.ok) {
      throw new Error(`Failed to load ${doc.file}`);
    }
    const markdown = await response.text();
    designDocContent.innerHTML = marked.parse(markdown);
  } catch (error) {
    designDocContent.innerHTML = `<p>Could not render markdown automatically. Open <a href="${doc.file}">${doc.file}</a> directly.</p>`;
  }

  if (updateHash) {
    history.replaceState(null, "", `#design-${doc.id}`);
  }
}
