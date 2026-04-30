import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  KEPLER,
  keplerEllipsePoints,
  keplerPosition,
  keplerViewBound,
  shipKeplerPosition,
} from "../../game/kepler";
import type { BodyId } from "../../game/state";
import type { MapRendererProps } from "./registry";

/**
 * True 3D ecliptic view. The same Kepler solver as the 2D tab — but here
 * inclination is honored, so the lunar habitat tilts off the Earth-Moon
 * plane and NEA-04 swings up and back through the ecliptic over its orbit.
 *
 * Camera is a slow auto-orbit around the system, with mouse-drag override.
 * No external OrbitControls dependency — the interaction model is small
 * enough to inline.
 */
export function ThreeOrbitalMap({ state, selectedBodyId, onSelectBody }: MapRendererProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const selRef = useRef(selectedBodyId);
  stateRef.current = state;
  selRef.current = selectedBodyId;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    const W = () => container.clientWidth;
    const H = 480;
    renderer.setSize(W(), H);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090f);
    const camera = new THREE.PerspectiveCamera(45, W() / H, 0.1, 5000);

    // Camera state — spherical coords around the origin
    let camYaw = Math.PI * 0.25;
    let camPitch = Math.PI * 0.28;
    const bound = keplerViewBound() + 30;
    let camR = bound * 1.55;
    const updateCam = () => {
      camera.position.set(
        camR * Math.cos(camPitch) * Math.cos(camYaw),
        camR * Math.sin(camPitch),
        camR * Math.cos(camPitch) * Math.sin(camYaw),
      );
      camera.lookAt(0, 0, 0);
    };
    updateCam();

    // Ambient + sun light
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const sunLight = new THREE.PointLight(0xffe39a, 1.6, 0, 2);
    scene.add(sunLight);

    // Sun
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(4, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xffd86b }),
    );
    scene.add(sunMesh);
    // Sun glow sprite
    const glowGeo = new THREE.SphereGeometry(11, 24, 24);
    const glowMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { c: { value: new THREE.Color(0xffe39a) } },
      vertexShader: `
        varying vec3 vN;
        void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
      `,
      fragmentShader: `
        varying vec3 vN; uniform vec3 c;
        void main() {
          float intensity = pow(0.6 - dot(vN, vec3(0.0,0.0,1.0)), 2.0);
          gl_FragColor = vec4(c, intensity * 0.8);
        }
      `,
    });
    scene.add(new THREE.Mesh(glowGeo, glowMat));

    // Star field (background sphere with sprites)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 600;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 1500;
      const phi = Math.acos(1 - 2 * Math.random());
      const theta = 2 * Math.PI * Math.random();
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: false, transparent: true, opacity: 0.7 }),
    );
    scene.add(stars);

    // Orbit ring meshes — one Line per body, parented as a Group so we can
    // re-position dynamically each frame for nested orbits.
    const orbitGroups: Record<string, THREE.Group> = {};
    const orbitLines: Record<string, THREE.Line> = {};
    for (const bid of Object.keys(KEPLER) as BodyId[]) {
      const el = KEPLER[bid];
      const pts = keplerEllipsePoints(el, 256);
      const geo = new THREE.BufferGeometry().setFromPoints(
        pts.map((p) => new THREE.Vector3(p.x, p.z, p.y)), // map ecliptic to XZ in three-space; z up
      );
      const mat = new THREE.LineBasicMaterial({ color: 0x4cd1d8, transparent: true, opacity: 0.35 });
      const line = new THREE.LineLoop(geo, mat);
      const grp = new THREE.Group();
      grp.add(line);
      scene.add(grp);
      orbitGroups[bid] = grp;
      orbitLines[bid] = line;
    }

    // Body meshes
    const bodyMeshes: Record<string, THREE.Mesh> = {};
    const bodyConf: Record<BodyId, { color: number; r: number }> = {
      earth: { color: 0x5fb3ff, r: 2.4 },
      moon: { color: 0xc9d2dc, r: 1.2 },
      nea_04: { color: 0xa8896a, r: 1.0 },
      lunar_habitat: { color: 0x6cd07a, r: 0.7 },
    };
    for (const bid of Object.keys(bodyConf) as BodyId[]) {
      const conf = bodyConf[bid];
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(conf.r, 18, 18),
        new THREE.MeshStandardMaterial({ color: conf.color, emissive: conf.color, emissiveIntensity: 0.3, roughness: 0.7 }),
      );
      mesh.userData = { bodyId: bid };
      scene.add(mesh);
      bodyMeshes[bid] = mesh;
    }

    // Selection ring
    const selRing = new THREE.Mesh(
      new THREE.RingGeometry(3.5, 4, 48),
      new THREE.MeshBasicMaterial({ color: 0x4cd1d8, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }),
    );
    scene.add(selRing);

    // Ship glyphs as cones
    const shipMeshes: Record<string, THREE.Mesh> = {};
    const ensureShipMesh = (id: string) => {
      if (shipMeshes[id]) return shipMeshes[id];
      const m = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 1.6, 8),
        new THREE.MeshBasicMaterial({ color: 0x4cd1d8 }),
      );
      m.userData = { shipId: id };
      scene.add(m);
      shipMeshes[id] = m;
      return m;
    };

    // Mouse drag → camera orbit
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      (e.target as Element).setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      camYaw -= dx * 0.005;
      camPitch = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, camPitch - dy * 0.005));
    };
    const onUp = () => (dragging = false);
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camR = Math.max(40, Math.min(1500, camR * (1 + e.deltaY * 0.001)));
    };
    const onClick = (e: MouseEvent) => {
      if (Math.abs(e.movementX) + Math.abs(e.movementY) > 4) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const hits = raycaster.intersectObjects(Object.values(bodyMeshes), false);
      if (hits.length > 0) {
        const bid = hits[0].object.userData.bodyId as BodyId;
        if (bid) onSelectBody(bid);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
    renderer.domElement.addEventListener("click", onClick);

    let raf = 0;
    const tick = () => {
      const s = stateRef.current;
      const sel = selRef.current;
      // Slow auto-rotate when not dragging
      if (!dragging) camYaw += 0.0006;
      updateCam();

      // Orbit groups follow their parent bodies (Moon/habitat orbits move with Earth/Moon)
      for (const bid of Object.keys(KEPLER) as BodyId[]) {
        const el = KEPLER[bid];
        const parent = el.parent === "sun" ? { x: 0, y: 0, z: 0 } : keplerPosition(s, el.parent);
        orbitGroups[bid].position.set(parent.x, parent.z, parent.y);
        orbitLines[bid].visible = !(bid === "lunar_habitat" && !s.populations.lunar_habitat);
      }

      // Body positions
      let selPos: THREE.Vector3 | null = null;
      for (const bid of Object.keys(bodyMeshes) as BodyId[]) {
        const visible = !(bid === "lunar_habitat" && !s.populations.lunar_habitat);
        bodyMeshes[bid].visible = visible;
        if (!visible) continue;
        const p = keplerPosition(s, bid);
        bodyMeshes[bid].position.set(p.x, p.z, p.y); // ecliptic-Z up convention
        if (sel === bid) selPos = bodyMeshes[bid].position.clone();
      }

      if (selPos) {
        selRing.position.copy(selPos);
        selRing.lookAt(camera.position);
        selRing.visible = true;
      } else {
        selRing.visible = false;
      }

      // Ship glyphs
      const liveShipIds = new Set<string>();
      for (const ship of s.ships) {
        liveShipIds.add(ship.id);
        const mesh = ensureShipMesh(ship.id);
        const pos = shipKeplerPosition(s, ship);
        mesh.position.set(pos.x, pos.z, pos.y);
        if (ship.route) {
          const to = keplerPosition(s, ship.route.toBodyId);
          // Orient the cone along the velocity vector toward the destination
          const dir = new THREE.Vector3(to.x - pos.x, to.z - pos.z, to.y - pos.y).normalize();
          const up = new THREE.Vector3(0, 1, 0);
          const q = new THREE.Quaternion().setFromUnitVectors(up, dir);
          mesh.quaternion.copy(q);
          mesh.visible = true;
        } else {
          mesh.visible = false;
        }
      }
      for (const [id, mesh] of Object.entries(shipMeshes)) {
        if (!liveShipIds.has(id)) {
          scene.remove(mesh);
          delete shipMeshes[id];
        }
      }

      // Resize check
      if (renderer.domElement.width !== W() * window.devicePixelRatio) {
        renderer.setSize(W(), H);
        camera.aspect = W() / H;
        camera.updateProjectionMatrix();
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [onSelectBody]);

  return <div ref={containerRef} style={{ width: "100%", height: 480 }} />;
}
