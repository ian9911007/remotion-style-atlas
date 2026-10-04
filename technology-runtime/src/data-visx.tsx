/** Created: 2026-10-04. visx scales and shape primitives mounted through React. */
import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { AreaClosed, LinePath, Pie } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import type { Mount } from "./types";
import { shell, button, wave } from "./data-shared";
const mount: Mount = async (root, { variant, signal }) => {
  const radial = variant === "radial";
  let selected = 0,
    last = -1;
  const { stage, controls, caption } = shell(
    root,
    radial
      ? { bg: "#f4ece1", fg: "#3e332e", accent: "#ad5738" }
      : { bg: "#e9f0f1", fg: "#163a47", accent: "#24758a" },
    radial ? "VISX / REACT ARC LAYOUT" : "VISX / REACT SHAPE PRIMITIVES",
    radial ? "環形結構，分段閱讀" : "訊號剖面與精準游標",
    "原創示意資料 · React 管理互動；visx 提供 SVG 幾何",
  );
  const react = createRoot(stage);
  const x = scaleLinear({ domain: [0, 48], range: [40, 825] });
  const y = scaleLinear({ domain: [0, 100], range: [320, 20] });
  const samples = Array.from({ length: 49 }, (_, i) => ({
    x: i,
    y: 52 + wave(i) * 28,
  }));
  const names = ["設計", "工程", "研究", "內容", "營運"];
  const colors = ["#a84c35", "#cd8c58", "#dcbf86", "#8b9977", "#52665b"];
  const render = (seconds: number) => {
    const frame = Math.floor(seconds * 12);
    if (frame === last) return;
    last = frame;
    const cursor = Math.floor((seconds * 5) % 48);
    const slices = names.map((name, i) => ({
      name,
      value: [28, 24, 17, 19, 12][i],
    }));
    flushSync(() =>
      react.render(
        <svg
          viewBox="0 0 880 374"
          width="880"
          height="374"
          role="img"
          aria-label={
            radial
              ? "五項資源分配的環形圖，可使用按鈕切換焦點"
              : "訊號區域圖；主時鐘移動垂直游標"
          }
        >
          {radial ? (
            <>
              <g transform="translate(294,183)">
                <Pie
                  data={slices}
                  pieValue={(d) => d.value}
                  outerRadius={153}
                  innerRadius={102}
                  padAngle={0.025}
                >
                  {(pie) =>
                    pie.arcs.map((arc, i) => (
                      <path
                        key={arc.data.name}
                        d={pie.path(arc) ?? ""}
                        fill={colors[i]}
                        opacity={i === selected ? 1 : 0.47}
                        stroke={i === selected ? "#3e332e" : "none"}
                        strokeWidth={2}
                      />
                    ))
                  }
                </Pie>
                <text
                  textAnchor="middle"
                  y="2"
                  fontSize="48"
                  fontWeight="600"
                  fill="#45362e"
                >
                  {slices[selected].value}
                  <tspan fontSize="19">%</tspan>
                </text>
                <text textAnchor="middle" y="31" fontSize="15" fill="#76695e">
                  {slices[selected].name}
                </text>
              </g>
              {slices.map((d, i) => (
                <g key={d.name} transform={`translate(555,${65 + i * 51})`}>
                  <rect width="15" height="15" fill={colors[i]} />
                  <text x="28" y="13" fontSize="18" fill="#493b31">
                    {d.name}
                  </text>
                  <text
                    x="196"
                    y="13"
                    textAnchor="end"
                    fontSize="20"
                    fill="#493b31"
                  >
                    {d.value}%
                  </text>
                  <line x1="0" x2="200" y1="31" y2="31" stroke="#dbcebd" />
                </g>
              ))}
            </>
          ) : (
            <>
              {[20, 40, 60, 80].map((n) => (
                <g key={n}>
                  <line x1="40" x2="825" y1={y(n)} y2={y(n)} stroke="#cadbde" />
                  <text
                    x="25"
                    y={y(n) + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="#64808b"
                  >
                    {n}
                  </text>
                </g>
              ))}
              <AreaClosed
                data={samples}
                x={(d) => x(d.x)}
                y={(d) => y(d.y)}
                yScale={y}
                fill="#76aab7"
                opacity={0.3}
              />
              <LinePath
                data={samples}
                x={(d) => x(d.x)}
                y={(d) => y(d.y)}
                stroke="#1b6a7e"
                strokeWidth={4}
              />
              <line
                x1={x(cursor)}
                x2={x(cursor)}
                y1="20"
                y2="320"
                stroke="#be603f"
                strokeWidth="2"
              />
              <circle
                cx={x(cursor)}
                cy={y(samples[cursor].y)}
                r="7"
                fill="#be603f"
                stroke="#e9f0f1"
                strokeWidth="3"
              />
              <text
                x="825"
                y="355"
                textAnchor="end"
                fontSize="13"
                fill="#54747d"
              >
                SAMPLE {cursor.toString().padStart(2, "0")} /{" "}
                {samples[cursor].y.toFixed(1)}
              </text>
            </>
          )}
        </svg>,
      ),
    );
  };
  button(controls, radial ? "下一個分類" : "切換時間取樣", signal, () => {
    selected = (selected + 1) % 5;
    last = -1;
    render(selected * 1.6);
    caption.textContent = radial
      ? `原創示意資料 · ${names[selected]} · SVG 路徑由 visx Pie 計算`
      : "原創示意資料 · 相同尺度對應曲線、游標與文字讀值";
  });
  render(0);
  return {
    seek: render,
    dispose: () => {
      react.unmount();
      root.replaceChildren();
    },
  };
};
export default mount;
