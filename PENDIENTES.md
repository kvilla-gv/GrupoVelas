# Pendientes

## Imágenes (paso 6)
- **Fondo de la sección de contacto roto.** En `pvivienda/index.html` y `residencial/index.html`
  (y en las páginas generadas desde ellas), `.final .bg` usa
  `url("@@/2024/10/Copia-de-Roof-top-vista-1-1536x1024.jpg")`. Nada reemplaza el marcador `@@/`,
  así que la imagen no carga. Se resuelve al descargar la foto a `img/` en el paso 6.
  Lo detecta `tools/verificar.js` (enlaces rotos).
