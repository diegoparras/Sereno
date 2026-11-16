// Fuente única de textos. `node scripts/build-locales.mjs` genera _locales/*/messages.json.
// Español neutro (sirve para toda Latinoamérica y España).
export const BRAND = 'Sereno';

export const strings = {
  extName: { es: BRAND, en: BRAND },
  extDescription: {
    es: 'Tu feed de LinkedIn sin desconocidos, sin humo y sin números. 100% en tu navegador.',
    en: 'Your LinkedIn feed without strangers, fluff or vanity numbers. Runs 100% in your browser.'
  },

  // ---- Content script ----
  stripHidden: { es: 'Oculto: $1', en: 'Hidden: $1', ph: 1 },
  stripSmoke: { es: 'Posible humo: $1', en: 'Possible fluff: $1', ph: 1 },
  stripShow: { es: 'Ver igual', en: 'Show anyway' },
  reasonSuggested: { es: 'contenido sugerido', en: 'suggested content' },
  reasonActivity: { es: 'actividad de otra persona', en: "someone else's activity" },
  reasonNotDirect: { es: 'fuera de tus contactos directos', en: 'outside your direct connections' },
  reasonPage: { es: 'página de empresa', en: 'company page' },
  reasonMuted: { es: 'menciona «$1»', en: 'mentions “$1”', ph: 1 },
  smoke_bait: { es: 'cebo de interacción', en: 'engagement bait' },
  smoke_hook: { es: 'gancho de plantilla', en: 'template hook' },
  smoke_format: { es: 'formato de plantilla', en: 'template format' },
  smoke_manual: { es: 'frases de manual', en: 'stock phrases' },
  smoke_hashtags: { es: 'exceso de hashtags', en: 'hashtag overload' },

  // ---- Popup ----
  popupOn: { es: 'Activo', en: 'On' },
  popupOff: { es: 'En pausa', en: 'Paused' },
  popupToggleLabel: { es: 'Activar o pausar Sereno', en: 'Turn Sereno on or off' },
  statCaption: { es: 'publicaciones fuera de tu camino hoy', en: 'posts kept out of your way today' },
  statNetwork: { es: 'de desconocidos', en: 'from strangers' },
  statSmoke: { es: 'humo', en: 'fluff' },
  statMuted: { es: 'silenciadas', en: 'muted' },
  statTotal: { es: '$1 en total desde que instalaste', en: '$1 in total since you installed', ph: 1 },
  featNetwork: { es: 'Solo mi red', en: 'Just my network' },
  featNetworkDesc: { es: 'Sin «le gustó», «comentó» ni sugeridos', en: 'No “liked this”, “commented” or suggested' },
  featSmoke: { es: 'Detector de humo', en: 'Fluff detector' },
  featSmokeDesc: { es: 'Atenúa cebos y posts de plantilla', en: 'Dims bait and template posts' },
  featMetrics: { es: 'Sin números', en: 'No numbers' },
  featMetricsDesc: { es: 'Oculta likes, vistas y seguidores', en: 'Hides likes, views and follower counts' },
  popupMore: { es: 'Más ajustes', en: 'More settings' },
  popupPrivacy: { es: 'Todo queda en tu navegador', en: 'Everything stays in your browser' },
  popupPausedHint: {
    es: 'Sereno está en pausa. LinkedIn se ve como siempre.',
    en: 'Sereno is paused. LinkedIn looks as usual.'
  },

  // ---- Personas ----
  menuOpen: { es: 'Opciones de Sereno para $1', en: 'Sereno options for $1', ph: 1 },
  menuMute: { es: 'Silenciar a $1', en: 'Mute $1', ph: 1 },
  menuTrust: { es: 'Nunca ocultar a $1', en: 'Never hide $1', ph: 1 },
  menuUntrust: { es: 'Volver a filtrar a $1', en: 'Filter $1 again', ph: 1 },
  stripMutedPerson: { es: 'Silenciaste a $1', en: 'You muted $1', ph: 1 },
  stripUndo: { es: 'Deshacer', en: 'Undo' },
  reasonPerson: { es: 'silenciaste a $1', en: 'you muted $1', ph: 1 },
  secPeople: { es: 'Personas y páginas', en: 'People and pages' },
  secPeopleDesc: {
    es: 'El botón de Sereno acompaña, al costado del feed, a la publicación que estás leyendo: úsalo para silenciar a alguien o para que nunca se oculte.',
    en: 'The Sereno button follows the post you are reading, beside the feed: use it to mute someone or to never hide them.'
  },
  peopleMuted: { es: 'Silenciadas', en: 'Muted' },
  peopleTrusted: { es: 'Nunca se ocultan', en: 'Never hidden' },
  peopleEmpty: { es: 'Nadie todavía.', en: 'Nobody yet.' },
  peopleRemove: { es: 'Quitar a $1', en: 'Remove $1', ph: 1 },

  // ---- Ya estás al día ----
  caughtTitleOld: { es: 'Ya estás al día', en: "You're all caught up" },
  caughtBodyOld: {
    es: 'Ya viste lo nuevo de tu red. Lo que sigue ya lo habías visto.',
    en: "You've seen what's new from your network. What follows, you've already seen."
  },
  caughtTitleLimit: { es: 'Buen momento para una pausa', en: 'Good time for a break' },
  caughtBodyLimit: { es: 'Ya viste $1 publicaciones en esta visita.', en: "You've seen $1 posts this visit.", ph: 1 },
  caughtContinue: { es: 'Seguir viendo', en: 'Keep scrolling' },
  featCaught: { es: 'Ya estás al día', en: 'All caught up' },
  featCaughtDesc: { es: 'Te avisa cuando ya viste lo nuevo', en: "Tells you when you've seen what's new" },
  secCaught: { es: 'Ya estás al día', en: 'All caught up' },
  secCaughtDesc: {
    es: 'Corta el scroll infinito: te avisa cuando empiezas a ver publicaciones que ya habías visto, o después de cierta cantidad en una misma visita.',
    en: 'Breaks the infinite scroll: tells you when you start seeing posts you have already seen, or after a number of posts in one visit.'
  },
  optCaughtLimit: { es: 'Pausa después de', en: 'Pause after' },
  limitNone: { es: 'Sin límite', en: 'No limit' },
  caughtNote: {
    es: 'Para saber qué ya viste, Sereno guarda en tu navegador una huella anónima de cada publicación (no su contenido) durante 21 días.',
    en: 'To know what you have seen, Sereno stores an anonymous fingerprint of each post (not its content) in your browser for 21 days.'
  },

  // ---- Opciones ----
  optTitle: { es: 'Ajustes', en: 'Settings' },
  optTagline: { es: 'Tu feed, sin ruido.', en: 'Your feed, without the noise.' },
  welcomeTitle: { es: 'Listo, Sereno ya está trabajando', en: 'All set, Sereno is on' },
  welcomeBody: {
    es: 'Abre tu feed de LinkedIn y vas a notar la diferencia. Viene configurado con valores razonables; aquí puedes ajustarlo a tu gusto.',
    en: 'Open your LinkedIn feed and you will notice the difference. It comes with sensible defaults; tune it to your liking here.'
  },
  welcomeCta: { es: 'Abrir LinkedIn', en: 'Open LinkedIn' },
  saved: { es: 'Guardado', en: 'Saved' },

  secNetwork: { es: 'Solo mi red', en: 'Just my network' },
  secNetworkDesc: { es: 'Vuelve a ver a la gente que conoces.', en: 'See the people you actually know again.' },
  optHideActivity: { es: 'Ocultar actividad ajena', en: "Hide other people's activity" },
  optHideActivityDesc: {
    es: 'Publicaciones que aparecen porque a alguien le gustaron, las comentó o las compartió.',
    en: 'Posts that show up because someone liked, commented on or reposted them.'
  },
  optHideSuggested: { es: 'Ocultar sugeridos', en: 'Hide suggested posts' },
  optHideSuggestedDesc: {
    es: '«Sugerido», «Recomendado para ti» y similares.',
    en: '“Suggested”, “Recommended for you” and the like.'
  },
  optOnlyDirect: { es: 'Modo estricto: solo contactos directos', en: 'Strict mode: direct connections only' },
  optOnlyDirectDesc: {
    es: 'También oculta publicaciones de 2.º y 3.er grado. Si no se puede saber el grado, se muestra.',
    en: 'Also hides posts from 2nd and 3rd degree. If the degree is unclear, the post is shown.'
  },
  optKeepPages: { es: 'Mantener páginas de empresas que sigues', en: 'Keep company pages you follow' },

  secSmoke: { es: 'Detector de humo', en: 'Fluff detector' },
  secSmokeDesc: {
    es: 'Busca señales de contenido hecho para enganchar, no para aportar. Son reglas simples que corren en tu navegador, sin enviar nada a ninguna IA.',
    en: 'Looks for signs of content made to hook, not to help. Simple rules that run in your browser, without sending anything to any AI.'
  },
  optSensitivity: { es: 'Sensibilidad', en: 'Sensitivity' },
  sensLow: { es: 'Suave', en: 'Gentle' },
  sensMedium: { es: 'Equilibrada', en: 'Balanced' },
  sensHigh: { es: 'Estricta', en: 'Strict' },
  optAction: { es: 'Qué hacer con el humo', en: 'What to do with fluff' },
  actLabel: { es: 'Solo marcar', en: 'Just label' },
  actDim: { es: 'Atenuar', en: 'Dim' },
  actHide: { es: 'Ocultar', en: 'Hide' },
  smokeWhat: { es: 'Qué cuenta como humo', en: 'What counts as fluff' },
  smokeDesc_bait: {
    es: '«Comenta SÍ y te mando el PDF», «Repost ♻️», «¿Estás de acuerdo?»',
    en: '“Comment YES and I’ll DM you the PDF”, “Repost ♻️”, “Agree?”'
  },
  smokeDesc_hook: {
    es: '«Hace 5 años me despidieron…», «Opinión impopular», «Léelo de nuevo»',
    en: '“5 years ago I got fired…”, “Unpopular opinion”, “Read that again”'
  },
  smokeDesc_format: {
    es: 'Una frase por renglón y catarata de emojis como viñetas',
    en: 'One sentence per line and a waterfall of emoji bullets'
  },
  smokeDesc_manual: {
    es: '«Game changer», «en el mundo actual», «no se trata de X, se trata de Y»',
    en: '“Game changer”, “in today’s fast-paced world”, “it’s not about X, it’s about Y”'
  },
  smokeDesc_hashtags: { es: 'Seis hashtags o más', en: 'Six or more hashtags' },

  secMetrics: { es: 'Sin números', en: 'No numbers' },
  secMetricsDesc: { es: 'Lee el contenido, no el marcador.', en: 'Read the content, not the scoreboard.' },
  optMetrics: { es: 'Ocultar likes, comentarios, vistas y seguidores', en: 'Hide likes, comments, views and follower counts' },

  secMuted: { es: 'Palabras silenciadas', en: 'Muted words' },
  secMutedDesc: {
    es: 'Oculta publicaciones que mencionen estas palabras o frases.',
    en: 'Hide posts that mention these words or phrases.'
  },
  mutedPlaceholder: { es: 'Escribe una palabra y presiona Enter', en: 'Type a word and press Enter' },
  mutedEmpty: { es: 'Todavía no silenciaste nada.', en: 'Nothing muted yet.' },
  mutedAdd: { es: 'Agregar', en: 'Add' },
  mutedRemove: { es: 'Quitar «$1»', en: 'Remove “$1”', ph: 1 },

  secDisplay: { es: 'Transparencia', en: 'Transparency' },
  optPlaceholders: { es: 'Dejar un aviso donde se ocultó algo', en: 'Leave a note where something was hidden' },
  optPlaceholdersDesc: {
    es: 'Una línea discreta con el motivo y un botón para verlo igual.',
    en: 'A discreet line with the reason and a button to show it anyway.'
  },

  secPrivacy: { es: 'Privacidad', en: 'Privacy' },
  privacyBody: {
    es: 'Sereno funciona 100% en tu navegador. No tiene servidores, no usa analítica y no envía nada a ningún lado. En tu navegador guarda solo tus ajustes, las personas que silenciaste o protegiste, un contador de publicaciones ocultas y huellas anónimas de lo que ya viste.',
    en: 'Sereno runs 100% in your browser. It has no servers, no analytics and sends nothing anywhere. In your browser it only stores your settings, the people you muted or protected, a count of hidden posts and anonymous fingerprints of what you have seen.'
  },
  secAbout: { es: 'Acerca de', en: 'About' },
  aboutBody: {
    es: 'Sereno es un proyecto independiente. No está afiliado, respaldado ni patrocinado por LinkedIn Corporation. LinkedIn es una marca registrada de LinkedIn Corporation.',
    en: 'Sereno is an independent project. It is not affiliated with, endorsed or sponsored by LinkedIn Corporation. LinkedIn is a registered trademark of LinkedIn Corporation.'
  },
  aboutAds: {
    es: 'Sereno no oculta ni modifica la publicidad.',
    en: 'Sereno does not hide or alter ads.'
  },
  resetDefaults: { es: 'Restablecer ajustes', en: 'Reset to defaults' },
  resetConfirm: { es: '¿Volver a los ajustes originales?', en: 'Go back to the original settings?' },
  version: { es: 'Versión $1', en: 'Version $1', ph: 1 }
};
