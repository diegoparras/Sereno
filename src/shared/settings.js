/*
 * Tidy Feed — configuración compartida (content script, popup, opciones, background).
 * Todo se guarda en chrome.storage del propio navegador. Nada sale del equipo.
 */
(function (root) {
  'use strict';

  function deepFreeze(o) {
    for (const v of Object.values(o)) if (v && typeof v === 'object') deepFreeze(v);
    return Object.freeze(o);
  }

  const DEFAULTS = deepFreeze({
    enabled: true,
    network: {
      enabled: true,
      hideSocialActivity: true, // "A Juan le gustó esto", "Ana comentó esto"
      hideSuggested: true, // "Sugerido", "Recomendado para vos"
      onlyDirect: false, // solo contactos de 1er grado
      keepFollowedPages: true // en modo estricto, seguir mostrando páginas de empresas
    },
    smoke: {
      enabled: true,
      sensitivity: 'medium', // low | medium | high
      action: 'dim' // label | dim | hide
    },
    metrics: {
      enabled: true
    },
    muted: {
      words: []
    },
    display: {
      showPlaceholders: false // dejar una línea "Tidy Feed ocultó un post · Mostrar"
    }
  });

  const STATS_KEY = 'tidyStats';
  const SETTINGS_KEY = 'tidySettings';

  function isObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
  }

  /**
   * Mezcla la configuración guardada sobre los valores por defecto.
   * Siempre devuelve una copia nueva y profunda: nunca comparte referencias con `base`.
   * Ignora claves desconocidas y valores de tipo incorrecto.
   */
  function merge(base, override) {
    const out = {};
    const o = isObject(override) ? override : {};
    for (const key of Object.keys(base)) {
      const b = base[key];
      const v = o[key];
      if (isObject(b)) out[key] = merge(b, v);
      else if (Array.isArray(b)) out[key] = (Array.isArray(v) ? v : b).filter((x) => typeof x === 'string');
      else out[key] = typeof v === typeof b ? v : b;
    }
    return out;
  }

  function hasChromeStorage() {
    return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync;
  }

  async function load() {
    if (!hasChromeStorage()) return merge(DEFAULTS, {});
    const data = await chrome.storage.sync.get(SETTINGS_KEY);
    return merge(DEFAULTS, data[SETTINGS_KEY]);
  }

  async function save(settings) {
    const clean = merge(DEFAULTS, settings);
    if (hasChromeStorage()) await chrome.storage.sync.set({ [SETTINGS_KEY]: clean });
    return clean;
  }

  /** Cambia un valor por ruta, p. ej. update('smoke.action', 'hide'). */
  async function update(path, value) {
    const current = await load();
    const parts = path.split('.');
    let node = current;
    for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]];
    node[parts[parts.length - 1]] = value;
    return save(current);
  }

  function onChange(callback) {
    if (!hasChromeStorage()) return;
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes[SETTINGS_KEY]) {
        callback(merge(DEFAULTS, changes[SETTINGS_KEY].newValue));
      }
    });
  }

  // ---- Estadísticas (solo locales, solo contadores) ----

  function today() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function emptyStats() {
    return { day: today(), network: 0, smoke: 0, muted: 0, total: 0 };
  }

  async function loadStats() {
    if (!(typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local)) return emptyStats();
    const data = await chrome.storage.local.get(STATS_KEY);
    const s = { ...emptyStats(), ...(data[STATS_KEY] || {}) };
    if (s.day !== today()) return { ...emptyStats(), total: s.total || 0 };
    return s;
  }

  async function addStats(delta) {
    const s = await loadStats();
    for (const k of ['network', 'smoke', 'muted']) {
      const n = delta[k] || 0;
      s[k] += n;
      s.total += n;
    }
    await chrome.storage.local.set({ [STATS_KEY]: s });
    return s;
  }

  root.TidySettings = {
    DEFAULTS,
    SETTINGS_KEY,
    STATS_KEY,
    merge,
    load,
    save,
    update,
    onChange,
    loadStats,
    addStats
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.TidySettings;
})(typeof globalThis !== 'undefined' ? globalThis : this);
