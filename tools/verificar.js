#!/usr/bin/env node
/* =====================================================================
   Grupo Velas · Verificación del sitio
   Revisa las reglas del CLAUDE.md sin modificar nada:
     1. Nombres retirados de categorías
     2. Claves viejas de categoría (pv / re / rp) en literales, objetos,
        puntajes del quiz (pv:2), variables CSS (--pv) y clases (i.pv{)
     3. Rutas viejas (pvivienda/, residencialp/) y carpetas que no
        coinciden con la categoría del desarrollo en tools/desarrollos.js
     4. "Vela Sur" (el nombre correcto es "Velasur")
     5. Imágenes con URL externa en los archivos publicados
     6. Enlaces locales rotos (href/src/url() y rutas en JS)
     7. Páginas generadas al día con tools/generar-desarrollos.js
        (se corre el generador en una copia temporal del sitio)
     8. Nombres de categoría según assets/gv-categorias.js: textos con
        data-cat, campo oculto "categoria", BreadcrumbList, "Nombre · …" /
        "… · Nombre" / "Categoría Nombre" y la lista del home
     10. Imágenes locales: cada archivo de img/ está en img/manifest.json y
        viceversa, con su peso; WebP o SVG de máx. 400 KB; descargas pendientes
     9. Lista única de desarrollos: sin copias de la lista (DEVS = [,
        PROYECTOS = [, IMG_LOCAL o 4+ nombres de desarrollos en un script),
        gv-desarrollos.js cargado antes de gv-nav.js y cifras fijas del home
        iguales a los datos

   Uso:  node tools/verificar.js          (máx. 20 hallazgos por revisión)
         node tools/verificar.js --todo   (todos los hallazgos)
   Sale con código 1 si hay algún hallazgo.
   ===================================================================== */
const fs = require('fs');
const os = require('os');
const path = require('path');
const {execFileSync} = require('child_process');

const ROOT = path.join(__dirname, '..');
const TODO = process.argv.includes('--todo');
const LIMITE = 20;

