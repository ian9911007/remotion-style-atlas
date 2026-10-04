/** Created: 2026-10-04. Original synthetic fixtures; no external data or claims. */
export const W = 960;
export const H = 540;
export function shell(
  root: HTMLElement,
  theme: { bg: string; fg: string; accent: string },
  label: string,
  title: string,
  note: string,
) {
  const hostScale = root.style.transform;
  root.style.cssText = `position:relative;width:960px;height:540px;overflow:hidden;background:${theme.bg};color:${theme.fg};font-family:Arial,"Noto Sans TC",sans-serif;isolation:isolate;`;
  root.style.transform = hostScale;
  const style = document.createElement("style");
  style.textContent = `.data-stage{position:absolute;inset:112px 40px 54px}.data-caption{position:absolute;left:44px;bottom:20px;font-size:12px;letter-spacing:.08em;opacity:.72}.data-controls{position:absolute;right:40px;top:28px;display:flex;gap:8px;z-index:5}.data-controls button,.data-controls input,.data-controls select{font:inherit;color:inherit;accent-color:${theme.accent}}.data-controls button{border:1px solid currentColor;border-radius:4px;background:${theme.bg};padding:8px 12px;font-size:12px;cursor:pointer}.data-controls button:focus-visible{outline:3px solid ${theme.accent};outline-offset:3px}.data-readout{font-variant-numeric:tabular-nums}.data-stage svg{overflow:visible}.data-stage canvas{display:block}`;
  root.append(style);
  const header = document.createElement("header");
  header.style.cssText =
    "position:absolute;left:44px;top:26px;pointer-events:none";
  const tag = document.createElement("div");
  tag.textContent = label;
  tag.style.cssText = `font-size:11px;letter-spacing:.2em;color:${theme.accent};font-weight:700`;
  const h = document.createElement("h2");
  h.textContent = title;
  h.style.cssText =
    "margin:9px 0 0;font-size:29px;letter-spacing:-.03em;font-weight:600";
  header.append(tag, h);
  const stage = document.createElement("div");
  stage.className = "data-stage";
  stage.style.cssText =
    "position:absolute;left:40px;top:112px;width:880px;height:374px";
  const caption = document.createElement("div");
  caption.className = "data-caption";
  caption.textContent = note;
  const controls = document.createElement("div");
  controls.className = "data-controls";
  root.append(header, stage, caption, controls);
  return { stage, controls, caption };
}
export function button(
  parent: HTMLElement,
  label: string,
  signal: AbortSignal,
  action: () => void,
) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.addEventListener("click", action, { signal });
  parent.append(b);
  return b;
}
export function range(
  parent: HTMLElement,
  label: string,
  min: number,
  max: number,
  value: number,
  signal: AbortSignal,
  action: (value: number) => void,
) {
  const wrap = document.createElement("label");
  wrap.style.cssText = "display:flex;gap:8px;align-items:center;font-size:12px";
  wrap.textContent = label;
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.value = String(value);
  input.setAttribute("aria-label", label);
  input.addEventListener("input", () => action(Number(input.value)), {
    signal,
  });
  wrap.append(input);
  parent.append(wrap);
  return input;
}
export function svgElement(
  tag: string,
  attributes: Record<string, string | number> = {},
) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attributes))
    el.setAttribute(k, String(v));
  return el;
}
export function wave(x: number, phase = 0) {
  return (
    Math.sin(x * 0.54 + phase) * 0.5 + Math.sin(x * 0.19 + phase * 0.5) * 0.3
  );
}
export const localSites = [
  { name: "河岸入口", position: [121.492, 25.043] as [number, number] },
  { name: "北側廣場", position: [121.506, 25.061] as [number, number] },
  { name: "工藝展館", position: [121.524, 25.052] as [number, number] },
  { name: "森林步道", position: [121.536, 25.034] as [number, number] },
];
export const localRoute = [
  [121.488, 25.039],
  [121.492, 25.043],
  [121.497, 25.051],
  [121.506, 25.061],
  [121.516, 25.059],
  [121.524, 25.052],
  [121.531, 25.045],
  [121.536, 25.034],
];
export const localRegions = {
  type: "FeatureCollection" as const,
  features: Array.from({ length: 12 }, (_, i) => {
    const x = 121.48 + (i % 4) * 0.018,
      y = 25.015 + Math.floor(i / 4) * 0.019;
    return {
      type: "Feature" as const,
      id: i,
      properties: {
        id: i,
        name: `示意分區 ${i + 1}`,
        value: 22 + ((i * 23) % 73),
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [x, y],
            [x + 0.014, y + 0.001],
            [x + 0.016, y + 0.015],
            [x + 0.002, y + 0.016],
            [x, y],
          ],
        ],
      },
    };
  }),
};
export const routeFeature = {
  type: "Feature" as const,
  properties: { name: "Original synthetic walking route" },
  geometry: { type: "LineString" as const, coordinates: localRoute },
};
