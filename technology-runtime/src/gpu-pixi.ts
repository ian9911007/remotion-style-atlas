/** Created: 2026-10-04. PixiJS v8 private, stopped ticker and manual render. */
import { Application, Graphics, Sprite, Container, BlurFilter } from "pixi.js";
import type { Mount } from "./types";
import { stage, lifecycle, W, H, seeded } from "./gpu-common";
const mount: Mount = async (root, options) => {
  const field = options.variant === "sprites";
  const surface = stage(
    root,
    field ? "ORBITAL TYPES" : "SOFT / HARD",
    field
      ? "720 個精靈 · 批次繪製 · 原創程序式材質"
      : "同一組形狀 · 即時濾鏡 · 可移動遮罩",
    field ? "#211d33" : "#f2c6a9",
    field ? "#f9efcc" : "#2b2735",
  );
  const app = new Application();
  await app.init({
    width: W,
    height: H,
    resolution: 1,
    antialias: true,
    autoStart: false,
    sharedTicker: false,
    preference: "webgl",
    background: field ? "#211d33" : "#f2c6a9",
    preserveDrawingBuffer: true,
  });
  if (options.signal.aborted) {
    app.destroy(true, { children: true, texture: true, textureSource: true });
    throw new DOMException("Aborted", "AbortError");
  }
  app.stop();
  surface.append(app.canvas);
  app.canvas.setAttribute(
    "aria-label",
    field ? "720 個精靈形成軌道波環" : "可移動視窗分隔模糊與銳利的色塊",
  );
  const sprites: Sprite[] = [];
  let texture: ReturnType<typeof app.renderer.generateTexture> | undefined;
  let masked: Container | undefined, mask: Graphics | undefined;
  const filter = new BlurFilter({ strength: 16, quality: 4 });
  if (field) {
    const glyph = new Graphics().roundRect(0, 0, 9, 22, 4).fill("#ffffff");
    texture = app.renderer.generateTexture(glyph);
    glyph.destroy();
    for (let i = 0; i < 720; i++) {
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.tint = [0xefbd70, 0xe9736e, 0xf1e1bd, 0x8b9edb][i % 4];
      app.stage.addChild(sprite);
      sprites.push(sprite);
    }
  } else {
    const blurred = new Container();
    masked = new Container();
    const shapes = (parent: Container) => {
      for (let i = 0; i < 7; i++) {
        const graphic = new Graphics();
        if (i % 2)
          graphic
            .roundRect(-75, -130, 150, 260, 55)
            .fill([0x335c5f, 0xf65d47, 0x6b55ac][i % 3]);
        else
          graphic.circle(0, 0, 85).fill([0x335c5f, 0xf65d47, 0x6b55ac][i % 3]);
        graphic.position.set(145 + i * 114, 290 + Math.sin(i * 2) * 85);
        graphic.rotation = i * 0.4;
        parent.addChild(graphic);
      }
    };
    shapes(blurred);
    shapes(masked);
    blurred.filters = [filter];
    app.stage.addChild(blurred, masked);
    mask = new Graphics().roundRect(-150, -170, 300, 340, 22).fill(0xffffff);
    app.stage.addChild(mask);
    masked.mask = mask;
    const border = new Graphics()
      .roundRect(-154, -174, 308, 348, 25)
      .stroke({ color: 0xffffff, width: 3 });
    mask.addChild(border);
  }
  let pointerX: number | undefined;
  const point = (event: PointerEvent) => {
    const rect = app.canvas.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width) * W;
  };
  const leave = (event: PointerEvent) => {
    if (event.pointerType === "mouse") pointerX = undefined;
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      event.preventDefault();
      pointerX = Math.min(
        780,
        Math.max(
          180,
          (pointerX ?? 480) + (event.code === "ArrowRight" ? 30 : -30),
        ),
      );
    }
  };
  if (!field) {
    app.canvas.tabIndex = 0;
    app.canvas.setAttribute(
      "aria-label",
      "柔銳遮罩：移動指標、觸碰或使用左右方向鍵移動視窗",
    );
    app.canvas.addEventListener("pointermove", point);
    app.canvas.addEventListener("pointerdown", point);
    app.canvas.addEventListener("pointerleave", leave);
    app.canvas.addEventListener("keydown", keydown);
  }
  const seek = (time: number) => {
    if (field)
      sprites.forEach((sprite, index) => {
        const ring = Math.floor(index / 120),
          angle =
            ((index % 120) / 120) * Math.PI * 2 + time * (0.12 + ring * 0.025);
        const radius = 52 + ring * 27 + Math.sin(angle * 5 + time) * 14;
        sprite.position.set(
          480 + Math.cos(angle) * radius * 1.7,
          292 + Math.sin(angle) * radius,
        );
        sprite.rotation = angle + Math.PI / 2;
        sprite.scale.set(0.55 + seeded(index) * 0.6);
        sprite.alpha = 0.6 + 0.4 * Math.sin(index + time) ** 2;
      });
    else if (mask && masked) {
      mask.position.set(pointerX ?? 480 + Math.sin(time * 0.8) * 175, 298);
      masked.rotation = 0;
    }
    app.render();
  };
  seek(0);
  return lifecycle(options, seek, () => {
    app.canvas.removeEventListener("pointermove", point);
    app.canvas.removeEventListener("pointerdown", point);
    app.canvas.removeEventListener("pointerleave", leave);
    app.canvas.removeEventListener("keydown", keydown);
    filter.destroy();
    app.destroy(true, { children: true, texture: false, textureSource: false });
    texture?.destroy(true);
  });
};
export default mount;
