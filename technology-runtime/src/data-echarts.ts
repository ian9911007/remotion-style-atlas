/** Created: 2026-10-04. ECharts option updates and shared category selection. */
import * as echarts from "echarts";
import type { Mount } from "./types";
import { shell, button, wave } from "./data-shared";
const mount: Mount = async (root, { variant, signal }) => {
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
    if (step === last) return;
    last = step;
    if (heat) {
      chart.setOption({
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
            data: values,
            itemStyle: { borderWidth: 3, borderColor: "#14202a" },
            emphasis: { itemStyle: { borderColor: "#fff", borderWidth: 2 } },
          },
          {
            id: "profile",
            type: "line",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: values.filter((v) => v[1] === selected).map((v) => v[2]),
            symbol: "circle",
            symbolSize: 7,
            lineStyle: { color: "#f0cd83", width: 3 },
            itemStyle: { color: "#f0cd83" },
            areaStyle: { color: "#cfb976", opacity: 0.14 },
          },
        ],
      });
      caption.textContent = `原創示意資料 · ${days[selected]}剖面 · 點選任一熱區可連動下方折線`;
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
      selected = event.data[1];
      last = -1;
      draw(0);
    }
  });
  button(controls, heat ? "下一日" : "重設觀測窗", signal, () => {
    selected = (selected + 1) % 7;
    last = -1;
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
