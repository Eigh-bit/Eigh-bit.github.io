import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { root, deploymentPaths } from './academic.mjs';

const { home, academic, origin } = deploymentPaths();
const dist = path.join(root, 'dist');
const html = await readFile(path.join(dist, 'academic/index.html'), 'utf8');
const main = await readFile(path.join(dist, 'index.html'), 'utf8');
assert(main.includes(`href="${academic}/"`), 'Academic card must include the deployment base');
assert(html.includes(`href="${home}"`), 'Return link must point to the personal homepage');
assert(html.includes(`href="${origin}${academic}/"`), 'Canonical URL must include the deployment base');
assert(!/Lorem ipsum|Lorem@|YOUR_GOOGLE|DhtAFkw|CVPR 2016|Kaiming He|260000|google-scholar-stats|<iframe|<base\b/i.test(html), 'Sample content or disabled integration leaked');
for (const section of ['publications', 'news', 'honors']) {
  const data = await readFile(path.join(root, 'academic-site/_data', section + '.yml'), 'utf8');
  const id = section === 'honors' ? 'awards' : section;
  if (data.trim() === '[]') assert(!html.includes(`id="${id}"`), `Empty ${section} must stay hidden`);
}
for (const id of ['about-me','research-interests','selected-projects','education']) {
  assert(html.includes(`id="${id}"`), `Missing section ${id}`);
}
assert(html.includes('sidebar') && html.includes('greedy-nav'), 'AcadHomepage sidebar/navigation missing');
assert(html.includes('TeleRT') && html.includes('Research in progress'), 'Project status missing');
assert(html.includes('Shiyao Chen') && html.includes('陈仕尧') && html.includes('Zhejiang University'), 'Profile missing');
const cssPath = path.join(dist, 'academic/assets/css/main.css');
const css = await readFile(cssPath, 'utf8');
assert(css.includes('.paper-box') && css.includes('.sidebar') && css.includes('@media'), 'Upstream responsive/paper styles missing');
const checked = new Set();
async function checkUrl(value, relativeTo) {
  if (/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(value)) return;
  const target = new URL(value, relativeTo);
  assert(target.pathname.startsWith(home), `Path escapes deployment base: ${value}`);
  const local = decodeURIComponent(target.pathname.slice(home.length));
  const file = path.join(dist, local, target.pathname.endsWith('/') ? 'index.html' : '');
  if (!checked.has(file)) { await access(file); checked.add(file); }
  if (target.hash && /index\.html$/.test(file)) {
    const body = await readFile(file, 'utf8');
    assert(body.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `Broken anchor: ${value}`);
  }
}
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) await checkUrl(match[1], `https://check.test${academic}/`);
for (const match of css.matchAll(/url\(["']?([^)"']+)["']?\)/g)) await checkUrl(match[1], `https://check.test${academic}/assets/css/main.css`);
assert((await readFile(path.join(dist, 'academic/LICENSE'), 'utf8')).includes('Copyright (c) 2022 Yi Ren'), 'Upstream license missing');
await access(path.join(dist, 'bookshelf/index.html'));
console.log(`PASS: ${academic}/ — content, navigation, canonical, local assets/fonts, responsive styles, license, bookshelf (${checked.size} files)`);
