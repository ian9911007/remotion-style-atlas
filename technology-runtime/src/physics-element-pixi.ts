/** Created: 2026-10-05. Absolute-time PixiJS particle studies for wind and granular motion. */
import {
  Application,
  Graphics,
  Particle,
  ParticleContainer,
  Rectangle,
  Sprite,
  Texture,
} from "pixi.js";
import type { Mount } from "./types";
import { H, W, lifecycle, phase, seeded } from "./gpu-common";
import { physicsElementScenes } from "./physics-element-scenes";

type ParticleState = {
  sprite: Particle;
  seed: number;
  x: number;
  y: number;
  size: number;
  spin: number;
};

const colors = {
  snow: [0xeaf5ff, 0xaedcf1, 0xffedce],
  sandfall: [0xffdfa1, 0xf0b860, 0xc47731],
};

function snowBackdrop(): { view: Sprite; texture: Texture } {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#101c2c");
  sky.addColorStop(0.42, "#667c8b");
  sky.addColorStop(0.68, "#bccbd0");
  sky.addColorStop(1, "#d4d8d3");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const dawn = ctx.createRadialGradient(738, 174, 3, 738, 174, 370);
  dawn.addColorStop(0, "rgba(239,203,157,.32)");
  dawn.addColorStop(0.34, "rgba(167,192,199,.18)");
  dawn.addColorStop(1, "rgba(167,192,199,0)");
  ctx.fillStyle = dawn;
  ctx.fillRect(350, 0, 610, 500);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let band = 0; band < 4; band++) {
    const y = 96 + band * 22;
    const aurora = ctx.createLinearGradient(90, y, 860, y + 36);
    aurora.addColorStop(0, "rgba(107,163,158,0)");
    aurora.addColorStop(0.35, "rgba(119,184,171,.14)");
    aurora.addColorStop(0.7, "rgba(185,193,161,.11)");
    aurora.addColorStop(1, "rgba(105,153,160,0)");
    ctx.fillStyle = aurora;
    ctx.beginPath();
    ctx.moveTo(40, y + 45);
    ctx.bezierCurveTo(240, y - 25, 370, y + 30, 520, y - 4);
    ctx.bezierCurveTo(680, y - 40, 790, y + 24, 940, y - 12);
    ctx.lineTo(940, y + 18);
    ctx.bezierCurveTo(760, y + 60, 650, y + 12, 505, y + 36);
    ctx.bezierCurveTo(325, y + 69, 190, y + 15, 40, y + 68);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  for (let i = 0; i < 130; i++) {
    const x = seeded(i + 938) * W;
    const y = seeded(i + 1120) * 250;
    const r = 0.35 + seeded(i + 1280) * 1.15;
    ctx.globalAlpha = 0.12 + seeded(i + 1380) * 0.48;
    ctx.fillStyle = i % 7 === 0 ? "#fff0d8" : "#e9f5f8";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const drawRidge = (
    points: number[][],
    colors: [string, string],
    topLine: string,
    alpha: number,
  ) => {
    const g = ctx.createLinearGradient(0, 170, 0, H);
    g.addColorStop(0, colors[0]);
    g.addColorStop(1, colors[1]);
    ctx.beginPath();
    ctx.moveTo(points[0][0], H);
    ctx.lineTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1], current = points[i];
      const midX = (prev[0] + current[0]) * 0.5;
      const midY = (prev[1] + current[1]) * 0.5;
      ctx.quadraticCurveTo(prev[0], prev[1], midX, midY);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last[0], last[1]);
    ctx.lineTo(last[0], H);
    ctx.closePath();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.42;
    ctx.strokeStyle = topLine;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(...(points[0] as [number, number]));
    for (let i = 1; i < points.length; i++) {
      const previous = points[i - 1], current = points[i];
      const midX = (previous[0] + current[0]) * 0.5;
      const midY = (previous[1] + current[1]) * 0.5;
      ctx.quadraticCurveTo(previous[0], previous[1], midX, midY);
    }
    const lastPoint = points[points.length - 1];
    ctx.lineTo(lastPoint[0], lastPoint[1]);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  drawRidge(
    [[0, 318], [94, 266], [188, 289], [322, 192], [413, 263], [552, 218], [680, 279], [801, 177], [960, 283]],
    ["#8096a1", "#455963"],
    "#dbe5e7",
    0.78,
  );
  drawRidge(
    [[0, 380], [116, 323], [232, 358], [364, 281], [492, 343], [627, 296], [748, 357], [861, 289], [960, 340]],
    ["#526e7d", "#1c3343"],
    "#e4ecea",
    0.96,
  );
  drawRidge(
    [[0, 438], [104, 394], [219, 421], [333, 366], [448, 428], [563, 379], [682, 424], [807, 365], [960, 416]],
    ["#324c5a", "#142735"],
    "#dce7e8",
    1,
  );

  const snowShelf = ctx.createLinearGradient(0, 398, 0, H);
  snowShelf.addColorStop(0, "rgba(236,241,235,.95)");
  snowShelf.addColorStop(0.42, "rgba(189,205,208,.92)");
  snowShelf.addColorStop(1, "rgba(112,137,149,.94)");
  ctx.fillStyle = snowShelf;
  ctx.beginPath();
  ctx.moveTo(0, 425);
  ctx.bezierCurveTo(170, 388, 247, 449, 395, 422);
  ctx.bezierCurveTo(560, 393, 708, 451, 960, 412);
  ctx.lineTo(960, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  const pine = (x: number, base: number, height: number, tint: string, opacity: number, seed: number) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.filter = height < 54 ? "blur(1.2px)" : "none";
    ctx.fillStyle = tint;
    ctx.beginPath();
    const levels = 22;
    const left: [number, number][] = [], right: [number, number][] = [];
    for (let j = 0; j <= levels; j++) {
      const q = j / levels;
      const branch = 0.035 + Math.pow(q, 0.92) * 0.285;
      const asymmetry = (seeded(seed + j * 2) - 0.5) * height * 0.035;
      const y = base - height + q * height;
      left.push([x - branch * height + asymmetry, y]);
      right.push([x + branch * height + asymmetry * 0.42, y]);
    }
    ctx.moveTo(x + (seeded(seed + 77) - 0.5) * 2, base - height);
    for (const point of left.slice(1)) ctx.lineTo(...point);
    for (const point of right.reverse()) ctx.lineTo(...point);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(228,239,236,.25)";
    ctx.lineWidth = Math.max(0.55, height * 0.009);
    ctx.beginPath();
    for (let tier = 3; tier < 19; tier += 2) {
      const q = tier / levels;
      const branch = 0.035 + Math.pow(q, 0.92) * 0.285;
      const y = base - height + q * height;
      const sweep = height * (0.05 + seeded(seed + tier * 3) * 0.035);
      ctx.moveTo(x - branch * height * 0.78, y - 2);
      ctx.quadraticCurveTo(x, y + sweep, x + branch * height * 0.78, y - 2);
    }
    ctx.stroke();
    ctx.strokeStyle = "rgba(236,244,242,.13)";
    ctx.lineWidth = Math.max(0.4, height * 0.005);
    ctx.beginPath();
    ctx.moveTo(x, base - height * 0.9);
    ctx.lineTo(x + (seeded(seed + 91) - 0.5) * height * 0.08, base - height * 0.04);
    ctx.stroke();
    ctx.restore();
  };
  for (let i = 0; i < 34; i++) {
    const x = seeded(i + 520) * W;
    const base = 425 + seeded(i + 620) * 85;
    const size = 26 + seeded(i + 720) * 96;
    pine(
      x,
      base,
      size,
      i % 3 === 0 ? "#172d37" : "#203943",
      0.45 + size / 190,
      i + 520,
    );
  }

  const fog = ctx.createLinearGradient(0, 330, 0, 500);
  fog.addColorStop(0, "rgba(225,234,231,0)");
  fog.addColorStop(0.54, "rgba(225,234,231,.2)");
  fog.addColorStop(1, "rgba(225,234,231,0)");
  ctx.fillStyle = fog;
  ctx.fillRect(0, 300, W, 220);

  const texture = Texture.from(canvas);
  const view = new Sprite(texture);
  view.width = W;
  view.height = H;
  return { view, texture };
}

