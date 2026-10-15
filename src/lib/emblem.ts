// A post's constellation emblem, drawn at build time from its markdown
// headings. Mirrors the in-page emblem in public/js/site.js: parts (##) are
// big stars, subsections (###) small ones, joined in reading order and
// coloured along the series sky.
export const SKIES: Record<string, number[][]> = {
  "speech-ai": [[31, 58, 95], [62, 110, 126], [217, 120, 154], [227, 155, 45], [201, 161, 91]],
  "dual-gh200": [[30, 52, 72], [63, 110, 120], [192, 112, 58], [226, 170, 90]],
  "representation-collapse": [[30, 30, 63], [90, 78, 122], [216, 154, 60], [232, 194, 122]],
};
SKIES["reviews"] = [[44, 62, 80], [74, 110, 90], [168, 140, 80], [214, 170, 110]];
SKIES["foundations"] = [[28, 60, 58], [52, 110, 98], [120, 160, 120], [214, 180, 90]];
SKIES["angkor-dawn"] = SKIES["speech-ai"];
const ZIG = [6, 22, 12, 30, 4, 18, 26, 10, 20, 2];
const SKIP = /^(related|sources)$/i;

function hue(stops: number[][], t: number) {
  const x = Math.max(0, Math.min(1, t)) * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(x)), f = x - i;
  return `rgb(${stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * f)).join(",")})`;
}

/** Stars of a post: section index and subsection index (-1 for the part itself). */
export function starsOf(body: string) {
  const out: { section: number; sub: number }[] = [];
  let section = -1, sub = -1, inCode = false;
  for (const line of body.split("\n")) {
    if (line.startsWith("```")) { inCode = !inCode; continue; }
    if (inCode) continue;
    const h2 = line.match(/^## (.+)/), h3 = line.match(/^### (.+)/);
    if (h2) { if (SKIP.test(h2[1].trim())) break; section++; sub = -1; out.push({ section, sub }); }
    else if (h3 && section >= 0) { sub++; out.push({ section, sub }); }
  }
  return out;
}

/** The emblem as an SVG string, viewBox 240 by 120. */
export function emblemSvg(body: string, series?: string, sky?: string) {
  const stars = starsOf(body);
  if (stars.length < 2) return "";
  const stops = SKIES[sky ?? ""] ?? SKIES[series ?? ""] ?? SKIES["speech-ai"];
  const parts = stars.filter((s) => s.sub < 0).length;
  const col = (s: { section: number }) => hue(stops, parts > 1 ? s.section / (parts - 1) : 0);
  const ex = stars.map((_, k) => 14 + (k / Math.max(1, stars.length - 1)) * 212);
  const ey = stars.map((s) => { const z = ZIG[s.section % ZIG.length]; return s.sub < 0 ? 22 + z * 2.4 : 30 + z * 2.4 + (s.sub % 2 ? 14 : -10); });
  let lines = "", dots = "";
  for (let k = 1; k < stars.length; k++) lines += `<line x1="${ex[k - 1].toFixed(1)}" y1="${ey[k - 1].toFixed(1)}" x2="${ex[k].toFixed(1)}" y2="${ey[k].toFixed(1)}" stroke="${col(stars[k])}" stroke-width="1" stroke-opacity="0.55"/>`;
  stars.forEach((s, k) => { dots += `<circle cx="${ex[k].toFixed(1)}" cy="${ey[k].toFixed(1)}" r="${s.sub < 0 ? 3.6 : 1.8}" fill="${col(s)}"/>`; });
  return `<svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${lines}${dots}</svg>`;
}
