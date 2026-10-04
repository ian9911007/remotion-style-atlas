/** Created: 2026-10-05. Seekable Three.js shader studies for material-led forces. */
import * as THREE from "three";
import type { Mount } from "./types";
import { physicsElementScenes } from "./physics-element-scenes";
import { phase } from "./gpu-common";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uVariant;
  uniform vec3 uBackground;
  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform vec3 uGlow;
  uniform vec3 uImpulse;

  const float TAU = 6.28318530718;
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise2(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise2(p);
      p = mat2(1.62, 1.18, -1.18, 1.62) * p + 7.1;
      a *= 0.5;
    }
    return v;
  }
  float segmentDistance(vec2 p, vec2 a, vec2 b) {
    vec2 ab = b - a;
    float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.00001), 0.0, 1.0);
    return length(p - (a + t * ab));
  }
  float impulseRing(vec2 p, float age) {
    if (uImpulse.z < 0.0) return 0.0;
    float d = distance(p, uImpulse.xy);
    float radius = max(0.0, age) * 0.27;
    float ring = exp(-abs(d - radius) * 70.0) * exp(-max(0.0, age) * 2.5);
    return ring * step(0.0, age) * step(age, 1.25);
  }
  void main() {
    vec2 uv = vUv;
    vec2 p = vec2((uv.x - 0.5) * 1.77778, 0.5 - uv.y);
    float cycle = fract(uTime / 8.0);
    float turn = cycle * TAU;
    float n = fbm(p * 4.0 + vec2(sin(turn), cos(turn)) * 0.8);
    vec3 color = uBackground;
    float light = 0.0;

    if (uVariant < 0.5) {
      // Fire: distinct tapered tongues, incandescent cores and a grounded burner bed.
      // Three's plane UV is vertically inverted relative to the CSS screenshot:
      // uv.y near zero is the bottom edge, so combustion starts there and rises.
      float h = uv.y - 0.035;
      float drift = 0.5 + 0.014 * sin(turn) + 0.009 * sin(turn * 2.0 + 1.1);
      float alphaSum = 0.0;
      vec3 fireColor = vec3(0.0);
      float hotCore = 0.0;
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float seed = hash21(vec2(fi, 7.0));
        float height = i == 0 ? 0.54 : (i == 1 ? 0.78 : 0.46);
        float along = h / height;
        float activeHeight = step(0.0, h) * (1.0 - step(1.0, along));
        float q = clamp(along, 0.0, 1.0);
        float baseX = i == 0 ? 0.425 : (i == 1 ? 0.505 : 0.585);
        float flow = fbm(vec2(q * 4.4 - cycle * 1.4 + fi * 3.0, seed * 8.0 + fi));
        float center = baseX + (drift - 0.5) * (0.62 + q)
          + sin(q * (4.3 + seed * 1.3) + turn * (0.34 + seed * 0.18) + fi * 1.7) * (0.012 + q * 0.042)
          + (flow - 0.5) * 0.034 * q;
        float lobe = i == 1 ? 1.0 : 0.78;
        float halfWidth = (0.013 + 0.067 * pow(1.0 - q, 0.7)) * lobe
          * (0.76 + 0.24 * sin(q * 6.2 + fi * 1.9 + turn * 0.38)) + 0.0014;
        float across = abs(uv.x - center) / halfWidth;
        float edge = 1.0 - smoothstep(0.82, 1.24, across);
        float tongues = edge * activeHeight;
        float core = (1.0 - smoothstep(0.06, 0.56, across)) * tongues;
        float inner = (1.0 - smoothstep(0.0, 0.34, across)) * activeHeight;
        float striation = fbm(vec2(across * 2.8 + fi * 1.1, q * 8.0 - cycle * 2.0));
        vec3 tongueColor = mix(vec3(0.16, 0.012, 0.005), vec3(0.92, 0.13, 0.012),
          smoothstep(0.08, 0.8, q) * (0.78 + striation * 0.18));
        tongueColor = mix(tongueColor, vec3(1.0, 0.39, 0.035), core * 0.74);
        tongueColor = mix(tongueColor, uGlow, inner * (0.48 + striation * 0.32));
        fireColor += tongueColor * tongues * (0.68 + striation * 0.24);
        alphaSum += tongues * 0.58;
        hotCore = max(hotCore, max(core, inner * 0.72));
      }
      float plume = clamp(alphaSum, 0.0, 0.96);
      color = mix(color, fireColor / max(alphaSum, 0.001), plume);
      // Reflected heat sits below the separated tongues instead of becoming a broad blob.
      float source = exp(-pow((uv.y - 0.06) * 42.0, 2.0))
        * exp(-pow((uv.x - drift) * 8.0, 2.0));
      float bed = exp(-pow((uv.y - 0.066) * 24.0, 2.0))
        * exp(-pow((uv.x - drift) * 2.6, 2.0));
      color += uAccent * bed * 0.22 + uGlow * source * 0.72;
      // Seeded, subpixel ember discs replace the square grid sparkles.
      for (int i = 0; i < 28; i++) {
        float fi = float(i);
        float seed = hash21(vec2(fi, 17.0));
        float age = fract(cycle * 1.8 + seed);
        float side = hash21(vec2(fi, 29.0)) - 0.5;
        float ex = drift + side * (0.04 + age * 0.31) + sin(age * 11.0 + fi) * age * 0.045;
        float ey = 0.08 + age * (0.58 + seed * 0.27);
        float radius = mix(0.0009, 0.0034, seed) * (1.0 - age * 0.58);
        float d = distance(uv, vec2(ex, ey));
        float ember = exp(-pow(d / radius, 2.0));
        float halo = exp(-d / (radius * 5.5));
        float fade = smoothstep(0.0, 0.08, age) * (1.0 - smoothstep(0.82, 1.0, age));
        color += (uGlow * ember + uAccent * halo * 0.11) * fade;
      }
      light = plume * 0.32 + hotCore * 0.54 + source * 0.3;
    } else if (uVariant < 1.5) {
      // Smoke: a narrow ignition stem opens into a wind-bent, layered plume.
      float rise = clamp((uv.y - 0.055) / 0.88, 0.0, 1.0);
      float broad = fbm(vec2((uv.x - 0.5) * 5.2 + sin(uv.y * 5.2 - turn * 0.28) * 0.32, uv.y * 3.8 - cycle * 1.05));
      float detail = fbm(vec2((uv.x - 0.5) * 12.0 + sin(uv.y * 9.0 + turn * 0.37) * 0.22, uv.y * 8.0 - cycle * 2.2));
      float fine = fbm(vec2((uv.x - 0.5) * 24.0 + sin(uv.y * 15.0 - turn * 0.49) * 0.12, uv.y * 14.0 - cycle * 3.25));
      vec2 vortexDelta = (uv - vec2(0.52 + 0.055 * sin(turn * 0.19), 0.58 + 0.035 * sin(turn * 0.31))) * vec2(0.86, 1.18);
      float vortexRadius = length(vortexDelta);
      float vortexAngle = atan(vortexDelta.y, vortexDelta.x);
      float spiralPhase = vortexAngle * 1.65 - vortexRadius * 23.0 - turn * 0.48;
      float spiralRidge = smoothstep(0.58, 0.94, 0.5 + 0.5 * sin(spiralPhase));
      float curlEnvelope = exp(-pow((vortexRadius - 0.235) * 5.2, 2.0));
      float curlFilament = spiralRidge * curlEnvelope;
      float center = 0.5 + 0.056 * sin(rise * 5.1 - turn * 0.28)
        + 0.047 * sin(rise * 9.0 + turn * 0.21) + (broad - 0.5) * rise * 0.2
        + 0.075 * sin(spiralPhase) * curlEnvelope;
      float width = 0.035 + 0.215 * pow(rise, 0.92) + curlFilament * 0.042;
      float side = abs(uv.x - center);
      float lobeWarp = 1.0 + (broad - 0.5) * 0.84 + (detail - 0.5) * 0.44;
      float silhouette = 1.0 - smoothstep(width * lobeWarp * 0.72, width * lobeWarp, side);
      float crown = 1.0 - smoothstep(0.84, 0.99, uv.y);
      float baseFade = smoothstep(0.045, 0.15, uv.y);
      float curls = 0.5 + 0.5 * sin(rise * 19.0 + broad * 9.0 - turn * 0.56 + sin(uv.x * 13.0) * 1.4 + spiralPhase * 0.72);
      float folds = smoothstep(0.20, 0.8, detail * 0.56 + fine * 0.24 + curls * 0.20);
      float density = silhouette * crown * baseFade * (0.58 + folds * 0.34 + curlFilament * 0.16);
      float edge = (1.0 - smoothstep(0.18, 0.72, side / max(width * lobeWarp, 0.001))) * silhouette;
      float rim = smoothstep(0.08, 0.28, density) * (1.0 - smoothstep(0.48, 0.92, density));
      float internalLight = smoothstep(0.64, 0.96, fine) * density;
      float warmFoot = exp(-pow((uv.y - 0.09) * 19.0, 2.0)) * exp(-pow((uv.x - 0.5) * 5.4, 2.0));
      vec3 smokeColor = mix(vec3(0.055, 0.075, 0.095), vec3(0.31, 0.36, 0.4), broad * 0.64 + detail * 0.3);
      smokeColor = mix(smokeColor, vec3(0.49, 0.52, 0.52), internalLight * 0.24);
      smokeColor = mix(smokeColor, uAccent * 0.66, (1.0 - rise) * 0.24);
      color = mix(color, smokeColor, density * 0.9);
      color += uGlow * rim * (0.055 + folds * 0.065) * edge;
      color += mix(vec3(0.2, 0.23, 0.26), uAccent * 0.55, 0.4) * curlFilament * silhouette * 0.20;
      color += uAccent * warmFoot * 0.18;
      light = density * 0.3 + rim * 0.12 + warmFoot * 0.14;
    } else if (uVariant < 2.5) {
      // Water impact: a glossy pool, a broken crown, droplets and concentric rings.
      float surface = 0.70 + 0.016 * sin(uv.x * 17.0 + turn) + (n - 0.5) * 0.014;
      float pool = 1.0 - smoothstep(surface - 0.012, surface + 0.012, uv.y);
      float radius = 0.10 + 0.075 * (0.5 - 0.5 * cos(turn));
      float r = length(vec2((uv.x - 0.5) * 1.4, (uv.y - 0.31) * 1.8));
      float crown = exp(-abs(r - radius - 0.012 * sin(atan(p.y, p.x) * 11.0 + turn)) * 100.0);
      float rings = exp(-abs(r - (0.19 + 0.035 * sin(turn)) - 0.055 * sin(turn * 2.0)) * 48.0);
      float droplets = 0.0;
      for (int i = 0; i < 18; i++) {
        float fi = float(i);
        float a = hash21(vec2(fi, 2.0)) * TAU;
        float launch = 0.25 + 0.5 * (0.5 + 0.5 * sin(turn + fi * 1.7));
        vec2 d = vec2(0.5 + cos(a) * launch * 0.27, 0.31 + sin(a) * launch * 0.25 - launch * launch * 0.15);
        droplets += exp(-dot((uv - d) * vec2(1.0, 1.35), (uv - d) * vec2(1.0, 1.35)) * 9000.0);
      }
      color = mix(color, uAccent * 0.22, pool * 0.88);
      color += uAccent * crown * 0.68 + uGlow * rings * 0.31 + uGlow * droplets * 0.75;
      light = crown * 0.25 + rings * 0.1;
    } else if (uVariant < 3.5) {
      // A top-down-screen, downward leader grows into a branching return stroke.
      // The two strikes have deliberate quiet gaps, but both occur in each loop.
      float cloudA = fbm(uv * vec2(3.2, 2.4) + vec2(cos(turn), sin(turn)) * 0.18);
      float cloudB = fbm(uv * vec2(7.4, 5.0) - vec2(cycle * 1.1, cycle * 0.5));
      float cloudC = fbm(uv * vec2(13.0, 7.2) + vec2(cycle * 0.75, -cycle * 0.3));
      float cloud = smoothstep(0.30, 0.76, cloudA * 0.62 + cloudB * 0.30 + cloudC * 0.16);
      vec3 storm = mix(uBackground * 0.32, uInk * 0.32, cloud * 0.68);
      storm = mix(storm, vec3(0.14, 0.19, 0.29), cloud * 0.55);
      color = mix(color, storm, 0.88);
      float flashA = exp(-pow((cycle - 0.265) / 0.075, 2.0));
      float flashB = exp(-pow((cycle - 0.735) / 0.065, 2.0)) * 0.76;
      float flash = max(flashA, flashB);
      float glowField = fbm(uv * vec2(5.4, 3.2) + vec2(cycle * 0.5, -cycle * 0.8));
      float trunk = 0.0;
      float trunkCore = 0.0;
      for (int i = 0; i < 22; i++) {
        float a = float(i) / 22.0;
        float b = float(i + 1) / 22.0;
        float y0 = 0.94 - a * 0.84;
        float y1 = 0.94 - b * 0.84;
        float j0 = fbm(vec2(a * 17.0 + 2.4, 5.1)) - 0.5;
        float j1 = fbm(vec2(b * 17.0 + 2.4, 5.1)) - 0.5;
        float x0 = 0.515 + j0 * 0.19 + sin(a * 25.0 + turn * 0.3) * 0.012;
        float x1 = 0.515 + j1 * 0.19 + sin(b * 25.0 + turn * 0.3) * 0.012;
        vec2 p0 = vec2(x0, y0);
        vec2 p1 = vec2(x1, y1);
        float d = segmentDistance(uv, p0, p1);
        trunk += exp(-d * 210.0);
        trunkCore += exp(-d * 1080.0);
      }
      float branches = 0.0;
      float branchCore = 0.0;
      for (int i = 0; i < 13; i++) {
        float k = float(i);
        float by = 0.83 - k * 0.052;
        float side = mod(k, 2.0) < 1.0 ? -1.0 : 1.0;
        float bx = 0.515 + (fbm(vec2((0.94 - by) * 17.0 + 2.4, 5.1)) - 0.5) * 0.19;
        float reach = 0.052 + hash21(vec2(k, 4.0)) * 0.125;
        vec2 start = vec2(bx, by);
        vec2 elbow = start + vec2(side * reach * 0.52, -0.028);
        vec2 tip = start + vec2(side * reach, -0.065 - hash21(vec2(k, 6.0)) * 0.055);
        float d1 = segmentDistance(uv, start, elbow);
        float d2 = segmentDistance(uv, elbow, tip);
        branches += exp(-d1 * 210.0) + exp(-d2 * 250.0) * 0.78;
        branchCore += exp(-d1 * 900.0) + exp(-d2 * 920.0) * 0.7;
        // Secondary twigs are sparse and shorter toward the strike's end.
        if (mod(k, 3.0) < 1.0) {
          vec2 forkTip = elbow + vec2(-side * reach * 0.28, -0.052);
          float df = segmentDistance(uv, elbow, forkTip);
          branches += exp(-df * 270.0) * 0.5;
          branchCore += exp(-df * 880.0) * 0.38;
        }
      }
      float arc = clamp(trunk + branches * 0.78, 0.0, 1.4);
      float core = clamp(trunkCore + branchCore * 0.8, 0.0, 1.2);
      float afterglow = max(flash, 0.08 + 0.12 * glowField);
      float cloudExposure = cloud * flash * (0.24 + 0.66 * glowField);
      color += vec3(0.42, 0.57, 0.86) * cloudExposure * 1.2;
      color += uAccent * arc * afterglow * 0.66;
      color += vec3(0.48, 0.66, 1.0) * arc * afterglow * 0.8;
      color += vec3(0.92, 0.97, 1.0) * core * afterglow * 1.85;
      color += uGlow * cloud * flash * 0.2;
      light = flash * 0.58 + arc * afterglow * 0.62 + cloudExposure * 0.2;
    } else if (uVariant < 4.5) {
      // A meandering lava tongue advances downslope; its crust plates split
      // around a bright, connected molten core and a visible active front.
      vec2 driftUv = uv + vec2(-cycle * 0.025, cycle * 0.36);
      float terrain = fbm(uv * vec2(4.2, 2.4) + vec2(1.8, -0.5));
      // A volcanic ridge has a visible crest; the channel descends diagonally
      // from its vent and narrows toward the source instead of filling the frame.
      float ridge = 0.97 - 0.82 * abs(uv.x - 0.38) + (terrain - 0.5) * 0.06;
      float mountain = 1.0 - smoothstep(ridge - 0.012, ridge + 0.012, uv.y);
      float meander = 0.39 + (1.0 - uv.y) * 0.255
        + 0.026 * sin(uv.y * 8.1 + 0.4) + (terrain - 0.5) * 0.055;
      float width = 0.028 + (1.0 - uv.y) * 0.055 + 0.006 * sin(uv.y * 16.0 + turn);
      float riverDist = abs(uv.x - meander);
      float channel = 1.0 - smoothstep(width, width + 0.026, riverDist);
      float frontY = 0.84 - 0.66 * (0.5 - 0.5 * cos(turn))
        + (terrain - 0.5) * 0.035 + 0.008 * sin(uv.x * 14.0 + turn);
      float occupied = smoothstep(frontY - 0.018, frontY + 0.018, uv.y);
      float molten = channel * occupied * mountain;
      float flowingCore = 1.0 - smoothstep(width * 0.14, width * 0.56, riverDist);
      float flowNoise = fbm(driftUv * vec2(9.0, 13.0) + vec2(0.2, 1.1));
      float plateNoise = noise2(driftUv * vec2(14.0, 9.0) + terrain * 3.7);
      float fracture = 1.0 - abs(noise2(driftUv * vec2(25.0, 19.0) + terrain * 2.4) * 2.0 - 1.0);
      float crackNetwork = smoothstep(0.69, 0.85, fracture) * smoothstep(0.28, 0.74, plateNoise) * mountain;
      float coolingCrust = molten * (1.0 - flowingCore * 0.74);
      float seams = crackNetwork * coolingCrust;
      float frontBand = exp(-pow((uv.y - frontY) * 68.0, 2.0)) * channel * mountain;
      float shore = exp(-pow((riverDist - width * 0.83) * 42.0, 2.0)) * occupied;
      vec3 basalt = mix(vec3(0.012, 0.015, 0.022), vec3(0.074, 0.048, 0.042), plateNoise);
      vec3 cooled = mix(vec3(0.018, 0.02, 0.026), vec3(0.072, 0.042, 0.034), flowNoise);
      vec3 hotRock = mix(vec3(0.24, 0.028, 0.005), vec3(0.76, 0.12, 0.01), flowNoise);
      vec3 incandescent = mix(vec3(1.0, 0.29, 0.035), vec3(1.0, 0.77, 0.28), flowingCore);
      color = mix(color, vec3(0.012, 0.018, 0.028), 0.92);
      color = mix(color, basalt, mountain * 0.98);
      // Broken ridge facets keep the terrain from reading as a flat brown texture.
      float cliffLight = smoothstep(0.42, 0.88, noise2(uv * vec2(12.0, 18.0) + terrain * 4.0)) * mountain;
      color += vec3(0.095, 0.056, 0.04) * cliffLight * (1.0 - channel * 0.7);
      color = mix(color, cooled, molten * 0.96);
      color = mix(color, hotRock, molten * flowingCore * (0.56 + flowNoise * 0.28));
      color += vec3(0.25, 0.032, 0.004) * seams * 0.9;
      color += incandescent * seams * (0.5 + flowNoise * 0.44);
      color += vec3(1.0, 0.43, 0.08) * frontBand * 1.0;
      color += vec3(1.0, 0.22, 0.02) * shore * 0.16;
      // A few emissive flecks travel with the advecting stream, not across the scene at random.
      for (int i = 0; i < 16; i++) {
        float fi = float(i);
        float seed = hash21(vec2(fi, 73.0));
        float age = fract(cycle * 1.3 + seed);
        float y = 0.94 - age * 0.69;
        float x = 0.39 + (1.0 - y) * 0.255 + 0.026 * sin(y * 8.1 + 0.4)
          + (fbm(vec2(2.3, y * 4.2)) - 0.5) * 0.055;
        vec2 delta = uv - vec2(x + (seed - 0.5) * width * 1.2, y);
        float ember = exp(-dot(delta * vec2(1.0, 2.4), delta * vec2(1.0, 2.4)) * 4200.0);
        color += vec3(1.0, 0.6, 0.15) * ember * (1.0 - age) * occupied * mountain;
      }
      light = molten * (flowingCore * 0.34 + seams * 0.42) + frontBand * 0.38;
    } else {
      // A substantial solar limb occupies the lower field; uneven active regions
      // drive unequal field loops and one clearly legible eruptive prominence.
      vec2 sunP = vec2((uv.x - 0.5) * 1.30, uv.y + 0.03);
      float radius = length(sunP);
      float solarNoise = fbm(sunP * 17.0 + vec2(cycle * 0.65, sin(turn) * 0.12));
      float granules = fbm(sunP * 54.0 + vec2(-cycle * 0.75, cycle * 0.42));
      float distortedRadius = radius + (solarNoise - 0.5) * 0.021;
      float limb = 1.0 - smoothstep(0.45, 0.48, distortedRadius);
      float brightRim = exp(-pow((distortedRadius - 0.463) * 62.0, 2.0));
      float corona = exp(-max(0.0, radius - 0.474) * 15.0)
        * (0.3 + 0.7 * solarNoise);
      vec3 disk = mix(vec3(0.34, 0.027, 0.007), vec3(1.0, 0.33, 0.035),
        0.18 + solarNoise * 0.43 + granules * 0.39);
      disk += vec3(0.33, 0.18, 0.035) * brightRim;
      // Granulation is localized to the disk, with irregular dark sunspot pores.
      float pores = smoothstep(0.70, 0.86, noise2(sunP * 65.0 + solarNoise * 3.1));
      float sunspot = exp(-dot((sunP - vec2(0.11, 0.18)) * vec2(18.0, 25.0), (sunP - vec2(0.11, 0.18)) * vec2(18.0, 25.0)));
      disk = mix(disk, vec3(0.19, 0.035, 0.012), pores * 0.24);
      disk = mix(disk, vec3(0.13, 0.026, 0.012), sunspot * 0.72);
      color = mix(color, disk, limb);
      float loopLight = 0.0;
      float filamentLight = 0.0;
      for (int i = 0; i < 4; i++) {
        float fi = float(i);
        float center = (i == 0 ? 0.35 : (i == 1 ? 0.475 : (i == 2 ? 0.585 : 0.705)))
          + 0.009 * sin(turn * 0.21 + fi * 1.37);
        float span = i == 0 ? 0.12 : (i == 1 ? 0.19 : (i == 2 ? 0.085 : 0.16));
        float rel = (uv.x - center) / span;
        float inside = 1.0 - smoothstep(0.94, 1.02, abs(rel));
        float leftY = sqrt(max(0.0, 0.46 * 0.46 - pow((center - span - 0.5) * 1.30, 2.0))) - 0.03;
        float rightY = sqrt(max(0.0, 0.46 * 0.46 - pow((center + span - 0.5) * 1.30, 2.0))) - 0.03;
        float foot = mix(leftY, rightY, smoothstep(-1.0, 1.0, rel));
        float height = (i == 0 ? 0.18 : (i == 1 ? 0.34 : (i == 2 ? 0.15 : 0.43)))
          + 0.018 * sin(turn * 0.31 + fi * 0.9);
        float archShape = pow(max(0.0, 1.0 - rel * rel), 0.74);
        float arch = height * archShape + 0.035 * rel * archShape * sin(fi * 1.7 + turn * 0.24);
        float wobble = (noise2(vec2(rel * 6.0 + fi, cycle * 1.4)) - 0.5) * 0.012;
        float d = abs(uv.y - foot - arch - wobble);
        float strength = (0.7 + 0.3 * sin(turn * 0.44 + fi * 1.2)) * (i == 2 ? 1.0 : 0.72);
        loopLight += exp(-d * 185.0) * inside * strength;
        filamentLight += exp(-max(0.0, d - 0.008) * 42.0) * inside * strength;
      }
      // A single asymmetric prominence lifts out of the active region and bends
      // back toward the limb; it is not a row of interchangeable arches.
      float flare = smoothstep(0.03, 0.38, cycle) * (1.0 - smoothstep(0.61, 0.95, cycle));
      vec2 flareStart = vec2(0.585, 0.40);
      vec2 flareControl = vec2(0.75 + 0.045 * sin(turn * 0.23), 0.80 + flare * 0.25);
      vec2 flareEnd = vec2(0.79, 0.24);
      float eruption = 0.0;
      for (int i = 0; i < 28; i++) {
        float a = float(i) / 28.0;
        float b = float(i + 1) / 28.0;
        vec2 pa = pow(1.0 - a, 2.0) * flareStart + 2.0 * (1.0 - a) * a * flareControl + a * a * flareEnd;
        vec2 pb = pow(1.0 - b, 2.0) * flareStart + 2.0 * (1.0 - b) * b * flareControl + b * b * flareEnd;
        eruption += exp(-segmentDistance(uv, pa, pb) * 145.0);
      }
      float beads = 0.0;
      for (int i = 0; i < 24; i++) {
        float fi = float(i);
        float seed = hash21(vec2(fi, 55.0));
        float age = fract(cycle * 0.88 + seed);
        float x = mix(flareStart.x, flareEnd.x, age) + sin(age * 3.14159) * 0.025;
        float y = pow(1.0 - age, 2.0) * flareStart.y
          + 2.0 * (1.0 - age) * age * flareControl.y + age * age * flareEnd.y;
        float d = distance(uv, vec2(x, y));
        float r = 0.0018 + (1.0 - age) * 0.0025;
        beads += exp(-pow(d / r, 2.0)) * (1.0 - age * 0.68) * (0.12 + flare * 0.88);
      }
      float streamer = 0.0;
      for (int i = 0; i < 6; i++) {
        float fi = float(i);
        float side = mod(fi, 2.0) < 1.0 ? -1.0 : 1.0;
        float startX = 0.5 + side * (0.25 + floor(fi * 0.5) * 0.067);
        float outward = (uv.x - startX) * side;
        float height = 0.24 + fi * 0.078;
        float ridge = startX + side * (0.048 + 0.052 * sin((uv.y + cycle * 0.08) * 3.3 + fi * 1.4));
        float strand = exp(-abs(uv.x - ridge) * (85.0 + fi * 9.0));
        streamer += strand * smoothstep(0.16, 0.28, uv.y) * (1.0 - smoothstep(height, height + 0.08, uv.y)) * step(0.0, outward);
      }
      color += vec3(0.45, 0.075, 0.014) * corona * 0.4;
      color += vec3(1.0, 0.34, 0.045) * loopLight * 0.9;
      color += vec3(1.0, 0.73, 0.33) * filamentLight * 0.18;
      color += vec3(1.0, 0.31, 0.045) * eruption * (0.40 + flare * 0.50);
      color += vec3(1.0, 0.82, 0.48) * eruption * (0.18 + flare * 0.56);
      color += vec3(1.0, 0.67, 0.22) * beads * 0.72;
      color += vec3(1.0, 0.48, 0.18) * streamer * 0.16;
      light = limb * 0.32 + corona * 0.31 + loopLight * 0.34 + eruption * 0.22;
    }

    float age = uTime - uImpulse.z;
    float impulse = impulseRing(uv, age);
    color += uGlow * impulse * 0.75;
    float vignette = 1.0 - smoothstep(0.18, 1.18, length(p * vec2(0.72, 0.9)));
    color *= 0.74 + vignette * 0.26;
    color += uGlow * light * 0.035;
    gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
    #include <colorspace_fragment>
  }
