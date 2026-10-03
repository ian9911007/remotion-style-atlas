import React, { type CSSProperties, type ReactNode } from "react";
import { Img, staticFile } from "remotion";
import type { StyleSpec } from "../catalog/schema";

export type RecipeProps = {
  style: StyleSpec;
  frame: number;
  progress: number;
  duration: number;
};
export const sans = 'Arial, "PingFang TC", sans-serif';
export const serif = 'Georgia, "Songti TC", "PingFang TC", serif';
export const mono = '"Courier New", "PingFang TC", monospace';
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};
/** A closed envelope: establish, demonstrate, hold, resolve to the opening image. */
export const beat = (
  p: number,
  start = 0.07,
  enter = 0.25,
  leave = 0.7,
  end = 0.95,
) =>
  smooth((p - start) / (enter - start)) *
  (1 - smooth((p - leave) / (end - leave)));
export const wave = (p: number, cycles = 1) =>
  Math.sin(p * Math.PI * 2 * cycles);
export const turn = (p: number) => (1 - Math.cos(p * Math.PI * 2)) / 2;
export const rebound = (
  p: number,
  start = 0.04,
  end = 0.24,
  leave = 0.7,
  reset = 0.98,
) => {
  const t = clamp((p - start) / (end - start));
  const entrance =
    t === 0 ? 0 : t === 1 ? 1 : 1 - Math.exp(-6 * t) * Math.cos(9 * t);
  return entrance * (1 - smooth((p - leave) / (reset - leave)));
};

export const Canvas = ({
  background,
  children,
}: {
  background: string;
  children: ReactNode;
}) => (
  <div
    style={{
      width: 1280,
      height: 720,
      position: "relative",
      overflow: "hidden",
      backgroundColor: background,
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1280"
      height="720"
      viewBox="0 0 1280 720"
      style={{ position: "absolute", inset: 0 }}
    >
      {children}
    </svg>
  </div>
);
export const Text = ({
  x,
  y,
  children,
  size = 24,
  color = "#fff",
  weight = 400,
  font = sans,
  spacing = 0,
  anchor = "start",
  opacity = 1,
  style,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  font?: string;
  spacing?: number;
  anchor?: "start" | "middle" | "end";
  opacity?: number;
  style?: CSSProperties;
}) => (
  <text
    x={x}
    y={y}
    fill={color}
    fontFamily={font}
    fontSize={size}
    fontWeight={weight}
    letterSpacing={spacing}
    textAnchor={anchor}
    opacity={opacity}
    style={style}
  >
    {children}
  </text>
);
export const Line = ({
  x1,
  y1,
  x2,
  y2,
  color,
  width = 1,
  opacity = 1,
  dash,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
  opacity?: number;
  dash?: string;
}) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke={color}
    strokeWidth={width}
    opacity={opacity}
    strokeDasharray={dash}
  />
);
export const Media = ({
  asset,
  x,
  y,
  width,
  height,
  scale = 1,
  panX = 0,
  panY = 0,
  filter,
  opacity = 1,
  position = "center",
}: {
  asset: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale?: number;
  panX?: number;
  panY?: number;
  filter?: string;
  opacity?: number;
  position?: string;
}) => (
  <foreignObject x={x} y={y} width={width} height={height} opacity={opacity}>
    <div style={{ width, height, overflow: "hidden", position: "relative" }}>
      <Img
        src={staticFile(`assets/${asset}.jpg`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: position,
          scale,
          translate: `${panX}px ${panY}px`,
          filter,
        }}
      />
    </div>
  </foreignObject>
);
export const Cross = ({
  x,
  y,
  color,
  size = 8,
}: {
  x: number;
  y: number;
  color: string;
  size?: number;
}) => (
  <g>
    <Line x1={x - size} x2={x + size} y1={y} y2={y} color={color} />
    <Line x1={x} x2={x} y1={y - size} y2={y + size} color={color} />
  </g>
);
export const Ring = ({
  x,
  y,
  r,
  color,
  width = 1,
  opacity = 1,
}: {
  x: number;
  y: number;
  r: number;
  color: string;
  width?: number;
  opacity?: number;
}) => (
  <circle
    cx={x}
    cy={y}
    r={r}
    fill="none"
    stroke={color}
    strokeWidth={width}
    opacity={opacity}
  />
);
export const CornerMarks = ({
  color,
  inset = 42,
}: {
  color: string;
  inset?: number;
}) => (
  <g opacity={0.65}>
    {[
      [inset, inset, 1, 1],
      [1280 - inset, inset, -1, 1],
      [inset, 720 - inset, 1, -1],
      [1280 - inset, 720 - inset, -1, -1],
    ].map(([x, y, dx, dy], i) => (
      <path
        key={i}
        d={`M${x + dx * 18},${y}H${x}V${y + dy * 18}`}
        fill="none"
        stroke={color}
      />
    ))}
  </g>
);
