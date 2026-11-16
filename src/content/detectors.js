/*
 * Sereno — detectores puros (sin DOM), para poder testearlos en Node.
 *
 * Principio: ante la duda, se muestra. Un falso positivo (esconder algo
 * de alguien que conocés) es mucho peor que un falso negativo.
 *
 * Regla fija: Sereno nunca oculta ni modifica publicaciones promocionadas.
 */
(function (root) {
  'use strict';

  /** minúsculas, sin acentos, espacios colapsados (conserva emojis y saltos de línea). */
  function normalize(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[ \t ]+/g, ' ')
      .trim();
  }

  // ---------- Publicidad (exenta siempre) ----------
  const PROMOTED = /(^|[\s•·])(promoted|promocionado|promocionada|patrocinado|patrocinada|sponsored|promovido|promovida)(?=$|[\s•·])/;

  // ---------- Actividad social ("a Juan le gustó esto") ----------
  const SOCIAL_ACTIVITY = [
    // English
    /\b(like|likes|love|loves|celebrate|celebrates|support|supports|find|finds|reacted to|commented on|replied to|reposted|shared)\b[^\n]{0,40}\bthis\b/,
    /\bcommented on\b|\breposted\b/,
    /\bfollows? (this page|this company|this)\b/,
    /^followed by\b/,
    // Español
    /\b(le|les) (gusta|gustan|gusto|encanta|encanto|parece|parecio)\b/,
    /\b(celebra|celebran|apoya|apoyan|recomienda|recomiendan) esto\b/,
    /\b(ha|han) (comentado|compartido|republicado|recomendado|reaccionado|respondido|contestado|celebrado|apoyado)\b/,
    /\b(comento|comentaron|compartio|compartieron|republico|republicaron|reacciono|reaccionaron|respondio)\b/,
    /\ble resulta (interesante|divertido|curioso)\b/,
    /\b(sigue|siguen) (esta pagina|esta empresa|esto)\b/,
    /^seguid[oa] por\b/,
    /\b(le|les) ha(n)? (gustado|encantado|parecido)\b/,
    // Português
    /\b(gostou|gostaram|amou|celebrou|apoiou|comentou|compartilhou|republicou|reagiu|achou isso)\b/,
    /\bsegue (esta pagina|esta empresa)\b/
  ];

  const SUGGESTED = [
    /\bsuggested\b/,
    /\brecommended for you\b/,
    /\bpopular on linkedin\b/,
    /\bbased on your (profile|activity|interests)\b/,
    /\bbecause you (follow|viewed|liked)\b/,
    /\bsugerenci(a|as)\b/,
    /\bsugerid(o|a|os|as)\b/,
    /\brecomendad(o|a|os|as) para (ti|vos|usted)\b/,
    /\bpopular en linkedin\b/,
    /\bbasad(o|a) en tu (perfil|actividad|interes)/,
    /\bporque (sigues|seguis|viste|te gusto)\b/,
    /\bsugest(ao|oes|ões)\b/,
    /\bpopular no linkedin\b/
  ];

  // ---------- Grado de conexión ----------
  const DEGREE_DIRECT = /(^|[\s•·])(1st|1er|1\.?º|1\.?°|1o)(?=$|[\s•·])/;
  const DEGREE_FAR = /(^|[\s•·])(2nd|3rd\+?|2\.?º|2\.?°|2o|3\.?º\+?|3\.?°\+?|3er\+?|3o\+?)(?=$|[\s•·])/;

  // ---------- Detector de humo ----------
  const BAIT = [
    // pedir comentarios a cambio de algo
    /\bcomment\b[^\n]{0,30}\b(yes|me|below|interested|guide|pdf|link|["'“”]?[a-z]{2,12}["'“”]?) (and|to get|for)\b/,
    /\bcomment ["'“”][a-z0-9 ]{1,15}["'“”]/,
    /\bcomment (below|yes|interested)\b/,
    /\bcomenta(?:\b|r|n|me)[^\n]{0,30}\b(si|yo|quiero|info|guia|pdf|link)\b/,
    /\bcomenta ["'“”][a-z0-9 ]{1,15}["'“”]/,
    /\bdeja(me)? (un|tu) (comentario|\S+ en (los )?comentarios)/,
    /\bescrib(i|e|ime|eme) ["'“”][a-z0-9 ]{1,15}["'“”]/,
    // likes / reposts / follow
    /\b(repost|reposts|share) (this|if)\b/,
    /\b(repostea|republica|comparti|comparte)(lo|la)? (si|para)\b/,
    /♻️/,
    /\bfollow (me|me for|for more)\b/,
    /\b(seguime|sigueme|segui(me)?) para (mas|ver mas)\b/,
    /\b(like|dale like|dale me gusta) (if|si)\b/,
    /\btag (someone|a friend|a person)\b/,
    /\betiqueta (a|a alguien|a un amigo)\b/,
    /\b(agree|do you agree)\s*\?/,
    /\b(estas|estan) de acuerdo\s*\?/,
    /\blink (in|en) (the )?(comments|comentarios|1er comentario|primer comentario|first comment)\b/,
    /\benlace en (los )?comentarios\b/
  ];

  const HOOKS = [
    /^unpopular opinion/,
    /^opinion impopular/,
    /^(\d+|five|ten|three|cinco|diez|tres) (years|anos) ago\b/,
    /^hace (\d+|cinco|diez|tres|unos) anos\b/,
    /^i got fired\b/,
    /^(me despidieron|me echaron)\b/,
    /^nobody talks about\b/,
    /^nadie (te )?(habla|dice|cuenta)\b/,
    /^(stop|dej(a|e)|deja de)\b[^\n]{0,40}\.?$/m,
    /^here'?s (what|the|how|why)\b/,
    /^(esto es|aca va|aqui va) lo que aprendi\b/,
    /^i (just )?(turned down|rejected|said no to)\b/,
    /^(rechace|dije que no a)\b/,
    /^(\d+) (lessons|things|lecciones|cosas) /
  ];

  const CLOSERS = [/\bread that again\b/, /\blet that sink in\b/, /\b(lee|leelo|lealo) (de nuevo|otra vez)\b/, /\bpensalo\.?$/m];

  const MANUAL_PHRASES = [
    /\bin today'?s (fast-paced|ever-changing|digital)\b/,
    /\bgame[- ]?changer\b/,
    /\bdelve\b/,
    /\bit'?s not (just )?about [^\n.]{1,40}[,.—-] it'?s about\b/,
    /\bno se trata (solo )?de [^\n.]{1,40}[,.—-] se trata de\b/,
    /\ben el mundo (actual|de hoy|acelerado)\b/,
    /\b(fomentar|potenciar) (el )?(crecimiento|sinergias)\b/,
    /\bhere'?s the (thing|kicker|truth)\b/
  ];

  const BULLET_EMOJI = /(→|➡️|👉|✅|🔥|💡|🚀|✨|📌|⬇️|👇|🎯|💪|🙌|⚡|📈|1️⃣|2️⃣|3️⃣)/gu;

  const SENSITIVITY_THRESHOLD = { low: 5, medium: 4, high: 3 };

  function anyMatch(patterns, text) {
    return patterns.some((re) => re.test(text));
  }

  function isPromoted(meta) {
    return PROMOTED.test(normalize(meta));
  }

  function socialContext(headerText) {
    const h = normalize(headerText);
    if (!h) return null;
    if (anyMatch(SUGGESTED, h)) return 'suggested';
    if (anyMatch(SOCIAL_ACTIVITY, h)) return 'activity';
    return null;
  }

  function degreeOf(meta) {
    const m = normalize(meta);
    if (DEGREE_DIRECT.test(m)) return 'direct';
    if (DEGREE_FAR.test(m)) return 'far';
    return 'unknown';
  }

  function actorKind(href) {
    const h = String(href || '');
    if (/\/(company|showcase|school)\//.test(h)) return 'page';
    if (/\/in\//.test(h)) return 'person';
    return 'unknown';
  }

  /** Devuelve { score, reasons[] } para el texto de una publicación. */
  function smokeScore(body) {
    const raw = String(body || '');
    const text = normalize(raw);
    const reasons = [];
    let score = 0;
    if (!text) return { score, reasons };

    if (anyMatch(BAIT, text)) {
      score += 5; // señal clarísima: alcanza sola en cualquier sensibilidad
      reasons.push('bait');
    }

    const firstLine = text.split('\n').find((l) => l.trim()) || '';
    if (anyMatch(HOOKS, firstLine.trim()) || anyMatch(CLOSERS, text)) {
      score += 2;
      reasons.push('hook');
    }

    // "Broetry": muchas líneas cortas, una oración por renglón.
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length >= 7) {
      const avg = lines.reduce((a, l) => a + l.length, 0) / lines.length;
      const short = lines.filter((l) => l.length < 80).length / lines.length;
      if (avg < 70 && short > 0.8) {
        score += 2;
        reasons.push('format');
      }
    }

    const bullets = (raw.match(BULLET_EMOJI) || []).length;
    if (bullets >= 5) {
      score += bullets >= 10 ? 2 : 1;
      if (!reasons.includes('format')) reasons.push('format');
    }

    const manual = MANUAL_PHRASES.filter((re) => re.test(text)).length;
    if (manual) {
      score += Math.min(manual, 2);
      reasons.push('manual');
    }

    const hashtags = (raw.match(/(^|\s)#[\p{L}\p{N}_]+/gu) || []).length;
    if (hashtags >= 6) {
      score += 1;
      reasons.push('hashtags');
    }

    return { score, reasons };
  }

  function mutedHit(words, haystack) {
    const text = normalize(haystack);
    for (const w of words || []) {
      const needle = normalize(w);
      if (!needle) continue;
      const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, 'u').test(text)) return w;
    }
    return null;
  }

  /** "/in/Ana-Ruiz-123/?x=1" → "in/ana-ruiz-123". Identificador estable de autor. */
  function authorId(href) {
    if (!href) return '';
    try {
      const u = new URL(href, 'https://www.linkedin.com');
      const m = u.pathname.match(/^\/(in|company|showcase|school)\/([^/]+)/);
      return m ? `${m[1]}/${decodeURIComponent(m[2]).toLowerCase()}` : '';
    } catch (_) {
      return '';
    }
  }

  /** Huella corta de una publicación (autor + comienzo del texto), FNV-1a. */
  function postHash(author, body) {
    const str = `${author}|${normalize(body).slice(0, 240)}`;
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(36);
  }

  /**
   * Clasifica una publicación.
   * post: { header, meta, actorHref, body, authorName? }
   * people: { muted: {id: nombre}, trusted: {id: nombre} } (opcional)
   * Devuelve { verdict: 'show'|'hide'|'dim'|'label', category, reasons[], detail }
   */
  function classify(post, settings, people) {
    const show = { verdict: 'show', category: null, reasons: [] };
    if (!settings || !settings.enabled) return show;

    // Regla fija: no tocamos publicidad.
    if (isPromoted(post.meta) || isPromoted(post.header)) return { ...show, category: 'promoted' };

    // Decisiones explícitas del usuario sobre una persona o página: mandan sobre todo lo demás.
    const id = authorId(post.actorHref);
    if (people && id) {
      if (people.trusted && people.trusted[id]) return { ...show, category: 'trusted' };
      if (people.muted && people.muted[id]) {
        return { verdict: 'hide', category: 'muted', reasons: ['person'], detail: people.muted[id] };
      }
    }

    const net = settings.network;
    if (net && net.enabled) {
      const ctx = socialContext(post.header);
      if (ctx === 'suggested' && net.hideSuggested) {
        return { verdict: 'hide', category: 'network', reasons: ['suggested'] };
      }
      if (ctx === 'activity' && net.hideSocialActivity) {
        return { verdict: 'hide', category: 'network', reasons: ['activity'] };
      }
      if (net.onlyDirect) {
        const kind = actorKind(post.actorHref);
        const degree = degreeOf(post.meta);
        if (kind === 'page' && !net.keepFollowedPages) {
          return { verdict: 'hide', category: 'network', reasons: ['page'] };
        }
        if (kind !== 'page' && degree === 'far') {
          return { verdict: 'hide', category: 'network', reasons: ['notDirect'] };
        }
      }
    }

    const muted = mutedHit(settings.muted && settings.muted.words, `${post.header}\n${post.meta}\n${post.body}`);
    if (muted) return { verdict: 'hide', category: 'muted', reasons: ['muted'], detail: muted };

    const smoke = settings.smoke;
    if (smoke && smoke.enabled) {
      const { score, reasons } = smokeScore(post.body);
      const threshold = SENSITIVITY_THRESHOLD[smoke.sensitivity] || SENSITIVITY_THRESHOLD.medium;
      if (score >= threshold) {
        const verdict = ['label', 'dim', 'hide'].includes(smoke.action) ? smoke.action : 'dim';
        return { verdict, category: 'smoke', reasons, score };
      }
    }

    return show;
  }

  /** "12.345 seguidores", "1,2 mil followers", "614 reacciones", "21 comentarios"… */
  const METRIC_TEXT = new RegExp(
    '^\\s*[\\d.,\\s]+\\s*(k|m|mil|mill\\.?|mi)?\\+?\\s*(' +
      [
        'followers?', 'seguidor(es)?', 'connections?', 'conexi(on|ones)', 'contactos?', 'conexoes', 'conexões',
        'reactions?', 'reacci(on|ones)', 'reacoes', 'reações', 'likes?', 'recomendaciones',
        'comments?', 'comentarios?', 'comentários?',
        'reposts?', 'veces compartid[oa]', 'compartid[oa]s?', 'shares?', 'compartilhamentos?',
        'impressions?', 'impresiones', 'visualizaci(on|ones)', 'views?', 'vistas?',
        'visitas al perfil', 'profile viewers?'
      ].join('|') +
      ')\\s*$',
    'i'
  );
  function isMetricText(text) {
    return METRIC_TEXT.test(String(text || '').replace(/\u200b/g, ''));
  }

  const api = {
    normalize,
    isPromoted,
    socialContext,
    degreeOf,
    actorKind,
    smokeScore,
    mutedHit,
    classify,
    authorId,
    postHash,
    isMetricText,
    SENSITIVITY_THRESHOLD
  };
  root.SerenoDetect = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
