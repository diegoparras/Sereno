// E2E sobre la réplica del feed de LinkedIn 2026 (clases generadas, sin selectores clásicos).
// Uso: node tests/e2e-2026.mjs [--shots]
import { readFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shots = process.argv.includes('--shots');
const fixture = readFileSync(join(root, 'tests/fixtures/feed-2026.html'), 'utf8');

const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'sereno-e2e26-')), {
  headless: true,
  channel: 'chromium',
  args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--lang=es'],
  env: { ...process.env, LANGUAGE: 'es' },
  viewport: { width: 1280, height: 900 }
});
await ctx.route('https://www.linkedin.com/**', (route) =>
  route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: fixture })
);
let [sw] = ctx.serviceWorkers();
if (!sw) sw = await ctx.waitForEvent('serviceworker');

const page = await ctx.newPage();
await page.goto('https://www.linkedin.com/feed/foryou/');
await page.waitForTimeout(1800);

const state = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-lazy-mount-id]')).map((w) => {
    const vis = (el) => el && getComputedStyle(el).visibility !== 'hidden';
    const btnNums = Array.from(w.querySelectorAll('button .k4dgpp')).map((s) => (vis(s) ? s.textContent : '·')).join(' ');
    const followers = Array.from(w.querySelectorAll('span')).find((s) => /seguidores/.test(s.textContent));
    const reactions = Array.from(w.querySelectorAll('a')).find((a) => /reacciones/.test(a.textContent));
    return {
      id: w.getAttribute('data-lazy-mount-id'),
      actor: w.querySelector('.k4dname')?.textContent || '(cargando)',
      verdict: w.getAttribute('data-sereno'),
      hidden: getComputedStyle(w).display === 'none',
      dim: w.classList.contains('sereno-dim'),
      botones: btnNums,
      seguidores: followers ? (vis(followers) ? 'visible' : 'oculto') : '-',
      reacciones: reactions ? (vis(reactions) ? 'visible' : 'oculto') : '-'
    };
  })
);
console.table(state);
const by = Object.fromEntries(state.map((s) => [s.actor, s]));

// La caja "Crear publicación" nunca se toca, y el post "Seguido por…" que comparte envoltorio se oculta solo
const share = await page.evaluate(() => {
  const el = document.getElementById('sharebox');
  return { visible: getComputedStyle(el).display !== 'none', marked: !!el.closest('[data-sereno]') };
});
assert.deepEqual(share, { visible: true, marked: false }, 'caja de publicar intacta');
const masa = await page.evaluate(() => {
  const n = Array.from(document.querySelectorAll('.k4dname')).find((e) => e.textContent === 'Masa Otake');
  const w = n.closest('[data-sereno]');
  return { verdict: w.getAttribute('data-sereno'), includesShareBox: w.contains(document.getElementById('sharebox')) };
});
assert.equal(masa.verdict, 'hide', '"Seguido por" se oculta');
assert.equal(masa.includesShareBox, false, 'el envoltorio no abarca la caja de publicar');
assert.equal(by['Planeta Agua'].hidden, false, 'publicidad intacta');
assert.equal(by['Planeta Agua'].verdict, 'show');
assert.equal(by['Planeta Agua'].seguidores, 'oculto', 'seguidores ocultos');
assert.equal(by['Marta Ruiz'].hidden, false, 'contacto directo visible');
assert.equal(by['Marta Ruiz'].botones, '· · ·', 'números de los botones ocultos');
assert.equal(by['Marta Ruiz'].reacciones, 'oculto', '"N reacciones" oculto');
assert.equal(by['Gurú del Éxito'].hidden, true, '"ha comentado esto" oculto');
assert.equal(by['Acme Software'].hidden, true, '"sigue esta página" oculto');
assert.equal(by['Pablo Vega'].dim, true, 'humo atenuado');
assert.equal(by['Alguien Viral'].hidden, true, 'post de carga diferida también se filtra');
// Que nada ajeno a los posts quede oculto por error
const feedVisible = await page.evaluate(() => getComputedStyle(document.getElementById('feed')).display !== 'none');
assert.ok(feedVisible, 'el contenedor del feed sigue visible');

await page.waitForTimeout(1500);
const stats = await sw.evaluate(async () => (await chrome.storage.local.get('serenoStats')).serenoStats);
console.log('stats', stats);
assert.equal(stats.network, 4);
assert.equal(stats.smoke, 1);
console.log('✔ e2e 2026 ok');

if (shots) {
  mkdirSync(join(root, 'docs/screenshots'), { recursive: true });
  await page.screenshot({ path: join(root, 'docs/screenshots/feed-2026.png') });
}
await ctx.close();