/* Carpeta de cada clave de categoría (assets/gv-categorias.js) */
const CATEGORIAS = require('../assets/gv-categorias.js');
const CARPETAS = Object.fromEntries(Object.entries(CATEGORIAS).map(([k, c]) => [k, c.carpeta]));
const NOMBRES = Object.fromEntries(Object.entries(CATEGORIAS).map(([k, c]) => [k, c.nombre]));
const SITE_URL = 'https://grupovelas.com.mx';
const CARPETAS_VIEJAS = ['pvivienda', 'residencialp'];
const RETIRADOS = ['Primera Vivienda', 'Vivienda de Entrada', 'Residencial Medio', 'Residencial Premium'];
/* Dominios que sirven imágenes aunque la URL no termine en extensión */
const HOSTS_IMG = ['backend.grupovelas.com', 'images.unsplash.com', 'i.ytimg.com', 'img.youtube.com'];
const EXT_IMG = /\.(webp|jpe?g|png|gif|svg|avif)(\?|#|$)/i;

/* Archivos revisados: excluye .git, node_modules, el CLAUDE.md, este script
   y los datos crudos de grupovelas.com.mx (no son .html/.js/.css/.md) */
const EXCLUIR = new Set(['CLAUDE.md', 'tools/verificar.js']);
function listar(dir = ROOT, out = []){
  for (const e of fs.readdirSync(dir, {withFileTypes: true})){
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listar(p, out);
    else if (/\.(html|js|css|md)$/.test(e.name) && !EXCLUIR.has(rel(p))) out.push(p);
  }
  return out;
}
const rel = p => path.relative(ROOT, p).replace(/\\/g, '/');
const ARCHIVOS = listar().map(p => ({p, r: rel(p), lineas: fs.readFileSync(p, 'utf8').split('\n')}));
const PUBLICADOS = ARCHIVOS.filter(f => !f.r.startsWith('tools/') && !f.r.endsWith('.md'));
const sinAcentos = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const recorta = s => { s = s.trim(); return s.length > 110 ? s.slice(0, 107) + '…' : s; };

/* Busca una regex línea por línea; devuelve hallazgos "archivo:línea  texto" */
function buscar(archivos, re, {normalizar = false, nota} = {}){
  const out = [];
  for (const f of archivos) f.lineas.forEach((l, i) => {
    const src = normalizar ? sinAcentos(l) : l;
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let m;
    while ((m = g.exec(src))) out.push(`${f.r}:${i + 1}  ${nota ? nota(m) : recorta(m[0])}`);
  });
  return out;
}

const resultados = [];
const revisar = (titulo, fn) => {
  let hallazgos;
  try { hallazgos = fn(); } catch (e){ hallazgos = ['Error al revisar: ' + e.message]; }
  resultados.push({titulo, hallazgos});
};

/* 1. Nombres retirados (sin distinguir mayúsculas ni acentos) */
revisar('Nombres retirados', () => {
  const re = new RegExp(RETIRADOS.map(n => sinAcentos(n).replace(/ /g, '\\s+')).join('|'));
  return buscar(ARCHIVOS, re, {normalizar: true, nota: m => `"${m[0]}"`});
});

/* 2. Claves viejas: 'pv' "re" `rp` (incluye data-cat="pv"), pv:{…} / rp: [[…]],
   pv:2 y {pv:0} (quiz), --pv / --pv-soft (CSS) e i.pv{ (clase) */
revisar('Claves viejas (pv / re / rp)', () =>
  buscar(ARCHIVOS, /(['"`])(pv|re|rp)\1|\b(pv|re|rp)\s*:\s*[{[]|\b(pv|re|rp):\d|--(pv|re|rp)(?![a-z0-9_])|\.(pv|re|rp)\s*\{/));

/* 3. Rutas viejas y carpetas incoherentes con la categoría del desarrollo */
revisar('Rutas viejas y carpetas', () => {
  const out = [];
  for (const c of CARPETAS_VIEJAS)
    if (fs.existsSync(path.join(ROOT, c))) out.push(`${c}/  la carpeta vieja todavía existe`);
  out.push(...buscar(ARCHIVOS, new RegExp(`\\b(${CARPETAS_VIEJAS.join('|')})/`)));

  const devs = require('./desarrollos.js');
  const porSlug = new Map(devs.map(d => [d.slug, d]));
  for (const d of devs){
    const clave = d.categoria;
    if (clave === null) continue; // sin categoría confirmada: no tiene carpeta que comparar
    const dir = CARPETAS[clave];
    if (!dir) out.push(`tools/desarrollos.js  ${d.slug}: clave de categoría desconocida "${clave}"`);
    else if (!fs.existsSync(path.join(ROOT, dir, ...(d.plantilla ? [] : [d.slug]), 'index.html')))
      out.push(`${dir}/${d.plantilla ? '' : d.slug + '/'}  falta la página de ${d.name} (categoría ${clave})`);
  }
  for (const r of paginasGeneradas(ROOT)){
    const [dir, slug] = r.split('/'), d = porSlug.get(slug);
    if (!d) out.push(`${r}  no corresponde a ningún desarrollo de tools/desarrollos.js`);
    else {
      const clave = d.categoria, esperado = CARPETAS[clave];
      if (esperado && esperado !== dir) out.push(`${r}  debería estar en ${esperado}/${slug}/ (categoría ${clave})`);
    }
  }
  return out;
});

/* 4. "Vela Sur" separado; "Velasur" es correcto */
revisar('"Vela Sur" (debe ser "Velasur")', () =>
  buscar(ARCHIVOS, /vela[\s-]+sur/i, {nota: m => `"${m[0]}"`}));

/* 5. Imágenes externas en archivos publicados (sin excepciones) */
revisar('Imágenes externas', () => {
  const out = [];
  for (const f of PUBLICADOS) f.lineas.forEach((l, i) => {
    const vistos = new Set();
    for (const m of l.matchAll(/https?:\/\/[^\s"'`)<>,]+/g)){
      const u = m[0], host = u.replace(/^https?:\/\//, '').split(/[/?#]/)[0];
      const ctx = l.slice(Math.max(0, m.index - 30), m.index);
      const esImg = EXT_IMG.test(u) || HOSTS_IMG.includes(host) || /\/uploads\//.test(u) ||
        /(src|srcset|poster)\s*=\s*["']?$|url\(\s*["']?$/i.test(ctx) && !/<iframe[^>]*$/i.test(l.slice(0, m.index)); // un iframe (video) no es imagen
      /* og:image y JSON-LD usan la URL absoluta del propio sitio: vale si el archivo existe en img/ */
      if (u.startsWith(SITE_URL + '/')){
        if (esImg && !fs.existsSync(path.join(ROOT, decodeURIComponent(u.slice(SITE_URL.length + 1))))) out.push(`${f.r}:${i + 1}  ${recorta(u)}  (no existe en el repo)`);
        continue;
      }
      if (esImg && !vistos.has(u)){ vistos.add(u); out.push(`${f.r}:${i + 1}  ${recorta(u)}`); }
    }
    /* "@@/" es un marcador que el home cambia por https://velatowerscancun.com/wp-content/uploads/ */
    for (const m of l.matchAll(/@@\/[^\s"'`)<>,]+/g))
      if (!vistos.has(m[0])){ vistos.add(m[0]); out.push(`${f.r}:${i + 1}  ${recorta(m[0])}`); }
  });
  return out;
});

/* 6. Enlaces locales rotos */
revisar('Enlaces rotos', () => {
  const out = [];
  const existe = (base, ruta) => {
    ruta = decodeURIComponent(ruta.split(/[?#]/)[0]);
    if (!ruta) return true;
    let p = ruta.startsWith('/') ? path.join(ROOT, ruta) : path.join(base, ruta);
    if (ruta.endsWith('/') || (fs.existsSync(p) && fs.statSync(p).isDirectory())) p = path.join(p, 'index.html');
    return fs.existsSync(p);
  };
  const omitir = r => !r || /^(https?:|\/\/|mailto:|tel:|data:|javascript:|#|\[)/i.test(r) || /\$\{|\{\{|\+/.test(r);
  for (const f of ARCHIVOS){
    if (f.r.endsWith('.md')) continue;
    const dir = path.dirname(f.p), esHtml = f.r.endsWith('.html'), esJs = f.r.endsWith('.js');
    f.lineas.forEach((l, i) => {
      const refs = [];
      if (esHtml) for (const m of l.matchAll(/\b(href|src|poster|action|data-full)\s*=\s*"([^"]*)"/gi)) refs.push([dir, m[2]]);
      /* Plantillas con const S = '<carpeta local>': sus listas imgs:[…] y S + '…' son relativas a S (y usan miniatura -800) */
      const S = esHtml && (f.lineas.join('\n').match(/const S = '(\.\.\/img\/[^']+)'/) || [])[1];
      if (S) for (const m of l.matchAll(/(?:imgs:\[[^\]]*|S ?\+ ?)'([\w.-]+\.webp)'/g)) refs.push([dir, S + m[1]]);
      if (S) for (const m of l.matchAll(/imgs:\[([^\]]*)\]/g)) for (const x of m[1].matchAll(/'([\w.-]+)\.webp'/g)) refs.push([dir, `${S}${x[1]}.webp`], [dir, `${S}${x[1]}-800.webp`]);
      if (esHtml) for (const m of l.matchAll(/\bsrcset\s*=\s*"([^"]*)"/gi))
        m[1].split(',').forEach(s => refs.push([dir, s.trim().split(/\s+/)[0]]));
      if (!esJs) for (const m of l.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) refs.push([dir, m[1]]);
      /* Rutas en cadenas de JS (navbar, home, generador): las que empiezan con ../ son relativas
         al archivo; las de img/, assets/ o que terminan en .html, relativas a la raíz (el código
         les antepone la base). Se omiten las que se concatenan a otra base (S + '2021/…'). */
      for (const m of l.matchAll(/(['"`])((?:\.\.\/)*[\w-]+(?:\/[\w.-]+)*\.(?:html|css|js|webp|jpe?g|png|svg|avif|mp4))\1/g)){
        const r = m[2];
        if (/\+\s*$/.test(l.slice(0, m.index)) || !(/^(\.\.\/|img\/|assets\/)/.test(r) || r.endsWith('.html'))) continue;
        refs.push([r.startsWith('../') ? dir : ROOT, r]);
      }
      for (const [base, r] of refs)
        if (!omitir(r) && !existe(base, r)) out.push(`${f.r}:${i + 1}  ${recorta(r)}`);
    });
  }
  return [...new Set(out)];
});

/* 7. Páginas generadas al día */
function paginasGeneradas(raiz){
  const out = [];
  for (const a of fs.readdirSync(raiz, {withFileTypes: true})){
    if (!a.isDirectory() || /^(\.|node_modules$|tools$|assets$|img$)/.test(a.name)) continue;
    for (const b of fs.readdirSync(path.join(raiz, a.name), {withFileTypes: true}))
      if (b.isDirectory() && fs.existsSync(path.join(raiz, a.name, b.name, 'index.html')))
        out.push(`${a.name}/${b.name}/index.html`);
  }
  return out;
}
revisar('Páginas generadas al día', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gv-verificar-'));
  try {
    fs.cpSync(ROOT, tmp, {recursive: true, filter: s => !/[\\/](\.git|node_modules)$/.test(s) && !/[\\/]img[\\/].+\.(webp|svg)$/.test(s)});
    for (const r of paginasGeneradas(tmp)) fs.rmSync(path.join(tmp, r));
    try {
      execFileSync(process.execPath, [path.join(tmp, 'tools/generar-desarrollos.js')], {cwd: tmp, stdio: 'pipe'});
    } catch (e){
      return ['El generador falló: ' + String(e.stderr || e.message).trim().split('\n').find(l => /Error/.test(l))];
    }
    const nuevas = paginasGeneradas(tmp).filter(r => fs.existsSync(path.join(tmp, r)));
    const actuales = paginasGeneradas(ROOT);
    const out = [];
    for (const r of nuevas){
      const a = path.join(ROOT, r);
      if (!fs.existsSync(a)) out.push(`${r}  falta (el generador la crea)`);
      else if (!fs.readFileSync(a).equals(fs.readFileSync(path.join(tmp, r)))) out.push(`${r}  desactualizada`);
    }
    for (const r of actuales) if (!nuevas.includes(r)) out.push(`${r}  sobra (el generador ya no la crea)`);
    /* También genera assets/gv-desarrollos.js y la meta del home entre <!-- gv:meta --> */
    const datos = 'assets/gv-desarrollos.js';
    if (!fs.existsSync(path.join(ROOT, datos))) out.push(`${datos}  falta (el generador lo crea)`);
    else if (!fs.readFileSync(path.join(ROOT, datos)).equals(fs.readFileSync(path.join(tmp, datos)))) out.push(`${datos}  desactualizado`);
    const meta = f => (fs.readFileSync(f, 'utf8').match(/<!-- gv:meta -->[\s\S]*?<!-- \/gv:meta -->/) || [''])[0];
    if (!meta(path.join(ROOT, 'index.html'))) out.push('index.html  sin marcadores <!-- gv:meta --> … <!-- /gv:meta -->');
    else if (meta(path.join(ROOT, 'index.html')) !== meta(path.join(tmp, 'index.html'))) out.push('index.html  meta description (gv:meta) desactualizada');
    const md = 'img/MANIFEST.md';
    if (!fs.existsSync(path.join(ROOT, md))) out.push(`${md}  falta (el generador lo crea de img/manifest.json)`);
    else if (!fs.readFileSync(path.join(ROOT, md)).equals(fs.readFileSync(path.join(tmp, md)))) out.push(`${md}  desactualizado respecto a img/manifest.json`);
    return out;
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});

/* 8. Nombres de categoría según la configuración */
revisar('Nombres de categoría según la configuración', () => {
  const out = [];
  const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  /* Cualquier nombre de categoría, vigente o retirado; los largos primero ("Residencial Plus" antes que "Residencial") */
  const CAND = [...new Set([...Object.values(NOMBRES), ...RETIRADOS])].sort((a, b) => b.length - a.length);
  const ALT = CAND.map(reEsc).join('|');
  const linea = (src, i) => src.slice(0, i).split('\n').length;
  for (const f of PUBLICADOS.filter(f => f.r.endsWith('.html'))){
    const src = f.lineas.join('\n');
    /* a. Elementos con data-cat cuyo texto es un nombre de categoría */
    for (const m of src.matchAll(/<[^>]*\bdata-cat="([a-z]+)"[^>]*>(?:<i><\/i>)?([^<]*)</g)){
      const t = m[2].trim();
      if (CAND.includes(t) && t !== NOMBRES[m[1]]) out.push(`${f.r}:${linea(src, m.index)}  data-cat="${m[1]}" dice "${t}"; debe ser "${NOMBRES[m[1]]}"`);
    }
    /* Páginas con categoría: la toma del data-cat de la etiqueta de gv-nav.js */
    const pc = src.match(/gv-nav\.js"[^>]*\bdata-cat="([a-z]+)"/), k = pc && pc[1];
    if (k){
      const nombre = NOMBRES[k], carpeta = CARPETAS[k];
      if (!nombre){ out.push(`${f.r}  data-cat="${k}" no existe en la configuración`); continue; }
      if (!/gv-categorias\.js"><\/script>\s*<script src="[^"]*gv-nav\.js"/.test(src)) out.push(`${f.r}  falta cargar assets/gv-categorias.js antes de gv-nav.js`);
      /* b. Campo oculto "categoria" */
      const ocultos = [...src.matchAll(/<input type="hidden" name="categoria" value="([^"]*)"/g)];
      if (!ocultos.length) out.push(`${f.r}  sin campo oculto "categoria"`);
      for (const m of ocultos) if (m[1] !== nombre) out.push(`${f.r}:${linea(src, m.index)}  campo categoria="${m[1]}"; debe ser "${nombre}"`);
      /* c. BreadcrumbList: Inicio → categoría → proyecto */
      const bcs = [...src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map(m => { try { return JSON.parse(m[1]); } catch { return null; } }).filter(j => j && j['@type'] === 'BreadcrumbList');
      if (bcs.length !== 1) out.push(`${f.r}  ${bcs.length} BreadcrumbList (debe haber 1)`);
      else {
        const it = bcs[0].itemListElement || [], [dir, slug] = f.r.split('/');
        const esperado = [['Inicio', `${SITE_URL}/`], [nombre, `${SITE_URL}/${carpeta}/`]];
        if (it.length !== 3) out.push(`${f.r}  BreadcrumbList con ${it.length} elementos (deben ser 3)`);
        esperado.forEach(([n, u], i) => { if (!it[i] || it[i].position !== i + 1 || it[i].name !== n || it[i].item !== u)
          out.push(`${f.r}  BreadcrumbList ${i + 1}: debe ser "${n}" → ${u}`); });
        const ultimo = it[2], esGenerada = slug !== 'index.html';
        if (!ultimo || ultimo.position !== 3 || !ultimo.name) out.push(`${f.r}  BreadcrumbList 3: falta el proyecto`);
        else if (esGenerada && ultimo.item !== `${SITE_URL}/${dir}/${slug}/`) out.push(`${f.r}  BreadcrumbList 3: debe apuntar a ${SITE_URL}/${dir}/${slug}/`);
        else if (!esGenerada && 'item' in ultimo) out.push(`${f.r}  BreadcrumbList 3: en la plantilla va sin item (misma URL que la categoría)`);
      }
      /* d. "Nombre · …", "… · Nombre" y "Categoría Nombre" en el texto */
      for (const m of src.matchAll(new RegExp(`>(${ALT}) · |· (${ALT})<|Categoría (${ALT})<`, 'g'))){
        const t = m[1] || m[2] || m[3];
        if (t !== nombre) out.push(`${f.r}:${linea(src, m.index)}  "${t}" en una página ${nombre}`);
      }
    }
  }
  /* e. Home: la lista de las tres categorías sigue la configuración (meta description y JSON-LD) */
  const home = ARCHIVOS.find(f => f.r === 'index.html'), hs = home.lineas.join('\n');
  const lista = `${NOMBRES.entrada}, ${NOMBRES.media} y ${NOMBRES.alta}`;
  for (const m of hs.matchAll(new RegExp(`(${ALT}), (${ALT}) y (${ALT})`, 'g')))
    if (m[0] !== lista) out.push(`index.html:${linea(hs, m.index)}  "${m[0]}"; debe ser "${lista}"`);
  const desc = (hs.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (!desc.includes(lista)) out.push(`index.html  la meta description no lista "${lista}"`);
  if (!/"@type":"Organization"[\s\S]*?"description":"[^"]*/.test(hs) || !hs.match(/"@type":"Organization"[\s\S]*?"description":"([^"]*)"/)[1].includes(lista))
    out.push(`index.html  el JSON-LD Organization no lista "${lista}"`);
  return out;
});

/* 9. Lista única de desarrollos */
revisar('Lista única de desarrollos', () => {
  const out = [];
  const devs = require('./desarrollos.js');
  const FUENTES = new Set(['tools/desarrollos.js', 'assets/gv-desarrollos.js']);
  /* a. Nombres de las listas copiadas que se eliminaron */
  for (const f of ARCHIVOS) if (!FUENTES.has(f.r) && !f.r.endsWith('.md'))
    f.lineas.forEach((l, i) => { const m = l.match(/\b(DEVS|PROYECTOS)\s*=\s*\[|\bIMG_LOCAL\b/); if (m) out.push(`${f.r}:${i + 1}  "${m[0]}": la lista vive en tools/desarrollos.js`); });
  /* b. Scripts con 4 o más nombres de desarrollos entre comillas (posible copia de la lista) */
  const nombres = [...new Set(devs.flatMap(d => [d.name, d.nombreCorto]).filter(Boolean))];
  const scripts = f => f.r.endsWith('.js') ? [f.lineas.join('\n')]
    : [...f.lineas.join('\n').matchAll(/<script(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  for (const f of ARCHIVOS) if (!FUENTES.has(f.r) && /\.(js|html)$/.test(f.r) && f.r !== 'tools/generar-desarrollos.js')
    for (const js of scripts(f)){
      const vistos = nombres.filter(n => ['\'', '"', '`'].some(q => js.includes(q + n + q)));
      if (vistos.length >= 4) out.push(`${f.r}  ${vistos.length} nombres de desarrollos en un script (${vistos.slice(0, 4).join(', ')}…): ¿copia de la lista?`);
    }
  /* c. gv-desarrollos.js se carga antes de gv-nav.js */
  for (const f of PUBLICADOS.filter(f => f.r.endsWith('.html'))){
    const src = f.lineas.join('\n'), nav = src.search(/<script src="[^"]*gv-nav\.js"/), dat = src.search(/<script src="[^"]*gv-desarrollos\.js"/);
    if (nav >= 0 && (dat < 0 || dat > nav)) out.push(`${f.r}  falta cargar assets/gv-desarrollos.js antes de gv-nav.js`);
  }
  /* d. Cifras fijas del home = datos (total y plazas de tools/desarrollos.js; estados de GV_RESUMEN) */
  const conCat = devs.filter(d => d.categoria !== null);
  const total = conCat.length, plazas = new Set(conCat.map(d => d.plaza)).size, ncat = Object.keys(CATEGORIAS).length;
  const gvd = (ARCHIVOS.find(f => f.r === 'assets/gv-desarrollos.js') || {lineas: []}).lineas.join('\n');
  const estados = +((gvd.match(/"estados":(\d+)/) || [])[1]);
  const hs = ARCHIVOS.find(f => f.r === 'index.html').lineas.join('\n');
  const fijas = [
    ['meta description: desarrollos', /<meta name="description" content="[^"]*?(\d+) desarrollos/, total],
    ['meta description: plazas', /<meta name="description" content="[^"]*?(\d+) plazas/, plazas],
    ['hero: desarrollos (data-count)', /data-count="(\d+)" id="devCount"/, total],
    ['hero: plazas (data-count)', /data-count="(\d+)" id="plazaCount"/, plazas],
    ['hero: estados', /id="estadoCount">(\d+)</, estados],
    ['hero: categorías (data-count)', /data-count="(\d+)">0<\/b><span>categorías/, ncat],
    ['título de plazas', /id="plazasTitle">(\d+) plazas/, plazas]
  ];
  for (const [que, re, esperado] of fijas){
    const m = hs.match(re);
    if (!m) out.push(`index.html  no se encontró la cifra fija "${que}"`);
    else if (+m[1] !== esperado) out.push(`index.html  ${que}: dice ${m[1]}, los datos dan ${esperado}`);
  }
  return out;
});

/* 10. Imágenes locales y manifiesto */
revisar('Imágenes locales y manifiesto', () => {
  const out = [], KB400 = 400 * 1024;
  const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'img/manifest.json'), 'utf8'));
  const enManifiesto = new Set();
  for (const e of man){
    if (e.estado !== 'ok'){ out.push(`img/manifest.json  pendiente de descarga: ${e.ruta} ← ${e.origen}`); continue; }
    for (const [r, peso] of [[e.ruta, e.despues], ...(e.mini ? [[e.mini.ruta, e.mini.peso]] : [])]){
      enManifiesto.add(r);
      const p = path.join(ROOT, r);
      if (!fs.existsSync(p)){ out.push(`${r}  está en el manifiesto pero no existe`); continue; }
      const t = fs.statSync(p).size;
      if (t !== peso) out.push(`${r}  pesa ${t} B; el manifiesto dice ${peso} B`);
      if (!/\.(webp|svg)$/.test(r)) out.push(`${r}  no es WebP ni SVG`);
      if (t > KB400) out.push(`${r}  pesa ${Math.round(t / 1024)} KB (máx. 400 KB)`);
    }
  }
  (function recorre(d){ for (const e of fs.readdirSync(path.join(ROOT, d), {withFileTypes: true})){
    const r = `${d}/${e.name}`;
    if (e.isDirectory()) recorre(r);
    else if (!['img/manifest.json', 'img/MANIFEST.md'].includes(r) && !enManifiesto.has(r)) out.push(`${r}  no está en img/manifest.json`);
  } })('img');
  return out;
});

/* ---------- reporte ---------- */
let total = 0;
for (const {titulo, hallazgos} of resultados){
  total += hallazgos.length;
  console.log(`\n${hallazgos.length ? '✗' : '✓'} ${titulo}${hallazgos.length ? ` — ${hallazgos.length}` : ''}`);
  const ver = TODO ? hallazgos : hallazgos.slice(0, LIMITE);
  ver.forEach(h => console.log('   ' + h));
  if (ver.length < hallazgos.length) console.log(`   … y ${hallazgos.length - ver.length} más (usa --todo)`);
}
console.log(`\n${total ? `${total} hallazgos.` : 'Todo en orden.'}`);
process.exitCode = total ? 1 : 0;
