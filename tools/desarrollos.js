/* =====================================================================
   Grupo Velas · Lista única de desarrollos (fuente de verdad)
   El home, el navbar y las páginas de desarrollo leen de aquí. El orden es el
   de las tarjetas del home; el menú los ordena alfabéticamente por plaza.

   Después de editar:  node tools/generar-desarrollos.js
   Genera <carpeta>/<slug>/index.html, assets/gv-desarrollos.js (lo que leen
   el home y el navbar) y la meta description del home (entre <!-- gv:meta -->).

   Campos (todos opcionales salvo slug, name, categoria, plaza):
     categoria   entrada | media | alta (claves de assets/gv-categorias.js), o null
                 si no está confirmada: no tiene página, tarjeta ni conteo; solo
                 aparece en el navbar, con enlace a su ficha en grupovelas.com.mx
     plantilla   true en los tres que ya son plantilla (<carpeta>/index.html):
                 no se generan; sus datos solo alimentan tarjeta, menú y conteos
     nombreCorto nombre en tarjetas y menú (solo si no se presta a confusión)
     img, feat   foto y texto de la tarjeta del home (sin img se usa images[0])
     gv          slug de su ficha en grupovelas.com.mx; si existe en
                 tools/data/grupovelas.json aporta texto de bienvenida, fotos,
                 amenidades, video y catálogo
     zona        localidad si difiere de la plaza (p. ej. Altamira en Tampico)
     status      Preventa | En construcción | Entrega inmediata | Vendido
     from/price  precio "desde" (texto) y el mismo en número (activa el simulador)
     type, rec, m2, units   datos de inventario (se muestran como ficha)
     h1          [línea 1, línea 2] del título; admite <em>
     sub         párrafo del hero (si falta, se toma de grupovelas.com.mx)
     stats       hasta 4 cifras del hero: {n, l} o {t, l}
     perks       4 ventajas: {ic, t, s}; ic = shield|pin|home|leaf|star|chart|waves|building|people|key
     protos      prototipos: {name, type, m2, rec, ban, park, lot, feats[], plan, img, photos[]}
     amenities   sustituye las de grupovelas.com.mx: ['Alberca', {t, s, img}]
     places      cercanías: {n, m (minutos), d, short}; con 3 o más minutos se dibuja el radar
     nearby      cercanías sin minutos (texto)
     images      fotos propias (van antes que las de grupovelas.com.mx): 'url' o {src, cat, cap}
     youtube | video | tour   video de YouTube (ID), video de Drive (URL) o tour 360°
     address, lat, lon, mapsQuery, tel, mail, whatsapp, credits, faq[[p, r]]
   Datos sin confirmar se dejan vacíos: la sección correspondiente se omite.
   ===================================================================== */

