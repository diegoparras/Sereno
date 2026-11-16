import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const D = require('../src/content/detectors.js');
const S = require('../src/shared/settings.js');

const defaults = () => S.merge(S.DEFAULTS, {});
const post = (p) => ({ header: '', meta: '', actorHref: '/in/alguien/', body: '', ...p });

test('contexto social: actividad ajena en es/en/pt', () => {
  for (const h of [
    'A María López le gusta esto',
    'A Juan y 12 personas más les gusta esto',
    'Pedro Gómez ha comentado esto',
    'Ana comentó esto',
    'Lucía compartió esto',
    'John Smith likes this',
    'Jane and 3 others like this',
    'Mark commented on this',
    'Sara reposted this',
    'Kim finds this insightful',
    'Carlos gostou disso'
  ]) {
    assert.equal(D.socialContext(h), 'activity', h);
  }
});

test('contexto social: sugeridos', () => {
  for (const h of ['Sugerencias', 'Sugerido', 'Suggested', 'Recomendado para ti', 'Popular en LinkedIn']) {
    assert.equal(D.socialContext(h), 'suggested', h);
  }
});

test('contexto social: sin contexto no dispara', () => {
  for (const h of ['', 'María López', 'Ingeniera de software en Acme']) {
    assert.equal(D.socialContext(h), null, h);
  }
});

test('nunca se toca la publicidad', () => {
  const s = defaults();
  for (const meta of ['Promocionado', 'Promoted', 'Patrocinado', 'Acme • Promovido']) {
    const r = D.classify(post({ meta, header: 'Sugerido', body: 'Comenta "SÍ" y te mando el PDF ♻️' }), s);
    assert.equal(r.verdict, 'show', meta);
    assert.equal(r.category, 'promoted');
  }
});

test('"Promocionado" dentro del texto del post no lo exime', () => {
  const r = D.classify(post({ header: 'Sugerido', body: 'Me promocionaron a gerente' }), defaults());
  assert.equal(r.verdict, 'hide');
});

test('solo mi red: oculta actividad ajena y sugeridos', () => {
  const s = defaults();
  assert.equal(D.classify(post({ header: 'A Juan le gusta esto' }), s).verdict, 'hide');
  assert.equal(D.classify(post({ header: 'Suggested' }), s).verdict, 'hide');
  assert.equal(D.classify(post({ body: 'Hoy empecé en un trabajo nuevo.' }), s).verdict, 'show');
});

test('solo mi red: respeta los interruptores', () => {
  const s = defaults();
  s.network.hideSocialActivity = false;
  assert.equal(D.classify(post({ header: 'A Juan le gusta esto' }), s).verdict, 'show');
  s.network.enabled = false;
  assert.equal(D.classify(post({ header: 'Sugerido' }), s).verdict, 'show');
});

test('modo estricto: grados y páginas', () => {
  const s = defaults();
  s.network.onlyDirect = true;
  assert.equal(D.classify(post({ meta: 'Ana • 2º • Diseñadora' }), s).verdict, 'hide');
  assert.equal(D.classify(post({ meta: 'Bob • 3rd+ • Founder' }), s).verdict, 'hide');
  assert.equal(D.classify(post({ meta: 'Ana • 1er • Diseñadora' }), s).verdict, 'show');
  assert.equal(D.classify(post({ meta: 'Bob • 1st • Founder' }), s).verdict, 'show');
  // grado desconocido: ante la duda, se muestra
  assert.equal(D.classify(post({ meta: 'Diseñadora en Acme' }), s).verdict, 'show');
  // páginas de empresa
  const page = post({ actorHref: 'https://www.linkedin.com/company/acme/', meta: '12.345 seguidores' });
  assert.equal(D.classify(page, s).verdict, 'show');
  s.network.keepFollowedPages = false;
  assert.equal(D.classify(page, s).verdict, 'hide');
});

test('modo estricto apagado: no filtra por grado', () => {
  assert.equal(D.classify(post({ meta: 'Bob • 3rd+' }), defaults()).verdict, 'show');
});

