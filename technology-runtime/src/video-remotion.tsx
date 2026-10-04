import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Player, type PlayerRef } from "@remotion/player";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import type { Mount } from "./types";
function Composition({ variant }: { variant: string }) {
  const frame = useCurrentFrame(),
    { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
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
          <div
            style={{
              fontSize: 105,
              fontWeight: 900,
              lineHeight: 0.95,
              marginTop: 65,
              letterSpacing: -7,
              transform: `translateY(${(1 - enter) * 80}px)`,
              opacity: enter,
            }}
          >
            FORM
            <br />
            FOLLOWS
            <br />
            FRAME.
          </div>
          <div
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "#f0d889",
              right: 80,
              top: 160,
              transform: `scale(${interpolate(frame, [0, 40, 90, 120], [0, 1, 1, 0.7])})`,
            }}
          />
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
