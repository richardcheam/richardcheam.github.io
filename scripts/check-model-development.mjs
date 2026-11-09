import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { modelDevelopmentModules as modules, publishedUnits as units } from '../src/data/model-development.ts';
import { validateResearchIndex } from '../src/lib/research-index.ts';
import { projectLinks } from '../src/data/site.ts';

const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
const sources = await readJson('src/data/model-development/sources.json');
const claims = await readJson('src/data/model-development/claims.json');
const errors = validateResearchIndex({ modules, sources, claims, units });
// The hub plus every published unit; a new unit is checked as soon as it is listed.
const routes = ['/model-development/', ...units.map(u => u.href)];
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
for (const u of units) {
  if (u.href.startsWith('/blog/') && !feed.includes(u.href)) errors.push(`${u.href}: missing from feed`);
  const image = `dist/og${u.href.replace(/\/$/, '')}.png`;
  try { await access(image); } catch { errors.push(`Missing generated image: ${image}`); }
}
// Every source in the inventory is cited by a module or a claim.
const cited = new Set([...modules.flatMap(m => m.sourceIds), ...claims.flatMap(c => c.sourceIds)]);
for (const s of sources) if (!cited.has(s.id)) errors.push(`${s.id}: source is not cited by any module or claim`);
const lesson = await html('/blog/model-development-training-memory/');
if (!lesson.includes('data-training-memory') || !lesson.includes('<noscript>')) errors.push('Missing estimator or no-JS fallback');
if (!lesson.includes('104.31') || !lesson.includes('13.04')) errors.push('Server-rendered worked example missing');
if (!lesson.includes('class="katex')) errors.push('Lesson math was not rendered');
// Collectives module: figures present, with content that survives without JavaScript.
const collectives = await html('/blog/model-development-collectives/');
if (!collectives.includes('data-ring-allreduce') || !collectives.includes('every rank holds 10, 20, 30, 40')) errors.push('Ring all-reduce figure or its no-JS summary missing');
const guide = await html('/blog/model-development-choosing-parallelism/');
if (!guide.includes('data-comm-planner') || !guide.includes('650.0 ms') || !guide.includes('974.9 ms')) errors.push('Communication planner or its server-rendered worked example missing');
if (!guide.includes('data-pipeline-schedule') || !guide.includes('37.5%')) errors.push('Pipeline schedule or its default readout missing');
for (const [route, doc] of [['collectives', collectives], ['guide', guide]]) if (!doc.includes('class="katex')) errors.push(`${route}: math was not rendered`);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Checked ${routes.length} pages, ${checkedLinks} internal links/anchors, ${modules.length} modules, ${sources.length} sources and ${claims.length} claims; math, feed, sitemap and OG images present.`);
