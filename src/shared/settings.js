/*
 * Sereno — configuración compartida (content script, popup, opciones, background).
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
      showPlaceholders: false // dejar una línea "Sereno ocultó un post · Mostrar"
    },
    caughtUp: {
      enabled: true, // tarjeta "Ya estás al día"
      limit: 25 // pausa después de N publicaciones por visita (0 = sin límite)
    },
    shortcuts: {
      enabled: true // J/K: siguiente/anterior · M: silenciar · P: proteger
    }
  });

  const STATS_KEY = 'serenoStats';
  const SETTINGS_KEY = 'serenoSettings';

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

  // ---- Personas silenciadas / protegidas (storage.local: sync tiene límite de 8 KB) ----

  const PEOPLE_KEY = 'serenoPeople';
  const PEOPLE_MAX = 1000;

  function hasLocal() {
    return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  }

  function cleanPeople(p) {
    const pick = (o) => {
      const out = {};
      if (!isObject(o)) return out;
      for (const [k, v] of Object.entries(o).slice(-PEOPLE_MAX)) if (typeof v === 'string') out[k] = v;
      return out;
    };
    return { muted: pick(p && p.muted), trusted: pick(p && p.trusted) };
  }

  async function loadPeople() {
    if (!hasLocal()) return cleanPeople({});
    const data = await chrome.storage.local.get(PEOPLE_KEY);
    return cleanPeople(data[PEOPLE_KEY]);
  }

  /** list: 'muted' | 'trusted' | null (null = quitar de ambas). */
  async function setPerson(id, name, list) {
    if (!id) return loadPeople();
    const p = await loadPeople();
    delete p.muted[id];
    delete p.trusted[id];
    if (list === 'muted' || list === 'trusted') p[list][id] = String(name || id).slice(0, 80);
    await chrome.storage.local.set({ [PEOPLE_KEY]: p });
    return p;
  }

  function onPeopleChange(callback) {
    if (!hasLocal()) return;
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[PEOPLE_KEY]) callback(cleanPeople(changes[PEOPLE_KEY].newValue));
    });
  }

  // ---- Publicaciones ya vistas (para "Ya estás al día") ----

  const SEEN_KEY = 'serenoSeen';
  const SEEN_MAX = 3000;
  const SEEN_DAYS = 21;

  async function loadSeen() {
    if (!hasLocal()) return {};
    const data = await chrome.storage.local.get(SEEN_KEY);
    return isObject(data[SEEN_KEY]) ? data[SEEN_KEY] : {};
  }

  async function addSeen(hashes) {
    if (!hasLocal() || !hashes.length) return;
    const seen = await loadSeen();
    const now = Date.now();
    for (const h of hashes) seen[h] = now;
    const cutoff = now - SEEN_DAYS * 864e5;
    const kept = Object.entries(seen)
      .filter(([, ts]) => typeof ts === 'number' && ts > cutoff)
      .sort((a, b) => b[1] - a[1])
      .slice(0, SEEN_MAX);
    await chrome.storage.local.set({ [SEEN_KEY]: Object.fromEntries(kept) });
  }

  root.SerenoSettings = {
    DEFAULTS,
    SETTINGS_KEY,
    STATS_KEY,
    merge,
    load,
    save,
    update,
    onChange,
    loadStats,
    addStats,
    PEOPLE_KEY,
    loadPeople,
    setPerson,
    onPeopleChange,
    loadSeen,
    addSeen
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.SerenoSettings;
})(typeof globalThis !== 'undefined' ? globalThis : this);
