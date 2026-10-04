import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Player, type PlayerRef } from "@remotion/player";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { Mount } from "./types";
function Composition({ variant }: { variant: string }) {
  const frame = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: variant === "editorial" ? "#d9472d" : "#e7ede6",
        color: variant === "editorial" ? "#fff2dd" : "#243c35",
        fontFamily: "Arial, sans-serif",
        padding: 45,
      }}
    >
      <div style={{ fontSize: 19, letterSpacing: 3 }}>
        FRAME /{" "}
        {variant === "editorial" ? "EDITORIAL SEQUENCE" : "DATA COMPOSITION"}
      </div>
      {variant === "editorial" ? (
        <>
          {(["FORM", "FOLLOWS", "FRAME."] as const).map((word, i) => {
            const progress = (frame / 120) * 3;
            const local = Math.max(0, Math.min(1, progress - i));
            const amount = Math.sin(local * Math.PI) ** 2;
            return (
              <div
                key={word}
                style={{
                  position: "absolute",
                  left: 46,
                  top: 112 + i * 112,
                  display: "flex",
                  alignItems: "baseline",
                  gap: 24,
                  fontSize: 105,
                  fontWeight: 900,
                  lineHeight: 0.95,
                  letterSpacing: -7,
                  transform: `translateX(${amount * 18}px)`,
                  opacity: 0.82 + amount * 0.18,
                }}
              >
                <span>{word}</span>
                <span
                  style={{
                    display: "inline-block",
                    width: 150 * amount,
                    height: 7,
                    marginLeft: -12,
                    background: "#f0d889",
                  }}
                />
              </div>
            );
          })}
        </>
      ) : (
        <>
          {[0.65, 0.42, 0.82, 0.58].map((n, i) => {
            const h =
              n *
              280 *
              spring({ frame: frame - i * 9, fps, config: { damping: 200 } });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 125 + i * 180,
                  bottom: 95,
                  width: 115,
                  height: h,
                  background: i === 2 ? "#b84e32" : "#2d6b5b",
                }}
              >
                <span style={{ position: "absolute", top: -37, fontSize: 27 }}>
                  {Math.round(n * 100)}
                </span>
                <span
                  style={{ position: "absolute", bottom: -35, fontSize: 19 }}
                >
                  GROUP {i + 1}
                </span>
              </div>
            );
          })}
        </>
      )}
    </AbsoluteFill>
  );
}
const mount: Mount = async (root, { variant }) => {
  const react = createRoot(root);
  const ref = React.createRef<PlayerRef>();
  flushSync(() =>
    react.render(
      <Player
        ref={ref}
        component={Composition}
        inputProps={{ variant }}
        compositionWidth={960}
        compositionHeight={540}
        durationInFrames={120}
        fps={30}
        controls={false}
        autoPlay={false}
        style={{ width: 960, height: 540 }}
      />,
    ),
  );
  return {
    seek(t) {
      flushSync(() => ref.current?.seekTo(Math.min(119, Math.round(t * 30))));
    },
    dispose() {
      ref.current?.pause();
      react.unmount();
      root.replaceChildren();
    },
  };
};
export default mount;
