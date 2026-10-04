/** Created: 2026-10-04. Fixed-step Matter.js simulation with backward-seek rebuild. */
import Matter from "matter-js";
import type { Mount } from "./types";
import { stage, canvas2d, lifecycle, W, H, phase } from "./gpu-common";
const { Engine, Bodies, Body, Composite, Constraint } = Matter;
const mount: Mount = async (root, options) => {
  const chain = options.variant === "constraints";
  const surface = stage(
    root,
    chain ? "TENSION STUDY" : "GRAVITY SORT",
    chain ? "約束長度 · 重力 · 固定步長" : "碰撞 · 摩擦 · 能量耗散",
    "#f0eee2",
    "#202f36",
  );
  const { canvas, context: ctx } = canvas2d(
    surface,
    chain ? "七組受重力影響的懸吊擺錘" : "圓形與矩形剛體落入料槽",
  );
  let engine: Matter.Engine,
    bodies: Matter.Body[] = [],
    constraints: Matter.Constraint[] = [],
    step = 0;
  const reset = () => {
    if (engine) {
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    }
    engine = Engine.create({
      enableSleeping: false,
      positionIterations: 8,
      velocityIterations: 8,
    });
    engine.gravity.y = 0.8;
    bodies = [];
    constraints = [];
    step = 0;
    if (chain) {
      for (let i = 0; i < 7; i++) {
        const anchor = { x: 190 + i * 95, y: 145 };
        const body = Bodies.circle(anchor.x + 60, 325 + i * 14, 22, {
          frictionAir: 0.0008,
          restitution: 0.9,
        });
        const constraint = Constraint.create({
          pointA: anchor,
          bodyB: body,
          length: 190 + i * 10,
          stiffness: 1,
        });
        bodies.push(body);
        constraints.push(constraint);
      }
      Composite.add(engine.world, [...bodies, ...constraints]);
    } else {
      const boundaries = [
        Bodies.rectangle(480, 495, 810, 24, { isStatic: true }),
        Bodies.rectangle(80, 390, 24, 230, { isStatic: true }),
        Bodies.rectangle(880, 390, 24, 230, { isStatic: true }),
        Bodies.rectangle(300, 275, 250, 18, { isStatic: true, angle: 0.22 }),
        Bodies.rectangle(695, 330, 260, 18, { isStatic: true, angle: -0.2 }),
      ];
      for (let i = 0; i < 35; i++) {
        const x = 240 + (i % 7) * 72,
          y = -35 - Math.floor(i / 7) * 66;
        bodies.push(
          i % 3
            ? Bodies.circle(x, y, 17 + (i % 4), {
                restitution: 0.55,
                friction: 0.3,
              })
            : Bodies.rectangle(x, y, 35, 35, {
                chamfer: { radius: 5 },
                restitution: 0.4,
              }),
        );
      }
      Composite.add(engine.world, [...boundaries, ...bodies]);
    }
  };
  reset();
  const pulse = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * W;
    for (const body of bodies)
      if (Math.abs(body.position.x - x) < 160)
        Body.applyForce(body, body.position, {
          x: 0.018 * (body.position.x < x ? -1 : 1),
          y: -0.04,
        });
  };
  const key = (event: KeyboardEvent) => {
    if (event.code === "Space" || event.code === "Enter") {
      event.preventDefault();
      bodies.forEach((body) =>
        Body.applyForce(body, body.position, { x: 0.01, y: -0.025 }),
      );
    }
  };
  canvas.tabIndex = 0;
  canvas.setAttribute(
    "aria-label",
    "物理模擬；點選或按空白鍵施力，倒轉時間會重建初始狀態",
  );
  canvas.addEventListener("pointerdown", pulse);
  canvas.addEventListener("keydown", key);
  const seek = (seconds: number) => {
    const target = Math.floor(phase(seconds) * 60);
    if (target < step) reset();
    while (step < target) {
      Engine.update(engine, 1000 / 60);
      step++;
    }
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "#233941";
    ctx.lineWidth = 2;
    if (chain) {
      ctx.beginPath();
      ctx.moveTo(145, 143);
      ctx.lineTo(815, 143);
      ctx.stroke();
    }
    constraints.forEach((constraint) => {
      ctx.beginPath();
      ctx.moveTo(constraint.pointA.x, constraint.pointA.y);
      ctx.lineTo(constraint.bodyB!.position.x, constraint.bodyB!.position.y);
      ctx.stroke();
    });
    Composite.allBodies(engine.world).forEach((body, i) => {
      ctx.beginPath();
      body.vertices.forEach((v, j) =>
        j ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y),
      );
      ctx.closePath();
      ctx.fillStyle = body.isStatic
        ? "#354951"
        : ["#e26042", "#daa34d", "#517970", "#4b607a"][i % 4];
      ctx.fill();
      if (!body.isStatic) {
        ctx.strokeStyle = "#f0eee2";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(body.position.x, body.position.y);
        ctx.lineTo(
          body.position.x + Math.cos(body.angle) * 12,
          body.position.y + Math.sin(body.angle) * 12,
        );
        ctx.stroke();
      }
    });
    ctx.fillStyle = "#455c60";
    ctx.font = "12px monospace";
    ctx.fillText("點選 / 空白鍵施力", 38, 510);
    ctx.fillText(
      `SIMULATION ${String(step).padStart(3, "0")} / 60 Hz`,
      724,
      510,
    );
  };
  seek(0);
  return lifecycle(options, seek, () => {
    canvas.removeEventListener("pointerdown", pulse);
    canvas.removeEventListener("keydown", key);
    Composite.clear(engine.world, false);
    Engine.clear(engine);
    canvas.remove();
  });
};
export default mount;
