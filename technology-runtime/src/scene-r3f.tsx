/** Created: 2026-10-05. React scene ownership and Drei geometry; never-mode render clock. */
import React, { useLayoutEffect, useRef } from "react";
import {
  createRoot,
  extend,
  useFrame,
  type RootState,
} from "@react-three/fiber";
import { RoundedBox, Line } from "@react-three/drei";
import * as THREE from "three";
import type { Mount } from "./types";
import { stage, lifecycle, W, H } from "./gpu-common";
import { ownThreeLookupTexture } from "./three-common";
extend({
  Group: THREE.Group,
  Mesh: THREE.Mesh,
  ExtrudeGeometry: THREE.ExtrudeGeometry,
  HemisphereLight: THREE.HemisphereLight,
  DirectionalLight: THREE.DirectionalLight,
  CylinderGeometry: THREE.CylinderGeometry,
  IcosahedronGeometry: THREE.IcosahedronGeometry,
  SphereGeometry: THREE.SphereGeometry,
  CircleGeometry: THREE.CircleGeometry,
  MeshStandardMaterial: THREE.MeshStandardMaterial,
  PlaneGeometry: THREE.PlaneGeometry,
  TorusGeometry: THREE.TorusGeometry,
});
const mount: Mount = async (root, options) => {
  const furniture = options.variant === "configurator";
  const surface = stage(
    root,
    furniture ? "MODULAR / CONFIGURE" : "ORBITAL MECHANICS",
    furniture
      ? "點選色票 · React 狀態邊界 · 圓角幾何"
      : "場景組件 · 世界座標線條 · 衛星軌道",
    furniture ? "#ebe9e1" : "#e9f0f0",
    furniture ? "#293d33" : "#253e51",
  );
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  surface.append(canvas);
  canvas.setAttribute(
    "aria-label",
    furniture ? "可切換顏色的模組椅 3D 配置" : "三條軌道中的衛星與半透明核心",
  );
  const weaveCanvas = document.createElement("canvas");
  weaveCanvas.width = weaveCanvas.height = 128;
  const weaveContext = weaveCanvas.getContext("2d")!;
  const pixels = weaveContext.createImageData(128, 128);
  for (let y = 0; y < 128; y++)
    for (let x = 0; x < 128; x++) {
      const i = (y * 128 + x) * 4,
        value =
          130 +
          Math.sin((x * Math.PI) / 2) * 28 +
          Math.cos((y * Math.PI) / 2) * 24;
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
      pixels.data[i + 3] = 255;
    }
  weaveContext.putImageData(pixels, 0, 0);
  const weave = new THREE.CanvasTexture(weaveCanvas);
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping;
  weave.repeat.set(5, 5);
  if (furniture) {
    const panel = document.createElement("div");
    panel.style.cssText =
      "position:absolute;right:36px;top:137px;width:173px;color:#45544a;pointer-events:none;z-index:2";
    panel.innerHTML =
      '<div style="font-size:10px;letter-spacing:2px;color:#9c8256">材質配置 / 01</div><div style="font-family:Georgia,serif;font-size:38px;line-height:1.04;letter-spacing:-2px;margin:14px 0 24px">Forma<br>Studio.</div><div style="border-top:1px solid #bfc4b5;padding-top:14px;font-size:11px;line-height:2">雙座模組 · 圓角包覆<br>編織布料 / 實木框架<br>可替換座墊 / 金屬腳套</div><div style="margin-top:30px;padding-top:12px;border-top:1px solid #bfc4b5;font-size:10px;letter-spacing:1px">選擇下方色票<br><span style="display:block;margin-top:6px;opacity:.6">即時更新同一個場景</span></div>';
    root.append(panel);
  }
  let seconds = 0;
  const color = { value: "#627b61", manuallySelected: false };
  const upholsteryPalette = ["#627b61", "#c66b4f", "#354d66"];
  const upholsteryAt = (time: number) => {
    const phase = (((time % 8) + 8) % 8) / 8 * upholsteryPalette.length;
    const index = Math.floor(phase);
    const local = phase - index;
    const blend = THREE.MathUtils.smoothstep(local, 0.76, 1);
    return new THREE.Color(upholsteryPalette[index])
      .lerp(
        new THREE.Color(upholsteryPalette[(index + 1) % upholsteryPalette.length]),
        blend,
      )
      .getStyle();
  };
  let state: RootState | undefined;
  let prepared!: () => void;
  const ready = new Promise<void>((resolve) => {
    prepared = resolve;
  });
  const orbitPaths = [0, 1, 2].map((index) =>
    Array.from({ length: 97 }, (_, i): [number, number, number] => {
      const a = (i / 96) * Math.PI * 2,
        radius = 2.1 + index * 0.5;
      return [
        Math.cos(a) * radius,
        Math.sin(a) * Math.sin(index + 0.3) * 1.2,
        Math.sin(a) * radius,
      ];
    }),
  );
  function Scene() {
    const group = useRef<THREE.Group>(null);
    const satellites = useRef<THREE.Mesh[]>([]);
    useLayoutEffect(() => {
      prepared();
    }, []);
    useFrame(() => {
      if (group.current) {
        group.current.rotation.y = furniture
          ? Math.sin(seconds * 0.4) * 0.45
          : seconds * 0.06;
        if (furniture)
          group.current.traverse((object) => {
            const mesh = object as THREE.Mesh;
            if (
              mesh.userData.fabric &&
              mesh.material instanceof THREE.MeshStandardMaterial
            )
              mesh.material.color.set(color.value);
          });
      }
      satellites.current.forEach((mesh, index) => {
        if (!mesh) return;
        const a = seconds * (0.4 + index * 0.16),
          radius = 2.1 + index * 0.5;
        mesh.position.set(
          Math.cos(a) * radius,
          Math.sin(a) * Math.sin(index + 0.3) * 1.2,
          Math.sin(a) * radius,
        );
      });
    });
    return (
      <>
        <hemisphereLight args={["#ffffff", "#85968d", 2]} />
        <directionalLight
          position={[4, 8, 6]}
          intensity={furniture ? 2.6 : 3}
          castShadow={furniture}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-normalBias={0.035}
        />
        {furniture && (
          <directionalLight
            position={[-4, 3, -2]}
            intensity={0.8}
            color="#e7e7da"
          />
        )}
        <group ref={group} position={[furniture ? -0.65 : 0, -0.35, 0]}>
          {furniture ? (
            <>
              <RoundedBox
                args={[3.6, 0.24, 2.1]}
                radius={0.08}
                position={[0, -0.62, 0]}
                castShadow
                receiveShadow
              >
                <meshStandardMaterial color="#765b3d" roughness={0.58} />
              </RoundedBox>
              {[-0.85, 0.85].map((x) => (
                <React.Fragment key={x}>
                  <RoundedBox
                    args={[1.65, 0.52, 2.05]}
                    radius={0.16}
                    smoothness={4}
                    position={[x, -0.27, 0]}
                    userData={{ fabric: true }}
                    castShadow
                    receiveShadow
                  >
                    <meshStandardMaterial
                      color={color.value}
                      roughness={0.9}
                      bumpMap={weave}
                      bumpScale={0.012}
                    />
                  </RoundedBox>
                  <RoundedBox
                    args={[1.65, 1.45, 0.44]}
                    radius={0.15}
                    smoothness={4}
                    position={[x, 0.65, -0.86]}
                    rotation={[-0.08, 0, 0]}
                    userData={{ fabric: true }}
                    castShadow
                    receiveShadow
                  >
                    <meshStandardMaterial
                      color={color.value}
                      roughness={0.88}
                      bumpMap={weave}
                      bumpScale={0.012}
                    />
                  </RoundedBox>
                  <Line
                    points={[
                      [x - 0.69, -0.2, 1.027],
                      [x + 0.69, -0.2, 1.027],
                    ]}
                    color="#b9c5ac"
                    lineWidth={1}
                  />
                  <Line
                    points={[
                      [x - 0.64, 1.25, -0.62],
                      [x + 0.64, 1.25, -0.62],
                    ]}
                    color="#b9c5ac"
                    lineWidth={1}
                  />
                </React.Fragment>
              ))}
              {[-1.88, 1.88].map((x) => (
                <React.Fragment key={x}>
                  <RoundedBox
                    args={[0.32, 0.42, 2.12]}
                    radius={0.14}
                    position={[x, 0.13, 0]}
                    userData={{ fabric: true }}
                    castShadow
                    receiveShadow
                  >
                    <meshStandardMaterial
                      color={color.value}
                      roughness={0.9}
                      bumpMap={weave}
                      bumpScale={0.012}
                    />
                  </RoundedBox>
                  <RoundedBox
                    args={[0.14, 0.56, 1.8]}
                    radius={0.035}
                    position={[x, -0.28, 0]}
                    castShadow
                  >
                    <meshStandardMaterial color="#795d3e" roughness={0.56} />
                  </RoundedBox>
                </React.Fragment>
              ))}
              {[-1.48, 1.48].flatMap((x) =>
                [-0.73, 0.73].map((z) => (
                  <React.Fragment key={`${x}-${z}`}>
                    <mesh position={[x, -1.07, z]} castShadow>
                      <cylinderGeometry args={[0.09, 0.065, 0.72, 16]} />
                      <meshStandardMaterial color="#6a5038" roughness={0.48} />
                    </mesh>
                    <mesh position={[x, -1.4, z]} castShadow>
                      <cylinderGeometry args={[0.068, 0.068, 0.09, 16]} />
                      <meshStandardMaterial
                        color="#aa8d56"
                        metalness={0.72}
                        roughness={0.3}
                      />
                    </mesh>
                  </React.Fragment>
                )),
              )}
              <RoundedBox
                args={[0.68, 0.75, 0.25]}
                radius={0.14}
                position={[-1.08, 0.39, -0.37]}
                rotation={[-0.26, 0, -0.18]}
                castShadow
              >
                <meshStandardMaterial
                  color="#d4b476"
                  roughness={0.92}
                  bumpMap={weave}
                  bumpScale={0.014}
                />
              </RoundedBox>
              <RoundedBox
                args={[0.59, 0.66, 0.24]}
                radius={0.14}
                position={[1.15, 0.33, -0.34]}
                rotation={[-0.22, 0.15, 0.23]}
                castShadow
              >
                <meshStandardMaterial
                  color="#dedacd"
                  roughness={0.92}
                  bumpMap={weave}
                  bumpScale={0.014}
                />
              </RoundedBox>
            </>
          ) : (
            <>
              <mesh>
                <icosahedronGeometry args={[0.72, 1]} />
                <meshStandardMaterial
                  color="#9cbabc"
                  metalness={0.3}
                  roughness={0.35}
                  flatShading
                />
              </mesh>
              {orbitPaths.map((points, i) => (
                <React.Fragment key={i}>
                  <Line
                    points={points}
                    color={["#315b72", "#ca754c", "#73906e"][i]}
                    lineWidth={1.5}
                  />
                  <mesh
                    ref={(node) => {
                      if (node) satellites.current[i] = node;
                    }}
                  >
                    <sphereGeometry args={[0.13 + i * 0.03, 20, 16]} />
                    <meshStandardMaterial
                      color={["#315b72", "#ca754c", "#73906e"][i]}
                    />
                  </mesh>
                </React.Fragment>
              ))}
            </>
          )}
        </group>
        {furniture && (
          <mesh
            position={[0, -1.82, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#e9e6dc" roughness={1} />
          </mesh>
        )}
        <mesh
          position={[furniture ? -0.65 : 0, furniture ? -1.8 : -1.65, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow={furniture}
        >
          <circleGeometry
            args={[furniture ? 3.15 : 4.2, furniture ? 96 : 64]}
          />
          <meshStandardMaterial
            color={furniture ? "#dedbd1" : "#dce7e7"}
            roughness={1}
            bumpMap={furniture ? weave : undefined}
            bumpScale={furniture ? 0.018 : 0}
          />
        </mesh>
        {furniture &&
          [2.9, 2.95, 3.0].map((r) => (
            <mesh
              key={r}
              position={[-0.65, -1.793, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <torusGeometry args={[r, 0.008, 4, 120]} />
              <meshStandardMaterial color="#bab4a2" roughness={1} />
            </mesh>
          ))}
      </>
    );
  }
  const fiberRoot = createRoot(canvas);
  await fiberRoot.configure({
    frameloop: "never",
    shadows: furniture ? "soft" : false,
    dpr: 1,
    size: { width: W, height: H, top: 0, left: 0 },
    gl: { antialias: true, preserveDrawingBuffer: true, alpha: true },
    camera: {
      position: furniture ? [6.2, 3.4, 7.5] : [6, 5, 7],
      fov: furniture ? 39 : 37,
    },
    onCreated: (value) => {
      state = value;
      value.camera.lookAt(0, furniture ? -0.1 : 0, 0);
      if (furniture) {
        value.gl.toneMapping = THREE.ACESFilmicToneMapping;
        value.gl.toneMappingExposure = 1.2;
      }
    },
  });
  fiberRoot.render(<Scene />);
  await ready;
  const controls = document.createElement("div");
  const handlers: { button: HTMLButtonElement; callback: () => void }[] = [];
  if (furniture) {
    Object.assign(controls.style, {
      position: "absolute",
      left: "38px",
      bottom: "32px",
      display: "flex",
      gap: "12px",
    });
    ["#627b61", "#c66b4f", "#354d66"].forEach((hex, index) => {
      const button = document.createElement("button");
      button.textContent = ["苔綠", "陶土", "深藍"][index];
      button.setAttribute("aria-pressed", "false");
      Object.assign(button.style, {
        background: hex,
        color: "white",
        border: "2px solid white",
        borderRadius: "18px",
        padding: "10px 18px",
        fontSize: "13px",
        cursor: "pointer",
      });
      const callback = () => {
        color.manuallySelected = true;
        color.value = hex;
        controls.querySelectorAll("button").forEach((candidate, candidateIndex) => {
          candidate.setAttribute(
            "aria-pressed",
            candidateIndex === index ? "true" : "false",
          );
        });
        state?.advance(seconds, false);
      };
      button.addEventListener("click", callback);
      handlers.push({ button, callback });
      controls.append(button);
    });
    root.append(controls);
  }
  const seek = (time: number) => {
    if (time < seconds) color.manuallySelected = false;
    seconds = time;
    if (!color.manuallySelected) color.value = upholsteryAt(time);
    state?.advance(time, false);
  };
  const releaseLookupTexture = state
    ? ownThreeLookupTexture(state.scene)
    : () => {};
  seek(0);
  return lifecycle(options, seek, () => {
    releaseLookupTexture();
    handlers.forEach(({ button, callback }) =>
      button.removeEventListener("click", callback),
    );
    handlers.length = 0;
    controls.replaceChildren();
    controls.remove();
    state?.scene.traverse((object) => {
      if (object instanceof THREE.DirectionalLight) object.shadow.dispose();
    });
    fiberRoot.unmount();
    weave.dispose();
    weaveCanvas.width = weaveCanvas.height = 0;
    state?.gl.dispose();
    state?.gl.forceContextLoss();
    canvas.remove();
  });
};
export default mount;
