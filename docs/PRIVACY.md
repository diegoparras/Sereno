# Política de privacidad — Sereno

_Última actualización: 17 de noviembre de 2026_

**Resumen: Sereno no recolecta, no vende y no envía tus datos a ningún lado.**

## Qué hace la extensión
Sereno lee las publicaciones que LinkedIn ya te muestra en tu navegador para decidir, según tus ajustes, cuáles ocultar o atenuar. Ese análisis ocurre **solo dentro de tu navegador**.

## Qué datos guarda
Usa el almacenamiento de Chrome (`chrome.storage`) para guardar únicamente:
- **Tus ajustes**: qué funciones están activas y tu lista de palabras silenciadas. Si tienes activada la sincronización de Chrome, Google sincroniza estos ajustes entre tus dispositivos.
- **Personas y páginas que silenciaste o protegiste**: el identificador de su perfil (por ejemplo, `in/ana-ruiz`) y su nombre visible, solo porque tú los agregaste. Se guardan en este navegador, no se sincronizan.
- **Contadores anónimos**: cuántas publicaciones se ocultaron hoy y en total. Son solo números, sin contenido, autores ni enlaces.
- **Huellas de publicaciones vistas** (para «Ya estás al día»): un código corto calculado a partir de cada publicación que viste en pantalla. No contiene el texto ni el autor y no se puede revertir. Se borran solas a los 21 días.

## Qué no hace
- No envía información a servidores propios ni de terceros. Sereno no tiene servidores.
- No usa analítica, cookies de seguimiento ni publicidad.
- No guarda el contenido de las publicaciones, nombres, perfiles ni mensajes.
- No hace acciones en tu nombre (no da likes, no comenta, no envía mensajes).
- No modifica ni oculta la publicidad de LinkedIn.

## Permisos
- `storage`: guardar tus ajustes y los contadores.
- Acceso a `https://www.linkedin.com/*`: necesario para ordenar el feed en esa página. No tiene acceso a ningún otro sitio.

## Borrar tus datos
Desinstalar la extensión elimina todo lo que guardó. También puedes usar «Restablecer ajustes» en la página de opciones.

## Contacto
Preguntas o pedidos: https://github.com/diegoparras/Sereno/issues

---

# Privacy policy — Sereno

_Last updated: November 17, 2026_

**In short: Sereno does not collect, sell or send your data anywhere.**

Sereno reads the posts LinkedIn already shows you in your browser to decide, based on your settings, which to hide or dim. This happens **only inside your browser**.

It stores, via `chrome.storage`, only: your **settings** (enabled features and muted words; synced by Chrome if you have sync on); the **people and pages you chose to mute or protect** (profile identifier and display name, kept locally, not synced); **anonymous counters** of hidden posts; and short, irreversible **fingerprints of posts you have seen** (no text or author), deleted automatically after 21 days, used for “All caught up”.

It does not send data to any server (it has none), use analytics or tracking, store post content or profiles, act on your behalf, or modify LinkedIn ads.

Permissions: `storage` (settings and counters) and access to `https://www.linkedin.com/*` (to tidy the feed on that site only).

Uninstalling the extension removes all stored data.

Contact: https://github.com/diegoparras/Sereno/issues
