/** Created: 2026-10-04. Leaflet SVG layers and geographic selection; no tile hotlinks. */
import L from "leaflet";
import leafletCSS from "leaflet/dist/leaflet.css?inline";
import type { Mount } from "./types";
import {
  shell,
  button,
  localRegions,
  localSites,
  localRoute,
} from "./data-shared";
export function leafletLoopState(seconds: number) {
  const progress =
    (1 - Math.cos(2 * Math.PI * ((Math.max(0, seconds) % 4) / 4))) / 2;
  const position = 1 + 6 * progress;
  const from = Math.min(6, Math.floor(position)),
    to = Math.min(7, from + 1),
    part = position - from;
  return { from, to, mix: part * part * (3 - 2 * part), position };
}
const mount: Mount = async (root, { variant, signal, reducedMotion }) => {
  const route = variant === "waypoints";
  let index = 0,
    manual = false;
  const { stage, controls, caption } = shell(
    root,
    route
      ? { bg: "#fff8e7", fg: "#463f30", accent: "#a05839" }
      : { bg: "#eaf0ee", fg: "#264b49", accent: "#347d7b" },
    route ? "LEAFLET / WAYPOINT INTERACTION" : "LEAFLET / GEOJSON LAYERS",
    route ? "散步地圖：逐站閱讀" : "一張可以篩選的區域圖",
    "原創地理示意 · 非實際街道或行政區 · 無外部圖磚",
  );
  const style = document.createElement("style");
  style.textContent = leafletCSS;
  root.append(style);
  stage.style.borderRadius = "6px";
  const map = L.map(stage, {
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false,
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false,
    keyboard: true,
    zoomSnap: 0.25,
  }).setView([25.046, 121.515], 12.75);
  stage.style.background = route ? "#e8e5d1" : "#dfe9e3";
  const regions = L.geoJSON(localRegions as any, {
    style: (feature: any) => ({
      color: route ? "#b5bd9e" : "#548879",
      weight: 1.5,
      fillColor: route
        ? "#d5d9bc"
        : feature.properties.value > 60
          ? "#648e7c"
          : "#adc7b5",
      fillOpacity: 0.7,
    }),
    onEachFeature: (feature, layer) => {
      if (!route)
        layer.on("click", () => {
          caption.textContent = `原創示意分區 ${feature.properties.id + 1} · 權重 ${feature.properties.value} · 非真實行政區`;
        });
    },
  }).addTo(map);
  const markers = localSites.map((site, i) =>
    L.circleMarker([site.position[1], site.position[0]], {
      radius: route ? 8 : 5,
      color: "#fff8e7",
      weight: 3,
      fillColor: "#ab5839",
      fillOpacity: 1,
    })
      .addTo(map)
      .on("click", () => show(i)),
  );
  if (route)
    L.polyline(
      localRoute.map((p) => [p[1], p[0]] as L.LatLngTuple),
      { color: "#a65737", weight: 4, dashArray: "8 8" },
    ).addTo(map);
  const trail = route
    ? L.polyline([], { color: "#8f452d", weight: 5, opacity: 0.9 }).addTo(map)
    : null;
  function show(i: number) {
    if (route) manual = true;
    index = i;
    const site = localSites[i];
    markers.forEach((marker, n) => marker.setRadius(n === i ? 13 : 7));
    map.panTo([site.position[1], site.position[0]], { animate: false });
    caption.textContent = `原創地理示意 · 第 ${i + 1} 站 ${site.name} · 點選標記或使用「下一站」`;
  }
  button(controls, route ? "下一站" : "切換高值區域", signal, () => {
    if (route) show((index + 1) % 4);
    else {
      index = 1 - index;
      regions.eachLayer((layer: any) => {
        layer.setStyle({
          fillOpacity:
            index && layer.feature.properties.value <= 60 ? 0.08 : 0.75,
        });
      });
      caption.textContent = `原創地理示意 · ${index ? "高值區域篩選" : "顯示所有分區"} · 不是真實統計`;
    }
  });
  button(controls, "縮放視野", signal, () => {
    if (route) manual = true;
    map.setZoom(map.getZoom() === 12.75 ? 13.25 : 12.75, { animate: false });
  });
  const draw = (seconds: number) => {
    if (!route || manual) return;
    const state = leafletLoopState(reducedMotion ? 0 : seconds);
    index = Math.round((state.position - 1) / 2);
    const a = localRoute[state.from],
      b = localRoute[state.to];
    const center: L.LatLngTuple = [
      a[1] + (b[1] - a[1]) * state.mix,
      a[0] + (b[0] - a[0]) * state.mix,
    ];
    map.setView(center, map.getZoom(), { animate: false });
    trail!.setLatLngs([
      ...localRoute
        .slice(1, state.from + 1)
        .map((point) => [point[1], point[0]] as L.LatLngTuple),
      center,
    ]);
    markers.forEach((marker, i) => {
      const distance = Math.abs(state.position - (1 + i * 2));
      const strength = Math.max(0, 1 - distance / 2);
      marker.setRadius(7 + 6 * strength * strength * (3 - 2 * strength));
    });
    caption.textContent =
      "原創地理示意 · 四站依序往返 · 主時鐘同步控制路線、標記與地圖中心";
  };
  if (route) {
    map.on("dragstart", () => {
      manual = true;
    });
    stage.addEventListener(
      "keydown",
      (event) => {
        if (
          [
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "+",
            "-",
          ].includes(event.key)
        )
          manual = true;
      },
      { signal },
    );
    button(controls, "自動展示", signal, () => {
      manual = false;
      draw(0);
    });
  }
  map.invalidateSize();
  draw(0);
  return {
    seek: draw,
    dispose: () => {
      map.remove();
      root.replaceChildren();
    },
  };
};
export default mount;
