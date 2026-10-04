import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { motion, MotionConfig } from "motion/react";
import type { Mount } from "./types";
import { surface } from "./dom-kit";
const mount: Mount = async (root, { variant, reducedMotion }) => {
  const stage = surface(
    root,
    `.layout{position:absolute;top:125px;left:90px;right:90px;display:flex;gap:18px}.tile{padding:28px;border:0;border-radius:18px;background:#d7e3df;color:#203a32;height:275px;overflow:hidden;text-align:left;font-size:40px;flex:1}.tile small{display:block;font-size:16px;margin-top:40px}.dragrail{position:absolute;left:90px;top:125px;width:780px;height:275px;border:1px dashed #80978c;border-radius:18px}.token{width:190px;height:220px;background:#164b42;color:#e8efe7;border:0;border-radius:18px;padding:24px;touch-action:none;position:absolute;left:290px;top:25px;cursor:grab}.token strong{font-size:60px}.token small{font-size:16px;display:block;margin-top:30px}`,
    `<div class="label">INTERFACE / ${variant === "layout" ? "SHARED SPACE" : "DIRECT MANIPULATION"}</div><div id="react-root"></div><p class="hint">${variant === "layout" ? "點選任一卡片切換焦點；鍵盤 Tab 與 Enter 可操作" : "拖曳卡片或按方向鍵；放開後以彈簧回正"}</p>`,
  );
  const reactRoot = createRoot(stage.querySelector("#react-root")!);
  let change: (t: number) => void = () => {};
  function Demo() {
    const [active, setActive] = useState(0);
    const [x, setX] = useState(0);
    change = (t) => {
      if (variant === "layout") setActive(Math.floor(t / 1.5) % 3);
    };
    return (
      <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
        {variant === "layout" ? (
          <div className="layout">
            {["Focus", "Shape", "Flow"].map((label, i) => (
              <motion.button
                layout
                key={label}
                className="tile"
                onClick={() => setActive(i)}
                style={{
                  flex: active === i ? 2 : 1,
                  background: active === i ? "#164b42" : "#d7e3df",
                  color: active === i ? "#e8efe7" : "#203a32",
                }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
              >
                <span>{label}</span>
                <small>
                  {active === i
                    ? "A space that responds to its content."
                    : "0" + (i + 1)}
                </small>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="dragrail">
            <motion.button
              className="token"
              drag="x"
              dragConstraints={{ left: -260, right: 260 }}
              dragElastic={0.2}
              dragSnapToOrigin
              animate={{ x }}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") setX(Math.max(-260, x - 80));
                if (e.key === "ArrowRight") setX(Math.min(260, x + 80));
              }}
              whileTap={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              aria-label="可拖曳卡片，左右方向鍵移動"
            >
              <strong>↔</strong>
              <small>
                MOVE
                <br />
                WITH INTENT
              </small>
            </motion.button>
          </div>
        )}
      </MotionConfig>
    );
  }
  flushSync(() => reactRoot.render(<Demo />));
  let last = -1;
  return {
    seek(t) {
      const n = Math.floor(t / 1.5);
      if (n !== last) {
        last = n;
        change(t);
      }
    },
    dispose() {
      reactRoot.unmount();
      root.replaceChildren();
    },
  };
};
export default mount;
