/** Created: 2026-10-04. Distinct scroll/WAAPI and pointer/CSS-transition depth models. */
import type { Mount } from "./types";
import { shell, button } from "./data-shared";

const mount: Mount = async (root, { variant, reducedMotion, signal }) => {
  const scroll = variant === "section";
  const { stage, controls, caption } = shell(
    root,
    scroll
      ? { bg: "#edf0eb", fg: "#29423e", accent: "#a9583b" }
      : { bg: "#f4efe9", fg: "#362e31", accent: "#8e534a" },
    scroll
      ? "WAAPI / SCROLL DEPTH SEPARATION"
      : "CSS TRANSITIONS / POINTER DEPTH",
    scroll ? "剖面之間：捲動分離深度" : "規格卡的多平面透視",
    scroll
      ? "局部捲動或按鈕控制 · 建築幾何示意 · 無真實 3D 模型"
      : "移動指標、觸控拖曳或方向鍵 · CSS 2.5D，不是真實 3D 場景",
  );
  const styles = document.createElement("style");
  styles.textContent = `
    .sp-scene{position:relative;overflow:hidden;isolation:isolate}.sp-layer{position:absolute;inset:0;will-change:transform}.sp-layer svg{width:100%;height:100%;display:block}.sp-depth-label{position:absolute;padding:6px 9px;font:11px Arial,sans-serif;letter-spacing:.1em;border:1px solid currentColor;background:#edf0ebcc}.sp-scroller{position:absolute;right:0;top:0;width:178px;height:374px;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;border-left:1px solid #c2cec3;padding:0 12px;line-height:1.8;outline-offset:2px}.sp-chapter{height:238px;border-bottom:1px solid #b8c9c0;padding-top:28px;font-size:14px}.sp-chapter:before{content:"";display:block;width:30px;height:3px;background:#a9583b;margin-bottom:14px}.sp-chapter strong{display:block;font-size:24px;font-weight:500;margin-bottom:8px}.sp-chapter small{display:block;color:#687e70;font-size:12px}.sp-product{position:absolute;inset:0;perspective:950px;perspective-origin:46% 50%;touch-action:pan-y;outline-offset:3px}.sp-rig{position:absolute;width:650px;height:380px;left:155px;top:76px;transform-style:preserve-3d;will-change:transform}.sp-plane{position:absolute;inset:0;border:1px solid #bbaaa0;border-radius:10px;backface-visibility:hidden;box-shadow:0 18px 36px #58453720;pointer-events:none}.sp-back{transform:translate3d(-30px,24px,-80px);background:repeating-linear-gradient(0deg,#e8e1d7 0 23px,#cec7ba 24px 25px)}.sp-middle{transform:translate3d(-8px,5px,0);background:linear-gradient(135deg,#fffdf7,#ede4d6);padding:38px}.sp-front{inset:auto -40px 25px auto;width:190px;height:154px;transform:translateZ(76px);background:#774b46;color:#fff9ed;padding:19px;box-shadow:0 15px 25px #55382e35}.sp-type{font-size:12px;letter-spacing:.16em;color:#897570}.sp-product-name{font:500 44px Georgia,serif;margin-top:18px;letter-spacing:-.04em}.sp-lens{position:absolute;right:68px;top:62px;width:218px;height:218px;border:16px solid #bcb4a6;border-radius:50%;background:radial-gradient(circle,#42565c 0 21%,#788c87 22% 30%,#1f343a 31% 43%,#b5b7a4 44% 47%,#4d5652 48% 61%,#d2c9b6 62%);box-shadow:0 16px 28px #443d3025}.sp-lens:before{content:"";position:absolute;left:32px;top:18px;width:68px;height:23px;border-radius:50%;background:#d9f1eaaa;filter:blur(4px);transform:rotate(-30deg)}.sp-lens:after{content:'';position:absolute;inset:26px;border-radius:50%;border:1px solid #ffffff66}.sp-note{position:absolute;left:38px;bottom:32px;font-size:14px;color:#756d61;line-height:1.6}.sp-perspective-hint{position:absolute;left:8px;top:45px;font-size:11px;color:#897a70;letter-spacing:.07em;writing-mode:vertical-rl}.sp-view-label{position:absolute;right:7px;top:12px;font:11px monospace;color:#897a70}`;
  root.append(styles);
  if (scroll) {
    // This case owns the complete stage; the sibling pointer case keeps its shell.
    root.replaceChildren(styles);
    root.style.background = "#efeee6";
    const scene = document.createElement("div");
    scene.className = "sp-scene";
    scene.dataset.layout = "full-bleed";
    scene.setAttribute("role", "img");
    scene.setAttribute(
      "aria-label",
      "木構建築剖面：場地、結構與樓板沿共同垂直軸分離",
    );
    scene.style.cssText =
      "position:absolute;inset:0;width:960px;height:540px;background:radial-gradient(ellipse at 40% 25%,#faf9f1,#e8e9df 90%)";
    type WorldPoint = [number, number, number];
    const project = ([x, y, z]: WorldPoint) =>
      [424 + (x - y) * 112, 296 + (x + y) * 28 - z] as const;
    const points = (vertices: WorldPoint[]) =>
      vertices.map((point) => project(point).join(",")).join(" ");
    const plane = (
      x: number,
      y: number,
      w: number,
      d: number,
      z: number,
    ): WorldPoint[] => [
      [x, y, z],
      [x + w, y, z],
      [x + w, y + d, z],
      [x, y + d, z],
    ];
    const footprint = (z: number) => plane(0, 0, 4, 3, z);
    const polygon = (vertices: WorldPoint[], attributes: string) =>
      `<polygon points="${points(vertices)}" ${attributes}/>`;
    const line = (a: WorldPoint, b: WorldPoint, attributes = "") =>
      `<polyline points="${points([a, b])}" fill="none" ${attributes}/>`;
    const solid = (
      x: number,
      y: number,
      w: number,
      d: number,
      z: number,
      h: number,
      top: string,
      front: string,
      side: string,
    ) =>
      polygon(
        [
          [x, y + d, z],
          [x + w, y + d, z],
          [x + w, y + d, z + h],
          [x, y + d, z + h],
        ],
        `fill="${front}" stroke="#715f4838" stroke-width=".5"`,
      ) +
      polygon(
        [
          [x + w, y, z],
          [x + w, y + d, z],
          [x + w, y + d, z + h],
          [x + w, y, z + h],
        ],
        `fill="${side}" stroke="#715f4838" stroke-width=".5"`,
      ) +
      polygon(
        plane(x, y, w, d, z + h),
        `fill="${top}" stroke="#715f4838" stroke-width=".5"`,
      );
    const floor = 94,
      roof = 188;
    const columns: [number, number][] = [0, 1, 2, 3, 4]
      .flatMap(
        (x) =>
          [
            [x, 0],
            [x, 3],
          ] as [number, number][],
      )
      .concat([
        [0, 1],
        [0, 2],
        [4, 1],
        [4, 2],
      ]);
    const siteGrid = [0, 1, 2, 3, 4]
      .map((x) => line([x, -0.18, 0], [x, 3.18, 0]))
      .concat([0, 1, 2, 3].map((y) => line([-0.18, y, 0], [4.18, y, 0])))
      .join("");
    const woodGrain = Array.from({ length: 20 }, (_, i) =>
      line(
        [0.18, 0.14 + i * 0.14, floor + 0.3],
        [3.82, 0.14 + i * 0.14, floor + 0.3],
        'stroke="#a5815355" stroke-width=".7"',
      ),
    ).join("");
    const floorJoints = Array.from({ length: 7 }, (_, i) =>
      line(
        [0.5 + i * 0.5, 0.12, floor + 0.4],
        [0.5 + i * 0.5, 2.88, floor + 0.4],
        'stroke="#f5e7c9" stroke-width="1"',
      ),
    ).join("");
    const glazing = [0, 1, 2, 3]
      .map(
        (x) =>
          polygon(
            [
              [x + 0.1, 0.025, 7],
              [x + 0.9, 0.025, 7],
              [x + 0.9, 0.025, roof - 15],
              [x + 0.1, 0.025, roof - 15],
            ],
            'fill="#8ca99a" fill-opacity=".16" stroke="#567b6b" stroke-width="1"',
          ) +
          line(
            [x + 0.5, 0.025, 7],
            [x + 0.5, 0.025, roof - 15],
            'stroke="#698875" stroke-width="1"',
          ) +
          line(
            [x + 0.14, 0.025, 30],
            [x + 0.75, 0.025, roof - 33],
            'stroke="#ffffff" stroke-opacity=".35" stroke-width="2"',
          ),
      )
      .join("");
    const renderPosts = (positions: [number, number][]) =>
      positions
        .map(
          ([x, y]) =>
            solid(
              x - 0.035,
              y - 0.035,
              0.07,
              0.07,
              0,
              roof,
              "#c6ae7d",
              "#96724c",
              "#b48c59",
            ) +
            solid(
              x - 0.055,
              y - 0.055,
              0.11,
              0.11,
              0,
              8,
              "#789085",
              "#536c5d",
              "#687f6b",
            ) +
            solid(
              x - 0.047,
              y - 0.047,
              0.094,
              0.094,
              roof - 13,
              7,
              "#59766a",
              "#3f5f53",
              "#658575",
            ),
        )
        .join("");
    // The view faces the +x/+y corner. Rear posts must stay behind the slab;
    // front posts and every overhead beam must be painted above it.
    const frontColumns = columns.filter(([x, y]) => x === 4 || y === 3);
    const backColumns = columns.filter(([x, y]) => x !== 4 && y !== 3);
    const beams =
      [0, 1, 2, 3, 4]
        .map((x) =>
          solid(
            x - 0.035,
            -0.04,
            0.07,
            3.08,
            roof - 10,
            10,
            "#cdb482",
            "#8c6e48",
            "#ae8957",
          ),
        )
        .join("") +
      [0, 3]
        .map((y) =>
          solid(
            -0.04,
            y - 0.045,
            4.08,
            0.09,
            roof - 12,
            12,
            "#d6be8e",
            "#94724b",
            "#b28e5c",
          ),
        )
        .join("");
    const roofSlats = Array.from({ length: 23 }, (_, i) =>
      solid(
        0.04 + i * 0.175,
        0.03,
        0.065,
        0.72,
        roof,
        4,
        "#dfcc9f",
        "#b39366",
        "#ccb17f",
      ),
    ).join("");
    const stairs = Array.from({ length: 9 }, (_, i) =>
      solid(
        0.32 + i * 0.087,
        1.82,
        0.082,
        0.76,
        floor + 1,
        i * 3.2 + 2,
        "#d7bea0",
        "#9d7858",
        "#b99570",
      ),
    ).join("");
    const desk =
      solid(
        1.7,
        0.75,
        0.9,
        0.8,
        floor + 2,
        20,
        "#887e68",
        "#aaa18b",
        "#c7bea5",
      ) +
      solid(
        1.62,
        0.68,
        1.06,
        0.96,
        floor + 21,
        4,
        "#e7dac1",
        "#ab987b",
        "#c8b393",
      );
    const seating = [
      [2.9, 1.85],
      [2.9, 2.4],
      [1.7, 2.4],
    ]
      .map(
        ([x, y]) =>
          solid(
            x,
            y,
            0.48,
            0.36,
            floor + 1,
            9,
            "#456d5d",
            "#315545",
            "#628573",
          ) +
          solid(
            x,
            y,
            0.48,
            0.065,
            floor + 10,
            15,
            "#7a9981",
            "#3f6756",
            "#587d65",
          ),
      )
      .join("");
    const planter =
      solid(
        0.23,
        0.32,
        0.78,
        0.43,
        floor + 1,
        15,
        "#566f55",
        "#a7845d",
        "#c8a474",
      ) +
      Array.from({ length: 8 }, (_, i) => {
        const [x, y] = project([
          0.32 + (i % 4) * 0.17,
          0.43 + Math.floor(i / 4) * 0.16,
          floor + 25,
        ]);
        return `<ellipse cx="${x}" cy="${y}" rx="9" ry="6" fill="${i % 2 ? "#779175" : "#4f765c"}"/><path d="M${x} ${y + 7}v-8" stroke="#3e654b" stroke-width="1"/>`;
      }).join("");
    const shadows = [0, 1, 2]
      .map((i) =>
        polygon(
          plane(0.05 + i * 0.015, 0.09 + i * 0.02, 4.0, 2.9, -3 - i * 2),
          `fill="#405c4a" fill-opacity="${0.04 + i * 0.016}"`,
        ),
      )
      .join("");
    scene.innerHTML = `<svg viewBox="0 0 960 540" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true"><defs><pattern id="sp-paper" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M18 0H0V18" fill="none" stroke="#b3bdac" stroke-opacity=".18" stroke-width=".5"/></pattern></defs><rect width="960" height="540" fill="url(#sp-paper)"/><g data-ground-guide stroke="#9ba996" stroke-width="1" fill="none"><path d="M37 494v12h110M37 506v-4m22 4v-4m22 4v-4m22 4v-4m22 4v-4m22 4v-4"/></g></svg>
      <div class="sp-layer" data-depth="far"><svg viewBox="0 0 960 540" aria-hidden="true"><defs><pattern id="sp-concrete" width="11" height="9" patternUnits="userSpaceOnUse"><path d="M2 2h2m4 4h1" stroke="#849489" stroke-width=".8" opacity=".35"/></pattern></defs><g data-layer-content data-material="concrete">
      ${polygon(plane(-0.18, -0.18, 4.36, 3.36, -4), 'fill="#dce1d5" stroke="#a7b7a7" stroke-width=".8"')}
      ${polygon(plane(-0.18, -0.18, 4.36, 3.36, -4), 'fill="url(#sp-concrete)"')}
      <g stroke="#a4b19f" stroke-width=".6">${siteGrid}</g>${shadows}
      ${solid(0, 0, 4, 3, -7, 7, "#e5e5d8", "#aab4a5", "#c2cabb")}
      ${polygon(footprint(0), 'data-footprint fill="none" stroke="#8b9e8a" stroke-width="1"')}
      ${Array.from({ length: 11 }, (_, i) => line([0.15 + i * 0.34, 0.1, 1], [0.15 + i * 0.34, 2.9, 1], 'stroke="#bcc6b4" stroke-width=".7"')).join("")}
      </g></svg></div>
      <div class="sp-layer" data-depth="middle-back"><svg viewBox="0 0 960 540" aria-hidden="true"><g data-layer-content><g data-material="glass">${glazing}</g><g data-material="timber" data-component="rear-joinery">${renderPosts(backColumns)}</g>
      ${line([0, 0, floor], [4, 0, floor], 'stroke="#637f70" stroke-width="3"')}
      ${line([0, 0, floor], [0, 3, floor], 'stroke="#718979" stroke-width="2"')}
      </g></svg></div>
      <div class="sp-layer" data-depth="near"><svg viewBox="0 0 960 540" aria-hidden="true"><defs><pattern id="sp-section-hatch" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 5L5 0" stroke="#8f6d50" stroke-opacity=".45" stroke-width=".8"/></pattern></defs><g data-layer-content>
      ${polygon(footprint(floor - 17), 'fill="#36543d" fill-opacity=".07"')}
      ${solid(0, 0, 4, 3, floor - 12, 12, "#d7b989", "#9b7656", "#bc9467")}
      ${polygon(
        [
          [0, 3, floor],
          [4, 3, floor],
          [4, 3, floor - 12],
          [0, 3, floor - 12],
        ],
        'fill="url(#sp-section-hatch)"',
      )}
      ${polygon(footprint(floor), 'data-footprint fill="none" stroke="#967044" stroke-width="1"')}
      ${polygon(plane(0.12, 0.12, 3.76, 2.76, floor + 0.1), 'fill="#e4d0a7" stroke="#f2e5cc" stroke-width="1"')}${woodGrain}${floorJoints}
      ${solid(0.24, 1.73, 0.95, 0.94, floor + 0.4, 1, "#9e886a", "#745c44", "#baa385")}<g data-component="floor-plan">${stairs}${desk}${seating}${planter}</g>
      ${line([0.12, 2.88, floor + 1], [3.88, 2.88, floor + 1], 'stroke="#faf0d7" stroke-width="2"')}
      ${[0.6, 1.6, 2.6, 3.6].map((x) => line([x, 2.98, floor - 4], [x + 0.16, 2.98, floor - 4], 'stroke="#e7d4b2" stroke-width="1"')).join("")}
      </g></svg></div>
      <div class="sp-layer" data-depth="middle-front"><svg viewBox="0 0 960 540" aria-hidden="true"><g data-layer-content><g data-material="timber" data-component="joinery">${renderPosts(frontColumns)}<g data-component="roof-beams">${beams}${roofSlats}</g></g>
      ${polygon(footprint(roof), 'data-footprint fill="none" stroke="#b69b6c" stroke-width=".7"')}
      ${columns.map(([x, y]) => line([x - 0.06, y, roof - 5], [x + 0.06, y, roof - 5], 'stroke="#e5d8bc" stroke-width="1.5"')).join("")}
      </g></svg></div>`;
    const driver = document.createElement("div");
    driver.className = "sp-scroller";
    driver.style.cssText =
      "position:absolute;inset:0;width:960px;height:540px;padding:0;border:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:none;background:transparent;touch-action:pan-y;outline-offset:-4px;z-index:4";
    driver.tabIndex = 0;
    driver.setAttribute("role", "region");
    driver.setAttribute(
      "aria-label",
      "建築剖面捲動控制；方向鍵、Page Down、Home 與 End 可調整深度",
    );
    driver.innerHTML =
      '<div style="height:1740px;width:1px;pointer-events:none" aria-hidden="true"></div>';
    const resume = document.createElement("button");
    resume.type = "button";
    resume.textContent = "自動";
    resume.setAttribute("aria-label", "恢復自動展示");
    resume.style.cssText =
      "position:absolute;right:20px;bottom:18px;z-index:5;padding:7px 13px;border:1px solid #8a9a87;border-radius:20px;background:#f9f8efee;color:#526450;font:12px Arial,sans-serif;cursor:pointer";
    resume.hidden = true;
    root.append(scene, driver, resume);
    const layers = [...scene.querySelectorAll<HTMLElement>(".sp-layer")];
    // Only the middle floor/slab separates; foundation and outer frame stay registered.
    const distances = [0, 0, 32, 0];
    const animations = layers.map((layer, i) => {
      const span = distances[i];
      const animation = layer.animate(
        [
          { transform: `translateY(${span / 2}px)` },
          { transform: `translateY(${-span / 2}px)` },
        ],
        { duration: 1000, fill: "both", easing: "linear" },
      );
      animation.pause();
      return animation;
    });
    let manual = false;
    let scrollArmed = true;
    const paint = (p: number) => {
      const progress = Math.min(1, Math.max(0, p));
      animations.forEach((animation) => {
        animation.currentTime = (reducedMotion ? 0.5 : progress) * 1000;
      });
      scene.dataset.progress = String(reducedMotion ? 0.5 : progress);
      scene.dataset.owner = manual ? "scroll" : "host";
    };
    const readScroll = () => {
      if (!scrollArmed) return;
      manual = true;
      resume.hidden = false;
      paint(driver.scrollTop / (driver.scrollHeight - driver.clientHeight));
    };
    driver.addEventListener("scroll", readScroll, { signal });
    // Ignore residual native keyboard/touch momentum after an explicit handoff.
    // A new user intent arms the actual native scroll position again.
    for (const intent of ["wheel", "pointerdown", "keydown"] as const)
      driver.addEventListener(
        intent,
        () => {
          scrollArmed = true;
        },
        { signal, passive: true },
      );
    resume.addEventListener(
      "click",
      () => {
        manual = false;
        scrollArmed = false;
        resume.hidden = true;
        scene.dataset.owner = "host";
      },
      { signal },
    );
    paint(0);
    return {
      seek: (seconds) => {
        if (!manual)
          paint((1 - Math.cos((2 * Math.PI * Math.max(0, seconds)) / 4)) / 2);
      },
      dispose: () => {
        animations.forEach((animation) => animation.cancel());
        root.replaceChildren();
      },
    };
  }
  const product = document.createElement("div");
  product.className = "sp-product";
  product.tabIndex = 0;
  product.setAttribute("role", "group");
  product.setAttribute(
    "aria-label",
    "多平面規格卡；方向鍵傾斜、Home 歸位，觸控可拖曳",
  );
  product.innerHTML = `<div class="sp-perspective-hint">FOREGROUND / CONTENT / GRID</div><div class="sp-view-label">X 0° / Y 0°</div><div class="sp-rig"><div class="sp-plane sp-back"></div><div class="sp-plane sp-middle"><div class="sp-type">ORIGINAL PRODUCT STUDY</div><div class="sp-product-name">Field / 35</div><div class="sp-lens"></div><div class="sp-note">光學概念規格卡<br/>背景網格 · 內容平面 · 前景標籤</div></div><div class="sp-plane sp-front"><div style="font-size:10px;letter-spacing:.13em;opacity:.7">OPTICAL STUDY</div><div style="font-size:39px;line-height:1.3;margin-top:8px">35<span style="font-size:15px"> mm</span></div><div style="font-size:11px;opacity:.8">原創示意・非商品規格</div></div></div>`;
  if (!scroll) {
    // Use the complete case canvas for the product perspective; remove the
    // shared dashboard header, caption, and external annotation rail.
    root.querySelector("header")?.remove();
    caption.remove();
    root.style.background = "#e7ded4";
    stage.style.cssText =
      "position:absolute;inset:0;width:960px;height:540px;overflow:hidden;border-radius:0;isolation:isolate;background-image:linear-gradient(#7c6a5b0b 1px,transparent 1px),linear-gradient(90deg,#7c6a5b0b 1px,transparent 1px),radial-gradient(ellipse at 48% 24%,#fffaf0,#e7ded4);background-size:32px 32px,32px 32px,auto";
    controls.style.top = "22px";
    controls.style.right = "28px";
    controls.querySelectorAll("button").forEach((control) => {
      control.style.background = "#fffaf0dc";
      control.style.backdropFilter = "blur(8px)";
    });
  } else {
    stage.style.background = "radial-gradient(ellipse at 45% 30%,#fffaf0,#e7ded4)";
  }
  stage.style.borderRadius = scroll ? "8px" : "0";
  stage.append(product);
  const rig = product.querySelector<HTMLElement>(".sp-rig")!;
  const label = product.querySelector<HTMLElement>(".sp-view-label")!;
  let x = 0,
    y = 0,
    manual = false,
    dragging = false;
  const paint = (nextX: number, nextY: number, transition: boolean) => {
    x = Math.max(-20, Math.min(20, nextX));
    y = Math.max(-16, Math.min(16, nextY));
    rig.style.transition =
      transition && !reducedMotion
        ? "transform 260ms cubic-bezier(.2,.7,.3,1)"
        : "none";
    rig.style.transform = `rotateX(${reducedMotion ? 0 : y}deg) rotateY(${reducedMotion ? 0 : x}deg)`;
    label.textContent = `X ${Math.round(x)}° / Y ${Math.round(y)}°`;
    caption.textContent = reducedMotion
      ? "低動態模式：平面保持固定 · 方向鍵與觸控仍更新控制讀值"
      : "CSS 透視與三個深度平面 · 指標／拖曳／方向鍵接管 · Home 歸位";
  };
  const point = (event: PointerEvent) => {
    const rect = product.getBoundingClientRect();
    manual = true;
    paint(
      ((event.clientX - rect.left) / rect.width - 0.5) * 40,
      -((event.clientY - rect.top) / rect.height - 0.5) * 32,
      true,
    );
  };
  product.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "mouse" || dragging) point(event);
    },
    { signal },
  );
  product.addEventListener(
    "pointerdown",
    (event) => {
      dragging = true;
      product.setPointerCapture(event.pointerId);
      point(event);
    },
    { signal },
  );
  product.addEventListener(
    "pointerup",
    () => {
      dragging = false;
    },
    { signal },
  );
  product.addEventListener(
    "pointercancel",
    () => {
      dragging = false;
    },
    { signal },
  );
  product.addEventListener(
    "keydown",
    (event) => {
      if (
        !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(
          event.key,
        )
      )
        return;
      event.preventDefault();
      manual = true;
      paint(
        event.key === "Home"
          ? 0
          : x +
              (event.key === "ArrowLeft"
                ? -4
                : event.key === "ArrowRight"
                  ? 4
                  : 0),
        event.key === "Home"
          ? 0
          : y +
              (event.key === "ArrowUp"
                ? -4
                : event.key === "ArrowDown"
                  ? 4
                  : 0),
        true,
      );
    },
    { signal },
  );
  button(controls, "向左傾斜", signal, () => {
    manual = true;
    paint(-18, -7, true);
  });
  button(controls, "向右傾斜", signal, () => {
    manual = true;
    paint(18, 7, true);
  });
  button(controls, "歸位", signal, () => {
    manual = true;
    paint(0, 0, true);
  });
  paint(0, 0, false);
  return {
    seek: (seconds) => {
      if (!manual)
        paint(
          Math.sin((seconds * Math.PI) / 2) * 16,
          Math.sin((seconds * Math.PI) / 2 + 1) * 8,
          false,
        );
    },
    dispose: () => root.replaceChildren(),
  };
};
export default mount;
