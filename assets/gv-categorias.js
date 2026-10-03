/* =====================================================================
   Grupo Velas · Categorías (fuente única)
   El código usa la clave; el nombre visible y la carpeta viven aquí.
   Sirve en Node (require) y en el navegador (window.GV_CATEGORIAS).
   ===================================================================== */
(function (root) {
  const CATEGORIAS = {
    entrada: {nombre: 'Residencial', carpeta: 'residencial'},
    media: {nombre: 'Residencial Plus', carpeta: 'residencial-plus'},
    alta: {nombre: 'Premium', carpeta: 'premium'}
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = CATEGORIAS;
  else root.GV_CATEGORIAS = CATEGORIAS;
})(this);
