import assert from 'node:assert/strict';

const base = new URL(process.argv[2] || 'http://127.0.0.1:4321/');
if (!base.pathname.endsWith('/')) base.pathname += '/';
const academic = new URL('academic/', base);
const seen = new Set();
async function get(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200, `HTTP ${response.status}: ${url}`);
  seen.add(String(url));
  return response;
}
const main = await (await get(base)).text();
assert(main.includes(`href="${academic.pathname}"`), 'Academic card target');
const html = await (await get(academic)).text();
assert(html.includes('TeleRT') && html.includes('Zhejiang University'), 'Academic content');
assert(html.includes(`href="${base.pathname}"`), 'Personal Home target');
assert(!/Lorem ipsum|DhtAFkw|google-scholar-stats|<iframe/i.test(html), 'Template sample or Scholar request');
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const url = new URL(match[1], academic);
  if (url.origin === base.origin && !url.hash && !seen.has(String(url))) await get(url);
}
const cssURL = new URL('assets/css/main.css', academic);
const css = await (await get(cssURL)).text();
for (const match of css.matchAll(/url\(["']?([^)"']+)["']?\)/g)) {
  if (match[1].startsWith('data:')) continue;
  const url = new URL(match[1], cssURL);
  if (!seen.has(String(url))) await get(url);
}
console.log(`PASS HTTP: ${academic} — card, return link, content, ${seen.size} local assets/pages/fonts`);
