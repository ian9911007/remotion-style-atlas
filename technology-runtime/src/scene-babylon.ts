/** Created: 2026-10-04. Babylon manual scene render; picking and thin-instance matrix buffers. */
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  DirectionalLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  Matrix,
  Quaternion,
} from "@babylonjs/core";
import type { Mount } from "./types";
import { stage, lifecycle, W, H } from "./gpu-common";
const mount: Mount = async (root, options) => {
  const picking = options.variant === "picking";
  const surface = stage(
    root,
    picking ? "MATERIAL LIBRARY" : "CITY / SIGNAL",
    picking
      ? "點選物件 · 場景拾取 · 材質狀態"
      : "900 個薄實例 · 矩陣緩衝區 · 波形高度",
    picking ? "#dce4e2" : "#f0e8d8",
    "#253c3d",
  );
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  surface.append(canvas);
  const engine = new Engine(
    canvas,
    true,
    { preserveDrawingBuffer: true, stencil: true },
    false,
  );
  engine.setHardwareScalingLevel(1);
  const scene = new Scene(engine);
  scene.clearColor = Color4.FromHexString(picking ? "#dce4e2ff" : "#f0e8d8ff");
  const camera = new ArcRotateCamera(
    "camera",
    -Math.PI / 2.5,
    1.05,
    picking ? 12 : 23,
    new Vector3(0, 0.4, 0),
    scene,
  );
  new HemisphericLight("sky", new Vector3(0, 1, 0), scene).intensity = 0.85;
  const key = new DirectionalLight("key", new Vector3(-1, -2, -1), scene);
  key.intensity = 1.6;
  const colors = ["#df8d56", "#517f7d", "#8a79a2", "#d4bf73", "#59768d"];
  const materials = colors.map((hex, i) => {
    const material = new StandardMaterial(`material-${i}`, scene);
    material.diffuseColor = Color3.FromHexString(hex);
    material.specularColor = new Color3(0.3, 0.3, 0.3);
    return material;
  });
  const objects = picking
    ? colors.map((_, i) => {
        const mesh =
          i % 2
            ? MeshBuilder.CreateTorus(
                `sample-${i}`,
                { diameter: 1.5, thickness: 0.42, tessellation: 48 },
                scene,
              )
            : MeshBuilder.CreatePolyhedron(
                `sample-${i}`,
                { type: i % 3, size: 0.85 },
                scene,
              );
        mesh.position.set((i - 2) * 2.1, 0, 0);
        mesh.material = materials[i];
        return mesh;
      })
    : [];
  const building = !picking
    ? MeshBuilder.CreateBox("building", { size: 1 }, scene)
    : undefined;
  const matrices = new Float32Array(900 * 16);
  if (building) {
    building.material = materials[1];
    building.thinInstanceSetBuffer("matrix", matrices, 16, false);
  }
  const floor = MeshBuilder.CreateGround(
    "floor",
    { width: picking ? 14 : 19, height: picking ? 6 : 15 },
    scene,
  );
  floor.position.y = -1.15;
  const floorMaterial = new StandardMaterial("floor-material", scene);
  floorMaterial.diffuseColor = Color3.FromHexString(
    picking ? "#c5d2cf" : "#e0d6c1",
  );
  floor.material = floorMaterial;
  let selected = 1,
    lastTime = 0;
  const choose = () =>
    objects.forEach((mesh, i) => {
      const material = mesh.material as StandardMaterial;
      material.emissiveColor =
        i === selected ? new Color3(0.19, 0.13, 0.03) : Color3.Black();
    });
  const pointer = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const hit = scene.pick(
      ((event.clientX - rect.left) / rect.width) * W,
      ((event.clientY - rect.top) / rect.height) * H,
    );
    if (hit?.pickedMesh) {
      const i = objects.indexOf(hit.pickedMesh as (typeof objects)[number]);
      if (i >= 0) {
        selected = i;
        choose();
        scene.render();
      }
    }
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.code === "ArrowRight" || event.code === "ArrowLeft") {
      event.preventDefault();
      selected = (selected + (event.code === "ArrowRight" ? 1 : 4)) % 5;
      choose();
      scene.render();
    }
  };
  if (picking) {
    canvas.tabIndex = 0;
    canvas.addEventListener("pointerdown", pointer);
    canvas.addEventListener("keydown", keydown);
  }
  canvas.setAttribute(
    "aria-label",
    picking
      ? "五種 3D 材質樣本；點選或使用左右方向鍵選取"
      : "900 個程序式建築實例呈現波浪高度",
  );
  choose();
  await scene.whenReadyAsync();
  const seek = (time: number) => {
    lastTime = time;
    if (picking)
      objects.forEach((mesh, i) => {
        mesh.rotation.y = time * 0.27 + i;
        mesh.rotation.z = Math.sin(time * 0.5 + i) * 0.12;
        mesh.position.y = i === selected ? 0.45 + Math.sin(time) * 0.06 : 0;
      });
    else if (building) {
      for (let i = 0; i < 900; i++) {
        const x = (i % 30) - 14.5,
          z = Math.floor(i / 30) - 14.5;
        const height =
          0.4 + (Math.sin(Math.sqrt(x * x + z * z) * 0.45 - time) + 1) * 1.1;
        Matrix.Compose(
          new Vector3(0.34, height, 0.34),
          Quaternion.Identity(),
          new Vector3(x * 0.48, height / 2 - 1.1, z * 0.4),
        ).copyToArray(matrices, i * 16);
      }
      building.thinInstanceBufferUpdated("matrix");
      building.thinInstanceRefreshBoundingInfo();
      camera.alpha = -Math.PI / 2.5 + Math.sin(time * 0.2) * 0.2;
    }
    scene.render();
  };
  seek(lastTime);
  return lifecycle(options, seek, () => {
    canvas.removeEventListener("pointerdown", pointer);
    canvas.removeEventListener("keydown", keydown);
    scene.dispose();
    engine.dispose();
    canvas.remove();
  });
};
export default mount;
