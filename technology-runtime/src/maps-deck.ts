/** Created: 2026-10-04. deck.gl attribute layers and time-indexed trails from original fixtures. */
import { Deck, MapView } from "@deck.gl/core";
import { ScatterplotLayer, PathLayer } from "@deck.gl/layers";
import { TripsLayer } from "@deck.gl/geo-layers";
import type { Mount } from "./types";
import { shell, button, localRoute } from "./data-shared";
const mount: Mount = async (root, { variant, signal }) => {
  const trips = variant === "trips";
  let threshold = 0,
    disposed = false;
  let lastTime = 0;
  const { stage, controls, caption } = shell(
    root,
    trips
      ? { bg: "#122d35", fg: "#e2efe9", accent: "#b5c66f" }
      : { bg: "#f1eee8", fg: "#2d454a", accent: "#a75c48" },
    trips ? "DECK.GL / TEMPORAL TRAILS" : "DECK.GL / GPU ATTRIBUTE LAYER",
    trips ? "讓軌跡留下時間" : "四千個觀測位置，一張圖層",
    "原創合成位置 · 無底圖服務 · 不是實際交通或人口資料",
  );
  stage.style.background = trips ? "#0d222a" : "#e1e4dc";
  stage.style.borderRadius = "6px";
  stage.style.overflow = "hidden";
  const points = Array.from({ length: 4096 }, (_, i) => {
    const x = i % 64,
      y = Math.floor(i / 64);
    return {
      position: [121.466 + x * 0.00165, 25.002 + y * 0.0014],
      value: (Math.sin(x * 0.16) * Math.cos(y * 0.15) + 1) * 0.5,
      color: [x * 2 + 65, 125 + y, 155 - x],
    };
  });
  const routes = Array.from({ length: 36 }, (_, i) => ({
    path: Array.from({ length: 40 }, (_, j) => [
      121.468 + j * 0.0024,
      25.012 + i * 0.002 + Math.sin(j * 0.21 + i) * 0.003,
      0,
    ]),
    timestamps: Array.from({ length: 40 }, (_, j) => j * 12 + i * 3),
    color: i % 2 ? [222, 184, 103] : [92, 185, 176],
  }));
  const line = { path: localRoute };
  const layers = (seconds: number) =>
    trips
      ? [
          new PathLayer({
            id: "route-network",
            data: routes,
            getPath: (d: any) => d.path,
            getColor: [61, 91, 98],
            getWidth: 12,
            widthMinPixels: 1,
            opacity: 0.55,
          }),
          new TripsLayer({
            id: "time-trails",
            data: routes,
            getPath: (d: any) => d.path,
            getTimestamps: (d: any) => d.timestamps,
            getColor: (d: any) => d.color,
            currentTime: (seconds * 62) % 580,
            trailLength: 100,
            widthMinPixels: 3,
            getWidth: 35,
            capRounded: true,
            jointRounded: true,
            fadeTrail: true,
          }),
        ]
      : [
          new ScatterplotLayer({
            id: "observations",
            data: points,
            stroked: false,
            filled: true,
            getPosition: (d: any) => d.position,
            getRadius: (d: any) =>
              d.value >= threshold ? 38 + d.value * 45 : 0,
            radiusMinPixels: 1,
            radiusMaxPixels: 7,
            getFillColor: (d: any) =>
              [d.color[0], d.color[1], d.color[2], 210] as [
                number,
                number,
                number,
                number,
              ],
            pickable: true,
            updateTriggers: { getRadius: threshold },
            onHover: (info: any) => {
              if (info.object)
                caption.textContent = `原創合成位置 · 觀測權重 ${info.object.value.toFixed(2)} · 4,096 筆，非效能上限測試`;
            },
          }),
          new PathLayer({
            id: "reference-route",
            data: [line],
            getPath: (d: any) => d.path,
            getColor: [166, 78, 52],
            getWidth: 25,
            widthMinPixels: 2,
          }),
        ];
  let readyResolve!: () => void, readyReject!: (error: Error) => void;
  const ready = new Promise<void>((resolve, reject) => {
    readyResolve = resolve;
    readyReject = reject;
  });
  const deck = new Deck({
    parent: stage,
    width: 880,
    height: 374,
    views: new MapView({ repeat: false }),
    initialViewState: {
      longitude: 121.518,
      latitude: 25.05,
      zoom: 11.7,
      pitch: trips ? 46 : 0,
      bearing: trips ? -12 : 0,
    },
    controller: { scrollZoom: false, keyboard: true },
    useDevicePixels: Math.min(devicePixelRatio, 1.5),
    layers: layers(0),
    onLoad: readyResolve,
    onError: readyReject,
  });
  const abort = () => readyReject(new DOMException("Aborted", "AbortError"));
  signal.addEventListener("abort", abort, { once: true });
  try {
    await ready;
    deck.redraw("atlas-readiness");
  } catch (error) {
    deck.finalize();
    throw error;
  } finally {
    signal.removeEventListener("abort", abort);
  }
  button(controls, trips ? "重播軌跡" : "切換高值篩選", signal, () => {
    threshold = threshold === 0 ? 0.65 : 0;
    lastTime = 0;
    deck.setProps({ layers: layers(0) });
    caption.textContent = trips
      ? "原創合成軌跡 · 36 條路徑 · 主時鐘控制 currentTime"
      : `原創合成位置 · ${threshold ? "顯示權重 ≥ 0.65" : "顯示全部 4,096 筆"} · 非效能上限測試`;
  });
  return {
    seek: (seconds) => {
      if (disposed || (!trips && seconds === lastTime)) return;
      lastTime = seconds;
      if (trips) deck.setProps({ layers: layers(seconds) });
    },
    dispose: () => {
      disposed = true;
      deck.finalize();
      root.replaceChildren();
    },
  };
};
export default mount;