function hourglassBackdrop(): { view: Sprite; texture: Texture } {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const wall = ctx.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, "#17100c");
  wall.addColorStop(0.55, "#2a1d15");
  wall.addColorStop(1, "#100c09");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, H);
  const spot = ctx.createRadialGradient(480, 258, 8, 480, 258, 510);
  spot.addColorStop(0, "rgba(219,148,73,.22)");
  spot.addColorStop(0.42, "rgba(141,88,45,.11)");
  spot.addColorStop(1, "rgba(71,40,24,0)");
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 96; i++) {
    const x = seeded(i + 505) * W;
    const y = 24 + seeded(i + 605) * 470;
    const r = 0.35 + seeded(i + 705) * 1.2;
    ctx.globalAlpha = 0.04 + seeded(i + 805) * 0.12;
    ctx.fillStyle = i % 5 === 0 ? "#f7d79f" : "#d29a56";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.translate(480, 0);
  ctx.scale(0.78, 1);
  ctx.translate(-480, 0);
  const metal = ctx.createLinearGradient(0, 80, 0, 465);
  metal.addColorStop(0, "#f1d6a1");
  metal.addColorStop(0.12, "#8d693f");
  metal.addColorStop(0.5, "#463321");
  metal.addColorStop(0.86, "#a17a48");
  metal.addColorStop(1, "#f0cf8f");
  for (const x of [270, 680]) {
    ctx.fillStyle = "rgba(0,0,0,.38)";
    ctx.fillRect(x + 4, 92, 12, 364);
    ctx.fillStyle = metal;
    ctx.fillRect(x, 91, 8, 358);
    ctx.fillStyle = "rgba(255,231,185,.72)";
    ctx.fillRect(x + 1, 96, 1.2, 348);
  }
  const rail = (y: number) => {
    const gradient = ctx.createLinearGradient(0, y, 0, y + 24);
    gradient.addColorStop(0, "#f4d9a4");
    gradient.addColorStop(0.2, "#b38a53");
    gradient.addColorStop(0.55, "#5f472f");
    gradient.addColorStop(1, "#d3ad70");
    ctx.fillStyle = "rgba(0,0,0,.4)";
    ctx.fillRect(250, y + 4, 460, 21);
    ctx.fillStyle = gradient;
    ctx.fillRect(250, y, 460, 19);
    ctx.fillStyle = "rgba(255,239,204,.58)";
    ctx.fillRect(254, y + 2, 452, 1);
    ctx.fillStyle = "rgba(37,25,15,.72)";
    ctx.fillRect(254, y + 16, 452, 1.4);
  };
  rail(82);
  rail(440);

  const upper = new Path2D();
  upper.moveTo(342, 108);
  upper.bezierCurveTo(365, 169, 428, 228, 470, 260);
  upper.quadraticCurveTo(480, 268, 490, 260);
  upper.bezierCurveTo(532, 228, 595, 169, 618, 108);
  upper.closePath();
  const lower = new Path2D();
  lower.moveTo(470, 282);
  lower.bezierCurveTo(428, 314, 365, 373, 342, 434);
  lower.lineTo(618, 434);
  lower.bezierCurveTo(595, 373, 532, 314, 490, 282);
  lower.quadraticCurveTo(480, 274, 470, 282);
  lower.closePath();

  ctx.fillStyle = "rgba(180,208,201,.10)";
  ctx.fill(upper);
  ctx.fill(lower);
  const floor = ctx.createLinearGradient(0, 454, 0, 526);
  floor.addColorStop(0, "rgba(0,0,0,0)");
  floor.addColorStop(0.5, "rgba(0,0,0,.22)");
  floor.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = floor;
  ctx.fillRect(188, 454, 584, 74);
  const reflection = ctx.createRadialGradient(480, 461, 10, 480, 461, 235);
  reflection.addColorStop(0, "rgba(231,177,105,.18)");
  reflection.addColorStop(1, "rgba(231,177,105,0)");
  ctx.fillStyle = reflection;
  ctx.fillRect(245, 430, 470, 104);
  ctx.restore();

  const texture = Texture.from(canvas);
  const view = new Sprite(texture);
  view.width = W;
  view.height = H;
  return { view, texture };
}

