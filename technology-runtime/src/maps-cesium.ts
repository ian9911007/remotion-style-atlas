/** Created: 2026-10-04. True ellipsoid rendering; intentionally no terrain or imagery service. */
import * as C from "cesium";
import cesiumCSS from "cesium/Build/Cesium/Widgets/widgets.css?inline";
import type { Mount } from "./types";
import { shell, button } from "./data-shared";
const mount: Mount = async (root, { variant, signal }) => {
  const columns = variant === "columns";
  let manual = false,
    disposed = false,
    offset = 0;
  const { stage, controls, caption } = shell(
    root,
    columns
      ? { bg: "#e7e9e6", fg: "#29423f", accent: "#8e5c39" }
      : { bg: "#101c2d", fg: "#e7eef0", accent: "#d5b675" },
    columns ? "CESIUMJS / GEODETIC GEOMETRY" : "CESIUMJS / ELLIPSOID CAMERA",
    columns ? "地理座標中的立體資料" : "跨越曲面，理解地球尺度",
    columns
      ? "原創合成立柱 · 橢球體基準面 · 未載入地形或建築資料"
      : "原創航線示意 · WGS84 橢球 · 無衛星影像與地形服務",
  );
  const style = document.createElement("style");
  style.textContent = cesiumCSS;
  root.append(style);
  stage.style.overflow = "hidden";
  stage.style.borderRadius = "6px";
  (
    globalThis as typeof globalThis & { CESIUM_BASE_URL?: string }
  ).CESIUM_BASE_URL = `${import.meta.env.BASE_URL}technology-assets/cesium/`;
  const viewer = new C.Viewer(stage, {
    animation: false,
    timeline: false,
    baseLayerPicker: false,
    baseLayer: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    infoBox: false,
    selectionIndicator: false,
    skyBox: false,
    skyAtmosphere: false,
    terrainProvider: new C.EllipsoidTerrainProvider(),
    useDefaultRenderLoop: false,
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
    shouldAnimate: false,
    contextOptions: { webgl: { alpha: false, antialias: true } },
  });
  viewer.resolutionScale = Math.min(devicePixelRatio, 1.5) / devicePixelRatio;
  viewer.scene.backgroundColor = C.Color.fromCssColorString(
    columns ? "#dde3e1" : "#101c2d",
  );
  viewer.scene.globe.baseColor = C.Color.fromCssColorString(
    columns ? "#bdcdc4" : "#294558",
  );
  viewer.scene.globe.enableLighting = false;
  if (viewer.scene.sun) viewer.scene.sun.show = false;
  if (viewer.scene.moon) viewer.scene.moon.show = false;
  viewer.scene.fog.enabled = false;
  viewer.imageryLayers.addImageryProvider(
    new C.GridImageryProvider({
      cells: 8,
      color: C.Color.fromCssColorString(
        columns ? "#849f96" : "#57727c",
      ).withAlpha(0.55),
      glowWidth: 0,
      backgroundColor: C.Color.TRANSPARENT,
    }),
  );
  const epoch = C.JulianDate.fromIso8601("2026-01-01T00:00:00Z");
  if (columns) {
    for (let i = 0; i < 30; i++) {
      const x = 121.46 + (i % 6) * 0.015,
        y = 25.0 + Math.floor(i / 6) * 0.012,
        height = 250 + ((i * 173) % 1000);
      viewer.entities.add({
        position: C.Cartesian3.fromDegrees(x, y, height / 2),
        box: {
          dimensions: new C.Cartesian3(880, 880, height),
          material: C.Color.fromCssColorString(
            i % 3 === 0 ? "#b47547" : i % 3 === 1 ? "#537e74" : "#90a990",
          ),
          outline: true,
          outlineColor: C.Color.fromCssColorString("#eef3e9"),
        },
      });
    }
  } else {
    const nodes = [
      [121, 25],
      [139, 35],
      [103, 1],
      [77, 28],
      [151, -33],
    ];
    nodes.forEach((p, i) => {
      viewer.entities.add({
        position: C.Cartesian3.fromDegrees(p[0], p[1], 30000),
        point: {
          pixelSize: 9,
          color: C.Color.fromCssColorString("#efce88"),
          outlineWidth: 2,
          outlineColor: C.Color.fromCssColorString("#213445"),
        },
      });
      if (i) {
        const start = nodes[0];
        const positions = Array.from({ length: 49 }, (_, j) => {
          const t = j / 48;
          return C.Cartesian3.fromDegrees(
            start[0] + (p[0] - start[0]) * t,
            start[1] + (p[1] - start[1]) * t,
            Math.sin(Math.PI * t) * 1400000 + 30000,
          );
        });
        viewer.entities.add({
          polyline: {
            positions,
            width: 2.5,
            material: C.Color.fromCssColorString(i % 2 ? "#e1be71" : "#80bdb9"),
          },
        });
      }
    });
  }
  const camera = (seconds: number) => {
    if (columns) {
      viewer.camera.lookAt(
        C.Cartesian3.fromDegrees(121.497, 25.026, 0),
        new C.HeadingPitchRange(
          C.Math.toRadians(25 + seconds * 3 + offset),
          C.Math.toRadians(-35),
          18000,
        ),
      );
    } else {
      viewer.camera.setView({
        destination: C.Cartesian3.fromDegrees(
          112 + Math.sin(seconds * 0.14) * 22 + offset,
          14,
          24000000,
        ),
        orientation: { heading: 0, pitch: -C.Math.PI_OVER_TWO, roll: 0 },
      });
    }
  };
  const render = (seconds: number) => {
    if (disposed) return;
    viewer.clock.currentTime = C.JulianDate.addSeconds(
      epoch,
      seconds,
      new C.JulianDate(),
    );
    if (!manual) camera(seconds);
    viewer.resize();
    viewer.scene.requestRender();
    viewer.render();
  };
  viewer.canvas.addEventListener(
    "pointerdown",
    () => {
      manual = true;
    },
    { signal },
  );
  button(controls, "切換視角", signal, () => {
    offset = (offset + 35) % 140;
    manual = false;
    render(0);
    caption.textContent = columns
      ? "原創合成立柱 · 相機方位角已切換 · 未使用真實建築或地形"
      : "原創航線示意 · 地球曲面與高度座標 · 無地形服務";
  });
  button(controls, "重設相機", signal, () => {
    manual = false;
    offset = 0;
    render(0);
  });
  render(0);
  // Readiness renders keep the epoch fixed; they never advance an independent clock.
  try {
    let settled = false;
    for (let attempt = 0; attempt < 180; attempt++) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      await new Promise<void>((resolve) => setTimeout(resolve, 16));
      render(0);
      if (
        attempt > 3 &&
        viewer.dataSourceDisplay.ready &&
        viewer.scene.globe.tilesLoaded
      ) {
        settled = true;
        break;
      }
    }
    if (!settled)
      throw new Error(
        "Cesium geometry or local grid imagery did not become ready.",
      );
  } catch (error) {
    disposed = true;
    viewer.destroy();
    throw error;
  }
  return {
    seek: render,
    dispose: () => {
      disposed = true;
      viewer.destroy();
      root.replaceChildren();
    },
  };
};
export default mount;
