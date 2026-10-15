import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { categories } from "./data/categories";
import { series } from "./data/series";
import { reviewTopics, reviewTypes } from "./data/reviewTopics";

const enumOf = (keys: readonly string[]) => z.enum(keys as [string, ...string[]]);

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    // Words to set in bold where the title is listed; defaults to the text before a colon.
    title_key: z.union([z.string(), z.array(z.string())]).optional(),
    date: z.coerce.date(),
    category: enumOf(categories.map((c) => c.key)),
    read_time: z.string().default("7 min"),
    series_order: z.number(),
    series: enumOf(series.map((s) => s.key)).optional(),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
    // Contents rail style: the plain list, or the constellation map.
    rail: z.enum(["list", "constellation"]).default("constellation"),
    // Optional sky for the constellation colours, overriding the series sky.
    sky: z.enum(["angkor-dawn"]).optional(),
    excerpt: z.string(),
    question: z.string(),
    my_work: z.string(),
    result: z.string(),
    evidence_limit: z.string(),
    lesson: z.string(),
  }),
});

const topicKey = enumOf(reviewTopics.map((t) => t.key));
const paperReviews = defineCollection({
  // Files starting with "_" are templates and are never published.
  loader: glob({ pattern: ["**/*.{md,mdx}", "!**/_*"], base: "./src/content/paper-reviews" }),
  schema: z.object({
    title: z.string(),
    // Words to set in bold where the title is listed; defaults to the text before a colon.
    title_key: z.union([z.string(), z.array(z.string())]).optional(),
    date: z.coerce.date(),
    published: z.boolean().default(true),
    type: enumOf(reviewTypes.map((t) => t.key)).default("paper"),
    topic: z.union([topicKey, z.array(topicKey)]).default([]).transform((t) => (Array.isArray(t) ? t : [t])),
    tags: z.union([z.string(), z.array(z.string())]).default([]).transform((t) => (Array.isArray(t) ? t : [t])),
    question: z.string().optional(),
    excerpt: z.string().optional(),
    org: z.string().optional(),
    authors: z.string().optional(),
    source_url: z.string().optional(),
    source_label: z.string().optional(),
    source_date: z.coerce.date().optional(),
    featured: z.boolean().default(false),
    read_time: z.union([z.string(), z.number()]).optional(),
    series: z.string().optional(),
    series_title: z.string().optional(),
    series_order: z.number().optional(),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    tldr: z.array(z.string()).default([]),
    glance: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  }),
});

// Projects that live on the portfolio itself (larger ones have their own sites).
const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    area: z.string(),
    date: z.string(),
    order: z.number(),
    status: z.string().optional(),
    headline: z.string(),
    question: z.string(),
    approach: z.string(),
    stack: z.string(),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    numbers: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    cover: z.object({ src: z.string(), alt: z.string() }).optional(),
  }),
});

export const collections = { blog, "paper-reviews": paperReviews, projects };