function hourglassGlassOverlay(): Graphics {
  const glass = new Graphics();
  glass.scale.set(0.78, 1);
  glass.x = W * 0.11;
  glass
    .moveTo(342, 108)
    .bezierCurveTo(365, 169, 428, 228, 470, 260)
    .quadraticCurveTo(480, 268, 490, 260)
    .bezierCurveTo(532, 228, 595, 169, 618, 108)
    .stroke({ color: 0xe2e8d7, width: 2, alpha: 0.74 });
  glass
    .moveTo(470, 282)
    .bezierCurveTo(428, 314, 365, 373, 342, 434)
    .moveTo(618, 434)
    .bezierCurveTo(595, 373, 532, 314, 490, 282)
    .stroke({ color: 0xe4d9c0, width: 2, alpha: 0.58 });
  glass
    .moveTo(350, 114)
    .bezierCurveTo(373, 177, 433, 230, 475, 262)
    .stroke({ color: 0xffffff, width: 1.1, alpha: 0.64 });
  glass
    .moveTo(610, 114)
    .bezierCurveTo(587, 177, 527, 230, 485, 262)
    .stroke({ color: 0xffdfaa, width: 1.1, alpha: 0.4 });
  glass
    .moveTo(350, 428)
    .bezierCurveTo(374, 368, 432, 314, 475, 280)
    .stroke({ color: 0xffffff, width: 1.1, alpha: 0.35 });
  glass
    .moveTo(610, 428)
    .bezierCurveTo(586, 368, 528, 314, 485, 280)
    .stroke({ color: 0xe5c28d, width: 1.1, alpha: 0.32 });
  glass
    .moveTo(468, 269)
    .quadraticCurveTo(480, 275, 492, 269)
    .stroke({ color: 0xffedc6, width: 2.5, alpha: 0.8 });
  glass
    .moveTo(342, 108)
    .lineTo(618, 108)
    .moveTo(342, 434)
    .lineTo(618, 434)
    .stroke({ color: 0xffe3b2, width: 3, alpha: 0.88 });
  return glass;
}

