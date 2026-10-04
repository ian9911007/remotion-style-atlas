/** Created: 2026-10-04. Local GeoJSON, no remote tiles, fonts, styles, or credentials. */
import * as maplibregl from "maplibre-gl";
import mapCSS from "maplibre-gl/dist/maplibre-gl.css?inline";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { Mount } from "./types";
import {
  shell,
  button,
  localRegions,
  localRoute,
  routeFeature,
  localSites,
} from "./data-shared";
const mount: Mount = async (root, { variant, signal }) => {
  const districts = variant === "districts";
  let selected = 0,
    manual = false,
    disposed = false;
  const { stage, controls, caption } = shell(
    root,
    districts
      ? { bg: "#f0efe7", fg: "#253c3b", accent: "#996143" }
      : { bg: "#edf1e4", fg: "#314232", accent: "#a65838" },
    districts ? "MAPLIBRE / FEATURE STATE" : "MAPLIBRE / GEOGRAPHIC CAMERA",
    districts ? "空間分區，指向資料" : "沿著河岸，切換地理視角",
    "原創地理示意 · 非實際路線或行政區 · 無外部底圖",
  );
  stage.style.cssText +=
    ";overflow:hidden;border-radius:6px;border:1px solid #ccd4c9";
  const style = document.createElement("style");
  style.textContent = mapCSS;
  root.append(style);
  maplibregl.setWorkerUrl(mapWorkerUrl);
  maplibregl.setWorkerCount(1);
  const map = new maplibregl.Map({
    container: stage,
    style: {
      version: 8,
      sources: {
        regions: { type: "geojson", data: localRegions as any },
        route: { type: "geojson", data: routeFeature as any },
        sites: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: localSites.map((s, i) => ({
              type: "Feature",
              id: i,
              properties: { name: s.name },
              geometry: { type: "Point", coordinates: s.position },
            })),
          },
        },
      },
      layers: [
        {
          id: "paper",
          type: "background",
          paint: { "background-color": districts ? "#e8e7da" : "#e3ebdc" },
        },
        {
          id: "regions",
          type: "fill",
          source: "regions",
          paint: {
            "fill-color": districts
              ? [
                  "interpolate",
                  ["linear"],
                  ["get", "value"],
                  20,
                  "#d0d5b8",
                  95,
                  "#376e68",
                ]
              : "#c5d7bd",
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              1,
              0.65,
            ],
          },
        },
        {
          id: "edges",
          type: "line",
          source: "regions",
          paint: { "line-color": "#f9f8ed", "line-width": 2 },
        },
        {
          id: "route",
          type: "line",
          source: "route",
          paint: {
            "line-color": districts ? "#736653" : "#aa5739",
            "line-width": districts ? 2 : 5,
            "line-opacity": districts ? 0.25 : 1,
          },
          layout: { "line-cap": "round", "line-join": "round" },
        },
        {
          id: "sites",
          type: "circle",
          source: "sites",
          paint: {
            "circle-radius": districts ? 3 : 7,
            "circle-color": "#f7f6ed",
            "circle-stroke-color": "#994c35",
            "circle-stroke-width": 2,
          },
        },
      ],
    },
    center: [121.515, 25.046],
    zoom: 12.15,
    pitch: districts ? 0 : 36,
    bearing: districts ? 0 : -14,
    attributionControl: false,
    interactive: true,
    fadeDuration: 0,
    maxZoom: 17,
    minZoom: 10,
    renderWorldCopies: false,
    pixelRatio: Math.min(devicePixelRatio, 1.5),
  });
  map.scrollZoom.disable();
  try {
    await new Promise<void>((resolve, reject) => {
      const abort = () => reject(new DOMException("Aborted", "AbortError"));
      signal.addEventListener("abort", abort, { once: true });
      map.once("load", () => {
        signal.removeEventListener("abort", abort);
        resolve();
      });
      map.once("error", (e) => {
        signal.removeEventListener("abort", abort);
        reject(e.error);
      });
    });
  } catch (error) {
    map.remove();
    throw error;
  }
  const show = (n: number) => {
    if (disposed) return;
    selected = n;
    manual = true;
    if (districts) {
      for (let i = 0; i < 12; i++)
        map.setFeatureState(
          { source: "regions", id: i },
          { selected: i === n },
        );
      caption.textContent = `原創地理示意 · 示意分區 ${n + 1} · 權重 ${localRegions.features[n].properties.value} · 不是真實行政區`;
    } else {
      const site = localSites[n % 4];
      map.jumpTo({
        center: site.position,
        zoom: 13,
        pitch: 48,
        bearing: -18 + n * 12,
      });
      caption.textContent = `原創地理示意 · ${site.name} · 可拖曳地圖；無外部底圖`;
    }
  };
  map.on("click", "regions", (e) => {
    if (districts && e.features?.[0]) show(Number(e.features[0].id));
  });
  map.on("dragstart", () => {
    manual = true;
  });
  map.on("zoomstart", (e) => {
    if (e.originalEvent) manual = true;
  });
  button(controls, districts ? "下一個分區" : "下一個地點", signal, () =>
    show((selected + 1) % (districts ? 12 : 4)),
  );
  button(controls, "重設鏡頭", signal, () => {
    manual = false;
    map.jumpTo({
      center: [121.515, 25.046],
      zoom: 12.15,
      pitch: districts ? 0 : 36,
      bearing: districts ? 0 : -14,
    });
  });
  map.resize();
  return {
    seek: (seconds) => {
      if (disposed || manual || districts) return;
      const k = (seconds * 0.45) % 7;
      const a = localRoute[Math.floor(k)],
        b = localRoute[Math.min(7, Math.floor(k) + 1)],
        t = k % 1;
      map.jumpTo({
        center: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
        zoom: 12.65,
        bearing: -18 + Math.sin(seconds * 0.3) * 14,
        pitch: 38,
      });
    },
    pause: () => map.stop(),
    dispose: () => {
      disposed = true;
      map.remove();
      root.replaceChildren();
    },
  };
};
export default mount;
