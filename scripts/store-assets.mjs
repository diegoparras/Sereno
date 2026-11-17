// Genera las imágenes para la Chrome Web Store en dist/store/<idioma>/.
// Requiere haber corrido antes `npm run screenshots` (usa docs/screenshots/*).
// Solo usa el feed de prueba: nunca datos reales de terceros.
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const img = (name) => `data:image/png;base64,${readFileSync(join(root, 'docs/screenshots', name)).toString('base64')}`;
const icon = `data:image/png;base64,${readFileSync(join(root, 'icons/icon-128.png')).toString('base64')}`;

const COPY = {
  es: [
    { file: 'feed-2026.png', kicker: 'Solo mi red', title: 'Vuelve a ver a la gente que conoces.', body: 'Sin «le gustó», «comentó» ni sugeridos de desconocidos. Y sin números: lees el contenido, no el marcador.', crop: { x: 340, y: 340, w: 600, h: 560 } },
    { file: 'caught-up.png', kicker: 'Ya estás al día', title: 'Se acabó el scroll infinito.', body: 'Cuando ya viste lo nuevo, Sereno te avisa y pone en pausa el resto.', crop: { x: 330, y: 250, w: 640, h: 600 } },
    { file: 'menu.png', kicker: 'Tú decides', title: 'Silencia o protege a cada persona.', body: 'Con un clic en el botón que acompaña al post que estás leyendo, o con el teclado: M silencia, P protege, J/K navegan.', crop: null },
    { file: 'popup.png', kicker: 'Privada por diseño', title: 'Todo queda en tu navegador.', body: 'Sin servidores, sin analítica, sin cuentas. Y nunca toca la publicidad.', crop: null, narrow: true }
  ],
  en: [
    { file: 'feed-2026.png', kicker: 'Just my network', title: 'See the people you actually know again.', body: 'No “liked this”, “commented” or suggested strangers. And no numbers: read the content, not the scoreboard.', crop: { x: 340, y: 340, w: 600, h: 560 } },
    { file: 'caught-up.png', kicker: 'All caught up', title: 'The end of infinite scroll.', body: 'When you have seen what is new, Sereno tells you and pauses the rest.', crop: { x: 330, y: 250, w: 640, h: 600 } },
    { file: 'menu.png', kicker: 'You decide', title: 'Mute or protect anyone.', body: 'One click on the button that follows the post you are reading, or the keyboard: M mutes, P protects, J/K navigate.', crop: null },
    { file: 'popup.png', kicker: 'Private by design', title: 'Everything stays in your browser.', body: 'No servers, no analytics, no accounts. And it never touches ads.', crop: null, narrow: true }
  ]
};
const TAGLINE = { es: 'Tu feed, sin ruido.', en: 'Your feed, without the noise.' };

const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; color: #16302a; }
  .stage { width: 1280px; height: 800px; display: grid; grid-template-columns: 430px 1fr; align-items: center; gap: 48px; padding: 0 64px;
    background: radial-gradient(1200px 700px at 85% 20%, #e6f3ee 0%, #f3f7f5 55%, #eef3f1 100%); overflow: hidden; }
  .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 40px; font-weight: 700; font-size: 22px; }
  .brand img { width: 44px; height: 44px; border-radius: 12px; }
  .kicker { display: inline-block; padding: 6px 14px; border-radius: 999px; background: #dcefe8; color: #2f7d6b; font-weight: 700; font-size: 15px; margin-bottom: 18px; }
  h1 { font-size: 44px; line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 18px; }
  p { font-size: 19px; line-height: 1.5; color: #4a615b; }
  .shot { justify-self: center; border-radius: 18px; overflow: hidden; background: #fff; box-shadow: 0 30px 80px rgba(22,48,42,.18), 0 2px 6px rgba(22,48,42,.08); border: 1px solid #dfe8e4; }
  .shot img { display: block; }
`;

function frame(lang, c) {
  const style = c.crop
    ? `width:${c.crop.w}px;height:${Math.min(c.crop.h, 680)}px;object-fit:none;object-position:-${c.crop.x}px -${c.crop.y}px;`
    : c.narrow
      ? 'width:340px;'
      : 'max-width:680px;max-height:640px;';
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style></head><body>
    <div class="stage">
      <div>
        <div class="brand"><img src="${icon}">Sereno</div>
        <span class="kicker">${c.kicker}</span>
        <h1>${c.title}</h1>
        <p>${c.body}</p>
      </div>
      <div class="shot"><img src="${img(c.file)}" style="${style}"></div>
    </div></body></html>`;
}

function promo(lang) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
    .tile { width: 440px; height: 280px; display: grid; place-items: center; text-align: center;
      background: linear-gradient(135deg, #2f7d6b, #1f5c4e); color: #fff; }
    .tile img { width: 84px; height: 84px; border-radius: 22px; box-shadow: 0 10px 30px rgba(0,0,0,.25); margin-bottom: 14px; }
    .tile h2 { font-size: 34px; letter-spacing: -0.02em; }
    .tile p { color: #d6ece5; font-size: 17px; margin-top: 4px; }
  </style></head><body><div class="tile"><div><img src="${icon}"><h2>Sereno</h2><p>${TAGLINE[lang]}</p></div></div></body></html>`;
}

const browser = await chromium.launch();
for (const lang of Object.keys(COPY)) {
  const out = join(root, 'dist/store', lang);
  mkdirSync(out, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  for (const [i, c] of COPY[lang].entries()) {
    await page.setContent(frame(lang, c));
    await page.screenshot({ path: join(out, `screenshot-${i + 1}.png`) });
  }
  await page.close();
  const tile = await browser.newPage({ viewport: { width: 440, height: 280 }, deviceScaleFactor: 1 });
  await tile.setContent(promo(lang));
  await tile.screenshot({ path: join(out, 'promo-440x280.png') });
  await tile.close();
  console.log(`dist/store/${lang}: 4 capturas + promo`);
}
await browser.close();
