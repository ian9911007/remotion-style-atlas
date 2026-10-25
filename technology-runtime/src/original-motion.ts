/** Created: 2026-10-25. Original SVG scenes; one explicit time, no autonomous clock. */
import type { Mount } from "./types";
export type DemoConfig = {
  title: string;
  accent: string;
  duration: number;
  labels: string[];
  width: number;
  screenshot?: string;
};
export const defaults: Record<string, DemoConfig> = {
  "continuous-ui-morph": {
    title: "Make room for focus",
    accent: "#3458db",
    duration: 6,
    labels: ["Collect", "Arrange", "Ready"],
    width: 390,
  },
  "step-assembly-explainer": {
    title: "Build a reading light",
    accent: "#d45c32",
    duration: 6,
    labels: ["Anchor the base", "Raise the stem", "Shape the light"],
    width: 390,
  },
  "product-surface-reveal": {
    title: "A clearer working day",
    accent: "#42765b",
    duration: 6,
    labels: ["Plan", "Focus", "Review"],
    width: 390,
    screenshot: "",
  },
};
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export function validateConfig(input: DemoConfig): DemoConfig {
  if (
    typeof input.title !== "string" ||
    !input.title.trim() ||
    input.title.length > 30
  )
    throw Error("Title must contain 1–30 characters.");
  if (!/^#[a-f\d]{6}$/i.test(input.accent))
    throw Error("Accent must be a six-digit hex color.");
  if (
    !Number.isFinite(input.duration) ||
    input.duration < 3 ||
    input.duration > 12
  )
    throw Error("Duration must be 3–12 seconds.");
  if (!Number.isFinite(input.width) || input.width < 320 || input.width > 460)
    throw Error("Control width must be 320–460.");
  if (
    !Array.isArray(input.labels) ||
    input.labels.length !== 3 ||
    input.labels.some(
      (s) => typeof s !== "string" || !s.trim() || s.length > 22,
    )
  )
    throw Error("Supply exactly three labels of 1–22 characters.");
  if (
    input.screenshot &&
    !/^data:image\/(png|jpeg|webp);base64,[a-z\d+/=]+$/i.test(input.screenshot)
  )
    throw Error("Use a local PNG, JPEG or WebP screenshot.");
  return { ...input, labels: [...input.labels] };
}
export function sceneSVG(
  id: string,
  raw: DemoConfig,
  time: number,
  reduced = false,
) {
  const c = validateConfig(raw);
  if (!Number.isFinite(time)) throw Error("Time must be finite.");
  const p = reduced ? 0.78 : clamp(time / c.duration);
  const a = c.accent;
  const text = (
    x: number,
    y: number,
    s: string,
    size = 24,
    fill = "#182b34",
    extra = "",
  ) =>
    `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${esc(s)}</text>`;
  const header = (kicker: string, dark = false) =>
    text(
      56,
      54,
      kicker,
      12,
      dark ? "#9daeb9" : "#63726f",
      'letter-spacing="2"',
    ) +
    text(
      56,
      105,
      c.title,
      34,
      dark ? "#f5f3ed" : "#182b34",
      'font-weight="700"',
    );
  let art = "";
  if (id === "continuous-ui-morph") {
    // Closed state cycle. Width, indicator and label transition share the same state.
    const phase = p * 3;
    const step = Math.min(2, Math.floor(phase));
    const q = ease((phase - step - 0.18) / 0.55);
    const next = (step + 1) % 3;
    const widths = [c.width, c.width + 70, c.width - 50];
    const heights = [100, 134, 100];
    const w = lerp(widths[step], widths[next], q),
      h = lerp(heights[step], heights[next], q);
    const x = (960 - w) / 2,
      y = 250 - h / 2;
    const label = q < 0.5 ? step : next;
    const glow = 28 + 22 * Math.sin(Math.PI * p) ** 2;
    art = `<rect width="960" height="540" fill="#edf1fa"/>${header("01 / CONTINUITY STUDY")}
  <circle cx="480" cy="290" r="190" fill="#e3e9f9"/><circle cx="480" cy="290" r="226" fill="none" stroke="#d4ddef" stroke-dasharray="2 12"/>
  <rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="${(h + 16) / 2}" fill="white"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${a}"/>
  ${text(x + 36, y + h / 2 + 9, c.labels[label], 28, "#fff", 'font-weight="700"')}
  <circle cx="${x + w - 55}" cy="${y + h / 2}" r="${glow}" fill="#fff" opacity=".16"/>
  <path d="M${x + w - 66} ${y + h / 2}h22m-9-9 9 9-9 9" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"/>
  ${[0, 1, 2].map((i) => `<circle cx="${450 + i * 30}" cy="385" r="${i === label ? 5 : 3}" fill="${i === label ? a : "#a7b5d1"}"/>`).join("")}
  ${text(480, 460, "ONE SURFACE. THREE INTENTIONS.", 13, "#63718e", 'text-anchor="middle" letter-spacing="2"')}`;
  } else if (id === "step-assembly-explainer") {
    const progress = p < 0.82 ? p / 0.82 : (1 - p) / 0.18;
    const amounts = [
      ease(progress * 3),
      ease(progress * 3 - 1),
      ease(progress * 3 - 2),
    ];
    const active = Math.min(2, Math.floor(progress * 3));
    art = `<rect width="960" height="540" fill="#f7f0e2"/>${header("02 / ASSEMBLY NOTES")}
  <circle cx="260" cy="315" r="147" fill="#e6e7d1"/>
  <path d="M104 427h322" stroke="#6f806d" stroke-width="2"/>
  <g opacity="${amounts[0]}" transform="translate(0 ${45 * (1 - amounts[0])})"><ellipse cx="265" cy="416" rx="92" ry="14" fill="#182f34"/><path d="M198 398h134l25 18H173z" fill="${a}"/></g>
  <g opacity="${amounts[1]}" transform="translate(0 ${-80 * (1 - amounts[1])})"><rect x="253" y="240" width="24" height="162" rx="12" fill="#193d38"/><rect x="258" y="253" width="6" height="124" fill="#759b80"/></g>
  <g opacity="${amounts[2]}" transform="translate(0 ${-65 * (1 - amounts[2])})"><path d="M203 238q62-113 124 0z" fill="${a}"/><ellipse cx="265" cy="238" rx="62" ry="12" fill="#fbcf75"/><path d="m230 250-37 137h144l-37-137" fill="#e7c66c" opacity=".2"/></g>
  <path d="M505 185v245" stroke="#d8cfb9" stroke-width="2"/>
  ${c.labels.map((label, i) => `<circle cx="505" cy="${204 + i * 91}" r="17" fill="${i === active ? a : "#e6ddc9"}"/>${text(505, 210 + i * 91, String(i + 1), 15, i === active ? "#fff" : "#6d756c", 'text-anchor="middle" font-weight="700"')}${text(548, 211 + i * 91, label, 25, "#253e37", i === active ? 'font-weight="700"' : "")}${text(548, 237 + i * 91, ["A grounded starting point", "A clear vertical connection", "A useful pool of light"][i], 14, "#798477")}`).join("")}`;
  } else if (id === "product-surface-reveal") {
    const open = ease((p - 0.08) / 0.28) * (1 - ease((p - 0.86) / 0.14));
    const scale = 0.72 + 0.28 * open;
    const y = 175 + 55 * (1 - open);
    const ui = c.screenshot
      ? `<image href="${esc(c.screenshot)}" x="181" y="184" width="598" height="260" preserveAspectRatio="xMidYMid meet"/>`
      : `<rect x="181" y="184" width="598" height="260" fill="#f7f8f4"/><rect x="181" y="184" width="118" height="260" fill="#e9eee7"/>${text(199, 216, "DAYLIGHT", 11, a, 'font-weight="700" letter-spacing="1"')}${["Overview", ...c.labels].map((s, i) => text(199, 253 + i * 39, s, 13, "#4a6055")).join("")}${text(326, 221, "Your week, in perspective", 20, "#203c31", 'font-weight="700"')}${[0, 1, 2].map((i) => `<rect x="${326 + i * 139}" y="246" width="124" height="79" rx="10" fill="${i === 1 ? a : "#e7ecdf"}"/>${text(340 + i * 139, 271, ["TODAY", "FOCUS", "PROGRESS"][i], 10, i === 1 ? "#fff" : "#637965")}${text(340 + i * 139, 309, ["04", "02", "68%"][i], 28, i === 1 ? "#fff" : "#203c31", 'font-weight="700"')}`).join("")}<rect x="326" y="346" width="402" height="72" rx="10" fill="#e8ede4"/>${text(343, 374, "A little more space to do good work.", 16, "#41624e")}<rect x="343" y="391" width="${190 + 120 * ease((p - 0.35) / 0.3) * open}" height="6" rx="3" fill="${a}"/>`;
    art = `<rect width="960" height="540" fill="#142c26"/><circle cx="810" cy="60" r="250" fill="${a}" opacity=".18"/>${header("03 / PRODUCT CANVAS", true)}
  <g transform="translate(480 ${y}) scale(${scale}) translate(-480 -175)"><rect x="166" y="151" width="628" height="310" rx="19" fill="#0a1713" opacity=".4"/><rect x="173" y="145" width="614" height="307" rx="14" fill="#fff"/><rect x="181" y="153" width="598" height="31" rx="7" fill="#edf0e9"/><circle cx="196" cy="168" r="4" fill="${a}"/>${text(215, 172, "daylight / workspace", 10, "#758778")}${ui}</g>
  ${text(480, 502, "SPACE TO PLAN. ROOM TO MOVE.", 13, "#bbd1c2", 'text-anchor="middle" letter-spacing="2"')}`;
  } else throw Error("Unknown original demo");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540" role="img" aria-label="${esc(c.title)}" style="display:block;font-family:Arial,sans-serif">${art}</svg>`;
}
const mount: Mount = async (root, { variant, reducedMotion, signal }) => {
  let config = validateConfig(defaults[variant]),
    time = 0,
    reduced = reducedMotion;
  const measure = (candidate: DemoConfig) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    ctx.font = "700 34px Arial";
    if (ctx.measureText(candidate.title).width > 848)
      throw Error("Title exceeds the supported visible width.");
    ctx.font =
      variant === "continuous-ui-morph" ? "700 28px Arial" : "25px Arial";
    const limit =
      variant === "continuous-ui-morph" ? candidate.width - 180 : 340;
    if (candidate.labels.some((label) => ctx.measureText(label).width > limit))
      throw Error("Label exceeds the supported visible width.");
  };
  measure(config);
  const draw = () => {
    root.innerHTML = sceneSVG(variant, config, time, reduced);
    root.dataset.demoId = variant;
    root.dataset.demoConfig = JSON.stringify(config);
    delete root.dataset.configError;
  };
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const motion = () => {
    reduced = preference.matches;
    draw();
  };
  preference.addEventListener("change", motion);
  let revision = 0;
  const update = async (event: Event) => {
    const ownRevision = ++revision;
    try {
      const next = validateConfig({
        ...config,
        ...(event as CustomEvent).detail,
      });
      measure(next);
      if (next.screenshot) {
        const img = new Image();
        img.src = next.screenshot;
        await img.decode();
        if (signal.aborted) return;
      }
      if (ownRevision !== revision || signal.aborted) return;
      config = next;
      draw();
      window.dispatchEvent(
        new CustomEvent("atlas:demo-result", { detail: { ok: true } }),
      );
    } catch (error) {
      root.dataset.configError = String(error);
      window.dispatchEvent(
        new CustomEvent("atlas:demo-result", {
          detail: { ok: false, error: String(error) },
        }),
      );
    }
  };
  window.addEventListener("atlas:demo-parameters", update);
  draw();
  return {
    seek(t) {
      time = t;
      draw();
    },
    dispose() {
      preference.removeEventListener("change", motion);
      window.removeEventListener("atlas:demo-parameters", update);
      root.replaceChildren();
    },
  };
};
export default mount;
