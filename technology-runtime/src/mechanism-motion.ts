/** Created: 2026-10-25. Original research-derived scenes, explicit time and measured layout. */
import type { Mount } from "./types";
import {
  mechanismDefaults,
  validateMechanism,
  traceJourney,
  metricSummary,
  scoreState,
  noteName,
  geometryPanels,
  clamp,
  ease,
  type MechanismConfig,
} from "./mechanism-fixtures";
export { mechanismDefaults, validateMechanism } from "./mechanism-fixtures";
type Measure = (text: string, size: number, bold?: boolean) => number;
const escape = (s: string) =>
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
function lines(
  s: string,
  width: number,
  size: number,
  measure: Measure,
  max = 3,
) {
  const units = /[\u3000-\u9fff]/.test(s) ? [...s] : s.split(/(\s+)/);
  let out = [""];
  for (const unit of units) {
    const last = out.length - 1;
    if (measure(out[last] + unit, size, true) > width && out[last])
      out.push(unit.trimStart());
    else out[last] += unit;
  }
  if (out.length > max || out.some((l) => measure(l, size, true) > width))
    throw Error("Visible text bounds exceeded; shorten copy.");
  return out;
}
export function renderMechanism(
  id: string,
  raw: MechanismConfig,
  time: number,
  portrait: boolean,
  measure: Measure,
  reduced = false,
) {
  const c = validateMechanism(id, raw);
  if (!Number.isFinite(time)) throw Error("Time must be finite.");
  const W = portrait ? 640 : 960,
    H = portrait ? 900 : 540;
  const p = clamp(time / c.duration);
  const u = reduced ? 0.73 : p <= 0.82 ? p / 0.82 : (1 - p) / 0.18;
  const phase = Math.min(2, Math.floor(u * 3));
  const accent = c.accent;
  const txt = (
    x: number,
    y: number,
    s: string,
    size = 24,
    color = "#243b3b",
    extra = "",
  ) =>
    `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${escape(s)}</text>`;
  const block = (
    x: number,
    y: number,
    s: string,
    width: number,
    size = 28,
    color = "#243b3b",
    max = 3,
  ) =>
    lines(s, width, size, measure, max)
      .map((line, i) =>
        txt(x, y + i * size * 1.22, line, size, color, 'font-weight="700"'),
      )
      .join("");
  const rail = c.labels
    .map(
      (s, i) =>
        `<circle cx="${44 + (i * (W - 88)) / 3}" cy="${portrait ? 170 : 138}" r="5" fill="${i === phase ? accent : "#c7d1c8"}"/>${txt(58 + (i * (W - 88)) / 3, portrait ? 175 : 143, String(i + 1), 14)}`,
    )
    .join("");
  const head =
    txt(
      44,
      38,
      "ORIGINAL / " + id.toUpperCase().replaceAll("-", " "),
      portrait ? 11 : 12,
      "#6d7b74",
      'letter-spacing="1"',
    ) +
    block(
      44,
      portrait ? 90 : 96,
      c.title,
      W - 88,
      portrait ? 34 : 36,
      "#213d37",
      portrait ? 2 : 1,
    );
  let body = "";
  let truth = "ORIGINAL PROCEDURAL ART • SILENT PREVIEW";
  if (id === "editorial-evidence-story") {
    const stats = metricSummary(c.values!);
    const dx = 44,
      dy = portrait ? 205 : 164,
      dw = portrait ? 552 : 382;
    const cx = portrait ? 80 : 508,
      cy = portrait ? 540 : 205,
      cw = portrait ? 470 : 355,
      ch = portrait ? 185 : 175;
    body = `<rect x="${dx}" y="${dy}" width="${dw}" height="220" rx="13" fill="#fffdf6" stroke="#d8cfba"/>${txt(dx + 24, dy + 34, "ILLUSTRATIVE COPY / NOT TESTIMONY", 12, "#7b7769")}${block(dx + 24, dy + 78, c.quote!, dw - 48, portrait ? 30 : 27, "#273e38", 3)}<rect x="${dx + 22}" y="${dy + 173}" width="${(dw - 44) * ease(u * 4)}" height="5" fill="${accent}"/>${txt(dx + 24, dy + 205, c.labels[0], 19)}
  <path d="M${cx} ${cy - 8}v${ch + 8}h${cw}" fill="none" stroke="#8c9b8c"/>${txt(cx - 12, cy, "100", 14, "#61705f", 'text-anchor="end"')}${txt(cx - 12, cy + ch, "0", 14, "#61705f", 'text-anchor="end"')}
  ${stats.values
    .map((value, i) => {
      const width = cw / 5;
      const x = cx + 20 + (i * cw) / 3;
      const height = ((ch * value) / 100) * ease((u - 0.25) / 0.4);
      return `<rect x="${x}" y="${cy + ch - height}" width="${width}" height="${height}" rx="5" fill="${i === 2 ? accent : "#a5b7a4"}"/>${txt(x + width / 2, cy + ch - height - 12, value + "%", 21, "#213d37", 'text-anchor="middle" font-weight="700"')}${block(x - 5, cy + ch + 31, c.labels[i], cw / 3 - 8, portrait ? 18 : 17, "#485c4e", 2)}`;
    })
    .join("")}
  ${txt(portrait ? 80 : 508, portrait ? 800 : 470, `Illustrative change: ${stats.change >= 0 ? "+" : ""}${stats.change} percentage points`, portrait ? 21 : 18, "#52674f")}`;
    truth = "SYNTHETIC DATA • 0–100% AXIS • NOT A FORECAST";
  } else if (id === "palette-material-study") {
    const colors = c.colors!;
    const tx = portrait ? 320 : 620,
      ty = portrait ? 518 : 290;
    const blend = ease((u - 0.18) / 0.5);
    const count = 12;
    const shadow = c.material === "glaze" ? "url(#tile-glaze)" : "none";
    body = `<defs><linearGradient id="tile-glaze" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".7"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#102e2a" stop-opacity=".25"/></linearGradient></defs>
  ${colors
    .map((color, i) => {
      const x = portrait ? 62 + i * 178 : 58;
      const y = portrait ? 205 : 178 + i * 84;
      const lum =
        parseInt(color.slice(1, 3), 16) * 0.299 +
        parseInt(color.slice(3, 5), 16) * 0.587 +
        parseInt(color.slice(5, 7), 16) * 0.114;
      return `<rect x="${x}" y="${y}" width="${portrait ? 160 : 265}" height="64" rx="12" fill="${color}" stroke="#243d35" stroke-width="1"/>${txt(x + 16, y + 40, color.toUpperCase(), 20, lum > 150 ? "#000" : "#fff", 'font-weight="700"')}`;
    })
    .join("")}
  <circle cx="${tx}" cy="${ty}" r="${portrait ? 170 : 164}" fill="#e7e8dc"/>
  ${Array.from({ length: count }, (_, i) => {
    const angle = (i * Math.PI) / 6;
    const fanX = tx + Math.cos(angle) * 100,
      fanY = ty + Math.sin(angle) * 100;
    const gridX = tx + ((i % 4) - 1.5) * 70,
      gridY = ty + (Math.floor(i / 4) - 1) * 70;
    const x = c.topology === "fan" ? fanX : gridX,
      y = c.topology === "fan" ? fanY : gridY;
    const fromX = portrait ? 142 + (i % 3) * 178 : 195;
    const fromY = portrait ? 237 : 210 + (i % 3) * 84;
    const xx = fromX + (x - fromX) * blend,
      yy = fromY + (y - fromY) * blend;
    return `<g transform="translate(${xx} ${yy}) rotate(${c.topology === "fan" ? i * 30 * blend : 0})"><rect x="-29" y="-29" width="58" height="58" rx="${c.material === "glaze" ? 15 : 3}" fill="${colors[i % 3]}" stroke="#344d42" stroke-width="1.2"/><rect x="-29" y="-29" width="58" height="58" rx="15" fill="${shadow}"/></g>`;
  }).join("")}
  ${block(44, portrait ? 785 : 460, c.labels[phase], W - 88, 25, "#263f35", 2)}`;
    truth = "12 ORIGINAL TILES • PALETTE STUDY, NOT COLOR-SCIENCE VALIDATION";
  } else if (id === "tiny-code-journey") {
    const trace = traceJourney(c.values!);
    const active = Math.min(3, Math.floor(u * 4));
    const x = portrait ? 52 : 58,
      y = portrait ? 220 : 184,
      w = portrait ? 536 : 410;
    const yy = portrait ? 625 : 220;
    body = trace.steps
      .map(
        (step, i) =>
          `<rect x="${x}" y="${y + i * 70}" width="${w}" height="57" rx="8" fill="${i === active ? "#203d37" : "#e3e9df"}"/>${txt(x + 16, y + i * 70 + 23, step.code, portrait ? 19 : 17, i === active ? "#eff5df" : "#3c564c", 'font-family="monospace"')}${txt(x + 16, y + i * 70 + 46, JSON.stringify(step.value), 19, i === active ? "#d7e792" : "#546f5c")}`,
      )
      .join("");
    body += `<path data-code-connector="true" d="M${portrait ? 120 : 505} ${portrait ? 582 : 180}h${portrait ? 400 : 355}" stroke="${accent}" stroke-width="3"/>${block(portrait ? 65 : 535, yy, c.labels[phase], portrait ? 510 : 350, 30, "#1d3e33", 2)}${txt(portrait ? 65 : 535, yy + 95, String(trace.result), 76, accent, 'font-weight="700" data-fixture-result="' + trace.result + '"')}${txt(portrait ? 65 : 535, yy + 132, "Actual included map → filter → sum", portrait ? 19 : 16, "#526e5d")}`;
    truth = "EXECUTED TINY FIXTURE • NOT A TRACE OF AN UNSEEN CODEBASE";
  } else if (id === "causal-score-object") {
    const state = scoreState(c.notes!, c.duration, u * c.duration);
    const left = portrait ? 64 : 160,
      span = portrait ? 512 : 640,
      keyW = span / 5,
      base = portrait ? 622 : 354;
    body = `${block(44, portrait ? 204 : 184, c.labels[phase], W - 88, 28, "#2c4a42", 2)}<path d="M${left} ${base + 95}h${span}" stroke="#7b9685" stroke-width="2"/>`;
    body += c
      .notes!.map(
        (note, i) =>
          `<rect x="${left + i * keyW + 5}" y="${base}" width="${keyW - 10}" height="88" rx="10" fill="${state.active.some((e) => e.key === i) ? accent : "#e4e9d9"}" stroke="#486459"/>${txt(left + (i + 0.5) * keyW, base + 56, noteName(note), portrait ? 22 : 25, state.active.some((e) => e.key === i) ? "#ffffff" : "#183b30", 'text-anchor="middle" font-weight="700"')}`,
      )
      .join("");
    body += state.balls
      .map(
        (ball) =>
          `<circle data-ball="${ball.ball}" data-contact="${ball.contact}" cx="${left + (ball.key + 0.5) * keyW}" cy="${base - 16 - ball.height * (portrait ? 170 : 130)}" r="16" fill="${ball.ball ? "#c58e52" : "#3b716c"}" stroke="#18382f" stroke-width="2"/>`,
      )
      .join("");
    body += txt(
      44,
      portrait ? 805 : 478,
      "ONE LEDGER → CONTACT → VISIBLE NOTE",
      portrait ? 19 : 17,
      "#557365",
    );
    truth = "ORIGINAL NOTE VALUES • MUTED VISUAL SCORE • NO AUDIO PLAYBACK";
  } else if (id === "paper-blueprint-light") {
    const panels = geometryPanels(c.geometry!);
    const centerX = W / 2,
      centerY = portrait ? 490 : 305;
    const scheme = ease((u - 0.2) / 0.3);
    const light = ease((u - 0.6) / 0.3);
    body = `<rect x="${portrait ? 44 : 200}" y="${portrait ? 220 : 158}" width="${portrait ? 552 : 560}" height="${portrait ? 500 : 280}" rx="18" fill="${scheme > 0.45 ? "#17394b" : "#eae5d7"}"/>
  ${Array.from({ length: 15 }, (_, i) => `<path d="M${centerX - 220 + i * 32} ${centerY - 130}v270" stroke="#91bec4" opacity="${scheme * 0.15}"/><path d="M${centerX - 220} ${centerY - 130 + i * 20}h440" stroke="#91bec4" opacity="${scheme * 0.15}"/>`).join("")}
  ${panels
    .map((points, i) => {
      const spread = (1 - scheme) * (i - 1) * 50;
      const data = points
        .map(([x, y]) => centerX + x + spread + "," + (centerY + y - 30))
        .join(" ");
      return `<polygon data-panel="${i}" points="${data}" fill="${scheme > 0.5 ? "#274d5c" : ["#f9f2d9", "#dfb988", "#d0d9c0"][i]}" fill-opacity="${1 - light * 0.7}" stroke="${light > 0.4 ? "#f6d487" : scheme > 0.5 ? "#b6dae0" : "#917e63"}" stroke-width="${2 + light * 3}"/>`;
    })
    .join("")}
  <path d="M${centerX - 120} ${centerY + 140}h240" stroke="${accent}" stroke-width="${2 + light * 4}" opacity="${light}"/>
  ${block(44, portrait ? 790 : 478, c.labels[phase], W - 88, 26, "#3f5a4f", 2)}`;
    truth = "ONE ORIGINAL GEOMETRY • SCHEMATIC LIGHT, NOT OPTICAL SIMULATION";
  } else throw Error("Unknown mechanism");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escape(c.title)}" style="display:block;font-family:Arial,'PingFang TC',sans-serif"><rect width="${W}" height="${H}" fill="#f3f3e9"/>${head}${body}${rail}${txt(44, H - 24, truth, portrait ? 11 : 12, "#61796a")}</svg>`;
}
const mount: Mount = async (root, { variant, reducedMotion, signal }) => {
  let config = validateMechanism(variant, mechanismDefaults[variant]),
    time = 0,
    reduced = reducedMotion;
  const ctx = document.createElement("canvas").getContext("2d")!;
  const measure: Measure = (text, size, bold) => {
    ctx.font = `${bold ? 700 : 400} ${size}px Arial, 'PingFang TC', sans-serif`;
    return ctx.measureText(text).width;
  };
  const draw = () => {
    root.innerHTML = renderMechanism(
      variant,
      config,
      time,
      root.dataset.layout === "portrait",
      measure,
      reduced,
    );
    root.dataset.demoId = variant;
    root.dataset.demoConfig = JSON.stringify(config);
    root.dataset.fixtureResult =
      variant === "tiny-code-journey"
        ? String(traceJourney(config.values!).result)
        : "";
    delete root.dataset.configError;
  };
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const motion = () => {
    reduced = preference.matches;
    draw();
  };
  const update = (event: Event) => {
    try {
      const next = validateMechanism(variant, {
        ...config,
        ...(event as CustomEvent).detail,
      });
      renderMechanism(
        variant,
        next,
        time,
        root.dataset.layout === "portrait",
        measure,
        reduced,
      );
      config = next;
      draw();
      window.dispatchEvent(
        new CustomEvent("atlas:demo-duration", {
          detail: { variant, duration: config.duration },
        }),
      );
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
  const layout = () => draw();
  preference.addEventListener("change", motion);
  window.addEventListener("atlas:demo-parameters", update);
  root.addEventListener("atlas:scene-layout", layout);
  draw();
  return {
    seek(t) {
      if (signal.aborted) return;
      time = t;
      draw();
    },
    dispose() {
      preference.removeEventListener("change", motion);
      window.removeEventListener("atlas:demo-parameters", update);
      root.removeEventListener("atlas:scene-layout", layout);
      root.replaceChildren();
    },
  };
};
export default mount;
