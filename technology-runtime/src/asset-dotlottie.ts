import { DotLottie } from "@lottiefiles/dotlottie-web";
import wasmUrl from "@lottiefiles/dotlottie-web/dotlottie-player.wasm?url";
import type { Mount } from "./types";
import { surface } from "./dom-kit";
const mount: Mount = async (root, { variant, signal }) => {
  DotLottie.setWasmUrl(wasmUrl);
  const s = surface(
    root,
    `canvas{position:absolute;left:0;top:0;width:960px;height:540px}.label{position:relative;z-index:1}.control{position:absolute;right:40px;top:30px;z-index:2}`,
    `<div class="label">DOTLOTTIE / ${variant === "segment" ? "MULTI-ANIMATION ARCHIVE" : "ARCHIVE PLAYBACK"}</div><canvas width="960" height="540"></canvas><button class="control">切換動作</button><p class="hint">真實 .lottie v2 壓縮封裝 · 本機 WASM 解碼</p>`,
  );
  const player = new DotLottie({
    canvas: s.querySelector("canvas")!,
    src: `${import.meta.env.BASE_URL}technology-assets/vector/capsules.lottie`,
    autoplay: false,
    loop: false,
    renderConfig: { devicePixelRatio: 1, autoResize: false },
    useFrameInterpolation: false,
  });
  await new Promise<void>((resolve, reject) => {
    player.addEventListener("load", () => resolve());
    player.addEventListener("loadError", () =>
      reject(new Error("dotLottie asset load failed")),
    );
    signal.addEventListener(
      "abort",
      () => {
        player.destroy();
        reject(new Error("Aborted"));
      },
      { once: true },
    );
  });
  let segment = variant === "segment" ? 60 : 0;
  s.querySelector("button")!.addEventListener(
    "click",
    () => {
      segment = segment ? 0 : 60;
      player.loadAnimation(segment ? "progress" : "capsules");
      player.setFrame(0);
    },
    { signal },
  );
  if (variant === "segment") player.loadAnimation("progress");
  return {
    seek(t) {
      player.setFrame(Math.floor(t * 30));
    },
    dispose() {
      player.destroy();
      root.replaceChildren();
    },
  };
};
export default mount;
