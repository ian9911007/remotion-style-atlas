/** Created: 2026-10-04. Observable Plot transforms and faceted composition. */
import * as Plot from "@observablehq/plot";
import type { Mount } from "./types";
import { shell, button } from "./data-shared";
export function plotLoopState(seconds: number) {
  return (1 - Math.cos(2 * Math.PI * ((Math.max(0, seconds) % 4) / 4))) / 2;
}
const stagger = (mix: number, delay: number) => {
  const value = Math.max(0, Math.min(1, (mix - delay) / (1 - delay)));
  return value * value * (3 - 2 * value);
};
const mount: Mount = async (root, { variant, signal, reducedMotion }) => {
  const facet = variant === "facets";
  let mode = 0,
    manual = false;
  const { stage, controls, caption } = shell(
    root,
    facet
      ? { bg: "#fffaf1", fg: "#263d42", accent: "#ac613f" }
      : { bg: "#f0f0f7", fg: "#3a3e60", accent: "#6963a1" },
    facet
      ? "OBSERVABLE PLOT / FACET + MARKS"
      : "OBSERVABLE PLOT / BIN TRANSFORM",
    facet ? "四個季節，同一把尺" : "觀測分布與累積頻率",
    "原創示意資料 · 語意標記與轉換 · 無外部資料",
  );
  const values = Array.from({ length: 240 }, (_, i) => ({
    score: 30 + 22 * Math.sin(i * 2.399) + 14 * Math.cos(i * 0.71) + (i % 5),
    group: ["春", "夏", "秋", "冬"][i % 4],
    day: (i % 30) + 1,
    value: 32 + Math.sin(i * 0.3) * 15 + (i % 4) * 8,
  }));
  const seasons = Array.from({ length: 4 }, (_, g) =>
    Array.from({ length: 30 }, (_, d) => ({
      group: ["春", "夏", "秋", "冬"][g],
      day: d + 1,
      value:
        34 + g * 7 + Math.sin(d * 0.23 + g) * 14 + Math.cos(d * 0.63 + g) * 4,
    })),
  ).flat();
  const build = (displayMode: number) => {
    const node = Plot.plot(
      facet
        ? {
            width: 870,
            height: 354,
            marginLeft: 46,
            marginBottom: 42,
            style: {
              background: "transparent",
              color: "#385359",
              fontSize: "12px",
              fontFamily: "Arial",
            },
            fy: { domain: ["春", "夏", "秋", "冬"], label: null },
            x: { label: "日序", domain: [1, 30] },
            y: { label: null, domain: [0, 90], grid: true },
            color: {
              domain: ["春", "夏", "秋", "冬"],
              range: ["#779d77", "#bdaa52", "#b36744", "#547791"],
            },
            marks: [
              Plot.ruleY([40], { stroke: "#d3cbbd" }),
              Plot.lineY(
                seasons.filter((d) => !displayMode || d.day <= 20),
                {
                  x: "day",
                  y: "value",
                  fy: "group",
                  stroke: "group",
                  sort: "day",
                  strokeWidth: 2.5,
                  ariaDescription: "season traces",
                },
              ),
              Plot.dot(
                seasons.filter(
                  (d) => d.day % 5 === 0 && (!displayMode || d.day <= 20),
                ),
                {
                  x: "day",
                  y: "value",
                  fy: "group",
                  fill: "group",
                  r: 3,
                  ariaDescription: "season observations",
                },
              ),
            ],
          }
        : {
            width: 850,
            height: 354,
            marginLeft: 55,
            marginBottom: 42,
            style: {
              background: "transparent",
              color: "#515373",
              fontSize: "12px",
              fontFamily: "Arial",
            },
            x: { label: "觀測分數", domain: [-10, 80] },
            y: { label: displayMode ? "累積筆數" : "樣本筆數", grid: true },
            marks: [
              Plot.rectY(values, {
                ...Plot.binX(
                  { y: "count" },
                  { x: "score", thresholds: 18, cumulative: displayMode > 0 },
                ),
                fill: "#7772ad",
                ariaDescription: "histogram bars",
                inset: 1.8,
              }),
              Plot.ruleY([0], { stroke: "#83809c" }),
              Plot.ruleX([30], {
                stroke: "#bd694c",
                strokeDasharray: "5,4",
                strokeWidth: 2,
              }),
            ],
          },
    );
    node.setAttribute(
      "aria-label",
      facet
        ? "依季節分面的四張折線圖，使用一致尺度"
        : "原創觀測樣本的分布直方圖，可切換累積模式",
    );
    return node;
  };
  let plots: (SVGSVGElement | HTMLElement)[] = [];
  let paths: SVGPathElement[] = [];
  let pathLengths: number[] = [];
  let dots: SVGCircleElement[] = [];
  const rebuild = () => {
    plots = facet ? [build(mode)] : [build(0), build(1)];
    plots.forEach((node) => {
      node.style.position = "absolute";
      node.style.inset = "0";
    });
    stage.replaceChildren(...plots);
    if (facet) {
      paths = [
        ...stage.querySelectorAll<SVGPathElement>(
          '[aria-description="season traces"] path',
        ),
      ];
      pathLengths = paths.map((path) => path.getTotalLength());
      dots = [
        ...stage.querySelectorAll<SVGCircleElement>(
          '[aria-description="season observations"] circle',
        ),
      ];
    }
  };
  const draw = (seconds: number) => {
    const mix = plotLoopState(seconds);
    if (facet) {
      const progress = paths.map((_, index) =>
        manual || reducedMotion ? 1 : 0.2 + 0.8 * stagger(mix, index * 0.09),
      );
      paths.forEach((path, index) => {
        path.setAttribute("stroke-dasharray", String(pathLengths[index]));
        path.setAttribute(
          "stroke-dashoffset",
          String(pathLengths[index] * (1 - progress[index])),
        );
      });
      const days = mode ? 20 : 30,
        perSeason = days / 5;
      dots.forEach((dot, index) => {
        const phase = progress[Math.floor(index / perSeason)] ?? 1;
        const day = ((index % perSeason) + 1) * 5;
        dot.setAttribute(
          "opacity",
          String(stagger(phase, Math.max(0, (day - 3) / days))),
        );
      });
      caption.textContent = manual
        ? `原創示意資料 · 分面共用 Y 尺度 · ${mode ? "前 20 日" : "完整月份"}`
        : "原創示意資料 · 四季折線依序展開與回收 · 分面共用同一把尺";
    } else {
      const progress = manual ? mode : reducedMotion ? 0 : mix;
      if (!manual) mode = Number(progress > 0.5);
      plots.forEach((node, layer) => {
        node.setAttribute(
          "aria-hidden",
          String(layer === 0 ? progress > 0.5 : progress <= 0.5),
        );
        for (const group of node.querySelectorAll<SVGGElement>(
          "g[aria-label]",
        )) {
          if (group.getAttribute("aria-description") !== "histogram bars")
            group.setAttribute(
              "opacity",
              String(layer ? progress : 1 - progress),
            );
        }
        const bars = [
          ...node.querySelectorAll<SVGRectElement>(
            '[aria-description="histogram bars"] rect',
          ),
        ];
        bars.forEach((bar, index) => {
          const delay = (0.24 * index) / Math.max(1, bars.length - 1);
          const column = stagger(progress, delay);
          bar.setAttribute("opacity", String(layer ? column : 1 - column));
        });
      });
      caption.textContent =
        "原創示意資料 · 頻率 / 累積分布逐欄比較 · 兩組實際 binX 轉換往返展示";
    }
  };
  button(controls, facet ? "切換觀測窗" : "切換累積分布", signal, () => {
    manual = true;
    mode = 1 - mode;
    if (facet) rebuild();
    draw(0);
  });
  button(controls, "自動展示", signal, () => {
    manual = false;
    if (facet && mode) {
      mode = 0;
      rebuild();
    }
    draw(0);
  });
  rebuild();
  draw(0);
  return { seek: draw, dispose: () => root.replaceChildren() };
};
export default mount;
