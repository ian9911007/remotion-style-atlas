/** Created: 2026-10-04. Three.js procedural product and instanced scientific field. */
import * as THREE from "three";
import type { Mount } from "./types";
import { stage, lifecycle, W, H, phase } from "./gpu-common";

import { disposeThree, ownThreeLookupTexture } from "./three-common";

const mount: Mount = async (root, options) => {
  const product = options.variant === "product";
  const surface = stage(
    root,
    product ? "FORM / 01" : "WAVE / LATTICE",
    product ? "精密聲學模組 · 分層結構" : "600 個實例 · 單一幾何 · 解析式波場",
    product ? "#f0ede7" : "#092932",
    product ? "#303c3b" : "#e4f3e7",
  );
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(W, H);
  renderer.setPixelRatio(1);
  renderer.setClearColor(product ? "#f0ede7" : "#092932");
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  if (product) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
  }
  surface.append(renderer.domElement);
  renderer.domElement.setAttribute(
    "aria-label",
    product ? "旋轉與拆解的程序式音響模組" : "600 個柱狀實例組成的動態波面",
  );
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
  camera.position.set(product ? 7 : 13, product ? 4 : 11, product ? 9 : 13);
  if (product) camera.position.set(4.5, 3.8, 8.2);
  camera.lookAt(0, product ? 0.22 : 0.3, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8b918d, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 3);
  key.position.set(4, 7, 5);
  scene.add(key);
  if (product) {
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, {
      left: -6,
      right: 6,
      top: 7,
      bottom: -5,
    });
    key.shadow.normalBias = 0.035;
    const fill = new THREE.DirectionalLight("#e6eeed", 1.3);
    fill.position.set(-5, 3, -3);
    scene.add(fill);
    groupProductDetails();
  }
  function groupProductDetails() {
    const panel = document.createElement("div");
    panel.style.cssText =
      "position:absolute;right:40px;top:145px;width:176px;z-index:2;pointer-events:none;color:#44514b";
    panel.innerHTML = `<div style="font-size:10px;letter-spacing:3px;color:#8a7959;margin-bottom:22px">結構剖析 / 05</div>${["微孔聲學面板", "隔振密封環", "雙層共振腔", "精密金屬框", "懸浮底座"].map((name, i) => `<div style="border-top:1px solid #bcbcaf;padding:12px 0;font-size:12px;letter-spacing:1px"><span style="font-size:10px;color:#9a8051;margin-right:15px">0${i + 1}</span>${name}</div>`).join("")}<div style="font-size:10px;line-height:1.8;margin-top:15px;opacity:.7">程序建模 · 結構示意<br>旋轉檢視 / 分層拆解</div>`;
    root.append(panel);
    const footer = document.createElement("div");
    footer.style.cssText =
      "position:absolute;left:38px;bottom:30px;z-index:2;pointer-events:none;display:flex;gap:32px;color:#536057;font-size:10px;letter-spacing:1px";
    footer.innerHTML =
      '<span style="border-left:3px solid #b7945d;padding-left:12px">霧面鋁合金<br><b style="display:block;margin-top:6px;font-size:14px;letter-spacing:2px">FORM ACOUSTICS</b></span><span style="line-height:1.9;opacity:.65">可分離零件結構<br>原創程序幾何 / 01</span>';
    root.append(footer);
  }
  const group = new THREE.Group();
  group.position.y = -0.4;
  if (product) group.position.x = -0.8;
  scene.add(group);
  const pieces: THREE.Mesh[] = [];
  let instances: THREE.InstancedMesh | undefined;
  if (product) {
    const profiles: [number, number, string, number][] = [
      [1.52, 0.24, "#36443d", -0.97],
      [1.47, 0.08, "#b89456", -0.8],
      [1.43, 0.9, "#65786d", -0.3],
      [1.47, 0.08, "#b89456", 0.2],
      [1.51, 0.17, "#35483e", 0.34],
    ];
    const gold = new THREE.MeshStandardMaterial({
      color: "#c5ab73",
      metalness: 0.72,
      roughness: 0.3,
    });
    const charcoal = new THREE.MeshStandardMaterial({
      color: "#24372e",
      roughness: 0.7,
    });
    const addRing = (
      parent: THREE.Object3D,
      radius: number,
      width: number,
      y: number,
      material: THREE.Material,
    ) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, width, 8, 96),
        material,
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y;
      parent.add(ring);
      return ring;
    };
    profiles.forEach(([radius, height, color, baseY], index) => {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, height, 96),
        new THREE.MeshStandardMaterial({
          color,
          metalness: index % 2 ? 0.75 : 0.28,
          roughness: index === 2 ? 0.6 : 0.33,
        }),
      );
      mesh.userData.baseY = baseY;
      mesh.position.y = baseY;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      pieces.push(mesh);
      if (index === 2) {
        // Close-set ribs make the acoustic chamber read as engineered hardware.
        for (let i = 0; i < 96; i++) {
          const a = (i * Math.PI * 2) / 96;
          const rib = new THREE.Mesh(
            new THREE.BoxGeometry(0.018, 0.72, 0.03),
            charcoal,
          );
          rib.position.set(Math.cos(a) * 1.434, 0, Math.sin(a) * 1.434);
          rib.rotation.y = -a;
          mesh.add(rib);
        }
        addRing(mesh, 1.438, 0.025, -0.4, gold);
        addRing(mesh, 1.438, 0.025, 0.4, gold);
      }
      if (index === 0 || index === 4) {
        addRing(mesh, radius - 0.08, 0.018, height / 2 + 0.008, gold);
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const screw = new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.045, 0.014, 12),
            gold,
          );
          screw.position.set(
            Math.cos(a) * 1.29,
            height / 2 + 0.014,
            Math.sin(a) * 1.29,
          );
          mesh.add(screw);
        }
      }
    });
    const face = pieces[4];
    const perforations = new THREE.InstancedMesh(
      new THREE.CircleGeometry(0.023, 6),
      charcoal,
      217,
    );
    const dot = new THREE.Object3D();
    let count = 0;
    for (let row = -8; row <= 8; row++)
      for (let col = -8; col <= 8; col++) {
        const x = col * 0.12 + (row % 2) * 0.06,
          z = row * 0.104;
        if (x * x + z * z > 0.95 || count >= 217) continue;
        dot.position.set(x, 0.088, z);
        dot.rotation.x = -Math.PI / 2;
        dot.updateMatrix();
        perforations.setMatrixAt(count++, dot.matrix);
      }
    perforations.count = count;
    face.add(perforations);
    addRing(face, 1.12, 0.025, 0.092, gold);
    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(2.0, 2.12, 0.14, 96),
      new THREE.MeshStandardMaterial({ color: "#dedbd2", roughness: 0.9 }),
    );
    foot.position.set(-0.8, -1.62, 0);
    foot.receiveShadow = true;
    foot.castShadow = true;
    scene.add(foot);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: "#efede7", roughness: 1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.71;
    floor.receiveShadow = true;
    scene.add(floor);
  } else {
    instances = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.3, 1, 0.3),
      new THREE.MeshStandardMaterial({ roughness: 0.48, metalness: 0.22 }),
      600,
    );
    const color = new THREE.Color();
    for (let i = 0; i < 600; i++)
      instances.setColorAt(i, color.setHSL(0.38 + (i % 30) / 110, 0.5, 0.48));
    group.add(instances);
    const grid = new THREE.GridHelper(14, 30, "#3c7e7c", "#205055");
    grid.position.y = -1.5;
    scene.add(grid);
  }
  const dummy = new THREE.Object3D();
  const seek = (seconds: number) => {
    const t = phase(seconds);
    if (product) {
      const explode = Math.pow(Math.sin((Math.PI * t) / 8), 2);
      pieces.forEach((piece, i) => {
        piece.position.y = piece.userData.baseY + i * explode * 0.46;
      });
      group.rotation.y = t * 0.35;
      group.rotation.z = Math.sin(t * 0.6) * 0.08;
    } else if (instances) {
      for (let i = 0; i < 600; i++) {
        const x = ((i % 30) - 14.5) * 0.38,
          z = (Math.floor(i / 30) - 9.5) * 0.38;
        const height =
          1.3 +
          Math.sin(x * 0.8 + t * 1.1) * 0.65 +
          Math.cos(z + t * 0.8) * 0.55;
        dummy.position.set(x, height / 2 - 1.3, z);
        dummy.scale.set(1, height, 1);
        dummy.updateMatrix();
        instances.setMatrixAt(i, dummy.matrix);
      }
      instances.instanceMatrix.needsUpdate = true;
      group.rotation.y = Math.sin(t * 0.3) * 0.18;
    }
    renderer.render(scene, camera);
  };
  const releaseLookupTexture = ownThreeLookupTexture(scene);
  seek(0);
  return lifecycle(options, seek, () => {
    releaseLookupTexture();
    key.shadow.dispose();
    disposeThree(scene, renderer);
  });
};
export default mount;
