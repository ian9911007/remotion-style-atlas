let canvas: OffscreenCanvas, context: OffscreenCanvasRenderingContext2D;
self.onmessage = (
  event: MessageEvent<{ canvas?: OffscreenCanvas; time?: number }>,
) => {
  if (event.data.canvas) {
    canvas = event.data.canvas;
    context = canvas.getContext("2d")!;
    return;
  }
  const t = event.data.time ?? 0;
  context.fillStyle = "#f0ede4";
  context.fillRect(0, 0, 960, 540);
  context.fillStyle = "#183d42";
  context.font = "18px sans-serif";
  context.fillText("COMPUTATIONAL FIELD / WORKER CANVAS", 40, 50);
  for (let y = 90; y < 470; y += 12)
    for (let x = 40; x < 920; x += 12) {
      const a = Math.sin(x * 0.008 + t) + Math.cos(y * 0.011 - t);
      context.strokeStyle = a > 0 ? "#c45e3d" : "#27766b";
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9);
      context.stroke();
    }
  self.postMessage({ ready: true });
};
