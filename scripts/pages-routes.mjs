// Après `vite build` : rend chaque route client accessible en accès direct sur GitHub Pages.
//
// Pages ne connaît pas les routes de l'application (BrowserRouter) : une adresse comme
// /leave-network-explorer/changes n'a pas de fichier et renvoie 404. Pages sert en revanche
// `changes.html` pour `/changes`. Ce script écrit donc une copie de dist/index.html par route
// (avec l'adresse canonique de la route), une par pays pour /country/:iso2, et un 404.html de
// repli pour les autres adresses (le contenu s'affiche, avec le statut 404 et noindex).
//
// Les routes sont lues dans src/App.tsx et les pays dans les éditions de public/data/years.json :
// une route ajoutée à l'application est couverte sans retoucher ce script.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const SITE = 'https://djidonou.com/leave-network-explorer/';

function fail(message) {
  console.error(`pages-routes : ${message}`);
  process.exit(1);
}

const index = readFileSync(join(dist, 'index.html'), 'utf8');
for (const tag of ['rel="canonical"', 'property="og:url"', 'name="robots"']) {
  if (!index.includes(tag)) fail(`balise ${tag} introuvable dans dist/index.html`);
}

// Routes déclarées dans App.tsx.
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const declared = [...app.matchAll(/<Route[^>]*?path="([^"]+)"/gs)].map((m) => m[1]);
if (!declared.includes('/')) fail('aucune route lue dans src/App.tsx');

// Codes pays de toutes les éditions.
const years = JSON.parse(readFileSync(join(root, 'public/data/years.json'), 'utf8'));
const isos = new Set();
for (const e of years.years) {
  const data = JSON.parse(readFileSync(join(root, 'public/data', e.file), 'utf8'));
  for (const c of data.countries) isos.add(c.iso2);
}

const routes = [];
for (const path of declared) {
  if (path === '/') continue;
  if (path === '/country/:iso2') {
    for (const iso of [...isos].sort()) routes.push(`country/${iso}`);
  } else if (path.includes(':') || path.includes('*')) {
    fail(`route à paramètre non prise en charge : ${path} (compléter scripts/pages-routes.mjs)`);
  } else {
    routes.push(path.replace(/^\//, ''));
  }
}

function pageFor(url, { noindex = false } = {}) {
  let html = index
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<link rel="alternate" hreflang="[^"]+" href=")[^"]*(")/g, `$1${url}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  if (noindex) html = html.replace(/(<meta name="robots" content=")[^"]*(")/, '$1noindex$2');
  return html;
}

function write(rel, html) {
  const file = join(dist, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

for (const route of routes) {
  const html = pageFor(SITE + route);
  write(`${route}.html`, html);
  // Un dossier du même nom (ex. dist/data/ pour la route /data) peut faire rediriger Pages vers
  // /data/ : on y place aussi la page pour que cette variante réponde 200.
  const dir = join(dist, route);
  if (existsSync(dir) && statSync(dir).isDirectory()) write(`${route}/index.html`, html);
}
write('404.html', pageFor(SITE, { noindex: true }));

console.log(`pages-routes : ${routes.length} pages de route (dont ${isos.size} pays) et 404.html écrits dans dist/`);
