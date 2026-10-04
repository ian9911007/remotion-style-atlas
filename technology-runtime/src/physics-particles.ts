/** Created: 2026-10-04. tsParticles 4.4 explicit particle positions, no autonomous RAF. */
import { tsParticles } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import type { Mount } from "./types";
import { stage, lifecycle, W, H, seeded } from "./gpu-common";
const registered = loadSlim(tsParticles);
const mount: Mount = async (root, options) => {
  const network = options.variant === "network";
  const surface = stage(
    root,
    network ? "CONNECTED FIELD" : "CELEBRATION SYSTEM",
    network
      ? "鄰近連線 · 指標排斥 · 有界粒子集合"
      : "形狀粒子 · 分批拋射 · 點選改變中心",
    network ? "#173f49" : "#faf0da",
    network ? "#e8ead3" : "#573c58",
  );
  const engine = tsParticles;
  await registered;
  const container = await engine.load({
    element: surface,
    options: {
      autoPlay: false,
      fullScreen: false,
      detectRetina: false,
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
      fpsLimit: 60,
      background: { color: network ? "#173f49" : "#faf0da" },
      particles: {
        number: { value: 0 },
        move: { enable: false },
        paint: { color: { value: network ? "#e8d598" : "#ce5e68" } },
        size: { value: network ? 3 : 5 },
        opacity: { value: 0.9 },
        shape: { type: network ? "circle" : "square" },
        links: {
          enable: network,
          distance: 115,
          color: "#8ab6b3",
          opacity: 0.5,
          width: 1,
        },
        rotate: { value: 0, animation: { enable: false } },
      },
    },
  });
  if (!container)
    throw new Error("tsParticles container initialization failed");
  container.pause();
  const count = network ? 90 : 150;
  for (let i = 0; i < count; i++)
    container.particles.addParticle(
      { x: W * seeded(i), y: H * seeded(i + 900) },
      {
        paint: {
          color: {
            value: network
              ? "#ead49a"
              : ["#ce5e68", "#417f80", "#e2ad42", "#785a94"][i % 4],
          },
        },
        size: { value: network ? 2.5 : 5 + (i % 5) },
      },
    );
  const canvas = container.canvas.domElement;
  if (!canvas) {
    container.destroy();
    throw new Error("tsParticles DOM canvas unavailable");
  }
  container.canvas.setPointerEvents("auto");
  canvas.style.touchAction = network ? "none" : "manipulation";
  canvas.tabIndex = 0;
  canvas.setAttribute(
    "aria-label",
    network
      ? "鄰近連線粒子；移動指標或按方向鍵移動排斥中心"
      : "粒子彩紙；點選或按方向鍵改變拋射中心",
  );
  let pointer = { x: 480, y: network ? 300 : 455 },
    active = false;
  const point = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer = {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H,
    };
    active = true;
  };
  const leave = (event: PointerEvent) => {
    if (event.pointerType === "mouse") active = false;
  };
  const key = (event: KeyboardEvent) => {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.code)
    )
      return;
    event.preventDefault();
    active = true;
    pointer.x = Math.min(
      850,
      Math.max(
        100,
        pointer.x +
          (event.code === "ArrowRight"
            ? 30
            : event.code === "ArrowLeft"
              ? -30
              : 0),
      ),
    );
    pointer.y = Math.min(
      475,
      Math.max(
        150,
        pointer.y +
          (event.code === "ArrowDown"
            ? 30
            : event.code === "ArrowUp"
              ? -30
              : 0),
      ),
    );
  };
  canvas.addEventListener("pointerdown", point);
  if (network) canvas.addEventListener("pointermove", point);
  canvas.addEventListener("pointerleave", leave);
  canvas.addEventListener("keydown", key);
  const seek = (time: number) => {
    for (let i = 0; i < count; i++) {
      const particle = container.particles.get(i);
      if (!particle) continue;
      if (network) {
        let x = 65 + seeded(i) * 830 + Math.sin(time * 0.45 + i) * 22,
          y = 120 + seeded(i + 900) * 365 + Math.cos(time * 0.5 + i) * 18;
        const dx = x - pointer.x,
          dy = y - pointer.y,
          distance = Math.hypot(dx, dy);
        if (active && distance < 110 && distance > 0) {
          x += (dx / distance) * (110 - distance) * 0.65;
          y += (dy / distance) * (110 - distance) * 0.65;
        }
        particle.position.x = x;
        particle.position.y = y;
      } else {
        const age = (time + (i % 3) * 1.2) % 4,
          vx = (seeded(i + 1) - 0.5) * 270,
          vy = -260 - seeded(i + 50) * 160;
        particle.position.x = pointer.x + vx * age;
        particle.position.y = pointer.y + vy * age + 95 * age * age;
        particle.rotation = i + age * (i % 2 ? 3 : -2);
        if (particle.opacity) particle.opacity.value = Math.max(0, 1 - age / 4);
      }
    }
    // v4's public RenderManager applies plugin updates and drawing without scheduling RAF.
    container.canvas.render.drawParticles({ value: 0, factor: 0 });
  };
  seek(0);
  return lifecycle(options, seek, () => {
    canvas.removeEventListener("pointerdown", point);
    canvas.removeEventListener("pointermove", point);
    canvas.removeEventListener("pointerleave", leave);
    canvas.removeEventListener("keydown", key);
    container.destroy();
    surface.replaceChildren();
  });
};
export default mount;
