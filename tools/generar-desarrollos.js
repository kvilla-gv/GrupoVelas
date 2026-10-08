#!/usr/bin/env node
/* =====================================================================
   Grupo Velas · Generador de páginas individuales de desarrollo
   Crea <categoria>/<slug>/index.html para cada desarrollo de
   tools/desarrollos.js (salvo plantillas y categoria null), usando la
   plantilla de su categoría
   (<carpeta>/index.html; la carpeta de cada clave sale de
   assets/gv-categorias.js).
   Reutiliza el CSS de la plantilla tal cual (mismo diseño) y las
   interacciones de assets/gv-desarrollo.js. Las secciones sin datos
   (video, tour, simulador, prototipos) se omiten en lugar de inventarse.

   También escribe assets/gv-desarrollos.js (tarjetas, menú y conteos que
   leen el home y el navbar) y la meta description del home, solo entre
   <!-- gv:meta --> y <!-- /gv:meta --> en index.html.

   Uso:  node tools/generar-desarrollos.js
   Textos, fotos y amenidades de grupovelas.com.mx: tools/data/grupovelas.json
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DEVS = require('./desarrollos.js');
const GV = require('./data/grupovelas.json');
const BASE = '../../';

const SITE_URL = 'https://grupovelas.com.mx';

/* Claves de assets/gv-categorias.js: carpeta y nombre visible se leen de ahí */
const CATEGORIAS = require('../assets/gv-categorias.js');
const ACENTO = {entrada: '#c8643f', media: '#2f6f9f', alta: '#b8976a'};
const CATS = Object.fromEntries(Object.entries(CATEGORIAS).map(([k, c]) => [k, {dir: c.carpeta, name: c.nombre, acc: ACENTO[k]}]));
/* Oficinas de venta por plaza y foto de la ciudad (grupovelas.com.mx/ciudades).
   La foto de la ciudad solo se usa si el desarrollo aún no tiene fotos propias. */
const PLAZAS = {
  'Cancún': {estado: 'Quintana Roo', tel: '998 477 5050', mail: 'cancun@grupovelas.com.mx', img: 'img/ciudades/cancun.webp'},
  'Ciudad Juárez': {estado: 'Chihuahua', tel: '656 623 6654', mail: 'ciudadjuarez@grupovelas.com.mx', img: 'img/ciudades/ciudad-juarez.webp'},
  'Los Cabos': {estado: 'Baja California Sur', tel: '624 191 9320', mail: 'loscabos@grupovelas.com.mx', img: 'img/ciudades/los-cabos.webp'},
  'Matamoros': {estado: 'Tamaulipas', img: 'img/ciudades/matamoros.webp'},
  'Playa del Carmen': {estado: 'Quintana Roo', tel: '984 106 6243', mail: 'playadelcarmen@grupovelas.com.mx', img: 'img/ciudades/playa-del-carmen.webp'},
  'Querétaro': {estado: 'Querétaro', tel: '442 194 0719', mail: 'queretaro@grupovelas.com.mx', img: 'img/ciudades/queretaro.webp'},
  'Reynosa': {estado: 'Tamaulipas', img: 'img/ciudades/reynosa.webp'},
  'Tampico': {estado: 'Tamaulipas', tel: '833 184 5936', mail: 'tampico@grupovelas.com.mx', img: 'img/ciudades/tampico.webp'}
};
const WA_GENERAL = '520000000000'; // mismo número general que el home (index.html) — TODO: WhatsApp real por plaza

/* ---------- utilidades ---------- */
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const txt = s => esc(s).replace(/&lt;(\/?)(em|b)&gt;/g, '<$1$2>'); // permite <em> y <b> en textos del data
const plain = s => String(s ?? '').replace(/<[^>]+>/g, '');
/* Imágenes: las URLs externas (p. ej. de tools/data/grupovelas.json) se traducen a su ruta local
   con img/manifest.json; si una descarga quedó pendiente, se conserva la URL original */