module.exports = [
  /* =========================== PREMIUM =========================== */
  {
    slug: 'vela-towers-cancun', name: 'Vela Towers Cancún', nombreCorto: 'Vela Towers', categoria: 'alta', plaza: 'Cancún', plantilla: true,
    status: 'Entrega inmediata', type: 'Departamentos', rec: '3 rec.', m2: '207 – 264 m²', from: '$9 MDP', price: 9000000,
    img: 'img/premium/vela-towers-cancun/sin-titulo-1-09-scaled-1-1.webp', feat: 'Amenidades de resort, Sky Bar y cancha de pádel en una de las zonas con mayor plusvalía de Cancún.'
  },
  {
    slug: 'vistavela-iii', name: 'Vistavela III', categoria: 'alta', plaza: 'Los Cabos', zona: 'Cabo San Lucas', gv: 'vistavela-iii',
    img: 'img/premium/vistavela-iii/review-d57c2aceb2.webp', feat: '274 departamentos con estilo de vida de resort en el corazón de Cabo San Lucas.',
    status: 'Vendido', type: 'Departamentos', units: '274 departamentos',
    h1: ['Vistavela III', 'en <em>Cabo San Lucas</em>'],
    sub: 'Un estilo de vida de resort en el corazón de Cabo San Lucas: 274 departamentos con amenidades de primer nivel, rodeados de la belleza natural de Los Cabos.',
    stats: [{n: 274, l: 'departamentos'}, {n: 8, l: 'edificios'}, {n: 5, l: 'albercas'}, {n: 7, l: 'amenidades'}],
    perks: [
      {ic: 'shield', t: 'Respaldo Grupo Velas', s: 'Más de 40 años construyendo patrimonio en México.'},
      {ic: 'waves', t: 'Estilo de vida de resort', s: '5 albercas, casa club, gimnasio y cancha de pádel.'},
      {ic: 'building', t: '274 departamentos', s: 'Distribuidos en 8 edificios.'},
      {ic: 'pin', t: 'Cabo San Lucas', s: 'Cerca de Puerto Paraíso Mall, Plaza San Lucas y Playa El Médano.'}
    ],
    /* Prototipos: sitio de Grupo Velas Los Cabos (pruebas.velasresorts.com, sección Modelos) */
    protos: [
      {name: 'Condo 1', type: 'Departamento', cap: 'm² por residencia', m2: 140.66, rec: 2, ban: 3, img: 'img/premium/vistavela-iii/condo-1.webp',
        feats: ['2 recámaras', '3 baños', 'Sala de estar', 'Cocina', 'Terraza', '1 estacionamiento', 'Centro de lavado']},
      {name: 'Condo 2', type: 'Departamento', tag: 'Departamento · 1 recámara', cap: 'm² por residencia', m2: 63, rec: 1, ban: 1, img: 'img/premium/vistavela-iii/condo-2.webp',
        feats: ['1 recámara', '1 baño', 'Sala de estar', 'Cocineta', 'Terraza', '1 estacionamiento', 'Cuarto de lavado']},
      {name: 'Condo 3', type: 'Departamento', cap: 'm² por residencia', m2: 139, rec: 2, ban: 3, img: 'img/premium/vistavela-iii/condo-3.webp',
        feats: ['2 recámaras', '3 baños', 'Sala de estar', 'Cocina', 'Terraza', '1 estacionamiento', 'Cuarto de lavado']}
    ],
    protoLead: 'Tres distribuciones de 63 a 140.66 m², pensadas para distintos estilos de vida, todas con terraza, estacionamiento y área de lavado.',
    nearby: ['Centros comerciales: Puerto Paraíso Mall y Plaza San Lucas', 'Supermercados: Fresko, Costco y Walmart', 'Hospitales: H+ Hospital Los Cabos y BlueNet Hospitals', 'Playa El Médano, a 15–20 minutos en coche']
  },
  {
    slug: 'vistavela-sunset', name: 'Vistavela Sunset', categoria: 'alta', plaza: 'Los Cabos', zona: 'Cabo San Lucas', gv: 'vistavela-sunset',
    img: 'img/premium/vistavela-sunset/review-74f3e83745.webp', feat: 'Elegancia, confort y exclusividad en un entorno privilegiado de Los Cabos.',
    status: 'Preventa', type: 'Departamentos y casas', units: '120 departamentos y 31 casas',
    h1: ['Donde el desierto', 'se une con el <em>mar</em>'],
    eyebrow: 'Vistavela Sunset · Cabo San Lucas',
    sub: 'Elegancia, confort y exclusividad en un desarrollo residencial de Grupo Velas en Los Cabos, con opciones de departamentos que se adaptan a diversos estilos de vida.',
    stats: [{n: 120, l: 'departamentos'}, {n: 31, l: 'casas'}, {n: 6, l: 'edificios'}, {n: 9, l: 'amenidades'}],
    perks: [
      {ic: 'shield', t: 'Respaldo Grupo Velas', s: 'Más de 40 años construyendo patrimonio en México.'},
      {ic: 'waves', t: '6 albercas', s: 'Además de casa club, gimnasio y jardines.'},
      {ic: 'star', t: 'Canchas deportivas', s: 'Pádel, pickleball, fútbol y básquetbol.'},
      {ic: 'pin', t: 'A 7 minutos de la playa', s: 'Playa El Médano y acceso fácil a la Transpeninsular.'}
    ],
    /* Prototipos y plantas: brochure de julio 2026 (grupovelasloscabos.com/wp-content/uploads/2026/07/Brochure-VistaVela-Sunset_Julio-26.pdf).
       Casa 1 no viene en el brochure. Penthouse Torre 1: su roof garden (229.95 m²) coincide con el total de End Units; por confirmar. */
    protos: [
      {name: 'Condo 3', type: 'Departamento', m2: 166.20, rec: 3, plan: 'img/premium/vistavela-sunset/planta-condo-3.webp',
        feats: ['3 recámaras', '3½ baños', '2 estacionamientos', 'Cocina', 'Terraza de 60.51 m²', 'Total: 226.71 m²']},
      {name: 'Penthouse', type: 'Departamento', m2: 162.35, rec: 3, plan: 'img/premium/vistavela-sunset/planta-penthouse.webp',
        feats: ['3 recámaras', '3½ baños', '2 estacionamientos', 'Cocina', 'Terraza de 30.93 m²', 'Rooftop privado de 192.34 m²*', 'Total: 385.62 m²']},
      {name: 'End Units', type: 'Departamento', m2: 194.15, rec: 4, plan: 'img/premium/vistavela-sunset/planta-end-units.webp',
        feats: ['4 recámaras', '4½ baños', '2 estacionamientos', 'Cocina', 'Terraza de 35.80 m²', 'Total: 229.95 m²']},
      {name: 'Penthouse Torre 1', type: 'Departamento', m2: 194.15, rec: 4, plan: 'img/premium/vistavela-sunset/planta-penthouse-torre-1.webp',
        feats: ['4 recámaras', '4½ baños', '2 estacionamientos', 'Cocina', 'Terraza de 35.80 m²', 'Roof garden privado de 229.95 m²*', 'Total: 459.90 m²']},
      {name: 'Casa 2', type: 'Casa', unit: 'Casa 2', m2: 245.14, rec: 4, plan: 'img/premium/vistavela-sunset/planta-casa-2.webp',
        feats: ['4 recámaras', '4½ baños', 'Estacionamiento cubierto', 'Cocina', 'Jardín', 'Terraza de 104.73 m²', 'Rooftop privado*', 'Total: 349.87 m²']},
      {name: 'Casa 3', type: 'Casa', unit: 'Casa 3', m2: 249.29, rec: 4, plan: 'img/premium/vistavela-sunset/planta-casa-3.webp',
        feats: ['4 recámaras', '4½ baños', 'Estacionamiento cubierto', 'Cocina', 'Jardín', 'Terraza de 91.85 m²', 'Rooftop privado*', 'Total: 341.14 m²']}
    ],
    protoLead: 'Cuatro modelos de departamento y dos de casa, de 162.35 a 249.29 m² de construcción. Toca la planta para ampliarla.',
    protoNote: 'Plantas del brochure de Vistavela Sunset (julio 2026). Medidas aproximadas; precios y disponibilidad sujetos a cambio.',
    nearby: ['Playa El Médano, a 7 minutos en coche', 'Centros comerciales: Puerto Paraíso Mall y Plaza San Lucas', 'Supermercados: Fresko, Costco y Walmart', 'Hospitales: H+ Hospital Los Cabos y BlueNet Hospitals', 'Acceso fácil a la carretera Transpeninsular']
  },
  {
    slug: 'manila', name: 'Manila', categoria: 'alta', plaza: 'Tampico',
    images: ['img/premium/manila/manila.webp']
  },
  {
    /* Fuentes: laescondida.grupovelas.com/milos y grupovelas.com.mx/desarrollo/torre-milos */
    slug: 'torre-milos', name: 'Torre Milos', categoria: 'alta', plaza: 'Tampico', zona: 'Altamira', gv: 'torre-milos',
    img: 'img/premium/torre-milos/guest-reviews-54544c819e.webp', feat: 'Departamentos con vista al Golfo de México y acceso directo a la playa.',
    status: 'Preventa', type: 'Departamentos', rec: '2 – 3 rec.', m2: 'hasta 231 m²', units: '71 departamentos',
    from: '$7.2 MDP', price: 7200000,
    h1: ['Torre Milos,', 'frente al <em>Golfo</em>'],
    eyebrow: 'Departamentos frente al mar · Altamira',
    sub: '16 niveles y un rooftop en La Escondida Velamar, el nuevo complejo exclusivo y de lujo con increíbles vistas al Golfo de México y acceso directo a la playa.',
    stats: [{n: 71, l: 'departamentos'}, {n: 16, l: 'niveles + rooftop'}, {t: '2 y 3', l: 'recámaras'}, {pre: 'hasta', n: 231, l: 'm² de construcción'}],
    perks: [
      {ic: 'waves', t: 'Acceso directo a la playa', s: 'Traslado en carrito de golf para hasta 10 pasajeros.'},
      {ic: 'building', t: 'Vista al Golfo de México', s: '71 departamentos en 16 niveles y un rooftop.'},
      {ic: 'star', t: 'Amenidades de resort', s: 'Alberca infinita, cancha de pádel, gimnasio y fire pits.'},
      {ic: 'pin', t: 'La Escondida Velamar', s: 'A 5 minutos de Residencial Velamar y 10 del Malecón Miramar.'}
    ],
    protos: [{name: 'Departamento Milos', type: 'Departamento', m2: 231, cap: 'm² de construcción, como máximo', rec: '2 o 3',
      feats: ['2 o 3 recámaras', 'Hasta 3½ baños', 'Cocina integral', 'Sala-comedor', 'Cuarto de lavado', 'Bodega', 'Terraza', 'Vista al mar*']}],
    protoLead: 'Departamentos de 2 y 3 recámaras con terraza y vista al mar. Pide a un asesor la disponibilidad por nivel y vista.',
    protoNote: 'Superficie máxima publicada por el desarrollo. Imágenes ilustrativas; precios y disponibilidad sujetos a cambio.',
    amenities: [
      {t: 'Traslado directo a la playa', s: 'Carrito de golf exclusivo con capacidad para hasta 10 pasajeros.'},
      {t: 'Alberca infinita'}, {t: 'Rooftop'}, {t: 'Gimnasio', s: 'Mantente activo sin salir de casa.'}, {t: 'Cancha de pádel'},
      {t: 'Área de asadores', s: 'Para parrilladas y eventos sociales al aire libre.'}, {t: 'Área de fire pits', s: 'Para noches acogedoras.'},
      {t: 'Salón de eventos', s: 'Un espacio para tus celebraciones y reuniones.'}, {t: 'Salón multiusos'}, {t: 'Terraza'}, {t: 'Pérgola'},
      {t: 'Área para niños'}, {t: 'Bodega por departamento'}
    ],
    address: 'La Escondida Velamar, Corredor Urbano Luis Donaldo Colosio km 7.5, Residencial Velamar, 89604 Altamira, Tamps.',
    mapsQuery: 'La Escondida Velamar, Corredor Urbano Luis Donaldo Colosio km 7.5, 89604 Altamira, Tamaulipas',
    places: [
      {n: 'Residencial Velamar', m: 5, d: '500 m'}, {n: 'Bancos', m: 7, d: '2.3 km'}, {n: 'Walmart Miramar', m: 7, d: '2.3 km'},
      {n: 'Arteli Miramar', m: 9, d: '2.7 km'}, {n: 'Malecón Miramar', m: 10, d: '3.5 km'}
    ],
    nearby: ['Cafés y restaurantes: Velas 10'],
    whatsapp: '528333430381', tel: '833 343 0381',
    hero: ['img/premium/torre-milos/fachada.webp', 'img/premium/torre-milos/cam-3.webp', 'img/premium/torre-milos/cam-4.webp'],
    images: ['img/premium/torre-milos/fachada.webp', 'img/premium/torre-milos/cam-3.webp', 'img/premium/torre-milos/cam-4.webp', 'img/premium/torre-milos/cam-5.webp', 'img/premium/torre-milos/cam-6.webp', 'img/premium/torre-milos/01-sala-comedor.webp', 'img/premium/torre-milos/02-cocina.webp', 'img/premium/torre-milos/03-rec.webp', 'img/premium/torre-milos/sala-dt1.webp', 'img/premium/torre-milos/cocina-dt1.webp', 'img/premium/torre-milos/recamara-dt1.webp']
  },
  {
    /* Fuentes: laescondida.grupovelas.com/townhouses y grupovelas.com.mx/desarrollo/townhouses-velamar-ii */
    slug: 'townhouses-velamar-ii', logoText: 'Townhouses', name: 'Townhouses Velamar II', categoria: 'alta', plaza: 'Tampico', zona: 'Altamira', gv: 'townhouses-velamar-ii',
    img: 'img/premium/townhouses-velamar-ii/amenidades-5-bca9c12f0c.webp', feat: 'Casas frente al mar en La Escondida Velamar.',
    type: 'Casas', rec: '3 rec.', m2: 'hasta 449.20 m²', units: '20 casas', from: '$18.3 MDP', price: 18300000,
    h1: ['Vive en un', 'eterno <em>verano</em>'],
    eyebrow: 'Townhouses Velamar II · Altamira',
    sub: '20 exclusivos townhouses a orillas del mar en La Escondida Velamar: vistas panorámicas, acabados de lujo y un ambiente privado con acceso directo a la playa.',
    stats: [{n: 20, l: 'townhouses'}, {n: 3, l: 'recámaras'}, {n: 4.5, l: 'baños'}, {pre: 'hasta', n: 449.2, l: 'm² de construcción'}],
    perks: [
      {ic: 'waves', t: 'Acceso directo al mar', s: 'Paddle board, yoga en la orilla y los amaneceres más bellos.'},
      {ic: 'home', t: 'Alberca o jacuzzi privados', s: 'Alberca en jardín frente al mar o terraza con jacuzzi.'},
      {ic: 'star', t: 'Para disfrutar', s: 'Cancha de pádel, pistas para razor o cuatrimoto y tienda de conveniencia.'},
      {ic: 'shield', t: 'Respaldo Grupo Velas', s: 'Más de 40 años construyendo patrimonio en México.'}
    ],
    protos: [
      {name: 'Prototipo A', type: 'Townhouse', rec: 3, feats: ['3 recámaras', '4½ baños', 'Alberca privada en jardín frente al mar*', 'Cocina y sala-comedor', 'Cuarto de lavado', 'Cuarto de servicio con baño', 'Estacionamiento']},
      {name: 'Prototipo B', type: 'Townhouse', rec: 3, feats: ['3 recámaras', '4½ baños', 'Terraza con jacuzzi y vista al mar*', 'Cocina y sala-comedor', 'Cuarto de lavado', 'Cuarto de servicio con baño', 'Estacionamiento']}
    ],
    protoLead: 'Dos prototipos de 3 recámaras y 4½ baños, de hasta 449.20 m² de construcción. Pide a un asesor planos y disponibilidad.',
    amenities: ['Acceso directo a la playa', 'Alberca', 'Cancha de pádel', 'Terrazas con vista al mar', 'Áreas verdes', 'Seguridad', {t: 'Pistas para razor o cuatrimoto'}, {t: 'Paddle board y yoga en la playa'}, 'Tienda de conveniencia'],
    amenLead: 'Vive e invierte en uno de los destinos turísticos más importantes de Tamaulipas.',
    address: 'La Escondida Velamar, Corredor Urbano Luis Donaldo Colosio km 7.5, Residencial Velamar, 89604 Altamira, Tamps.',
    mapsQuery: 'La Escondida Velamar, Corredor Urbano Luis Donaldo Colosio km 7.5, 89604 Altamira, Tamaulipas',
    places: [
      {n: 'Residencial Velamar', m: 5, d: '500 m'}, {n: 'Bancos', m: 7, d: '2.3 km'}, {n: 'Walmart Miramar', m: 7, d: '2.3 km'},
      {n: 'Arteli Miramar', m: 9, d: '2.7 km'}, {n: 'Malecón Miramar', m: 10, d: '3.5 km'}
    ],
    whatsapp: '528333430381', tel: '833 343 0381',
    hero: ['img/premium/townhouses-velamar-ii/slider-04-8-f29f882edf.webp', 'img/premium/townhouses-velamar-ii/slider-03-8-f8f8c909f8.webp', 'img/premium/townhouses-velamar-ii/slider-02-10-2b86ea17c7.webp'],
    images: ['img/premium/townhouses-velamar-ii/townhouses-01-1.webp', 'img/premium/townhouses-velamar-ii/townhouses-02-1.webp', 'img/premium/townhouses-velamar-ii/townhouses-03-1.webp', 'img/premium/townhouses-velamar-ii/townhouses-04-1.webp', 'img/premium/townhouses-velamar-ii/townhouses-05-1.webp', 'img/premium/townhouses-velamar-ii/townhouses-06-1.webp', 'img/premium/townhouses-velamar-ii/townhouses-07-1.webp'].concat('img/premium/townhouses-velamar-ii/image00054.webp')
  },
  {
    /* La página oficial ya no existe; descripción y unidades del texto del desarrollador publicado por un broker (geahomes-bienesraices.com) */
    slug: 'sorrento-velamar', name: 'Sorrento Velamar', categoria: 'alta', plaza: 'Tampico', zona: 'Altamira',
    feat: 'Torre frente al mar en Residencial Velamar.',
    type: 'Departamentos', rec: '3 rec.', m2: '149.37 m²', units: '46 departamentos',
    sub: 'Torre Sorrento en Residencial Velamar: 46 departamentos residenciales con una espectacular vista al mar.',
    address: 'Fraccionamiento Residencial Velamar, Altamira, Tamaulipas',
    images: ['img/premium/sorrento-velamar/sorrento.webp']
  },

  /* ======================= RESIDENCIAL PLUS ======================= */
  {
    /* Fuente: aryve.com.mx/fraccionamientos/detalle/cima-penaflor-departamentos (y sus 3 prototipos) */
    slug: 'cima-penaflor', name: 'Cima Peñaflor', categoria: 'media', plaza: 'Querétaro',
    feat: '15 torres y 280 departamentos en la zona noroeste de Querétaro.',
    type: 'Departamentos', rec: '2 rec.', units: '280 departamentos en 15 torres',
    h1: ['Cima Peñaflor', 'en <em>Querétaro</em>'],
    sub: 'Una comunidad residencial con 15 torres y 280 departamentos, en un entorno privado e inclusivo rodeado de áreas verdes para la recreación, el ejercicio y la convivencia familiar.',
    stats: [{n: 15, l: 'torres'}, {n: 280, l: 'departamentos'}, {n: 308, l: 'cajones de estacionamiento'}, {n: 2, l: 'recámaras'}],
    perks: [
      {ic: 'leaf', t: 'Rodeado de áreas verdes', s: 'Para la recreación, el ejercicio y la convivencia familiar.'},
      {ic: 'star', t: 'Amenidades', s: 'Casa club, alberca, roof top, juegos infantiles y teens club.'},
      {ic: 'building', t: '15 torres de 4 pisos', s: '280 departamentos y 308 cajones de estacionamiento.'},
      {ic: 'key', t: 'Formas de pago', s: 'Infonavit, Fovissste, crédito bancario o contado.'}
    ],
    protos: [1, 2, 3].map(n => ({name: `Prototipo ${n}`, type: 'Departamento', rec: 2, ban: 1, plan: ['img/residencial-plus/cima-penaflor/prototipo1.webp', 'img/residencial-plus/cima-penaflor/prototipo2.webp', 'img/residencial-plus/cima-penaflor/prototipo3.webp'][n - 1],
      feats: ['2 recámaras', '1 baño', 'En un nivel', 'Estacionamiento']})),
    protoLead: 'Tres prototipos de departamento de 2 recámaras en un solo nivel. Toca la planta para ampliarla.',
    protoNote: 'Plantas ilustrativas. Pide a un asesor superficies, precios y disponibilidad por prototipo.',
    amenities: ['Casa club', 'Alberca', 'Roof top', 'Juegos infantiles', 'Teens club', 'Áreas verdes'],
    credits: 'Infonavit, Fovissste, crédito bancario y contado',
    address: 'Blvd. Peñaflor S/N, Col. Ciudad del Sol, 76116 Santiago de Querétaro, Qro.',
    images: ['img/residencial-plus/cima-penaflor/cima-penaflor.webp'].concat(['img/residencial-plus/cima-penaflor/1.webp', 'img/residencial-plus/cima-penaflor/2.webp', 'img/residencial-plus/cima-penaflor/3.webp', 'img/residencial-plus/cima-penaflor/gal1.webp', 'img/residencial-plus/cima-penaflor/gal2.webp', 'img/residencial-plus/cima-penaflor/gal3.webp', 'img/residencial-plus/cima-penaflor/gal4.webp', 'img/residencial-plus/cima-penaflor/gal5.webp'])
  },
  {
    slug: 'ballesta', name: 'Ballesta', categoria: 'media', plaza: 'Querétaro',
    images: ['img/residencial-plus/ballesta/ballesta.webp']
  },
  {
    slug: 'punta-vela', name: 'Punta Vela Residencial', categoria: 'media', plaza: 'Ciudad Juárez', gv: 'punta-vela-residencial',
    nombreCorto: 'Punta Vela', img: 'img/residencial-plus/punta-vela/guest-reviews-045abb6e8a.webp', feat: 'Solo 63 casas en 3 modelos, todas con 3.5 baños y más de 5 amenidades.',
    status: 'Preventa', type: 'Casas', units: '63 casas',
    h1: ['Punta Vela', 'en <em>Ciudad Juárez</em>'],
    sub: 'Solo 63 casas, todas con 3.5 baños y más de 5 amenidades, en una ubicación estratégica cerca de centros comerciales, del Puente Zaragoza y del aeropuerto.',
    stats: [{n: 63, l: 'casas'}, {n: 3.5, l: 'baños por casa'}, {n: 7, l: 'amenidades'}, {n: 14, l: 'min del Puente Zaragoza'}],
    perks: [
      {ic: 'home', t: 'Solo 63 casas', s: 'Todas con 3.5 baños.'},
      {ic: 'star', t: 'Casa club y gimnasio', s: 'Más asadores, salón de eventos y cuarto de juegos.'},
      {ic: 'pin', t: 'Cerca de todo', s: 'A 10 minutos de Plaza Sendero y 25 del aeropuerto.'},
      {ic: 'shield', t: 'Respaldo Grupo Velas', s: 'Más de 40 años construyendo patrimonio en México.'}
    ],
    places: [
      {n: 'Mundo Acuático Anita', m: 1}, {n: 'Plaza Sendero', m: 10}, {n: 'Puente Zaragoza', m: 14},
      {n: 'Walmart', m: 15}, {n: 'Aeropuerto Internacional', m: 25, short: 'Aeropuerto'}
    ]
  },
  {
    slug: 'lavanda-ii', name: 'Lavanda II', categoria: 'media', plaza: 'Matamoros',
    images: ['img/residencial-plus/lavanda-ii/lavanda.webp']
  },
  {
    /* Fuente: aryve.com.mx/fraccionamientos/detalle/paseos-floresta (y prototipos Mallorca y Colibrí).
       Ahí no aparece la cifra de 114.49 m² del inventario del home: se muestran las superficies por prototipo. */
    slug: 'paseos-de-floresta', name: 'Paseos de Floresta', categoria: 'media', plaza: 'Tampico', zona: 'Altamira',
    type: 'Casas', rec: '3 rec.',
    h1: ['Paseos de Floresta', 'en <em>Altamira</em>'],
    sub: 'Fraccionamiento con arco de acceso, alberca, áreas verdes, banquetas en todas las calles y servicios de agua y luz subterráneos, a unas cuadras del IEST.',
    stats: [{n: 2, l: 'prototipos'}, {n: 3, l: 'recámaras'}, {pre: 'hasta', n: 3.5, l: 'baños'}, {pre: 'hasta', n: 156.84, l: 'm² de construcción'}],
    perks: [
      {ic: 'shield', t: 'Acceso controlado', s: 'Arco de acceso y vigilancia.'},
      {ic: 'leaf', t: 'Alberca y áreas verdes', s: 'Con banquetas en todas las calles y vialidades de concreto.'},
      {ic: 'home', t: 'Casas de 3 recámaras', s: 'En dos niveles, con cochera.'},
      {ic: 'pin', t: 'A unas cuadras del IEST', s: 'Entre Tampico y Altamira, a espaldas del Libramiento Poniente.'}
    ],
    protos: [
      {name: 'Mallorca', type: 'Casa', m2: 102.84, rec: 3, ban: '2.5', img: 'img/residencial-plus/paseos-de-floresta/kslpfbm82wzaxmedc1ev.webp',
        feats: ['3 recámaras', '2.5 baños', 'Dos niveles', 'Cochera para 1 vehículo', 'Piso cerámico y pintura']},
      {name: 'Colibrí', type: 'Casa', m2: 156.84, rec: 3, ban: '3.5', img: 'img/residencial-plus/paseos-de-floresta/dbpzop8nj2ee4gyvtthc.webp',
        feats: ['3 recámaras', '3.5 baños', 'Dos niveles', 'Cochera techada para 2 vehículos*', 'Piso cerámico y pintura']}
    ],
    protoNote: 'Fachadas publicadas por el desarrollo. Pide a un asesor planos, precios y disponibilidad.',
    amenities: ['Arco de acceso', 'Alberca', 'Áreas verdes', 'Vigilancia y control de acceso', 'Banquetas en todas las calles', 'Vialidades de concreto', 'Alumbrado público', {t: 'Servicios subterráneos', s: 'Agua y luz subterráneas para comodidad de los residentes.'}],
    credits: 'Infonavit, Fovissste y créditos bancarios',
    tourLink: 'https://www.primeraraiz.com/intro/293',
    address: 'Calle Divisoria Tampico–Altamira, a espaldas del Libramiento Poniente, Altamira, Tamps.',
    lat: 22.323046725826, lon: -97.887652198384,
    nearby: ['IEST, a unas cuadras', 'Libramiento Poniente'],
    images: ['img/residencial-plus/paseos-de-floresta/paseos-de-floresta.webp',
      'img/residencial-plus/paseos-de-floresta/6mfoeulhugyweorr1blz.webp',
      'img/residencial-plus/paseos-de-floresta/vlnkzzff5cfugfrpicyg.webp',
      'img/residencial-plus/paseos-de-floresta/tjtwtjyaudzwrgxrvxcr.webp',
      'img/residencial-plus/paseos-de-floresta/b4vov4njlzikvjd41xy6.webp',
      'img/residencial-plus/paseos-de-floresta/p2s0fepx0qp7xsu3ph3o.webp',
      'img/residencial-plus/paseos-de-floresta/y297kb9tiazpp5ayjggl.webp',
      'img/residencial-plus/paseos-de-floresta/xyzxkoldkefvmltt8up4.webp',
      'img/residencial-plus/paseos-de-floresta/af8dxqtwsantbnujlyfk.webp',
      'img/residencial-plus/paseos-de-floresta/tjvlcwss4zqwk4sfybg0.webp',
      'img/residencial-plus/paseos-de-floresta/ytnfelam8g9xl0xechyp.webp',
      'img/residencial-plus/paseos-de-floresta/nfprre7dw5q3b6sqjhln.webp']
  },
  {
    slug: 'zafiro-residencial', name: 'Zafiro Residencial', categoria: 'media', plaza: 'Tampico',
    images: ['img/residencial-plus/zafiro-residencial/zafiro.webp']
  },
  {
    slug: 'selvanova', name: 'Selvanova Residencial', nombreCorto: 'Selvanova', categoria: 'media', plaza: 'Playa del Carmen', plantilla: true,
    type: 'Casas y departamentos', rec: '3 rec.', m2: '100 – 155 m²', from: '$3.5 MDP', price: 3500000,
    img: 'img/residencial-plus/selvanova/guest-review-46330f56a6.webp', feat: 'Equilibrio entre naturaleza y vida urbana, con extensas áreas verdes, alberca y seguridad.'
  },
  {
    slug: 'velasur', name: 'Velasur', categoria: 'media', plaza: 'Querétaro', gv: 'velasur',
    img: 'img/residencial-plus/velasur/velasur-cfa30aa3c3.webp', feat: 'Comunidad residencial rodeada de áreas naturales para la recreación y la convivencia familiar.',
    status: 'Entrega inmediata', type: 'Casas y terrenos', rec: '3 rec.', m2: '264 m²',
    h1: ['Tu vida en Querétaro', 'comienza en <em>Velasur</em>'],
    sub: 'Comunidad residencial rodeada de áreas naturales, con espacios para la recreación, el acondicionamiento físico y la convivencia familiar en contacto con la naturaleza.',
    stats: [{n: 40, l: 'hectáreas de desarrollo'}, {n: 3, l: 'privadas'}, {n: 9, l: 'amenidades'}, {n: 2, l: 'puntos de acceso'}],
    perks: [
      {ic: 'leaf', t: 'Rodeado de naturaleza', s: 'Más de 1,600 m² de áreas verdes por privada y un parque lineal.'},
      {ic: 'shield', t: 'Doble control de acceso', s: 'Seguridad 24/7 para ti y tu familia.'},
      {ic: 'waves', t: 'Alberca en cada privada', s: 'Además de casa club, cancha de pádel y pet park.'},
      {ic: 'pin', t: 'Conectado', s: 'A 5 minutos del Libramiento Surponiente y 12 del centro histórico.'}
    ],
    protos: [
      {name: 'Casa Magnolia', type: 'Casa', img: 'img/residencial-plus/velasur/velasur-casas-queretaro-magnolia-fachada-3f317b5f8d.webp',
        photos: ['img/residencial-plus/velasur/velasur-casas-queretaro-magnolia-fachada-3f317b5f8d.webp', 'img/residencial-plus/velasur/velasur-casas-queretaro-magnolia-sala-fe1e6498eb.webp', 'img/residencial-plus/velasur/velasur-casas-queretaro-magnolia-comedor-f24ca8cb89.webp', 'img/residencial-plus/velasur/velasur-casas-queretaro-magnolia-living-bf3bab40cf.webp', 'img/residencial-plus/velasur/velasur-casas-queretaro-magnolia-recamara-bc0a0e1dcc.webp', 'img/residencial-plus/velasur/velasur-casas-queretaro-magnolia-vestidor-fb737bccbe.webp', 'img/residencial-plus/velasur/velasur-casas-queretaro-magnolia-bano-d3d1b186eb.webp'],
        feats: ['Sala', 'Comedor', 'Living', 'Recámara con vestidor*', 'Baño']},
      {name: 'Casa Olivo', type: 'Casa', img: 'img/residencial-plus/velasur/velasur-casas-queretaro-olivo-fachada-39c2b27606.webp',
        photos: ['img/residencial-plus/velasur/velasur-casas-queretaro-olivo-fachada-39c2b27606.webp', 'img/residencial-plus/velasur/velasur-casas-queretaro-olivo-comedor-3dcdd2e216.webp', 'img/residencial-plus/velasur/velasur-casas-queretaro-olivo-cocina-a5ff412c56.webp', 'img/residencial-plus/velasur/velasur-casas-queretaro-olivo-estudio-4550d21559.webp', 'img/residencial-plus/velasur/velasur-casas-queretaro-olivo-recamara-6bdc1dd8e4.webp', 'img/residencial-plus/velasur/velasur-casas-queretaro-olivo-vestidor-d1a11369dd.webp', 'img/residencial-plus/velasur/velasur-casas-queretaro-olivo-bano-83e17ac5d3.webp'],
        feats: ['Comedor', 'Cocina', 'Estudio*', 'Recámara con vestidor', 'Baño']}
    ],
    protoLead: 'Dos modelos de casa en privadas con alberca propia; la Casa Begonia llegará próximamente. Toca la foto para ver cada espacio.',
    protoNote: 'Fotografías de casa muestra. Pide a un asesor planos, superficies y precios por modelo.',
    places: [
      {n: 'Centros de estudio', m: 1}, {n: 'Libramiento Surponiente', m: 5, short: 'Libramiento'}, {n: 'Centros comerciales y cines', m: 5, short: 'Comercios y cines'},
      {n: 'Av. Constituyentes', m: 10}, {n: 'Centro histórico', m: 12}
    ]
  },
  {
    slug: 'loma-bonita-reynosa', name: 'Loma Bonita', categoria: 'media', plaza: 'Reynosa', gv: 'loma-bonita-reynosa',
    img: 'img/residencial-plus/loma-bonita-reynosa/20a69446-a4c4-4677-9d20-883b914d6086-8aa9b1c8cf.webp', feat: 'Casas diseñadas a tu gusto en un entorno seguro y completamente bardeado.',
    type: 'Casas', rec: '3 rec.', from: '$2,385,000 MXN', price: 2385000,
    h1: ['Tu hogar a tu manera', 'en <em>Loma Bonita</em>'],
    sub: 'Casas diseñadas a tu gusto en un entorno seguro y completamente bardeado, con estacionamiento, jardín y acabados de calidad en Reynosa.',
    stats: [{n: 2, l: 'modelos de casa'}, {n: 3, l: 'recámaras'}, {n: 2, l: 'estacionamientos'}, {n: 7, l: 'amenidades'}],
    perks: [
      {ic: 'shield', t: 'Doble filtro de seguridad', s: 'Accesos controlados y seguridad 24/7.'},
      {ic: 'star', t: 'Interiores de calidad', s: 'Cubierta de cuarzo, porcelanato de 60×60 y cancelería.'},
      {ic: 'leaf', t: 'Casa club y áreas verdes', s: 'Fitness center y juegos para niños.'},
      {ic: 'pin', t: 'Ubicación privilegiada', s: 'A 2 minutos de hospitales y 5 de Plaza Sendero.'}
    ],
    protos: [
      {name: 'Mallorca', type: 'Casa', m2: 156, rec: 3, ban: 3, price: '$2,385,000',
        feats: ['3 recámaras', '3 baños', 'Cocina con cubierta de cuarzo*', 'Vitropiso de 60×60', 'Cancelería en baños y escaleras', 'Patio y área de lavado', 'Desde $2,385,000 MXN']},
      {name: 'Colibrí', type: 'Casa', m2: 114, rec: 3, ban: '3.5', price: '$2,935,000',
        feats: ['3 recámaras', '3.5 baños', 'Cocina', 'Vitropiso', 'Cancelería en baños y escalera', 'Patio y área de lavado', 'Desde $2,935,000 MXN']}
    ],
    protoNote: 'Precios publicados en grupovelas.com.mx, sujetos a cambio y disponibilidad. Imágenes ilustrativas.',
    credits: 'crédito hipotecario, Infonavit y Fovissste, además de pago de contado (30% y hasta 2 meses para liquidar)',
    places: [
      {n: 'Hospitales Materno-infantil y Christus Muguerza', m: 2, short: 'Hospitales'}, {n: 'Escuela Primaria Nueva Creación', m: 2, short: 'Escuela'},
      {n: 'The Italian Coffee', m: 2}, {n: 'Power Gym', m: 2}, {n: 'Plaza Sendero Periférico', m: 5, short: 'Plaza Sendero'}
    ],
    placeAngles: [-150, -75, 0, 70, 140],
    nearby: ['Supermercados: Smart, Soriana y Mi Tiendita del Ahorro', 'Cerca de los puentes internacionales', 'Carretera Reynosa–Monterrey'],
    /* Coordenadas del enlace de Google Maps publicado en grupovelas.com.mx */
    address: 'Carretera a Monterrey, Reynosa, Tamps.', lat: 26.0477755, lon: -98.3959864
  },
  {
    slug: 'loma-del-jazmin', name: 'Loma del Jazmín', categoria: 'media', plaza: 'Reynosa',
    images: ['img/residencial-plus/loma-del-jazmin/loma-del-jazmin.webp']
  },
  {
    slug: 'fraccionamiento-loma-bonita', name: 'Fraccionamiento Loma Bonita', categoria: 'media', plaza: 'Tampico', gv: 'fraccionamiento-loma-bonita',
    rec: '4 rec.', img: 'img/residencial-plus/fraccionamiento-loma-bonita/guest-reviews-1-38aa114f3e.webp', feat: 'Casas con estacionamiento y jardín en un entorno completamente bardeado.',
    status: 'Vendido', type: 'Casas', m2: '248.89 m²',
    h1: ['Tu hogar a tu manera', 'en <em>Loma Bonita</em>'],
    sub: 'Casas diseñadas a tu gusto en un entorno seguro y completamente bardeado, con estacionamiento, jardín y acabados de calidad en Tampico.',
    stats: [{n: 248.89, l: 'm² de construcción'}, {n: 2, l: 'estacionamientos'}, {t: 'Jardín', l: 'en cada casa'}, {t: 'Bardeado', l: 'entorno seguro'}],
    perks: [
      {ic: 'home', t: 'Diseño a tu medida', s: 'Casas con estacionamiento, jardín y acabados de calidad.'},
      {ic: 'shield', t: 'Entorno seguro', s: 'Fraccionamiento completamente bardeado.'},
      {ic: 'pin', t: 'Tampico', s: 'Ubicación privilegiada con espacios de esparcimiento.'},
      {ic: 'people', t: 'Respaldo Grupo Velas', s: 'Más de 40 años construyendo patrimonio en México.'}
    ]
  },
  {
    /* Fuente: copia archivada (jun. 2025) de grupovelas.com.mx/desarrollo/velamar, titulada "Coto Báltico".
       Ahí el prototipo mide 153.96 – 170.38 m²; el inventario del home dice 178.62 m². */
    slug: 'coto-baltico', name: 'Coto Báltico', categoria: 'media', plaza: 'Tampico', zona: 'Altamira',
    type: 'Casas', rec: '3 rec.',
    h1: ['Vive la playa', 'a tu <em>manera</em>'],
    eyebrow: 'Coto Báltico · Residencial Velamar',
    sub: 'Casas de 3 recámaras en Residencial Velamar, Altamira: el momento de vivir la playa a tu manera.',
    stats: [{n: 3, l: 'recámaras'}, {n: 2.5, l: 'baños'}, {n: 2, l: 'estacionamientos'}, {pre: 'hasta', n: 170.38, l: 'm² de construcción'}],
    protos: [{name: 'Casas Velamar', type: 'Casa', m2: 153.96, cap: 'm² de construcción (hasta 170.38 m²)', rec: 3, ban: '2.5',
      feats: ['3 recámaras', '2.5 baños', '2 estacionamientos', 'De 153.96 a 170.38 m² de construcción']}],
    tourLink: 'https://primeraraiz.com/intro/138',
    address: 'Residencial Velamar, Corredor Urbano Luis Donaldo Colosio, Altamira, Tamps.',
    images: ['img/residencial-plus/coto-baltico/coto-baltico.webp']
  },
  {
    slug: 'los-encinos', name: 'Los Encinos Residencial', categoria: 'media', plaza: 'Tampico', zona: 'Altamira', gv: 'encinos-residencial',
    img: 'img/residencial-plus/los-encinos/guest-reviews-1080aac18c.webp', feat: 'Un hogar seguro y sostenible, con modelos variados y acabados modernos.',
    type: 'Casas', rec: '3 rec.', m2: '163.52 m²',
    h1: ['Tu hogar en armonía', 'con la <em>naturaleza</em>'],
    eyebrow: 'Los Encinos Residencial · Altamira',
    sub: 'Un hogar seguro, sostenible y en conexión con la naturaleza, con modelos variados, acabados modernos y espacios diseñados para tu comodidad.',
    stats: [{n: 3, l: 'recámaras'}, {n: 2, l: 'baños'}, {n: 2500, l: 'litros de cisterna'}, {n: 24, suf: ' h', l: 'caseta de seguridad'}],
    perks: [
      {ic: 'shield', t: 'Seguridad 24 horas', s: 'Caseta de seguridad y acceso controlado.'},
      {ic: 'leaf', t: 'Áreas verdes y senderos', s: 'Además de alberca y club deportivo.'},
      {ic: 'home', t: 'Casas de 3 recámaras', s: '2 baños y cisterna de 2,500 litros.'},
      {ic: 'pin', t: 'Bien conectado', s: 'A minutos de la carretera Tampico–Mante y 8 de Plaza Arenas.'}
    ],
    amenities: [
      {t: 'Áreas verdes', s: 'Jardines y senderos diseñados para relajarte y conectarte con la naturaleza.'},
      {t: 'Club deportivo', s: 'Espacios equipados para entrenamiento y actividades en comunidad.'},
      {t: 'Alberca', s: 'Piscina familiar ideal para el descanso y la diversión al aire libre.'},
      {t: 'Salón de usos múltiples', s: 'Área flexible para eventos, reuniones y celebraciones.'}
    ],
    places: [{n: 'Plaza Arenas', m: 8}, {n: 'HEB', m: 20}, {n: 'Playa Miramar', m: 20}],
    placeAngles: [-120, 20, 140],
    nearby: ['A minutos de la carretera Tampico–Mante']
  },
  {
    slug: 'torre-829', logoText: 'Torre 829', name: 'Torre 829 Faja de Oro', categoria: 'media', plaza: 'Tampico', gv: 'torre-829',
    nombreCorto: 'Torre 829', img: 'img/residencial-plus/torre-829/guest-reviews-86078fd359.webp', feat: 'Departamentos con walk-in closet, cuarto de servicio con baño y amplia terraza.',
    status: 'Preventa', type: 'Departamentos', rec: '3 rec.', m2: '220.86 m²',
    h1: ['Torre 829', 'en <em>Tampico</em>'],
    eyebrow: 'Departamentos en preventa · Tampico',
    sub: 'Tu oportunidad en preventa para vivir en Tampico con estilo y confort: departamentos de 3 recámaras con walk-in closet, cuarto de servicio con baño, amplia terraza y acabados de lujo.',
    stats: [{n: 3, l: 'recámaras'}, {n: 220.86, l: 'm² de construcción'}, {n: 10, l: 'amenidades'}, {n: 2, l: 'elevadores'}],
    perks: [
      {ic: 'building', t: 'Diseño vanguardista', s: 'Departamentos con amplia terraza y acabados de lujo.'},
      {ic: 'star', t: 'Roof garden con alberca', s: 'Además de Sky Bar, gimnasio y simulador de golf.'},
      {ic: 'pin', t: 'Ubicación privilegiada', s: 'En Faja de Oro, Tampico.'},
      {ic: 'shield', t: 'Respaldo de calidad', s: 'Más de 40 años de Grupo Velas construyendo.'}
    ],
    protos: [{name: 'Departamento tipo', type: 'Departamento', m2: 220.86, rec: 3,
      feats: ['3 recámaras', 'Walk-in closet*', 'Cuarto de servicio con baño', 'Amplia terraza', 'Acabados de lujo', '2 elevadores en la torre']}]
  },
  {
    slug: 'conjunto-cardenas-807', logoText: 'Cárdenas 807', name: 'Conjunto Cárdenas 807', categoria: 'media', plaza: 'Tampico',
    feat: 'Conjunto de 12 departamentos.',
    type: 'Departamentos', rec: '3 rec.', m2: '79.68 m²', units: '12 departamentos',
    sub: 'Conjunto de 12 departamentos de 3 recámaras en Tampico.',
    images: ['img/residencial-plus/conjunto-cardenas-807/conjunto-cardenas.webp']
  },

  /* ========================== RESIDENCIAL ========================== */
  {
    slug: 'valencia', name: 'Valencia', categoria: 'entrada', plaza: 'Ciudad Juárez',
    feat: 'Casas de una planta con opciones de 2 y 3 recámaras.',
    type: 'Casas', rec: '2 – 3 rec.',
    sub: 'Casas de una planta con opciones de 2 y 3 recámaras en Ciudad Juárez.',
    images: ['img/residencial/valencia/valencia.webp']
  },
  {
    slug: 'fraccionamiento-arecas', name: 'Fraccionamiento Arecas', categoria: 'entrada', plaza: 'Matamoros', plantilla: true,
    type: 'Casas', rec: '2 rec.', m2: '46.92 m²', from: '$770,000', price: 770000,
    img: 'img/residencial/fraccionamiento-arecas/fraccionamiento-arecas-matamoros-1b434b6261.webp', feat: 'Estrena casa con tu crédito Infonavit, entregada equipada y con escuela dentro del fraccionamiento.'
  },
  {
    slug: 'florencia', name: 'Florencia Residencial', categoria: 'entrada', plaza: 'Reynosa', gv: 'florencia-residencial',
    nombreCorto: 'Florencia', img: 'img/residencial/florencia/guest-views-6eedef2884.webp', feat: '36 departamentos en 8 edificios, con canchas deportivas y áreas verdes.',
    type: 'Departamentos', rec: '2 rec.', m2: '72 m²', units: '36 departamentos',
    h1: ['El lugar que', 'estabas <em>buscando</em>'],
    eyebrow: 'Florencia Residencial · Reynosa',
    sub: '36 departamentos distribuidos en 8 edificios, cada uno con 2 habitaciones y 72 m² de construcción, a minutos de centros comerciales, hospitales y escuelas.',
    stats: [{n: 36, l: 'departamentos'}, {n: 8, l: 'edificios'}, {n: 72, l: 'm² de construcción'}, {n: 2, l: 'habitaciones'}],
    perks: [
      {ic: 'pin', t: 'Ubicación estratégica', s: 'A 2 minutos de hospitales y 5 de Plaza Sendero Periférico.'},
      {ic: 'home', t: 'Departamentos de 72 m²', s: 'Con 2 habitaciones.'},
      {ic: 'leaf', t: 'Ambiente familiar', s: 'Canchas deportivas, áreas verdes y juegos para niños.'},
      {ic: 'shield', t: 'Respaldo Grupo Velas', s: 'Más de 40 años construyendo patrimonio en México.'}
    ],
    protos: [{name: 'Departamento Florencia', type: 'Departamento', m2: 72, rec: 2, feats: ['2 habitaciones', '72 m² de construcción', '36 departamentos en 8 edificios','Canchas deportivas y áreas verdes*']}],
    places: [
      {n: 'Hospitales Materno-infantil y Christus Muguerza', m: 2, short: 'Hospitales'}, {n: 'Escuela Primaria Nueva Creación', m: 2, short: 'Escuela'},
      {n: 'The Italian Coffee', m: 2}, {n: 'Power Gym', m: 2}, {n: 'Plaza Sendero Periférico', m: 5, short: 'Plaza Sendero'}
    ],
    placeAngles: [-150, -75, 0, 70, 140],
    nearby: ['Supermercados: Bodega Aurrera Express, Smart y Soriana', 'Av. Tamaulipas y Viaducto Reynosa']
  },
  {
    slug: 'arecas-altamira', name: 'Arecas', categoria: 'entrada', plaza: 'Tampico', zona: 'Altamira', gv: 'arecas',
    rec: '3 rec.', img: 'img/residencial/arecas-altamira/carrusel-01-5-54fb926eb6.webp', feat: 'Desarrollo de 12 casas en Altamira, con tranquilidad y seguridad.',
    type: 'Casas', m2: '87.20 m²', units: '12 casas',
    h1: ['Tranquilidad', 'en <em>Altamira</em>'],
    sub: 'Un proyecto de 12 casas en perfecta armonía con la tranquilidad y la seguridad, rodeado de amplias áreas verdes y con acceso rápido a todos los servicios.',
    stats: [{n: 12, l: 'casas'}, {n: 87.2, l: 'm² de construcción'}, {n: 2, l: 'estacionamientos'}, {t: 'Áreas verdes', l: 'amplias'}],
    perks: [
      {ic: 'leaf', t: 'Tranquilidad', s: 'Rodeado de amplias áreas verdes.'},
      {ic: 'home', t: 'Solo 12 casas', s: 'Con 2 espacios de estacionamiento.'},
      {ic: 'pin', t: 'Conveniencia', s: 'Cerca del Tec de Monterrey, Soriana, Arteli y HEB.'},
      {ic: 'chart', t: 'Inversión inteligente', s: 'Avalada por Grupo Velas.'}
    ],
    nearby: ['Tecnológico de Monterrey', 'Supermercados: Soriana, Arteli y HEB', 'Hospitales Bene y Ángeles, a minutos', 'Playa Miramar y Plaza Arenas', 'Fácil acceso a la carretera Tampico–Mante'],
    logoText: 'Arecas'
  },
  {
    slug: 'vista-laguna', name: 'Vista Laguna', categoria: 'entrada', plaza: 'Tampico', zona: 'Altamira', gv: 'vista-laguna',
    rec: '3 rec.', img: 'img/residencial/vista-laguna/slider-02-6-b7d8ddcef9.webp', feat: 'Casas y departamentos con vistas a la laguna, áreas verdes y cercanía a servicios.',
    status: 'Vendido', type: 'Casas y departamentos', m2: '80.39 m²', units: '15 casas y 96 departamentos',
    h1: ['Vista Laguna', 'en <em>Altamira</em>'],
    sub: 'Casas y departamentos con vistas a la laguna, privacidad, áreas verdes y cercanía a servicios: un proyecto que combina confort, naturaleza y plusvalía.',
    stats: [{n: 15, l: 'casas'}, {n: 96, l: 'departamentos'}, {n: 80.39, l: 'm² de construcción'}, {t: 'Laguna', l: 'vistas'}],
    perks: [
      {ic: 'waves', t: 'Vista a la laguna', s: 'Confort y naturaleza en Altamira.'},
      {ic: 'leaf', t: 'Áreas verdes', s: 'Amplios espacios de esparcimiento.'},
      {ic: 'pin', t: 'Cerca de servicios', s: 'Soriana, Arteli, IMSS y Plaza Arenas.'},
      {ic: 'shield', t: 'Respaldo Grupo Velas', s: 'Más de 40 años construyendo patrimonio en México.'}
    ],
    amenities: [
      {t: 'Amplios espacios de esparcimiento', s: 'Lugares para relajarte, disfrutar tu tiempo libre o pasarla bien con familia y amigos.'},
      {t: 'Áreas verdes', s: 'Extensas áreas naturales para caminar, hacer ejercicio o disfrutar del aire libre.'}
    ],
    nearby: ['Supermercados: Soriana y Arteli', 'Hospital: IMSS', 'Playa Tesoro', 'Cafés y restaurantes: Degas Café, El Asador y Plaza Arenas', 'Carretera Tampico–Mante']
  },

  /* ============ SIN CATEGORÍA CONFIRMADA (solo navbar; ver PENDIENTES.md) ============ */
  {slug: 'coto-jade', name: 'Coto Jade', categoria: null, plaza: 'Tampico', gv: 'coto-jade'},
  {slug: 'valle-esmeralda', name: 'Valle Esmeralda', categoria: null, plaza: 'Tampico', gv: 'valle-esmeralda'},
  {slug: 'conjunto-roma-401', name: 'Conjunto Roma 401', categoria: null, plaza: 'Tampico', gv: 'conjunto-roma-401'}
];
