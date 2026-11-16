// Fuente única de textos. `node scripts/build-locales.mjs` genera _locales/*/messages.json.
// Español neutro (sirve para toda Latinoamérica y España).
export const BRAND = 'Tidy Feed';

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
  popupToggleLabel: { es: 'Activar o pausar Tidy Feed', en: 'Turn Tidy Feed on or off' },
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
    es: 'Tidy Feed está en pausa. LinkedIn se ve como siempre.',
    en: 'Tidy Feed is paused. LinkedIn looks as usual.'
  },

  // ---- Opciones ----
  optTitle: { es: 'Ajustes', en: 'Settings' },
  optTagline: { es: 'Tu feed, sin ruido.', en: 'Your feed, without the noise.' },
  welcomeTitle: { es: 'Listo, Tidy Feed ya está trabajando', en: 'All set, Tidy Feed is on' },
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
    es: 'Tidy Feed funciona 100% en tu navegador. No tiene servidores, no usa analítica y no recolecta datos personales. Solo guarda tus ajustes y un contador de publicaciones ocultas.',
    en: 'Tidy Feed runs 100% in your browser. It has no servers, no analytics and collects no personal data. It only stores your settings and a count of hidden posts.'
  },
  secAbout: { es: 'Acerca de', en: 'About' },
  aboutBody: {
    es: 'Tidy Feed es un proyecto independiente. No está afiliado, respaldado ni patrocinado por LinkedIn Corporation. LinkedIn es una marca registrada de LinkedIn Corporation.',
    en: 'Tidy Feed is an independent project. It is not affiliated with, endorsed or sponsored by LinkedIn Corporation. LinkedIn is a registered trademark of LinkedIn Corporation.'
  },
  aboutAds: {
    es: 'Tidy Feed no oculta ni modifica la publicidad.',
    en: 'Tidy Feed does not hide or alter ads.'
  },
  resetDefaults: { es: 'Restablecer ajustes', en: 'Reset to defaults' },
  resetConfirm: { es: '¿Volver a los ajustes originales?', en: 'Go back to the original settings?' },
  version: { es: 'Versión $1', en: 'Version $1', ph: 1 }
};
