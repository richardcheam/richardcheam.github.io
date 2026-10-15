// Titles in lists are set in a regular weight with only their key words in
// bold. The key words are the front matter's `title_key` (one phrase or a
// list), or else the part of the title before its first colon.
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function titleHtml(title: string, key?: string | string[]) {
  const keys = key ? (Array.isArray(key) ? key : [key]) : title.includes(":") ? [title.slice(0, title.indexOf(":"))] : [];
  let html = esc(title);
  for (const k of keys) {
    if (!title.includes(k)) throw new Error(`title_key "${k}" is not part of the title "${title}"`);
    html = html.replace(esc(k), `<strong>${esc(k)}</strong>`);
  }
  return html;
}
