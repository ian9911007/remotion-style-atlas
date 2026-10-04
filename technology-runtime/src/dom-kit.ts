import type { RuntimeHandle } from "./types";
export const W = 960,
  H = 540;
export function surface(root: HTMLElement, css: string, html: string) {
  root.innerHTML = `<style>
  *{box-sizing:border-box}button,input{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible{outline:3px solid currentColor;outline-offset:4px}
  h1,h2,p{margin:0}svg,canvas{display:block}button{border:1px solid currentColor;background:transparent;color:inherit;padding:12px 18px;border-radius:4px} .label{font-size:15px;letter-spacing:.16em;text-transform:uppercase}.hint{position:absolute;bottom:26px;left:40px;font-size:15px}.stage{position:relative;width:960px;height:540px;overflow:hidden;padding:40px;color:var(--ink);background:var(--paper);font-family:var(--face)}
  ${css}</style><section class="stage">${html}</section>`;
  return root.querySelector<HTMLElement>(".stage")!;
}
export function svg(root: HTMLElement, content: string) {
  root.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img">${content}</svg>`;
  return root.firstElementChild as SVGSVGElement;
}
export function canvas(root: HTMLElement) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  root.append(c);
  return c;
}
export function handle(
  root: HTMLElement,
  seek: RuntimeHandle["seek"],
  dispose: () => void = () => {},
) {
  return {
    seek,
    dispose() {
      dispose();
      root.replaceChildren();
    },
  };
}
export const wave = (t: number) => (1 - Math.cos((t * Math.PI) / 2)) / 2;
