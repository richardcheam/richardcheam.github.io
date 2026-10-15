# Richard Cheam · personal site

Portfolio, technical blog and paper reviews, built with [Astro](https://astro.build) and deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `master`.

## Commands

The project pins its own Node 22 as a dev dependency, and `npm run` puts it first on the PATH. The first install, and any later `npm install`, must also run under Node 22.12 or newer; `.npmrc` sets `engine-strict` so npm fails instead of silently skipping native packages.

```sh
export PATH="$PWD/node_modules/node/bin:$PATH"   # after the first install
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve dist/
```

## Where things live

| Path | What |
|---|---|
| `src/content/blog/*.mdx` | Blog posts. Front matter is validated by `src/content.config.ts`. |
| `src/content/paper-reviews/*.md` | Paper reviews. Files starting with `_` are templates and never published. |
| `src/components/figures/` | Blog figures as components, imported by the posts that use them. |
| `src/data/` | Categories, series, review topics, project menu links, site metadata. |
| `src/layouts/` | `Base` (site shell), `Post` (blog), `Review` (paper review). |
| `src/pages/` | Routes. Static pages render their HTML from `src/page-content/`. |
| `src/styles/main.scss` | The whole stylesheet. |
| `public/js/site.js` | Site behaviour: theme, mega menu, reveal, filters, contents rail. |
| `public/assets/` | Images and SVGs served as-is. |

## Writing

- Display math needs `$$` on its own lines; inline math uses `$...$`.
- A new blog category must be added to `src/data/categories.ts`, a new series to `src/data/series.ts`; the build fails otherwise.
- The blog list, the home page, the mega menu, the feed and the sitemap are generated from the collections; nothing is maintained by hand except `projectLinks` in `src/data/site.ts` and the project cards in `src/page-content/`.
