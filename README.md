# Sereno

> Tu feed de LinkedIn sin desconocidos, sin humo y sin números.

Extensión de Chrome (Manifest V3). Funciona 100% en el navegador: sin servidores, sin analítica y sin cuentas.

![Popup](docs/screenshots/popup.png)

## Qué hace
| Función | Qué hace |
|---|---|
| **Solo mi red** | Oculta «a X le gustó», «X comentó» y los sugeridos. Tiene un modo estricto opcional que deja solo contactos directos. |
| **Detector de humo** | Marca, atenúa u oculta cebos de interacción, historias de plantilla y posts de una frase por renglón. |
| **Sin números** | Oculta likes, comentarios y contadores de seguidores. |
| **Palabras silenciadas** | Oculta posts que mencionan temas que no quieres ver. |

Regla fija: **nunca toca la publicidad** (ver [docs/LEGAL.md](docs/LEGAL.md)).

## Probarla en tu Chrome
1. `chrome://extensions` → activar **Modo de desarrollador**.
2. **Cargar extensión sin empaquetar** → elegir esta carpeta.
3. Abrir https://www.linkedin.com/feed/

## Estructura
```
manifest.json
src/
  content/detectors.js   lógica pura de clasificación (testeada en Node)
  content/content.js     aplica la lógica al DOM; selectores centralizados en SEL
  content/content.css    estilos inyectados (prefijo sereno-)
  popup/                 popup de la barra
  options/               página de ajustes y bienvenida
  shared/settings.js     ajustes y estadísticas (chrome.storage)
  shared/ui.*            tokens visuales e i18n
  background/            abre la bienvenida al instalar
_locales/es, en          generados desde scripts/strings.mjs
icons/                   icon.svg → PNG
docs/                    privacidad, ficha de la Store, notas legales, capturas
tests/                   unit (node:test) + e2e (Chromium real con feed simulado)
```

## Comandos
```bash
npm test              # tests unitarios del detector
npm run e2e           # carga la extensión en Chromium sobre un feed simulado
npm run screenshots   # e2e y además genera capturas en docs/screenshots
npm run build         # regenera textos (_locales) e íconos
npm run pack          # genera dist/<nombre>-<versión>.zip para la Store
npm run rename -- "Nuevo Nombre"
```
Los textos se editan en `scripts/strings.mjs`, nunca a mano en `_locales/`. Los tests e2e e íconos usan Playwright.

## Cuando LinkedIn cambie su HTML
Se va a romper cada tanto, es inevitable. Todo lo que depende del HTML está en el objeto `SEL` de `src/content/content.js`. El diseño falla "hacia mostrar": si un selector deja de funcionar, se ve LinkedIn normal y no se oculta nada por error.

## Estado
- [x] MVP funcional con tests unitarios (17) y e2e
- [ ] **Validar selectores contra el LinkedIn real** (los tests usan un feed simulado)
- [ ] Definir el nombre definitivo (ver docs/LEGAL.md)
- [ ] Publicar la política de privacidad en una URL pública y completar el email de contacto
- [ ] Imagen promocional de 440×280