`;

const mount: Mount = async (root, options) => {
  const sceneData = physicsElementScenes.find((x) => x.key === options.variant);
  const variants = ["fire", "smoke", "splash", "lightning", "lava", "plasma"];
  const index = variants.indexOf(options.variant);
  if (!sceneData || index < 0)
    throw new Error(`Unknown shader study: ${options.variant}`);
  const fallback = async () => {
    root.replaceChildren();
    const { default: mountCanvas } = await import("./physics-elements");
    return mountCanvas(root, options);
  };
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch {
    return fallback();
  }
  renderer.setPixelRatio(1);
  renderer.setSize(960, 540, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.tabIndex = 0;
  renderer.domElement.style.cssText =
    "display:block;width:960px;height:540px;touch-action:manipulation";
  renderer.domElement.setAttribute(
    "aria-label",
    `${sceneData.title}. Three.js 著色器物理視覺化；點選或按空白鍵施加擾動。`,
  );
  root.replaceChildren(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uVariant: { value: index },
      uBackground: { value: new THREE.Color(sceneData.background) },
      uInk: { value: new THREE.Color(sceneData.ink) },
      uAccent: { value: new THREE.Color(sceneData.accent) },
      uGlow: { value: new THREE.Color(sceneData.glow) },
      uImpulse: { value: new THREE.Vector3(-1, -1, -1) },
    },
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geometry, material));
  let currentTime = 0;
  const impulse = material.uniforms.uImpulse.value as THREE.Vector3;
  const pointer = (event: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    impulse.set(
      (event.clientX - rect.left) / rect.width,
      1 - (event.clientY - rect.top) / rect.height,
      currentTime,
    );
  };
  const key = (event: KeyboardEvent) => {
    if (event.code === "Space" || event.code === "Enter") {
      event.preventDefault();
      impulse.set(0.5, 0.5, currentTime);
    }
  };
  renderer.domElement.addEventListener("pointerdown", pointer);
  renderer.domElement.addEventListener("keydown", key);
  const seek = (seconds: number) => {
    currentTime = phase(seconds);
    material.uniforms.uTime.value = currentTime;
    renderer.render(scene, camera);
  };
  try {
    await renderer.compileAsync(scene, camera);
    seek(0);
  } catch (error) {
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    root.replaceChildren();
    throw error;
  }
  return {
    seek,
    dispose() {
      renderer.domElement.removeEventListener("pointerdown", pointer);
      renderer.domElement.removeEventListener("keydown", key);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
};

export default mount;
