import type { APIRoute } from "astro";
import { site } from "../data/site";
import { postUrl, publishedPosts } from "../lib/content";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Atom feed of blog posts, newest first.
export const GET: APIRoute = async () => {
  const posts = (await publishedPosts()).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const updated = posts[0]?.data.date.toISOString() ?? new Date().toISOString();
  const entries = posts
    .map((p) => {
      const url = site.url + postUrl(p);
      return `<entry><title>${esc(p.data.title)}</title><link href="${url}" rel="alternate" type="text/html"/><id>${url}</id><published>${p.data.date.toISOString()}</published><updated>${p.data.date.toISOString()}</updated><summary>${esc(p.data.excerpt)}</summary></entry>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><link href="${site.url}/feed.xml" rel="self" type="application/atom+xml"/><link href="${site.url}/" rel="alternate" type="text/html"/><updated>${updated}</updated><id>${site.url}/feed.xml</id><title type="html">${esc(site.title)}</title><subtitle>${esc(site.description)}</subtitle><author><name>Richard Cheam</name></author>${entries}</feed>`;
  return new Response(xml, { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } });
};
