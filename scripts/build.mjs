// Genera el sitio estático de Marconi Silva Arquitectos en dist/.
// Uso: npm run build   (Railway lo corre solo en cada deploy)
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "dist");
const SITE = "https://www.marconisilva.com";
const NAME = "Marconi Silva Arquitectos";
const IG = "https://www.instagram.com/marconisilvaarquitectos/";
const IG_DM = "https://ig.me/m/marconisilvaarquitectos";
const TODAY = new Date().toISOString().slice(0, 10);
const images = JSON.parse(readFileSync(join(ROOT, "src/images.json"), "utf8"));

// ---------- Contenido ----------
const casas = [
  { slug: "casa-de-campo", n: "Casa de campo", img: "casa-campo", alt: "Casa de campo de una planta con galerías, rodeada de pastos altos" },
  { slug: "casa-entre-pinos", n: "Casa entre pinos", img: "casa-pinos", alt: "Casa blanca de volúmenes simples en un bosque de pinos" },
  { slug: "casa-blanca-con-galeria", n: "Casa blanca con galería", img: "casa-blanca-galeria", alt: "Casa blanca de una planta con galería de acceso y jardín" },
  { slug: "casa-con-piscina-y-piedra", n: "Casa con piscina y piedra", img: "casa-piscina-piedra", alt: "Casa con muros de piedra, techos de tejas y piscina al atardecer" },
  { slug: "casa-entre-cipreses", n: "Casa entre cipreses", img: "casa-cipreses", alt: "Casa de tejas con cipreses y sierras de fondo" },
  { slug: "casa-con-terrazas", n: "Casa con terrazas", img: "casa-terrazas", alt: "Casa de dos plantas con terrazas, galería y piscina" },
  { slug: "casa-en-dos-plantas", n: "Casa en dos plantas", img: "casa-dos-plantas", alt: "Casa simétrica de dos plantas con puerta de madera en arco" },
  { slug: "casa-de-piedra-y-tejas", n: "Casa de piedra y tejas", img: "casa-piedra-tejas", alt: "Casa de piedra y tejas con quincho y jardín de lavandas" },
  { slug: "casa-en-la-sierra", n: "Casa en la sierra", img: "casa-sierra", alt: "Casa de una planta al pie de una sierra arbolada" },
];
const SOBRE = "Somos Juan y Fran. Diseñamos casas a medida para familias en todo el país y en países limítrofes.";
const FAQ = [
  ["¿Hay que tener el terreno comprado?", "No siempre. Muchas veces conviene charlarlo antes. Contanos qué barrios o lotes estás mirando y hacemos una primera lectura de cada opción: pros y contras, reglamentación y orientación."],
  ["¿Cuánto tarda el proyecto?", "Entre dos y tres meses, con reuniones por Zoom cada diez días."],
  ["¿Quién construye la casa?", "Profesionales de tu zona. Nosotros acompañamos la obra de cerca: un video por WhatsApp, una consulta, una respuesta rápida, y la obra sigue."],
  ["¿Y si no puedo hacer toda la casa ahora?", "Es preferible soñarla en grande y hacerla por etapas. Un living no se agranda un metro después, pero una suite o un escritorio se pueden sumar más adelante."],
];