type Backdrop = { view: Graphics | Sprite; texture?: Texture };
function backdrop(key: string, background: string, accent: number): Backdrop {
  if (key === "snow") return snowBackdrop();
  if (key === "sandfall") return hourglassBackdrop();
  const art = new Graphics();
  const color = Number(`0x${background.slice(1)}`);
  art.rect(0, 0, W, H).fill(color);
  void accent;
  return { view: art };
}

function createParticleTexture(app: Application, key: string) {
  const graphic = new Graphics();
  if (key === "snow") {
    graphic.circle(16, 16, 7).fill({ color: 0xdcebf1, alpha: 0.13 });
    graphic.circle(16, 16, 3.8).fill({ color: 0xffffff, alpha: 0.32 });
    graphic.circle(15.2, 14.8, 1.4).fill({ color: 0xffffff, alpha: 0.96 });
    graphic.ellipse(18.8, 18.5, 1.5, 0.8).fill({ color: 0xb7d4df, alpha: 0.42 });
  } else {
    graphic.ellipse(16, 16, 11, 7).fill(0xffffff);
    graphic.ellipse(13, 13, 4, 1.4).fill({ color: 0xffffff, alpha: 0.68 });
  }
  const texture = app.renderer.generateTexture({
    target: graphic,
    resolution: 2,
  });
  graphic.destroy();
  return texture;
}

