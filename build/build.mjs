import { access, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { renderImprint, renderIndex, renderRequest } from './render.mjs';

const root = new URL('../', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));

export async function loadContent() {
  const [{ site }, { legal }] = await Promise.all([
    readJson('content/de/site.json'),
    readJson('content/de/legal.json')
  ]);
  return { site, legal };
}

async function validate({ site }) {
  if (!Array.isArray(site.directions) || site.directions.length === 0) {
    throw new Error('site.directions must contain at least one direction.');
  }
  const ids = new Set();
  for (const direction of site.directions) {
    if (!/^[a-z0-9]+$/.test(direction.id) || ids.has(direction.id)) {
      throw new Error(`Invalid or duplicate direction id: ${direction.id}`);
    }
    ids.add(direction.id);
    try {
      await access(new URL(`public/style/direction-${direction.id}.css`, root));
    } catch {
      throw new Error(`Direction "${direction.id}" requires public/style/direction-${direction.id}.css.`);
    }
    if (!(direction.id in site.hero.media)) {
      throw new Error(`Direction "${direction.id}" requires a hero.media slot.`);
    }
  }
  if (!site.request || !Array.isArray(site.request.steps) || site.request.steps.length !== 6) {
    throw new Error('site.request must define six steps.');
  }
}

async function main() {
  const content = await loadContent();
  await validate(content);
  await Promise.all([
    writeFile(new URL('public/index.html', root), renderIndex(content)),
    writeFile(new URL('public/imprint.html', root), renderImprint(content)),
    writeFile(new URL('public/gutachten-anfragen.html', root), renderRequest(content))
  ]);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(`Build failed: ${error.message}`);
    process.exitCode = 1;
  });
}
