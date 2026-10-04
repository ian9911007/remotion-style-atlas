/** Created: 2026-10-04. Original staged dependency fixture; host-owned progress. */
import * as d3 from "d3";
import type { Mount } from "./types";
import { shell, button } from "./data-shared";

const stages = ["定義問題", "建立原型", "驗證試行", "交付上線"];
const windows = ["W01–02", "W03–05", "W06–08", "W09–10"];
const outputs = [
  "收斂需求邊界，建立可追蹤的基準。",
  "以原型與介面契約對齊實作。",
  "確認使用情境與跨模組整合結果。",
  "交付可追溯版本，持續接收觀測回饋。",
];
const nodes = [
  {
    id: "brief",
    stage: 0,
    lane: 0,
    label: "需求與限制",
    detail: "01 / DEFINE",
  },
  {
    id: "baseline",
    stage: 0,
    lane: 1,
    label: "基準與資料",
    detail: "02 / BASELINE",
  },
  {
    id: "prototype",
    stage: 1,
    lane: 0,
    label: "互動原型",
    detail: "03 / PROTOTYPE",
  },
  {
    id: "contract",
    stage: 1,
    lane: 1,
    label: "介面契約",
    detail: "04 / CONTRACT",
  },
  {
    id: "usability",
    stage: 2,
    lane: 0,
    label: "使用情境驗證",
    detail: "05 / VALIDATE",
  },
  {
    id: "integration",
    stage: 2,
    lane: 1,
    label: "整合與回歸",
    detail: "06 / INTEGRATE",
  },
  {
    id: "release",
    stage: 3,
    lane: 0,
    label: "版本交付",
    detail: "07 / RELEASE",
  },
  {
    id: "monitor",
    stage: 3,
    lane: 1,
    label: "觀測與回饋",
    detail: "08 / OBSERVE",
  },
];
const dependencies = [
  ["brief", "prototype"],
  ["baseline", "contract"],
  ["baseline", "prototype"],
  ["prototype", "usability"],
  ["contract", "integration"],
  ["contract", "usability"],
  ["usability", "release"],
  ["integration", "release"],
  ["integration", "monitor"],
] as const;

