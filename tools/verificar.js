#!/usr/bin/env node
/* =====================================================================
   Grupo Velas · Verificación del sitio
   Revisa las reglas del CLAUDE.md sin modificar nada:
     1. Nombres retirados de categorías
     2. Claves viejas de categoría (pv / re / rp)
     3. Rutas viejas (pvivienda/, residencialp/) y carpetas que no
        coinciden con la categoría del desarrollo en tools/desarrollos.js
     4. "Vela Sur" (el nombre correcto es "Velasur")
     5. Imágenes con URL externa en los archivos publicados
     6. Enlaces locales rotos (href/src/url() y rutas en JS)
     7. Páginas generadas al día con tools/generar-desarrollos.js
        (se corre el generador en una copia temporal del sitio)

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

/* Carpeta de cada clave de categoría (ver tabla del CLAUDE.md) */
const CARPETAS = {entrada: 'residencial', media: 'residencial-plus', alta: 'premium'};
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

/* 2. Claves viejas: 'pv' "re" `rp`, pv:{…} y data-cat="pv" */
revisar('Claves viejas (pv / re / rp)', () =>
  buscar(ARCHIVOS, /(['"`])(pv|re|rp)\1|\b(pv|re|rp)\s*:\s*\{/));

/* 3. Rutas viejas y carpetas incoherentes con la categoría del desarrollo */
revisar('Rutas viejas y carpetas', () => {
  const out = [];
  for (const c of CARPETAS_VIEJAS)
    if (fs.existsSync(path.join(ROOT, c))) out.push(`${c}/  la carpeta vieja todavía existe`);
  out.push(...buscar(ARCHIVOS, new RegExp(`\\b(${CARPETAS_VIEJAS.join('|')})/`)));

  const devs = require('./desarrollos.js');
  const porSlug = new Map(devs.map(d => [d.slug, d]));
  for (const d of devs){
    const clave = 'categoria' in d ? d.categoria : d.cat;
    if (clave === null) continue; // sin categoría confirmada: no tiene carpeta que comparar
    const dir = CARPETAS[clave];
    if (!dir) out.push(`tools/desarrollos.js  ${d.slug}: clave de categoría desconocida "${clave}"`);
    else if (!fs.existsSync(path.join(ROOT, dir, d.slug, 'index.html')))
      out.push(`${dir}/${d.slug}/  falta la página de ${d.name} (categoría ${clave})`);
  }
  for (const r of paginasGeneradas(ROOT)){
    const [dir, slug] = r.split('/'), d = porSlug.get(slug);
    if (!d) out.push(`${r}  no corresponde a ningún desarrollo de tools/desarrollos.js`);
    else {
      const clave = 'categoria' in d ? d.categoria : d.cat, esperado = CARPETAS[clave];
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
        /(src|srcset|poster)\s*=\s*["']?$|url\(\s*["']?$/i.test(ctx);
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
      if (esHtml) for (const m of l.matchAll(/\b(href|src|poster|action)\s*=\s*"([^"]*)"/gi)) refs.push([dir, m[2]]);
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
    fs.cpSync(ROOT, tmp, {recursive: true, filter: s => !/[\\/](\.git|node_modules)$/.test(s)});
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
    return out;
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
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
