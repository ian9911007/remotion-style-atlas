import Konva from "konva";
import type { Mount } from "./types";
const mount: Mount = async (root, { variant, signal }) => {
  const container = document.createElement("div");
  root.append(container);
  const stage = new Konva.Stage({ container, width: 960, height: 540 });
  const layer = new Konva.Layer();
  stage.add(layer);
  layer.add(
    new Konva.Rect({
      width: 960,
      height: 540,
      fill: "#f0ede6",
      listening: false,
    }),
  );
  layer.add(
    new Konva.Text({
      x: 40,
      y: 35,
      text:
        variant === "draw"
          ? "DRAW / ANNOTATION BOARD"
          : "EDIT / SPATIAL COMPOSITION",
      fontSize: 18,
      fill: "#313936",
      listening: false,
    }),
  );
  let line: Konva.Line | undefined;
  const nodes: Konva.Rect[] = [];
  if (variant === "draw") {
    container.tabIndex = 0;
    container.setAttribute("role", "group");
    container.setAttribute("aria-label", "註記畫布，D 鍵新增參考筆跡");
    container.addEventListener(
      "keydown",
      (event) => {
        if (event.key.toLowerCase() === "d") {
          layer.add(
            new Konva.Line({
              points: [180, 360, 280, 220, 440, 350, 680, 180],
              stroke: "#cf593f",
              strokeWidth: 5,
              lineCap: "round",
              listening: false,
            }),
          );
          layer.draw();
        }
      },
      { signal },
    );
    layer.add(
      new Konva.Line({
        points: [130, 360, 240, 200, 380, 300, 520, 140, 680, 250, 820, 180],
        stroke: "#93a99a",
        strokeWidth: 10,
        lineCap: "round",
        lineJoin: "round",
        listening: false,
      }),
    );
    stage.on("pointerdown", () => {
      const p = stage.getPointerPosition();
      if (p) {
        line = new Konva.Line({
          points: [p.x, p.y],
          stroke: "#cf593f",
          strokeWidth: 5,
          lineCap: "round",
          lineJoin: "round",
          listening: false,
        });
        layer.add(line);
      }
    });
    stage.on("pointermove", () => {
      const p = stage.getPointerPosition();
      if (line && p) {
        line.points([...line.points(), p.x, p.y]);
        layer.batchDraw();
      }
    });
    stage.on("pointerup pointerleave", () => {
      line = undefined;
    });
  } else {
    for (let i = 0; i < 3; i++) {
      const n = new Konva.Rect({
        x: 160 + i * 215,
        y: 140 + i * 25,
        width: 170,
        height: 210,
        fill: ["#cf593f", "#304e48", "#c9b986"][i],
        draggable: true,
        rotation: i * 7 - 7,
        cornerRadius: 8,
      });
      nodes.push(n);
      layer.add(n);
    }
    const transformer = new Konva.Transformer({
      nodes: [nodes[0]],
      rotateEnabled: true,
      keepRatio: false,
    });
    layer.add(transformer);
    stage.on("click tap", (e) => {
      if (nodes.includes(e.target as Konva.Rect)) transformer.nodes([e.target]);
    });
    container.tabIndex = 0;
    container.setAttribute("role", "group");
    container.setAttribute("aria-label", "物件編輯區，方向鍵移動選取物件");
    container.addEventListener(
      "keydown",
      (e) => {
        const selected = transformer.nodes()[0];
        if (!selected) return;
        if (e.key.startsWith("Arrow")) {
          e.preventDefault();
          selected.x(
            selected.x() +
              (e.key === "ArrowRight" ? 10 : e.key === "ArrowLeft" ? -10 : 0),
          );
          selected.y(
            selected.y() +
              (e.key === "ArrowDown" ? 10 : e.key === "ArrowUp" ? -10 : 0),
          );
          layer.batchDraw();
        }
      },
      { signal },
    );
  }
  layer.add(
    new Konva.Text({
      x: 40,
      y: 480,
      text:
        variant === "draw"
          ? "拖曳畫線 / 下方重播可清除內容"
          : "拖曳物件、縮放控制點或使用方向鍵 / 點選切換選取",
      fontSize: 18,
      fill: "#313936",
      listening: false,
    }),
  );
  layer.draw();
  return {
    seek() {
      layer.draw();
    },
    dispose() {
      stage.destroy();
      root.replaceChildren();
    },
  };
};
export default mount;
