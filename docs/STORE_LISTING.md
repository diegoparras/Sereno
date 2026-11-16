# Ficha para la Chrome Web Store

Textos listos para pegar en el panel de desarrollador. Mencionar LinkedIn solo para describir con qué sitio funciona (uso descriptivo) y siempre con la aclaración de no afiliación.

## Nombre
Sereno

## Resumen corto (máx. 132 caracteres)
**ES:** Tu feed de LinkedIn sin desconocidos, sin humo y sin números. 100% en tu navegador.
**EN:** Your LinkedIn feed without strangers, fluff or vanity numbers. Runs 100% in your browser.

## Categoría
Productividad (Productivity)

## Descripción (ES)

El feed está hecho para que scrollees, no para que te sirva. Sereno lo ordena para que vuelvas a ver a la gente que conoces.

**Solo mi red**
Oculta las publicaciones que aparecen porque "a alguien le gustó" o "alguien comentó", además de los sugeridos de desconocidos. Hay un modo estricto opcional que muestra solo a tus contactos directos.

**Detector de humo**
Atenúa los cebos de interacción ("Comenta SÍ y te mando el PDF"), las historias de plantilla ("Hace 5 años me despidieron…") y los posts de una frase por renglón. Puedes elegir si solo se marcan, se atenúan o se ocultan, y siempre puedes verlos igual con un clic.

**Sin números**
Esconde likes, comentarios y contadores de seguidores. Lees el contenido, no el marcador.

**Ya estás al día**
Cuando empiezas a ver publicaciones que ya habías visto, Sereno te avisa y pone en pausa el resto. Se acabó el scroll infinito.

**Tú decides sobre cada persona**
Silencia a alguien con un clic, o márcalo para que nunca se oculte.

**Palabras silenciadas**
Oculta lo que mencione los temas que no quieres ver.

**Privada por diseño**
• Funciona 100% en tu navegador: sin servidores, sin analítica y sin cuentas.
• No guarda publicaciones ni perfiles, solo tus ajustes y un contador.
• No hace nada en tu nombre: no da likes, no comenta, no envía mensajes.
• No toca la publicidad.

Sereno es un proyecto independiente. No está afiliado, respaldado ni patrocinado por LinkedIn Corporation. LinkedIn es una marca registrada de LinkedIn Corporation.

## Description (EN)

Feeds are built to keep you scrolling, not to be useful. Sereno tidies yours so you can see the people you actually know again.

**Just my network**: hides posts that only show up because someone liked or commented on them, plus suggested posts from strangers. Optional strict mode shows direct connections only.

**Fluff detector**: dims engagement bait ("Comment YES and I'll DM you the PDF"), template stories ("5 years ago I got fired…") and one-sentence-per-line posts. Label, dim or hide, and always one click away.

**No numbers**: hides likes, comment counts and follower counts. Read the content, not the scoreboard.

**All caught up**: when you start seeing posts you've already seen, Sereno tells you and pauses the rest. No more infinite scroll.

**You decide, person by person**: mute someone in one click, or mark them to never be hidden.

**Muted words**: hide posts that mention topics you don't want to see.

**Private by design**: runs 100% in your browser, with no servers, analytics or accounts. It stores only your settings and a counter, never acts on your behalf and never touches ads.

Sereno is an independent project. It is not affiliated with, endorsed or sponsored by LinkedIn Corporation. LinkedIn is a registered trademark of LinkedIn Corporation.

## Pestaña "Privacidad" del panel

**Propósito único (single purpose):**
Make the LinkedIn feed calmer and more relevant by hiding or dimming posts the user chose not to see (activity from strangers, suggested posts, engagement bait, muted words) and hiding vanity metrics.

**Justificación de permisos:**
- `storage`: store the user's settings, the people they chose to mute or protect, a local counter of hidden posts and short irreversible fingerprints of posts already seen (for the "all caught up" notice). Nothing leaves the browser.
- Host access `https://www.linkedin.com/*` (via content script): read the posts already displayed on the page to decide which ones to hide or dim. No other sites are accessed.

**¿Usa código remoto?** No.

**Datos recolectados:** ninguno. Marcar "No recolecto datos de usuario". Certificar las tres declaraciones: no se venden datos, no se usan para fines ajenos al propósito único y no se usan para evaluar crédito.

**URL de la política de privacidad:** publicar `docs/PRIVACY.md` en una URL pública (GitHub Pages, Notion o un sitio propio) y pegar el enlace.

## Recursos gráficos
- Ícono 128×128: `icons/icon-128.png`
- Capturas 1280×800: generar con `npm run screenshots` (quedan en `docs/screenshots/`). **No** usar capturas con datos reales de otras personas: el feed simulado de los tests sirve para esto.
- Imagen promocional pequeña de 440×280 (opcional): pendiente.
