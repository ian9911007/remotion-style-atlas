/** Created: 2026-10-05. Thirty deterministic, frame-seekable elemental and mechanical studies. */
import type { Mount } from "./types";
import { W, H, TAU, canvas2d, lifecycle, phase, seeded } from "./gpu-common";

import { physicsElementScenes as scenes } from "./physics-element-scenes";
import type { Scene } from "./physics-element-scenes";

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (x: number) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
function path(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  color: string,
  width = 1,
  alpha = 1,
) {
  if (points.length < 2) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(...points[i]);
  ctx.stroke();
  ctx.restore();
}
function glow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha = 1,
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  ctx.restore();
}
function dot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.2, r), 0, TAU);
  ctx.fill();
  ctx.restore();
}
function grain(ctx: CanvasRenderingContext2D, color: string, count = 230) {
  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const x = seeded(i + 400) * W,
      y = seeded(i + 1200) * H;
    ctx.fillRect(
      x,
      y,
      0.7 + seeded(i + 800) * 1.2,
      0.7 + seeded(i + 1800) * 1.2,
    );
  }
  ctx.restore();
}
function atmosphere(ctx: CanvasRenderingContext2D, s: Scene) {
  // Give each effect a photographic field instead of the same flat debug canvas.
  const tint = (hex: string, alpha: number) => {
    const value = Number.parseInt(hex.slice(1), 16);
    return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
  };
  const vertical = ctx.createLinearGradient(0, 0, 0, H);
  vertical.addColorStop(0, tint(s.ink, 0.09));
  vertical.addColorStop(0.48, "transparent");
  vertical.addColorStop(1, tint(s.accent, 0.11));
  ctx.fillStyle = vertical;
  ctx.fillRect(0, 0, W, H);

  const lights: Record<string, [number, number, number, number][]> = {
    fire: [[475, 420, 310, 0.48], [420, 370, 150, 0.24]],
    smoke: [[460, 335, 330, 0.3], [700, 210, 220, 0.12]],
    splash: [[485, 390, 350, 0.32], [260, 250, 220, 0.14]],
    swell: [[480, 445, 410, 0.19]],
    wind: [[760, 285, 370, 0.18]],
    lightning: [[520, 250, 420, 0.18]],
    rain: [[485, 300, 380, 0.19]],
    snow: [[760, 145, 240, 0.2]],
    sandfall: [[480, 350, 260, 0.28]],
    ferrofluid: [[480, 290, 260, 0.22]],
    bubble: [[480, 390, 370, 0.23]],
    lava: [[480, 410, 330, 0.34]],
    cloth: [[330, 300, 360, 0.15]],
    pendulum: [[490, 250, 290, 0.12]],
    domino: [[480, 360, 400, 0.13]],
    debris: [[480, 340, 300, 0.18]],
    billiards: [[480, 280, 440, 0.1]],
    membrane: [[480, 300, 390, 0.12]],
    rope: [[480, 330, 390, 0.1]],
    orbit: [[480, 290, 330, 0.17]],
    whirlpool: [[480, 320, 380, 0.22]],
    fountain: [[480, 375, 300, 0.19]],
    shockwave: [[480, 290, 430, 0.11]],
    magnetic: [[480, 290, 340, 0.14]],
    dust: [[480, 410, 350, 0.24]],
    paper: [[450, 290, 420, 0.09]],
    buoyancy: [[480, 300, 370, 0.12]],
    crystal: [[480, 340, 290, 0.17]],
    avalanche: [[480, 280, 430, 0.11]],
    plasma: [[480, 430, 290, 0.34]],
  };
  for (const [x, y, radius, alpha] of lights[s.key] ?? [])
    glow(ctx, x, y, radius, s.glow, alpha);

  const vignette = ctx.createRadialGradient(480, 285, 190, 480, 285, 665);
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(1, tint(s.ink, s.background.startsWith("#e") ? 0.12 : 0.23));
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}
function frame(ctx: CanvasRenderingContext2D, s: Scene) {
  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, W, H);
  atmosphere(ctx, s);
  if (["wind", "membrane", "magnetic", "shockwave"].includes(s.key)) {
    ctx.save();
    ctx.globalAlpha = s.key === "wind" ? 0.045 : 0.026;
    ctx.strokeStyle = s.ink;
    ctx.lineWidth = 1;
    for (let x = 40; x < W; x += 56) {
      ctx.beginPath();
      ctx.moveTo(x, 54);
      ctx.lineTo(x, H - 30);
      ctx.stroke();
    }
    for (let y = 55; y < H - 20; y += 56) {
      ctx.beginPath();
      ctx.moveTo(32, y);
      ctx.lineTo(W - 32, y);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (["fire", "smoke", "lava", "dust", "plasma", "debris"].includes(s.key))
    grain(ctx, s.ink, 260);
}
function fire(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const clock = (t / 8) * TAU;
  glow(ctx, 480, 390, 330, s.accent, 0.65);
  glow(ctx, 480, 396, 180, s.glow, 0.55);
  // Each flame tongue has a separate lift phase and asymmetric silhouette.
  for (let tongue = 0; tongue < 11; tongue++) {
    const center = 275 + tongue * 41,
      phase = clock * (1.4 + (tongue % 3) * 0.23) + tongue * 1.73,
      sway = Math.sin(phase) * (15 + (tongue % 4) * 5),
      height = 160 + (0.5 + 0.5 * Math.sin(phase * 0.73 + 1.2)) * 160,
      width = 17 + (tongue % 4) * 6,
      tip = center + sway;
    const gradient = ctx.createLinearGradient(center, 455, tip, 455 - height);
    gradient.addColorStop(0, tongue % 3 ? "#8d271e" : "#d33f23");
    gradient.addColorStop(0.42, s.accent);
    gradient.addColorStop(0.78, s.glow);
    gradient.addColorStop(1, "#fff5cf");
    ctx.beginPath();
    ctx.moveTo(center - width * 1.5, 454);
    ctx.bezierCurveTo(
      center - width * 2.2,
      382,
      center - width * 0.35 + Math.sin(phase + 0.6) * 25,
      350 - height * 0.68,
      tip,
      455 - height,
    );
    ctx.bezierCurveTo(
      center + width * 1.8 + sway,
      345 - height * 0.5,
      center + width * 2.4,
      390,
      center + width * 1.5,
      454,
    );
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.globalAlpha = tongue % 3 === 0 ? 0.94 : 0.68;
    ctx.fill();
    if (tongue % 2 === 0) {
      path(
        ctx,
        [
          [center, 438],
          [center + sway * 0.25, 395],
          [tip - sway * 0.18, 455 - height * 0.58],
          [tip, 455 - height],
        ],
        "#fff0ae",
        1.1,
        0.72,
      );
    }
  }
  ctx.globalAlpha = 1;
  // Glowing combustion bed, layered rather than a flat ellipse.
  for (let layer = 0; layer < 5; layer++) {
    const y0 = 435 + layer * 13,
      pts: [number, number][] = [];
    for (let i = 0; i <= 60; i++) {
      const q = i / 60,
        x = 247 + q * 466,
        y = y0 + Math.sin(q * TAU * 3 + clock + layer) * (3 + layer * 1.3);
      pts.push([x, y]);
    }
    path(ctx, pts, layer < 2 ? s.glow : s.accent, 5 - layer * 0.55, 0.55);
  }
  for (let i = 0; i < 125; i++) {
    const age = ((t / 8) * 2 + seeded(i + 4)) % 1,
      x =
        480 +
        (seeded(i + 80) - 0.5) * 220 * age +
        Math.sin(age * 13 + i) * 31 * age,
      y = 450 - age * (240 + seeded(i + 40) * 190),
      r = (1 - age) * (0.9 + seeded(i + 70) * 3.1);
    glow(ctx, x, y, r * 3.5, s.glow, (1 - age) * 0.24);
    dot(ctx, x, y, r, i % 4 ? s.accent : s.glow, 1 - age);
  }
}
function smoke(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const clock = (t / 8) * TAU;
  glow(ctx, 480, 330, 240, s.glow, 0.6);
  for (let ribbon = 0; ribbon < 12; ribbon++) {
    const pts: [number, number][] = [];
    for (let j = 0; j <= 30; j++) {
      const q = j / 30,
        age = (t / 8 + ribbon / 12) % 1,
        y = 447 - q * 330 - age * 54,
        x =
          480 +
          Math.sin(q * 9 - age * 3 + ribbon * 0.7) *
            ((24 + q * 92) * (1 + q * 0.5)) +
          Math.sin(q * 18 + clock + ribbon) * 11;
      pts.push([x, y]);
    }
    path(
      ctx,
      pts,
      ribbon % 3 ? s.ink : s.accent,
      6 + seeded(ribbon) * 9,
      0.055,
    );
    path(ctx, pts, s.ink, 1.2, 0.2);
  }
  for (let i = 0; i < 70; i++) {
    const q = (t / 8 + seeded(i + 3)) % 1,
      y = 442 - q * 330,
      x = 480 + Math.sin(q * 9 - i * 0.08) * q * 90;
    glow(ctx, x, y, 10 + q * 14, s.glow, 0.08);
  }
}
function waterImpact(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const q = (t / 8) % 1,
    envelope = Math.sin(q * Math.PI) ** 2,
    p = smooth(Math.min(q / 0.22, (1 - q) / 0.22)),
    cx = 480,
    cy = 380;
  glow(ctx, cx, cy, 205, s.accent, 0.45);
  ctx.save();
  for (let ring = 0; ring < 5; ring++) {
    const r = 42 + ring * 31 + q * 180;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, r, r * 0.28, 0, Math.PI, TAU);
    ctx.strokeStyle = s.glow;
    ctx.globalAlpha = 0.34 * envelope;
    ctx.lineWidth = 1 + ring * 0.35;
    ctx.stroke();
  }
  ctx.restore();
  const crown = [] as [number, number][];
  for (let i = 0; i <= 90; i++) {
    const a = Math.PI + (i / 90) * Math.PI;
    const spike = Math.pow(Math.max(0, Math.sin(a * 10 + ((t / 8) * TAU))), 9);
    const r = 20 + p * (100 + spike * 52);
    crown.push([
      cx + Math.cos(a) * r,
      cy + Math.sin(a) * r * 0.34 - p * spike * 18,
    ]);
  }
  path(ctx, crown, s.accent, 5, 0.95);
  path(
    ctx,
    crown.map(([x, y]) => [x, y - 4]),
    s.glow,
    1.2,
    0.9,
  );
  for (let i = 0; i < 58; i++) {
    const a = seeded(i + 4) * Math.PI,
      age = (q * 2 + seeded(i + 90)) % 1,
      rr = 45 + age * 175;
    const x = cx + Math.cos(a) * rr,
      y = cy - Math.sin(a) * rr * 0.74 + age * age * 92;
    const fade = Math.max(0, Math.min(1, age / 0.12, (1 - age) / 0.16));
    glow(ctx, x, y, 6, s.glow, 0.18 * fade);
    dot(ctx, x, y, (1 - age) * 3.2, s.ink, fade);
  }
}
function swell(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  for (let layer = 0; layer < 11; layer++) {
    const y0 = 350 + layer * 19;
    const pts: [number, number][] = [];
    for (let j = 0; j <= 80; j++) {
      const x = 70 + j * 10.25,
        phase =
          x * 0.012 - layer * 0.44 + ((t * TAU) / 8) * (1 + (layer % 3)),
        y = y0 + Math.sin(phase) * 19 + Math.sin(phase * 0.49 + 1) * 10;
      pts.push([x, y]);
    }
    path(
      ctx,
      pts,
      layer % 3 === 0 ? s.glow : s.accent,
      layer < 3 ? 2.4 : 1.1,
      0.85 - layer * 0.055,
    );
    if (layer < 4) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let j = 1; j < pts.length; j++) ctx.lineTo(...pts[j]);
      ctx.lineTo(W, 540);
      ctx.lineTo(0, 540);
      ctx.closePath();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = s.accent;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  for (let i = 0; i < 105; i++) {
    const x = (seeded(i) * W + (t / 8) * W * (i % 2 ? 1 : -1) + W * 4) % W,
      y = 280 + seeded(i + 100) * 215;
    dot(
      ctx,
      x,
      y,
      0.7 + seeded(i + 200) * 1.8,
      s.glow,
      0.12 + seeded(i + 300) * 0.2,
    );
  }
}
function wind(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  for (let row = 0; row < 18; row++) {
    const y = 128 + row * 20,
      pts: [number, number][] = [];
    for (let j = 0; j <= 60; j++) {
      const x = 52 + j * 14.25,
        q = j / 60,
        turn = Math.exp(-(((q - 0.56) * 7) ** 2)),
        phase = (t * TAU) / 8 + row * 0.31;
      pts.push([
        x,
        y +
          Math.sin(q * 7 - phase + row * 0.28) * 8 +
          turn * Math.sin(phase * 2 + row) * 42,
      ]);
    }
    path(
      ctx,
      pts,
      row % 5 === 0 ? s.accent : s.glow,
      row % 5 === 0 ? 1.7 : 0.65,
      row % 5 === 0 ? 0.8 : 0.62,
    );
  }
  for (let i = 0; i < 28; i++) {
    const q = (seeded(i) * 0.95 + t / 8) % 1,
      x = 40 + q * 870,
      y =
        190 +
        seeded(i + 80) * 230 +
        Math.sin(q * 10 + ((t * TAU) / 8)) * 25;
    dot(ctx, x, y, 2.1, s.accent, 0.75);
    path(
      ctx,
      [
        [x - 23, y],
        [x, y],
      ],
      s.accent,
      1,
      0.5,
    );
  }
}
function lightning(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const clock = (t / 8) * TAU,
    pulseA = Math.pow(Math.max(0, Math.sin(clock * 3 - 0.55)), 18),
    pulseB = Math.pow(Math.max(0, Math.sin(clock * 3 + 0.18)), 28),
    flash = Math.max(pulseA, pulseB * 0.72);
  if (flash > 0.12) {
    ctx.fillStyle = `rgba(188,198,255,${flash * 0.13})`;
    ctx.fillRect(0, 0, W, H);
  }
  glow(ctx, 500, 260, 370, s.glow, 0.08 + flash * 1.5);
  const drawBolt = (
    x: number,
    y: number,
    dx: number,
    depth: number,
    seed: number,
  ) => {
    let pts: [[number, number]] | [number, number][] = [[x, y]];
    let px = x,
      py = y;
    for (let n = 0; n < depth; n++) {
      px +=
        dx / depth +
        (seeded(seed + n) - 0.5) * 62 +
        Math.sin(clock * 4 + n * 2.7 + seed) * 9;
      py += 35 + seeded(seed + n + 43) * 13;
      pts.push([px, py]);
      if (n % 3 === 1 && depth > 5)
        drawBolt(px, py, dx * 0.38, depth - n - 1, seed + n * 13);
    }
    path(ctx, pts, s.ink, 3.6 + flash * 3, flash * 0.95 + 0.18);
    path(ctx, pts, s.accent, 1.1, flash + 0.2);
  };
  ctx.save();
  ctx.shadowColor = s.glow;
  ctx.shadowBlur = 17;
  drawBolt(520, 105, -90, 11, 12);
  ctx.restore();
  for (let i = 0; i < 22; i++) {
    const x = 80 + seeded(i) * 800,
      y = 106 + seeded(i + 50) * 340;
    dot(ctx, x, y, 1 + flash * 2, s.ink, 0.2 + flash * 0.7);
  }
}
function rain(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const pane = ctx.createLinearGradient(90, 100, 820, 500);
  pane.addColorStop(0, "#aacbd51b");
  pane.addColorStop(0.5, "#e1f7f622");
  pane.addColorStop(1, "#578da31c");
  ctx.fillStyle = pane;
  ctx.fillRect(100, 102, 760, 370);
  for (let x = 110; x < 860; x += 190) {
    path(
      ctx,
      [
        [x, 103],
        [x - 8, 470],
      ],
      s.ink,
      2,
      0.35,
    );
  }
  for (let i = 0; i < 145; i++) {
    const x = 105 + seeded(i) * 750,
      age = (seeded(i + 80) + (t / 8) * (1 + (i % 2))) % 1,
      y = age * 430 + 95,
      fade = Math.max(0, Math.min(1, age / 0.08, (1 - age) / 0.1));
    path(
      ctx,
      [
        [x, y],
        [x - 2, y + 13 + seeded(i + 3) * 13],
      ],
      s.glow,
      0.7 + seeded(i + 5),
      fade * 0.55,
    );
  }
  for (let i = 0; i < 30; i++) {
    const x = 115 + seeded(i + 150) * 740,
      age = (t / 8 + seeded(i + 90)) % 1,
      // Screen-space y increases downward: each rivulet must travel from the
      // upper pane toward the sill, with its wet trail extending behind it.
      y = 238 + age * 212;
    const trail = 8 + age * 42;
    path(
      ctx,
      [
        [x - Math.sin(age * 5) * 1.6, y - trail],
        [x, y - 2],
      ],
      s.accent,
      1.1 + seeded(i + 222) * 1.1,
      0.24 + age * 0.24,
    );
    ctx.save();
    ctx.fillStyle = s.ink;
    ctx.shadowColor = s.glow;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.ellipse(x, y, 1.9, 2.8, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    dot(ctx, x - 0.65, y - 1.1, 0.65, "#f4fbff", 0.78);
  }
  ctx.save();
  ctx.globalAlpha = 0.48;
  ctx.strokeStyle = s.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(100, 470);
  ctx.lineTo(860, 470);
  ctx.stroke();
  ctx.restore();
}
function snow(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  glow(ctx, 480, 280, 360, s.glow, 0.24);
  for (let i = 0; i < 210; i++) {
    const age = (seeded(i + 4) + (t / 8) * (1 + (i % 2))) % 1,
      y = 70 + age * 425,
      x =
        (seeded(i) * W +
          Math.sin(age * 8 + i * 0.3 + ((t * TAU) / 8)) * 35 +
          W) %
        W,
      r = 1 + seeded(i + 55) * 3,
      fade = Math.max(0, Math.min(1, age / 0.1, (1 - age) / 0.12));
    dot(ctx, x, y, r, s.ink, fade * (0.26 + seeded(i + 20) * 0.6));
    if (i % 9 === 0) {
      glow(ctx, x, y, 8, s.glow, 0.08);
      path(
        ctx,
        [
          [x - 2, y],
          [x + 2, y],
        ],
        s.ink,
        0.6,
        0.45,
      );
    }
  }
  for (let b = 0; b < 5; b++) {
    const x = 120 + b * 178;
    path(
      ctx,
      Array.from({ length: 10 }, (_, j) => [
        x + j * 72,
        470 + Math.sin(j * 0.6 + ((t * TAU) / 8) + b) * 7,
      ]),
      s.glow,
      1,
      0.35,
    );
  }
}
function sandfall(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const cycle = (t / 8) % 1;
  ctx.save();
  ctx.translate(480, 0);
  ctx.scale(0.76, 1);
  ctx.translate(-480, 0);
  ctx.strokeStyle = s.glow;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(342, 125);
  ctx.lineTo(618, 125);
  ctx.lineTo(548, 260);
  ctx.lineTo(492, 300);
  ctx.lineTo(548, 340);
  ctx.lineTo(618, 475);
  ctx.lineTo(342, 475);
  ctx.lineTo(412, 340);
  ctx.lineTo(468, 300);
  ctx.lineTo(412, 260);
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = s.accent;
  ctx.fill();
  ctx.restore();
  for (let i = 0; i < 145; i++) {
    const fall = (seeded(i) + cycle * 2) % 1,
      x = 480 + (seeded(i + 3) - 0.5) * Math.min(70, 10 + fall * 80),
      y = 260 + fall * 200;
    dot(ctx, x, y, 1.5 + seeded(i + 4) * 1.8, i % 5 ? s.accent : s.glow, 0.82);
  }
  for (let i = 0; i < 120; i++) {
    const x = 370 + seeded(i + 800) * 220,
      y = 462 - seeded(i + 1200) * Math.min(200, cycle * 360);
    dot(ctx, x, y, 1.4 + seeded(i + 1300) * 2.2, s.accent, 0.8);
  }
}
function ferro(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const clock = (t / 8) * TAU;
  glow(ctx, 480, 285, 200, s.accent, 0.5);
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * TAU,
      amp = 45 + 22 * Math.sin(clock + i * 0.24),
      pts: [[number, number]] | [number, number][] = [];
    for (let j = 0; j <= 30; j++) {
      const q = j / 30,
        r =
          40 +
          q * amp +
          Math.pow(Math.max(0, Math.sin(a * 7 + clock)), 8) * q * 55;
      pts.push([480 + Math.cos(a) * r, 287 + Math.sin(a) * r * 0.72]);
    }
    path(ctx, pts, i % 2 ? s.ink : s.glow, 1.15, 0.68);
  }
  for (let i = 0; i < 75; i++) {
    const a = seeded(i) * TAU,
      r = 52 + seeded(i + 90) * 180;
    dot(
      ctx,
      480 + Math.cos(a) * r,
      287 + Math.sin(a) * r * 0.72,
      0.8,
      s.ink,
      0.5,
    );
  }
}
function bubbles(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  for (let i = 0; i < 42; i++) {
    const y0 = 100 + seeded(i + 80) * 430,
      age = (t / 8 + seeded(i)) % 1,
      y = y0 - age * 360,
      x = 120 + seeded(i + 20) * 720 + Math.sin(age * 9 + i) * 22,
      r = 3 + seeded(i + 40) * 22,
      fade = Math.max(0, Math.min(1, age / 0.11, (1 - age) / 0.13));
    glow(ctx, x, y, r * 2, s.glow, 0.08);
    ctx.save();
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.5, 1, x, y, r);
    g.addColorStop(0, "#ffffffb0");
    g.addColorStop(0.4, s.accent + "42");
    g.addColorStop(1, "#68d9df10");
    ctx.fillStyle = g;
    ctx.strokeStyle = s.glow + "bb";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 0.75 * fade;
    ctx.beginPath();
    ctx.arc(x - r * 0.26, y - r * 0.32, r * 0.18, 0, TAU);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.globalAlpha = Math.max(0.16, fade);
    ctx.restore();
  }
  path(
    ctx,
    Array.from({ length: 80 }, (_, i) => [
      45 + i * 11,
      462 + Math.sin(i * 0.24 + ((t * TAU) / 8)) * 5,
    ]),
    s.accent,
    2,
    0.5,
  );
}
function lava(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const clock = (t / 8) * TAU,
    surface: [number, number][] = [];
  for (let i = 0; i <= 100; i++) {
    const q = i / 100,
      x = 40 + q * 880,
      y =
        318 +
        16 * Math.sin(q * TAU * 2 + clock) +
        8 * Math.sin(q * TAU * 5 - clock * 2) +
        6 * Math.sin(q * TAU * 9 + clock);
    surface.push([x, y]);
  }
  glow(ctx, 480, 375, 330, s.accent, 0.55);
  ctx.beginPath();
  ctx.moveTo(...surface[0]);
  surface.slice(1).forEach((point) => ctx.lineTo(...point));
  ctx.lineTo(920, 540);
  ctx.lineTo(40, 540);
  ctx.closePath();
  const flow = ctx.createLinearGradient(0, 285, 0, 540);
  flow.addColorStop(0, "#ffb14d");
  flow.addColorStop(0.13, s.accent);
  flow.addColorStop(0.58, "#932d1e");
  flow.addColorStop(1, "#311713");
  ctx.fillStyle = flow;
  ctx.fill();
  path(ctx, surface, s.glow, 3.4, 0.93);
  const crust = ctx.createLinearGradient(0, 310, 0, 490);
  crust.addColorStop(0, "#291c18cc");
  crust.addColorStop(0.46, "#43221ddd");
  crust.addColorStop(1, "transparent");
  for (let plate = 0; plate < 9; plate++) {
    const x = 72 + plate * 104 + Math.sin(clock + plate) * 11,
      y = 346 + Math.sin(clock * 2 + plate * 0.82) * 22,
      w = 65 + (plate % 3) * 12,
      h = 34 + (plate % 2) * 14;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(clock + plate) * 0.07);
    ctx.fillStyle = crust;
    ctx.beginPath();
    ctx.moveTo(-w, -h * 0.12);
    ctx.lineTo(-w * 0.45, -h);
    ctx.lineTo(w * 0.5, -h * 0.7);
    ctx.lineTo(w, h * 0.2);
    ctx.lineTo(w * 0.18, h);
    ctx.lineTo(-w * 0.74, h * 0.64);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  for (let band = 0; band < 5; band++) {
    const pts = surface.map(([x, y], i) => [
      x,
      y + 25 + band * 32 + Math.sin(i * 0.12 + clock + band) * 9,
    ] as [number, number]);
    path(ctx, pts, band % 2 ? "#ffb14d" : "#ef5b2d", 5 - band * 0.5, 0.25);
  }
  for (let i = 0; i < 82; i++) {
    const age = (seeded(i) + (t / 8) * 2) % 1,
      x = (seeded(i + 2) * W + age * 160) % W,
      y = 332 + seeded(i + 80) * 170,
      alpha = Math.max(0, Math.min(1, age / 0.08, (1 - age) / 0.1));
    glow(ctx, x, y, 5 + seeded(i + 20) * 10, s.glow, alpha * 0.2);
    dot(ctx, x, y, 1 + seeded(i + 40) * 2, s.glow, alpha * 0.85);
  }
}
function cloth(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const clock = (t / 8) * TAU;
  const cols = 52, rows = 24;
  const x0 = 66, y0 = 70, width = 830, height = 398;
  const nodes: [number, number][][] = [];
  const slope: number[][] = [];
  const waveAt = (u: number, v: number) =>
    Math.sin(u * 8.2 - clock + v * 4.1) * 30 * u +
    Math.sin(u * 15.5 - clock * 2 + v * 3.2) * 11 * u +
    Math.sin(v * TAU * 1.15 + u * 4.4 - clock) * 8 * u;
  for (let row = 0; row <= rows; row++) {
    const v = row / rows, points: [number, number][] = [], shading: number[] = [];
    for (let col = 0; col <= cols; col++) {
      const u = col / cols;
      const skew = Math.sin(u * 5.3 - clock + v * 2.4) * 7 * u;
      const y = y0 + v * height + waveAt(u, v);
      points.push([x0 + u * width + skew, y]);
      const phase = u * 8.2 - clock + v * 4.1;
      const fold = Math.cos(phase) * 0.56 + Math.cos(phase * 1.88 + v * 2) * 0.28;
      const sideLight = Math.cos(u * Math.PI * 1.35 - 0.5 + Math.sin(v * 4 + clock) * 0.13) * 0.16;
      shading.push(clamp(0.48 + fold * 0.34 + sideLight, 0.06, 0.97));
    }
    nodes.push(points);
    slope.push(shading);
  }

  // A broad, softbox-lit satin sheet replaces the old line-only diagram.
  glow(ctx, 420, 265, 470, s.accent, 0.15);
  const shadow = ctx.createRadialGradient(500, 445, 12, 500, 445, 390);
  shadow.addColorStop(0, "rgba(0,0,0,.36)");
  shadow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadow;
  ctx.fillRect(70, 310, 850, 210);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const light = (slope[row][col] + slope[row][col + 1] + slope[row + 1][col] + slope[row + 1][col + 1]) * 0.25;
      const warm = Math.round(60 + light * 154);
      const red = Math.min(242, warm + Math.round(light * 24));
      const blue = Math.round(32 + light * 91);
      const alpha = 0.97;
      ctx.fillStyle = `rgba(${red},${Math.round(warm * 0.45)},${blue},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(...nodes[row][col]);
      ctx.lineTo(...nodes[row][col + 1]);
      ctx.lineTo(...nodes[row + 1][col + 1]);
      ctx.lineTo(...nodes[row + 1][col]);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Fine warp threads and broader specular weft make the folds readable as fabric.
  for (let row = 0; row <= rows; row++) {
    const bright = row % 4 === 1;
    path(ctx, nodes[row], bright ? "#ffe3c5" : "#180e13", bright ? 1.15 : 0.5,
      bright ? 0.20 : 0.12);
  }
  for (let col = 0; col <= cols; col += 2) {
    const points = nodes.map((row) => row[col]);
    path(ctx, points, col % 8 === 0 ? "#fff0d7" : "#28131b",
      col % 8 === 0 ? 0.85 : 0.38, col % 8 === 0 ? 0.22 : 0.11);
  }
  for (let col = 0; col <= cols; col++) {
    const points = nodes.map((row) => row[col]);
    let ridge = 0;
    for (let row = 0; row <= rows; row++) ridge += slope[row][col];
    const brightness = ridge / (rows + 1);
    if (brightness > 0.72)
      path(ctx, points, "#fff0d4", 1.8, (brightness - 0.66) * 1.2);
  }

  // The selvedge, stitched edge and machined pin read as a fixed boundary.
  const edge = nodes.map((row) => row[0]);
  path(ctx, edge, "#f3d4b2", 4.4, 0.85);
  path(ctx, edge, "#fff6e5", 0.9, 0.9);
  for (let i = 0; i < 23; i++) {
    const v = i / 22;
    const y = y0 + v * height;
    path(ctx, [[x0 - 20, y], [x0 + 2, y]], "#d8b28b", 1.1, 0.48);
  }
  const rail = ctx.createLinearGradient(0, y0 - 20, 0, y0 + height + 20);
  rail.addColorStop(0, "#f5d6a5");
  rail.addColorStop(0.48, "#77533e");
  rail.addColorStop(1, "#d3a77d");
  ctx.fillStyle = rail;
  ctx.fillRect(x0 - 32, y0 - 13, 9, height + 26);
  for (let i = 0; i < 5; i++) {
    const y = y0 + i * (height / 4);
    glow(ctx, x0 - 28, y, 16, "#fff1d3", 0.24);
    dot(ctx, x0 - 28, y, 4.2, "#d7b78c", 0.9);
    dot(ctx, x0 - 29.2, y - 1.4, 1, "#fff4db", 0.9);
  }
}
function pendulum(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const anchors = [330, 480, 630],
    angles = anchors.map(
      (_, i) => Math.sin(((t * TAU) / 8) * 1.1 - i * 0.7) * (0.57 - i * 0.08),
    );
  ctx.save();
  ctx.strokeStyle = s.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(270, 145);
  ctx.lineTo(690, 145);
  ctx.stroke();
  ctx.restore();
  anchors.forEach((x, i) => {
    const len = 195,
      theta = angles[i],
      bx = x + Math.sin(theta) * len,
      by = 145 + Math.cos(theta) * len;
    path(
      ctx,
      [
        [x, 145],
        [bx, by],
      ],
      s.ink,
      2,
      0.75,
    );
    glow(ctx, bx, by, 38, s.accent, 0.16);
    const g = ctx.createRadialGradient(bx - 8, by - 9, 2, bx, by, 22);
    g.addColorStop(0, s.glow);
    g.addColorStop(0.45, s.accent);
    g.addColorStop(1, "#7b3830");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(bx, by, 22, 0, TAU);
    ctx.fill();
    dot(ctx, bx - 7, by - 8, 4, "#fff4d2", 0.8);
    for (let k = 1; k < 5; k++) {
      const a = theta - k * 0.08;
      dot(
        ctx,
        x + Math.sin(a) * len,
        145 + Math.cos(a) * len,
        1,
        s.accent,
        0.15,
      );
    }
  });
}
function domino(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const n = 18,
    travel = ((t / 8) * 1.7) % 1;
  for (let i = 0; i < n; i++) {
    const x = 150 + i * 38,
      local = clamp(travel * 1.4 - i / n);
    const angle =
      local < 0.12
        ? smooth(local / 0.12) * Math.PI * 0.44
        : local < 0.8
          ? Math.PI * 0.44
          : Math.PI * 0.44 * (1 - smooth((local - 0.8) / 0.2));
    ctx.save();
    ctx.translate(x, 414);
    ctx.rotate(-angle);
    const grad = ctx.createLinearGradient(-7, -67, 8, 0);
    grad.addColorStop(0, i % 3 ? s.accent : s.glow);
    grad.addColorStop(1, "#592e2c");
    ctx.fillStyle = grad;
    ctx.fillRect(-7, -62, 14, 62);
    ctx.fillStyle = s.ink;
    ctx.globalAlpha = 0.28;
    ctx.fillRect(-4, -57, 2, 49);
    ctx.restore();
    dot(ctx, x, 418, 1.8, s.ink, 0.55);
  }
  path(
    ctx,
    [
      [98, 418],
      [864, 418],
    ],
    s.ink,
    1,
    0.42,
  );
}
function debris(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const q = (t / 8) % 1;
  glow(ctx, 480, 370, 260, s.accent, 0.34);
  for (let i = 0; i < 80; i++) {
    const a = seeded(i) * TAU,
      speed = 55 + seeded(i + 30) * 210,
      age = (q * 1.8 + seeded(i + 100)) % 1,
      x = 480 + Math.cos(a) * speed * age,
      y = 220 + Math.sin(a) * speed * age + 190 * age * age,
      sz = 3 + seeded(i + 60) * 17,
      rot = age * 5 + seeded(i + 80) * TAU;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = i % 4 ? s.accent : s.glow;
    ctx.globalAlpha = 1 - age * 0.58;
    ctx.beginPath();
    ctx.moveTo(-sz, -sz * 0.35);
    ctx.lineTo(sz * 0.6, -sz);
    ctx.lineTo(sz, sz * 0.4);
    ctx.lineTo(-sz * 0.4, sz);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = s.ink;
    ctx.globalAlpha = 0.35;
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = "#080909";
  ctx.fillRect(50, 463, 860, 3);
}
function billiards(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  ctx.save();
  ctx.strokeStyle = s.glow;
  ctx.lineWidth = 11;
  ctx.strokeRect(115, 130, 730, 320);
  ctx.strokeStyle = "#c7a76a77";
  ctx.lineWidth = 1;
  ctx.strokeRect(128, 143, 704, 294);
  ctx.restore();
  const collide = ((t / 8) * 1.3) % 1,
    x1 = 200 + collide * 385,
    x2 = 585 + Math.sin(collide * Math.PI) * 120;
  [
    [x1, 285, s.accent],
    [x2, 285, s.glow],
    [735 - collide * 120, 190, s.ink],
  ].forEach(([x, y, c], i) => {
    const r = 28;
    glow(ctx, x as number, y as number, 54, c as string, 0.12);
    const g = ctx.createRadialGradient(
      (x as number) - 10,
      (y as number) - 11,
      2,
      x as number,
      y as number,
      r,
    );
    g.addColorStop(0, "#fff");
    g.addColorStop(0.35, c as string);
    g.addColorStop(1, "#17352d");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x as number, y as number, r, 0, TAU);
    ctx.fill();
    if (i === 0)
      path(
        ctx,
        [
          [x1 - 80, 285],
          [x1 - 40, 285],
        ],
        s.glow,
        1,
        0.45,
      );
  });
}
function membrane(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  ctx.save();
  ctx.strokeStyle = s.ink + "65";
  ctx.lineWidth = 2;
  ctx.strokeRect(170, 145, 620, 300);
  ctx.restore();
  for (let row = 0; row <= 20; row++) {
    const pts: [number, number][] = [];
    for (let col = 0; col <= 40; col++) {
      const x = 170 + col * 15.5,
        y = 145 + row * 15,
        z =
          Math.sin((col / 40) * Math.PI * 3 + (t * TAU) / 8) *
          Math.sin((row / 20) * Math.PI * 2 + ((t * TAU) / 8) * 0.6) *
          27 *
          Math.sin((col / 40) * Math.PI);
      pts.push([x, y + z]);
    }
    path(
      ctx,
      pts,
      row % 4 === 0 ? s.accent : s.ink,
      row % 4 === 0 ? 1.5 : 0.5,
      row % 4 === 0 ? 0.85 : 0.44,
    );
  }
  glow(ctx, 480, 290, 95, s.glow, 0.13);
}
function rope(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  for (let strand = 0; strand < 9; strand++) {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 90; i++) {
      const q = i / 90,
        x = 55 + q * 850,
        y =
          270 +
          Math.sin(q * TAU * 2 - (t * TAU) / 8) * 75 * (0.3 + q * 0.7) +
          Math.sin(q * TAU * 4 + t * 0.7) * 12 +
          strand * 1.7;
      pts.push([x, y]);
    }
    path(
      ctx,
      pts,
      strand % 3 === 0 ? s.accent : s.ink,
      strand % 3 === 0 ? 2 : 0.7,
      strand % 3 === 0 ? 0.8 : 0.48,
    );
  }
  for (let i = 0; i < 15; i++) {
    const q = i / 14,
      x = 55 + q * 850,
      y = 270 + Math.sin(q * TAU * 2 - (t * TAU) / 8) * 75 * (0.3 + q * 0.7);
    dot(ctx, x, y, 2, s.glow, 0.8);
  }
}
function orbit(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  glow(ctx, 480, 290, 170, s.glow, 0.17);
  for (let ring = 0; ring < 3; ring++) {
    ctx.save();
    ctx.translate(480, 290);
    ctx.rotate(-0.3 + ring * 0.38);
    ctx.strokeStyle = s.accent;
    ctx.globalAlpha = 0.28;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 135 + ring * 63, 48 + ring * 28, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  const bodies = [
    { a: 135, b: 50, p: 1.4, r: 9, c: s.accent },
    { a: 200, b: 80, p: 0.7, r: 13, c: s.glow },
    { a: 260, b: 112, p: 0.38, r: 5, c: s.ink },
  ];
  bodies.forEach((b, i) => {
    const a = (t / 8) * TAU * b.p + i * 1.7,
      x = 480 + Math.cos(a) * b.a,
      y = 290 + Math.sin(a) * b.b;
    for (let k = 1; k <= 18; k++) {
      const q = a - k * 0.045;
      dot(
        ctx,
        480 + Math.cos(q) * b.a,
        290 + Math.sin(q) * b.b,
        b.r * (1 - k / 24),
        b.c,
        1 - k / 21,
      );
    }
    glow(ctx, x, y, b.r * 4, b.c, 0.4);
    dot(ctx, x, y, b.r, b.c, 1);
  });
}
function whirlpool(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  for (let ring = 0; ring < 20; ring++) {
    const r = 20 + ring * 10,
      rot = (t / 8) * TAU * 0.7 - ring * 0.11,
      pts: [number, number][] = [];
    for (let j = 0; j <= 90; j++) {
      const a = (j / 90) * TAU + rot,
        rr = r + Math.sin(a * 5 + ring * 0.5 + t) * 4;
      pts.push([480 + Math.cos(a) * rr, 290 + Math.sin(a) * rr * 0.54]);
    }
    path(
      ctx,
      pts,
      ring % 4 === 0 ? s.glow : s.accent,
      ring % 4 === 0 ? 1.7 : 0.75,
      0.28 + ring * 0.018,
    );
  }
  for (let i = 0; i < 70; i++) {
    const a = seeded(i) * TAU + (t / 8) * TAU,
      rad = 40 + seeded(i + 50) * 210;
    dot(
      ctx,
      480 + Math.cos(a) * rad,
      290 + Math.sin(a) * rad * 0.54,
      0.8 + seeded(i + 80) * 2,
      s.ink,
      0.54,
    );
  }
}
function fountain(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const base = 430;
  glow(ctx, 480, 400, 200, s.accent, 0.25);
  for (let jet = 0; jet < 9; jet++) {
    const u = (t / 8 + jet * 0.13) % 1,
      x0 = 480 + (jet - 4) * 20,
      h = 100 + 100 * Math.sin(u * Math.PI);
    const pts: [number, number][] = [];
    for (let i = 0; i <= 32; i++) {
      const q = i / 32,
        x = x0 + (jet - 4) * q * 30,
        y = base - q * h + q * q * h * 0.98;
      pts.push([x, y]);
    }
    path(ctx, pts, jet % 2 ? s.accent : s.glow, jet === 4 ? 3.5 : 1.7, 0.75);
    const q = u;
    for (let k = 0; k < 5; k++) {
      const age = (q + k * 0.17) % 1,
        x = x0 + (jet - 4) * age * 30,
        y = base - age * h + age * age * h * 0.98;
      dot(ctx, x, y, 1.2, s.ink, 0.6);
    }
  }
  path(
    ctx,
    [
      [200, base],
      [760, base],
    ],
    s.glow,
    5,
    0.75,
  );
  path(
    ctx,
    [
      [265, base + 13],
      [695, base + 13],
    ],
    s.accent,
    2,
    0.5,
  );
}
function shockwave(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const q = (t / 8) % 1;
  const front = 35 + q * 410;
  const wallY = 440;
  const reflectionOriginY = wallY * 2 - 290;
  ctx.save();
  // The lower incident wave meets an immovable boundary. Mirror-source
  // geometry produces an equal-speed reflected front with no penetration.
  ctx.beginPath();
  ctx.rect(0, 0, W, wallY);
  ctx.clip();
  for (let ring = 0; ring < 8; ring++) {
    const radius = front - ring * 19;
    if (radius <= 1) continue;
    ctx.beginPath();
    ctx.ellipse(480, 290, radius, radius * 0.61, 0, 0, TAU);
    ctx.strokeStyle = ring === 0 ? s.accent : s.glow;
    ctx.globalAlpha = (1 - q * 0.72) * (0.52 - ring * 0.045);
    ctx.lineWidth = ring === 0 ? 3.4 : 1.05;
    ctx.stroke();
    const reflectedRadius = radius;
    if (reflectedRadius * 0.61 >= reflectionOriginY - wallY) {
      ctx.beginPath();
      ctx.ellipse(480, reflectionOriginY, reflectedRadius, reflectedRadius * 0.61, 0, 0, TAU);
      ctx.strokeStyle = ring === 0 ? s.glow : s.accent;
      ctx.globalAlpha = (1 - q * 0.55) * (0.36 - ring * 0.032);
      ctx.lineWidth = ring === 0 ? 2.5 : 1;
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  glow(ctx, 480, 290, 58, s.accent, 0.12 * (1 - q));
  ctx.restore();
  // The barrier is a visible hard edge, drawn over both wave fields.
  path(ctx, [[105, wallY], [855, wallY]], s.ink, 2.2, 0.78);
  path(ctx, [[105, wallY - 4], [855, wallY - 4]], s.glow, 0.8, 0.24);
  const impact = Math.max(0, Math.min(1, (front * 0.61 - (wallY - 290)) / 52));
  if (impact > 0) {
    for (const x of [480 - 72, 480 + 72])
      glow(ctx, x, wallY, 18 + impact * 24, s.accent, impact * 0.34);
  }
}
function magnetic(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const cx = 480,
    cy = 300,
    breathe = 1 + Math.sin((t * TAU) / 8) * 0.018;
  const fieldPoint = (q: number, height: number, side: number): [number, number] => [
    cx + (q * 2 - 1) * 104 * breathe,
    cy + side * height * Math.pow(Math.max(0, Math.sin(q * Math.PI)), 0.86),
  ];
  const background = ctx.createLinearGradient(0, 0, W, H);
  background.addColorStop(0, "#f4f1e7");
  background.addColorStop(0.52, "#e5e4dc");
  background.addColorStop(1, "#d9dfdd");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, W, H);
  const aura = ctx.createRadialGradient(cx, cy, 35, cx, cy, 360);
  aura.addColorStop(0, "rgba(255,255,255,.75)");
  aura.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = aura;
  ctx.fillRect(100, 55, 760, 450);
  // Dipole loops leave the north pole, arch through space, and return to south.
  for (let n = 0; n < 13; n++) {
    const h = 28 + n * 15;
    for (const side of [-1, 1]) {
      const pts = Array.from({ length: 101 }, (_, j) => fieldPoint(j / 100, h, side));
      const alpha = 0.3 + (1 - n / 16) * 0.28;
      path(ctx, pts, n % 4 === 0 ? s.accent : s.glow, n % 4 === 0 ? 1.5 : 0.82, alpha);
    }
  }
  // Steel filings follow the local tangent of those same field lines; they do
  // not use unrelated random angles that contradict the displayed field.
  for (let i = 0; i < 360; i++) {
    const line = i % 13;
    const q = 0.035 + seeded(i + 28) * 0.93;
    const side = i % 2 ? -1 : 1;
    const h = 28 + line * 15;
    const [x, y] = fieldPoint(q, h, side);
    const dyDx = side * h * 0.86 * Math.PI * Math.cos(q * Math.PI) /
      Math.pow(Math.max(0.08, Math.sin(q * Math.PI)), 0.14) / 208;
    const angle = Math.atan(dyDx);
    const length = 3 + seeded(i + 800) * 5.2;
    if (Math.abs(x - cx) < 118 && Math.abs(y - cy) < 22) continue;
    const a = [x - Math.cos(angle) * length, y - Math.sin(angle) * length] as [number, number];
    const b = [x + Math.cos(angle) * length, y + Math.sin(angle) * length] as [number, number];
    path(ctx, [a, b], "#455254", 2.1, 0.48);
    path(ctx, [a, b], "#fffdf2", 0.75, 0.7);
  }
  // Machined bar magnet: distinct pole colours, bevels, and clear polarity.
  const metal = ctx.createLinearGradient(0, cy - 38, 0, cy + 39);
  metal.addColorStop(0, "#f8f5e9");
  metal.addColorStop(0.22, "#fffef8");
  metal.addColorStop(0.52, "#b4b7ae");
  metal.addColorStop(0.84, "#777f7d");
  metal.addColorStop(1, "#f3efe1");
  ctx.save();
  ctx.shadowColor = "#26363a66";
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = metal;
  ctx.beginPath();
  ctx.roundRect(cx - 132, cy - 29, 264, 58, 12);
  ctx.fill();
  ctx.restore();
  const pole = ctx.createLinearGradient(0, cy - 25, 0, cy + 25);
  pole.addColorStop(0, "#e06c50");
  pole.addColorStop(0.48, "#a23e37");
  pole.addColorStop(1, "#6d2d30");
  ctx.fillStyle = pole;
  ctx.beginPath();
  ctx.roundRect(cx - 128, cy - 25, 128, 50, [9, 0, 0, 9]);
  ctx.fill();
  const south = ctx.createLinearGradient(0, cy - 25, 0, cy + 25);
  south.addColorStop(0, "#557d88");
  south.addColorStop(0.5, "#355767");
  south.addColorStop(1, "#243c4e");
  ctx.fillStyle = south;
  ctx.beginPath();
  ctx.roundRect(cx, cy - 25, 128, 50, [0, 9, 9, 0]);
  ctx.fill();
  path(ctx, [[cx, cy - 23], [cx, cy + 23]], "#f5e7c6", 1.2, 0.55);
  ctx.fillStyle = "#fff7e5";
  ctx.font = "600 17px ui-monospace, SFMono-Regular, monospace";
  ctx.textAlign = "center";
  ctx.fillText("N", cx - 64, cy + 6);
  ctx.fillText("S", cx + 64, cy + 6);
  ctx.textAlign = "start";
  // Direction markers travel slowly from N to S and are periodic at loop end.
  for (let i = 0; i < 18; i++) {
    const q = (seeded(i + 412) + t / 8) % 1;
    const h = 45 + (i % 7) * 23;
    const side = i % 2 ? -1 : 1;
    const [x, y] = fieldPoint(q, h, side);
    dot(ctx, x, y, i % 4 === 0 ? 2.2 : 1.25, s.accent, 0.62);
  }
}
function dust(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  glow(ctx, 480, 360, 250, s.glow, 0.4);
  for (let row = 0; row < 18; row++) {
    const q = row / 17,
      pts: [number, number][] = [];
    for (let j = 0; j <= 48; j++) {
      const y = 440 - j * 8,
        x = 480 + Math.sin(j * 0.13 - t * 1.1 + row * 0.2) * (20 + q * 85);
      pts.push([x, y]);
    }
    path(ctx, pts, row % 3 ? s.accent : s.glow, 1.1, 0.4);
  }
  for (let i = 0; i < 210; i++) {
    const age = (seeded(i) + (t / 8) * 0.6) % 1,
      r = 14 + age * 115,
      a = seeded(i + 50) * TAU + t * 0.7,
      x = 480 + Math.cos(a) * r,
      y = 420 - age * 300 + Math.sin(a) * r * 0.45;
    dot(
      ctx,
      x,
      y,
      0.8 + seeded(i + 90) * 2.7,
      i % 4 ? s.accent : s.glow,
      0.3 + age * 0.4,
    );
  }
}
function paper(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  for (let sheet = 0; sheet < 5; sheet++) {
    const off = sheet * 3;
    const pts: [number, number][] = [];
    for (let i = 0; i <= 50; i++) {
      const q = i / 50,
        x = 145 + q * 670,
        y =
          210 +
          sheet * 25 +
          Math.sin(q * TAU * 2 + (t * TAU) / 8 + sheet * 0.6) * 54 * q +
          Math.sin(q * TAU * 5 - t * 1.1) * 12 * q;
      pts.push([x, y]);
    }
    path(
      ctx,
      pts,
      sheet === 0 ? s.accent : s.ink,
      sheet === 0 ? 2.5 : 0.7,
      sheet === 0 ? 0.9 : 0.46,
    );
  }
  for (let i = 0; i < 28; i++) {
    const q = seeded(i),
      x = 160 + q * 640,
      y = 200 + seeded(i + 80) * 180;
    dot(ctx, x, y, 1.1, s.glow, 0.5);
  }
}
function buoyancy(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const water = 344 + Math.sin((t * TAU) / 8) * 9;
  const bob = Math.sin((t * TAU) / 8 * 1.3);
  const pts: [number, number][] = Array.from({ length: 101 }, (_, i) => {
    const x = 18 + i * 9.24;
    const local = x / W;
    return [x, water + Math.sin(local * 22 - t * 0.9) * 2.4 + Math.sin(local * 8 + t * 0.65) * 1.4];
  });
  const sea = ctx.createLinearGradient(0, water - 5, 0, H);
  sea.addColorStop(0, "rgba(80,137,146,.52)");
  sea.addColorStop(0.18, "rgba(54,111,126,.72)");
  sea.addColorStop(1, "rgba(24,57,73,.94)");
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(...pts[0]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(...pts[i]);
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fillStyle = sea;
  ctx.fill();
  // A layered wake shows water being displaced by the moving hull.
  for (let row = 0; row < 8; row++) {
    const spread = 25 + row * 17;
    ctx.beginPath();
    ctx.ellipse(480, water + 5 + row * 5, spread * (1 + row * 0.13), 2 + row * 0.8, 0, 0, TAU);
    ctx.strokeStyle = row % 2 ? "#d8ece5" : s.glow;
    ctx.globalAlpha = 0.21 - row * 0.018;
    ctx.lineWidth = row === 0 ? 2.1 : 1;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // Contact shadow and the boat are designed as one coherent buoyant body.
  ctx.save();
  ctx.translate(480, water - 5 + bob * 9);
  ctx.rotate(Math.sin((t * TAU) / 8) * 0.035);
  const shadow = ctx.createRadialGradient(0, 10, 12, 0, 10, 168);
  shadow.addColorStop(0, "rgba(4,24,36,.48)");
  shadow.addColorStop(1, "rgba(4,24,36,0)");
  ctx.fillStyle = shadow;
  ctx.fillRect(-180, -12, 360, 58);
  const hull = ctx.createLinearGradient(-130, -35, 115, 43);
  hull.addColorStop(0, "#e0ac70");
  hull.addColorStop(0.22, "#b96542");
  hull.addColorStop(0.56, "#823d36");
  hull.addColorStop(0.82, "#303b43");
  hull.addColorStop(1, "#162e3d");
  ctx.beginPath();
  ctx.moveTo(-144, -23);
  ctx.lineTo(132, -23);
  ctx.quadraticCurveTo(145, -20, 132, -4);
  ctx.lineTo(101, 20);
  ctx.quadraticCurveTo(15, 39, -88, 25);
  ctx.lineTo(-128, 4);
  ctx.closePath();
  ctx.fillStyle = hull;
  ctx.fill();
  ctx.strokeStyle = "#f4d6a3";
  ctx.lineWidth = 2.2;
  ctx.stroke();
  // Fine strakes and a metallic rub rail make the hull read as a vessel.
  for (let i = 0; i < 4; i++) {
    const y = -4 + i * 6;
    path(ctx, [[-105 + i * 5, y], [92 - i * 7, y + 10 - i * 2]], "#efb873", 1, 0.34);
  }
  path(ctx, [[-136, -21], [132, -21]], "#fff1ca", 2.4, 0.8);
  // Cabin, glazed windows, mast and rigging establish scale and orientation.
  ctx.beginPath();
  ctx.moveTo(-43, -25);
  ctx.lineTo(-28, -66);
  ctx.quadraticCurveTo(-25, -72, -15, -72);
  ctx.lineTo(40, -68);
  ctx.lineTo(58, -25);
  ctx.closePath();
  const cabin = ctx.createLinearGradient(0, -74, 0, -24);
  cabin.addColorStop(0, "#f0d39d");
  cabin.addColorStop(0.48, "#b77a50");
  cabin.addColorStop(1, "#5a4841");
  ctx.fillStyle = cabin;
  ctx.fill();
  ctx.strokeStyle = "#fbebc7";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#b9d8d5";
  ctx.beginPath();
  ctx.moveTo(-24, -63); ctx.lineTo(-4, -64); ctx.lineTo(-4, -42); ctx.lineTo(-32, -42); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -64); ctx.lineTo(35, -62); ctx.lineTo(43, -42); ctx.lineTo(4, -42); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#f9e8bd";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-144, -29); ctx.lineTo(128, -29); ctx.stroke();
  ctx.restore();
  // Water overlays the submerged keel and interrupts the silhouette at contact.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(...pts[0]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(...pts[i]);
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
  ctx.clip();
  const caustic = ctx.createLinearGradient(0, water, 0, water + 54);
  caustic.addColorStop(0, "rgba(164,226,216,.29)");
  caustic.addColorStop(0.34, "rgba(49,131,151,.25)");
  caustic.addColorStop(1, "rgba(5,24,39,.32)");
  ctx.fillStyle = caustic;
  ctx.fillRect(0, water, W, H - water);
  ctx.restore();
  path(ctx, pts, "#d6eee3", 2.7, 0.91);
  path(ctx, pts.map(([x, y]) => [x, y + 4]), "#ffffff", 0.8, 0.32);
  for (let i = 0; i < 15; i++) {
    const x = 88 + i * 56 + Math.sin(t + i) * 9;
    const y = water + 34 + ((i * 23) % 108);
    path(ctx, [[x - 11, y], [x + 8, y - 1.5], [x + 21, y]], s.glow, 1, 0.22);
  }
}
function crystal(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const cycle = ((t / 8) % 1 + 1) % 1;
  const growth = 0.5 - 0.5 * Math.cos(cycle * TAU);
  const cx = 480, cy = 340;
  glow(ctx, cx, cy, 268, s.accent, 0.11 + growth * 0.09);
  glow(ctx, cx, cy, 126, s.glow, 0.08 + growth * 0.12);

  // Six growth axes build a substantial faceted dendrite; each side branch is
  // a tapered crystal blade, not a thin snowflake line.
  const blade = (x: number, y: number, angle: number, length: number, width: number, opacity: number) => {
    if (length < 1.5 || opacity <= 0) return;
    const dx = Math.cos(angle), dy = Math.sin(angle), nx = -dy, ny = dx;
    const ex = x + dx * length, ey = y + dy * length;
    const root = width, tip = Math.max(0.8, width * 0.08);
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(x + nx * root, y + ny * root);
    ctx.lineTo(x + dx * length * 0.72 + nx * width * 0.58, y + dy * length * 0.72 + ny * width * 0.58);
    ctx.lineTo(ex + nx * tip, ey + ny * tip);
    ctx.lineTo(ex, ey);
    ctx.lineTo(ex - nx * tip, ey - ny * tip);
    ctx.lineTo(x + dx * length * 0.56 - nx * width * 0.52, y + dy * length * 0.56 - ny * width * 0.52);
    ctx.lineTo(x - nx * root * 0.42, y - ny * root * 0.42);
    ctx.closePath();
    const face = ctx.createLinearGradient(x + nx * width, y + ny * width, ex - nx * width, ey - ny * width);
    face.addColorStop(0, "rgba(116,190,211,.42)");
    face.addColorStop(0.34, "rgba(65,125,157,.82)");
    face.addColorStop(0.62, "rgba(178,234,240,.66)");
    face.addColorStop(1, "rgba(229,252,255,.94)");
    ctx.fillStyle = face;
    ctx.fill();
    ctx.strokeStyle = `rgba(220,250,255,${0.34 * opacity})`;
    ctx.lineWidth = 1.05;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + nx * width * 0.36, y + ny * width * 0.36);
    ctx.lineTo(ex - nx * tip * 0.5, ey - ny * tip * 0.5);
    ctx.strokeStyle = `rgba(245,255,255,${0.58 * opacity})`;
    ctx.lineWidth = Math.max(0.7, width * 0.075);
    ctx.stroke();
    ctx.restore();
  };

  const axes = 6;
  for (let arm = 0; arm < axes; arm++) {
    const angle = -Math.PI / 2 + arm * TAU / axes + Math.sin(cycle * TAU + arm * 1.7) * 0.009;
    const reach = 176 + seeded(arm + 329) * 44;
    const axisLength = reach * growth;
    blade(cx, cy, angle, axisLength, 12 + growth * 4, 0.94);
    for (let tier = 0; tier < 3; tier++) {
      const at = 0.31 + tier * 0.205 + seeded(arm * 7 + tier + 11) * 0.035;
      if (growth < at * 0.72) continue;
      const branchGrowth = smooth((growth - at * 0.72) / Math.max(0.12, at * 0.9));
      const bx = cx + Math.cos(angle) * axisLength * at;
      const by = cy + Math.sin(angle) * axisLength * at;
      for (const side of [-1, 1]) {
        const forkAngle = angle + side * (0.87 + tier * 0.035);
        const branchLength = (26 + tier * 5 + seeded(arm * 17 + tier * 3 + side + 17) * 12) * branchGrowth;
        blade(bx, by, forkAngle, branchLength, 5.6 - tier * 0.55, 0.78);
        if (tier === 2 && growth > 0.78) {
          const tipX = bx + Math.cos(forkAngle) * branchLength * 0.56;
          const tipY = by + Math.sin(forkAngle) * branchLength * 0.56;
          blade(tipX, tipY, forkAngle + side * 0.73, branchLength * 0.39, 2.8, smooth((growth - 0.78) / 0.18) * 0.72);
        }
      }
    }
  }

  // A cut-glass nucleus anchors the branch system in depth and catches a slow
  // moving inspection light across three distinct facets.
  const pulse = 0.5 + 0.5 * Math.sin(cycle * TAU);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, -34); ctx.lineTo(31, -17); ctx.lineTo(25, 19);
  ctx.lineTo(0, 37); ctx.lineTo(-29, 17); ctx.lineTo(-33, -18); ctx.closePath();
  const nucleus = ctx.createLinearGradient(-28, -24, 30, 28);
  nucleus.addColorStop(0, "rgba(235,255,255,.95)");
  nucleus.addColorStop(0.34, "rgba(113,193,218,.86)");
  nucleus.addColorStop(0.66, "rgba(55,108,145,.92)");
  nucleus.addColorStop(1, "rgba(14,35,58,.98)");
  ctx.fillStyle = nucleus; ctx.fill();
  ctx.strokeStyle = "rgba(231,252,255,.82)"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(3, 2); ctx.lineTo(-29, 17);
  ctx.moveTo(3, 2); ctx.lineTo(31, -17); ctx.moveTo(3, 2); ctx.lineTo(25, 19);
  ctx.strokeStyle = `rgba(240,255,255,${0.38 + pulse * 0.34})`; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.restore();
  for (let i = 0; i < 92; i++) {
    const angle = seeded(i + 201) * TAU;
    const radius = 205 + seeded(i + 801) * 235;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius * 0.62;
    const twinkle = 0.18 + 0.48 * (0.5 + 0.5 * Math.sin(cycle * TAU + i * 1.37));
    dot(ctx, x, y, 0.45 + seeded(i + 1201) * 1.35, i % 7 === 0 ? s.glow : s.ink, twinkle);
  }
}
function avalanche(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const cycle = (t / 8) % 1;
  const release = smooth((cycle - 0.12) / 0.4);
  const settle = smooth((cycle - 0.63) / 0.19);
  const resetVeil = smooth((cycle - 0.87) / 0.07) * (1 - smooth((cycle - 0.97) / 0.025));
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#a8c2d0"); sky.addColorStop(0.48, "#dce8e8"); sky.addColorStop(1, "#6e8791");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  // Distant ridges give depth without competing with the active fracture.
  for (const [offset, color, alpha] of [[0, "#647b88", 0.35], [44, "#8199a3", 0.5], [90, "#d5e0df", 0.88]] as const) {
    ctx.beginPath(); ctx.moveTo(0, 328 + offset * 0.4);
    for (let x = 0; x <= W; x += 22) {
      const y = 285 + offset + Math.sin(x * 0.009 + offset) * 24 + Math.sin(x * 0.021) * 11;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fill();
  }
  ctx.globalAlpha = 1;
  const mountain = [[80, 430], [264, 273], [394, 203], [485, 233], [570, 160], [888, 414], [900, 510], [72, 510]] as [number, number][];
  ctx.beginPath(); ctx.moveTo(...mountain[0]); mountain.slice(1).forEach((p) => ctx.lineTo(...p)); ctx.closePath();
  const snow = ctx.createLinearGradient(0, 165, 0, 510);
  snow.addColorStop(0, "#ffffff"); snow.addColorStop(0.34, "#dce8e9"); snow.addColorStop(0.78, "#9fb7bf"); snow.addColorStop(1, "#607987");
  ctx.fillStyle = snow; ctx.fill();
  path(ctx, mountain.slice(0, 6), "#536a75", 3, 0.7);
  // Wind-carved strata follow the slope, revealing the steep relief.
  for (let band = 0; band < 13; band++) {
    const yy = 257 + band * 17;
    path(ctx, [[165, yy + 15], [314, yy - 29], [465, yy + 11], [612, yy - 16], [817, yy + 41]], "#718e99", band % 3 === 0 ? 1.3 : 0.7, 0.18 + (band % 3 === 0 ? 0.14 : 0));
  }
  const sx = release * (1 - settle);
  const shiftX = 230 * sx;
  const shiftY = 168 * sx;
  // Cohesive slab breaks at a crown fracture, then translates down the incline.
  ctx.save();
  ctx.translate(shiftX, shiftY);
  ctx.beginPath();
  ctx.moveTo(395, 219); ctx.lineTo(474, 235); ctx.lineTo(559, 181); ctx.lineTo(682, 278);
  ctx.lineTo(797, 382); ctx.lineTo(751, 419); ctx.lineTo(650, 385); ctx.lineTo(548, 333);
  ctx.lineTo(457, 286); ctx.closePath();
  const slab = ctx.createLinearGradient(420, 205, 696, 411);
  slab.addColorStop(0, "#fbffff"); slab.addColorStop(0.45, "#dce8ec"); slab.addColorStop(1, "#a8bdc4");
  ctx.fillStyle = slab; ctx.globalAlpha = 1 - settle * 0.88; ctx.fill();
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.4; ctx.stroke();
  // Crown crack and internal shear bands communicate slab release.
  path(ctx, [[397, 218], [405, 231], [399, 241], [412, 251], [406, 263], [424, 273]], "#526b77", 2.2, 0.84);
  for (let i = 0; i < 5; i++)
    path(ctx, [[463 + i * 13, 276 + i * 9], [555 + i * 14, 298 + i * 15], [674 + i * 13, 336 + i * 12]], "#7c9ba4", 1, 0.24);
  ctx.restore();
  // A leading debris front accelerates downslope, with larger blocks near the core.
  for (let i = 0; i < 118; i++) {
    const seed = seeded(i + 224), born = 0.15 + seeded(i + 47) * 0.23;
    const age = Math.max(0, Math.min(1, (cycle - born) / (0.53 - born)));
    if (age <= 0 || age >= 0.96) continue;
    const distance = age * age * (170 + seed * 180);
    const x = 432 + seed * 110 + distance * 0.8 + Math.sin(i * 2.7 + cycle * 8) * (3 + age * 8);
    const y = 244 + seed * 65 + distance * 0.54;
    const size = 1.5 + seeded(i + 83) * 6.2;
    ctx.save(); ctx.translate(x, y); ctx.rotate(age * 5 + seed * TAU);
    ctx.fillStyle = i % 5 ? "#eff8f8" : "#9db4bd";
    ctx.globalAlpha = (1 - age * 0.32) * (1 - settle * 0.9);
    ctx.beginPath(); ctx.moveTo(-size, -size * .6); ctx.lineTo(size * .9, -size * .45); ctx.lineTo(size * .35, size); ctx.lineTo(-size * .8, size * .55); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // Dense powder cloud rolls at the front, then veils the reset at the loop seam.
  for (let i = 0; i < 56; i++) {
    const seed = seeded(i + 554), spread = release * (1 - settle);
    const x = 550 + spread * 210 + (seed - .5) * (130 + spread * 185);
    const y = 383 + spread * 91 + seeded(i + 654) * 78 - Math.sin(cycle * Math.PI) * 44;
    const radius = 8 + seeded(i + 754) * 30;
    const puff = ctx.createRadialGradient(x - radius * .22, y - radius * .32, 1, x, y, radius);
    puff.addColorStop(0, `rgba(255,255,255,${0.23 + spread * .27})`);
    puff.addColorStop(1, "rgba(230,242,244,0)");
    ctx.fillStyle = puff; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  if (resetVeil > 0) {
    const whiteout = ctx.createRadialGradient(480, 375, 40, 480, 375, 610);
    whiteout.addColorStop(0, `rgba(247,252,252,${resetVeil * 0.92})`);
    whiteout.addColorStop(1, `rgba(232,244,246,${resetVeil * 0.78})`);
    ctx.fillStyle = whiteout; ctx.fillRect(0, 0, W, H);
  }
}
function plasma(ctx: CanvasRenderingContext2D, s: Scene, t: number) {
  const cycle = (t / 8) % 1;
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#07101e"); sky.addColorStop(0.58, "#111a2a"); sky.addColorStop(1, "#030812");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 95; i++) {
    const x = seeded(i + 1300) * W, y = 28 + seeded(i + 1400) * 360;
    dot(ctx, x, y, 0.5 + seeded(i + 1500) * 1.3, "#f5d5a0", 0.12 + seeded(i + 1600) * 0.27);
  }
  // Curved coronal streamers lift from an undersized, partially framed solar limb.
  const limbY = 472;
  const disk = ctx.createRadialGradient(480, 478, 35, 480, 478, 255);
  disk.addColorStop(0, "#ffd878"); disk.addColorStop(0.55, "#f88a37"); disk.addColorStop(0.83, "#b84427"); disk.addColorStop(1, "#35151b");
  ctx.beginPath(); ctx.arc(480, 520, 245, Math.PI * 1.08, Math.PI * 1.92);
  ctx.lineTo(480, 520); ctx.closePath(); ctx.fillStyle = disk; ctx.fill();
  glow(ctx, 480, limbY + 26, 265, s.accent, 0.44);
  // Granulated photosphere, bounded to the visible solar cap.
  for (let i = 0; i < 520; i++) {
    const x = 250 + seeded(i + 1700) * 460;
    const y = 400 + seeded(i + 1800) * 145;
    if ((x - 480) ** 2 + (y - 520) ** 2 > 245 ** 2) continue;
    dot(ctx, x, y, 0.7 + seeded(i + 1900) * 2.3, i % 6 ? "#ffd981" : "#ee642d", 0.16 + seeded(i + 2000) * 0.28);
  }
  // Asymmetric active region: compact loops at left, an erupting prominence at right.
  const activeX = 548 + Math.sin(cycle * TAU) * 11;
  for (let loop = 0; loop < 7; loop++) {
    const width = 26 + loop * 12;
    const height = 54 + loop * 21 + Math.sin(cycle * TAU + loop * .7) * 5;
    const pts: [number, number][] = [];
    for (let j = 0; j <= 64; j++) {
      const q = j / 64;
      const x = activeX - width + q * width * 2 + Math.sin(q * Math.PI) * (loop - 3) * 3;
      const y = limbY - Math.sin(q * Math.PI) * height - Math.sin(q * TAU) * 3;
      pts.push([x, y]);
    }
    path(ctx, pts, loop % 3 === 0 ? "#fff0bd" : "#ff9a47", loop % 3 === 0 ? 2.5 : 1.2, 0.78 - loop * 0.035);
    path(ctx, pts, "#ef672e", 7 + loop * .6, 0.06);
  }
  const flare = Math.pow(Math.max(0, Math.sin(cycle * TAU - 1.4)), 9);
  const plume: [number, number][] = [];
  for (let j = 0; j <= 60; j++) {
    const q = j / 60;
    plume.push([activeX + 12 + 100 * q + Math.sin(q * Math.PI * 1.2) * 30, limbY - 22 - q * (182 + flare * 34)]);
  }
  path(ctx, plume, "#ff742d", 15, 0.09 + flare * 0.08);
  path(ctx, plume, "#ff9d49", 3.2 + flare * 1.2, 0.48 + flare * .32);
  path(ctx, plume, "#fff1c0", 1.2, 0.56 + flare * .3);
  for (let i = 0; i < 34; i++) {
    const age = (cycle + seeded(i + 2150)) % 1;
    const x = activeX + 12 + age * 136 + Math.sin(age * 7 + i) * 17;
    const y = limbY - 22 - age * 202 + Math.sin(age * Math.PI) * 28;
    glow(ctx, x, y, 8 + seeded(i + 2250) * 10, "#ff9a48", 0.22 * (1 - age));
    dot(ctx, x, y, 1.4 + seeded(i + 2350) * 2.5, "#ffe4a0", 0.75 * (1 - age * .45));
  }
  // Broad, irregular streamers frame the active prominence rather than forming a row of arches.
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? -1 : 1;
    const offset = 145 + Math.floor(i / 2) * 53;
    const pts: [number, number][] = [];
    for (let j = 0; j <= 48; j++) {
      const q = j / 48;
      const x = 480 + side * (offset + q * (28 + i * 6)) + Math.sin(q * Math.PI) * side * 15;
      const y = limbY - Math.sin(q * Math.PI * 0.82) * (78 + i * 20);
      pts.push([x, y]);
    }
    path(ctx, pts, i % 3 ? "#e97838" : "#ffd080", i % 3 ? 1.2 : 2, 0.34);
  }
}

const renderers: Record<
  string,
  (ctx: CanvasRenderingContext2D, s: Scene, t: number) => void
> = {
  fire,
  smoke,
  splash: waterImpact,
  swell,
  wind,
  lightning,
  rain,
  snow,
  sandfall,
  ferrofluid: ferro,
  bubble: bubbles,
  lava,
  cloth,
  pendulum,
  domino,
  debris,
  billiards,
  membrane,
  rope,
  orbit,
  whirlpool,
  fountain,
  shockwave,
  magnetic,
  dust,
  paper: paper,
  buoyancy,
  crystal,
  avalanche,
  plasma,
};
const mount: Mount = async (root, options) => {
  const scene = scenes.find((x) => x.key === options.variant);
  if (!scene) throw new Error(`Unknown physical study: ${options.variant}`);
  Object.assign(root.style, {
    position: "relative",
    width: "960px",
    height: "540px",
    overflow: "hidden",
    background: scene.background,
    isolation: "isolate",
  });
  const { canvas, context: ctx } = canvas2d(
    root,
    `${scene.title}; deterministic procedural physical visualization`,
  );
  let impulse: { x: number; y: number; at: number } | null = null;
  const localPoint = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    impulse = {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
      at: performance.now() / 1000,
    };
  };
  const key = (e: KeyboardEvent) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      impulse = { x: 480, y: 310, at: performance.now() / 1000 };
    }
  };
  canvas.tabIndex = 0;
  canvas.style.touchAction = "manipulation";
  canvas.setAttribute(
    "aria-label",
    `${scene.title}. 點選畫面或按空白鍵施加局部擾動。`,
  );
  canvas.addEventListener("pointerdown", localPoint);
  canvas.addEventListener("keydown", key);
  const seek = (seconds: number) => {
    const t = phase(seconds);
    ctx.clearRect(0, 0, W, H);
    frame(ctx, scene);
    renderers[scene.key](ctx, scene, t);
    if (impulse) {
      const age = performance.now() / 1000 - impulse.at;
      if (age < 1.4) {
        const a = 1 - age / 1.4;
        ctx.save();
        ctx.globalAlpha = a * 0.5;
        ctx.strokeStyle = scene.glow;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(impulse.x, impulse.y, 18 + age * 140, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(impulse.x, impulse.y, 8 + age * 95, 0, TAU);
        ctx.stroke();
        ctx.restore();
      } else impulse = null;
    }
  };
  seek(0);
  return lifecycle(options, seek, () => {
    canvas.removeEventListener("pointerdown", localPoint);
    canvas.removeEventListener("keydown", key);
    canvas.remove();
  });
};
export default mount;
