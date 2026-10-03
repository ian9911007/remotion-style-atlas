import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const out = new URL("../public/assets/", import.meta.url);
await mkdir(out, { recursive: true });
const wrap = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">${body}</svg>`;
const assets: Record<string, string> = {
  architecture: wrap(
    `<defs><linearGradient id="sky" x2="0.6" y2="1"><stop stop-color="#e7dbba"/><stop offset="1" stop-color="#999f91"/></linearGradient><linearGradient id="wall"><stop stop-color="#f1e0ba"/><stop offset=".7" stop-color="#c1ae89"/><stop offset="1" stop-color="#786d57"/></linearGradient><linearGradient id="shade"><stop stop-color="#423e34"/><stop offset="1" stop-color="#979c85"/></linearGradient><linearGradient id="ground" x2=".8" y2="1"><stop stop-color="#c6b596"/><stop offset="1" stop-color="#8d8b72"/></linearGradient></defs><rect width="1600" height="1000" fill="url(#sky)"/><path d="M0 560 950 390 1600 585v415H0z" fill="url(#ground)"/><path d="M190 230 1035 115 1415 345 575 450z" fill="#f0e0bc"/><path d="M190 230 575 450v445L190 677z" fill="#b0a183"/><path d="M575 450 1415 345v445L575 895z" fill="url(#wall)"/><path d="M1040 441c-145 17-233 133-233 290v91l410-51v-91c0-157-64-255-177-239z" fill="url(#shade)"/><path d="M886 823v-105c0-120 57-198 138-210 88-12 145 54 145 170v104z" fill="#53665d"/><path d="M918 708h206v76H918z" fill="#72877c"/><path d="M822 839 1319 777 1482 865 962 941z" fill="#766c57" opacity=".35"/><path d="M0 906 1600 697" stroke="#ddd1b1" stroke-width="4"/><path d="M100 0 490 1000M520 0 910 1000" stroke="#e7dec3" stroke-width="1" opacity=".18"/><path d="M1290 165 1300 597" stroke="#476554" stroke-width="8"/>${Array.from({ length: 15 }, (_, i) => `<ellipse cx="${1280 + Math.sin(i * 2) * 70}" cy="${200 + i * 19}" rx="48" ry="18" fill="${i % 2 ? "#647a5d" : "#7f906a"}" transform="rotate(${i % 2 ? 30 : -30} 1290 ${200 + i * 19})"/>`).join("")}`,
  ),
  product: wrap(
    `<defs><radialGradient id="bg"><stop stop-color="#f4f2e7"/><stop offset="1" stop-color="#c7cdc0"/></radialGradient><linearGradient id="body"><stop stop-color="#9bada0"/><stop offset=".25" stop-color="#d8ded1"/><stop offset=".65" stop-color="#b8c7b8"/><stop offset="1" stop-color="#778e7d"/></linearGradient><linearGradient id="cap"><stop stop-color="#293e35"/><stop offset=".5" stop-color="#53665a"/><stop offset="1" stop-color="#1d352c"/></linearGradient><radialGradient id="shadow"><stop stop-color="#5b6a59" stop-opacity=".35"/><stop offset="1" stop-color="#5b6a59" stop-opacity="0"/></radialGradient></defs><rect width="1600" height="1000" fill="url(#bg)"/><ellipse cx="842" cy="848" rx="380" ry="82" fill="url(#shadow)"/><path d="M656 300q0-30 30-30h258q30 0 30 30v461q0 44-44 44H700q-44 0-44-44z" fill="url(#body)"/><rect x="684" y="196" width="264" height="108" rx="27" fill="url(#cap)"/><path d="M711 324v390" stroke="#edf0e5" stroke-width="7" opacity=".55"/><path d="M943 338v420" stroke="#819887" stroke-width="4"/><rect x="721" y="408" width="188" height="243" rx="2" fill="#f0efe3" opacity=".95"/><path d="M761 452h108M776 472h78" stroke="#445c48" stroke-width="3"/><circle cx="815" cy="536" r="31" fill="none" stroke="#638169" stroke-width="2"/><path d="M796 556 830 518M801 533q37-22 39-9" stroke="#638169" stroke-width="2" fill="none"/><path d="M769 598h92M786 613h58" stroke="#8b9b86" stroke-width="2"/><path d="M674 778q139 37 280-5" stroke="#8ba28f" stroke-width="3" fill="none"/>`,
  ),
  botanical: wrap(
    `<defs><linearGradient id="paper" x2=".7" y2="1"><stop stop-color="#e7dec1"/><stop offset="1" stop-color="#aaa887"/></linearGradient><linearGradient id="leaf" x2=".5" y2="1"><stop stop-color="#799171"/><stop offset=".55" stop-color="#38594a"/><stop offset="1" stop-color="#1f3e36"/></linearGradient></defs><rect width="1600" height="1000" fill="url(#paper)"/><path d="M740 1030q50-320 100-600T995-50" stroke="#314e40" stroke-width="10" fill="none"/>${Array.from(
      { length: 12 },
      (_, i) => {
        const y = 140 + i * 62,
          x = 930 - i * 13;
        return `<path d="M${x} ${y}q${i % 2 ? 360 : -340} -220 ${i % 2 ? 295 : -286} -70q-65 142 ${i % 2 ? -295 : 286} 70z" fill="url(#leaf)"/><path d="M${x} ${y}l${i % 2 ? 255 : -235} -98" stroke="#a0ac82" stroke-width="2" opacity=".5"/>`;
      },
    ).join(
      "",
    )}<path d="M1010 770q260-105 437 60" fill="none" stroke="#888d68" stroke-width="4"/><circle cx="1420" cy="813" r="18" fill="#a3885c"/>`,
  ),
};
for (const [name, svg] of Object.entries(assets)) {
  await writeFile(new URL(`${name}.svg`, out), svg);
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 94 })
    .toFile(fileURLToPath(new URL(`${name}.jpg`, out)));
}
console.log("Created 3 original raster illustrations (not photographs).");
