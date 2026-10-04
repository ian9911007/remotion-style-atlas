/** Created: 2026-10-04. Instance mode, seeded noise and explicit noLoop/redraw ownership. */
import p5 from "p5";
import type { Mount } from "./types";
import { stage, lifecycle, W, H } from "./gpu-common";
const mount: Mount = async (root, options) => {
  const flow = options.variant === "flow";
  const surface = stage(
    root,
    flow ? "FIELD NOTES / 42" : "HARMONIC GARDEN",
    flow ? "種子噪聲 · 積分流線 · 等時快照" : "極座標 · 諧波 · 生成式版面",
    flow ? "#f5f0df" : "#f2ddd5",
    flow ? "#28473e" : "#702c3d",
  );
  // p5.describe uses document-level ID lookup; native ARIA below supports Shadow DOM isolation.
  let time = 0,
    ready!: () => void;
  const prepared = new Promise<void>((resolve) => {
    ready = resolve;
  });
  // The host uses a disposable realm for this version; remove() alone does not clear its Color prototype wrappers.
  const instance = new p5((p) => {
    p.setup = () => {
      const drawing = p.createCanvas(W, H);
      p.pixelDensity(1);
      p.noLoop();
      p.noiseSeed(42);
      p.randomSeed(42);
      drawing.elt.setAttribute("role", "img");
      drawing.elt.setAttribute(
        "aria-label",
        flow
          ? "褐綠色的生成式流線，在米色底上形成有機地貌"
          : "十二組玫瑰曲線依數學參數緩慢變形",
      );
      ready();
    };
    p.draw = () => {
      p.background(flow ? "#f5f0df" : "#f2ddd5");
      p.noFill();
      if (flow) {
        for (let line = 0; line < 85; line++) {
          let x = 70 + (line % 17) * 49,
            y = 135 + Math.floor(line / 17) * 72;
          p.stroke(line % 5 ? "#407661" : "#b3653d");
          p.strokeWeight(line % 5 ? 1.1 : 2.2);
          p.beginShape();
          for (let j = 0; j < 75; j++) {
            if (x < 30 || x > 930 || y < 115 || y > 515) break;
            p.vertex(x, y);
            const angle =
              (p.noise(x * 0.0028, y * 0.0028, time * 0.075) - 0.5) * 7;
            x += Math.cos(angle) * 2.2;
            y += Math.sin(angle) * 2.2;
          }
          p.endShape();
        }
      } else {
        for (let item = 0; item < 12; item++) {
          const cx = 147 + (item % 4) * 223,
            cy = 182 + Math.floor(item / 4) * 132;
          p.stroke(["#8e3849", "#aa613d", "#405f55"][item % 3]);
          p.strokeWeight(1.1);
          p.beginShape();
          const petals = 2 + (item % 5),
            modulation = Math.sin(time * 0.4 + item) * 0.18;
          for (let j = 0; j <= 500; j++) {
            const theta = (j / 500) * Math.PI * 4;
            const r =
              44 * Math.cos(petals * theta + modulation) +
              10 * Math.sin(7 * theta + time * 0.35);
            p.vertex(cx + r * Math.cos(theta), cy + r * Math.sin(theta));
          }
          p.endShape();
          p.noStroke();
          p.fill("#702c3d");
          p.textSize(10);
          p.text(`F / ${String(item + 1).padStart(2, "0")}`, cx - 12, cy + 62);
          p.noFill();
        }
      }
    };
  }, surface);
  await prepared;
  const seek = async (seconds: number) => {
    time = seconds;
    await instance.redraw();
  };
  await seek(0);
  return lifecycle(options, seek, () => {
    void instance.remove();
    surface.replaceChildren();
  });
};
export default mount;
