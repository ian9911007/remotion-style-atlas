import { Canvas, Rect, Circle, Textbox, PencilBrush, Path } from "fabric";
import type { Mount } from "./types";
const mount: Mount = async (root, { variant, signal }) => {
  const c = document.createElement("canvas");
  root.append(c);
  const canvas = new Canvas(c, {
    width: 960,
    height: 540,
    backgroundColor: "#e9e6df",
    renderOnAddRemove: false,
  });
  canvas.add(
    new Textbox(
      variant === "draw"
        ? "INK / FREEHAND LAYER"
        : "OBJECT / SERIALIZABLE DESIGN",
      {
        left: 40,
        top: 35,
        width: 880,
        fontSize: 20,
        fontFamily: "sans-serif",
        fill: "#243c38",
        selectable: false,
        evented: false,
      },
    ),
  );
  canvas.add(
    new Circle({ left: 155, top: 150, radius: 115, fill: "#b34838" }),
    new Rect({
      left: 465,
      top: 180,
      width: 285,
      height: 200,
      fill: "#2b5850",
      angle: -8,
    }),
  );
  if (variant === "draw") {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = "#cca344";
    canvas.freeDrawingBrush.width = 8;
  }
  canvas.add(
    new Textbox(
      variant === "draw"
        ? "拖曳畫筆，疊加在保留的向量物件上"
        : "拖曳、縮放、旋轉；點選「序列化」檢查物件結構",
      {
        left: 40,
        top: 480,
        width: 860,
        fontSize: 18,
        fontFamily: "sans-serif",
        fill: "#243c38",
        selectable: false,
        evented: false,
      },
    ),
  );
  const button = document.createElement("button");
  button.textContent = variant === "draw" ? "清除筆跡" : "序列化物件";
  button.style.cssText =
    "position:absolute;right:40px;top:65px;padding:8px 14px;color:#243c38;background:#fff;border:1px solid #243c38";
  root.append(button);
  root.tabIndex = 0;
  root.setAttribute("role", "group");
  root.setAttribute("aria-label", "設計畫布，方向鍵移動選取物件；D 鍵新增註記");
  root.addEventListener(
    "keydown",
    (event) => {
      if (event.key.toLowerCase() === "d" && variant === "draw")
        canvas.add(
          new Path("M180 330 Q370 150 650 330", {
            stroke: "#cca344",
            strokeWidth: 8,
            fill: "",
            selectable: false,
          }),
        );
      if (event.key.startsWith("Arrow") && variant !== "draw") {
        event.preventDefault();
        const object = canvas.getActiveObject() ?? canvas.getObjects()[1];
        canvas.setActiveObject(object);
        object.set({
          left:
            object.left +
            (event.key === "ArrowRight"
              ? 10
              : event.key === "ArrowLeft"
                ? -10
                : 0),
          top:
            object.top +
            (event.key === "ArrowDown"
              ? 10
              : event.key === "ArrowUp"
                ? -10
                : 0),
        });
        object.setCoords();
      }
      canvas.requestRenderAll();
    },
    { signal },
  );
  button.addEventListener(
    "click",
    () => {
      if (variant === "draw")
        canvas
          .getObjects()
          .filter((o) => o.type === "path")
          .forEach((o) => canvas.remove(o));
      else
        button.textContent = `${canvas.toJSON().objects.length} 個物件已序列化`;
      canvas.requestRenderAll();
    },
    { signal },
  );
  canvas.getObjects().forEach((object) => {
    object.set({ originX: "left", originY: "top" });
    object.setCoords();
  });
  canvas.renderAll();
  return {
    seek() {
      canvas.renderAll();
    },
    dispose() {
      void canvas.dispose();
      root.replaceChildren();
    },
  };
};
export default mount;
