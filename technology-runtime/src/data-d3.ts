/** Created: 2026-10-04. D3 hierarchy/partition and keyed joins, controlled by host time. */
import * as d3 from "d3";
import type { Mount } from "./types";
import { shell, button } from "./data-shared";

const mount: Mount = async (root, { variant, signal }) => {
  const partition = variant === "partition";
  const { stage, controls, caption } = shell(
    root,
    partition
      ? { bg: "#f5f1e8", fg: "#26362f", accent: "#a94d30" }
      : { bg: "#f1f4f8", fg: "#172f49", accent: "#b44230" },
    partition ? "D3 / HIERARCHICAL PARTITION" : "D3 / KEYED DATA JOIN",
    partition ? "材料，從整體看見層次" : "移動名次，保留物件身分",
    "原創示意資料 · 非實際統計",
  );
  const svg = d3
    .select(stage)
    .append("svg")
    .attr("viewBox", "0 0 880 374")
    .attr("width", 880)
    .attr("height", 374)
    .attr("role", "img")
    .attr(
      "aria-label",
      partition
        ? "材料分類的分割圖；可切換分類焦點"
        : "六個隊伍的排名更新；色彩與標籤隨資料鍵保留",
    );
  let mode = 0;
  let last = -1;
  const paint = (seconds: number) => {
    if (partition) {
      const data = {
        name: "全部材料",
        children: [
          {
            name: "金屬",
            children: [
              { name: "鋁", value: 36 },
              { name: "鋼", value: 20 },
              { name: "銅", value: 12 },
            ],
          },
          {
            name: "植物",
            children: [
              { name: "竹", value: 29 },
              { name: "木", value: 34 },
              { name: "紙", value: 13 },
            ],
          },
          {
            name: "礦物",
            children: [
              { name: "陶", value: 27 },
              { name: "石", value: 18 },
              { name: "玻璃", value: 23 },
            ],
          },
        ],
      };
      const focus = mode ? data.children[(mode - 1) % 3] : data;
      const tree = d3.hierarchy(focus).sum((d: any) => d.value ?? 0);
      const nodes = d3
        .partition<any>()
        .size([820, 288])
        .padding(5)(tree)
        .descendants();
      const colors = ["#315c4b", "#8eae91", "#d3dbbd", "#af593d"];
      const groups = svg
        .selectAll<SVGGElement, any>("g.node")
        .data(nodes, (d: any) => d.data.name)
        .join("g")
        .attr("class", "node");
      groups
        .selectAll("rect")
        .data((d: any) => [d])
        .join("rect")
        .attr("x", (d: any) => 30 + d.x0)
        .attr("y", (d: any) => 20 + d.y0)
        .attr("width", (d: any) => Math.max(0, d.x1 - d.x0))
        .attr("height", (d: any) => Math.max(0, d.y1 - d.y0))
        .attr("rx", 3)
        .attr(
          "fill",
          (d: any) => colors[d.depth === 0 ? 0 : d.depth === 1 ? 1 : 2],
        )
        .attr("opacity", 0.98);
      groups
        .selectAll("text")
        .data((d: any) => [d])
        .join("text")
        .attr("x", (d: any) => 42 + d.x0)
        .attr("y", (d: any) => 45 + d.y0)
        .attr("fill", (d: any) => (d.depth === 0 ? "#fff" : "#203a2f"))
        .attr("font-size", (d: any) =>
          d.depth === 0 ? 21 : d.depth === 1 ? 16 : 14,
        )
        .text((d: any) =>
          d.x1 - d.x0 < 60 ? d.data.name : `${d.data.name} ${d.value}`,
        );
      caption.textContent = `原創示意資料 · ${focus.name} · 面積以權重編碼，按鈕切換階層`;
      return;
    }
    const phase = Math.floor(seconds / 2.5) + mode;
    if (phase === last) return;
    last = phase;
    const palette = [
      "#d36b42",
      "#2c688b",
      "#4b8370",
      "#b89841",
      "#897da0",
      "#426586",
    ];
    const rows = Array.from({ length: 6 }, (_, i) => ({
      id: `TEAM ${String.fromCharCode(65 + i)}`,
      value: Math.round(40 + Math.sin(i * 1.7 + phase * 0.8) * 23 + i * 5),
      color: palette[i],
    })).sort((a, b) => b.value - a.value);
    const x = d3.scaleLinear().domain([0, 100]).range([0, 640]);
    const y = d3
      .scaleBand()
      .domain(rows.map((x) => x.id))
      .range([10, 350])
      .padding(0.2);
    const groups = svg
      .selectAll<SVGGElement, (typeof rows)[number]>("g.row")
      .data(rows, (d) => d.id)
      .join(
        (enter) => {
          const g = enter.append("g").attr("class", "row");
          g.append("rect").attr("rx", 3);
          g.append("text").attr("class", "label");
          g.append("text").attr("class", "value");
          return g;
        },
        (update) => update,
        (exit) => exit.remove(),
      )
      .attr("transform", (d) => `translate(130,${y(d.id)})`);
    groups
      .select("rect")
      .attr("width", (d) => x(d.value))
      .attr("height", y.bandwidth())
      .attr("fill", (d) => d.color);
    groups
      .select("text.label")
      .attr("x", -18)
      .attr("y", y.bandwidth() / 2 + 5)
      .attr("text-anchor", "end")
      .attr("font-size", 15)
      .attr("font-weight", 700)
      .attr("fill", "#24405b")
      .text((d) => d.id);
    groups
      .select("text.value")
      .attr("x", (d) => x(d.value) + 12)
      .attr("y", y.bandwidth() / 2 + 5)
      .attr("font-size", 18)
      .attr("fill", "#24405b")
      .text((d) => d.value);
    caption.textContent = `原創示意資料 · 第 ${phase + 1} 回合 · 使用穩定 key 更新既有 SVG 物件`;
  };
  button(controls, partition ? "切換分類" : "下一回合", signal, () => {
    mode = partition ? (mode + 1) % 4 : mode + 1;
    last = -1;
    paint(0);
  });
  paint(0);
  return {
    seek: paint,
    dispose: () => {
      svg.selectAll("*").on(".", null);
      root.replaceChildren();
    },
  };
};
export default mount;
