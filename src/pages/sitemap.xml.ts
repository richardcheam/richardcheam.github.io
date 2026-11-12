import type { APIRoute } from "astro";
import { site } from "../data/site";
import { getCollection } from "astro:content";
import { isoDay, postUrl, publishedPosts, publishedReviews, reviewUrl } from "../lib/content";

// Every canonical public page. Left out on purpose: the 404, the redirect pages
// (/projects/inference-engineering/, /model-development/) and feed or image files.
// Projects in src/content/projects are listed automatically.
const staticPaths = ["/", "/blog/", "/contact/", "/cv/", "/paper-reviews/", "/projects/", "/projects/embedding-diagnostics/"];

export const GET: APIRoute = async () => {
  const posts = await publishedPosts();
  const reviews = await publishedReviews();
  const projects = await getCollection("projects");
  const urls = [
    ...posts.map((p) => ({ loc: postUrl(p), lastmod: isoDay(p.data.date) })),
    ...reviews.map((r) => ({ loc: reviewUrl(r), lastmod: isoDay(r.data.date) })),
    ...staticPaths.map((loc) => ({ loc, lastmod: undefined as string | undefined })),
    ...projects.map((p) => ({ loc: `/projects/${p.id}/`, lastmod: undefined as string | undefined })),
  ];
  const body = urls.map((u) => `<url><loc>${site.url}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
