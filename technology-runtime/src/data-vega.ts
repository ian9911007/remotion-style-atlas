/** Created: 2026-10-04. Vega dataflow and Vega-Lite compiler; no autonomous clock. */
import * as vega from "vega";
import { compile } from "vega-lite";
import type { Mount } from "./types";
import { shell, range, button } from "./data-shared";

const points = Array.from({ length: 120 }, (_, i) => ({
  x: (i * 37) % 100,
  y: 15 + ((i * 53) % 75),
  group: ["A", "B", "C"][i % 3],
  size: 25 + (i % 7) * 15,
}));
export function vegaLoopState(seconds: number) {
  const phase = (Math.max(0, seconds) % 4) / 4;
  const slot = phase * 3;
  const mix = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  return {
    focus: Math.min(3, Math.floor(slot) + 1),
    strength: Math.sin(Math.PI * (slot % 1)) ** 2,
    mix,
  };
}
const stagger = (mix: number, index: number) => {
  const t = Math.max(0, Math.min(1, (mix - index * 0.045) / 0.685));
  return t * t * (3 - 2 * t);
};
const mount: Mount = async (root, { variant, signal, reducedMotion }) => {
  const lite = variant.startsWith("lite-");
  const density = variant === "lite-density";
  const stack = variant === "stack";
  const { stage, controls, caption } = shell(
    root,
    lite
      ? { bg: "#faf8f4", fg: "#302e3b", accent: "#aa5943" }
      : { bg: "#edf1f3", fg: "#203e4d", accent: "#28736f" },
    lite ? "VEGA-LITE / COMPILED SPECIFICATION" : "VEGA / REACTIVE DATAFLOW",
    density
      ? "樣本密度，從散點到分箱"
      : variant === "lite-interval"
        ? "估計值與不確定區間"
        : stack
          ? "組成變化：資料流堆疊"
          : "一道門檻，重新閱讀分布",
    "原創示意資料 · 規格驅動 SVG",
  );
  let threshold = 52;
  let spec: any;
  let manual = false;
  // Both density layers execute the real Vega-Lite bin/count pipeline. Their
  // common bins and color scale stay fixed while host time reveals columns.
  const densityTransforms = [
    {
      bin: { maxbins: 12, extent: [0, 100] },
      field: "x",
      as: ["binX0", "binX1"],
    },
    {
      bin: { maxbins: 8, extent: [0, 100] },
      field: "y",
      as: ["binY0", "binY1"],
    },
    {
      aggregate: [{ op: "count", as: "count" }],
      groupby: ["binX0", "binX1", "binY0", "binY1"],
    },
  ];
  const cellProgress = "clamp((sampleMix - datum.binX0 / 500) / 0.8, 0, 1)";
  const cellMix = `pow(${cellProgress}, 2) * (3 - 2 * ${cellProgress})`;
  if (lite) {
    spec = density
      ? {
          width: 750,
          height: 270,
          data: { values: points },
          params: [{ name: "sampleMix", value: 0 }],
          layer: [false, true].map((filtered) => ({
            transform: [
              ...(filtered ? [{ filter: "datum.group !== 'C'" }] : []),
              ...densityTransforms,
            ],
            mark: {
              type: "rect",
              stroke: "#faf8f4",
              strokeWidth: 2,
              opacity: { expr: filtered ? cellMix : `1 - (${cellMix})` },
            },
            encoding: {
              x: {
                field: "binX0",
                type: "quantitative",
                bin: "binned",
                scale: { domain: [0, 100] },
                title: "觀測 X",
              },
              x2: { field: "binX1" },
              y: {
                field: "binY0",
                type: "quantitative",
                bin: "binned",
                scale: { domain: [0, 100] },
                title: "觀測 Y",
              },
              y2: { field: "binY1" },
              color: {
                field: "count",
                type: "quantitative",
                scale: { scheme: "oranges" },
                legend: { gradientOpacity: 1 },
                title: "樣本數",
              },
              tooltip: [
                { field: "count", type: "quantitative", title: "樣本數" },
              ],
            },
          })),
        }
      : {
          width: 750,
          height: 275,
          data: {
            values: Array.from({ length: 8 }, (_, i) => ({
              name: `MODEL ${String.fromCharCode(65 + i)}`,
              estimate: 30 + i * 6,
              lower: 20 + i * 6 - (i % 3) * 3,
              upper: 42 + i * 6 + (i % 2) * 4,
            })),
          },
          layer: [
            {
              mark: { type: "rule", color: "#c5a499", strokeWidth: 8 },
              encoding: {
                x: {
                  field: "lower",
                  type: "quantitative",
                  scale: { domain: [0, 100] },
                  title: "估計分數",
                },
                x2: { field: "upper" },
                y: { field: "name", type: "nominal", sort: null, title: null },
              },
            },
            {
              mark: {
                type: "point",
                filled: true,
                size: 170,
                color: "#954b39",
              },
              encoding: {
                x: { field: "estimate", type: "quantitative" },
                y: { field: "name", type: "nominal", sort: null },
                tooltip: [
                  { field: "name" },
                  { field: "estimate" },
                  { field: "lower" },
                  { field: "upper" },
                ],
              },
            },
          ],
        };
    spec = compile({
      ...spec,
      $schema: "https://vega.github.io/schema/vega-lite/v6.json",
      background: "transparent",
      padding: 15,
      config: {
        font: "Arial",
        view: { stroke: null },
        axis: {
          labelFontSize: 12,
          titleFontSize: 12,
          gridColor: "#e4dfd7",
          domainColor: "#b4b1aa",
        },
        legend: { labelFontSize: 12 },
      },
    } as any).spec;
  } else if (stack) {
    const values = Array.from({ length: 18 }, (_, t) =>
      ["地熱", "水力", "太陽能"].map((name, i) => ({
        t,
        name,
        value: 20 + i * 8 + Math.sin(t * 0.6 + i) * 12,
      })),
    ).flat();
    spec = {
      $schema: "https://vega.github.io/schema/vega/v6.json",
      width: 760,
      height: 280,
      padding: { left: 48, right: 12, top: 10, bottom: 40 },
      signals: [
        { name: "focus", value: 0 },
        { name: "focusStrength", value: 0 },
      ],
      data: [
        {
          name: "table",
          values,
          transform: [
            {
              type: "stack",
              groupby: ["t"],
              sort: { field: "name" },
              field: "value",
              as: ["low", "high"],
            },
          ],
        },
      ],
      scales: [
        { name: "x", type: "linear", domain: [0, 17], range: "width" },
        {
          name: "y",
          type: "linear",
          domain: { data: "table", field: "high" },
          range: "height",
          nice: true,
        },
        {
          name: "color",
          type: "ordinal",
          domain: ["地熱", "水力", "太陽能"],
          range: ["#254f57", "#6a9e90", "#d1b560"],
        },
      ],
      axes: [
        { orient: "bottom", scale: "x", title: "TIME" },
        { orient: "left", scale: "y", grid: true, gridColor: "#d8e0df" },
      ],
      legends: [
        {
          fill: "color",
          orient: "top",
          direction: "horizontal",
          symbolType: "square",
        },
      ],
      marks: [
        {
          type: "group",
          from: { facet: { name: "series", data: "table", groupby: "name" } },
          marks: [
            {
              type: "area",
              from: { data: "series" },
              encode: {
                enter: {
                  x: { scale: "x", field: "t" },
                  y: { scale: "y", field: "low" },
                  y2: { scale: "y", field: "high" },
                  fill: { scale: "color", field: "name" },
                  interpolate: { value: "monotone" },
                },
                update: {
                  opacity: {
                    signal:
                      'focus === 0 || datum.name === (focus === 1 ? "地熱" : focus === 2 ? "水力" : "太陽能") ? 1 : 1 - 0.78 * focusStrength',
                  },
                },
              },
            },
          ],
        },
      ],
    };
  } else {
    spec = {
      $schema: "https://vega.github.io/schema/vega/v6.json",
      width: 760,
      height: 280,
      padding: { left: 45, right: 15, top: 14, bottom: 35 },
      signals: [{ name: "threshold", value: threshold }],
      data: [{ name: "samples", values: points }],
      scales: [
        { name: "x", type: "linear", domain: [0, 100], range: "width" },
        { name: "y", type: "linear", domain: [0, 100], range: "height" },
        {
          name: "color",
          type: "ordinal",
          domain: ["A", "B", "C"],
          range: ["#31606e", "#bc7962", "#879b70"],
        },
      ],
      axes: [
        { orient: "bottom", scale: "x", title: "OBSERVATION" },
        { orient: "left", scale: "y", grid: true, gridColor: "#d7e0e3" },
      ],
      marks: [
        {
          type: "symbol",
          from: { data: "samples" },
          encode: {
            enter: {
              x: { scale: "x", field: "x" },
              y: { scale: "y", field: "y" },
              size: { field: "size" },
              fill: { scale: "color", field: "group" },
            },
            update: {
              opacity: { signal: "datum.y >= threshold ? 0.9 : 0.12" },
              strokeWidth: { value: 1 },
              stroke: { value: "#fff" },
            },
          },
        },
        {
          type: "rule",
          encode: {
            update: {
              x: { value: 0 },
              x2: { signal: "width" },
              y: { scale: "y", signal: "threshold" },
              stroke: { value: "#a74835" },
              strokeWidth: { value: 2 },
              strokeDash: { value: [5, 4] },
            },
          },
        },
      ],
    };
  }
  // Copy plain fixture fields before Vega ingests tuples. Copying ingested tuple
  // symbols into replacement rows would reuse identity and suppress the update.
  const source = lite
    ? spec.data.find((data: any) => Array.isArray(data.values))
    : undefined;
  const originalValues = source
    ? source.values.map((value: any) =>
        Object.fromEntries(Object.entries(value)),
      )
    : [];
  const view = new vega.View(vega.parse(spec), {
    renderer: "svg",
    container: stage,
    hover: true,
  });
  let disposed = false,
    sequence = Promise.resolve();
  let focus = 0;
  let last = -1;
  const run = () => {
    sequence = sequence.then(async () => {
      if (!disposed) await view.runAsync();
    });
    return sequence;
  };
  await run();
  if (!lite && !stack)
    range(controls, "門檻", 10, 90, threshold, signal, (value) => {
      threshold = value;
      view.signal("threshold", value);
      void run();
    });
  if (stack)
    button(controls, "切換能源焦點", signal, () => {
      manual = true;
      focus = (focus + 1) % 4;
      view.signal("focus", focus).signal("focusStrength", 1);
      void run();
    });
  let scenario = 0;
  const updateInterval = (mix: number) => {
    const values = originalValues.map((value: any, i: number) => {
      const offset = (i % 2 === 0 ? 7 : -5) * stagger(mix, i);
      return {
        ...value,
        estimate: value.estimate + offset,
        lower: value.lower + offset,
        upper: value.upper + offset,
      };
    });
    view.change(
      source.name,
      vega
        .changeset()
        .remove(() => true)
        .insert(values),
    );
  };
  if (lite)
    button(controls, density ? "切換樣本範圍" : "切換估計情境", signal, () => {
      manual = true;
      scenario = 1 - scenario;
      if (density) view.signal("sampleMix", scenario);
      else updateInterval(scenario);
      void run();
      caption.textContent = density
        ? `${scenario ? 80 : 120} 筆原創合成樣本 · Vega-Lite bin → count → rect · 非真實觀測`
        : `8 組原創示意估計 · 情境 ${scenario + 1} · rule 上下限與 point 中心值同步更新`;
    });
  if (lite || stack)
    button(controls, "自動展示", signal, () => {
      manual = false;
    });
  return {
    seek: (seconds) => {
      if (lite || stack) {
        if (manual) return;
        const state = vegaLoopState(reducedMotion ? 0 : seconds);
        if (stack) {
          focus = state.strength > 0.5 ? state.focus : 0;
          view
            .signal("focus", state.focus)
            .signal("focusStrength", state.strength);
          caption.textContent =
            "原創示意資料 · 地熱 → 水力 → 太陽能逐項聚焦還原 · 相同堆疊資料流";
        } else if (density) {
          scenario = Number(state.mix > 0.5);
          view.signal("sampleMix", state.mix);
          caption.textContent =
            "原創示意資料 · 120 / 80 筆樣本依欄錯開比較 · 兩組 bin → count 共用尺度";
        } else {
          scenario = Number(state.mix > 0.5);
          updateInterval(state.mix);
          caption.textContent =
            "8 組原創示意估計 · 各列錯開往返 · 上下限與中心值同源補間";
        }
        return run();
      }
      const n = Math.floor(seconds * 8);
      if (n === last) return;
      last = n;
      view.signal("threshold", threshold + Math.sin(seconds * 0.65) * 10);
      return run();
    },
    dispose: () => {
      disposed = true;
      view.finalize();
      root.replaceChildren();
    },
  };
};
export default mount;
