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
  // único que hay que tocar cuando pasa. Se listan de más nuevo a más viejo.
  const SEL = {
    post: [
      '[data-id^="urn:li:activity:"]',
      '[data-id^="urn:li:aggregate:"]',
      '[data-urn^="urn:li:activity:"]',
      '[data-urn^="urn:li:aggregate:"]',
      '[data-view-name="feed-full-update"]',
      '.feed-shared-update-v2'
    ].join(','),
    header: [
      '.update-components-header',
      '.feed-shared-header',
      '[data-view-name="feed-header-text"]'
    ].join(','),
    meta: [
      '.update-components-actor__description',
      '.update-components-actor__sub-description',
      '.update-components-actor__supplementary-actor-info',
      '.feed-shared-actor__description',
      '.feed-shared-actor__sub-description'
    ].join(','),
    actorLink: [
      'a.update-components-actor__meta-link',
      '.update-components-actor a[href]',
      '.feed-shared-actor a[href]'
    ].join(','),
    body: [
      '.update-components-text',
      '.feed-shared-update-v2__description',
      '.feed-shared-inline-show-more-text',
      '[data-view-name="feed-commentary"]'
    ].join(','),
    metricScopes: [
      '.update-components-actor',
      '.feed-shared-actor',
      '.pv-top-card',
      '.org-top-card',
      '.artdeco-entity-lockup__caption',
      '.entity-result__primary-subtitle',
      '.feed-identity-module'
    ].join(',')
  };

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

  function outermostPosts(scope) {
    const found = Array.from(scope.querySelectorAll(SEL.post));
    if (scope.matches && scope.matches(SEL.post)) found.unshift(scope);
    return found.filter((el) => !(el.parentElement && el.parentElement.closest(SEL.post)));
  }

  function extract(root) {
    let header = textAll(root, SEL.header);
    const full = textOf(root);
    if (!header) {
      // Respaldo si cambia el HTML: la primera línea corta suele ser el contexto.
      const first = full.split('\n').map((l) => l.trim()).find(Boolean) || '';
      if (first.length < 140) header = first;
    }
    const linkEl = root.querySelector(SEL.actorLink);
    return {
      header,
      meta: textAll(root, SEL.meta),
      actorHref: linkEl ? linkEl.getAttribute('href') : '',
      body: textAll(root, SEL.body) || full
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
    if (root.hasAttribute(ATTR) || root.hasAttribute('data-sereno-revealed')) return;
    const post = extract(root);
    // Todavía sin contenido (LinkedIn carga de a partes): reintentamos luego.
    if (!post.body && !post.header) return;

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

  function processMetrics(scope) {
    if (!settings.enabled || !settings.metrics.enabled) return;
    const scopes = [];
    if (scope.matches && scope.matches(SEL.metricScopes)) scopes.push(scope);
    scopes.push(...scope.querySelectorAll(SEL.metricScopes));
    for (const s of scopes) {
      for (const el of s.querySelectorAll('span, div, li, p')) {
        if (el.childElementCount > 1 || el.hasAttribute('data-sereno-metric')) continue;
        if (Detect.isMetricText(el.textContent)) el.setAttribute('data-sereno-metric', '');
      }
    }
  }

  function run(scope) {
    scope = scope || document;
    document.documentElement.classList.toggle('sereno-no-metrics', settings.enabled && settings.metrics.enabled);
    processMetrics(scope === document ? document.body || document.documentElement : scope);
    if (!settings.enabled || !onFeed()) return;
    for (const post of outermostPosts(scope === document ? document : scope)) processPost(post);
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
