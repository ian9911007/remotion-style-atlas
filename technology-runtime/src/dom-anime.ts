import { animate, createTimeline, stagger, svg } from "animejs";
import type { Mount } from "./types";
import { surface, handle } from "./dom-kit";
const mount: Mount = async (root, { variant }) => {
  if (variant === "draw") {
    const s = surface(
      root,
      `svg{position:absolute;left:60px;top:100px}path{fill:none;stroke:#176e69;stroke-width:5;stroke-linecap:round}.node{fill:#bf533c}.note{position:absolute;right:60px;top:380px;font-size:35px}`,
      `<div class="label">CIRCUIT / VECTOR REVEAL</div><svg width="840" height="330" viewBox="0 0 840 330"><path d="M20 180H170V60H370V220H550V100H810"/><path d="M20 240H110V290H400V80H640V240H810"/><circle class="node" cx="810" cy="100" r="10"/><circle class="node" cx="810" cy="240" r="10"/></svg><p class="note">SIGNAL → RESPONSE</p>`,
    );
    const draw = svg.createDrawable(Array.from(s.querySelectorAll("path")));
    const a = animate(draw, {
      draw: ["0 0", "0 1"],
      duration: 2700,
      delay: stagger(350),
      ease: "inOutQuad",
      autoplay: false,
    });
    return handle(
      root,
      (t) => {
        a.seek(Math.min(t * 1000, 3400));
      },
      () => a.revert(),
    );
  }
  const s = surface(
    root,
    `.grid{display:grid;grid-template-columns:repeat(16,28px);gap:9px;position:absolute;left:200px;top:130px}.dot{width:28px;height:28px;border-radius:5px;background:#dc522f;transform:scale(.15);opacity:.1}.title{position:absolute;left:40px;bottom:40px;font-size:35px;font-weight:600}`,
    `<div class="label">ARRAY / DISTRIBUTED TIMING</div><div class="grid">${Array.from({ length: 128 }, () => '<div class="dot"></div>').join("")}</div><p class="title">From a point. Across a field.</p>`,
  );
  const tl = createTimeline({ autoplay: false })
    .add(
      s.querySelectorAll(".dot"),
      {
        scale: [0.15, 1],
        rotate: [-90, 0],
        opacity: [0.1, 1],
        delay: stagger(35, { grid: [16, 8], from: "center" }),
        duration: 900,
        ease: "outBack",
      },
      0,
    )
    .add(
      s.querySelectorAll(".dot"),
      {
        scale: 0.15,
        opacity: 0.2,
        delay: stagger(15, { grid: [16, 8], from: "last" }),
        duration: 650,
        ease: "inOutQuad",
      },
      2800,
    );
  return handle(
    root,
    (t) => {
      tl.seek(t * 1000);
    },
    () => tl.revert(),
  );
};
export default mount;
