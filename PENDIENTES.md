# Pendientes

## Imágenes
- **Foto de Unsplash en el home** (de stock, no de Grupo Velas): reemplazarla por una foto real.
  `img/home/unsplash-1600585154340.webp` (guía "¿Construir desde cero o comprar en preventa?").
  Origen en `img/MANIFEST.md`.

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