const mount: Mount = async (root, { signal }) => {
  const { stage, controls, caption } = shell(
    root,
    { bg: "#f4f3ed", fg: "#223b48", accent: "#a25838" },
    "D3 / DEPENDENCY ROADMAP",
    "從里程碑，看見依存關係",
    "原創流程示意 · 不代表正式排程或專案承諾",
  );
  let manual: number | null = null;
  let lastTime = 0;
  const svg = d3
    .select(stage)
    .append("svg")
    .attr("viewBox", "0 0 880 374")
    .attr("width", 880)
    .attr("height", 374)
    .attr("role", "img")
    .attr("aria-label", "四階段、雙軌的專案依存圖；使用上方按鈕逐階段閱讀");
  svg
    .append("defs")
    .html(
      `<filter id="roadmap-shadow" x="-20%" y="-30%" width="140%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#24403c" flood-opacity=".09"/></filter><marker id="roadmap-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#9fb4ad"/></marker>`,
    );
  const x = d3.scalePoint<number>().domain([0, 1, 2, 3]).range([104, 776]);
  const position = new Map(
    nodes.map((node) => [
      node.id,
      { x: x(node.stage)!, y: node.lane === 0 ? 133 : 239, ...node },
    ]),
  );
  svg
    .selectAll("rect.band")
    .data(stages)
    .join("rect")
    .attr("class", "band")
    .attr("x", (_, i) => x(i)! - 94)
    .attr("y", 0)
    .attr("width", 188)
    .attr("height", 299)
    .attr("rx", 10)
    .attr("fill", (_, i) => (i % 2 ? "#e8eeeb" : "#ecece4"));
  svg
    .selectAll("text.stage-number")
    .data(stages)
    .join("text")
    .attr("class", "stage-number")
    .attr("x", (_, i) => x(i)! - 72)
    .attr("y", 30)
    .attr("font-size", 11)
    .attr("letter-spacing", ".12em")
    .attr("fill", "#758788")
    .text((_, i) => `PHASE 0${i + 1}`);
  const headings = svg
    .selectAll("text.stage-title")
    .data(stages)
    .join("text")
    .attr("class", "stage-title")
    .attr("x", (_, i) => x(i)! - 72)
    .attr("y", 58)
    .attr("font-size", 19)
    .attr("font-weight", 600)
    .text((d) => d);
  svg
    .selectAll("text.stage-window")
    .data(windows)
    .join("text")
    .attr("class", "stage-window")
    .attr("x", (_, i) => x(i)! + 72)
    .attr("y", 30)
    .attr("text-anchor", "end")
    .attr("font-size", 10)
    .attr("fill", "#7c9189")
    .text((d) => d);
  const link = d3
    .linkHorizontal<any, any>()
    .x((d) => d[0])
    .y((d) => d[1]);
  const edges = dependencies.map(([from, to]) => {
    const a = position.get(from)!,
      b = position.get(to)!;
    return {
      from,
      to,
      target: b.stage,
      path: link({ source: [a.x + 72, a.y], target: [b.x - 72, b.y] })!,
    };
  });
  svg
    .selectAll("path.edge-base")
    .data(edges)
    .join("path")
    .attr("class", "edge-base")
    .attr("d", (d) => d.path)
    .attr("fill", "none")
    .attr("stroke", "#b8c7c7")
    .attr("stroke-width", 2)
    .attr("marker-end", "url(#roadmap-arrow)");
  const paths = svg
    .selectAll<SVGPathElement, (typeof edges)[number]>("path.edge-progress")
    .data(edges)
    .join("path")
    .attr("class", "edge-progress")
    .attr("d", (d) => d.path)
    .attr("fill", "none")
    .attr("stroke", "#3c7478")
    .attr("stroke-width", 3)
    .attr("stroke-linecap", "round");
  const lengths = paths.nodes().map((path) => path.getTotalLength());
  const groups = svg
    .selectAll<SVGGElement, (typeof nodes)[number]>("g.milestone")
    .data(nodes, (d) => d.id)
    .join("g")
    .attr("class", "milestone")
    .attr(
      "transform",
      (d) =>
        `translate(${x(d.stage)! - 72},${(d.lane === 0 ? 133 : 239) - 36})`,
    );
  groups
    .append("rect")
    .attr("width", 144)
    .attr("height", 72)
    .attr("rx", 7)
    .attr("stroke-width", 1.5)
    .attr("filter", "url(#roadmap-shadow)");
  groups
    .append("text")
    .attr("class", "detail")
    .attr("x", 12)
    .attr("y", 22)
    .attr("font-size", 10)
    .attr("letter-spacing", ".05em")
    .text((d) => d.detail);
  groups
    .append("text")
    .attr("class", "label")
    .attr("x", 12)
    .attr("y", 48)
    .attr("font-size", 16)
    .attr("font-weight", 600)
    .text((d) => d.label);
  groups.append("circle").attr("cx", 133).attr("cy", 12).attr("r", 3);
  const cursor = svg
    .append("rect")
    .attr("y", 76)
    .attr("width", 144)
    .attr("height", 3)
    .attr("rx", 1.5)
    .attr("fill", "#a25838");
  svg
    .append("rect")
    .attr("x", 10)
    .attr("y", 310)
    .attr("width", 860)
    .attr("height", 64)
    .attr("rx", 8)
    .attr("fill", "#fffdf6")
    .attr("stroke", "#d1dcd4");
  svg
    .append("rect")
    .attr("x", 10)
    .attr("y", 319)
    .attr("width", 4)
    .attr("height", 45)
    .attr("rx", 2)
    .attr("fill", "#a25838");
  const activeTitle = svg
    .append("text")
    .attr("x", 28)
    .attr("y", 334)
    .attr("font-size", 16)
    .attr("font-weight", 600)
    .attr("fill", "#29443f");
  const activeDetail = svg
    .append("text")
    .attr("x", 28)
    .attr("y", 356)
    .attr("font-size", 12)
    .attr("fill", "#6a7e74");
  svg
    .append("rect")
    .attr("x", 626)
    .attr("y", 335)
    .attr("width", 220)
    .attr("height", 5)
    .attr("rx", 2.5)
    .attr("fill", "#dce6df");
  const progressBar = svg
    .append("rect")
    .attr("x", 626)
    .attr("y", 335)
    .attr("height", 5)
    .attr("rx", 2.5)
    .attr("fill", "#3c7478");
  const progressLabel = svg
    .append("text")
    .attr("x", 846)
    .attr("y", 361)
    .attr("text-anchor", "end")
    .attr("font-size", 11)
    .attr("fill", "#68837a");
  function paint(seconds: number) {
    lastTime = seconds;
    const progress = manual ?? Math.min(3.99, Math.max(0, seconds));
    const selected = Math.min(3, Math.floor(progress));
    headings.attr("fill", (_, i) => (i === selected ? "#a25838" : "#223b48"));
    cursor.attr("x", x(selected)! - 72);
    paths
      .attr("stroke-dasharray", (_, i) => lengths[i])
      .attr(
        "stroke-dashoffset",
        (d, i) =>
          lengths[i] * (1 - Math.max(0, Math.min(1, progress - d.target + 1))),
      );
    groups
      .select("rect")
      .attr("fill", (d) =>
        d.stage < selected
          ? "#d5e4df"
          : d.stage === selected
            ? "#fffdf7"
            : "#f0f2ec",
      )
      .attr("stroke", (d) => (d.stage === selected ? "#a25838" : "#c0cfca"));
    groups
      .select("text.detail")
      .attr("fill", (d) => (d.stage <= selected ? "#638181" : "#8e9c97"));
    groups
      .select("text.label")
      .attr("fill", (d) => (d.stage <= selected ? "#223b48" : "#82918b"));
    groups
      .select("circle")
      .attr("fill", (d) =>
        d.stage < selected
          ? "#438077"
          : d.stage === selected
            ? "#aa6347"
            : "#c1cbc4",
      );
    activeTitle.text(
      `0${selected + 1}  ${stages[selected]}  /  ${windows[selected]}`,
    );
    activeDetail.text(outputs[selected]);
    progressBar.attr("width", (220 * (selected + 1)) / 4);
    progressLabel.text(`${selected + 1} / 4 PHASES · ${(selected + 1) * 25}%`);
    caption.textContent = `原創流程與週序示意 · 第 ${selected + 1} 階段：${stages[selected]} · 連線表示前置依存，不代表時間長度`;
  }
  button(controls, "上一階段", signal, () => {
    manual = Math.max(0, (manual ?? Math.floor(lastTime)) - 1);
    paint(lastTime);
  });
  button(controls, "下一階段", signal, () => {
    manual = Math.min(3, (manual ?? Math.floor(lastTime)) + 1);
    paint(lastTime);
  });
  button(controls, "自動展示", signal, () => {
    manual = null;
    paint(lastTime);
  });
  paint(0);
  return { seek: paint, dispose: () => root.replaceChildren() };
};
export default mount;
