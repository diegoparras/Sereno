// Prueba end-to-end: carga la extensión en Chromium real, sirve un feed simulado
// en https://www.linkedin.com/feed/ (interceptado, no se conecta a LinkedIn) y
// verifica qué se oculta, qué se atenúa y qué se deja intacto.
// Uso: node tests/e2e.mjs [--shots]
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
const shotDir = join(root, 'docs/screenshots');
if (shots) mkdirSync(shotDir, { recursive: true });

const fixture = readFileSync(join(root, 'tests/fixtures/feed.html'), 'utf8');
const userData = mkdtempSync(join(tmpdir(), 'sereno-e2e-'));

const ctx = await chromium.launchPersistentContext(userData, {
  headless: true,
  channel: 'chromium',
  args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`, '--lang=es'],
  locale: 'es-ES',
  env: { ...process.env, LANGUAGE: 'es' },
  viewport: { width: 1280, height: 800 }
});

await ctx.route('https://www.linkedin.com/**', (route) =>
  route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: fixture })
);

let [sw] = ctx.serviceWorkers();
if (!sw) sw = await ctx.waitForEvent('serviceworker');
const extId = new URL(sw.url()).host;

// Silenciar una palabra antes de abrir el feed
await sw.evaluate(async () => {
  const data = await chrome.storage.sync.get('serenoSettings');
  const s = data.serenoSettings || {};
  s.muted = { words: ['cripto'] };
  await chrome.storage.sync.set({ serenoSettings: s });
});

const page = await ctx.newPage();
await page.goto('https://www.linkedin.com/feed/');
await page.waitForTimeout(1500);

const state = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-id]')).map((el) => ({
    id: el.getAttribute('data-id').split(':').pop(),
    verdict: el.getAttribute('data-sereno'),
    hidden: getComputedStyle(el).display === 'none',
    dim: el.classList.contains('sereno-dim'),
    strip: el.previousElementSibling?.classList.contains('sereno-strip') ? el.previousElementSibling.innerText : null,
    countsVisible: (() => {
      const c = el.querySelector('.social-details-social-counts');
      return c ? getComputedStyle(c).display !== 'none' : null;
    })(),
    followersVisible: (() => {
      const d = el.querySelector('.update-components-actor__description');
      return d ? getComputedStyle(d).visibility !== 'hidden' : null;
    })()
  }))
);
console.table(state);

const byId = Object.fromEntries(state.map((s) => [s.id, s]));
assert.equal(byId[1].hidden, false, 'post de contacto directo visible');
assert.equal(byId[1].countsVisible, false, 'métricas ocultas');
assert.equal(byId[2].hidden, true, 'actividad ajena oculta');
assert.equal(byId[3].hidden, false, 'publicidad intacta');
assert.equal(byId[3].verdict, 'show');
assert.equal(byId[3].followersVisible, false, 'contador de seguidores oculto');
assert.equal(byId[4].hidden, true, 'sugerido oculto');
assert.equal(byId[5].dim, true, 'humo atenuado');
assert.match(byId[5].strip || '', /humo|fluff/i, 'aviso de humo');
assert.equal(byId[6].hidden, true, 'palabra silenciada');
assert.equal(byId[7].hidden, true, 'post cargado después (scroll infinito) también se filtra');

// "Ver igual" revela el post atenuado
await page.click('[data-id="urn:li:activity:5"] >> xpath=preceding-sibling::div[1] >> button');
assert.equal(await page.evaluate(() => document.querySelector('[data-id="urn:li:activity:5"]').classList.contains('sereno-dim')), false);

// Estadísticas
await page.waitForTimeout(1500);
const stats = await sw.evaluate(async () => (await chrome.storage.local.get('serenoStats')).serenoStats);
console.log('stats', stats);
assert.equal(stats.network, 3);
assert.equal(stats.smoke, 1);
assert.equal(stats.muted, 1);

// Pausa global: todo vuelve a la normalidad en vivo
await sw.evaluate(async () => {
  const { serenoSettings } = await chrome.storage.sync.get('serenoSettings');
  await chrome.storage.sync.set({ serenoSettings: { ...serenoSettings, enabled: false } });
});
await page.waitForTimeout(500);
const anyHidden = await page.evaluate(() => document.querySelectorAll('.sereno-hidden, .sereno-dim, .sereno-strip').length);
const metricsOff = await page.evaluate(() => document.documentElement.classList.contains('sereno-no-metrics'));
assert.equal(anyHidden, 0, 'pausa revierte todo');
assert.equal(metricsOff, false);
console.log('✔ e2e ok');

if (shots) {
  // Restaurar ajustes, recargar el feed y sacar capturas
  await sw.evaluate(async () => {
    await chrome.storage.sync.set({ serenoSettings: { muted: { words: ['cripto'] } } });
  });
  await page.reload();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(shotDir, 'feed.png') });

  const popup = await ctx.newPage();
  await popup.setViewportSize({ width: 340, height: 520 });
  await popup.goto(`chrome-extension://${extId}/src/popup/popup.html`);
  await popup.waitForTimeout(400);
  const h = await popup.evaluate(() => document.body.scrollHeight);
  await popup.setViewportSize({ width: 340, height: h });
  await popup.screenshot({ path: join(shotDir, 'popup.png') });
  await popup.emulateMedia({ colorScheme: 'dark' });
  await popup.screenshot({ path: join(shotDir, 'popup-dark.png') });

  const opts = await ctx.newPage();
  await opts.setViewportSize({ width: 900, height: 900 });
  await opts.goto(`chrome-extension://${extId}/src/options/options.html?welcome=1`);
  await opts.waitForTimeout(400);
  await opts.screenshot({ path: join(shotDir, 'options.png'), fullPage: true });
  console.log('capturas en docs/screenshots/');
}

await ctx.close();
