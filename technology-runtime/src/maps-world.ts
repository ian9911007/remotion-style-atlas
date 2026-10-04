/** Created: 2026-10-04. Real Natural Earth geometry, host time and owned interactions. */
import * as d3 from "d3";
import type {
  FeatureCollection,
  Geometry,
  LineString,
  MultiLineString,
} from "geojson";
import type { Mount, RuntimeHandle } from "./types";
import mapCSS from "maplibre-gl/dist/maplibre-gl.css?inline";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

type City = {
  id: string;
  name: string;
  label: string;
  coordinates: [number, number];
};
const ASSET = "technology-assets/maps/";
const assetUrl = (file: string) =>
  new URL(`${import.meta.env.BASE_URL}${ASSET}${file}`, location.href).href;
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
const coordinate = ([lon, lat]: number[]) =>
  `${Math.abs(lat).toFixed(2)}°${lat < 0 ? "S" : "N"} / ${Math.abs(lon).toFixed(2)}°${lon < 0 ? "W" : "E"}`;
function line(
  a: [number, number],
  b: [number, number],
  progress = 1,
): LineString {
  const interpolate = d3.geoInterpolate(a, b);
  return {
    type: "LineString",
    coordinates: d3
      .range(65)
      .map((i) => interpolate((i / 64) * Math.max(0.002, progress))),
  };
}
function splitDateline(geometry: LineString): MultiLineString {
  const segments: number[][][] = [[]];
  for (const point of geometry.coordinates) {
    const current = segments[segments.length - 1],
      previous = current[current.length - 1];
    if (previous && Math.abs(point[0] - previous[0]) > 180) {
      const edge = previous[0] > 0 ? 180 : -180;
      const unwrapped = point[0] + (previous[0] > 0 ? 360 : -360);
      const latitude =
        previous[1] +
        ((point[1] - previous[1]) * (edge - previous[0])) /
          (unwrapped - previous[0]);
      current.push([edge, latitude]);
      segments.push([[-edge, latitude], point]);
    } else current.push(point);
  }
  return {
    type: "MultiLineString",
    coordinates: segments.filter((s) => s.length > 1),
  };
}
// Spherical source polygons need antimeridian clipping before planar Web Mercator.
function planarCountries(
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
      const stream: d3.GeoStream = {
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
      };
      d3.geoStream(feature.geometry, projection.stream(stream));
      return {
        ...feature,
        geometry: { type: "MultiPolygon", coordinates: polygons },
      };
    }),
  };
}
const mount: Mount = async (root, { variant, reducedMotion, signal }) => {
  const globe = variant === "world-globe";
  const responses = await Promise.all([
    fetch(assetUrl("world-countries.geojson"), { signal }),
    fetch(assetUrl("provenance.json"), { signal }),
  ]);
  if (responses.some((r) => !r.ok))
    throw new Error("Local Natural Earth assets unavailable");
  const countries: FeatureCollection<Geometry> = await responses[0].json();
  const { cities }: { cities: City[] } = await responses[1].json();
  signal.throwIfAborted();
  const local = new AbortController();
  const abort = () => local.abort();
  signal.addEventListener("abort", abort, { once: true });
  let disposed = false,
    manual = false,
    selected = 1,
    time = 0;
  const style = document.createElement("style");
  style.textContent = `${mapCSS}
    .world{position:absolute;inset:0;background:${globe ? "#132936" : "#edf1ee"};color:${globe ? "#f1ead9" : "#223c49"};font-family:Arial,sans-serif;overflow:hidden}.world *{box-sizing:border-box}
    .world h2{margin:8px 0 0;font-size:30px;letter-spacing:-.035em;font-weight:600}.world header{position:absolute;left:32px;top:24px;z-index:3;pointer-events:none}.world .eyebrow{font-size:10px;letter-spacing:.24em;color:${globe ? "#dbac73" : "#9d553a"};font-weight:700}.world .sub{font-size:12px;opacity:.72;margin-top:9px;letter-spacing:.025em}
    .world-map{position:absolute;left:22px;top:125px;width:630px;height:350px;border:1px solid #bccbc9;border-radius:14px;overflow:hidden;box-shadow:0 8px 25px #243e4820}.world-map:before{content:"";position:absolute;inset:0;pointer-events:none;z-index:1;box-shadow:inset 0 0 45px #243e4820;border-radius:14px}
    .world-panel{position:absolute;z-index:3;${globe ? "right:30px;top:115px;width:258px;" : "right:28px;top:137px;width:248px;"}padding:17px;border:1px solid ${globe ? "#7894a43c" : "#a5b7b3"};border-radius:12px;background:${globe ? "#1d3746ed" : "#f9faf4ed"};box-shadow:0 9px 25px #08222c17}.world-panel .label{font-size:10px;letter-spacing:.16em;opacity:.68}.world-panel strong{display:block;font-size:24px;margin:6px 0}.world-coordinates{font-size:11px;font-variant-numeric:tabular-nums;opacity:.75}.world-distance{border-top:1px solid ${globe ? "#7795a44d" : "#ccd6cf"};margin-top:12px;padding-top:10px;font-size:12px}.world-distance b{font-size:20px;font-weight:500;margin-right:5px}.world-status{margin-top:9px;font-size:11px;line-height:1.65;opacity:.75}
    .world-cities{position:absolute;z-index:4;${globe ? "right:30px;top:380px;width:258px;" : "right:29px;top:32px;"}display:flex;gap:6px;flex-wrap:wrap}.world button{border:1px solid ${globe ? "#6b89987a" : "#aabbb4"};border-radius:7px;padding:8px 10px;font-size:11px;font-family:inherit;color:inherit;background:${globe ? "#1d3746" : "#f8f9f4"};cursor:pointer}.world button[aria-pressed=true]{background:${globe ? "#dbac73" : "#355867"};color:${globe ? "#132936" : "#fff"};border-color:transparent}.world button:focus-visible,.world [tabindex]:focus-visible{outline:3px solid ${globe ? "#dbac73" : "#ad5435"};outline-offset:3px}.world-tools{position:absolute;z-index:4;${globe ? "right:30px;top:454px" : "left:39px;top:425px"};display:flex;gap:7px}
    .world footer{position:absolute;bottom:14px;left:31px;right:30px;font-size:10px;opacity:.72;display:flex;justify-content:space-between;gap:12px}.world-legend{position:absolute;left:36px;top:483px;font-size:11px;display:flex;gap:18px;align-items:center}.world-legend i{display:inline-block;width:22px;height:2px;background:#ae593a;vertical-align:middle;margin-right:6px}.world-legend span:last-child i{height:8px;width:8px;border:2px solid #ae593a;border-radius:50%;background:#fff}.world-city-label{font-family:Arial,sans-serif;font-size:11px;color:#233e48;background:#fffef2e8;padding:4px 7px;border-radius:5px;box-shadow:0 2px 6px #29475022;white-space:nowrap;pointer-events:none}.world-globe{position:absolute;inset:0;width:960px;height:540px;touch-action:none;cursor:grab}.world-globe:active{cursor:grabbing}
    .world-network{position:absolute;right:29px;top:357px;width:246px;font-size:11px}.world-network h3{font-size:10px;letter-spacing:.16em;font-weight:500;margin:0 0 10px;opacity:.65}.world-network div{display:flex;justify-content:space-between;padding:7px 1px;border-bottom:1px solid #becbc650;font-variant-numeric:tabular-nums}.world-network span:first-child:before{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:#ab6140;margin-right:8px}.world-network small{display:block;margin-top:10px;font-size:10px;opacity:.65}
  `;
  const surface = document.createElement("div");
  surface.className = "world";
  surface.innerHTML = `<header><div class="eyebrow">${globe ? "SPHERICAL ATLAS / D3 GEOGRAPHY" : "WORLD CONNECTIONS / MAPLIBRE"}</div><h2>${globe ? "轉個角度，看見世界" : "從臺北，連向世界"}</h2><div class="sub">真實地理底圖 · 五座城市 · 示意大圓航線</div></header><aside class="world-panel"><div class="label">TAIPEI → SELECTED CITY</div><strong></strong><div class="world-coordinates"></div><div class="world-distance"></div><div class="world-status"></div></aside><nav class="world-cities" aria-label="選取世界城市"></nav><div class="world-tools"></div><footer><span>Made with Natural Earth · 4.1.0 / 1:110m · world-atlas 2.0.2</span><span>歷史概化國界 · 示意連線非實際航班／導航</span></footer>`;
  root.append(style, surface);
  const panel = surface.querySelector(".world-panel")!;
  const cityButtons: HTMLButtonElement[] = [];
  const addButton = (parent: Element, label: string, action: () => void) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", action, { signal: local.signal });
    parent.append(b);
    return b;
  };
  const info = (status = "") => {
    const city = cities[selected],
      distance = Math.round(
        d3.geoDistance(cities[0].coordinates, city.coordinates) * 6371,
      );
    panel.querySelector("strong")!.textContent = `${city.label} / ${city.name}`;
    panel.querySelector(".world-coordinates")!.textContent = coordinate(
      city.coordinates,
    );
    panel.querySelector(".world-distance")!.innerHTML =
      `<b>${distance.toLocaleString("en-US")}</b> km <span>約略球面距離</span>`;
    panel.querySelector(".world-status")!.textContent =
      status || "城市位置來自地理資料；連線為視覺示意，不代表實際服務。";
    cityButtons.forEach((b, i) =>
      b.setAttribute("aria-pressed", String(i === selected)),
    );
  };
  let choose = (_index: number) => {},
    reset = () => {};
  cities.forEach((city, i) =>
    cityButtons.push(
      addButton(surface.querySelector(".world-cities")!, city.label, () =>
        choose(i),
      ),
    ),
  );
  let handle: RuntimeHandle;
  if (!globe) {
    const maplibre = await import("maplibre-gl");
    signal.throwIfAborted();
    const stage = document.createElement("div");
    stage.className = "world-map";
    stage.setAttribute("aria-label", "真實世界國界與示意城市連線");
    surface.prepend(stage);
    const legend = document.createElement("div");
    legend.className = "world-legend";
    legend.innerHTML =
      "<span><i></i>示意大圓航線</span><span><i></i>真實城市位置</span><span>拖曳平移 · 按鈕選取地點</span>";
    surface.append(legend);
    const network = document.createElement("aside");
    network.className = "world-network";
    network.innerHTML =
      "<h3>TAIPEI / ILLUSTRATIVE ROUTES</h3>" +
      cities
        .slice(1)
        .map(
          (city) =>
            `<div><span>${city.label}</span><span>${Math.round(d3.geoDistance(cities[0].coordinates, city.coordinates) * 6371).toLocaleString("en-US")} km</span></div>`,
        )
        .join("");
    surface.append(network);
    maplibre.setWorkerUrl(mapWorkerUrl);
    maplibre.setWorkerCount(1);
    const routeData = (progress: number): FeatureCollection => ({
      type: "FeatureCollection",
      features: cities.slice(1).map((city, i) => ({
        type: "Feature",
        properties: { active: i + 1 === selected },
        geometry: splitDateline(
          line(
            cities[0].coordinates,
            city.coordinates,
            clamp(progress - i * 0.12, 0.02, 1),
          ),
        ),
      })),
    });
    const graticule = d3
      .geoGraticule()
      .extent([
        [-180, -75],
        [180, 80],
      ])
      .step([30, 30])();
    const map = new maplibre.Map({
      container: stage,
      attributionControl: false,
      interactive: true,
      fadeDuration: 0,
      renderWorldCopies: false,
      center: [25, 16],
      zoom: 0.2,
      minZoom: 0.05,
      maxZoom: 5,
      pixelRatio: Math.min(devicePixelRatio, 1.5),
      style: {
        version: 8,
        transition: { duration: 0, delay: 0 },
        sources: {
          countries: { type: "geojson", data: planarCountries(countries) },
          grid: { type: "geojson", data: graticule },
          routes: { type: "geojson", data: routeData(0.2) },
          cities: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: cities.map((c, i) => ({
                type: "Feature",
                id: i,
                properties: { index: i },
                geometry: { type: "Point", coordinates: c.coordinates },
              })),
            },
          },
        },
        layers: [
          {
            id: "ocean",
            type: "background",
            paint: { "background-color": "#dbe8eb" },
          },
          {
            id: "grid",
            type: "line",
            source: "grid",
            paint: {
              "line-color": "#9aafb9",
              "line-width": 0.65,
              "line-opacity": 0.45,
            },
          },
          {
            id: "land-shadow",
            type: "line",
            source: "countries",
            paint: {
              "line-color": "#77939a",
              "line-width": 2,
              "line-opacity": 0.2,
            },
          },
          {
            id: "land",
            type: "fill",
            source: "countries",
            paint: { "fill-color": "#e6e5d4" },
          },
          {
            id: "borders",
            type: "line",
            source: "countries",
            paint: { "line-color": "#a5b4a8", "line-width": 0.65 },
          },
          {
            id: "route-halo",
            type: "line",
            source: "routes",
            paint: {
              "line-color": "#fff9dc",
              "line-width": 5,
              "line-opacity": 0.7,
            },
          },
          {
            id: "routes",
            type: "line",
            source: "routes",
            paint: {
              "line-color": ["case", ["get", "active"], "#a44c30", "#b68057"],
              "line-width": ["case", ["get", "active"], 2.7, 1.6],
            },
            layout: { "line-cap": "round", "line-join": "round" },
          },
          {
            id: "city-halo",
            type: "circle",
            source: "cities",
            paint: {
              "circle-color": "#b56f46",
              "circle-radius": 11,
              "circle-opacity": 0.2,
            },
          },
          {
            id: "cities",
            type: "circle",
            source: "cities",
            paint: {
              "circle-color": "#fffdf0",
              "circle-radius": 4.3,
              "circle-stroke-color": "#99492f",
              "circle-stroke-width": 2,
            },
          },
        ],
      },
    });
    map.scrollZoom.disable();
    await new Promise<void>((resolve, reject) => {
      const cancel = () => {
        map.remove();
        reject(new DOMException("Aborted", "AbortError"));
      };
      signal.addEventListener("abort", cancel, { once: true });
      map.once("load", () => {
        signal.removeEventListener("abort", cancel);
        resolve();
      });
      map.once("error", (e) => {
        signal.removeEventListener("abort", cancel);
        map.remove();
        reject(e.error);
      });
    });
    const markers = cities.map((city, i) => {
      const el = document.createElement("div");
      el.className = "world-city-label";
      el.textContent = city.label;
      return new maplibre.Marker({
        element: el,
        anchor: i === 0 ? "top-left" : i === 4 ? "bottom-left" : "bottom-right",
        offset: i === 0 ? [8, 10] : i === 4 ? [8, -10] : [-8, -10],
      })
        .setLngLat(city.coordinates)
        .addTo(map);
    });
    choose = (index) => {
      selected = index;
      manual = true;
      const city = cities[index];
      const center = d3.geoInterpolate(
        cities[0].coordinates,
        city.coordinates,
      )(0.5) as [number, number];
      map.jumpTo({
        center,
        zoom:
          index === 0
            ? 1.6
            : Math.min(
                2.3,
                Math.max(
                  0.85,
                  2.6 - d3.geoDistance(cities[0].coordinates, city.coordinates),
                ),
              ),
        bearing: 0,
        pitch: 0,
      });
      (map.getSource("routes") as import("maplibre-gl").GeoJSONSource).setData(
        routeData(1.5),
      );
      info();
    };
    reset = () => {
      manual = false;
      map.jumpTo({ center: [25, 16], zoom: 0.2 });
    };
    map.on("click", "cities", (event) => {
      const index = Number(event.features?.[0]?.properties?.index);
      if (Number.isInteger(index)) choose(index);
    });
    map.on("dragstart", () => {
      manual = true;
    });
    map.on("zoomstart", (event) => {
      if (event.originalEvent) manual = true;
    });
    addButton(surface.querySelector(".world-tools")!, "世界總覽", reset);
    addButton(surface.querySelector(".world-tools")!, "＋", () => {
      manual = true;
      map.jumpTo({ zoom: Math.min(map.getZoom() + 0.5, 5) });
    });
    addButton(surface.querySelector(".world-tools")!, "−", () => {
      manual = true;
      map.jumpTo({ zoom: Math.max(map.getZoom() - 0.5, 0.05) });
    });
    handle = {
      async seek(seconds) {
        if (disposed) return;
        time = seconds;
        if (!manual) {
          const t = reducedMotion ? 4 : seconds;
          (
            map.getSource("routes") as import("maplibre-gl").GeoJSONSource
          ).setData(routeData(0.2 + t * 0.26));
          map.setPaintProperty(
            "city-halo",
            "circle-radius",
            10 + Math.sin(t * 2) * 2,
          );
          map.jumpTo({
            center: [25 + Math.sin(t * 0.25) * 17, 16],
            zoom: 0.2 + Math.sin(t * 0.25) * 0.07,
          });
        }
        info();
        await new Promise<void>((resolve) => {
          const done = () => {
            map.off("idle", done);
            local.signal.removeEventListener("abort", done);
            resolve();
          };
          if (disposed || local.signal.aborted) {
            resolve();
            return;
          }
          map.once("idle", done);
          local.signal.addEventListener("abort", done, { once: true });
          map.triggerRepaint();
        });
      },
      pause: () => map.stop(),
      dispose() {
        markers.forEach((marker) => marker.remove());
        map.remove();
      },
    };
  } else {
    const svg = d3
      .select(surface)
      .insert("svg", ":first-child")
      .attr("class", "world-globe")
      .attr("viewBox", "0 0 960 540")
      .attr("tabindex", 0)
      .attr("role", "application")
      .attr(
        "aria-label",
        "世界正投影地球。拖曳或方向鍵旋轉，Home 重設；右側提供城市按鈕。",
      );
    const defs = svg.append("defs");
    const ocean = defs
      .append("radialGradient")
      .attr("id", "world-ocean")
      .attr("cx", "32%")
      .attr("cy", "26%");
    ocean.append("stop").attr("offset", "0").attr("stop-color", "#3f697b");
    ocean.append("stop").attr("offset", "1").attr("stop-color", "#193a4c");
    const atmosphere = defs
      .append("radialGradient")
      .attr("id", "world-atmosphere");
    atmosphere
      .append("stop")
      .attr("offset", "89%")
      .attr("stop-color", "#9bb7c5")
      .attr("stop-opacity", 0);
    atmosphere
      .append("stop")
      .attr("offset", "95%")
      .attr("stop-color", "#9bb7c5")
      .attr("stop-opacity", 0.17);
    atmosphere
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#9bb7c5")
      .attr("stop-opacity", 0);
    svg
      .append("circle")
      .attr("cx", 329)
      .attr("cy", 302)
      .attr("r", 218)
      .attr("fill", "url(#world-atmosphere)");
    const projection = d3
      .geoOrthographic()
      .translate([329, 302])
      .scale(198)
      .clipAngle(90)
      .precision(0.3);
    const geoPath = d3.geoPath(projection);
    let rotation: [number, number, number] = [-121.568, -18, 0];
    const sphere = svg
      .append("path")
      .datum({ type: "Sphere" } as d3.GeoPermissibleObjects)
      .attr("fill", "url(#world-ocean)")
      .attr("stroke", "#aec0bc")
      .attr("stroke-opacity", 0.7);
    const grid = svg
      .append("path")
      .datum(d3.geoGraticule().step([30, 15])())
      .attr("fill", "none")
      .attr("stroke", "#9ab7bf")
      .attr("stroke-opacity", 0.22)
      .attr("stroke-width", 0.6);
    const land = svg
      .append("g")
      .selectAll("path")
      .data(countries.features)
      .join("path")
      .attr("fill", "#c9c6ac")
      .attr("stroke", "#526c6b")
      .attr("stroke-width", 0.55);
    const routes = svg
      .append("g")
      .selectAll("path")
      .data(cities.slice(1))
      .join("path")
      .attr("fill", "none")
      .attr("stroke-linecap", "round");
    const dots = svg.append("g").selectAll("g").data(cities).join("g");
    dots
      .append("circle")
      .attr("class", "halo")
      .attr("r", 10)
      .attr("fill", "#edbd7b")
      .attr("opacity", 0.16);
    dots
      .append("circle")
      .attr("r", 3.6)
      .attr("fill", "#fff3d9")
      .attr("stroke", "#c07842")
      .attr("stroke-width", 1.5);
    dots
      .append("text")
      .text((c) => c.label)
      .attr("x", 9)
      .attr("y", -9)
      .attr("fill", "#fff4da")
      .attr("font-size", 12)
      .attr("stroke", "#183c4b")
      .attr("stroke-width", 3)
      .attr("paint-order", "stroke");
    svg
      .append("text")
      .attr("x", 328)
      .attr("y", 509)
      .attr("text-anchor", "middle")
      .attr("fill", "#a5bac3")
      .attr("font-size", 10)
      .attr("letter-spacing", ".14em")
      .text("ORTHOGRAPHIC / FRONT HEMISPHERE ONLY");
    const render = () => {
      projection.rotate(rotation);
      sphere.attr("d", geoPath);
      grid.attr("d", geoPath);
      land.attr("d", geoPath);
      const center = projection.invert!([329, 302])!;
      let visible = 0;
      dots
        .attr("display", (c) => {
          const front =
            d3.geoDistance(center, c.coordinates) < Math.PI / 2 - 0.005;
          if (front) visible++;
          return front ? null : "none";
        })
        .attr("transform", (c) => `translate(${projection(c.coordinates)})`);
      dots
        .select(".halo")
        .attr("r", reducedMotion ? 10 : 10 + Math.sin(time * 2) * 2);
      routes
        .attr("d", (c, i) =>
          geoPath(
            line(
              cities[0].coordinates,
              c.coordinates,
              manual ? 1 : clamp(0.25 + time * 0.25 - i * 0.1, 0.04, 1),
            ),
          ),
        )
        .attr("stroke", (_c, i) => (i + 1 === selected ? "#f0c789" : "#ad956f"))
        .attr("stroke-width", (_c, i) => (i + 1 === selected ? 2.2 : 1.15));
      const back =
        d3.geoDistance(center, cities[selected].coordinates) >= Math.PI / 2;
      info(
        `${visible} / 5 個城市位於正面；${back ? "所選城市在背面，標記與航線由球面裁切。" : "背面地理與航線已裁切，球面不透視。"}`,
      );
    };
    choose = (index) => {
      selected = index;
      manual = true;
      rotation = [
        -cities[index].coordinates[0],
        -cities[index].coordinates[1],
        0,
      ];
      render();
    };
    reset = () => {
      manual = false;
      rotation = [-121.568, -18, 0];
      render();
    };
    addButton(surface.querySelector(".world-tools")!, "回到臺北", reset);
    addButton(surface.querySelector(".world-tools")!, "查看背面", () => {
      manual = true;
      rotation = [rotation[0] + 180, -rotation[1], 0];
      render();
    });
    const node = svg.node()!;
    let drag:
      | { x: number; y: number; rotation: [number, number, number] }
      | undefined;
    node.addEventListener(
      "pointerdown",
      (event) => {
        manual = true;
        drag = { x: event.clientX, y: event.clientY, rotation: [...rotation] };
        node.setPointerCapture(event.pointerId);
      },
      { signal: local.signal },
    );
    node.addEventListener(
      "pointermove",
      (event) => {
        if (!drag) return;
        const scale = 960 / node.getBoundingClientRect().width;
        rotation = [
          drag.rotation[0] + (event.clientX - drag.x) * scale * 0.28,
          clamp(
            drag.rotation[1] - (event.clientY - drag.y) * scale * 0.28,
            -85,
            85,
          ),
          0,
        ];
        render();
      },
      { signal: local.signal },
    );
    const end = (event: PointerEvent) => {
      drag = undefined;
      if (node.hasPointerCapture(event.pointerId))
        node.releasePointerCapture(event.pointerId);
    };
    node.addEventListener("pointerup", end, { signal: local.signal });
    node.addEventListener("pointercancel", end, { signal: local.signal });
    node.addEventListener(
      "keydown",
      (event) => {
        if (
          !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(
            event.key,
          )
        )
          return;
        event.preventDefault();
        manual = true;
        if (event.key === "Home") reset();
        else {
          rotation[0] +=
            event.key === "ArrowLeft"
              ? -12
              : event.key === "ArrowRight"
                ? 12
                : 0;
          rotation[1] = clamp(
            rotation[1] +
              (event.key === "ArrowUp"
                ? 10
                : event.key === "ArrowDown"
                  ? -10
                  : 0),
            -85,
            85,
          );
          render();
        }
      },
      { signal: local.signal },
    );
    handle = {
      seek(seconds) {
        if (disposed) return;
        time = reducedMotion ? 4 : seconds;
        if (!manual) rotation = [-121.568 + time * 9, -18, 0];
        render();
      },
      dispose() {
        svg.remove();
      },
    };
  }
  info();
  await handle.seek(0);
  return {
    seek: (seconds) => handle.seek(seconds),
    pause: () => handle.pause?.(),
    resume: () => handle.resume?.(),
    dispose() {
      if (disposed) return;
      disposed = true;
      signal.removeEventListener("abort", abort);
      local.abort();
      handle.dispose();
      root.replaceChildren();
    },
  };
};
export default mount;
