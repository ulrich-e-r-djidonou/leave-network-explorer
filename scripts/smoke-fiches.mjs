// Test de fumée sur le site construit (dist/), lancé avant chaque déploiement.
//
// 1. Sert dist/ comme GitHub Pages : fichier exact, `chemin.html` pour `/chemin`, dossier avec
//    index.html, sinon 404.html avec le statut 404. Pas de repli SPA : une route sans page
//    échoue ici comme elle échouerait en ligne.
// 2. Ouvre chaque route en accès direct et vérifie le statut 200 et l'absence d'erreur JavaScript.
// 3. Ouvre la fiche de chaque pays dans chaque édition et vérifie qu'elle s'affiche (nom du pays,
//    pastille de l'édition) sans erreur JavaScript.
//
// Usage : npm run build && npm run smoke

import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const BASE_PATH = '/leave-network-explorer/';
const YEAR_KEY = 'ln_year';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.geojson': 'application/geo+json', '.woff2': 'font/woff2',
};

function isFile(p) { return existsSync(p) && statSync(p).isFile(); }
function isDir(p) { return existsSync(p) && statSync(p).isDirectory(); }

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const send = (status, file) => {
    res.writeHead(status, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  };
  if (!url.pathname.startsWith(BASE_PATH)) return send(404, join(dist, '404.html'));
  const rel = normalize(decodeURIComponent(url.pathname.slice(BASE_PATH.length)));
  if (rel.startsWith('..')) return send(404, join(dist, '404.html'));
  const target = join(dist, rel);
  if (isFile(target)) return send(200, target);
  if (!url.pathname.endsWith('/') && isFile(`${target}.html`)) return send(200, `${target}.html`);
  if (isDir(target)) {
    if (!url.pathname.endsWith('/')) {
      res.writeHead(301, { location: `${url.pathname}/` });
      return res.end();
    }
    if (isFile(join(target, 'index.html'))) return send(200, join(target, 'index.html'));
  }
  return send(404, join(dist, '404.html'));
});

await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const origin = `http://127.0.0.1:${server.address().port}`;
const site = origin + BASE_PATH;

const years = JSON.parse(readFileSync(join(root, 'public/data/years.json'), 'utf8'));
const editions = years.years.map((e) => ({
  year: e.year,
  countries: JSON.parse(readFileSync(join(root, 'public/data', e.file), 'utf8')).countries,
}));
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const staticRoutes = [...app.matchAll(/<Route[^>]*?path="([^"]+)"/gs)]
  .map((m) => m[1])
  .filter((p) => !p.includes(':'));

const failures = [];
const browser = await chromium.launch();

// Les polices Google ne sont pas nécessaires au test et ralentiraient chaque page.
async function newContext(year) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  if (year) await context.addInitScript(([k, y]) => localStorage.setItem(k, y), [YEAR_KEY, String(year)]);
  return context;
}

async function visit(page, path, check, label = path || '/') {
  const errors = [];
  const onError = (e) => errors.push(e.message);
  page.on('pageerror', onError);
  try {
    const response = await page.goto(site + path, { waitUntil: 'domcontentloaded' });
    if (response?.status() !== 200) errors.push(`statut HTTP ${response?.status()}`);
    await page.locator('header').first().waitFor({ timeout: 10000 });
    if (check) await check(page);
    await page.waitForTimeout(100);
  } catch (e) {
    errors.push(e.message.split('\n')[0]);
  } finally {
    page.off('pageerror', onError);
  }
  if (errors.length) failures.push(`${label} : ${errors.join(' | ')}`);
  return errors.length === 0;
}

// Routes en accès direct, édition par défaut.
{
  const context = await newContext();
  const page = await context.newPage();
  for (const route of staticRoutes) await visit(page, route.replace(/^\//, ''));
  await context.close();
}

// Fiche de chaque pays dans chaque édition.
for (const { year, countries } of editions) {
  const context = await newContext(year);
  const page = await context.newPage();
  for (const c of countries) {
    await visit(page, `country/${c.iso2}`, async (p) => {
      await p.getByRole('heading', { name: c.name, exact: true }).first().waitFor({ timeout: 10000 });
      const badge = await p.getByText(new RegExp(`(Données|Data) ${year}|${year} data`)).count();
      if (badge === 0) throw new Error(`pastille de l'édition ${year} absente`);
    }, `${year} country/${c.iso2}`);
  }
  await context.close();
}

await browser.close();
server.close();

const fiches = editions.reduce((n, e) => n + e.countries.length, 0);
console.log(`smoke : ${staticRoutes.length} routes, ${fiches} fiches (${editions.map((e) => e.year).join(', ')})`);
if (failures.length) {
  console.error(`smoke : ${failures.length} échec(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('smoke : aucun échec');
