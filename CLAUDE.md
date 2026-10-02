# Sitio corporativo Grupo Velas Desarrollos — Revamp

Propuesta de rediseño de grupovelas.com.mx. Sitio estático (HTML/CSS/JS), sin framework
ni build. Todo en español. SITE_URL = https://grupovelas.com.mx

## REGLAS DE ALCANCE (las más importantes)
- Haz SOLO el paso que se te pide. Al terminarlo, detente y reporta. No sigas al siguiente.
- Cualquier cambio fuera de lo pedido (limpiezas, refactors, "mejoras", CSS nuevo,
  reorganizar código): PROPÓNLO primero y espera confirmación. No lo hagas "porque conviene".
- No cambies el comportamiento visual ni la estructura de páginas salvo que se pida.
- Si algo es ambiguo o falta un dato, pregunta. No inventes datos ni decisiones.
- Trabaja en la rama `revamp-categorias`, un commit por paso (commits convencionales).
- No dejes servidores ni procesos corriendo al terminar.

## Estructura
- `index.html` — home
- `<categoria>/index.html` — plantilla maestra de cada categoría
- `<categoria>/<slug>/index.html` — páginas GENERADAS; no editar a mano
- `tools/desarrollos.js` — datos de cada desarrollo (fuente única de verdad)
- `tools/generar-desarrollos.js` — generador
- `assets/gv-nav.js|.css` — navbar y footer compartidos
- `assets/gv-desarrollo.js` — interacción de páginas de desarrollo

## Categorías
| Clave interna | Nombre visible   | Slug / carpeta     | Antes           | Carpeta vieja  |
|---------------|------------------|--------------------|-----------------|----------------|
| entrada       | Residencial      | residencial/       | Primera Vivienda| pvivienda/     |
| media         | Residencial Plus | residencial-plus/  | Residencial     | residencial/   |
| alta          | Premium          | premium/           | Residencial Plus| residencialp/  |

- Los nombres viejos y nuevos se enciman: NUNCA buscar y reemplazar texto.
- El nombre visible vive en un solo archivo de configuración; el código usa la clave.
- Al mover carpetas: primero residencial/ → residencial-plus/, luego pvivienda/ →
  residencial/, luego residencialp/ → premium/.
- Nombres retirados (no deben aparecer, sin distinguir mayúsculas): "Primera Vivienda",
  "Vivienda de Entrada", "Residencial Medio", "Residencial Premium".
- "primera casa" SÍ está permitido como copy (ej. "¿Es tu primera casa?").
- Velasur se queda con su página generada desde la plantilla, como los demás.
  No integrar ninguna otra versión de Velasur.

## Datos
- `tools/desarrollos.js` es la única lista. Home y navbar leen de ahí.
- No inventar datos. Si falta algo, no se muestra y se anota en PENDIENTES.md.
- Desarrollos sin categoría confirmada: `categoria: null`, fuera de tarjetas, buscador
  y conteo; visibles solo en el navbar.
- Precios "Desde" de cada categoría: se calculan del precio mínimo; si no hay, no se muestran.
- Nombre correcto: "Velasur".

## SEO
- Títulos ≤60 caracteres terminando en "| Grupo Velas". Sin la categoría en el título.
- Meta description ≤158 caracteres.
- JSON-LD BreadcrumbList: Inicio → categoría → proyecto.

## Imágenes
- Todas locales en `img/`, sin URLs externas (se permiten las de terceros).
- WebP, máx. ~1920px de ancho, 200–400 KB. Registro en `img/MANIFEST.md`.
- Las descargas que fallen se reportan en lista, no se saltan en silencio.

## Pendientes de publicación (fuera de alcance por ahora)
Formularios a CRM, WhatsApp real, aviso de privacidad, GTM, versión en inglés.