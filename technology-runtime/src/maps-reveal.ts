/** Created: 2026-10-04. One eight-second camera clock; no live tiles or independent easing. */
import * as d3 from "d3";
import * as maplibre from "maplibre-gl";
import mapCSS from "maplibre-gl/dist/maplibre-gl.css?inline";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { FeatureCollection, Geometry } from "geojson";
import type { Mount } from "./types";

type City = {
  id: string;
  name: string;
  label: string;
  coordinates: [number, number];
};
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
const ease = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
const assetUrl = (name: string) =>
  new URL(
    `${import.meta.env.BASE_URL}technology-assets/maps/${name}`,
    location.href,
  ).href;

// Kept local to this new module so already-verified world cases retain their source hashes.
function planarGeometry(
  source: FeatureCollection<Geometry>,
): FeatureCollection {
  const projection = d3
    .geoEquirectangular()
    .scale(180 / Math.PI)
    .translate([0, 0])
    .precision(0);
  return {
    type: "FeatureCollection",
    features: source.features.map((feature) => {
      const polygons: number[][][][] = [];
      let rings: number[][][] = [],
        ring: number[][] = [];
      d3.geoStream(
        feature.geometry,
        projection.stream({
          point(x, y) {
            ring.push([clamp(x, -180, 180), clamp(-y, -85, 85)]);
          },
          lineStart() {
            ring = [];
          },
          lineEnd() {
            if (ring.length > 2) {
              ring.push([...ring[0]]);
              rings.push(ring);
            }
          },
          polygonStart() {
            rings = [];
          },
          polygonEnd() {
            if (rings.length) polygons.push(rings);
          },
          sphere() {},
        }),
      );
      return {
        ...feature,
        geometry: { type: "MultiPolygon", coordinates: polygons },
      };
    }),
  };
}
const mount: Mount = async (root, { reducedMotion, signal }) => {
  const assets = await Promise.all(
    ["reveal-countries.geojson", "provenance.json"].map(async (file) => {
      const response = await fetch(assetUrl(file), { signal });
      if (!response.ok)
        throw new Error(`Local geographic asset unavailable: ${file}`);
      return response.json();
    }),
  );
  signal.throwIfAborted();
  const countries = assets[0] as FeatureCollection<Geometry>,
    cities = assets[1].cities as City[];
  const origin = cities.find((city) => city.id === "taipei");
  if (!origin) throw new Error("Verified Taipei origin is missing");
  const local = new AbortController();
  let disposed = false;
  const abort = () => local.abort();
  signal.addEventListener("abort", abort, { once: true });
  const css = document.createElement("style");
  css.textContent = `${mapCSS}
    .reveal{position:absolute;inset:0;width:960px;height:540px;overflow:hidden;background:#d7e6e8;color:#284b50;font-family:Arial,sans-serif}.reveal *{box-sizing:border-box}.reveal .map{position:absolute;inset:0;width:100%;height:100%}
    .reveal .city-label{background:#fcfaeedf;color:#284a51;padding:4px 6px;font:11px Arial,sans-serif;border:1px solid #c7c8af;border-radius:4px;white-space:nowrap;pointer-events:none;text-shadow:0 1px #fff8}.reveal .hero-label{font-size:13px;font-weight:600;border-color:#af7650;box-shadow:0 2px 7px #5d503426}.reveal .attribution{position:absolute;right:9px;bottom:8px;margin:0;z-index:3;background:#f3f6e8d9;color:#435c5d;padding:4px 6px;border-radius:3px;font-size:9px;line-height:1.4;pointer-events:none}
  `;
  const surface = document.createElement("section");
  surface.className = "reveal";
  const stage = document.createElement("div");
  stage.className = "map";
  stage.setAttribute("role", "img");
  stage.setAttribute(
    "aria-label",
    "滿版真實地圖動畫：臺北區域拉遠至世界，再返回相同臺北原點；使用畫廊播放與時間控制。",
  );
  const attribution = document.createElement("p");
  attribution.className = "attribution";
  attribution.textContent =
    "Natural Earth 4.1.0 · 世界 1:50m / 臺灣 1:10m · 區域非街道 · 示意連線";
  surface.append(stage, attribution);
  root.append(css, surface);
  const routes: FeatureCollection = {
    type: "FeatureCollection",
    features: cities
      .filter((city) => city.id !== "taipei")
      .map((city) => ({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: d3
            .range(81)
            .map((i) =>
              d3.geoInterpolate(origin.coordinates, city.coordinates)(i / 80),
            ),
        },
      })),
  };
  maplibre.setWorkerUrl(mapWorkerUrl);
  maplibre.setWorkerCount(1);
  const map = new maplibre.Map({
    container: stage,
    center: origin.coordinates,
    zoom: 5.85,
    minZoom: 0,
    maxZoom: 7,
    interactive: false,
    attributionControl: false,
    renderWorldCopies: false,
    fadeDuration: 0,
    pixelRatio: Math.min(devicePixelRatio, 1.5),
    style: {
      version: 8,
      transition: { duration: 0, delay: 0 },
      sources: {
        countries: {
          type: "geojson",
          data: planarGeometry(countries),
          tolerance: 0.1,
        },
        grid: {
          type: "geojson",
          data: d3
            .geoGraticule()
            .extent([
              [-180, -75],
              [180, 80],
            ])
            .step([30, 30])(),
        },
        regionalGrid: {
          type: "geojson",
          data: d3
            .geoGraticule()
            .extent([
              [110, 15],
              [132, 36],
            ])
            .step([1, 1])(),
        },
        routes: { type: "geojson", data: routes },
        cities: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: cities.map((city) => ({
              type: "Feature",
              properties: { origin: city.id === "taipei" },
              geometry: { type: "Point", coordinates: city.coordinates },
            })),
          },
        },
      },
      layers: [
        {
          id: "ocean",
          type: "background",
          paint: { "background-color": "#d5e6e8" },
        },
        {
          id: "grid",
          type: "line",
          source: "grid",
          paint: {
            "line-color": "#aac2c4",
            "line-opacity": 0.4,
            "line-width": 0.55,
          },
        },
        {
          id: "regional-grid",
          type: "line",
          source: "regionalGrid",
          paint: {
            "line-color": "#a3bcbc",
            "line-width": 0.5,
            "line-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              2,
              0,
              4,
              0.32,
            ],
          },
        },
        {
          id: "shore-shadow",
          type: "line",
          source: "countries",
          paint: {
            "line-color": "#769791",
            "line-width": 3.5,
            "line-opacity": 0.22,
          },
        },
        {
          id: "land",
          type: "fill",
          source: "countries",
          paint: { "fill-color": "#dce2ca" },
        },
        {
          id: "boundaries",
          type: "line",
          source: "countries",
          paint: {
            "line-color": "#879d8c",
            "line-width": 0.8,
            "line-opacity": 0.85,
          },
        },
        {
          id: "route-under",
          type: "line",
          source: "routes",
          paint: {
            "line-color": "#fff8dc",
            "line-width": 4,
            "line-opacity": 0,
          },
        },
        {
          id: "routes",
          type: "line",
          source: "routes",
          paint: {
            "line-color": "#a9683b",
            "line-width": 1.8,
            "line-opacity": 0,
          },
          layout: { "line-cap": "round" },
        },
        {
          id: "city-halo",
          type: "circle",
          source: "cities",
          paint: {
            "circle-color": "#b17443",
            "circle-radius": ["case", ["get", "origin"], 18, 7],
            "circle-opacity": 0.17,
          },
        },
        {
          id: "cities",
          type: "circle",
          source: "cities",
          paint: {
            "circle-color": "#fff8e1",
            "circle-radius": ["case", ["get", "origin"], 5, 3.1],
            "circle-stroke-width": 1.8,
            "circle-stroke-color": "#a45c34",
          },
        },
      ],
    },
  });
  try {
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        signal.removeEventListener("abort", cancel);
        map.off("error", failed);
      };
      const cancel = () => {
        cleanup();
        reject(new DOMException("Aborted", "AbortError"));
      };
      const failed = (event: maplibre.ErrorEvent) => {
        cleanup();
        reject(event.error);
      };
      signal.addEventListener("abort", cancel, { once: true });
      map.once("error", failed);
      map.once("load", () => {
        cleanup();
        resolve();
      });
    });
  } catch (error) {
    map.remove();
    local.abort();
    signal.removeEventListener("abort", abort);
    throw error;
  }
  const markers = cities.map((city) => {
    const label = document.createElement("div");
    label.className = `city-label${city.id === "taipei" ? " hero-label" : ""}`;
    label.textContent = city.label;
    return new maplibre.Marker({
      element: label,
      anchor: city.id === "taipei" ? "top-left" : "bottom-right",
      offset: city.id === "taipei" ? [9, 11] : [-7, -9],
    })
      .setLngLat(city.coordinates)
      .addTo(map);
  });
  const worldPosition = d3.geoInterpolate(origin.coordinates, [0, 12]);
  const idle = () =>
    new Promise<void>((resolve) => {
      if (disposed || local.signal.aborted) {
        resolve();
        return;
      }
      const done = () => {
        map.off("idle", done);
        local.signal.removeEventListener("abort", done);
        resolve();
      };
      map.once("idle", done);
      local.signal.addEventListener("abort", done, { once: true });
      map.triggerRepaint();
    });
  async function render(seconds: number) {
    if (disposed) return;
    const time = reducedMotion ? 4 : clamp(seconds, 0, 8);
    const progress =
      time < 3.3
        ? ease((time - 0.75) / 2.55)
        : time < 4.45
          ? 1
          : 1 - ease((time - 4.45) / 2.75);
    // Keep the close-up origin visible; shift to the global center only after widening the view.
    map.jumpTo({
      center: worldPosition(ease((progress - 0.5) / 0.5)) as [number, number],
      zoom: 5.85 + (0.9 - 5.85) * progress,
      bearing: 0,
      pitch: 0,
    });
    map.setPaintProperty("routes", "line-opacity", 0.9 * progress);
    map.setPaintProperty("route-under", "line-opacity", 0.65 * progress);
    map.setPaintProperty("city-halo", "circle-radius", [
      "case",
      ["get", "origin"],
      15 + (reducedMotion ? 0 : Math.sin(time * 2) * 2),
      7,
    ]);
    markers.forEach((marker, index) =>
      marker.setOpacity(index === 0 ? 1 : clamp(progress * 1.4, 0, 1)),
    );
    surface.dataset.phase = String(time < 3.3 ? 0 : time < 4.45 ? 1 : 2);
    surface.dataset.zoom = map.getZoom().toFixed(4);
    surface.dataset.longitude = map.getCenter().lng.toFixed(6);
    surface.dataset.latitude = map.getCenter().lat.toFixed(6);
    await idle();
  }
  await render(0);
  return {
    seek: render,
    pause: () => map.stop(),
    dispose() {
      if (disposed) return;
      disposed = true;
      signal.removeEventListener("abort", abort);
      local.abort();
      markers.forEach((marker) => marker.remove());
      map.remove();
      root.replaceChildren();
    },
  };
};
export default mount;
