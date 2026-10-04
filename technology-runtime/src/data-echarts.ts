/** Created: 2026-10-04. ECharts option updates and shared category selection. */
import * as echarts from "echarts";
import type { Mount } from "./types";
import { shell, button, wave } from "./data-shared";
export function echartsLoopState(seconds: number) {
  const progress =
    (1 - Math.cos(2 * Math.PI * ((Math.max(0, seconds) % 4) / 4))) / 2;
  const day = progress * 6;
  const from = Math.floor(day),
    to = Math.min(6, from + 1),
    fraction = day - from;
  return { from, to, mix: fraction * fraction * (3 - 2 * fraction) };
}
const mount: Mount = async (root, { variant, signal, reducedMotion }) => {
  const heat = variant === "heatmap";
  let selected = 0,
    last = -1;
  const { stage, controls, caption } = shell(
    root,
    heat
      ? { bg: "#14202a", fg: "#eef2ed", accent: "#d5b56e" }
      : { bg: "#f9f7f2", fg: "#173a45", accent: "#af6244" },
    heat ? "ECHARTS / LINKED SELECTION" : "ECHARTS / SERIES UPDATE",
    heat ? "負載熱區與日內剖面" : "觀測窗：訊號與區間",
    "原創示意資料 · 點選圖形或使用按鈕",
  );
  const chart = echarts.init(stage, null, {
    renderer: "canvas",
    width: 880,
    height: 374,
    devicePixelRatio: Math.min(devicePixelRatio, 1.5),
  });
  let manual = false,
    heatInitialized = false;
  const days = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];
  const values = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 12 }, (_, h) => [
      h,
      d,
      Math.round(35 + 25 * Math.sin(h * 0.5 + d * 0.8) + d * 3),
    ]),
  ).flat();
  const draw = (seconds: number) => {
    const step = Math.floor(seconds * 4);
    if (!heat && step === last) return;
    last = step;
    if (heat) {
      const state = manual
        ? { from: selected, to: selected, mix: 0 }
        : echartsLoopState(reducedMotion ? 0 : seconds);
      if (!manual) selected = state.mix < 0.5 ? state.from : state.to;
      const profile = (day: number) =>
        values.filter((value) => value[1] === day).map((value) => value[2]);
      const from = profile(state.from),
        to = profile(state.to);
      const focusWeight = (day: number) =>
        state.from === state.to
          ? Number(day === state.from)
          : Number(day === state.from) * (1 - state.mix) +
            Number(day === state.to) * state.mix;
      const option: echarts.EChartsOption = {
        animation: false,
        backgroundColor: "transparent",
        textStyle: { color: "#dce6e8" },
        tooltip: { trigger: "item", confine: true },
        grid: [
          { left: 50, right: 20, top: 5, height: 210 },
          { left: 50, right: 20, top: 259, height: 80 },
        ],
        xAxis: [
          {
            type: "category",
            data: Array.from({ length: 12 }, (_, i) => `${i * 2}:00`),
            axisLine: { lineStyle: { color: "#46616b" } },
            axisLabel: { color: "#a2b4bc" },
          },
          {
            type: "category",
            data: Array.from({ length: 12 }, (_, i) => i * 2),
            gridIndex: 1,
            show: false,
          },
        ],
        yAxis: [
          {
            type: "category",
            data: days,
            axisLine: { show: false },
            axisLabel: { color: "#dce6e8" },
          },
          { type: "value", gridIndex: 1, show: false, min: 0, max: 100 },
        ],
        visualMap: {
          min: 0,
          max: 100,
          show: false,
          inRange: { color: ["#203540", "#577f82", "#cfb976", "#f9e1a6"] },
        },
        series: [
          {
            id: "matrix",
            type: "heatmap",
            data: values.map((value) => ({
              value,
              itemStyle: { opacity: 0.4 + 0.6 * focusWeight(value[1]) },
            })),
            itemStyle: { borderWidth: 3, borderColor: "#14202a" },
            emphasis: { itemStyle: { borderColor: "#fff", borderWidth: 2 } },
          },
          {
            id: "profile",
            type: "line",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: from.map(
              (value, hour) => value + (to[hour] - value) * state.mix,
            ),
            symbol: "circle",
            symbolSize: 7,
            lineStyle: { color: "#f0cd83", width: 3 },
            itemStyle: { color: "#f0cd83" },
            areaStyle: { color: "#cfb976", opacity: 0.14 },
          },
        ],
      };
      chart.setOption(heatInitialized ? { series: option.series } : option);
      heatInitialized = true;
      caption.textContent = manual
        ? `原創示意資料 · ${days[selected]}剖面 · 點選熱區連動下方折線`
        : "原創示意資料 · 週一至週日依序往返 · 連續補間呈現相鄰日期剖面";
    } else {
      const n = 34;
      const data = Array.from({ length: n }, (_, i) =>
        Math.round(62 + wave(i, seconds * 0.3) * 22),
      );
      chart.setOption({
        animation: false,
        backgroundColor: "transparent",
        tooltip: { trigger: "axis", confine: true },
        grid: { left: 54, right: 36, top: 28, bottom: 38 },
        xAxis: {
          type: "category",
          data: Array.from({ length: n }, (_, i) => String(i)),
          boundaryGap: false,
          axisLine: { lineStyle: { color: "#c5d2cd" } },
          axisLabel: { color: "#627a7e", interval: 5 },
          name: "TIME",
        },
        yAxis: {
          type: "value",
          min: 20,
          max: 100,
          splitLine: { lineStyle: { color: "#e0e5dc" } },
          axisLabel: { color: "#627a7e" },
        },
        series: [
          {
            id: "band-low",
            type: "line",
            stack: "band",
            data: data.map((x) => x - 12),
            symbol: "none",
            lineStyle: { opacity: 0 },
            areaStyle: { opacity: 0 },
          },
          {
            id: "band-range",
            type: "line",
            stack: "band",
            data: data.map(() => 24),
            symbol: "none",
            lineStyle: { opacity: 0 },
            areaStyle: { color: "#b1cfc2", opacity: 0.5 },
          },
          {
            id: "signal",
            name: "訊號",
            type: "line",
            smooth: true,
            data,
            symbol: "none",
            lineStyle: { color: "#286a64", width: 4 },
          },
          {
            id: "threshold",
            type: "line",
            data: data.map(() => 76),
            symbol: "none",
            lineStyle: { color: "#b26147", type: "dashed", width: 2 },
          },
        ],
      });
      caption.textContent =
        "原創示意資料 · 固定資料窗 · 主時鐘驅動 setOption；引擎補間停用";
    }
  };
  chart.on("click", (event: any) => {
    if (heat && event.seriesId === "matrix") {
      manual = true;
      selected = (Array.isArray(event.data) ? event.data : event.data.value)[1];
      last = -1;
      draw(0);
    }
  });
  button(controls, heat ? "下一日" : "重設觀測窗", signal, () => {
    if (heat) manual = true;
    selected = (selected + 1) % 7;
    last = -1;
    draw(0);
  });
  if (heat)
    button(controls, "自動展示", signal, () => {
      manual = false;
      draw(0);
    });
  draw(0);
  return {
    seek: draw,
    dispose: () => {
      chart.dispose();
      root.replaceChildren();
    },
  };
};
export default mount;