// ---------- Utilidades ----------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Isologo: cuatro rectángulos a mano alzada (mismo trazo en todo el sitio)
function markPath() {
  const rects = [[2, 22, 41, 24], [33, 13, 40, 33], [61, 3, 26, 45], [80, 22, 42, 25]];
  const j = (n, s) => { const x = Math.sin(n * 12.9898 + s * 78.233) * 43758.5453; return +((x - Math.floor(x) - 0.5) * 1.6).toFixed(2); };
  const f = (v) => +v.toFixed(2);
  let d = "";
  rects.forEach(([x, y, w, h], i) => {
    for (let pass = 0; pass < 2; pass++) {
      const k = i * 10 + pass * 5, o = pass ? 0.9 : 0;
      d += `M${f(x - 1 + j(k, 1))} ${f(y + o + j(k, 2))}L${f(x + w + 1.5 + j(k, 3))} ${f(y + o * 0.6 + j(k, 4))}`;
      d += `M${f(x + w + o + j(k, 5))} ${f(y - 1 + j(k, 6))}L${f(x + w + o * 0.5 + j(k, 7))} ${f(y + h + 1.5 + j(k, 8))}`;
      d += `M${f(x + w + 1 + j(k, 9))} ${f(y + h - o + j(k, 10))}L${f(x - 1.5 + j(k, 11))} ${f(y + h - o * 0.4 + j(k, 12))}`;
      d += `M${f(x + o + j(k, 13))} ${f(y + h + 1 + j(k, 14))}L${f(x + o * 0.6 + j(k, 15))} ${f(y - 1.5 + j(k, 16))}`;
    }
  });
  return d;
}
const MARK = `<svg class="mark" viewBox="0 0 124 50" aria-hidden="true" focusable="false"><path d="${markPath()}"/></svg>`;
const IG_ICON = `<svg class="ig" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle class="dot" cx="17.3" cy="6.7" r="1.1"/></svg>`;

// Imagen responsive: WebP en varios tamaños + JPEG de respaldo, con ancho y alto para no mover el layout
function pic(key, alt, { sizes = "100vw", eager = false, cls = "" } = {}) {
  const m = images[key];
  if (!m) throw new Error(`Falta la imagen ${key}`);
  const srcset = m.widths.map((w) => `/img/${key}-${w}.webp ${w}w`).join(", ");
  // La foto principal de cada página carga primero; el resto, cuando se acerca al scroll
  const loading = eager ? `fetchpriority="high"` : `loading="lazy" decoding="async"`;
  return `<picture><source type="image/webp" srcset="${srcset}" sizes="${sizes}"><img src="/img/${key}-${m.fallback}.jpg" width="${m.w}" height="${m.h}" alt="${esc(alt)}" ${loading}${cls ? ` class="${cls}"` : ""}></picture>`;
}
const card = (c) => `<a class="card" href="/casas/${c.slug}"><div class="ph">${pic(c.img, c.alt, { sizes: "(max-width:520px) 100vw, (max-width:900px) 50vw, 33vw" })}</div><h3>${esc(c.n)}</h3></a>`;

// ---------- Datos estructurados (Google) ----------
const ORG = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE}/#estudio`,
  name: NAME,
  url: `${SITE}/`,
  logo: `${SITE}/icon-512.png`,
  image: `${SITE}/img/og-marconi-silva.jpg`,
  description: "Estudio de arquitectura de Buenos Aires. Diseñamos casas a medida para familias en todo el país y en países limítrofes, también con proyectos a distancia.",
  address: { "@type": "PostalAddress", addressLocality: "Buenos Aires", addressCountry: "AR" },
  areaServed: [{ "@type": "Country", name: "Argentina" }, { "@type": "Country", name: "Uruguay" }],
  knowsAbout: ["Arquitectura residencial", "Diseño de casas a medida", "Proyectos de arquitectura a distancia"],
  sameAs: [IG],
};
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
const crumbs = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE}${path}` })),
});

// ---------- Estilos (un archivo con hash en el nombre para cachearlo mucho tiempo) ----------
const CSS = readFileSync(join(ROOT, "src/styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s*\n\s*/g, "\n").trim();
const CSS_FILE = `styles.${createHash("sha1").update(CSS).digest("hex").slice(0, 10)}.css`;

// ---------- Plantilla ----------
const NAV = [["inicio", "/", "Inicio"], ["estudio", "/estudio", "El estudio"], ["casas", "/casas", "Casas"], ["a-distancia", "/proyectos-a-distancia", '<span class="wide-only">Proyectos </span>a distancia'], ["contacto", "/contacto", "Contacto"]];

function layout({ path, title, description, nav, body, image = "/img/og-marconi-silva.jpg", jsonld = [], extraHead = "", script = "" }) {
  const url = `${SITE}${path}`;
  const navHtml = NAV.map(([k, href, label]) => `<a href="${href}"${k === nav ? ' aria-current="page"' : ""}>${label}</a>`).join("\n      ");
  return `<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${NAME}">
