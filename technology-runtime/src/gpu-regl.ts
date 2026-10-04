/** Created: 2026-10-04. Original GLSL, driven only through the host time uniform. */
import createREGL from "regl";
import type { Mount } from "./types";
import { stage, lifecycle, W, H } from "./gpu-common";
const mount: Mount = async (root, options) => {
  const interference = options.variant === "interference";
  const surface = stage(
    root,
    interference ? "PHASE INTERFERENCE" : "CHROMATIC FLOW",
    interference
      ? "雙源波紋 · 相位疊加 · 科學視覺化"
      : "片段著色器 · 程序式色場 · 無圖片材質",
    interference ? "#e7eadf" : "#282142",
    interference ? "#1d4038" : "#ffeddb",
  );
  const heading = root.lastElementChild as HTMLElement;
  Object.assign(heading.style, {
    padding: "14px 18px",
    left: "20px",
    top: "16px",
    borderRadius: "8px",
    background: interference ? "#e7eadfee" : "#282142d9",
  });
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  canvas.setAttribute(
    "aria-label",
    interference ? "雙點波源的干涉條紋" : "暖色與紫色交疊的流體狀程序式色場",
  );
  surface.append(canvas);
  const regl = createREGL({
    canvas,
    pixelRatio: 1,
    attributes: { antialias: false, preserveDrawingBuffer: true },
  });
  let time = 0;
  const draw = regl({
    vert: "precision mediump float; attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0,1);}",
    frag: interference
      ? `precision highp float; varying vec2 uv; uniform float time;
      void main(){vec2 p=(uv-.5)*vec2(1.7778,1.); float a=length(p-vec2(-.25,0.)),b=length(p-vec2(.25,0.));
      float wave=sin(a*70.-time*3.)+sin(b*70.-time*3.); float bands=smoothstep(-.12,.12,wave);
      vec3 color=mix(vec3(.13,.36,.31),vec3(.91,.93,.84),bands);float spots=min(a,b);color=mix(vec3(.89,.43,.17),color,smoothstep(.015,.025,spots));
      gl_FragColor=vec4(color,1.);}`
      : `precision highp float; varying vec2 uv; uniform float time;
      void main(){vec2 p=uv*3.;for(int i=1;i<5;i++){float f=float(i);p+=vec2(sin(p.y*f+time*.35),cos(p.x*f-time*.27))*.17;}
      float v=sin(p.x*2.+p.y*2.5+time*.3);vec3 c=mix(vec3(.18,.14,.31),vec3(.95,.47,.27),v*.5+.5);
      float ribbon=smoothstep(.65,.9,sin(p.x*5.-p.y*2.));c=mix(c,vec3(.98,.8,.57),ribbon*.8);gl_FragColor=vec4(c,1.);}`,
    attributes: {
      position: [
        [-1, -1],
        [3, -1],
        [-1, 3],
      ],
    },
    uniforms: { time: () => time },
    count: 3,
    depth: { enable: false },
  });
  const seek = (seconds: number) => {
    time = seconds;
    regl.poll();
    draw();
  };
  seek(0);
  return lifecycle(options, seek, () => {
    regl.destroy();
    canvas
      .getContext("webgl")
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext();
    canvas.remove();
  });
};
export default mount;
