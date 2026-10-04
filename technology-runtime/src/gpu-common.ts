/** Created: 2026-10-04. Original procedural artwork; no external assets. */
import type { MountOptions, RuntimeHandle } from "./types";

export const W = 960;
export const H = 540;
export const TAU = Math.PI * 2;
export function stage(
  root: HTMLElement,
  title: string,
  subtitle: string,
  background: string,
  foreground: string,
) {
  root.replaceChildren();
  Object.assign(root.style, {
    position: "relative",
    width: "960px",
    height: "540px",
    overflow: "hidden",
    background,
    color: foreground,
    fontFamily: "Arial, sans-serif",
    isolation: "isolate",
  });
  const surface = document.createElement("div");
  Object.assign(surface.style, { position: "absolute", inset: "0" });
  root.append(surface);
  const heading = document.createElement("div");
  Object.assign(heading.style, {
    position: "absolute",
    left: "38px",
    top: "28px",
    pointerEvents: "none",
    zIndex: "2",
  });
  const titleEl = document.createElement("div");
  titleEl.textContent = title;
  Object.assign(titleEl.style, {
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "-.6px",
  });
  const sub = document.createElement("div");
  sub.textContent = subtitle;
  Object.assign(sub.style, {
    fontSize: "12px",
    marginTop: "8px",
    letterSpacing: "1.6px",
    opacity: ".7",
  });
  heading.append(titleEl, sub);
  root.append(heading);
  return surface;
}
export function canvas2d(surface: HTMLElement, description: string) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", description);
  Object.assign(canvas.style, {
    width: "100%",
    height: "100%",
    display: "block",
  });
  surface.append(canvas);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");
  return { canvas, context };
}
export function lifecycle(
  options: MountOptions,
  seek: RuntimeHandle["seek"],
  release: () => void,
): RuntimeHandle {
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    options.signal.removeEventListener("abort", dispose);
    release();
  };
  options.signal.addEventListener("abort", dispose, { once: true });
  if (options.signal.aborted) dispose();
  return {
    seek: (seconds) => {
      if (!disposed) return seek(options.reducedMotion ? 1.6 : seconds);
    },
    dispose,
  };
}
export function seeded(index: number) {
  const n = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
}
export const phase = (time: number) => ((time % 8) + 8) % 8;
