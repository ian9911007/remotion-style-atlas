import { SVG } from "@svgdotjs/svg.js";
import { interpolate } from "flubber";
import rough from "roughjs";
import type { Mount } from "./types";
import { handle, wave } from "./dom-kit";
const mount: Mount = async (root, { variant }) => {
  const draw = SVG().addTo(root).size(960, 540).viewbox(0, 0, 960, 540);
  const bg = variant.startsWith("rough") ? "#f8f1df" : "#eee9df";
  draw.rect(960, 540).fill(bg);
  draw
    .text(
      variant === "morph"
        ? "TOPOLOGY / CONTINUOUS FORM"
        : variant === "clip"
          ? "LENS / VECTOR SAMPLING"
          : variant === "construct"
            ? "PLAN / PARAMETRIC STRUCTURE"
            : "IDEAS / ROUGH GEOMETRY",
    )
    .move(40, 30)
    .font({
      size: 16,
      family: "sans-serif",
      fill: "#343f3e",
      letterSpacing: 3,
    });
  if (variant === "morph") {
    const a = "M480 100L650 420L310 420Z",
      b = "M480 100C700 100 740 420 480 420C220 420 260 100 480 100Z";
    const morph = interpolate(a, b, { maxSegmentLength: 6 });
    const p = draw.path(a).fill("#d95339");
    draw
      .text("01  /  RIGID → ORGANIC")
      .move(40, 470)
      .font({ size: 22, family: "sans-serif", fill: "#343f3e" });
    return handle(
      root,
      (t) => {
        p.plot(morph(wave(t)));
      },
      () => draw.remove(),
    );
  }
  if (variant.startsWith("rough")) {
    const r = rough.svg(draw.node);
    const group = draw.group();
    if (variant === "rough-diagram") {
      [
        [80, 160, "INPUT"],
        [390, 160, "PROCESS"],
        [700, 160, "OUTPUT"],
      ].forEach(([x, y, label], i) => {
        group.node.append(
          r.rectangle(Number(x), Number(y), 180, 155, {
            seed: i + 1,
            roughness: 1.2,
            fill: i === 1 ? "#e6b74d" : "#cad8c5",
            fillStyle: "hachure",
            stroke: "#35483c",
            strokeWidth: 2,
          }),
        );
        draw
          .text(String(label))
          .move(Number(x) + 25, Number(y) + 65)
          .font({ size: 23, family: "sans-serif", fill: "#344137" });
      });
      [270, 580].forEach((x, i) => {
        group.node.append(
          r.line(x, 237, x + 110, 237, {
            seed: i + 5,
            stroke: "#35483c",
            strokeWidth: 3,
          }),
        );
        group.node.append(
          r.linearPath(
            [
              [x + 93, 220],
              [x + 110, 237],
              [x + 93, 254],
            ],
            { seed: i + 8, stroke: "#35483c", strokeWidth: 3 },
          ),
        );
      });
      draw
        .text("A process is clearer when its structure is visible.")
        .move(80, 400)
        .font({ size: 25, family: "serif", fill: "#344137" });
    } else {
      for (let i = 0; i < 5; i++) {
        group.node.append(
          r.rectangle(100 + i * 155, 140 + i * 20, 90, 250 - i * 30, {
            seed: 20 + i,
            fill: "#a9bfaa",
            fillStyle: "cross-hatch",
            stroke: "#35483c",
            roughness: 1.8,
          }),
        );
        group.node.append(
          r.line(145 + i * 155, 100 + i * 20, 145 + i * 155, 180 + i * 20, {
            seed: 40 + i,
            stroke: "#c74f39",
            strokeWidth: 3,
          }),
        );
      }
      draw
        .text("ESTIMATES / RANGES, NOT CERTAINTY")
        .move(80, 445)
        .font({ size: 22, family: "sans-serif", fill: "#344137" });
    }
    return handle(
      root,
      (t) => {
        group.opacity(0.5 + 0.5 * Math.min(1, t));
      },
      () => draw.remove(),
    );
  }
  if (variant === "clip") {
    const g = draw.group();
    for (let i = 0; i < 32; i++)
      g.line(90 + i * 24, 100, 90 + i * 24, 440).stroke({
        color: i % 2 ? "#b6543e" : "#24584c",
        width: 12,
      });
    const circle = draw.circle(300).center(480, 275);
    g.clipWith(circle);
    draw
      .circle(300)
      .center(480, 275)
      .fill("none")
      .stroke({ color: "#283b32", width: 2 });
    return handle(
      root,
      (t) => {
        circle.center(480 + Math.sin(t * 1.57) * 210, 275);
        g.transform({ rotate: 15 * Math.sin(t), origin: [480, 270] });
      },
      () => draw.remove(),
    );
  }
  const g = draw.group();
  const columns = Array.from({ length: 8 }, (_, i) =>
    g
      .rect(52, 260)
      .move(155 + i * 82, 160)
      .fill("#d6dfd2")
      .stroke({ color: "#225547", width: 2 }),
  );
  const roof = g
    .polyline([
      [100, 160],
      [480, 85],
      [860, 160],
    ])
    .fill("none")
    .stroke({ color: "#225547", width: 4 });
  draw.line(90, 425, 870, 425).stroke({ color: "#225547", width: 2 });
  draw
    .text("ELEVATION / 08 BAYS / PARAMETRIC SECTION")
    .move(90, 465)
    .font({ size: 19, family: "sans-serif", fill: "#344137" });
  return handle(
    root,
    (t) => {
      columns.forEach((c, i) => {
        const h = 100 + 160 * (0.5 + 0.5 * Math.sin(t + i * 0.3));
        c.height(h).y(420 - h);
      });
      roof.plot([
        [100, 160],
        [480, 85 + 35 * Math.sin(t)],
        [860, 160],
      ]);
    },
    () => draw.remove(),
  );
};
export default mount;
