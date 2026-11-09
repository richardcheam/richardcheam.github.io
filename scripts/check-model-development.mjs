import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { modelDevelopmentModules as modules } from '../src/data/model-development.ts';
import { validateResearchIndex } from '../src/lib/research-index.ts';
import { projectLinks } from '../src/data/site.ts';

const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
const sources = await readJson('src/data/model-development/sources.json');
const claims = await readJson('src/data/model-development/claims.json');
const errors = validateResearchIndex({ modules, sources, claims });
const routes = ['/model-development/', '/blog/model-development-training-memory/', '/paper-reviews/zero/'];
const origin = 'https://richardcheam.github.io';
// These existing absolute menu URLs belong to separately hosted project repos;
// they deliberately do not have files in this portfolio's dist directory.
const externalProjects = new Set(projectLinks.map(([, url]) => url).filter(url => url.startsWith('https://')));
let checkedLinks = 0;
const cache = new Map();
async function html(route) {
  const local = path.join('dist', route.endsWith('/') ? `${route}index.html` : route);
  if (!cache.has(local)) cache.set(local, await readFile(local, 'utf8'));
  return cache.get(local);
}
for (const route of routes) {
  const document = await html(route);
  if (!/<h1\b/.test(document)) errors.push(`${route}: missing page heading`);
  if (/<[^>]*class=["'][^"']*\bkatex-error\b/.test(document)) errors.push(`${route}: KaTeX rendering error`);
  const ids = [...document.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) errors.push(`${route}: duplicate HTML IDs`);
  for (const match of document.matchAll(/\bhref=["']([^"']+)["']/g)) {
    const target = new URL(match[1].replaceAll('&amp;', '&'), origin + route);
    if (externalProjects.has(target.href)) continue;
    if (target.origin !== origin || !target.pathname.startsWith('/')) continue;
    checkedLinks++;
    try {
      const pathname = decodeURIComponent(target.pathname);
      if (target.hash) {
        const linked = await html(pathname);
        const id = decodeURIComponent(target.hash.slice(1));
        const found = [...linked.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)].some(m => m[1] === id);
        if (!found) errors.push(`${route}: unresolved anchor ${pathname}${target.hash}`);
      } else {
        await access(path.join('dist', pathname.endsWith('/') ? `${pathname}index.html` : pathname));
      }
    } catch { errors.push(`${route}: missing internal target ${target.pathname}${target.hash}`); }
  }
}
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
for (const route of routes) if (!sitemap.includes(origin + route)) errors.push(`${route}: missing from sitemap`);
const feed = await readFile('dist/feed.xml', 'utf8');
if (!feed.includes('/blog/model-development-training-memory/')) errors.push('New lesson missing from feed');
for (const image of ['dist/og/blog/model-development-training-memory.png', 'dist/og/paper-reviews/zero.png']) {
  try { await access(image); } catch { errors.push(`Missing generated image: ${image}`); }
}
const lesson = await html(routes[1]);
if (!lesson.includes('data-training-memory') || !lesson.includes('<noscript>')) errors.push('Missing estimator or no-JS fallback');
if (!lesson.includes('104.31') || !lesson.includes('13.04')) errors.push('Server-rendered worked example missing');
if (!lesson.includes('class="katex')) errors.push('Lesson math was not rendered');
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Checked ${routes.length} pages, ${checkedLinks} internal links/anchors, ${modules.length} modules, ${sources.length} sources and ${claims.length} claims; math, feed, sitemap and OG images present.`);
