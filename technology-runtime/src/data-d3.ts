/** Created: 2026-10-04. D3 hierarchy/partition and keyed joins, controlled by host time. */
import * as d3 from "d3";
import type { Mount } from "./types";
import { shell, button } from "./data-shared";

// Four-second closed loop. Smooth local envelopes return to the full hierarchy
// between category changes; every ranking row returns to its original key/pose.
export function d3LoopState(seconds: number) {
  const phase = (Math.max(0, seconds) % 4) / 4;
  const slot = phase * 3;
  const local = slot - Math.floor(slot);
  const hierarchyMix = Math.sin(Math.PI * local) ** 2;
  const roundMix = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  return { category: Math.min(2, Math.floor(slot)), hierarchyMix, roundMix };
}
const smooth = (value: number) => {
  const x = Math.max(0, Math.min(1, value));
  return x * x * (3 - 2 * x);
};
const mount: Mount = async (root, { variant, signal, reducedMotion }) => {
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
  let manual = false;
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
  const tree = d3.hierarchy(data).sum((d: any) => d.value ?? 0);
  const fullNodes = d3
    .partition<any>()
    .size([820, 288])
    .padding(5)(tree)
    .descendants();
  const focusLayouts = data.children.map(
    (group) =>
      new Map(
        d3
          .partition<any>()
          .size([820, 288])
          .padding(5)(d3.hierarchy(group).sum((d: any) => d.value ?? 0))
          .descendants()
          .map((node) => [node.data.name, node]),
      ),
  );
  const palette = [
    "#d36b42",
    "#2c688b",
    "#4b8370",
    "#b89841",
    "#897da0",
    "#426586",
  ];
  const rounds = [0, 3].map((phase) =>
    Array.from({ length: 6 }, (_, i) => ({
      id: `TEAM ${String.fromCharCode(65 + i)}`,
      value: Math.round(40 + Math.sin(i * 1.7 + phase * 0.8) * 23 + i * 5),
      color: palette[i],
    })),
  );
  const rowY = d3
    .scaleBand()
    .domain(rounds[0].map((row) => row.id))
    .range([10, 350])
    .padding(0.2);
  const x = d3.scaleLinear().domain([0, 100]).range([0, 640]);
  const paint = (seconds: number) => {
    const loop = d3LoopState(reducedMotion ? 0 : seconds);
    if (partition) {
      if (!manual) mode = loop.hierarchyMix > 0.5 ? loop.category + 1 : 0;
      const category = manual ? Math.max(0, mode - 1) : loop.category;
      const mix = manual ? Number(mode > 0) : loop.hierarchyMix;
      const focus = focusLayouts[category];
      const nodes = fullNodes.map((node) => {
        const target = focus.get(node.data.name);
        return {
          ...node,
          target,
          left: d3.interpolateNumber(node.x0, target?.x0 ?? node.x0)(mix),
          top: d3.interpolateNumber(node.y0, target?.y0 ?? node.y0)(mix),
          width: d3.interpolateNumber(
            node.x1 - node.x0,
            target ? target.x1 - target.x0 : node.x1 - node.x0,
          )(mix),
          height: d3.interpolateNumber(
            node.y1 - node.y0,
            target ? target.y1 - target.y0 : node.y1 - node.y0,
          )(mix),
          opacity: target ? 1 : 1 - mix,
        };
      });
      const groups = svg
        .selectAll<SVGGElement, (typeof nodes)[number]>("g.node")
        .data(nodes, (node) => node.data.name)
        .join("g")
        .attr("class", "node")
        .attr("opacity", (node) => node.opacity);
      groups
        .selectAll("rect")
        .data((node) => [node])
        .join("rect")
        .attr("x", (node) => 30 + node.left)
        .attr("y", (node) => 20 + node.top)
        .attr("width", (node) => Math.max(0, node.width))
        .attr("height", (node) => Math.max(0, node.height))
        .attr("rx", 3)
        .attr("fill", (node) => ["#315c4b", "#8eae91", "#d3dbbd"][node.depth]);
      groups
        .selectAll("text")
        .data((node) => [node])
        .join("text")
        .attr("x", (node) => 42 + node.left)
        .attr("y", (node) => 45 + node.top)
        .attr("fill", (node) => (node.depth === 0 ? "#fff" : "#203a2f"))
        .attr("font-size", (node) =>
          node.depth === 0 ? 21 : node.depth === 1 ? 16 : 14,
        )
        .text((node) =>
          node.width < 60 ? node.data.name : `${node.data.name} ${node.value}`,
        );
      caption.textContent = manual
        ? `原創示意資料 · ${mode ? data.children[mode - 1].name : data.name} · 按鈕切換階層`
        : "原創示意資料 · 金屬 → 植物 → 礦物依序聚焦，回到共同全圖 · 面積依權重編碼";
      return;
    }
    if (!manual) mode = Number(loop.roundMix > 0.5);
    const rows = rounds[0].map((row) => {
      const index = row.id.charCodeAt(5) - 65;
      const mix = manual
        ? mode % 2
        : smooth((loop.roundMix - index * 0.055) / 0.725);
      const target = rounds[1].find((other) => other.id === row.id)!;
      return {
        ...row,
        value: d3.interpolateNumber(row.value, target.value)(mix),
      };
    });
    const ranks = new Map(
      [...rows]
        .sort((a, b) => b.value - a.value)
        .map((row, index) => [row.id, index + 1]),
    );
    const barHeight = rowY.bandwidth();
    const groups = svg
      .selectAll<SVGGElement, (typeof rows)[number]>("g.row")
      .data(rows, (row) => row.id)
      .join((enter) => {
        const group = enter.append("g").attr("class", "row");
        group.append("rect").attr("rx", 3);
        group.append("text").attr("class", "label");
        group.append("text").attr("class", "value");
        return group;
      })
      // Each keyed team owns one fixed lane. Rank and value change in place;
      // translating rows made the chart look like bars were sliding around.
      .attr("transform", (row) => `translate(130,${rowY(row.id)})`);
    groups
      .select("rect")
      .attr("width", (row) => x(row.value))
      .attr("height", barHeight)
      .attr("fill", (row) => row.color);
    groups
      .select("text.label")
      .attr("x", -18)
      .attr("y", barHeight / 2 + 5)
      .attr("text-anchor", "end")
      .attr("font-size", 15)
      .attr("font-weight", 700)
      .attr("fill", "#24405b")
      .text((row) => `#${ranks.get(row.id)}  ${row.id}`);
    groups
      .select("text.value")
      .attr("x", (row) => x(row.value) + 12)
      .attr("y", barHeight / 2 + 5)
      .attr("font-size", 18)
      .attr("fill", "#24405b")
      .text((row) => Math.round(row.value));
    caption.textContent =
      "原創示意資料 · 固定列不位移 · 名次與長條長度逐步更新 · 顏色與身分由穩定 key 綁定";
  };
  button(controls, partition ? "切換分類" : "下一回合", signal, () => {
    manual = true;
    mode = (mode + 1) % (partition ? 4 : 2);
    paint(0);
  });
  button(controls, "自動展示", signal, () => {
    manual = false;
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