<meta property="og:locale" content="es_AR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}${image}">
<meta property="og:image:alt" content="${esc(NAME)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}${image}">
<meta name="theme-color" content="#676665">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400&display=swap">
<link rel="stylesheet" href="/${CSS_FILE}">
${extraHead}${[ORG, ...jsonld].map(ld).join("\n")}
</head>
<body>
<a class="skip" href="#contenido">Saltar al contenido</a>
<header class="site">
  <div class="wrap">
    <a class="brand" href="/" aria-label="${NAME}, inicio">
      ${MARK}
      <span class="brand-text"><b>MARCONI SILVA</b><span>Arquitectos</span></span>
    </a>
    <nav class="main" aria-label="Principal">
      ${navHtml}
    </nav>
  </div>
</header>

<main id="contenido">
${body}
</main>

<footer class="site">
  <div class="wrap">
    <div class="fb">${MARK}<b>MARCONI SILVA</b><span>Arquitectos</span></div>
    <nav aria-label="Pie de página">
      <a href="/">Inicio</a><a href="/estudio">El estudio</a><a href="/casas">Casas</a><a href="/proyectos-a-distancia">A distancia</a><a href="/contacto">Contacto</a>
      <a class="ig-link" href="${IG}" target="_blank" rel="noopener" aria-label="Instagram de ${NAME}">${IG_ICON}</a>
    </nav>
    <small>Casas a medida en todo el país<br>© ${new Date().getFullYear()} ${NAME}</small>
  </div>
