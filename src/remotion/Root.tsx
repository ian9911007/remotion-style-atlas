import React from "react";
import {
  AbsoluteFill,
  Composition,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import catalog from "../catalog/styles.json";
import { type StyleSpec } from "../catalog/schema";
import { recipeRegistry } from "./recipes";

type AtlasProps = { style: StyleSpec };
export const AtlasPreview: React.FC<AtlasProps> = ({ style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();
  const Recipe = recipeRegistry[style.recipe];
  if (!Recipe) throw new Error(`Unknown trusted recipe: ${style.recipe}`);
  return (
    <AbsoluteFill
      style={{ background: style.palette.background, overflow: "hidden" }}
    >
      <div
        style={{
          width: 1280,
          height: 720,
          transform: `scale(${width / 1280})`,
          transformOrigin: "top left",
          position: "absolute",
        }}
      >
        <Recipe
          style={style}
          frame={frame}
          progress={frame / durationInFrames}
          duration={durationInFrames}
        />
      </div>
    </AbsoluteFill>
  );
};
// Catalog previews are instances of one intentional, data-controlled authoring template.
export const RemotionRoot = () => (
  <>
    {(catalog as StyleSpec[])
      .filter(
        (s) =>
          recipeRegistry[s.recipe] &&
          !["draft", "reference-only"].includes(s.status),
      )
      .flatMap((style) => [
        <Composition
          key={`${style.id}-gallery`}
          id={`${style.id}-gallery`}
          component={AtlasPreview}
          width={480}
          height={270}
          fps={30}
          durationInFrames={Math.round(style.preview.galleryDuration * 30)}
          defaultProps={{ style }}
        />,
        <Composition
          key={`${style.id}-detail`}
          id={`${style.id}-detail`}
          component={AtlasPreview}
          width={1280}
          height={720}
          fps={30}
          durationInFrames={Math.round(style.preview.detailDuration * 30)}
          defaultProps={{ style }}
        />,
      ])}
  </>
);
