import { getCollection, type CollectionEntry } from "astro:content";
import { categories } from "../data/categories";
import { reviewTopics, reviewTypes } from "../data/reviewTopics";

export type Post = CollectionEntry<"blog">;
export type Review = CollectionEntry<"paper-reviews">;

export const postUrl = (p: Post) => `/blog/${p.id}/`;
export const reviewUrl = (r: Review) => `/paper-reviews/${r.id}/`;

export async function publishedPosts() {
  return (await getCollection("blog", ({ data }) => data.published)).sort((a, b) => a.data.series_order - b.data.series_order);
}

export async function publishedReviews() {
  return (await getCollection("paper-reviews", ({ data }) => data.published)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const categoryLabel = (key: string) => categories.find((c) => c.key === key)?.label ?? "Blog Post";
export const typeLabel = (key: string, long = false) => {
  const t = reviewTypes.find((t) => t.key === key);
  return t ? (long ? t.long_label : t.label) : key;
};
export const topicLabels = (keys: string[], sep = " · ") => keys.map((k) => reviewTopics.find((t) => t.key === k)?.label ?? k).join(sep);

// Liquid's date filter with "%d %b %Y" in UTC, e.g. "03 Oct 2026".
export const shortDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

// Liquid's truncate: the result, ellipsis included, is at most `n` characters.
export const truncate = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 3) + "...");
export const stripHtml = (s: string) => s.replace(/<[^>]*>/g, "");

// Words / 220, rounded up, as the Jekyll review layout computed it.
export function readMinutes(r: Review) {
  if (r.data.read_time) return String(r.data.read_time);
  const words = stripHtml(r.rendered?.html ?? r.body ?? "").split(/\s+/).filter(Boolean).length;
  return String(Math.max(1, Math.ceil(words / 220)));
}