</footer>
${script}
</body>
</html>
`;
}

// ---------- Páginas ----------
const pages = [];
const page = (file, opts) => pages.push([file, layout(opts), opts.path]);

// Los links viejos del prototipo (#estudio, #casas, #casa-campo...) llevan a la página nueva
const OLD_HASH = { nosotros: "/estudio", estudio: "/estudio", casas: "/casas", "a-distancia": "/proyectos-a-distancia", contacto: "/contacto" };
const oldIds = { "casa-campo": "casa-de-campo", "casa-pinos": "casa-entre-pinos", "casa-blanca": "casa-blanca-con-galeria", "casa-piscina": "casa-con-piscina-y-piedra", "casa-cipreses": "casa-entre-cipreses", "casa-terrazas": "casa-con-terrazas", "casa-dos-plantas": "casa-en-dos-plantas", "casa-piedra": "casa-de-piedra-y-tejas", "casa-sierra": "casa-en-la-sierra" };
for (const [o, n] of Object.entries(oldIds)) OLD_HASH[o] = `/casas/${n}`;
const hashRedirect = `<script>(function(){var m=${JSON.stringify(OLD_HASH)},h=location.hash.slice(1);if(m[h])location.replace(m[h]);})();</script>`;

page("index.html", {
  path: "/",
  nav: "inicio",
  title: `${NAME} | Casas a medida en todo el país`,
  description: "Estudio de arquitectura de Buenos Aires. Diseñamos casas a medida para cada familia, en todo el país y a distancia: proyecto en 2 a 3 meses y maqueta 3D.",
  extraHead: `<link rel="preload" as="image" type="image/webp" imagesrcset="${images["casa-campo"].widths.map((w) => `/img/casa-campo-${w}.webp ${w}w`).join(", ")}" imagesizes="(max-width:820px) 100vw, 50vw" fetchpriority="high">\n`,
  jsonld: [{ "@context": "https://schema.org", "@type": "WebSite", name: NAME, url: `${SITE}/`, inLanguage: "es-AR", publisher: { "@id": `${SITE}/#estudio` } }],
  script: hashRedirect,
  body: `
<section class="band hero">
  <div class="hero-text">
    ${MARK}
    <div class="stack" style="gap:28px">
      <h1 class="display">Casas a medida,<br>estés donde estés.</h1>
      <p class="lead">Diseñamos cada casa a partir de cómo vive cada familia: sus hábitos, sus gustos y su historia.</p>
      <a class="btn" href="/contacto">Empezá tu proyecto <span aria-hidden="true">→</span></a>
    </div>
  </div>
  <div class="hero-photo">${pic("casa-campo", "Casa de campo de una planta con galerías, rodeada de pastos altos", { sizes: "(max-width:820px) 100vw, 50vw", eager: true })}</div>
</section>

<section class="wrap pad about">
  <div class="stack" style="gap:24px">
    <span class="label">El estudio</span>
    <h2 class="h2">${SOBRE}</h2>
    <blockquote class="q">“La casa nunca es la primera reunión: tiene que mutar, como un traje hecho a medida. Tu casa tiene que ser tuya, no nuestra primera propuesta.”<cite class="label">Fran</cite></blockquote>
    <a class="more" href="/estudio" style="align-self:flex-start">Conocé el estudio</a>
  </div>
  <div class="about-photo">${pic("juan-y-fran", "Juan y Fran, directores de Marconi Silva Arquitectos", { sizes: "(max-width:820px) 100vw, 55vw" })}</div>
</section>

<section class="wrap" style="padding-bottom:clamp(72px,10vw,144px)">
  <div class="section-head"><h2 class="h2">Casas</h2><a class="more" href="/casas">Ver todas</a></div>
  <div class="grid">${casas.slice(0, 6).map(card).join("")}</div>
</section>

<section class="band"><div class="wrap pad stack" style="gap:clamp(40px,5vw,64px)">
  <div class="split">
    <div class="stack" style="gap:16px"><span class="label">Proyectos a distancia</span><h2 class="h2">¿Tu terreno está lejos? Tu casa la podemos diseñar igual.</h2></div>
    <div class="stack" style="gap:28px"><p class="lead">Nos reunimos por Zoom, en dos o tres meses tenemos el proyecto y lo confirmamos con una maqueta 3D donde ves toda la casa antes de construirla.</p><a class="btn" href="/proyectos-a-distancia">Cómo trabajamos <span aria-hidden="true">→</span></a></div>
  </div>
  <div class="facts">
    <div><b>2 a 3 meses</b><p>para tener el proyecto</p></div>
    <div><b>Cada 10 días</b><p>una reunión por Zoom</p></div>
    <div><b>20 a 30 obras</b><p>hechas en distintos lugares del país</p></div>
  </div>
</div></section>`,
});

page("estudio.html", {
  path: "/estudio",
  nav: "estudio",
  title: `El estudio | ${NAME}`,
  description: "Somos Juan y Fran, arquitectos. Diseñamos casas a medida, en ladrillo y flexibles, escuchando cómo vive cada familia. Conocé cómo pensamos una casa.",
  image: "/img/juan-y-fran-1200.jpg",
  jsonld: [crumbs([["Inicio", "/"], ["El estudio", "/estudio"]])],
  body: `
<section class="wrap page-head split">
  <h1 class="display">El estudio</h1>
  <div class="stack" style="gap:20px">
    <p class="lead">${SOBRE}</p>
    <p>No queremos ser el estudio que te hace lo que quiere. Escuchamos lo que querés para que, en el primer plano, reconozcas que fuiste escuchado.</p>
  </div>
</section>
<section class="wrap"><div class="wide-photo">${pic("juan-y-fran", "Juan y Fran, directores de Marconi Silva Arquitectos, en el estudio", { sizes: "(max-width:1320px) 100vw, 1240px", eager: true })}</div></section>
<section class="wrap pad">
  <div class="section-head"><h2 class="h2">Cómo pensamos una casa</h2></div>
  <div class="principles">
    <div class="principle"><span class="who">A medida</span><h3>Traé la foto</h3><p>¿Te encantó el baño de un hotel o un lugarcito en la Toscana? Sacale una foto y traela a la primera reunión. Lo decodificamos juntos y lo llevamos a tu casa.</p></div>
    <div class="principle"><span class="who">Flexibles</span><h3>Casas que se adaptan</h3><p>Cocinar mientras un amigo se sienta a charlar, que los chicos hagan la tarea al lado tuyo, o integrar living, galerías y patio cuando son muchos. Una vez entraron 90 invitados.</p></div>
    <div class="principle"><span class="who">Materiales</span><h3>Por qué ladrillo</h3><p>Con una pared hueca no sabés cómo está construida la casa ni cómo va a durar. Elegimos el ladrillo como inversión: nadie te lo va a tirar abajo en el precio.</p></div>
    <div class="principle"><span class="who">Obra</span><h3>Con quién construimos</h3><p>No trabajamos con el más barato, trabajamos con el más afín. A quienes construyen nuestras casas los elegimos desde el lado de la persona.</p></div>
  </div>
</section>
<section class="wrap" style="padding-bottom:clamp(72px,10vw,144px)">
  <div class="section-head"><h2 class="h2">Prensa</h2></div>
  <div class="rows">
    <div class="row"><span class="label">2021</span><span>Entrevista con Jesús Pacheco</span><span class="label">Instagram</span></div>
  </div>
</section>`,
});