const mount: Mount = async (root, options) => {
  const key = options.variant;
  if (key !== "snow" && key !== "sandfall")
    throw new Error(`Unknown Pixi study: ${key}`);
  const scene = physicsElementScenes.find(
    (candidate) => candidate.key === key,
  )!;
  const app = new Application();
  try {
    await app.init({
      width: W,
      height: H,
      backgroundColor: Number(`0x${scene.background.slice(1)}`),
      antialias: true,
      resolution: 1,
      autoStart: false,
      preference: "webgl",
      powerPreference: "high-performance",
    });
  } catch {
    const { default: mountCanvas } = await import("./physics-elements");
    return mountCanvas(root, options);
  }

  Object.assign(root.style, {
    position: "relative",
    width: `${W}px`,
    height: `${H}px`,
    overflow: "hidden",
    background: scene.background,
    isolation: "isolate",
  });
  app.canvas.style.cssText = `display:block;width:${W}px;height:${H}px;touch-action:manipulation`;
  app.canvas.tabIndex = 0;
  app.canvas.setAttribute(
    "aria-label",
    key === "snow"
      ? "PixiJS WebGL 雪晶隨側風漂移；點擊或按空白鍵觸發一陣風。"
      : "PixiJS WebGL 沙粒穿越沙漏並落入顆粒堆；點擊或按空白鍵觸發沙粒擾動。",
  );
  root.replaceChildren(app.canvas);
  const stage = app.stage;
  const background = backdrop(
    key,
    scene.background,
    Number(`0x${scene.accent.slice(1)}`),
  );
  stage.addChild(background.view);
  const sandTop = key === "sandfall" ? new Graphics() : null;
  const sandPile = key === "sandfall" ? new Graphics() : null;
  if (sandTop) stage.addChild(sandTop);
  if (sandPile) stage.addChild(sandPile);

  const texture = createParticleTexture(app, key);
  const particles = new ParticleContainer({
    texture,
    dynamicProperties: {
      position: true,
      rotation: true,
      color: true,
      vertex: true,
    },
    roundPixels: false,
  });
  particles.boundsArea = new Rectangle(0, 0, W, H);
  stage.addChild(particles);
  if (key === "sandfall") stage.addChild(hourglassGlassOverlay());

  const palette = colors[key];
  const count = key === "snow" ? 560 : 440;
  const states: ParticleState[] = [];
  for (let i = 0; i < count; i++) {
    const seed = seeded(i + (key === "snow" ? 140 : 470));
    const color = palette[i % palette.length];
    const sprite = new Particle({
      texture,
      x: seeded(i + 16) * W,
      y: seeded(i + 47) * H,
      scaleX: key === "snow"
        ? 0.1 + seeded(i + 93) * 0.52
        : 0.075 + seeded(i + 93) * 0.28,
      scaleY: key === "snow"
        ? 0.1 + seeded(i + 115) * 0.52
        : 0.075 + seeded(i + 115) * 0.28,
      alpha: 0.7,
      tint: color,
      rotation: seeded(i + 151) * Math.PI,
    });
    particles.addParticle(sprite);
    states.push({
      sprite,
      seed,
      x: seeded(i + 16) * W,
      y: seeded(i + 47) * H,
      size: key === "snow"
        ? 0.1 + seeded(i + 93) * 0.52
        : 0.075 + seeded(i + 93) * 0.28,
      spin: (seeded(i + 151) - 0.5) * 1.8,
    });
  }

  let currentTime = 0;
  let gustAt = -20;
  let gustX = 0.5;
  let gustY = 0.5;
  const trigger = (x: number, y: number) => {
    gustAt = currentTime;
    gustX = x;
    gustY = y;
  };
  const pointer = (event: PointerEvent) => {
    const rect = app.canvas.getBoundingClientRect();
    trigger(
      (event.clientX - rect.left) / rect.width,
      (event.clientY - rect.top) / rect.height,
    );
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.code === "Space" || event.code === "Enter") {
      event.preventDefault();
      trigger(0.5, key === "snow" ? 0.52 : 0.46);
    }
  };
  app.canvas.addEventListener("pointerdown", pointer);
  app.canvas.addEventListener("keydown", keydown);

  const seek = (seconds: number) => {
    currentTime = phase(seconds);
    const cycle = currentTime / 8;
    const turn = cycle * Math.PI * 2;
    const gustAge = currentTime - gustAt;
    for (const p of states) {
      const q = (p.seed + cycle) % 1;
      if (key === "snow") {
        const depth = 0.32 + p.size * 1.8;
        p.sprite.x =
          (p.x + cycle * (58 + depth * 34) +
            Math.sin(turn + p.seed * 11) * (10 + p.size * 30) +
            Math.sin(turn * 2 + p.seed * 19) * 9 +
            W * 2) % W;
        p.sprite.y = (p.y + cycle * H * depth + H) % H;
        p.sprite.rotation =
          p.seed * Math.PI + Math.sin(turn + p.seed * 8) * 0.34;
        const depthAlpha = 0.26 + p.size * 0.68;
        const gust =
          gustAge >= 0 && gustAge < 1.4
            ? Math.exp(
                -Math.pow((p.sprite.x / W - gustX) * 3.0, 2) -
                  Math.pow((p.sprite.y / H - gustY) * 2.3, 2),
              ) *
              Math.sin(gustAge * 8) *
              (1 - gustAge / 1.4)
            : 0;
        p.sprite.x += gust * 38;
        p.sprite.alpha =
          depthAlpha * (0.78 + 0.22 * Math.sin(turn * 2 + p.seed * 17));
      } else {
        const life = q;
        const spread = 1.8 + life * 12;
        p.sprite.x = 480 + Math.sin(p.seed * 23 + life * 3.2) * spread;
        // Screen-space y grows downward. Sand leaves the narrow neck and falls
        // into the lower chamber instead of appearing throughout the vessel.
        p.sprite.y = 270 + life * 142;
        const fade = Math.min(1, life / 0.055, (1 - life) / 0.055);
        p.sprite.alpha = Math.max(0, fade) * (0.42 + 0.52 * (1 - p.seed));
        p.sprite.rotation = p.seed * Math.PI + turn * p.spin;
        const hit =
          gustAge >= 0 && gustAge < 1.1
            ? Math.exp(
                -Math.pow((p.sprite.x / W - gustX) * 8, 2) -
                  Math.pow((p.sprite.y / H - gustY) * 5, 2),
              ) *
              (1 - gustAge / 1.1)
            : 0;
        p.sprite.x += hit * Math.sin(p.seed * 42) * 46;
        p.sprite.y += hit * Math.cos(p.seed * 27) * 28;
      }
    }
    if (sandPile && sandTop) {
      const level = 108 + cycle * 142;
      const left = 365 + (level - 108) * 0.70;
      const right = 595 - (level - 108) * 0.70;
      sandTop.clear();
      sandTop
        .poly([left, level, right, level, 488, 260, 472, 260])
        .fill({ color: 0xd69a50, alpha: 0.98 });
      sandTop
        .moveTo(left + 2, level + 1)
        .bezierCurveTo(left + (right - left) * 0.32, level + 4,
          left + (right - left) * 0.67, level - 2, right - 2, level + 1)
        .stroke({ color: 0xffdf9a, width: 1.3, alpha: 0.78 });

      const halfWidth = 8 + cycle * 86;
      const height = 8 + cycle * 74;
      const base = 434;
      const top = base - height;
      sandPile.clear();
      sandPile
        .moveTo(480 - halfWidth, base)
        .lineTo(480 - halfWidth * 0.88, top + height * 0.38)
        .quadraticCurveTo(480 - halfWidth * 0.34, top + 1, 480 + halfWidth * 0.08, top)
        .quadraticCurveTo(480 + halfWidth * 0.56, top + height * 0.17, 480 + halfWidth, base)
        .closePath()
        .fill({ color: 0xc88a47, alpha: 0.98 });
      sandPile
        .poly([
          480 - halfWidth, base,
          480 - halfWidth * 0.88, top + height * 0.38,
          480 + halfWidth * 0.08, top,
          480 + halfWidth * 0.48, base,
        ])
        .fill({ color: 0x754624, alpha: 0.24 });
      sandPile
        .moveTo(480 - halfWidth * 0.82, top + height * 0.4)
        .quadraticCurveTo(480 - halfWidth * 0.25, top - 2, 480 + halfWidth * 0.08, top)
        .quadraticCurveTo(480 + halfWidth * 0.53, top + height * 0.1, 480 + halfWidth * 0.78, top + height * 0.38)
        .stroke({ color: 0xffd796, width: 2, alpha: 0.76 });
      for (let i = 0; i < 44; i++) {
        const seed = seeded(i + 2200);
        const gx = 480 + (seed - 0.5) * halfWidth * 1.5;
        const gy = top + 2 + seeded(i + 2300) * Math.max(2, height * 0.42);
        sandPile.circle(gx, gy, 0.65 + seeded(i + 2400) * 1.3).fill({
          color: i % 3 ? 0xffdf9d : 0x764322,
          alpha: 0.23 + seeded(i + 2500) * 0.3,
        });
      }
    }
    app.render();
  };
  seek(0);
  return lifecycle(options, seek, () => {
    app.canvas.removeEventListener("pointerdown", pointer);
    app.canvas.removeEventListener("keydown", keydown);
    app.destroy(
      { removeView: true },
      { children: true, texture: true, textureSource: true, context: true },
    );
  });
};

export default mount;
