import { EditableTimeEvents } from "@motion-canvas/core/lib/scenes/timeEvents/EditableTimeEvents";
import {
  PlaybackManager,
  PlaybackStatus,
  PlaybackState,
  Stage,
  Logger,
  SharedWebGLContext,
  Vector2,
  all,
  waitFor,
  type FullSceneDescription,
  type ThreadGenerator,
} from "@motion-canvas/core";
import {
  makeScene2D,
  Rect,
  Txt,
  Line,
  Circle,
  Scene2D,
  type View2D,
} from "@motion-canvas/2d";
import type { Mount } from "./types";
const mount: Mount = async (root, { variant }) => {
  const description = makeScene2D(function* (view: View2D): ThreadGenerator {
    view.fill("#eee9df");
    const heading = new Txt({
      text:
        variant === "diagram"
          ? "A REQUEST / THREE STAGES"
          : "SIGNAL / SAMPLE AND RECONSTRUCT",
      fontSize: 22,
      fontFamily: "sans-serif",
      fill: "#263c38",
      position: [0, -205],
    });
    view.add(heading);
    if (variant === "diagram") {
      const nodes = [-300, 0, 300].map(
        (x, i) =>
          new Rect({
            position: [x, 0],
            width: 190,
            height: 140,
            radius: 12,
            fill: ["#b8543d", "#28574d", "#b5a878"][i],
            opacity: 0,
          }),
      );
      nodes.forEach((n, i) => {
        n.add(
          new Txt({
            text: ["REQUEST", "COMPUTE", "RESPONSE"][i],
            fontSize: 22,
            fontFamily: "sans-serif",
            fill: "#fff",
          }),
        );
        view.add(n);
      });
      const links = [-200, 100].map(
        (x) =>
          new Line({
            points: [
              [x, 0],
              [x + 100, 0],
            ],
            stroke: "#28574d",
            lineWidth: 4,
            endArrow: true,
            end: 0,
          }),
      );
      links.forEach((l) => view.add(l));
      yield* nodes[0].opacity(1, 0.5);
      yield* links[0].end(1, 0.5);
      yield* nodes[1].opacity(1, 0.5);
      yield* links[1].end(1, 0.5);
      yield* nodes[2].opacity(1, 0.5);
      yield* waitFor(1);
      yield* all(...nodes.map((n) => n.scale(0.85, 0.5)));
    } else {
      const pts = Array.from(
        { length: 80 },
        (_, i) => new Vector2(-380 + i * 9.6, Math.sin(i * 0.16) * 110),
      );
      const line = new Line({
        points: pts,
        stroke: "#205f55",
        lineWidth: 5,
        end: 0,
      });
      view.add(line);
      const samples = pts
        .filter((_, i) => i % 8 === 0)
        .map(
          (p) =>
            new Circle({ position: p, size: 17, fill: "#c95a3f", opacity: 0 }),
        );
      samples.forEach((n) => view.add(n));
      const label = new Txt({
        text: "continuous → sampled",
        fontSize: 25,
        fontFamily: "sans-serif",
        fill: "#263c38",
        position: [0, 175],
      });
      view.add(label);
      yield* line.end(1, 1.5);
      yield* all(...samples.map((n) => n.opacity(1, 0.7)));
      yield* line.opacity(0.25, 0.6);
      yield* waitFor(1.2);
    }
  });
  const manager = new PlaybackManager();
  manager.fps = 30;
  manager.state = PlaybackState.Rendering;
  const logger = new Logger(),
    webgl = new SharedWebGLContext(logger);
  const scene = new Scene2D({
    ...description,
    name: `atlas-${variant}`,
    size: new Vector2(960, 540),
    resolutionScale: 1,
    playback: new PlaybackStatus(manager),
    logger,
    timeEventsClass: EditableTimeEvents,
    sharedWebGLContext: webgl,
  } as unknown as FullSceneDescription<(view: View2D) => ThreadGenerator>);
  manager.setup([scene]);
  await manager.recalculate();
  await manager.reset();
  const stage = new Stage();
  stage.configure({
    size: new Vector2(960, 540),
    resolutionScale: 1,
    background: "#eee9df",
  });
  root.append(stage.finalBuffer);
  return {
    async seek(seconds) {
      await manager.seek(Math.round(seconds * 30));
      await stage.render(manager.currentScene, manager.previousScene);
    },
    dispose() {
      scene.getView().dispose();
      webgl.dispose();
      stage.finalBuffer.width = 1;
      stage.finalBuffer.height = 1;
      root.replaceChildren();
    },
  };
};
export default mount;
