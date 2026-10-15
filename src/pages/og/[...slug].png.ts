// Link-preview images: /og/blog/<post>.png and /og/paper-reviews/<review>.png.
import type { APIRoute } from "astro";
import { publishedPosts, publishedReviews } from "../../lib/content";
import { series } from "../../data/series";
import { ogPng } from "../../lib/og";

export async function getStaticPaths() {
  const posts = (await publishedPosts()).map((p) => ({
    params: { slug: `blog/${p.id}` },
    props: { title: p.data.title, body: p.body ?? "", sky: p.data.sky ?? p.data.series ?? "speech-ai", kicker: series.find((s) => s.key === p.data.series)?.title ?? "Blog" },
  }));
  const reviews = (await publishedReviews()).map((r) => ({
    params: { slug: `paper-reviews/${r.id}` },
    props: { title: r.data.title, body: r.body ?? "", sky: "reviews", kicker: r.data.type === "tech-report" ? "Technical report review" : "Paper review" },
  }));
  const siteCard = {
    params: { slug: "site" },
    props: { title: "Richard Cheam", subtitle: "Speech AI, LLM inference and representation learning", body: "", sky: "speech-ai", kicker: "Portfolio, blog and paper reviews", bigMark: true },
  };
  return [siteCard, ...posts, ...reviews];
}

export const GET: APIRoute = ({ props }) =>
  new Response(ogPng(props as Parameters<typeof ogPng>[0]), { headers: { "Content-Type": "image/png" } });
