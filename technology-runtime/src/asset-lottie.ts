import lottie from "lottie-web";
import type { Mount } from "./types";
import { surface } from "./dom-kit";
const mount: Mount = async (root, { variant, signal }) => {
  const s = surface(
    root,
    `.art{position:absolute;left:0;top:0;width:960px;height:540px}.label,.hint{z-index:2;position:relative;pointer-events:none}.hint{position:absolute}.control{position:absolute;right:40px;top:30px;z-index:3}`,
    `<div class="label">VECTOR ASSET / ${variant === "progress" ? "PROGRESS CONTROL" : "SEEKABLE PLAYBACK"}</div><div class="art"></div><button class="control">切換進度</button><p class="hint">原創 Lottie JSON · 實際 SVG runtime · 無外部素材</p>`,
  );
  const data = await fetch(
    `${import.meta.env.BASE_URL}technology-assets/vector/${variant === "progress" ? "progress" : "capsules"}.json`,
    { signal },
  ).then((r) => {
    if (!r.ok) throw new Error("Missing Lottie asset");
    return r.json();
  });
  const animation = lottie.loadAnimation({
    container: s.querySelector(".art")!,
    renderer: "svg",
    loop: false,
    autoplay: false,
    animationData: data,
  });
  await new Promise<void>((resolve, reject) => {
    animation.addEventListener("DOMLoaded", () => resolve());
    animation.addEventListener("data_failed", () =>
      reject(new Error("Lottie asset parse failed")),
    );
    signal.addEventListener(
      "abort",
      () => {
        animation.destroy();
        reject(new Error("Aborted"));
      },
      { once: true },
    );
  });
  const readout = document.createElement("output");
  readout.style.cssText =
    "position:absolute;left:420px;top:240px;font-size:48px;pointer-events:none";
  if (variant === "progress") s.append(readout);
  let user = false,
    progress = 0;
  s.querySelector("button")!.addEventListener(
    "click",
    () => {
      user = true;
      progress = (progress + 30) % 120;
      animation.goToAndStop(progress, true);
      readout.textContent = Math.round((progress / 119) * 100) + "%";
    },
    { signal },
  );
  return {
    seek(t) {
      if (!user) {
        const f =
          variant === "progress"
            ? Math.round((0.5 - 0.5 * Math.cos((t * Math.PI) / 2)) * 119)
            : Math.round(t * 30);
        animation.goToAndStop(f, true);
        readout.textContent = Math.round((f / 119) * 100) + "%";
      }
    },
    dispose() {
      animation.destroy();
      root.replaceChildren();
    },
  };
};
export default mount;
