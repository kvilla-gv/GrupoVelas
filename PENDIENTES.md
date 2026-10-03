# Pendientes

## Imágenes (paso 6)
- **Fondo de la sección de contacto.** En `residencial/index.html` y `residencial-plus/index.html`
  (y en las páginas generadas desde ellas), `.final .bg` es una regla CSS sin uso con
  `url("@@/2024/10/Copia-de-Roof-top-vista-1-1536x1024.jpg")`; la imagen visible viene del
  `style` en línea. Se limpia en el paso 6.
  Lo detecta `tools/verificar.js` (enlaces rotos).

## Datos de desarrollos
- **Recámaras por verificar.** Fuente: grupovelas.com.mx (`tools/data/grupovelas.json`); el home
  anterior decía otro valor. Fraccionamiento Loma Bonita: 4 (home: 3). Arecas (Altamira): 3
  (home: 2). Vista Laguna: 3 (home: 2).
- **Sin categoría confirmada** (`categoria: null`): Coto Jade, Valle Esmeralda y Conjunto Roma 401
  (Tampico). Solo aparecen en el navbar, con enlace a su ficha en grupovelas.com.mx; no tienen
  página, tarjeta ni entran en los conteos.
- **Precios "Desde" por categoría.** Los calculados son más altos que los que tenía el home:
  Residencial Plus $1.5 → $2.38 MDP y Premium $4.5 → $7.2 MDP. Confirmar con marketing.
  (Residencial bajó de $790,000 MXN a $770,000.)

## Para otro paso
- **PLAZAS / CIUDADES copiadas en tres lugares:** `index.html` (`PLAZAS`, coordenadas del mapa),
  `assets/gv-nav.js` (`CIUDADES`, plaza y estado) y `tools/generar-desarrollos.js` (`PLAZAS`:
  estado, oficina y foto).
