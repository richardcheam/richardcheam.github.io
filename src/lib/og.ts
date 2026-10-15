// Link-preview images (1200 x 630) for posts and reviews: the title on the
// night end of the page's sky, its constellation emblem, and the RC mark.
// Rendered to PNG at build time with resvg and the bundled Inter font.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { emblemSvg, SKIES } from "./emblem";
import { lotusField } from "./lotus";

const FONTS = [resolve("src/assets/fonts/Inter-400.ttf"), resolve("src/assets/fonts/Inter-700.ttf")];
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rgb = (c: number[]) => `rgb(${c.join(",")})`;
const mix = (c: number[], to: number[], t: number) => c.map((v, i) => Math.round(v + (to[i] - v) * t));

/** Lift every rgb() colour in an SVG string towards white, so it reads on a dark ground. */
function lift(svg: string, t: number) {
  return svg.replace(/rgb\((\d+),(\d+),(\d+)\)/g, (_, r, g, b) => rgb(mix([+r, +g, +b], [255, 255, 255], t)));
}

/** Break a title into lines of at most `max` characters, on word boundaries. */
function wrap(text: string, max: number) {
  const lines: string[] = [];
  let line = "";
  for (const w of text.split(/\s+/)) {
    if ((line + " " + w).trim().length > max && line) { lines.push(line); line = w; } else line = (line + " " + w).trim();
  }
  if (line) lines.push(line);
  return lines;
}

/** The Ensō mark, as SVG children, letters in ink. */
function mark() {
  const svg = readFileSync(resolve("src/assets/enso-mark.svg"), "utf8").replace(/currentColor/g, "#1C2733");
  return svg.replace(/<svg[^>]*>/, "").replace("</svg>", "");
}

/**
 * A printed-page card in the site's own style: white ground, black title set
 * like the post headings, the series name in its sky colour, the post's
 * constellation as a small flat mark, and a footer rule with the author.
 */
export function ogSvg(opts: { title: string; kicker: string; body: string; sky: string; subtitle?: string; bigMark?: boolean }) {
  if (opts.bigMark) return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${lotusField(1200, 630)}
  <text x="80" y="118" font-family="Inter" font-weight="700" font-size="20" letter-spacing="2.4" fill="#3E6E7E">${esc(opts.kicker.toUpperCase())}</text>
  <text x="76" y="210" font-family="Inter" font-weight="700" font-size="88" letter-spacing="-2.2" fill="#1C2733">${esc(opts.title)}</text>
  ${opts.subtitle ? `<text x="80" y="262" font-family="Inter" font-weight="400" font-size="28" fill="#3B4A52">${esc(opts.subtitle)}</text>` : ""}
  <text x="80" y="590" font-family="Inter" font-weight="400" font-size="22" fill="#F6F1E7" fill-opacity="0.92">richardcheam.github.io</text>
</svg>`;
  const stops = SKIES[opts.sky] ?? SKIES["speech-ai"];
  const accent = rgb(stops[1]);
  const site = !!opts.bigMark;
  let size = site ? 96 : 66, lines = wrap(opts.title, site ? 16 : 24);
  if (!site && lines.length > 3) { size = 54; lines = wrap(opts.title, 30); }
  if (lines.length > 4) { lines = lines.slice(0, 4); lines[3] += "…"; }
  const lh = size * 1.08, top = site ? 270 : 200;
  const emblem = emblemSvg(opts.body, opts.sky, opts.sky).replace(/<svg[^>]*>/, "").replace("</svg>", "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect x="0" y="0" width="1200" height="8" fill="${accent}"/>
  <text x="80" y="${site ? 150 : 120}" font-family="Inter" font-weight="700" font-size="20" letter-spacing="2.4" fill="${accent}">${esc(opts.kicker.toUpperCase())}</text>
  ${lines.map((l, i) => `<text x="80" y="${(top + i * lh).toFixed(0)}" font-family="Inter" font-weight="700" font-size="${size}" letter-spacing="${(-size * 0.025).toFixed(1)}" fill="#111111">${esc(l)}</text>`).join("\n  ")}
  ${opts.subtitle ? `<text x="84" y="${(top + lines.length * lh + 6).toFixed(0)}" font-family="Inter" font-weight="400" font-size="30" fill="#666666">${esc(opts.subtitle)}</text>` : ""}
  ${site
    ? `<svg x="860" y="150" width="250" height="250" viewBox="0 0 64 64">${mark()}</svg>`
    : `<svg x="880" y="400" width="240" height="120" viewBox="0 0 240 120">${emblem}</svg>`}
  <line x1="80" x2="1120" y1="540" y2="540" stroke="#e7e7e7" stroke-width="2"/>
  <svg x="78" y="556" width="46" height="46" viewBox="0 0 100 100">${mark()}</svg>
  <text x="132" y="588" font-family="Inter" font-weight="700" font-size="22" fill="#111111">Richard Cheam</text>
  <text x="1120" y="588" font-family="Inter" font-weight="400" font-size="22" text-anchor="end" fill="#666666">richardcheam.github.io</text>
</svg>`;
}

export function ogPng(opts: Parameters<typeof ogSvg>[0]) {
  const svg = ogSvg(opts);
  return new Resvg(svg, { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Inter" }, fitTo: { mode: "width", value: 1200 } }).render().asPng();
}
