// E2E de "Control por persona" y "Ya estás al día" sobre la réplica del feed 2026.
// Uso: node tests/e2e-features.mjs [--shots]
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
const fixture = readFileSync(join(root, 'tests/fixtures/feed-2026.html'), 'utf8');

const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'sereno-feat-')), {
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
const setSettings = (patch) =>
  sw.evaluate(async (patch) => {
    const { serenoSettings = {} } = await chrome.storage.sync.get('serenoSettings');
    await chrome.storage.sync.set({ serenoSettings: { ...serenoSettings, ...patch } });
  }, patch);

const page = await ctx.newPage();
const wrapperOf = (name) => page.locator('[data-lazy-mount-id]', { has: page.locator('.k4dname', { hasText: name }) });
const isHidden = (name) => wrapperOf(name).evaluate((w) => getComputedStyle(w).display === 'none');
const focus = async (name) => {
  // Los envoltorios usan display: contents (sin caja): se scrollea la tarjeta.
  await wrapperOf(name).evaluate((w) => (w.querySelector('[role="listitem"]') || w).scrollIntoView({ block: 'center' }));
  // En headless Chrome casi no produce cuadros, así que los eventos de scroll
  // llegan tarde; el respaldo de 500 ms de Sereno lo cubre.
  await page.waitForTimeout(700);
};
const dockBtn = page.locator('.sereno-dock__btn');
const openDock = async (name) => {
  await focus(name);
  await dockBtn.click();
};

// Sin límite para probar primero el menú
await setSettings({ caughtUp: { enabled: true, limit: 0 } });
await page.goto('https://www.linkedin.com/feed/');
await page.waitForTimeout(1500);

// ---------- 1. Silenciar con un clic ----------
// La "hidratación" simulada borra el control: Sereno lo tiene que volver a poner
await page.waitForFunction(() => window.__hydrated === true);
await page.waitForTimeout(700);
assert.equal(await page.evaluate(() => window.scrollY), 0, 'el scroll es interno, como en LinkedIn');

// El control está siempre visible y sigue a la publicación en foco
await focus('Marta Ruiz');
assert.ok(await page.evaluate(() => document.querySelector('main').scrollTop > 0), 'scrolleó el contenedor interno');
assert.equal(await dockBtn.isVisible(), true, 'control siempre visible');
assert.match(await dockBtn.getAttribute('aria-label'), /Marta Ruiz/);
const geo = await page.evaluate(() => {
  const b = document.querySelector('.sereno-dock__btn').getBoundingClientRect();
  const card = Array.from(document.querySelectorAll('.k4dname')).find((e) => e.textContent === 'Marta Ruiz').closest('[role="listitem"]').getBoundingClientRect();
  return { outside: b.left >= card.right, alignedTop: b.top >= card.top && b.top <= card.top + 40, b: [b.left, b.top], c: [card.top, card.right] };
});
assert.deepEqual({ outside: geo.outside, alignedTop: geo.alignedTop }, { outside: true, alignedTop: true }, 'en el margen, a la altura del post');
await focus('Pablo Vega');
assert.match(await dockBtn.getAttribute('aria-label'), /Pablo Vega/, 'cambia al post en foco');
await focus('Planeta Agua');
assert.match(await dockBtn.getAttribute('aria-label'), /Planeta Agua/);

await openDock('Marta Ruiz');
const menu = page.locator('.sereno-menu');
const items = await menu.locator('.sereno-menu__label').allTextContents();
console.log('menú:', items);
assert.deepEqual(items, ['Nunca ocultar a Marta Ruiz', 'Silenciar a Marta Ruiz']);
if (shots) await page.screenshot({ path: join(shotDir, 'menu.png'), clip: { x: 300, y: 150, width: 700, height: 420 } });
await menu.locator('.sereno-menu__item', { hasText: 'Silenciar' }).click();
await page.waitForTimeout(500);
assert.equal(await isHidden('Marta Ruiz'), true, 'Marta silenciada');
const strip = page.locator('.sereno-strip--muted-person');
assert.match(await strip.innerText(), /Silenciaste a Marta Ruiz/);
const peopleAfterMute = await sw.evaluate(async () => (await chrome.storage.local.get('serenoPeople')).serenoPeople);
assert.deepEqual(peopleAfterMute.muted, { 'in/marta': 'Marta Ruiz' });

// Deshacer
await strip.locator('button').click();
await page.waitForTimeout(500);
assert.equal(await isHidden('Marta Ruiz'), false, 'Deshacer la vuelve a mostrar');
assert.equal(await page.locator('.sereno-strip--muted-person').count(), 0);
console.log('✔ silenciar y deshacer');

// ---------- 2. Proteger a alguien atenuado como humo ----------
const pablo = wrapperOf('Pablo Vega');
const isDim = (w) => w.classList.contains('sereno-dim') || !!w.querySelector('.sereno-dim');
assert.equal(await pablo.evaluate(isDim), true);
await openDock('Pablo Vega');
await menu.locator('.sereno-menu__item', { hasText: 'Nunca ocultar' }).click();
await page.waitForTimeout(500);
assert.equal(await pablo.evaluate(isDim), false, 'protegido ya no se atenúa');
await openDock('Pablo Vega');
assert.deepEqual(await menu.locator('.sereno-menu__label').allTextContents(), ['Volver a filtrar a Pablo Vega', 'Silenciar a Pablo Vega']);
await page.keyboard.press('Escape');
assert.equal(await menu.count(), 0, 'Escape cierra el menú');
console.log('✔ proteger');

// La publicidad no tiene menú de Sereno ni se toca (sí puede tenerlo: es visible, pero la regla de publicidad gana)
const adVerdict = await wrapperOf('Planeta Agua').getAttribute('data-sereno');
assert.equal(adVerdict, 'show');

// ---------- 2b. Atajos de teclado ----------
await focus('Marta Ruiz');
await page.locator('body').click({ position: { x: 5, y: 5 } });
await page.keyboard.press('j');
await page.waitForTimeout(1200);
assert.match(await dockBtn.getAttribute('aria-label'), /Pablo Vega/, 'J pasa al siguiente post');
await page.keyboard.press('k');
await page.waitForTimeout(1200);
assert.match(await dockBtn.getAttribute('aria-label'), /Marta Ruiz/, 'K vuelve al anterior');
await page.keyboard.press('p');
await page.waitForTimeout(300);
assert.match(await page.locator('.sereno-toast').innerText(), /nunca ocultará a Marta Ruiz/, 'P protege y avisa');
let ppl = await sw.evaluate(async () => (await chrome.storage.local.get('serenoPeople')).serenoPeople);
assert.equal(ppl.trusted['in/marta'], 'Marta Ruiz');
await page.keyboard.press('p');
await page.waitForTimeout(300);
ppl = await sw.evaluate(async () => (await chrome.storage.local.get('serenoPeople')).serenoPeople);
assert.equal(ppl.trusted['in/marta'], undefined, 'P de nuevo deja de proteger');
// No interfiere al escribir
await page.evaluate(() => {
  const i = document.createElement('textarea');
  i.id = 'typing';
  document.querySelector('main').prepend(i);
});
await page.locator('#typing').focus();
await page.keyboard.type('mjkp');
ppl = await sw.evaluate(async () => (await chrome.storage.local.get('serenoPeople')).serenoPeople);
assert.equal(await page.locator('#typing').inputValue(), 'mjkp', 'al escribir, las teclas no se capturan');
assert.equal(Object.keys(ppl.muted).length, 0);
await page.locator('#typing').evaluate((i) => i.remove());
console.log('✔ atajos de teclado');

// ---------- 2c. Números de la columna lateral ----------
const sidebar = await page.evaluate(() => ({
  views: getComputedStyle(document.getElementById('views')).visibility,
  impr: getComputedStyle(document.getElementById('impr')).visibility
}));
assert.deepEqual(sidebar, { views: 'hidden', impr: 'hidden' }, 'números de la columna lateral ocultos');
console.log('✔ números de la columna lateral');

// ---------- 3. "Ya estás al día" por límite ----------
await setSettings({ caughtUp: { enabled: true, limit: 2 } });
await page.waitForTimeout(800);
const card = page.locator('.sereno-caught');
assert.equal(await card.count(), 1, 'aparece la tarjeta al pasar el límite');
assert.match(await card.innerText(), /Buen momento para una pausa/);
assert.match(await card.innerText(), /2 publicaciones/);
const walled = await page.locator('.sereno-walled').count();
assert.ok(walled >= 1, 'lo que sigue queda en pausa');
if (shots) {
  await card.scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(shotDir, 'caught-up.png') });
}
await card.locator('button').click();
assert.equal(await page.locator('.sereno-caught').count(), 0);
assert.equal(await page.locator('.sereno-walled').count(), 0, '"Seguir viendo" libera todo');
console.log('✔ pausa por límite y "Seguir viendo"');