page("casas.html", {
  path: "/casas",
  nav: "casas",
  title: `Casas | ${NAME}`,
  description: "Casas de campo, de sierra y de bosque diseñadas a medida. Cada proyecto sale de un terreno, una familia y una forma de vivir.",
  jsonld: [crumbs([["Inicio", "/"], ["Casas", "/casas"]])],
  body: `
<section class="wrap page-head split">
  <h1 class="display">Casas</h1>
  <p class="lead">No tenemos casas preestablecidas. Cada proyecto sale de un terreno, una familia y una forma de vivir.</p>
</section>
<section class="wrap" style="padding-bottom:clamp(72px,10vw,144px)"><div class="grid">${casas.map(card).join("")}</div></section>`,
});

casas.forEach((c, i) => {
  const prev = casas[(i - 1 + casas.length) % casas.length], next = casas[(i + 1) % casas.length];
  page(`casas/${c.slug}.html`, {
    path: `/casas/${c.slug}`,
    nav: "casas",
    title: `${c.n} | ${NAME}`,
    description: `${c.n}, diseñada a medida por ${NAME}. ${c.alt}.`,
    image: `/img/${c.img}-${images[c.img].fallback}.jpg`,
    jsonld: [crumbs([["Inicio", "/"], ["Casas", "/casas"], [c.n, `/casas/${c.slug}`]])],
    body: `
<section class="wrap detail">
  <div class="ph">${pic(c.img, c.alt, { sizes: "(max-width:820px) 100vw, 55vw", eager: true })}</div>
  <aside class="detail-side">
    <a class="label back" href="/casas">← Casas</a>
    <h1 class="display" style="font-size:clamp(34px,4vw,56px)">${esc(c.n)}</h1>
    <p>Cada casa sale de un terreno, una familia y una forma de vivir. Si querés una casa pensada para vos, contanos tu proyecto.</p>
    <a class="btn solid" href="/contacto">Quiero una casa así <span aria-hidden="true">→</span></a>
    <nav class="pager" aria-label="Otras casas"><a href="/casas/${prev.slug}">← ${esc(prev.n)}</a><a href="/casas/${next.slug}">${esc(next.n)} →</a></nav>
  </aside>
</section>`,
  });
});

