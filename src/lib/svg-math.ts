// Tiny TeX-like markup for math inside SVG <text>: `h_i`, `h^{ref}_{k}`,
// `i_{ret} + d·f_r`. Single letters become italic math, longer words stay
// upright (like \text{} in TeX), and sub/superscripts are real shifted tspans.
// Shifts use dy in px (not baseline-shift, which Firefox ignores), so pass the
// <text>'s font size. Returns tspan markup for set:html or innerHTML.

type Seg = { text: string; shift: number; small: boolean };

const ITALIC = `font-family="KaTeX_Math, 'Times New Roman', serif" font-style="italic"`;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function parse(src: string): Seg[] {
  const out: Seg[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if ((ch === "_" || ch === "^") && i + 1 < src.length) {
      let body: string;
      if (src[i + 1] === "{") {
        const end = src.indexOf("}", i + 2);
        body = src.slice(i + 2, end);
        i = end + 1;
      } else {
        body = src[i + 1];
        i += 2;
      }
      out.push({ text: body, shift: ch === "_" ? 0.3 : -0.4, small: true });
    } else {
      const last = out[out.length - 1];
      if (last && last.shift === 0) last.text += ch;
      else out.push({ text: ch, shift: 0, small: false });
      i++;
    }
  }
  return out;
}

// Wrap single-letter identifiers in italics, leave words, digits and symbols.
function styleWords(text: string, size?: string) {
  const sz = size ? ` font-size="${size}"` : "";
  const parts = text.split(/([A-Za-z]+)/);
  return parts
    .map((part, j) => {
      if (!part) return "";
      // "s" right after a number is the unit, not a variable.
      const unit = part === "s" && /\d\s*$/.test(parts[j - 1] ?? "");
      if (!unit && /^[A-Za-z]$/.test(part)) return `<tspan ${ITALIC}${sz}>${esc(part)}</tspan>`;
      return sz ? `<tspan${sz}>${esc(part)}</tspan>` : esc(part);
    })
    .join("");
}

export function svgMath(src: string, fontSize: number) {
  let base = 0; // current baseline offset in px
  return parse(src)
    .map((seg) => {
      const target = seg.shift * fontSize;
      const dy = target - base;
      base = target;
      const inner = styleWords(seg.text, seg.small ? `${Math.round(fontSize * 0.72 * 10) / 10}` : undefined);
      return dy ? `<tspan dy="${dy.toFixed(2)}">${inner}</tspan>` : `<tspan>${inner}</tspan>`;
    })
    .join("");
}