// ---------- 4. "Ya estás al día" por publicaciones ya vistas ----------
await setSettings({ caughtUp: { enabled: true, limit: 0 } });
// Recorrer el feed para que Sereno registre lo visto
for (const name of ['Planeta Agua', 'Marta Ruiz', 'Pablo Vega']) {
  await focus(name);
}
await page.waitForTimeout(2600); // se guarda cada 2 s
const seen = await sw.evaluate(async () => Object.keys((await chrome.storage.local.get('serenoSeen')).serenoSeen || {}).length);
console.log('huellas guardadas:', seen);
assert.ok(seen >= 3);

await page.reload();
await page.waitForTimeout(1800);
const card2 = page.locator('.sereno-caught');
assert.equal(await card2.count(), 1, 'tarjeta al volver y ver solo cosas vistas');
assert.match(await card2.innerText(), /Ya estás al día/);
console.log('✔ al día por publicaciones ya vistas');

// ---------- 5. Ajustes muestran las personas ----------
const opts = await ctx.newPage();
const extId = new URL(sw.url()).host;
await opts.goto(`chrome-extension://${extId}/src/options/options.html`);
await opts.waitForTimeout(400);
assert.match(await opts.locator('#trustedList').innerText(), /Pablo Vega/);
if (shots) await opts.screenshot({ path: join(shotDir, 'options.png'), fullPage: true });
console.log('✔ e2e funciones ok');
await ctx.close();