const MANIFEST = require('../img/manifest.json');
const LOCAL = new Map();
for (const e of MANIFEST) if (e.estado === 'ok') for (const u of [e.origen, ...(e.variantes || [])]) LOCAL.set(u, e);
const url = s => !s ? '' : /^data:/.test(s) ? s : /^https?:/.test(s) ? (LOCAL.has(s) ? BASE + LOCAL.get(s).ruta : s) : BASE + s.replace(/^\//, '');
const mini = s => { const e = LOCAL.get(s) || MANIFEST.find(x => x.ruta === s); return e && e.mini ? url(e.mini.ruta) : url(s); };
const absoluta = s => { const u = url(s); return /^https?:/.test(u) ? u : `${SITE_URL}/${u.replace(/^(\.\.\/)+/, '')}`; };
const telHref = t => 'tel:+52' + String(t).replace(/\D/g, '');
const num = s => { const m = String(s ?? '').replace(/,/g, '').match(/[\d.]+/); return m ? +m[0] : 0; };
const js = o => JSON.stringify(o, null, 1).replace(/<\//g, '<\\/');
/* Logo del desarrollo: img/logos/<slug>.webp si está en img/manifest.json (con ancho y alto). Ancho en px
   para que todos ocupen un área parecida (un logo cuadrado no se ve enorme ni uno alargado diminuto);
   máx. 130 px de alto y 360 de ancho */
const logoDe = slug => {
  const e = MANIFEST.find(x => x.ruta === `img/logos/${slug}.webp` && x.estado === 'ok');
  if (!e) return null;
  const ratio = e.ancho / e.alto;
  return {src: e.ruta, w: e.ancho, h: e.alto, css: Math.round(Math.min(Math.sqrt(22000 * ratio), 130 * ratio, 360))};
};
const firstSentences = (s, max = 260) => {
  s = String(s || '').replace(/\s+/g, ' ').trim(); if (s.length <= max) return s;
  const cut = s.slice(0, max), i = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('.'));
  return i > 80 ? cut.slice(0, i + 1) : cut.replace(/\s\S*$/, '') + '…';
};

/* ---------- íconos ---------- */
const SVG = (vb, p, sw = 1.5) => `<svg viewBox="0 0 ${vb} ${vb}" fill="none" stroke="currentColor" stroke-width="${sw}" aria-hidden="true">${p}</svg>`;
const PERK = {
  shield: '<path d="M16 3 5 7v8c0 7 4.8 11.4 11 14 6.2-2.6 11-7 11-14V7z"/><path d="m11 16 3.5 3.5L21 13"/>',
  pin: '<path d="M16 29s9-9.2 9-16a9 9 0 0 0-18 0c0 6.8 9 16 9 16Z"/><circle cx="16" cy="13" r="3.5"/>',
  home: '<path d="M4 14 16 4l12 10v14H4z"/><path d="M12 28v-8h8v8"/>',
  leaf: '<path d="M16 29V16M16 16c-6 0-9-4-9-9 5 0 9 3 9 9ZM16 20c5 0 8-3 8-8-5 0-8 3-8 8Z"/><path d="M5 29h22"/>',
  star: '<path d="M16 4l3.4 7 7.6 1.1-5.5 5.4 1.3 7.6L16 21.5l-6.8 3.6 1.3-7.6L5 12.1l7.6-1.1z"/>',
  chart: '<path d="M5 27h22M8 27V18h4v9M14 27V13h4v14M20 27V8h4v19"/>',
  waves: '<circle cx="23" cy="9" r="3.5"/><path d="M3 20c3-2 5 2 8 0s5 2 8 0 5 2 8 0 2 0 2 0M3 26c3-2 5 2 8 0s5 2 8 0 5 2 8 0"/>',
  building: '<path d="M6 28V10l8-6v24M14 28V12l12 5v11M3 28h26"/><path d="M9 14h2M9 18h2M9 22h2M18 20h4M18 24h4"/>',
  people: '<circle cx="11" cy="11" r="4"/><circle cx="22" cy="12" r="3"/><path d="M3 27c1-5 4-8 8-8s7 3 8 8M19 20c4 0 7 2 8 7"/>',
  key: '<circle cx="11" cy="20" r="6"/><path d="m15.5 15.5 11-11M22 9l3 3M19 12l3 3"/>'
};
const AMEN = [
  [/alberca|piscina/i, '<path d="M4 27c3-2 5 2 8 0s5 2 8 0 5 2 8 0 5 2 8 0M4 33c3-2 5 2 8 0s5 2 8 0 5 2 8 0 5 2 8 0M13 23V10a3 3 0 0 1 6 0M25 23V10a3 3 0 0 1 6 0M13 15h12M13 20h12"/>'],
  [/gimnasio|gym|fitness/i, '<path d="M8 13v14M4 16v8M32 13v14M36 16v8M8 20h24"/>'],
  [/p[aá]del|pickleball|cancha|f[uú]tbol|b[aá]squet|deportiv/i, '<rect x="6" y="8" width="28" height="24" rx="1"/><path d="M20 8v24M6 20h28"/><circle cx="20" cy="20" r="4"/>'],
  [/juego|infantil|kids|niñ|piñat/i, '<path d="M6 35 14 7h2l8 28M10 21h10M26 35V16l8-4v23M4 35h32"/><circle cx="30" cy="8" r="2"/>'],
  [/p[eé]rgola/i, '<path d="M4 11h32M6 7h28M9 11v24M31 11v24M20 11v24M4 35h32"/>'],
  [/bodega/i, '<path d="M6 14 20 7l14 7v16l-14 7-14-7z"/><path d="m6 14 14 7 14-7M20 21v16"/>'],
  [/alumbrado/i, '<path d="M14 36h12M20 36V14M20 14c-6 0-9 3-9 7h18c0-4-3-7-9-7ZM15 24l-2 3M25 24l2 3M20 25v3"/>'],
  [/banqueta|vialidad|calle/i, '<path d="M12 4 7 36M28 4l5 32M20 8v4M20 18v4M20 28v4"/>'],
  [/asador|parrill|fogat|fire ?pit|picnic/i, '<path d="M8 16h24a12 12 0 0 1-24 0ZM14 26l-4 9M26 26l4 9M20 28v7M15 10c0-2 2-2 2-4M20 10c0-2 2-2 2-4M25 10c0-2 2-2 2-4"/>'],
  [/verde|jard[ií]n|parque|esparcimiento|sendero|natural/i, '<path d="M20 36V20M20 20c-7 0-10-5-10-11 6 0 10 4 10 11ZM20 25c6 0 9-4 9-10-6 0-9 4-9 10Z"/><path d="M6 36h28"/>'],
  [/segur|caseta|acceso|vigilan|filtro|bardead/i, '<path d="M20 4 7 9v9c0 8 5.5 13 13 16 7.5-3 13-8 13-16V9z"/><path d="m14 19 4 4 8-8"/>'],
  [/pet|mascota/i, '<ellipse cx="20" cy="26" rx="7" ry="6"/><circle cx="10" cy="17" r="3"/><circle cx="30" cy="17" r="3"/><circle cx="15" cy="10" r="3"/><circle cx="25" cy="10" r="3"/>'],
  [/elevador/i, '<rect x="9" y="5" width="22" height="30" rx="2"/><path d="M20 5v30M12 18l2.5-3 2.5 3M23 22l2.5 3 2.5-3"/>'],
  [/golf/i, '<path d="M14 34V6l12 5-12 5M8 34h16"/>'],
  [/roof|sky|bar|terraza/i, '<path d="M11 8h18l-9 12zM20 20v12M13 32h14"/>'],
  [/club|sal[oó]n|evento|usos m[uú]ltiples/i, '<path d="M5 18 20 7l15 11M9 16v18h22V16M16 34v-8h8v8"/>'],
  [/cowork|negocio|estudio/i, '<rect x="5" y="9" width="30" height="20" rx="2"/><path d="M14 35h12M20 29v6M11 16h10M11 21h14"/>'],
  [/spa|bienestar/i, '<path d="M20 31c-6 0-11-4-12-10 5 0 9 2 12 6 3-4 7-6 12-6-1 6-6 10-12 10ZM20 27c-2-3-2-8 0-12 2 4 2 9 0 12Z"/>'],
  [/playa|mar\b|traslado/i, '<circle cx="28" cy="11" r="4"/><path d="M4 26c3-2 5 2 8 0s5 2 8 0 5 2 8 0 5 2 8 0M4 32c3-2 5 2 8 0s5 2 8 0 5 2 8 0 5 2 8 0"/>'],
  [/estacionamiento|cochera/i, '<path d="M8 27V19l4-8h16l4 8v8M6 27h28v5H6zM11 32v3M29 32v3"/>'],
  [/escuela/i, '<path d="M4 15 20 7l16 8-16 8z"/><path d="M11 19v8c5 3 13 3 18 0v-8M36 15v9"/>']
];
const AMEN_DEF = '<path d="M20 5l4.3 8.8 9.7 1.4-7 6.8 1.7 9.6L20 27.1l-8.7 4.5 1.7-9.6-7-6.8 9.7-1.4z"/>';
const amenIcon = t => (AMEN.find(([re]) => re.test(t)) || [0, AMEN_DEF])[1];
const PLACE = [
  [/hospital|cl[ií]nica|imss|m[eé]dic/i, '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 8v8M8 12h8"/>'],
  [/escuela|universidad|tecnol[oó]gico|estudio|colegio/i, '<path d="M2 9 12 4l10 5-10 5zM6 11v5c3 2 9 2 12 0v-5"/>'],
  [/playa|laguna|malec[oó]n|mar\b/i, '<circle cx="17" cy="6" r="3"/><path d="M2 18c3-2 5 2 8 0s5 2 8 0 3 0 4-1M2 22c3-2 5 2 8 0s5 2 8 0"/>'],
  [/aeropuerto/i, '<path d="M3 14 21 6l-5 14-4-6-6 3z"/>'],
  [/super|walmart|soriana|heb|arteli|chedraui|costco|fresko|comercial|plaza|mall|bodega|tiendita/i, '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>'],
  [/avenida|av\.|carretera|libramiento|corredor|puente|blvd|perif[eé]rico|transpeninsular|viaducto/i, '<path d="M8 3 5 21M16 3l3 18M12 5v2M12 11v2M12 17v2"/>'],
  [/caf[eé]|coffee|restaurante/i, '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h2a2 2 0 0 1 0 4h-2M8 3v3M11 3v3"/>'],
  [/gimnasio|gym/i, '<path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12"/>'],
  [/centro hist[oó]rico|cine|mundo acu[aá]tico|parque/i, '<path d="M4 21h16M6 21V11h12v10M4 11l8-6 8 6M10 21v-5h4v5"/>']
];
const PLACE_DEF = '<path d="M12 21s7-6.5 7-11.5a7 7 0 0 0-14 0C5 14.5 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>';
const placeIcon = t => (PLACE.find(([re]) => re.test(t)) || [0, PLACE_DEF])[1];
const WA_ICO = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z"/></svg>';
const WA_FLOAT = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z"/></svg>';
const TEL_ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/></svg>';
const MAIL_ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
const PIN_ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 22s7-7.2 7-12.5a7 7 0 0 0-14 0C5 14.8 12 22 12 22Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
const CLOCK_ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const ZOOM_ICO = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5M11 8v6M8 11h6"/></svg>';
const HAND_ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8c0 4-2.5 7-6 7-2.5 0-4-1.2-5.5-3.2L3.8 15a1.5 1.5 0 0 1 2.4-1.8L8 15"/></svg>';
const GV_LOGO = 'img/comun/logo-grupo-velas.svg';

/* CSS de la plantilla (mismo diseño que la página de la categoría) */
const tplCSS = {};
for (const [k, c] of Object.entries(CATS)){
  const html = fs.readFileSync(path.join(ROOT, c.dir, 'index.html'), 'utf8');
  const m = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!m) throw new Error('Sin <style> en ' + c.dir);
  tplCSS[k] = m[1].trim().replace(/url\((['"]?)\.\.\//g, `url($1${BASE}`); // rutas de la plantilla (../) a la profundidad de la página
}
/* Ajustes para que los componentes de la plantilla funcionen con cualquier cantidad de datos */
const EXTRA_CSS = `
/* ---- Páginas generadas (tools/generar-desarrollos.js) ---- */
.logo{display:flex;align-items:center;gap:14px}
.logo img{height:36px}
.logo .dv{font-family:var(--serif);font-size:22px;font-weight:600;letter-spacing:.1em;line-height:1;padding-left:14px;border-left:1px solid currentColor;color:var(--navy);transition:color .5s;text-transform:uppercase;white-space:nowrap}
.logo .dv small{display:block;font-family:var(--sans);font-size:8.5px;letter-spacing:.42em;font-weight:600;margin-top:4px;opacity:.7}
.logo .dv.long{font-size:17px;letter-spacing:.06em}
header.top:not(.scrolled) .logo .dv{color:#fff}
.menu a,header.top .btn.desk{white-space:nowrap}
header.top.scrolled .logo img{filter:brightness(0) opacity(.85)}
.hero-stats .wrap{grid-template-columns:repeat(var(--n,4),1fr)}
.perks .grid{grid-template-columns:repeat(var(--n,4),1fr)}
.plan.photo{padding:0;cursor:zoom-in}
.plan.photo img{width:100%;height:100%;max-height:none;min-height:380px;object-fit:cover}
.proto-info .tower{display:block}
.pending{background:var(--sand);border:1px dashed var(--line);border-radius:18px;padding:clamp(24px,4vw,40px);display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center}
.pending h3{font-size:clamp(26px,2.6vw,34px);margin-bottom:8px}
.pending p{color:var(--muted);max-width:60ch}
.pending .acts{display:flex;gap:10px;flex-wrap:wrap}
.specs-row{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 6px}
.specs-row span{background:var(--sand);border:1px solid var(--line);border-radius:999px;padding:7px 14px;font-size:13px;font-weight:600;color:var(--navy)}
.sold-note{margin-top:14px;font-size:13px;color:var(--muted)}
.places li.np{grid-template-columns:28px 1fr}
.loc .more-txt{color:var(--muted);font-size:14px;margin:-10px 0 22px;max-width:58ch}
.hero-note{font-size:11px;opacity:.7;margin-top:14px}
/* Más de 3 prototipos: si no caben en una fila, van en filas de 3 sin indicador deslizante (como .tabs.four de residencial-plus) */
@media (max-width:1180px){
  .tabs.many{grid-template-columns:repeat(3,1fr)!important;width:100%;gap:4px}
  .tabs.many .ind{display:none}
  .tabs.many button{border-radius:5px;white-space:normal;line-height:1.25;padding:10px 8px}
  .tabs.many button.on{background:var(--navy)}
}
@media (max-width:480px){
  header.top .logo img{display:none}
  header.top .logo .dv{border-left:0;padding-left:0}
}
@media (max-width:900px){
  .hero-stats .wrap{grid-template-columns:repeat(min(var(--n,4),4),1fr)}
  .perks .grid{grid-template-columns:1fr 1fr}
  .pending{grid-template-columns:1fr}
  .plan.photo img{min-height:260px}
}`;

/* ---------- construcción de cada página ---------- */
function build(d){
  const C = CATS[d.categoria], g = GV[d.gv] || {}, pl = PLAZAS[d.plaza] || {};
  const estado = d.estado || pl.estado || '';
  const where = d.zona || d.plaza;
  const whereFull = [d.zona, d.plaza !== d.zona ? d.plaza : '', estado].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ');
  const sold = d.status === 'Vendido';
  /* Brochure: brochures/<slug>.pdf si existe; si no, el catálogo del data o de grupovelas.com.mx */
  const brochure = fs.existsSync(path.join(ROOT, 'brochures', d.slug + '.pdf')) ? `brochures/${d.slug}.pdf` : '';
  const catalog = brochure ? url(brochure) : d.catalog || g.catalog || '';

  /* Fotos: primero las propias (research / locales), luego las de grupovelas.com.mx */
  const photos = [];
  const seen = new Set();
  const addPhoto = (p, i) => { const o = typeof p === 'string' ? {src: p} : p; if (!o.src || seen.has(o.src) || (d.skipImages || []).some(s => o.src.includes(s))) return; seen.add(o.src); photos.push(o); };
  (d.images || []).forEach(addPhoto);
  (g.images || []).forEach(addPhoto);
  const heroPhotos = (d.hero || []).length ? d.hero.map(s => ({src: s})) : photos.filter(p => !p.cat || /amenidad|com[uú]n/i.test(p.cat)).slice(0, 3);
  if (!heroPhotos.length) heroPhotos.push({src: pl.img, city: true});
  const heroAlt = i => heroPhotos[i] && heroPhotos[i].city ? `Vista de ${d.plaza}` : `${d.name} en ${where}`;

  /* Textos base */
  const welcome = d.sub || firstSentences(g.welcome) || `Desarrollo ${C.name} de Grupo Velas en ${whereFull}. Un asesor te comparte toda la información.`;
  const desc = d.desc || plain(welcome);
  const typeLabel = d.type || '';
  const specs = [typeLabel, d.rec && `${d.rec.replace(/rec\.?/, 'recámaras')}`, d.m2 && `${d.m2} de construcción`, d.units].filter(Boolean);

  /* Amenidades */
  const amen = (d.amenities || g.amenities || []).map(a => typeof a === 'string' ? {t: a} : a);

  /* Prototipos: los del data o, si no hay, una ficha con los datos del inventario */
  let protos = (d.protos || []).map(p => ({...p}));
  const photoFor = i => (photos[i + 1] || photos[0] || heroPhotos[0] || {}).src;
  protos = protos.map((p, i) => {
    const feats = p.feats || [p.rec && `${p.rec} recámaras`, p.ban && `${p.ban} baños`, p.park, p.lot && `${p.lot} m² de terreno`].filter(Boolean);
    const img = p.plan || p.img || photoFor(i);
    return {name: p.name, tag: p.tag || [p.type, p.rec && `${p.rec} recámaras`].filter(Boolean).join(' · '), m2: num(p.m2), cap: p.cap || (p.m2 ? 'm² de construcción' : ''),
      img: url(img), isPlan: !!p.plan, photos: (p.photos || []).map(url), feats, unit: p.unit || `${p.type ? p.type + ' ' : ''}${p.name}`.trim(), price: p.price || ''};
  });
  if (!protos.length && specs.length > 1){
    protos = [{name: d.fichaName || typeLabel || d.name, tag: `${d.name} · ${where}`, m2: num(d.m2), cap: d.m2 ? (/–|-/.test(d.m2) ? 'm² de construcción (desde)' : 'm² de construcción') : '', img: url(photoFor(0)), isPlan: false, photos: [],
      feats: [typeLabel, d.rec && d.rec.replace(/rec\.?/, 'recámaras'), d.units, d.status && `Etapa: ${d.status}`].filter(Boolean), unit: typeLabel || 'Información general', price: ''}];
  }

  /* Ubicación */
  /* El radar necesita al menos 3 lugares con minutos; si hay menos, van como lista */
  let places = (d.places || []).filter(p => p.m);
  const nearby = (d.places || []).filter(p => !p.m).map(p => p.n);
  if (places.length < 3){ nearby.unshift(...places.map(p => `${p.n}, a ${p.m} minutos`)); places = []; }
  nearby.push(...(d.nearby || []));
  /* Sin dirección ni coordenadas confirmadas, el mapa muestra la ciudad (buscar por nombre puede fijar un pin equivocado) */
  const mapsQ = d.mapsQuery || (d.address ? `${plain(d.address)}, ${whereFull}` : `${where}, ${estado}`);
  const mapsEmbed = d.lat ? `https://maps.google.com/maps?q=${d.lat},${d.lon}&t=m&z=15&output=embed` : `https://maps.google.com/maps?q=${encodeURIComponent(mapsQ)}&t=m&z=${d.address || d.mapsQuery ? 15 : 12}&output=embed`;
  const mapsLink = d.lat ? `https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lon}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.address || d.mapsQuery ? mapsQ : `${d.name} ${where}`)}`;

  /* Contacto */
  const whatsapp = d.whatsapp || WA_GENERAL;
  const tel = d.tel || pl.tel || '';
  const mail = d.mail || pl.mail || '';
  const waMsg = `Hola, me gustaría recibir información de ${d.name} (${where}).`;

  /* Video / tour / simulador */
  const video = d.youtube ? {youtube: d.youtube} : (d.video || g.video) ? {src: String(d.video || g.video).replace(/\/view.*$/, '/preview')} : null;
  const tour = d.tour || '';
  const priceNum = d.price || 0;
  const calc = priceNum ? (d.categoria === 'entrada' ? {type: 'entrada', price: priceNum} : {type: d.categoria}) : null;

  /* Menú del desarrollo */
  const S = [];
  const menu = [];
  const sec = (id, label, html) => { if (!html) return; S.push(html); if (label) menu.push([id, label]); };
  const bgSand = ' style="background:var(--sand)"';

  /* ===== HERO ===== */
  const h1 = d.h1 || [d.name, `en <em>${where}</em>`];
  const chips = [];
  if (d.status) chips.push(d.status === 'Vendido' ? `<span class="chip"><b>Vendido</b></span>` : `<span class="chip live"><i></i><b>${esc(d.status)}</b></span>`);
  if (d.from) chips.push(`<span class="chip">Desde <b>${esc(d.from)}</b></span>`);
  (d.chips || []).forEach(c => chips.push(`<span class="chip">${txt(c)}</span>`));
  const stats = (d.stats || []).slice(0, 4);
  const statsHTML = stats.length ? `
  <div class="hero-stats">
    <div class="wrap" style="--n:${stats.length}">
      ${stats.map(s => `<div class="hs"><b>${s.pre ? `<small>${esc(s.pre)}</small> ` : ''}${s.n != null ? `<span data-count="${s.n}"${s.n % 1 ? ` data-dec="${String(s.n).split('.')[1].length}"` : ''}>${s.n}</span>` : esc(s.t)}${s.suf ? esc(s.suf) : ''}</b><span>${esc(s.l)}</span></div>`).join('\n      ')}
    </div>
  </div>` : '';
  const ctas = `<div class="ctas">
        ${protos.length ? `<a href="#prototipos" class="btn${d.categoria === 'alta' ? ' glass' : '" style="--bg:#fff;--fg:var(--navy)'}">${d.categoria === 'entrada' ? 'Conoce tu casa' : 'Ver prototipos'} <span class="arr">→</span></a>` : ''}
        <a href="#contacto" class="btn${d.categoria === 'alta' ? '" style="--bg:#fff;--fg:var(--navy)' : protos.length ? ' glass' : '" style="--bg:#fff;--fg:var(--navy)'}" data-unit="Información general">${sold ? 'Ver opciones disponibles' : 'Solicitar información'}${protos.length ? '' : ' <span class="arr">→</span>'}</a>
      </div>`;
  /* El logo va junto al eyebrow en un mismo bloque para no alterar el orden de .fade-seq */
  const logo = logoDe(d.slug);
  const eyebrow = `<span class="eyebrow is-in">${txt(d.eyebrow || `${C.name} · ${where}`)}</span>`;
  const heroInner = `<div class="hero-inner fade-seq">
      ${logo ? `<div class="hero-brand">
        <img class="hero-logo" src="${esc(url(logo.src))}" alt="Logo de ${esc(d.name)}" width="${logo.w}" height="${logo.h}" style="--w:${logo.css}px">
        ${eyebrow}
      </div>` : eyebrow}
      <h1><span class="line"><span>${txt(h1[0])}</span></span><span class="line"><span>${txt(h1[1])}</span></span></h1>
      <p class="sub">${txt(welcome)}</p>
      ${chips.length ? `<div class="chips">\n        ${chips.join('\n        ')}\n      </div>` : '<div class="chips"></div>'}
      ${ctas}${heroPhotos[0] && heroPhotos[0].city ? `\n      <p class="hero-note">Imagen de ${esc(d.plaza)}. Fotos del desarrollo próximamente.</p>` : ''}
    </div>`;
  let heroSide = '';
  if (d.categoria === 'media' && (protos.length || d.from)){
    heroSide = `<div class="pick" id="pick">
      ${protos.slice(0, 2).map(p => `<a href="#prototipos"><img src="${esc(p.img)}" alt="" loading="lazy"><div><small>${esc(p.tag.split(' · ')[0] || 'Prototipo')}</small><b>${p.m2 ? `${p.m2} m²` : esc(p.name)}</b><span>${esc(p.m2 ? p.name : p.feats.slice(0, 2).join(' · '))}</span></div><span class="go">→</span></a>`).join('\n      ')}
      ${d.from ? `<div class="price"><span>Desde</span><b>${esc(d.from)}</b></div>` : ''}
    </div>`;
  }
  if (d.categoria === 'entrada'){
    const p0 = protos[0];
    heroSide = `<aside class="price-card" id="priceCard">
      <small>${esc(p0 ? p0.name : d.name)} · ${d.from ? 'desde' : 'precio'}</small>
      <div class="pr">${d.from ? esc(d.from).replace(/ ?MXN/, '') + '<sup>MXN</sup>' : '<span style="font-size:.62em">Consúltalo</span>'}</div>
      <div class="pp">${esc(specs.slice(1).join(' · ') || where)}</div>
      <hr>
      <div class="q">¿Ya tienes tu crédito?</div>
      <div class="qopts" id="qopts"><button data-a="si">Sí</button><button data-a="nose">No sé</button><button data-a="no">No tengo</button></div>
      <div class="qans" id="qans"><div><p id="qtext"></p><a href="#" class="btn wa" id="qwa" data-wa>${WA_ICO}Escríbenos por WhatsApp</a></div></div>
    </aside>`;
  }
  const heroMedia = d.categoria === 'alta'
    ? `<div class="hero-media"><img src="${esc(url(heroPhotos[0].src))}" alt="${esc(heroAlt(0))}" id="heroImg" fetchpriority="high"></div>`
    : `<div class="slides" id="slides">
    ${heroPhotos.map((p, i) => `<img${i ? '' : ' class="on"'} src="${esc(url(p.src))}" alt="${esc(heroAlt(i))}"${i ? ' loading="lazy"' : ' id="heroImg" fetchpriority="high"'}>`).join('\n    ')}
  </div>`;
  const dots = d.categoria !== 'alta' && heroPhotos.length > 1 ? `\n  <div class="sdots" id="sdots">${heroPhotos.map((p, i) => `<button${i ? '' : ' class="on"'} aria-label="Foto ${i + 1}"><i></i></button>`).join('')}</div>` : '';
  sec('inicio', '', `<!-- ============ HERO ============ -->
<section class="hero" id="inicio">
  ${heroMedia}
  <div class="wrap">
    ${heroInner}${heroSide ? '\n    ' + heroSide : ''}
  </div>${dots}${statsHTML}
</section>`);

  /* ===== VENTAJAS ===== */
  const perks = d.perks || [
    {ic: 'shield', t: 'Respaldo Grupo Velas', s: 'Más de 45 años construyendo patrimonio en México.'},
    specs.length && {ic: 'home', t: typeLabel || 'Tu nuevo hogar', s: specs.slice(1).join(' · ') || `Vivienda ${C.name.toLowerCase()} en ${where}.`},
    amen.length && {ic: 'leaf', t: 'Amenidades', s: amen.slice(0, 3).map(a => a.t).join(', ') + (amen.length > 3 ? ' y más.' : '.')},
    {ic: 'pin', t: 'Ubicación', s: `${whereFull}.`},
    {ic: 'people', t: 'Asesoría personalizada', s: `Un asesor de ${d.plaza} te acompaña en todo el proceso.`}
  ].filter(Boolean).slice(0, 4);
  sec('ventajas', '', `<!-- ============ VENTAJAS ============ -->
<section class="perks" id="ventajas">
  <div class="wrap grid" style="--n:${perks.length}">
    ${perks.map((p, i) => `<div class="perk" data-reveal="up"${i ? ` style="--d:${(i * .08).toFixed(2)}s"` : ''}>${SVG(32, PERK[p.ic] || PERK.star, 1.4)}<div><b>${txt(p.t)}</b><span>${txt(p.s)}</span></div></div>`).join('\n    ')}
  </div>
</section>`);

  /* ===== PROTOTIPOS ===== */
  if (protos.length){
    const p0 = protos[0], many = protos.length > 1;
    const tabs = many ? `\n      <div class="tabs${protos.length > 3 ? ' many' : ''}" id="tabs" data-reveal="up" style="--d:.2s;grid-template-columns:repeat(${protos.length},1fr)"><span class="ind" style="width:calc(${(100 / protos.length).toFixed(3)}% - ${protos.length > 2 ? 2 : 4}px)"></span>${protos.map((p, i) => `<button${i ? '' : ' class="on"'} data-t="${i}">${esc(p.name)}</button>`).join('')}</div>` : '';
    const head = d.protoHead || (d.protos ? [`Conoce ${many ? 'nuestros prototipos' : 'el prototipo'}`, many ? 'Encuentra tu espacio ideal' : `Conoce ${p0.name}`] : ['Ficha del desarrollo', `Así es ${d.name}`]);
    const lead = d.protoLead || (d.protos ? `${many ? `${protos.length} prototipos` : 'Un prototipo'} en ${d.name}. Pide a un asesor planos, precios y disponibilidad actualizada.` : `Estos son los datos confirmados de ${d.name}. Un asesor te comparte prototipos, planos, precios y disponibilidad.`);
    sec('prototipos', d.categoria === 'entrada' ? 'La casa' : 'Prototipos', `<!-- ============ PROTOTIPOS ============ -->
<section class="sec proto" id="prototipos">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <span class="eyebrow" data-reveal="up">${esc(head[0])}</span>
        <h2 class="split-words" data-split>${esc(head[1])}</h2>
        <p class="lead" data-reveal="up" style="--d:.1s">${txt(lead)}</p>
      </div>${tabs}
    </div>

    <div class="proto-card" id="protoCard" data-reveal="scale" style="--d:.1s">
      <div class="plan${p0.isPlan ? '' : ' photo'}" id="plan" role="button" tabindex="0" aria-label="Ampliar imagen">
        <span class="scan"></span>
        <img id="planImg" src="${esc(p0.img)}" alt="${esc((p0.isPlan ? 'Planta ' : '') + p0.name)}" loading="lazy">
        <span class="zoom">${ZOOM_ICO}</span>
      </div>
      <div class="proto-info">
        <div class="tx">
          <span class="tower" id="pType">${esc(p0.tag)}</span>
          <h3 id="pName">${esc(p0.name)}</h3>
          <div id="pM2wrap"${p0.m2 ? '' : ' hidden'}><div class="m2"><span id="pM2">${p0.m2 || 0}</span><small>m²</small></div>
          <div class="m2cap" id="pCap">${esc(p0.cap)}</div></div>
          <ul class="flist" id="flist">${p0.feats.map((f, i) => `<li style="--i:${i}" class="${f.endsWith('*') ? 'hl' : ''}">${esc(f.replace('*', ''))}</li>`).join('')}</ul>
        </div>
        <div class="acts">
          <a href="#contacto" class="btn" id="pCta" data-unit="${esc(p0.unit)}">${sold ? 'Ver opciones disponibles' : d.categoria === 'entrada' ? 'Quiero esta casa' : 'Solicitar información'} <span class="arr">→</span></a>${catalog ? `\n          <a href="${esc(catalog)}" class="btn ghost" target="_blank" rel="noopener">${brochure ? 'Descargar brochure' : 'Descargar catálogo'}</a>` : ''}
        </div>
        <p class="proto-note">${esc(d.protoNote || 'Imágenes ilustrativas. Medidas aproximadas; precios y disponibilidad sujetos a cambio.')}</p>
      </div>
    </div>
  </div>
</section>`);
  } else {
    sec('prototipos', 'Información', `<!-- ============ INFORMACIÓN ============ -->
<section class="sec proto" id="prototipos">
  <div class="wrap">
    <div class="pending" data-reveal="up">
      <div>
        <span class="eyebrow">${esc(C.name)} · ${esc(where)}</span>
        <h3>Conoce ${esc(d.name)} con un asesor</h3>
        <p>${txt(d.pendingText || `Estamos preparando la ficha completa de ${d.name}. Pide a un asesor de ${d.plaza} prototipos, precios, planes de pago y disponibilidad actualizada.`)}</p>
        ${specs.length ? `<div class="specs-row">${specs.map(s => `<span>${esc(s)}</span>`).join('')}</div>` : ''}
      </div>
      <div class="acts"><a href="#contacto" class="btn" data-unit="Información general">Solicitar información <span class="arr">→</span></a><a href="#" class="btn ghost" data-wa>WhatsApp</a></div>
    </div>
  </div>
</section>`);
  }

  /* ===== VIDEO ===== */
  const videoPoster = (photos[1] || photos[0] || heroPhotos[0] || {}).src;
  const videoHTML = video ? `<!-- ============ VIDEO ============ -->
<section class="sec video-sec dark" id="video">
  <div class="wrap">
    <div class="head">
      <div>
        <span class="eyebrow" data-reveal="up">Video</span>
        <h2 class="split-words" data-split>Descubre ${esc(d.name)}</h2>
      </div>
      <p class="lead" data-reveal="up" style="--d:.1s">Recorre los espacios y amenidades de ${esc(d.name)}.</p>
    </div>
    <div class="vframe" id="vframe"${d.categoria === 'alta' ? '' : ' data-static="1" style="--vs:1;--vr:16px"'}>
      <img src="${esc(url(videoPoster))}" alt="${esc(d.name)}" loading="lazy">
      <button class="play" id="playBtn" aria-label="Reproducir video"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg></button>
      <div class="vlabel"><i></i>${esc(d.name)}</div>
    </div>
  </div>
</section>` : '';

  /* ===== TOUR ===== */
  /* tourLink: el proveedor no permite insertarlo (X-Frame-Options), se abre en otra pestaña */
  const tourExt = d.tourLink ? `<!-- ============ TOUR VIRTUAL ============ -->
<section class="sec tour" id="tour">
  <div class="wrap tour-grid">
    <div>
      <span class="eyebrow" data-reveal="up">Tour virtual 360°</span>
      <h2 class="split-words" data-split>Explora ${esc(d.name)} como si estuvieras ahí</h2>
      <p class="lead" data-reveal="up" style="--d:.1s">${txt(d.tourLead || 'Recorre el desarrollo desde donde estés. El recorrido se abre en una pestaña nueva.')}</p>
      <div data-reveal="up" style="--d:.3s;margin-top:26px"><a class="btn" href="${esc(d.tourLink)}" target="_blank" rel="noopener">Abrir recorrido 360° <span class="arr">↗</span></a></div>
    </div>
    <a class="viewer" href="${esc(d.tourLink)}" target="_blank" rel="noopener" aria-label="Abrir tour virtual en una pestaña nueva" data-reveal="scale" style="--d:.15s">
      <div class="pano" style="background-image:url('${esc(url((photos[1] || photos[0] || heroPhotos[0]).src))}')"></div>
      <div class="v360"><div class="orb"><b>360°</b></div><strong style="font-size:15px;letter-spacing:.04em">${esc(d.name)}</strong></div>
      <div class="hand">${HAND_ICO}Toca para abrir el recorrido</div>
    </a>
  </div>
</section>` : '';
  const tourHTML = tourExt || (tour ? `<!-- ============ TOUR VIRTUAL ============ -->
<section class="sec tour" id="tour">
  <div class="wrap tour-grid">
    <div>
      <span class="eyebrow" data-reveal="up">Tour virtual 360°</span>
      <h2 class="split-words" data-split>Explora ${esc(d.name)} como si estuvieras ahí</h2>
      <p class="lead" data-reveal="up" style="--d:.1s">Recorre cada espacio desde donde estés.</p>
      <div data-reveal="up" style="--d:.3s;margin-top:26px"><button class="btn" id="tourBtn">Iniciar recorrido <span class="arr">→</span></button></div>
    </div>
    <div class="viewer" id="viewer" data-reveal="scale" style="--d:.15s">
      <div class="pano" style="background-image:url('${esc(url(videoPoster))}')"></div>
      <div class="v360"><div class="orb"><b>360°</b></div><strong style="font-size:15px;letter-spacing:.04em">${esc(d.name)}</strong></div>
      <div class="hand">${HAND_ICO}Toca para comenzar</div>
      <div class="vtools">
        <button id="fsBtn" aria-label="Pantalla completa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
        <a href="${esc(tour)}" target="_blank" rel="noopener" aria-label="Abrir en nueva pestaña"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg></a>
      </div>
    </div>
  </div>
</section>` : '');

  /* ===== GALERÍA ===== */
  let galHTML = '';
  const gal = photos.slice(0, 18);
  if (gal.length >= 3){
    const cats = [...new Set(gal.map(p => p.cat).filter(Boolean))];
    const cap = p => p.cap || (p.cat ? p.cat.charAt(0) + p.cat.slice(1).toLowerCase() : d.name);
    const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');
    const PATTERN = ['w2 h2', '', '', '', '', 'w2', '', '', 'h2', '', '', 'w2', '', '', '', '', 'w2', ''];
    const filters = cats.length > 1 ? `
      <div class="filters" id="gfilters" data-reveal="up" style="--d:.15s">
        <span class="pill"></span>
        <button class="on" data-f="all">Todas</button>
        ${cats.map(c => `<button data-f="${slug(c)}">${esc(cap({cat: c}))}</button>`).join('\n        ')}
      </div>` : '';
    galHTML = `<!-- ============ GALERÍA ============ -->
<section class="sec" id="galeria"${d.categoria === 'media' ? bgSand : ''}>
  <div class="wrap">
    <div class="sec-head">
      <div>
        <span class="eyebrow" data-reveal="up">Galería</span>
        <h2 class="split-words" data-split>${esc(d.galTitle || (d.categoria === 'entrada' ? 'Imagina tu vida aquí' : `Así se vive en ${d.name}`))}</h2>
      </div>${filters}
    </div>
    <div class="gal" id="gal">
      ${gal.map((p, i) => `<figure class="g${PATTERN[i] ? ' ' + PATTERN[i] : ''}"${p.cat ? ` data-c="${slug(p.cat)}"` : ''} data-reveal="up"${i % 3 ? ` style="--d:${(i % 3) * .06}s"` : ''}><img src="${esc(mini(p.src))}" data-full="${esc(url(p.src))}" alt="${esc(cap(p) === d.name ? `${d.name} · foto ${i + 1}` : `${cap(p)} · ${d.name}`)}" loading="lazy"><figcaption>${esc(cap(p))}</figcaption></figure>`).join('\n      ')}
    </div>
    <p class="gnote" style="font-size:12px;color:var(--muted);margin-top:14px">Imágenes ilustrativas.</p>
  </div>
</section>`;
  }

  /* ===== AMENIDADES ===== */
  let amenHTML = '';
  if (amen.length){
    const bigImg = (amen.find(a => a.img) || {}).img || (photos.find(p => /amenidad/i.test(p.cat || '')) || photos[2] || photos[1] || photos[0] || {}).src;
    const withImg = amen.filter(a => a.img), rest = amen.filter(a => !a.img);
    const cards = [];
    if (withImg.length){
      withImg.forEach((a, i) => cards.push(`<div class="am${i === 0 ? ' big' : i % 3 === 1 ? ' wide' : ''}" data-reveal="up"${i ? ` style="--d:${((i % 4) * .06).toFixed(2)}s"` : ''}><img src="${esc(url(a.img))}" alt="${esc(a.t)}" loading="lazy"><div class="t"><div><b>${esc(a.t)}</b>${a.s ? `<span>${esc(firstSentences(a.s, 70))}</span>` : ''}</div><span class="n">${String(i + 1).padStart(2, '0')}</span></div></div>`));
    } else if (bigImg){
      cards.push(`<div class="am big" data-reveal="up"><img src="${esc(url(bigImg))}" alt="${esc(d.name)}" loading="lazy"><div class="t"><div><b>${esc(d.name)}</b><span>${esc(amen.length)} amenidades para disfrutar</span></div><span class="n">${esc(where.toUpperCase())}</span></div></div>`);
    }
    const off = withImg.length;
    /* Rejilla de 4 columnas: la tarjeta grande ocupa 4 celdas; se ensanchan las últimas para no dejar huecos */
    const wideIdx = new Set(d.amenWide || []);
    if (!d.amenWide && withImg.length <= 1){
      const r = rest.length % 4;
      if (r === 3) wideIdx.add(rest.length - 1);
      if (r === 2){ wideIdx.add(rest.length - 1); wideIdx.add(rest.length - 2); }
      if (r === 1 && rest.length > 1){ wideIdx.add(rest.length - 1); wideIdx.add(rest.length - 2); wideIdx.add(rest.length - 3); }
    }
    rest.forEach((a, i) => cards.push(`<div class="am ic${wideIdx.has(i) ? ' wide' : ''}" data-reveal="up" style="--d:${((i % 4) * .06).toFixed(2)}s">${SVG(40, amenIcon(a.t))}<div class="t" style="position:static"><div><b>${esc(a.t)}</b>${a.s ? `<span>${esc(firstSentences(a.s, 80))}</span>` : ''}</div><span class="n">${String(off + i + 1).padStart(2, '0')}</span></div></div>`));
    amenHTML = `<!-- ============ AMENIDADES ============ -->
<section class="sec" id="amenidades"${d.categoria === 'media' ? '' : bgSand}>
  <div class="wrap">
    <div class="sec-head" style="margin-bottom:0">
      <div>
        <span class="eyebrow" data-reveal="up">Amenidades</span>
        <h2 class="split-words" data-split>${esc(d.amenTitle || 'Espacios para disfrutar')}</h2>
      </div>
      <p class="lead" data-reveal="up" style="--d:.15s">${txt(d.amenLead || `${d.name} cuenta con ${amen.length} ${amen.length === 1 ? 'amenidad pensada' : 'amenidades pensadas'} para vivir en comunidad.`)}</p>
    </div>
    <div class="amen">
      ${cards.join('\n      ')}
    </div>
  </div>
</section>`;
  }

  /* ===== CÓMO COMPRAR (Residencial) ===== */
  const stepsHTML = d.categoria === 'entrada' ? `<!-- ============ CÓMO COMPRAR ============ -->
<section class="sec" id="como-comprar">
  <div class="wrap">
    <div class="center">
      <span class="eyebrow" data-reveal="up">Cómo comprar</span>
      <h2 class="split-words" data-split>Tu camino a casa, paso a paso</h2>
      <p class="lead" data-reveal="up" style="--d:.1s">Te acompañamos en todo el proceso. Tu asesor te confirma qué créditos aplican en ${esc(d.name)}${d.credits ? ` (${esc(d.credits)})` : ''}.</p>
    </div>
    <div class="tl-steps" id="tlsteps">
      <div class="ts" style="--d:0s"><span class="n">1</span><b>Revisa tu precalificación</b><p>Consulta tu monto de crédito en <a href="https://micuenta.infonavit.org.mx/" target="_blank" rel="noopener">Mi Cuenta Infonavit</a>, Fovissste o con tu banco.</p></div>
      <div class="ts" style="--d:.3s"><span class="n">2</span><b>Visita ${esc(d.name)}</b><p>Recorre el desarrollo con un asesor y elige tu casa.</p></div>
      <div class="ts" style="--d:.6s"><span class="n">3</span><b>Reúne tus documentos</b><p>Identificación, acta de nacimiento, CURP, RFC y comprobante de domicilio.</p></div>
      <div class="ts" style="--d:.9s"><span class="n">4</span><b>Trámite de tu crédito</b><p>Integramos tu expediente, avalúo y firma contigo.</p></div>
      <div class="ts" style="--d:1.2s"><span class="n">5</span><b>Recibe tus llaves</b><p>Escrituras y entrega de tu nueva casa.</p></div>
    </div>
  </div>
</section>` : '';

  /* ===== SIMULADOR ===== */
  let calcHTML = '';
  if (calc){
    const pm = priceNum / 1e6, max = Math.max(pm * 1.6, pm + 1);
    const intro = `<div>
      <span class="eyebrow" data-reveal="up">${d.categoria === 'entrada' ? 'Haz tus números' : 'Planes de pago'}</span>
      <h2 class="split-words" data-split>${d.categoria === 'entrada' ? '¿Cuánto te falta para estrenar?' : 'Haz tus números en segundos'}</h2>
      <p class="lead" data-reveal="up" style="--d:.1s">${d.categoria === 'entrada' ? 'Ingresa el monto de tu crédito y tu ahorro. Te decimos si te alcanza o cuánto te falta.' : `Ajusta el precio de referencia, el enganche y el plazo para conocer una mensualidad estimada en ${esc(d.name)}. Un asesor te comparte los planes vigentes.`}</p>
      <div style="margin-top:26px;--d:.2s" data-reveal="up"><a href="#contacto" class="link" data-unit="Planes de pago">Quiero mi corrida financiera <span class="arr">→</span></a></div>
    </div>`;
    let card;
    if (d.categoria === 'entrada'){
      card = `<div class="calc-card" data-reveal="scale" style="--d:.1s">
      <div class="fixed"><span>${esc(protos[0] ? protos[0].name : d.name)} · desde</span><b>${esc(d.from)}</b></div>
      <div class="f"><div class="range-row"><span>Tu crédito</span><b id="crV"></b></div><input type="range" id="cr" min="200000" max="${Math.round(priceNum * 1.3 / 10000) * 10000}" step="10000" value="${Math.round(priceNum * .75 / 10000) * 10000}" aria-label="Monto de crédito"></div>
      <div class="f"><div class="range-row"><span>Tu ahorro disponible</span><b id="ahV"></b></div><input type="range" id="ah" min="0" max="${Math.round(priceNum * .4 / 5000) * 5000}" step="5000" value="${Math.round(priceNum * .07 / 5000) * 5000}" aria-label="Ahorro disponible"></div>
      <div class="out"><div><small>Cubres</small><b id="oCub">$0</b></div><div class="big"><small id="oLbl">Te falta</small><b id="oFal">$0</b></div></div>
      <div class="calc-msg" id="cmsg"></div>
      <p class="disc">Estimación ilustrativa sobre el precio de lista. No incluye gastos de escrituración ni avalúo. El monto de tu crédito lo determina la institución que lo otorga.</p>
    </div>`;
    } else {
      const esMedia = d.categoria === 'media';
      card = `<div class="calc-card" data-reveal="scale" style="--d:.1s">${esMedia ? `
      <div class="pmodes" id="pmodes"><span class="pill"></span><button class="on" data-m="banco">Crédito bancario</button><button data-m="directo">Plan directo</button><button data-m="contado">Contado</button></div>` : ''}
      <div class="f"><div class="range-row"><span>Precio de referencia</span><b id="prV"></b></div><input type="range" id="pr" min="${pm.toFixed(1)}" max="${max.toFixed(1)}" step="0.1" value="${pm.toFixed(1)}" aria-label="Precio de referencia en millones"></div>
      <div class="f"${esMedia ? ' data-for="banco directo"' : ''}><div class="range-row"><span>Enganche</span><b id="engV"></b></div><input type="range" id="eng" min="${esMedia ? 10 : 20}" max="${esMedia ? 50 : 60}" step="5" value="${esMedia ? 20 : 30}" aria-label="Porcentaje de enganche"></div>${esMedia ? `
      <div class="f" data-for="banco"><div class="range-row"><span>Plazo del crédito</span><b id="yrV"></b></div><input type="range" id="yrs" min="5" max="20" step="5" value="20" aria-label="Plazo en años"></div>
      <div class="f" data-for="banco"><div class="rate"><span>Tasa anual de referencia</span><span><input type="number" id="rate" value="11" min="6" max="18" step="0.1"> %</span></div></div>` : ''}
      <div class="f"${esMedia ? ' data-for="directo"' : ''}><div class="range-row"><span>Plazo para el saldo</span><b id="plzV"></b></div><input type="range" id="plz" min="6" max="36" step="6" value="24" aria-label="Plazo en meses"></div>
      <div class="out"><div><small id="o1L">Enganche</small><b id="o1">$0</b></div><div class="big"><small id="o2L">Mensualidad estimada</small><b id="o2">$0</b></div></div>
      <p class="disc" id="cdisc">Estimación ilustrativa sin intereses; no constituye una oferta. Precios y planes sujetos a cambio y disponibilidad.</p>
    </div>`;
    }
    calcHTML = `<!-- ============ SIMULADOR ============ -->
<section class="sec" id="financiamiento"${d.categoria === 'alta' ? '' : bgSand}>
  <div class="wrap calc">
    ${intro}
    ${card}
  </div>
</section>`;
  }

  /* ===== UBICACIÓN ===== */
  const R = (() => { const maxM = Math.max(...places.map(p => p.m), 1); return m => 48 + Math.sqrt(m / maxM) * 168; })();
  const ringVals = (() => { if (!places.length) return []; const maxM = Math.max(...places.map(p => p.m)); const v = [2, 5, 10, 15, 20, 30, 45, 60, 90].filter(x => x < maxM * .9); return [...v.slice(-2), maxM]; })();
  const shortName = d.radarLabel || d.name.toUpperCase().replace(/^FRACCIONAMIENTO\s+/, '');
  const nameLines = shortName.length > 12 && shortName.includes(' ') ? [shortName.slice(0, shortName.lastIndexOf(' ', 12) > 0 ? shortName.lastIndexOf(' ', 12) : shortName.indexOf(' ')), shortName.slice((shortName.lastIndexOf(' ', 12) > 0 ? shortName.lastIndexOf(' ', 12) : shortName.indexOf(' ')) + 1)] : [shortName];
  const radar = places.length ? `<div class="radar">
        <svg viewBox="0 0 500 500" aria-label="Distancias desde ${esc(d.name)}">
          <defs><radialGradient id="rg"><stop offset="0" stop-color="${C.acc}" stop-opacity=".35"/><stop offset="1" stop-color="${C.acc}" stop-opacity="0"/></radialGradient><linearGradient id="sw" x1="0" x2="1"><stop offset="0" stop-color="#0f2340" stop-opacity="0"/><stop offset="1" stop-color="#0f2340" stop-opacity=".1"/></linearGradient></defs>
          <rect width="500" height="500" fill="#f4efe8"/>
          ${ringVals.map(v => `<circle class="ring" cx="250" cy="250" r="${R(v).toFixed(1)}"/><text class="rl" x="250" y="${(250 - R(v) - 5).toFixed(1)}" text-anchor="middle">${v} MIN</text>`).join('\n          ')}
          <path class="sweep" d="M250 250 L480 250 A230 230 0 0 0 413 87 Z" fill="url(#sw)"/>
          <g id="pts">
            ${places.map((p, i) => {
              const a = ((d.placeAngles && d.placeAngles[i]) ?? (-150 + i * 360 / places.length)) * Math.PI / 180, r = R(p.m);
              const x = +(250 + r * Math.cos(a)).toFixed(1), y = +(250 + r * Math.sin(a)).toFixed(1), right = Math.cos(a) >= -0.2;
              /* Etiqueta al costado del punto; si no cabe en el lienzo, centrada encima */
              const label = p.short || p.n, w = Math.max(label.length * 7.4, 60);
              let tx = x + (right ? 12 : -12), anchor = right ? 'start' : 'end', ty = y - 2;
              if (right ? tx + w > 492 : tx - w < 8){ anchor = 'middle'; tx = +Math.min(Math.max(x, w / 2 + 8), 492 - w / 2).toFixed(1); ty = y < 60 ? y + 24 : y - 30; }
              return `<g class="p" data-p="${i}" style="--d:${(i * .15).toFixed(2)}s"><line class="ln" x1="250" y1="250" x2="${x}" y2="${y}"/><circle class="pt" cx="${x}" cy="${y}" r="7" fill="#0f2340" stroke="#fff" stroke-width="2.5"/><text class="lb" x="${tx}" y="${ty}" text-anchor="${anchor}">${esc(label)}<tspan class="s" x="${tx}" dy="14">${p.m} min${p.d ? ' · ' + esc(p.d) : ''}</tspan></text></g>`;
            }).join('\n            ')}
          </g>
          <circle class="core" cx="250" cy="250" r="26" fill="url(#rg)"/>
          <circle cx="250" cy="250" r="32" fill="#0f2340"/>
          ${nameLines.map((l, i) => `<text x="250" y="${nameLines.length > 1 ? 247 + i * 11 : 253}" text-anchor="middle" fill="#fff" style="font:700 ${l.length > 10 ? 7 : 8}px Manrope,sans-serif;letter-spacing:.12em">${esc(l)}</text>`).join('')}
        </svg>
      </div>` : '';
  const placeLis = [
    ...places.map((p, i) => `<li data-p="${i}" data-reveal="right" style="--d:${(i * .05 + .05).toFixed(2)}s">${SVG(24, placeIcon(p.n + ' ' + (p.ic || '')))}<span>${esc(p.n)}</span><b>${p.m} min</b><em>${esc(p.d || '')}</em></li>`),
    ...nearby.map((n, i) => `<li class="np" data-reveal="right" style="--d:${((places.length + i) * .05 + .05).toFixed(2)}s">${SVG(24, placeIcon(n))}<span>${esc(n)}</span></li>`)
  ];
  const address = d.address || whereFull;
  sec('ubicacion', 'Ubicación', `<!-- ============ UBICACIÓN ============ -->
<section class="sec loc" id="ubicacion">
  <div class="wrap loc-grid">
    <div>
      <span class="eyebrow" data-reveal="up">Ubicación</span>
      <h2 class="split-words" data-split>${esc(d.locTitle || (places.length ? 'Todo a unos minutos' : 'Cerca de todo'))}</h2>
      <p class="lead" data-reveal="up" style="--d:.1s">${txt(d.locLead || (placeLis.length ? `${d.name} está en ${whereFull}, cerca de:` : `${d.name} está en ${whereFull}.`))}</p>
      ${placeLis.length ? `<ul class="places" id="places">\n        ${placeLis.join('\n        ')}\n      </ul>` : ''}
      ${d.locText || (g.location && g.location.text && !d.noCityText) ? `<p class="more-txt" data-reveal="up">${txt(d.locText || firstSentences(g.location.text, 240))}</p>` : ''}
      <div class="addr" data-reveal="up">${PIN_ICO.replace('stroke-width="1.8"', 'stroke-width="1.6"')}<span>${txt(address)}</span></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap" data-reveal="up">
        <a href="${esc(mapsLink)}" target="_blank" rel="noopener" class="btn">Cómo llegar <span class="arr">→</span></a>
      </div>
    </div>
    <div class="mapbox${places.length ? '' : ' gm'}" id="mapbox" data-reveal="scale">
      ${places.length ? `<div class="toggle"><div class="filters" id="mtoggle"><span class="pill"></span><button class="on" data-m="radar">Distancias</button><button data-m="gmap">Mapa</button></div></div>
      ${radar}` : ''}
      <div class="gmap" id="gmap"></div>
    </div>
  </div>
</section>`);

  /* Orden de secciones por categoría (como en su plantilla) */
  const order = {
    alta: [['video', 'Video', videoHTML], ['tour', 'Tour virtual', tourHTML], ['galeria', 'Galería', galHTML], ['amenidades', 'Amenidades', amenHTML]],
    media: [['tour', 'Tour virtual', tourHTML], ['amenidades', 'Amenidades', amenHTML], ['galeria', 'Galería', galHTML], ['video', 'Video', videoHTML]],
    entrada: [['galeria', 'Galería', galHTML], ['amenidades', 'Amenidades', amenHTML], ['video', 'Video', videoHTML], ['como-comprar', 'Cómo comprar', stepsHTML]]
  }[d.categoria];
  const ubic = S.pop(), ubicMenu = menu.pop();
  order.forEach(([id, label, html]) => sec(id, label, html));
  if (d.categoria === 'entrada' && calcHTML) sec('financiamiento', '', calcHTML);
  S.push(ubic); menu.push(ubicMenu);
  if (d.categoria !== 'entrada' && calcHTML) sec('financiamiento', 'Planes de pago', calcHTML);

  /* ===== GRUPO VELAS ===== */
  const gvImg = (photos[3] || photos[1] || photos[0] || heroPhotos[0]).src;
  const third = d.gvStat || (d.units ? {b: String(num(d.units)), s: d.units.replace(/^[\d,.+\s]+/, '') + ' en ' + d.name} : d.status && !sold ? {b: d.status.split(' ')[0], s: d.status.split(' ').slice(1).join(' ') || 'etapa actual'} : {b: C.name.split(' ').map(w => w[0]).join(''), s: `Categoría ${C.name}`});
  sec('grupo-velas', '', `<!-- ============ GRUPO VELAS ============ -->
<section class="gv" id="grupo-velas">
  <div class="ph" data-reveal="clip"><img src="${esc(url(gvImg))}" alt="${esc(d.name)}" loading="lazy" data-parallax=".12"></div>
  <div class="txt">
    <span class="eyebrow" data-reveal="up">Un desarrollo de Grupo Velas</span>
    <h2 class="split-words" data-split>Más de 45 años construyendo patrimonio</h2>
    <p class="lead" data-reveal="up" style="--d:.1s">${esc(d.name)} es un desarrollo de Grupo Velas, empresa mexicana con una trayectoria impecable en la industria de la construcción y marca hermana de la reconocida cadena hotelera Velas Resorts.</p>
    <div class="stats">
      <div class="stat" data-reveal="up" style="--d:.1s"><b>+<span data-count="45">0</span></b><span>años en la construcción</span></div>
      <div class="stat" data-reveal="up" style="--d:.2s"><b>+<span data-count="100">0</span><small style="font-size:.5em"> mil</small></b><span>familias confían en nosotros</span></div>
      <div class="stat" data-reveal="up" style="--d:.3s"><b>${/^\d+$/.test(third.b) ? `<span data-count="${third.b}">0</span>` : esc(third.b)}</b><span>${esc(third.s)}</span></div>
    </div>
  </div>
</section>`);

  /* ===== FAQ ===== */
  const faqs = [];
  faqs.push([`¿Cuál es el precio de ${d.name}?`, d.from ? `${d.name} está disponible desde ${d.from}${d.priceNote ? ' ' + d.priceNote : ''}. Precios sujetos a cambio y disponibilidad; un asesor te comparte los planes de pago vigentes.` : sold ? `${d.name} está vendido. Un asesor de ${d.plaza} te muestra otros desarrollos disponibles en la plaza.` : `Un asesor de ${d.plaza} te comparte precios, disponibilidad y planes de pago vigentes de ${d.name}.`]);
  if (d.protos && d.protos.length) faqs.push([`¿Qué prototipos hay en ${d.name}?`, d.protoFaq || protos.map(p => `${p.name}: ${[p.m2 && `${p.m2} m² de construcción`, ...p.feats.map(f => f.replace('*', ''))].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')}`).join('. ') + '.']);
  else if (specs.length > 1) faqs.push([`¿Qué tipo de vivienda ofrece ${d.name}?`, specs.join(', ') + '.']);
  if (amen.length) faqs.push([`¿Qué amenidades tiene ${d.name}?`, amen.map(a => a.t).join(', ') + '.']);
  if (d.status) faqs.push([`¿En qué etapa está ${d.name}?`, sold ? `${d.name} está vendido.` : d.status === 'Disponible' ? `${d.name} está disponible.` : `${d.name} se encuentra en ${d.status.toLowerCase()}.`]);
  if (d.categoria === 'entrada' || d.credits) faqs.push(['¿Puedo comprar con crédito?', d.credits ? `Sí. ${d.name} acepta: ${d.credits}. Un asesor te acompaña en todo el trámite.` : `Un asesor te indica qué créditos (Infonavit, Fovissste o bancario) aplican para ${d.name} y te acompaña en todo el trámite.`]);
  faqs.push([`¿Dónde se ubica ${d.name}?`, `En ${address.replace(/<br>/g, ' ')}.` + (places.length ? ` Está a ${places.slice(0, 3).map(p => `${p.m} minutos de ${p.n.charAt(0).toLowerCase() + p.n.slice(1)}`).join(', ')}.` : '')]);
  faqs.push([`¿Quién desarrolla ${d.name}?`, 'Grupo Velas, empresa mexicana con más de 45 años en la construcción y marca hermana de Velas Resorts.']);
  (d.faq || []).forEach(f => faqs.splice(faqs.length - 1, 0, f));
  sec('faq', '', `<!-- ============ FAQ ============ -->
<section class="sec" style="background:var(--sand)" id="faq">
  <div class="wrap center">
    <span class="eyebrow" data-reveal="up">Preguntas frecuentes</span>
    <h2 class="split-words" data-split>Lo que necesitas saber</h2>
  </div>
  <div class="wrap faq">
    ${faqs.map(([q, a], i) => `<details data-reveal="up"${i ? ` style="--d:${(i * .05).toFixed(2)}s"` : ''}><summary>${esc(q)}<i></i></summary><div class="ans"><div><p>${esc(a)}</p></div></div></details>`).join('\n    ')}
  </div>
</section>`);

  /* ===== CONTACTO ===== */
  const unitOpts = ['Cualquier prototipo', ...protos.filter(() => d.protos).map(p => p.unit), 'Precios y disponibilidad', 'Planes de pago', 'Visita al desarrollo'];
  const contacts = [
    `<li><a href="#" data-wa>${WA_ICO}WhatsApp</a></li>`,
    tel && `<li><a href="${telHref(tel)}">${TEL_ICO}(+52) ${esc(tel)}</a></li>`,
    mail && `<li><a href="mailto:${esc(mail)}">${MAIL_ICO}${esc(mail)}</a></li>`,
    `<li>${CLOCK_ICO}Lunes a viernes 9:00 am – 6:00 pm · Sábado 9:00 am – 2:00 pm</li>`
  ].filter(Boolean);
  const formExtra = d.categoria === 'entrada'
    ? `<div class="two">
        <div class="fld"><select id="fc" name="credito"><option>Sí tengo crédito</option><option>No sé si tengo</option><option>No tengo crédito</option></select><label for="fc">¿Tienes crédito?</label></div>
        <div class="fld"><select id="fh" name="horario"><option>9 am – 2 pm</option><option>2 pm – 6 pm</option></select><label for="fh">Horario para llamarte</label></div>
      </div>
      <input type="hidden" name="prototipo" id="fproto" value="${esc(protos[0] ? protos[0].unit : '')}">`
    : `<div class="two">
        <div class="fld"><select id="fu" name="interes">${unitOpts.map(o => `<option>${esc(o)}</option>`).join('')}</select><label for="fu">Me interesa</label></div>
        <div class="fld"><select id="fo" name="objetivo"><option>Para vivir</option><option>Para invertir</option><option>Ambos</option></select><label for="fo">Lo quiero</label></div>
      </div>`;
  const cBg = (photos[0] || heroPhotos[0]).src;
  sec('contacto', 'Contacto', `<!-- ============ CONTACTO ============ -->
<section class="final dark" id="contacto">
  <div class="bg" data-parallax=".15" style="background-image:url('${esc(url(cBg))}')"></div>
  <div class="wrap">
    <div>
      <span class="eyebrow" data-reveal="up">${sold ? 'Desarrollo vendido' : 'Asesores especializados'}</span>
      <h2 class="split-words" data-split>${esc(sold ? `Conoce otras opciones en ${d.plaza}` : `Agenda tu visita a ${d.name}`)}</h2>
      <p data-reveal="up" style="--d:.1s">${esc(sold ? `${d.name} ya está vendido, pero tenemos otros desarrollos en ${d.plaza}. Déjanos tus datos y un asesor te comparte las opciones disponibles.` : `Déjanos tus datos y un asesor de ${d.plaza} te contacta con precios, disponibilidad y planes de pago de ${d.name}.`)}</p>
      ${sold ? `<p class="sold-note" data-reveal="up" style="--d:.15s"><a class="link" style="color:#fff" href="${BASE}index.html?plaza=${encodeURIComponent(d.plaza)}#desarrollos">Ver desarrollos en ${esc(d.plaza)} <span class="arr">→</span></a></p>` : ''}
      <div data-reveal="clip" style="--d:.3s"><span class="script">${esc(d.script || 'Descubre tu próximo hogar')}</span></div>
      <ul class="contacts" data-reveal="up" style="--d:.2s">
        ${contacts.join('\n        ')}
      </ul>
    </div>

    <form class="form" id="form" data-reveal="up" style="--d:.15s" novalidate>
      <h3>${esc(d.categoria === 'entrada' ? `Quiero mi casa en ${d.name}` : 'Recibe precios y disponibilidad')}</h3>
      <p class="hint">Un asesor te contacta muy pronto.</p>
      <div class="fld"><input id="fn" name="nombre" placeholder=" " required autocomplete="name"><label for="fn">Nombre completo</label></div>
      <div class="two">
        <div class="fld"><input id="fp" name="telefono" type="tel" placeholder=" " required autocomplete="tel" inputmode="tel"><label for="fp">Teléfono / WhatsApp</label></div>
        <div class="fld"><input id="fe" name="email" type="email" placeholder=" " autocomplete="email"><label for="fe">Correo electrónico</label></div>
      </div>
      ${formExtra}
      <input type="hidden" name="desarrollo" value="${esc(d.name)}"><input type="hidden" name="categoria" value="${esc(C.name)}"><input type="hidden" name="plaza" value="${esc(d.plaza)}">
      <input type="hidden" name="utm_source"><input type="hidden" name="utm_medium"><input type="hidden" name="utm_campaign"><input type="hidden" name="utm_content"><input type="hidden" name="utm_term"><input type="hidden" name="gclid"><input type="hidden" name="fbclid">
      <button class="btn" type="submit">Hablar con un asesor <span class="arr">→</span></button>
      <div class="alt">
        <a class="btn ghost sm" href="#" data-wa>WhatsApp</a>
        ${tel ? `<a class="btn ghost sm" href="${telHref(tel)}">Llamar</a>` : `<a class="btn ghost sm" href="#ubicacion">Ubicación</a>`}
      </div>
      <p class="legal">Al enviar aceptas nuestro <a href="#" style="text-decoration:underline">Aviso de privacidad</a>.</p>
      <div class="ok">
        <svg viewBox="0 0 70 70" fill="none" stroke="#0f2340" stroke-width="2.5"><circle cx="35" cy="35" r="30"/><path d="m22 36 9 9 17-19" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <h3>¡Gracias!</h3>
        <p>Recibimos tus datos. Un asesor de ${esc(d.name)} te contactará muy pronto.</p>
      </div>
    </form>
  </div>
</section>`);

  /* ===== PIE: solo el corporativo (assets/gv-nav.js), igual que en el home ===== */
  const footer = `<!-- ============ FOOTER (corporativo, igual que en el home) ============ -->
<div data-gv-footer></div>`;

  /* ===== DOCUMENTO ===== */
  const logoText = d.logoText || d.name.replace(/^Fraccionamiento\s+/i, '').replace(/\s+Residencial$/i, '');
  /* Título ≤60 sin categoría; si se pasa, se recorta " MXN", luego el tipo y luego el precio */
  const mkTitle = (t, p) => `${d.name} · ${t ? t + ' en ' : ''}${where}${p ? ' desde ' + p : ''} | Grupo Velas`;
  let tTipo = typeLabel, tPrecio = d.from || '';
  if (mkTitle(tTipo, tPrecio).length > 60) tPrecio = tPrecio.replace(/ MXN$/, '');
  if (mkTitle(tTipo, tPrecio).length > 60) tTipo = '';
  if (mkTitle(tTipo, tPrecio).length > 60) tPrecio = '';
  const title = d.title || mkTitle(tTipo, tPrecio);
  /* Meta ≤158; la categoría se agrega solo si la frase cabe completa y no está ya en el texto */
  const descBase = firstSentences(desc, 158), catFrase = `Desarrollo ${C.name} de Grupo Velas en ${whereFull}.`;
  const metaDesc = d.metaDesc || (!descBase.includes(C.name) && !descBase.endsWith('…') && `${descBase} ${catFrase}`.length <= 158 ? `${descBase} ${catFrase}` : descBase);
  /* Vista previa en redes: misma foto que antes (de preferencia una del backend corporativo), ya local y absoluta */
  const ogImg = absoluta((photos.find(p => /backend\.grupovelas\.com/.test(p.src)) || heroPhotos[0]).src);
  const ld = {
    '@context': 'https://schema.org', '@type': /departamento/i.test(typeLabel) && !/casa/i.test(typeLabel) ? 'ApartmentComplex' : 'Residence',
    name: d.name, description: plain(desc),
    ...(/^https?:/.test(ogImg) ? {image: ogImg} : {}),
    address: {'@type': 'PostalAddress', ...(d.address ? {streetAddress: plain(d.address).split(',')[0]} : {}), addressLocality: d.zona || d.plaza, addressRegion: estado, addressCountry: 'MX'},
    ...(d.lat ? {geo: {'@type': 'GeoCoordinates', latitude: d.lat, longitude: d.lon}} : {}),
    ...(tel ? {telephone: '+52 ' + tel} : {}),
    ...(amen.length ? {amenityFeature: amen.map(a => ({'@type': 'LocationFeatureSpecification', name: a.t, value: true}))} : {}),
    brand: {'@type': 'Organization', name: 'Grupo Velas'}
  };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/`},
      {'@type': 'ListItem', position: 2, name: C.name, item: `${SITE_URL}/${C.dir}/`},
      {'@type': 'ListItem', position: 3, name: d.name, item: `${SITE_URL}/${C.dir}/${d.slug}/`}
    ]
  };
  const DEV = {
    name: d.name, whatsapp, waMsg, mapsEmbed,
    protos: protos.map(({name, tag, m2, cap, img, isPlan, photos, feats, unit}) => ({name, tag, m2, cap, img, isPlan, photos, feats, unit})),
    ...(video ? {video} : {}), ...(tour ? {tour} : {}), ...(calc ? {calc} : {}),
    ...(d.categoria === 'entrada' ? {
      msgs: {si: `Hola, tengo crédito y me interesa una casa en ${d.name}, ${where}.`, nose: `Hola, quiero saber si mi crédito me alcanza para una casa en ${d.name}, ${where}.`, no: `Hola, no tengo crédito y quiero saber cómo comprar una casa en ${d.name}, ${where}.`},
      qText: {si: `¡Excelente! Escríbenos y revisamos contigo si tu crédito aplica para ${d.name}.`, nose: 'Te ayudamos a revisarlo. Con tu número de seguridad social te orientamos sobre tu precalificación.', no: 'No te preocupes: escríbenos y un asesor te explica qué opciones tienes para comprar tu casa.'}
    } : {})
  };

  return `<!DOCTYPE html>
<html lang="es-MX">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(metaDesc)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(metaDesc)}">
${/^https?:/.test(ogImg) ? `<meta property="og:image" content="${esc(ogImg)}">\n` : ''}<!-- Generado con tools/generar-desarrollos.js a partir de ${C.dir}/index.html. Edita tools/desarrollos.js y vuelve a generar. -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="preload" as="image" href="${esc(url(heroPhotos[0].src))}">

<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(breadcrumb, null, 2)}
</script>

<link rel="stylesheet" href="${BASE}assets/gv-nav.css">
<style>
${tplCSS[d.categoria]}
${EXTRA_CSS}
</style>
</head>
<body>

<div class="progress" id="progress"></div>

<!-- ============ HEADER ============ -->
<header data-gv-header></header>
<header class="top" id="top">
  <div class="wrap nav">
    <a href="#inicio" class="logo" aria-label="${esc(d.name)} · Grupo Velas"><img src="${url(GV_LOGO)}" alt="Grupo Velas"><span class="dv${logoText.length > 12 ? ' long' : ''}">${esc(logoText)}<small>${esc(where.toUpperCase())}</small></span></a>
    <nav class="menu" id="menu">
      ${menu.map(([id, l]) => `<a href="#${id}">${esc(l)}</a>`).join('\n      ')}
    </nav>
    <a href="#contacto" class="btn sm desk">${sold ? 'Ver opciones' : 'Agendar visita'} <span class="arr">→</span></a>
    <button class="burger" id="burger" aria-label="Abrir menú"><span></span><span></span><span></span></button>
  </div>
</header>

${S.join('\n\n')}

${footer}

<a href="#" class="wa" id="wa" data-wa aria-label="Escríbenos por WhatsApp">${WA_FLOAT}</a>
<div class="mbar" id="mbar">
  <a class="btn${d.categoria === 'alta' ? ' ghost' : ' wa'}" href="#" data-wa>WhatsApp</a>
  <a class="btn" href="#contacto">${sold ? 'Ver opciones' : 'Agendar visita'} <span class="arr">→</span></a>
</div>

<!-- Lightbox -->
<dialog id="lb">
  <button class="lbx" id="lbX" aria-label="Cerrar">×</button>
  <div class="stage">
    <button class="lbnav prev" id="lbP" aria-label="Anterior">←</button>
    <img id="lbImg" alt="">
    <button class="lbnav next" id="lbN" aria-label="Siguiente">→</button>
  </div>
  <div class="lbbar"><span id="lbCap"></span><span class="lbcount" id="lbCount"></span></div>
</dialog>

<script src="${BASE}assets/gv-desarrollos.js"></script>
<script src="${BASE}assets/gv-categorias.js"></script>
<script src="${BASE}assets/gv-nav.js" data-base="${BASE}" data-cat="${d.categoria}" data-city="${esc(d.plaza)}"></script>
<script>
/* ===== CONFIGURACIÓN DEL DESARROLLO (generada desde tools/desarrollos.js) ===== */
window.DEV = ${js(DEV)};
</script>
<script src="${BASE}assets/gv-desarrollo.js"></script>
</body>
</html>
`;
}

/* ---------- escritura ---------- */
const only = process.argv.slice(2);
let n = 0;
for (const d of DEVS){
  if (d.categoria !== null && !CATS[d.categoria]) throw new Error(`Categoría inválida en ${d.name}: ${d.categoria}`);
  if (d.categoria === null || d.plantilla) continue; // sin categoría confirmada o ya es plantilla: no se genera
  if (only.length && !only.includes(d.slug)) continue;
  if (d.gv && !GV[d.gv]) throw new Error(`Sin datos de grupovelas.com.mx para ${d.name} (gv: ${d.gv})`);
  const out = path.join(ROOT, CATS[d.categoria].dir, d.slug, 'index.html');
  fs.mkdirSync(path.dirname(out), {recursive: true});
  fs.writeFileSync(out, build(d));
  n++;
  console.log('✓', path.relative(ROOT, out).replace(/\\/g, '/'));
}
console.log(`${n} páginas generadas.`);

/* ---------- datos para el navegador: assets/gv-desarrollos.js ---------- */
/* "Desde": menos de 1 millón, completo ($770,000); desde 1 millón, MDP truncado
   a 2 decimales sin ceros sobrantes ($2.38 MDP, $7.2 MDP). Nunca redondea hacia arriba. */
const desde = p => p < 1e6 ? '$' + p.toLocaleString('en-US') : `$${Math.floor(p / 1e4) / 100} MDP`;
const conCat = DEVS.filter(d => d.categoria !== null);
const plazas = [...new Set(conCat.map(d => d.plaza))];
for (const p of plazas) if (!PLAZAS[p]) throw new Error(`Plaza sin estado en PLAZAS: ${p}`);
const RESUMEN = {
  total: conCat.length,
  plazas: plazas.length,
  estados: new Set(plazas.map(p => PLAZAS[p].estado)).size,
  desde: Object.fromEntries(Object.keys(CATS).map(k => {
    const precios = conCat.filter(d => d.categoria === k && d.price > 0).map(d => d.price);
    return [k, precios.length ? desde(Math.min(...precios)) : ''];
  }))
};
const primeraFoto = d => { const i = (d.images || [])[0]; return typeof i === 'string' ? i : i ? i.src : ''; };
const tarjeta = d => ({
  name: d.name, ...(d.nombreCorto ? {nombreCorto: d.nombreCorto} : {}), cat: d.categoria, plaza: d.plaza, zona: d.zona || '',
  status: d.status || '', type: d.type || '', rec: d.rec || '', m2: d.m2 || '',
  from: d.price > 0 ? desde(d.price) : d.from || '', // mismo formato que los paneles
  img: d.img || primeraFoto(d), feat: d.feat || '',
  url: d.categoria === null ? '' : d.plantilla ? `${CATS[d.categoria].dir}/index.html` : `${CATS[d.categoria].dir}/${d.slug}/index.html`,
  gv: d.gv || ''
});
fs.writeFileSync(path.join(ROOT, 'assets/gv-desarrollos.js'), `/* =====================================================================
   Grupo Velas · Desarrollos para el navegador — GENERADO, no editar.
   Sale de tools/desarrollos.js con tools/generar-desarrollos.js.
   GV_DESARROLLOS: tarjetas del home y menú (cat null = solo en el menú).
   GV_RESUMEN: total, plazas, estados y precio "desde" por categoría.
   ===================================================================== */
window.GV_DESARROLLOS = [
${DEVS.map(d => '  ' + JSON.stringify(tarjeta(d))).join(',\n')}
];
window.GV_RESUMEN = ${JSON.stringify(RESUMEN)};
`);
console.log('✓ assets/gv-desarrollos.js');

/* ---------- meta description del home (solo entre los marcadores) ---------- */
const HOME = path.join(ROOT, 'index.html'), homeSrc = fs.readFileSync(HOME, 'utf8');
const MARCA = /<!-- gv:meta -->[\s\S]*?<!-- \/gv:meta -->/;
if (!MARCA.test(homeSrc)) throw new Error('index.html sin marcadores <!-- gv:meta --> … <!-- /gv:meta -->');
const nombres = Object.values(CATS).map(c => c.name);
const homeMeta = `Encuentra tu hogar con Grupo Velas: ${RESUMEN.total} desarrollos en ${RESUMEN.plazas} plazas de México, en las categorías ${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}.`;
const homeNuevo = homeSrc.replace(MARCA, `<!-- gv:meta --><meta name="description" content="${esc(homeMeta)}"><!-- /gv:meta -->`);
if (homeNuevo !== homeSrc) fs.writeFileSync(HOME, homeNuevo);
console.log('✓ index.html (meta description)');

/* ---------- img/MANIFEST.md (se genera de img/manifest.json; no editar a mano) ---------- */
const kb = n => (n / 1024).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' KB';
const okImg = MANIFEST.filter(e => e.estado === 'ok'), pendientes = MANIFEST.filter(e => e.estado !== 'ok');
const total = k => okImg.reduce((t, e) => t + (k === 'mini' ? (e.mini ? e.mini.peso : 0) : e[k]), 0);
fs.writeFileSync(path.join(ROOT, 'img/MANIFEST.md'), `# Imágenes · manifiesto

Generado por \`tools/generar-desarrollos.js\` a partir de \`img/manifest.json\` (origen → ruta local → pesos).
No editar a mano. La URL original de cada imagen solo vive aquí y en \`img/manifest.json\`
(aparte de los datos crudos de \`tools/data/grupovelas.json\`, que no se tocan).

- ${okImg.length} imágenes locales, ${okImg.filter(e => e.mini).length} con miniatura de 800 px (\`-800.webp\`, solo en galerías y recortes de Selvanova).
- Peso: ${kb(total('antes'))} antes → ${kb(total('despues'))} después, más ${kb(total('mini'))} de miniaturas.
- WebP de máx. 1920 px de ancho y ≤400 KB; los SVG se copian tal cual.
${pendientes.length ? `
## Pendientes de descarga (conservan su URL original)

| Ruta local esperada | Origen |
|---|---|
${pendientes.map(e => `| \`${e.ruta}\` | ${e.origen} |`).join('\n')}
` : ''}
## Imágenes

| Ruta local | Origen | Antes | Después | Miniatura |
|---|---|---:|---:|---:|
${okImg.map(e => `| \`${e.ruta}\` | ${e.origen}${e.variantes ? ` (+${e.variantes.length} variante${e.variantes.length > 1 ? 's' : ''})` : ''} | ${kb(e.antes)} | ${kb(e.despues)} | ${e.mini ? kb(e.mini.peso) : '—'} |`).join('\n')}
`);
console.log('✓ img/MANIFEST.md');