const pileta = images["casa-pileta-horizontal"];
page("proyectos-a-distancia.html", {
  path: "/proyectos-a-distancia",
  nav: "a-distancia",
  title: `Proyectos de arquitectura a distancia | ${NAME}`,
  description: "Diseñamos tu casa por Zoom estés donde estés: proyecto en 2 a 3 meses, maqueta 3D y obra con profesionales de tu zona. Más de 20 obras en todo el país.",
  image: "/img/og-marconi-silva.jpg",
  jsonld: [
    crumbs([["Inicio", "/"], ["Proyectos a distancia", "/proyectos-a-distancia"]]),
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ],
  extraHead: `<style>.photo-band{--photo:image-set(url("/img/casa-pileta-horizontal-1600.webp") type("image/webp"),url("/img/casa-pileta-horizontal-${pileta.fallback}.jpg") type("image/jpeg"))}@media (max-width:820px){.photo-band{--photo:image-set(url("/img/casa-pileta-horizontal-800.webp") type("image/webp"),url("/img/casa-pileta-horizontal-${pileta.fallback}.jpg") type("image/jpeg"))}}</style>\n`,
  body: `
<section class="band photo-band" role="img" aria-label="Casa de dos plantas con piscina y galerías, diseñada a distancia"><div class="wrap photo-inner">
  <div class="panel stack">
    <span class="label">Proyectos a distancia</span><h1 class="display">Tu casa, desde donde estés.</h1>
    <p class="lead">¿Vivís en Ushuaia, en Calamuchita o en cualquier otro lugar del país? Diseñamos tu casa por Zoom y la construye un equipo de tu zona, con nuestro acompañamiento.</p>
    <p>El proyecto a distancia nació en la cuarentena. Las reuniones pasaron a ser online y nos dimos cuenta de que podíamos llevar nuestros proyectos mucho más lejos.</p>
  </div>
</div></section>

<section class="wrap pad stack" style="gap:clamp(36px,4vw,56px)">
  <h2 class="h2">Cómo trabajamos</h2>
  <ol class="steps">
    <li><h3>Nos escribís</h3><p>Por Instagram o WhatsApp. Te contestamos nosotros y armamos una primera reunión.</p></li>
    <li><h3>Primera reunión</h3><p>Hablamos de tu terreno, tu familia y cómo te gusta vivir. Traé fotos de lugares que te encantaron.</p></li>
    <li><h3>Diseño</h3><p>Dos a tres meses, con una reunión por Zoom cada diez días. Probamos varias opciones: es mejor probar en papel que en la obra.</p></li>
    <li><h3>Maqueta 3D</h3><p>Vos, nosotros y quien construye vemos exactamente la misma casa antes de empezar.</p></li>
    <li><h3>Obra</h3><p>La construyen profesionales de tu zona. La acompañamos por WhatsApp y, si hace falta, coordinamos visitas.</p></li>
  </ol>
</section>

<section class="wrap story" style="padding-bottom:clamp(64px,9vw,128px)">
  <div class="ph">${pic("casa-pinos", "Casa blanca entre pinos", { sizes: "(max-width:820px) 100vw, 45vw" })}</div>
  <div class="stack" style="gap:24px">
    <span class="label">Una historia · Necochea</span>
    <h2 class="h2">Su casa empezó arriba de un árbol</h2>
    <p class="lead">Un cliente quería hacer su casa en el campo de su familia. De chico llegaba a caballo y desde ahí veía el mar. Fuimos juntos, se trepó a un árbol y nos dijo: desde acá veo el mar.</p>
    <p>Esa altura fue el nivel del piso del living, y a partir de ahí se armó toda la casa.</p>
  </div>
</section>

<section class="band"><div class="wrap pad split">
  <div class="stack" style="gap:16px"><span class="label">Dónde trabajamos</span><h2 class="h2">Casas en todo el país</h2></div>
  <div>
    <p class="lead">Entre 20 y 30 obras hechas en distintos lugares, y se siguen sumando.</p>
    <div class="places"><span>Punta del Este</span><span>Salta</span><span>Córdoba</span><span>Río Negro</span><span>Bariloche</span><span>Mendoza</span><span>Necochea</span></div>
  </div>
</div></section>

<section class="wrap pad split">
  <h2 class="h2">Preguntas frecuentes</h2>
  <div class="faq">
    ${FAQ.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${q}</summary><p>${a}</p></details>`).join("\n    ")}
  </div>
