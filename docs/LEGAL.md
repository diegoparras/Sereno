# Notas legales y decisiones de riesgo

> No es asesoría legal. Es un resumen de lo que revisamos y de cómo se diseñó la extensión para reducir riesgos. **Recomendación: consulta breve con un abogado de propiedad intelectual antes de publicar.**

## 1. Términos de LinkedIn (Acuerdo de Usuario, vigente desde el 3/11/2025)
La sección 8.2 ("Don'ts") incluye:
- **Ítem 15:** _"Overlay or otherwise modify the Services or their appearance (such as by inserting elements into the Services or removing, covering, or obscuring an advertisement included on the Services)"_.
- **Ítem 2:** prohíbe software, incluidos _browser plugins and add-ons_, para _scrape or copy the Services_.
- **Ítem 13:** prohíbe bots o métodos automatizados para acceder al servicio o agregar o descargar contactos.
- **Ítems 7 y 10:** prohíben usar la marca "LinkedIn" en nombres de negocio o URLs y dar a entender afiliación.

**Lectura honesta:** al pie de la letra, cualquier extensión que cambie cómo se ve LinkedIn incumple el ítem 15. Hay muchas extensiones de este tipo publicadas en la Chrome Web Store hace años y no encontramos acciones legales contra ellas. Los juicios conocidos de LinkedIn apuntan al scraping (p. ej., hiQ Labs). El riesgo realista es un reclamo de baja a Google, una carta de cese o la suspensión de la cuenta de LinkedIn de quien la usa.

## 2. Cómo está diseñada para reducir el riesgo
| Decisión | Por qué |
|---|---|
| **Nunca oculta ni modifica publicidad** (regla fija en código y con test) | Es el ejemplo explícito del ítem 15 y lo que más afecta el negocio de LinkedIn. |
| **Cero scraping**: no guarda ni envía publicaciones, perfiles ni contactos | Ítem 2. |
| **Cero automatización**: no hace clics ni acciones en nombre del usuario | Ítem 13. |
| **Sin servidores ni analítica**: todo ocurre en el navegador | Privacidad, más simple de cumplir con las políticas de la Store, sin datos que filtrar. |
| **Nombre e identidad propios**: sin "Linked" ni "In", sin el azul ni el logo de LinkedIn | Marca registrada e ítem 7. |
| **Aclaración de no afiliación** en la ficha, opciones y política | Ítem 10 y política de suplantación de la Store. |
| **Ante la duda, se muestra** | Minimiza el impacto si un selector falla. |

## 3. Chrome Web Store
- Propósito único: cumplido (ordenar el feed).
- Política de privacidad: obligatoria aunque no se recolecten datos. Ver `PRIVACY.md`.
- Marcas: no usar el logo de LinkedIn en el ícono ni en las capturas promocionales.
- Las capturas no deben mostrar datos reales de terceros: usar el feed simulado.

## 4. Nombre: **Sereno** (elegido el 16/11/2026)
Candidatos revisados (búsqueda rápida, no es un estudio de marca):
| Nombre | Hallazgo | Riesgo |
|---|---|---|
| LinkedOut | Ya existe una extensión con ese nombre para LinkedIn (linkedout.lol), hay marcas "LINKED OUT" registradas en EE.UU. y juega con la marca de LinkedIn | **Alto** |
| Feedy | A una letra de **Feedly**, una marca muy conocida en la misma categoría (feeds) | **Alto** |
| Tidy Feed | "TidyFeed" existe: add-on activo para filtrar X (tidyfeed.app) y una extensión vieja para Facebook | **Medio** |
| Clean My Feed | Existe una extensión abandonada con ese nombre exacto y varias "Clean Feed" | Medio-bajo (nombre descriptivo, difícil de reclamar, pero poco distintivo) |
| **Sereno** ✅ | Sin coincidencias exactas; hay varias "Serene/Serenity" de nueva pestaña (otra categoría) | Bajo |

Antes de publicar: buscar en la Chrome Web Store, en la [USPTO](https://tmsearch.uspto.gov) y en la oficina de marcas de tu país (en Argentina, el INPI), y verificar disponibilidad de dominio.

Pendiente antes de publicar, para el nombre elegido: búsqueda formal de marca y dominio. Para cambiar el nombre en todo el proyecto: `npm run rename -- "Nuevo Nombre"` y luego `npm run build`.