const BAIT_ES = 'Armé una guía con 50 prompts para vender más.\n\nComenta "GUÍA" y te la mando por privado.\n\n♻️ Comparte si te sirvió';
const BAIT_EN = 'I built a 40-page playbook on hiring.\n\nComment "PLAYBOOK" and I will DM it to you.\n\nRepost ♻️ to help your network.';
const BROETRY = [
  'Hace 5 años me despidieron.',
  'No tenía nada.',
  'Ni ahorros.',
  'Ni contactos.',
  'Pero tenía un sueño.',
  'Hoy facturo 7 cifras.',
  '¿La clave?',
  'Nunca rendirse.',
  'Léelo de nuevo.'
].join('\n\n');
const NORMAL = [
  'Después de cuatro años en Acme, esta semana empiezo un nuevo desafío como líder de datos en Globex.',
  'Me llevo muchísimo aprendizaje del equipo de plataforma, y en especial de Marta y Diego, que me enseñaron a revisar código con paciencia.',
  'Si alguien está pensando en migrar pipelines de batch a streaming, escríbanme: tengo notas largas sobre lo que nos salió mal.'
].join('\n\n');

test('humo: detecta cebos y plantillas', () => {
  const s = defaults();
  for (const body of [BAIT_ES, BAIT_EN, BROETRY]) {
    const r = D.classify(post({ body }), s);
    assert.equal(r.category, 'smoke', body.slice(0, 40));
    assert.equal(r.verdict, 'dim');
  }
  assert.ok(D.smokeScore(BAIT_ES).reasons.includes('bait'));
  assert.ok(D.smokeScore(BROETRY).reasons.includes('hook'));
  assert.ok(D.smokeScore(BROETRY).reasons.includes('format'));
});

test('humo: un post normal y largo no dispara', () => {
  const r = D.classify(post({ body: NORMAL }), defaults());
  assert.equal(r.verdict, 'show');
  assert.equal(D.smokeScore(NORMAL).score, 0);
});

test('humo: un anuncio de trabajo de alguien de tu red no es humo', () => {
  const body = '¡Feliz de contarles que empiezo como Product Manager en Acme! Gracias a todos los que me ayudaron en la búsqueda.';
  assert.equal(D.classify(post({ body }), defaults()).verdict, 'show');
});

test('humo: sensibilidad y acción', () => {
  const s = defaults();
  const hashtagOnly = 'Gran evento hoy con el equipo.\n#ia #datos #liderazgo #ventas #marketing #innovacion';
  assert.equal(D.classify(post({ body: hashtagOnly }), s).verdict, 'show');
  s.smoke.sensitivity = 'high';
  s.smoke.action = 'hide';
  // 1 punto: todavía no alcanza ni en estricta
  assert.equal(D.classify(post({ body: hashtagOnly }), s).verdict, 'show');
  assert.equal(D.classify(post({ body: BAIT_EN }), s).verdict, 'hide');
  s.smoke.sensitivity = 'low';
  s.smoke.action = 'label';
  assert.equal(D.classify(post({ body: BAIT_EN }), s).verdict, 'label');
});

test('palabras silenciadas: palabra completa, sin acentos ni mayúsculas', () => {
  const s = defaults();
  s.muted.words = ['cripto', 'inteligencia artificial'];
  assert.equal(D.classify(post({ body: 'Mi opinión sobre CRIPTO hoy' }), s).verdict, 'hide');
  assert.equal(D.classify(post({ body: 'La Inteligencia Artificial cambió todo' }), s).detail, 'inteligencia artificial');
  assert.equal(D.classify(post({ body: 'Criptografía aplicada' }), s).verdict, 'show');
});

test('pausa global: no hace nada', () => {
  const s = defaults();
  s.enabled = false;
  assert.equal(D.classify(post({ header: 'Sugerido', body: BAIT_ES }), s).verdict, 'show');
});

test('métricas: reconoce contadores de seguidores', () => {
  for (const txt of ['12.345 seguidores', '1,2 mil seguidores', '500+ connections', '3,456 followers', '89 seguidores']) {
    assert.ok(D.isMetricText(txt), txt);
  }
  for (const txt of ['Diseñadora • 2º', 'Gracias a mis seguidores por todo', 'followers']) {
    assert.ok(!D.isMetricText(txt), txt);
  }
});

test('configuración: merge tolera datos viejos o corruptos', () => {
  const m = S.merge(S.DEFAULTS, { enabled: 'sí', smoke: { action: 'hide', extra: 1 }, muted: { words: 'x' } });
  assert.equal(m.enabled, true);
  assert.equal(m.smoke.action, 'hide');
  assert.equal(m.smoke.sensitivity, 'medium');
  assert.deepEqual(m.muted.words, []);
  assert.equal('extra' in m.smoke, false);
});