</section>
<section class="wrap" style="padding-bottom:clamp(72px,10vw,144px)"><a class="btn solid" href="/contacto">Consultá por tu proyecto <span aria-hidden="true">→</span></a></section>`,
});

page("contacto.html", {
  path: "/contacto",
  nav: "contacto",
  title: `Contacto | ${NAME}`,
  description: "Contanos sobre tu terreno, tu familia y cómo te gusta vivir. Escribinos por Instagram y te contestamos nosotros.",
  jsonld: [crumbs([["Inicio", "/"], ["Contacto", "/contacto"]])],
  body: `
<section class="wrap page-head split">
  <h1 class="display">Contacto</h1>
  <p class="lead">Contanos sobre tu terreno, tu familia y cómo te gusta vivir. Te contestamos nosotros.</p>
</section>
<section class="wrap contact-cta">
  <a class="btn solid" href="${IG_DM}" target="_blank" rel="noopener">${IG_ICON}<span>Escribinos por Instagram</span></a>
  <div class="info">
    <div><span class="label">Instagram</span><a class="val ig-handle" href="${IG}" target="_blank" rel="noopener">@marconisilvaarquitectos</a></div>
    <div><span class="label">Estudio</span><span class="val">Buenos Aires, Argentina</span></div>
    <div><span class="label">Proyectos</span><span class="val">En todo el país y en países limítrofes</span></div>
  </div>
</section>`,
});

// 404
const notFound = layout({
  path: "/404",
  nav: "",
  title: `Página no encontrada | ${NAME}`,
  description: "La página que buscás no existe.",
  body: `
<section class="wrap notfound">
  <span class="label">Error 404</span>
  <h1 class="display">Esta página no existe.</h1>
  <p class="lead">Puede que el link esté mal escrito o que la página se haya movido.</p>
  <a class="btn solid" href="/">Ir al inicio <span aria-hidden="true">→</span></a>
</section>`,
}).replace('<meta name="robots" content="index, follow, max-image-preview:large">', '<meta name="robots" content="noindex">').replace(/<link rel="canonical"[^>]*>\n/, "");

// ---------- Escritura ----------
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(ROOT, "public"), OUT, { recursive: true });
writeFileSync(join(OUT, CSS_FILE), CSS);

for (const [file, html] of pages) {
  mkdirSync(dirname(join(OUT, file)), { recursive: true });
  writeFileSync(join(OUT, file), html);
}
writeFileSync(join(OUT, "404.html"), notFound);

// sitemap.xml y robots.txt
const urls = pages.map(([, , path]) => {
  const pri = path === "/" ? "1.0" : path.startsWith("/casas/") ? "0.6" : "0.8";
  return `  <url><loc>${SITE}${path}</loc><lastmod>${TODAY}</lastmod><priority>${pri}</priority></url>`;
});
writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
writeFileSync(join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

// Manifest para "agregar a pantalla de inicio"
writeFileSync(join(OUT, "site.webmanifest"), JSON.stringify({
  name: NAME, short_name: "Marconi Silva", lang: "es-AR", start_url: "/", display: "browser",
  background_color: "#f2f1ef", theme_color: "#676665",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
}, null, 2));

// Configuración del servidor: URLs limpias, cache y cabeceras de seguridad
writeFileSync(join(OUT, "serve.json"), JSON.stringify({
  cleanUrls: true,
  trailingSlash: false,
  headers: [
    { source: "**/*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Strict-Transport-Security", value: "max-age=31536000" },
      { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
    ] },
    { source: "img/**", headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }] },
    { source: "styles.*.css", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    { source: "{favicon.ico,favicon.svg,apple-touch-icon.png,icon-*.png}", headers: [{ key: "Cache-Control", value: "public, max-age=604800" }] },
  ],
}, null, 2));

console.log(`Sitio generado en dist/: ${pages.length} páginas + 404, sitemap, robots, manifest.`);
