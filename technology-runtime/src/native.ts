import type { Mount } from "./types";
import { surface, handle, wave, canvas } from "./dom-kit";
const mount: Mount = async (root, { variant, signal }) => {
  if (variant === "scrub") {
    const s = surface(
      root,
      `.material{position:absolute;left:110px;top:130px;width:740px;height:275px;background:repeating-linear-gradient(45deg,#1e4946 0 5px,#37726a 5px 12px);border-radius:32px}.scan{background:repeating-linear-gradient(-45deg,#cc6047 0 8px,#e7ab73 8px 16px);clip-path:inset(0 100% 0 0)}.name{position:absolute;left:145px;top:175px;color:#fff;font-size:70px;font-weight:800;pointer-events:none}.guide{position:absolute;right:40px;top:35px;font-size:18px}`,
      `<div class="label">MATERIAL / SURFACE SCAN</div><div class="material"></div><div class="material scan"></div><div class="name">CROSS<br>SECTION</div><p class="guide">移動指標或使用方向鍵</p>`,
    );
    const a = s
      .querySelector(".scan")!
      .animate(
        [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }],
        { duration: 1000, fill: "both" },
      );
    a.pause();
    let user = false,
      value = 0;
    s.tabIndex = 0;
    s.setAttribute("aria-label", "材質掃描，左右方向鍵改變揭示比例");
    s.addEventListener(
      "pointermove",
      (e) => {
        user = true;
        value = Math.max(
          0,
          Math.min(
            1000,
            ((e.clientX - s.getBoundingClientRect().left) /
              s.getBoundingClientRect().width) *
              1000,
          ),
        );
        a.currentTime = value;
      },
      { signal },
    );
    s.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          user = true;
          value = Math.max(
            0,
            Math.min(1000, value + (e.key === "ArrowRight" ? 100 : -100)),
          );
          a.currentTime = value;
        }
      },
      { signal },
    );
    return handle(
      root,
      (t) => {
        if (!user) a.currentTime = wave(t) * 1000;
      },
      () => a.cancel(),
    );
  }
  if (variant === "composite" || variant === "trails") {
    const c = canvas(root),
      x = c.getContext("2d")!;
    return handle(root, (t) => {
      x.globalCompositeOperation = "source-over";
      x.fillStyle = variant === "trails" ? "#101c31" : "#f0e9df";
      x.fillRect(0, 0, 960, 540);
      x.fillStyle = variant === "trails" ? "#b9d4e5" : "#302c28";
      x.font = "18px sans-serif";
      x.fillText(
        variant === "trails"
          ? "SIGNAL / PHASE SPACE"
          : "OPTICAL STUDIES / SUBTRACTIVE COLOUR",
        40,
        55,
      );
      if (variant === "composite") {
        x.globalCompositeOperation = "multiply";
        const loop = ((t % 4) + 4) % 4;
        const progress = (loop / 4) * 3;
        ["#ef6390", "#73cadd", "#f1ca4d"].forEach((color, i) => {
          const local = Math.max(0, Math.min(1, progress - i));
          const amount = Math.sin(local * Math.PI) ** 2;
          x.fillStyle = color;
          x.beginPath();
          x.arc(
            385 + i * 95 + (i % 2 ? -1 : 1) * 34 * amount,
            290 + (i - 1) * 30 + 24 * amount,
            140,
            0,
            Math.PI * 2,
          );
          x.fill();
        });
      } else {
        for (let i = 0; i < 100; i++) {
          const a = t - i * 0.024;
          x.strokeStyle = `rgba(114,224,206,${(1 - i / 100) * 0.75})`;
          x.beginPath();
          x.ellipse(
            480 + 100 * Math.sin(a),
            280,
            260 * Math.abs(Math.cos(a * 0.4)) + 15,
            160,
            Math.sin(a * 0.3),
            0,
            Math.PI * 2,
          );
          x.stroke();
        }
      }
      x.globalCompositeOperation = "source-over";
    });
  }
  if (variant === "worker") {
    const c = canvas(root);
    if (!c.transferControlToOffscreen)
      throw new Error("此瀏覽器不支援 OffscreenCanvas 轉移。");
    const worker = new Worker(new URL("./native-worker.ts", import.meta.url), {
      type: "module",
    });
    const off = c.transferControlToOffscreen();
    worker.postMessage({ canvas: off }, [off]);
    let resolve: (() => void) | undefined;
    worker.onmessage = () => {
      resolve?.();
      resolve = undefined;
    };
    return handle(
      root,
      (t) =>
        new Promise<void>((r) => {
          resolve = r;
          worker.postMessage({ time: t });
        }),
      () => {
        worker.terminate();
        resolve?.();
      },
    );
  }
  if (variant === "scroll") {
    const stage = surface(
      root,
      `.scroller{height:370px;overflow:auto;margin-top:28px;border:1px solid #34505a}.track{height:1200px;padding:50px;background:repeating-linear-gradient(#dce4d9 0 199px,#b6c8b9 200px)}.meter{height:6px;background:#bd5037;transform-origin:left;position:sticky;top:0}.mountain{position:sticky;top:100px;font-size:90px;letter-spacing:-8px}.readout{position:absolute;right:50px;top:40px;font-size:18px}`,
      `<div class="label">ALTITUDE / SCROLL STUDY</div><span class="readout">捲動下方區域</span><div class="scroller" tabindex="0" aria-label="高度敘事捲動"><div class="meter"></div><div class="track"><div class="mountain">▲ ▲ ▲</div><p>BASE → RIDGE → SUMMIT</p></div></div>`,
    );
    const s = stage.querySelector<HTMLElement>(".scroller")!;
    const Ctor = (
      window as unknown as {
        ScrollTimeline?: new (o: object) => AnimationTimeline;
      }
    ).ScrollTimeline;
    if (!Ctor)
      throw new Error("此瀏覽器尚未提供 ScrollTimeline；海報與規格仍可使用。");
    const a = stage
      .querySelector(".meter")!
      .animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
        timeline: new Ctor({ source: s, axis: "block" }),
        fill: "both",
      });
    let user = false;
    s.addEventListener("wheel", () => (user = true), { signal });
    s.addEventListener("touchstart", () => (user = true), { signal });
    s.addEventListener("keydown", () => (user = true), { signal });
    return handle(
      root,
      (t) => {
        if (!user) s.scrollTop = wave(t) * (s.scrollHeight - s.clientHeight);
      },
      () => a.cancel(),
    );
  }
  if (variant === "view") {
    const s = surface(
      root,
      `.album{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:35px}.tile{background:#d8503d;color:#fff;padding:32px;height:280px;font-size:38px}.tile.alt{background:#274a53}.album.flipped{direction:rtl}.album.flipped .tile{direction:ltr}.controls{position:absolute;right:40px;top:24px}`,
      `<div class="label">INDEX / EDITORIAL ARCHIVE</div><button class="controls">切換版面</button><div class="album"><div class="tile">01<br>FIELD<br>NOTES</div><div class="tile alt">02<br>OPEN<br>SYSTEMS</div></div><p class="hint">原生 View Transition 快照交接</p>`,
    );
    if (!document.startViewTransition)
      throw new Error("此瀏覽器未提供 View Transitions API。");
    const album = s.querySelector(".album")!;
    let last = -1;
    let transition: ViewTransition | undefined;
    const flip = () => {
      transition?.skipTransition();
      transition = document.startViewTransition(() =>
        album.classList.toggle("flipped"),
      );
    };
    s.querySelector("button")!.addEventListener("click", flip, { signal });
    return handle(
      root,
      (t) => {
        const n = Math.floor(t / 2);
        if (n !== last) {
          last = n;
          flip();
        }
      },
      () => transition?.skipTransition(),
    );
  }
  if (variant === "transition") {
    const s = surface(
      root,
      `.panel{margin:32px 0;width:100%;border-top:2px solid #252e29;border-bottom:2px solid #252e29;padding:28px 0}.details{display:grid;grid-template-rows:0fr;transition:grid-template-rows .65s cubic-bezier(.2,.8,.2,1)}.details>div{overflow:hidden}.panel.open .details{grid-template-rows:1fr}.big{font-size:64px;letter-spacing:-3px}.line{display:block;max-width:700px;font-size:22px;padding-top:17px;line-height:1.35;opacity:0;transform:translateY(10px);transition:opacity .24s ease,transform .24s ease}.panel.open .line{opacity:1;transform:translateY(0)}.panel.open .line:nth-child(1){transition-delay:0s}.panel.open .line:nth-child(2){transition-delay:.18s}.panel.open .line:nth-child(3){transition-delay:.36s}.panel:not(.open) .line:nth-child(1){transition-delay:.36s}.panel:not(.open) .line:nth-child(2){transition-delay:.18s}.panel:not(.open) .line:nth-child(3){transition-delay:0s}.arrow{float:right;transition:transform .65s}.open .arrow{transform:rotate(45deg)}`,
      `<div class="label">STUDIO / MATERIAL LIBRARY</div><div class="panel"><button aria-expanded="false" style="width:100%;text-align:left;border:0;padding:0" class="big">Composition <span class="arrow">+</span></button><div class="details"><div><p class="line">A quiet surface.</p><p class="line">A deliberate transition.</p><p class="line">Information revealed on demand.</p></div></div></div><p class="hint">點選標題展開／收合；鍵盤 Enter 可操作</p>`,
    );
    let user = false,
      last: boolean | null = null,
      loop = -1,
      previousTime = -1;
    const p = s.querySelector(".panel")!,
      b = s.querySelector("button")!;
    const set = (v: boolean) => {
      p.classList.toggle("open", v);
      b.setAttribute("aria-expanded", String(v));
    };
    b.addEventListener(
      "click",
      () => {
        user = true;
        set(!p.classList.contains("open"));
      },
      { signal },
    );
    return handle(root, (t) => {
      const cycle = Math.floor(Math.max(0, t) / 4);
      const local = ((t % 4) + 4) % 4;
      if (cycle !== loop || (previousTime >= 0 && local + 0.05 < previousTime)) {
        loop = cycle;
        user = false;
        last = null;
        set(false);
      }
      previousTime = local;
      // Open once, let the three rows enter in order, then close with a
      // reverse stagger. The completed four-second cycle returns to baseline.
      const next = local >= 0.45 && local < 2.65;
      if (!user && next !== last) {
        last = next;
        set(next);
      }
    });
  }
  if (variant === "keyframes") {
    const s = surface(
      root,
      `@keyframes orbit{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:.25;transform:scale(.5)}50%{opacity:1;transform:scale(1)}}.system{position:absolute;left:330px;top:130px;width:280px;height:280px;border:1px solid #b08357;border-radius:50%;animation:orbit 4s linear infinite paused}.system:before{content:'';position:absolute;width:30px;height:30px;background:#b65a38;border-radius:50%;top:30px;left:30px}.core{position:absolute;left:425px;top:225px;width:90px;height:90px;background:#dfb15f;border-radius:50%;animation:pulse 4s ease-in-out infinite paused}.orbit2{width:400px;height:400px;left:270px;top:70px;animation-direction:reverse;opacity:.5}`,
      `<div class="label">KEPLER / TIMING SYSTEM</div><div class="system"></div><div class="system orbit2"></div><div class="core"></div><p class="hint">CSS Keyframes · 同一時間來源控制週期與相位</p>`,
    );
    const animations = s.getAnimations({ subtree: true });
    return handle(
      root,
      (t) => animations.forEach((a) => (a.currentTime = t * 1000)),
      () => animations.forEach((a) => a.cancel()),
    );
  }
  const s = surface(
    root,
    `.letters{display:flex;gap:4px;position:absolute;left:45px;top:180px;font-size:110px;letter-spacing:-8px;font-weight:800}.letters span{display:block}.rule{width:860px;height:6px;background:var(--accent);position:absolute;left:50px;top:355px}.label{border-bottom:1px solid currentColor;padding-bottom:22px}`,
    `<div class="label">MOTION STUDY / NATIVE TIMELINE</div><div class="letters">${"CONTINUUM"
      .split("")
      .map((c) => `<span>${c}</span>`)
      .join(
        "",
      )}</div><div class="rule"></div><p class="hint">時間軸可任意定位；元素保留原生文字</p>`,
  );
  const as = Array.from(s.querySelectorAll(".letters span")).map((el, i) => {
    const a = el.animate(
      [
        { transform: "translateY(100px)", opacity: 0 },
        { transform: "translateY(0)", opacity: 1, offset: 0.4 },
        { transform: "translateY(0)", opacity: 1, offset: 0.75 },
        { transform: "translateY(-100px)", opacity: 0 },
      ],
      {
        duration: 4000,
        delay: variant === "reverse" ? i * 70 : 0,
        fill: "both",
        easing: "cubic-bezier(.2,.8,.2,1)",
      },
    );
    a.pause();
    return a;
  });
  const line = s.querySelector(".rule")!.animate(
    [
      { transform: "scaleX(0)", transformOrigin: "left" },
      { transform: "scaleX(1)", offset: 0.5 },
      { transform: "scaleX(0)", transformOrigin: "right" },
    ],
    { duration: 4000, fill: "both" },
  );
  line.pause();
  as.push(line);
  return handle(
    root,
    (t) => as.forEach((a) => (a.currentTime = t * 1000)),
    () => as.forEach((a) => a.cancel()),
  );
};
export default mount;
