import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  site: "https://richardcheam.github.io",
  trailingSlash: "always",
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    // Colours come from the site's --code-* tokens (see "Code blocks" in main.scss).
    shikiConfig: { theme: "css-variables" },
  },
});
