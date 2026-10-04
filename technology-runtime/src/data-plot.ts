/** Created: 2026-10-04. Observable Plot transforms and faceted composition. */
import * as Plot from "@observablehq/plot";
import type { Mount } from "./types";
import { shell, button } from "./data-shared";
const mount: Mount = async (root, { variant, signal }) => {
  const facet = variant === "facets";
  let mode = 0;
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
  const draw = () => {
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
                seasons.filter((d) => !mode || d.day <= 20),
                {
                  x: "day",
                  y: "value",
                  fy: "group",
                  stroke: "group",
                  sort: "day",
                  strokeWidth: 2.5,
                },
              ),
              Plot.dot(
                seasons.filter(
                  (d) => d.day % 5 === 0 && (!mode || d.day <= 20),
                ),
                { x: "day", y: "value", fy: "group", fill: "group", r: 3 },
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
            y: { label: mode ? "累積筆數" : "樣本筆數", grid: true },
            marks: [
              Plot.rectY(values, {
                ...Plot.binX(
                  { y: "count" },
                  { x: "score", thresholds: 18, cumulative: mode > 0 },
                ),
                fill: "#7772ad",
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
    stage.replaceChildren(node);
    caption.textContent = facet
      ? `原創示意資料 · 分面使用相同 Y 尺度 · ${mode ? "前 20 日" : "完整月份"}`
      : `原創示意資料 · ${mode ? "累積分布" : "頻率分布"} · binX 以資料轉換產生區間`;
  };
  button(controls, facet ? "切換觀測窗" : "切換累積分布", signal, () => {
    mode = 1 - mode;
    draw();
  });
  draw();
  return { seek: () => {}, dispose: () => root.replaceChildren() };
};
export default mount;
