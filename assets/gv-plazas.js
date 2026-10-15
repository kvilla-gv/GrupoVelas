/* =====================================================================
   Grupo Velas · Plazas (fuente única)
   Las leen el home (mapa, lista, filtros y formulario), el navbar
   (menú de ciudades y pie) y el generador (estado, oficina y foto).
   Mismas plazas y orden que grupovelas.com.mx/ciudades.
   Sirve en Node (require) y en el navegador (window.GV_PLAZAS).

   Por plaza:
     estado     estado de la república
     lat, lon   punto en el mapa del home
     etiqueta   [dx, dy, text-anchor] del nombre junto al punto del mapa
     img        foto de la ciudad (solo si el desarrollo aún no tiene fotos propias)
     tel, mail  oficina de ventas; si no hay, no se muestra
   ===================================================================== */
(function (root) {
  const PLAZAS = {
    'Cancún': {estado: 'Quintana Roo', lat: 21.16, lon: -86.85, etiqueta: [-4, -14, 'end'], img: 'img/ciudades/cancun.webp', tel: '998 477 5050', mail: 'cancun@grupovelas.com.mx'},
    'Ciudad Juárez': {estado: 'Chihuahua', lat: 31.69, lon: -106.42, etiqueta: [12, 4, 'start'], img: 'img/ciudades/ciudad-juarez.webp', tel: '656 623 6654', mail: 'ciudadjuarez@grupovelas.com.mx'},
    'Los Cabos': {estado: 'Baja California Sur', lat: 22.89, lon: -109.92, etiqueta: [12, 4, 'start'], img: 'img/ciudades/los-cabos.webp', tel: '624 191 9320', mail: 'loscabos@grupovelas.com.mx'},
    'Matamoros': {estado: 'Tamaulipas', lat: 25.87, lon: -97.5, etiqueta: [12, 4, 'start'], img: 'img/ciudades/matamoros.webp'},
    'Playa del Carmen': {estado: 'Quintana Roo', lat: 20.63, lon: -87.08, etiqueta: [-12, 16, 'end'], img: 'img/ciudades/playa-del-carmen.webp', tel: '984 106 6243', mail: 'playadelcarmen@grupovelas.com.mx'},
    'Querétaro': {estado: 'Querétaro', lat: 20.59, lon: -100.39, etiqueta: [-12, 4, 'end'], img: 'img/ciudades/queretaro.webp', tel: '442 194 0719', mail: 'queretaro@grupovelas.com.mx'},
    'Reynosa': {estado: 'Tamaulipas', lat: 26.09, lon: -98.28, etiqueta: [-12, -6, 'end'], img: 'img/ciudades/reynosa.webp'},
    'Tampico': {estado: 'Tamaulipas', lat: 22.25, lon: -97.86, etiqueta: [12, 4, 'start'], img: 'img/ciudades/tampico.webp', tel: '833 213 2727', mail: 'tampico@grupovelas.com.mx'}
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = PLAZAS;
  else root.GV_PLAZAS = PLAZAS;
})(this);
