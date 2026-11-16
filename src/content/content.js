/*
 * Sereno — content script.
 *
 * Qué hace: lee lo que LinkedIn ya te muestra en pantalla y decide qué
 * publicaciones ocultar o atenuar, según tu configuración.
 * Qué NO hace: no junta datos, no hace clics, no envía nada a ningún servidor,
 * no toca la publicidad.
 */
(function () {
  'use strict';

  const Detect = globalThis.SerenoDetect;
  const Settings = globalThis.SerenoSettings;
  if (!Detect || !Settings) return;

  const t = (key, subs) => {
    try {
      return chrome.i18n.getMessage(key, subs) || key;
    } catch (_) {
      return key;
    }
  };

  // Selectores centralizados: LinkedIn cambia su HTML seguido, esto es lo
  // único que hay que tocar cuando pasa.
  //
  // Desde fines de 2026 LinkedIn usa clases generadas (k4dl5v, k4dayy…) que
  // cambian con cada versión: NO hay que usarlas. Nos apoyamos en lo estable:
  // títulos para lectores de pantalla, data-testid, aria-label y textos visibles.
  const SEL = {
    // Título oculto que LinkedIn pone a cada publicación (accesibilidad).
    postHeading: 'h2',
    // Envoltorios candidatos para ocultar una publicación entera, del más
    // externo al más interno. Se elige el primero que contenga UNA sola publicación.
    postWrappers: ['[data-lazy-mount-id]', '[componentkey^="expanded"]', '[role="listitem"]'],
    // HTML clásico (versiones anteriores de LinkedIn)
    legacyPost: [
      '[data-id^="urn:li:activity:"]',
      '[data-id^="urn:li:aggregate:"]',
      '[data-urn^="urn:li:activity:"]',
      '[data-urn^="urn:li:aggregate:"]',
      '.feed-shared-update-v2'
    ].join(','),
    legacyHeader: '.update-components-header, .feed-shared-header',
    legacyMeta: [
      '.update-components-actor__description',
      '.update-components-actor__sub-description',
      '.update-components-actor__supplementary-actor-info'
    ].join(','),
    legacyActorLink: 'a.update-components-actor__meta-link, .update-components-actor a[href]',
    body: [
      '[data-testid="expandable-text-box"]',
      '[componentkey^="translatable-commentary"]',
      '.update-components-text',
      '.feed-shared-inline-show-more-text'
    ].join(','),
    separator: 'hr[role="presentation"], hr',
    actionButton: 'button, a[aria-label]',
    // Fuera del feed (perfiles, páginas): dónde buscar contadores de seguidores
    metricScopes: ['main', '.pv-top-card', '.org-top-card', 'aside'].join(',')
  };

  // "Publicación en el feed" en los idiomas más comunes de LinkedIn
  const POST_HEADING = /^(publicacion en el feed|feed post|publicacao no feed|publication dans le fil|beitrag im feed|post nel feed)$/;

  const ATTR = 'data-sereno';
  let settings = Settings.DEFAULTS;
  let pending = false;
  const statsDelta = { network: 0, smoke: 0, muted: 0 };
  let statsTimer = null;

  // ---------- utilidades ----------

  function onFeed() {
    return location.pathname === '/' || location.pathname.startsWith('/feed');
  }

  function textOf(el) {
    if (!el) return '';
    return (el.innerText || el.textContent || '').trim();
  }

  function textAll(root, selector) {
    return Array.from(root.querySelectorAll(selector)).map(textOf).join(' • ');
  }

  function isPostHeading(el) {
    return POST_HEADING.test(Detect.normalize(el.textContent));
  }

  function headingsIn(el) {
    return Array.from(el.querySelectorAll(SEL.postHeading)).filter(isPostHeading);
  }

  /** Envoltorio más externo que contiene una sola publicación. */
  function wrapperFor(heading) {
    for (const sel of SEL.postWrappers) {
      const w = heading.closest(sel);
      if (w && headingsIn(w).length === 1) return w;
    }
    // Último recurso: subir mientras el padre siga teniendo una sola publicación.
    let el = heading.parentElement;
    if (!el) return null;
    while (el.parentElement && el.parentElement !== document.body && headingsIn(el.parentElement).length === 1) {
      // nunca subir hasta un contenedor con poco más que esta publicación y nada al lado
      if (el.parentElement.children.length > 1) break;
      el = el.parentElement;
    }
    return el;
  }

  function findPosts(scope) {
    const out = new Set();
    for (const h of scope.querySelectorAll(SEL.postHeading)) {
      if (!isPostHeading(h)) continue;
      const w = wrapperFor(h);
      if (w) out.add(w);
    }
    for (const el of scope.querySelectorAll(SEL.legacyPost)) {
      if (!(el.parentElement && el.parentElement.closest(SEL.legacyPost))) out.add(el);
    }
    return Array.from(out);
  }

  function lines(text) {
    return String(text || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  }

  /** El primer enlace que aparece después de `marker` (o el primero, si no hay marker). */
  function firstLinkAfter(root, marker) {
    for (const a of root.querySelectorAll('a[href*="/in/"], a[href*="/company/"], a[href*="/showcase/"], a[href*="/school/"]')) {
      if (!marker || marker.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING) return a;
    }
    return null;
  }

  function extract(root) {
    const bodyEl = root.querySelector(SEL.body);
    const body = textOf(bodyEl);
    const all = lines(textOf(root)).filter((l) => !POST_HEADING.test(Detect.normalize(l)));

    // Líneas de cabecera: todo lo que está antes del texto del post.
    const bodyLines = new Set(lines(body));
    const top = [];
    for (const l of all) {
      if (bodyLines.has(l) || top.length >= 10) break;
      top.push(l);
    }

    // Contexto social ("X sigue esta página", "A X le gusta esto"): está en las
    // dos primeras líneas. Primero el HTML clásico, después el texto.
    let header = textAll(root, SEL.legacyHeader);
    if (!header) header = top.slice(0, 2).find((l) => Detect.socialContext(l)) || '';

    // Si hubo contexto, el autor real viene después del separador.
    const sep = header ? root.querySelector(SEL.separator) : null;
    const legacyLink = root.querySelector(SEL.legacyActorLink);
    const link = legacyLink || firstLinkAfter(root, sep);

    return {
      header,
      meta: textAll(root, SEL.legacyMeta) || top.filter((l) => l !== header).join(' • '),
      actorHref: link ? link.getAttribute('href') : '',
      body: body || all.join('\n')
    };
  }

  function reasonLabel(result) {
    if (result.category === 'muted') return t('reasonMuted', [result.detail || '']);
    const r = result.reasons[0];
    const map = {
      suggested: 'reasonSuggested',
      activity: 'reasonActivity',
      notDirect: 'reasonNotDirect',
      page: 'reasonPage'
    };
    if (map[r]) return t(map[r]);
    return result.reasons.map((x) => t('smoke_' + x)).join(' · ');
  }

  // ---------- aplicar / revertir ----------

  function reset(root) {
    root.classList.remove('sereno-hidden', 'sereno-dim', 'sereno-labeled');
    root.removeAttribute(ATTR);
    root.removeAttribute('data-sereno-len');
    const prev = root.previousElementSibling;
    if (prev && prev.classList.contains('sereno-strip')) prev.remove();
  }

  function makeStrip(root, result, kind) {
    const strip = document.createElement('div');
    strip.className = `sereno-strip sereno-strip--${kind}`;
    strip.setAttribute('role', 'note');

    const mark = document.createElement('span');
    mark.className = 'sereno-strip__mark';
    mark.setAttribute('aria-hidden', 'true');

    const label = document.createElement('span');
    label.className = 'sereno-strip__label';
    label.textContent = kind === 'hidden' ? t('stripHidden', [reasonLabel(result)]) : t('stripSmoke', [reasonLabel(result)]);

    strip.append(mark, label);

    if (kind !== 'label') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sereno-strip__btn';
      btn.textContent = t('stripShow');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        root.setAttribute('data-sereno-revealed', '1');
        reset(root);
      });
      strip.append(btn);
    }
    root.before(strip);
  }

  function count(category) {
    if (!category || !(category in statsDelta)) return;
    statsDelta[category] += 1;
    clearTimeout(statsTimer);
    statsTimer = setTimeout(flushStats, 1200);
  }

  function flushStats() {
    const delta = { ...statsDelta };
    statsDelta.network = statsDelta.smoke = statsDelta.muted = 0;
    if (delta.network + delta.smoke + delta.muted === 0) return;
    Settings.addStats(delta).catch(() => {});
  }

  function processPost(root) {
    if (root.hasAttribute('data-sereno-revealed')) return;
    // El feed nuevo carga cada publicación por partes. Si ya la evaluamos como
    // "mostrar" pero su contenido creció, la volvemos a evaluar.
    const len = String((root.textContent || '').length);
    const prev = root.getAttribute(ATTR);
    if (prev && (prev !== 'show' || root.getAttribute('data-sereno-len') === len)) return;

    const post = extract(root);
    // Todavía sin contenido: reintentamos en la próxima mutación.
    if (!post.body && !post.header) return;
    root.setAttribute('data-sereno-len', len);

    const result = Detect.classify(post, settings);
    root.setAttribute(ATTR, result.verdict);
    if (result.verdict === 'show') return;

    const counted = root.hasAttribute('data-sereno-counted');
    if (!counted) {
      root.setAttribute('data-sereno-counted', '1');
      count(result.category);
    }

    if (result.verdict === 'hide') {
      root.classList.add('sereno-hidden');
      if (settings.display.showPlaceholders) makeStrip(root, result, 'hidden');
    } else if (result.verdict === 'dim') {
      root.classList.add('sereno-dim');
      makeStrip(root, result, 'dim');
    } else if (result.verdict === 'label') {
      root.classList.add('sereno-labeled');
      makeStrip(root, result, 'label');
    }
  }

  const COUNT_ONLY = /^[\d.,\s]+(k|m|mil|mill\.?)?\+?$/i;

  function mark(el) {
    el.setAttribute('data-sereno-metric', '');
  }

  /** Oculta contadores dentro de un bloque (una publicación o una tarjeta de perfil). */
  function hideMetricsIn(scope) {
    for (const el of scope.querySelectorAll('span, p, div, a, li')) {
      if (el.hasAttribute('data-sereno-metric')) continue;
      if (el.childElementCount > 2) continue;
      const text = (el.textContent || '').trim();
      if (!text || text.length > 40) continue;

      // "174.617 seguidores", "614 reacciones", "21 comentarios"…
      if (Detect.isMetricText(text)) {
        // Si el texto ocupa todo un enlace (p. ej. "614 reacciones" + íconos), ocultamos el enlace.
        const a = el.closest('a');
        if (a && scope.contains(a) && (a.textContent || '').trim() === text) mark(a);
        else mark(el);
        continue;
      }
      // Números sueltos dentro de botones con ícono: 👍 614 · 💬 21 · 🔁 62
      if (el.childElementCount === 0 && COUNT_ONLY.test(text)) {
        const btn = el.closest(SEL.actionButton);
        if (btn && scope.contains(btn) && btn.querySelector('svg')) mark(el);
      }
    }
  }

  function processMetrics(scope, posts) {
    if (!settings.enabled || !settings.metrics.enabled) return;
    for (const p of posts) hideMetricsIn(p);
    if (!onFeed()) {
      const scopes = [];
      if (scope.matches && scope.matches(SEL.metricScopes)) scopes.push(scope);
      scopes.push(...scope.querySelectorAll(SEL.metricScopes));
      for (const s of scopes) {
        for (const el of s.querySelectorAll('span, p, div, li')) {
          if (el.childElementCount > 1 || el.hasAttribute('data-sereno-metric')) continue;
          if (Detect.isMetricText(el.textContent)) mark(el);
        }
      }
    }
  }

  function run(scope) {
    scope = scope || document;
    document.documentElement.classList.toggle('sereno-no-metrics', settings.enabled && settings.metrics.enabled);
    const root = scope === document ? document.body || document.documentElement : scope;
    if (!root) return;
    const posts = findPosts(root);
    processMetrics(root, posts);
    if (!settings.enabled || !onFeed()) return;
    for (const post of posts) processPost(post);
  }

  function resetAll() {
    for (const el of document.querySelectorAll(`[${ATTR}]`)) reset(el);
    for (const el of document.querySelectorAll('.sereno-strip')) el.remove();
    for (const el of document.querySelectorAll('[data-sereno-metric]')) el.removeAttribute('data-sereno-metric');
  }

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      run(document);
    });
  }

  // ---------- arranque ----------

  async function start() {
    try {
      settings = await Settings.load();
    } catch (_) {
      settings = Settings.DEFAULTS;
    }
    const observe = () => {
      run(document);
      new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe, { once: true });
    else observe();

    Settings.onChange((next) => {
      settings = next;
      resetAll();
      run(document);
    });

    // LinkedIn es una SPA: al navegar re-evaluamos.
    let lastPath = location.pathname;
    setInterval(() => {
      if (location.pathname !== lastPath) {
        lastPath = location.pathname;
        schedule();
      }
    }, 800);
    window.addEventListener('pagehide', flushStats);
  }

  // Mientras carga la config, aplicamos ya la clase de métricas por defecto
  // para evitar el "parpadeo" de números.
  if (Settings.DEFAULTS.metrics.enabled) document.documentElement.classList.add('sereno-no-metrics');
  start();
})();
