/** Created: 2026-10-04. Real Rive state-machine playback under the Atlas clock. */
import { RuntimeLoader } from "@rive-app/canvas";
import type {
  Artboard,
  File,
  SMIInput,
  StateMachineInstance,
  WrappedRenderer,
} from "@rive-app/canvas/rive_advanced.mjs";
import wasmUrl from "@rive-app/canvas/rive.wasm?url";
import type { Mount } from "./types";
import { surface } from "./dom-kit";

const mount: Mount = async (root, { reducedMotion, signal }) => {
  const stage = surface(
    root,
    `
    .stage{background:#f0f0f0;color:#282d31;font-family:Arial,sans-serif}
    .label{color:#68727a}.art{position:absolute;right:34px;top:72px;width:408px;height:408px}
    .copy{position:absolute;top:134px;left:40px;width:410px}.copy h1{font-size:47px;line-height:1.1;letter-spacing:-.045em}
    .copy p{margin:22px 0;color:#5d6266;font-size:18px;line-height:1.6;max-width:350px}
    .input{display:inline-flex;gap:10px;align-items:center;background:#fff;padding:10px 14px;font:15px monospace;border:1px solid #d9dddd}
    .input b{color:#ba484a}.control{display:block;margin-top:24px;border-radius:22px;background:#282d31;color:#fff;border:none;padding:12px 22px}
    .reset{margin-left:12px;border:0;font-size:14px;padding:8px 0;color:#4d5357;text-decoration:underline}
    .credit{position:absolute;right:36px;bottom:20px;font-size:11px;line-height:1.6;color:#666;width:410px;text-align:right}
    .credit a{color:inherit}.hint{bottom:24px;max-width:400px;font-size:12px;color:#5d6266}
  `,
    `<div class="label">RIVE / REAL STATE MACHINE</div>
    <div class="copy"><h1>同一個素材，<br>輸入決定狀態。</h1>
    <p>切換布林輸入，觀察 .riv 內實際狀態機改變按鈕的形狀。</p>
    <span class="input">Boolean 1 <b aria-live="polite">true</b></span>
    <button class="control" type="button" aria-pressed="true">切換素材輸入</button>
    <button class="reset" type="button">回到自動展示</button></div>
    <canvas class="art" width="500" height="500" role="img" aria-label="Rive 素材：由布林值控制的立體按鈕"></canvas>
    <p class="hint">滑鼠、觸控或鍵盤啟動按鈕 · 狀態文字同步更新</p>
    <p class="credit">“put it anywhere” by kikkojinji1 · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a><br>原始 .riv 未修改 · <a href="https://www.rive.app/marketplace/27860-52644-put-it-anywhere/" target="_blank" rel="noreferrer">素材來源</a></p>`,
  );
  const inputLabel = stage.querySelector<HTMLElement>(".input b")!;
  const button = stage.querySelector<HTMLButtonElement>(".control")!;
  const canvas = stage.querySelector<HTMLCanvasElement>("canvas")!;
  const events = new AbortController();
  let disposed = false;
  let file: File | undefined;
  let board: Artboard | undefined;
  let machine: StateMachineInstance | undefined;
  let renderer: WrappedRenderer | undefined;
  let input: SMIInput | undefined;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    events.abort();
    signal.removeEventListener("abort", dispose);
    machine?.delete();
    machine = undefined;
    board?.delete();
    board = undefined;
    renderer?.delete();
    renderer = undefined;
    file?.unref();
    file = undefined;
    root.replaceChildren();
  };
  signal.addEventListener("abort", dispose, { once: true });
  try {
    signal.throwIfAborted();
    RuntimeLoader.setWasmUrl(wasmUrl);
    RuntimeLoader.setWasmFallbackUrl(null);
    const [runtime, bytes] = await Promise.all([
      RuntimeLoader.awaitInstance(),
      fetch(
        `${import.meta.env.BASE_URL}technology-assets/rive/put-it-anywhere.riv`,
        { signal },
      ).then((response) => {
        if (!response.ok) throw new Error(`Rive asset HTTP ${response.status}`);
        return response.arrayBuffer();
      }),
    ]);
    signal.throwIfAborted();
    const loadedFile = await runtime.load(
      new Uint8Array(bytes),
      undefined,
      false,
    );
    if (disposed || signal.aborted) {
      loadedFile.unref();
      throw new DOMException("Aborted", "AbortError");
    }
    file = loadedFile;
    renderer = runtime.makeRenderer(canvas);
    let previousFrame = 0,
      lastTime = 0,
      override: boolean | null = null,
      currentInput = true;
    const reset = () => {
      machine?.delete();
      board?.delete();
      board = file!.artboardByName("Artboard");
      if (!board) throw new Error("Rive asset is missing Artboard");
      const definition = board.stateMachineByName("State Machine 1");
      if (!definition) throw new Error("Rive asset is missing State Machine 1");
      machine = new runtime.StateMachineInstance(definition, board);
      input = undefined;
      for (let i = 0; i < machine.inputCount(); i++) {
        const candidate = machine.input(i);
        if (candidate.name === "Boolean 1" && candidate.type === 59)
          input = candidate.asBool();
      }
      if (!input)
        throw new Error("Rive asset is missing the Boolean 1 boolean input");
      previousFrame = 0;
      machine.advance(0);
      board.advance(0);
    };
    const paint = () => {
      renderer!.clear();
      renderer!.save();
      renderer!.align(
        runtime.Fit.contain,
        runtime.Alignment.center,
        { minX: 0, minY: 0, maxX: 500, maxY: 500 },
        board!.bounds,
      );
      board!.draw(renderer!);
      renderer!.restore();
      runtime.resolveAnimationFrame();
      inputLabel.textContent = String(currentInput);
      button.setAttribute("aria-pressed", String(currentInput));
    };
    const seek = (time: number) => {
      if (disposed) return;
      lastTime = time;
      const frame = Math.round(
        (reducedMotion ? 1 : Math.max(0, Math.min(8, time))) * 60,
      );
      if (frame < previousFrame) reset();
      for (let i = previousFrame; i < frame; i++) {
        currentInput = override ?? Math.floor(i / 120) % 2 === 0;
        input!.value = currentInput;
        machine!.advance(1 / 60);
        board!.advance(1 / 60);
      }
      previousFrame = frame;
      currentInput = override ?? Math.floor(frame / 120) % 2 === 0;
      input!.value = currentInput;
      machine!.advance(0);
      board!.advance(0);
      paint();
    };
    reset();
    seek(0);
    button.addEventListener(
      "click",
      () => {
        override = !currentInput;
        reset();
        seek(Math.max(lastTime, 1));
      },
      { signal: events.signal },
    );
    stage.querySelector(".reset")!.addEventListener(
      "click",
      () => {
        override = null;
        reset();
        seek(lastTime);
      },
      { signal: events.signal },
    );
    return { seek, pause() {}, resume() {}, dispose }; // No independent ticker: the host alone advances Rive.
  } catch (error) {
    dispose();
    throw error;
  }
};
export default mount;
