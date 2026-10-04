/** Created: 2026-10-05. Fixed-step Matter.js simulation with backward-seek rebuild. */
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
    anchors: { x: number; y: number; length: number }[] = [],
    closureStart: number[] | null = null,
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
    anchors = [];
    closureStart = null;
    step = 0;
    if (chain) {
      for (let i = 0; i < 7; i++) {
        const anchor = { x: 162 + i * 106, y: 132 };
        const length = 170 + i * 8;
        const body = Bodies.circle(anchor.x, anchor.y + length, 17, {
          frictionAir: 0.012,
          restitution: 0.08,
        });
        const constraint = Constraint.create({
          pointA: anchor,
          bodyB: body,
          length,
          stiffness: 1,
        });
        bodies.push(body);
        constraints.push(constraint);
        anchors.push({ ...anchor, length });
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
      if (chain) {
        const slot = anchors.findIndex(
          (_anchor, index) => step === 18 + index * 30,
        );
        if (slot >= 0) {
          // Send one gentle impulse through the full row in sequence.
          Body.setVelocity(bodies[slot], {
            x: 2.45,
            y: 0,
          });
        }
      }
      Engine.update(engine, 1000 / 60);
      step++;
      if (chain && step === 390) {
        closureStart = bodies.map((body, index) =>
          Math.atan2(
            body.position.x - anchors[index].x,
            body.position.y - anchors[index].y,
          ),
        );
      }
      if (chain && step > 390 && closureStart) {
        // Close along each pivot arc so every constraint retains its length.
        const progress = Math.max(0, Math.min(1, (step - 390) / 90));
        const eased = progress * progress * (3 - 2 * progress);
        bodies.forEach((body, index) => {
          const rest = anchors[index];
          const angle = closureStart![index] * (1 - eased);
          Body.setPosition(body, {
            x: rest.x + Math.sin(angle) * rest.length,
            y: rest.y + Math.cos(angle) * rest.length,
          });
          Body.setAngle(body, angle);
          Body.setVelocity(body, { x: 0, y: 0 });
          Body.setAngularVelocity(body, 0);
        });
      }
    }
    ctx.clearRect(0, 0, W, H);
    if (chain) {
      ctx.save();
      ctx.shadowColor = "#26353a55";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      const rail = ctx.createLinearGradient(0, 118, 0, 151);
      rail.addColorStop(0, "#f5dba7");
      rail.addColorStop(0.22, "#a7824d");
      rail.addColorStop(0.57, "#5c4934");
      rail.addColorStop(0.82, "#c1a16c");
      rail.addColorStop(1, "#f4dfb7");
      ctx.fillStyle = rail;
      ctx.beginPath();
      ctx.roundRect(126, 121, 708, 20, 7);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = "#51666a55";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 28; i++) {
        const x = 143 + i * 24;
        ctx.beginPath();
        ctx.moveTo(x, 142);
        ctx.lineTo(x, 142 + (i % 4 === 0 ? 9 : 4));
        ctx.stroke();
      }
      ctx.restore();
      for (const anchor of anchors) {
        const seat = ctx.createRadialGradient(anchor.x - 2, 130, 1, anchor.x, 136, 10);
        seat.addColorStop(0, "#fff3cd");
        seat.addColorStop(0.42, "#c4a16b");
        seat.addColorStop(1, "#596469");
        ctx.fillStyle = seat;
        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, 6.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#394d51";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, 8.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#455c60";
      ctx.font = "12px monospace";
      ctx.fillText("SEQUENTIAL IMPULSE / 7 FIXED-LENGTH PENDULUMS", 38, 510);
    }
    constraints.forEach((constraint) => {
      ctx.save();
      ctx.strokeStyle = "#20353a55";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(constraint.pointA.x + 1.2, constraint.pointA.y + 2);
      ctx.lineTo(constraint.bodyB!.position.x + 1.2, constraint.bodyB!.position.y + 2);
      ctx.stroke();
      const cord = ctx.createLinearGradient(
        constraint.pointA.x - 1,
        constraint.pointA.y,
        constraint.pointA.x + 1,
        constraint.bodyB!.position.y,
      );
      cord.addColorStop(0, "#6a5335");
      cord.addColorStop(0.5, "#d5c49d");
      cord.addColorStop(1, "#536366");
      ctx.strokeStyle = cord;
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.moveTo(constraint.pointA.x, constraint.pointA.y);
      ctx.lineTo(constraint.bodyB!.position.x, constraint.bodyB!.position.y);
      ctx.stroke();
      ctx.restore();
    });
    Composite.allBodies(engine.world).forEach((body, i) => {
      ctx.beginPath();
      body.vertices.forEach((v, j) =>
        j ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y),
      );
      ctx.closePath();
      const colors = ["#e26042", "#daa34d", "#517970", "#4b607a"];
      if (body.isStatic) ctx.fillStyle = "#354951";
      else {
        const gradient = ctx.createRadialGradient(
          body.position.x - 5,
          body.position.y - 6,
          2,
          body.position.x,
          body.position.y,
          19,
        );
        gradient.addColorStop(0, "#fff8df");
        gradient.addColorStop(0.18, colors[i % colors.length]);
        gradient.addColorStop(0.74, colors[i % colors.length]);
        gradient.addColorStop(1, "#26383a");
        ctx.fillStyle = gradient;
      }
      if (!body.isStatic) {
        ctx.save();
        ctx.shadowColor = "#26383a55";
        ctx.shadowBlur = 11;
        ctx.shadowOffsetY = 5;
        ctx.fill();
        ctx.restore();
      } else ctx.fill();
      if (!body.isStatic) {
        ctx.strokeStyle = "#f1e9d8";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(body.position.x, body.position.y);
        ctx.lineTo(
          body.position.x + Math.cos(body.angle) * 8.5,
          body.position.y + Math.sin(body.angle) * 8.5,
        );
        ctx.stroke();
        ctx.fillStyle = "#fff2cf";
        ctx.beginPath();
        ctx.arc(body.position.x - 5, body.position.y - 6, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.fillStyle = "#455c60";
    ctx.font = "12px monospace";
    if (!chain) ctx.fillText("點選 / 空白鍵施力", 38, 510);
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
