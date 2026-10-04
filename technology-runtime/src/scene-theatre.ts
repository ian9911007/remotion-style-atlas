/** Created: 2026-10-04. Hand-authored open Theatre 0.7.2 state; not a claimed Studio export. */
import { getProject } from "@theatre/core";
import * as THREE from "three";
import type { Mount } from "./types";
import { stage, lifecycle, W, H, phase } from "./gpu-common";
import { disposeThree, ownThreeLookupTexture } from "./three-common";

function authoredState(camera: boolean) {
  const tracks: Record<string, number[][]> = camera
    ? {
        azimuth: [
          [0, -0.9],
          [2, -0.1],
          [4.5, 0.8],
          [6, 0.2],
          [8, -0.9],
        ],
        height: [
          [0, 3.3],
          [2, 1.5],
          [4.5, 4.8],
          [6, 2],
          [8, 3.3],
        ],
        focus: [
          [0, -0.8],
          [2, 0.6],
          [4.5, 0],
          [6, -0.6],
          [8, -0.8],
        ],
      }
    : {
        spread: [
          [0, 0],
          [1.5, 0.1],
          [3, 1],
          [5, 1],
          [6.5, 0.2],
          [8, 0],
        ],
        turn: [
          [0, -0.5],
          [2, -0.2],
          [4, 0.7],
          [6, 0.15],
          [8, -0.5],
        ],
        lift: [
          [0, -0.3],
          [2, -0.3],
          [4, 0.35],
          [6, 0.05],
          [8, -0.3],
        ],
      };
  const trackData: Record<string, unknown> = {},
    trackIdByPropPath: Record<string, string> = {};
  Object.entries(tracks).forEach(([name, values]) => {
    const id = `track-${name}`;
    trackIdByPropPath[JSON.stringify([name])] = id;
    trackData[id] = {
      type: "BasicKeyframedTrack",
      keyframes: values!.map(([position, value], index) => ({
        id: `${name}-${index}`,
        position,
        value,
        connectedRight: true,
        handles: [0.3, 0, 0.7, 1],
        type: "bezier",
      })),
    };
  });
  return {
    definitionVersion: "0.4.0",
    revisionHistory: ["atlas-authored-v1"],
    sheetsById: {
      Sequence: {
        staticOverrides: { byObject: {} },
        sequence: {
          type: "PositionalSequence",
          length: 8,
          subUnitsPerUnit: 30,
          tracksByObject: { Rig: { trackData, trackIdByPropPath } },
        },
      },
    },
  };
}
const mount: Mount = async (root, options) => {
  const cameraMode = options.variant === "camera";
  const surface = stage(
    root,
    cameraMode ? "SPATIAL SCORE" : "ASSEMBLY / SCORE",
    cameraMode
      ? "已編排的鏡頭軌道 · 三條關鍵影格曲線"
      : "停留、拆解、旋轉、收合 · 多參數關鍵影格",
    cameraMode ? "#f1eee5" : "#18383d",
    cameraMode ? "#344a48" : "#e5e4c7",
  );
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(W, H);
  renderer.setPixelRatio(1);
  renderer.setClearColor(cameraMode ? "#f1eee5" : "#18383d");
  surface.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(39, W / H, 0.1, 100);
  camera.position.set(5, 3, 7);
  scene.add(new THREE.HemisphereLight("#ffffff", "#8caaa0", 2.2));
  const light = new THREE.DirectionalLight("#ffffff", 3);
  light.position.set(4, 8, 6);
  scene.add(light);
  const group = new THREE.Group();
  scene.add(group);
  const pieces: THREE.Mesh[] = [];
  if (cameraMode) {
    for (let i = 0; i < 9; i++) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 1.3 + (i % 3) * 0.45, 0.65),
        new THREE.MeshStandardMaterial({
          color: ["#a8b9aa", "#d8996f", "#597877"][i % 3],
          roughness: 0.7,
        }),
      );
      mesh.position.set(
        (i % 3) * 1.3 - 1.3,
        -0.4,
        Math.floor(i / 3) * 1.3 - 1.3,
      );
      group.add(mesh);
    }
    const grid = new THREE.GridHelper(12, 24, "#a0aaa1", "#d1d5c9");
    grid.position.y = -1.5;
    scene.add(grid);
  } else {
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(1.3 - i * 0.12, 0.14, 16, 64),
        new THREE.MeshStandardMaterial({
          color: ["#e2b46c", "#88b0a0", "#d6714f"][i % 3],
          metalness: 0.5,
          roughness: 0.25,
        }),
      );
      mesh.rotation.x = Math.PI / 2;
      group.add(mesh);
      pieces.push(mesh);
    }
  }
  const project = getProject(
    `Atlas Theatre ${cameraMode ? "Camera" : "Assembly"}`,
    { state: authoredState(cameraMode) },
  );
  await project.ready;
  const sheet = project.sheet("Sequence");
  const rig = sheet.object(
    "Rig",
    cameraMode
      ? { azimuth: 0, height: 3.3, focus: 0 }
      : { spread: 0, turn: 0, lift: 0 },
  );
  const seek = (time: number) => {
    sheet.sequence.position = phase(time);
    const value = rig.value;
    if (cameraMode) {
      camera.position.set(
        Math.sin(value.azimuth!) * 8,
        value.height!,
        Math.cos(value.azimuth!) * 8,
      );
      camera.lookAt(value.focus!, -0.2, 0);
    } else {
      group.rotation.y = value.turn!;
      group.position.y = value.lift!;
      pieces.forEach((mesh, i) => {
        mesh.position.y = (i - 2.5) * (0.27 + value.spread! * 0.4);
      });
      camera.lookAt(0, 0, 0);
    }
    renderer.render(scene, camera);
  };
  const releaseLookupTexture = ownThreeLookupTexture(scene);
  seek(0);
  return lifecycle(options, seek, () => {
    sheet.sequence.pause();
    sheet.detachObject("Rig");
    releaseLookupTexture();
    disposeThree(scene, renderer);
  });
};
export default mount;
