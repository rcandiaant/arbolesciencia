// Verificación integrada de la maqueta 2027 + capturas oficiales.
//
// Preparación (una vez):  cd herramientas && npm install && npx playwright install chromium
// Uso (con el sitio servido desde la raíz de maqueta-2027 en otra terminal: python -m http.server 8790):
//   node herramientas/verificar.mjs [baseURL] [dirCapturas]
//   baseURL      por defecto http://localhost:8790/
//   dirCapturas  por defecto una carpeta temporal fuera del repo. Las capturas oficiales (capturas/) solo se
//                regeneran en hitos: node herramientas/verificar.mjs http://localhost:8790/ capturas
//
// Revisa cada página a 390 y 1280 px: errores de consola y de red (salvo teselas de OpenStreetMap),
// scroll horizontal, rayas largas (—), marcadores {…} sin rellenar, imágenes sin alt, recursos externos,
// lang="es", un solo h1, y que todos los enlaces internos y anclas existan. Guarda una captura por página
// y ancho. Termina con código 1 si encuentra problemas.
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";
import os from "os";
import fs from "fs";

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const base = process.argv[2] || "http://localhost:8790/";
const dirCap = path.resolve(process.argv[3] || path.join(os.tmpdir(), "maqueta-capturas"));
fs.mkdirSync(dirCap, { recursive: true });
console.log("Capturas en:", dirCap);
const paginas = [
  ["01-portada", "index.html"],
  ["02-panel", "panel.html?arbol=patagua"],
  ["03-acceso-qr", "acceso.html?arbol=tamarugo"],
  ["04-ficha-tamarugo", "arbol.html?arbol=tamarugo"],
  ["04-ficha-coigue", "arbol.html?arbol=coigue"],
  ["04-ficha-patagua", "arbol.html?arbol=patagua"],
  ["05-redes-instagram", "redes.html?arbol=tamarugo#instagram"],
  ["05-redes-x", "redes.html?arbol=coigue#x"],
  ["06-repositorio", "repositorio.html"],
  ["07-como-funciona", "como-funciona.html"]
];
const anchos = [["movil-390", 390, 844], ["escritorio-1280", 1280, 800]];

const browser = await chromium.launch();
const problemas = [];
const enlaces = new Set();
for (const [ancho, w, h] of anchos) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  for (const [nombre, url] of paginas) {
    const page = await ctx.newPage();
    const errs = [];
    page.on("console", m => { if (m.type() === "error" && !/tile\.openstreetmap/.test(m.text())) errs.push(m.text()); });
    page.on("pageerror", e => errs.push("pageerror: " + e.message));
    page.on("requestfailed", r => { if (!/openstreetmap/.test(r.url())) errs.push("requestfailed: " + r.url()); });
    await page.goto(base + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const info = await page.evaluate(() => {
      const txt = document.body.innerText;
      return {
        scroll: document.documentElement.scrollWidth - innerWidth,
        raya: (txt.match(/—/g) || []).length,
        marcadores: (txt.match(/\{[a-zA-Z:]+\}/g) || []),
        sinAlt: [...document.images].filter(i => !i.hasAttribute("alt")).map(i => i.src),
        hrefs: [...document.querySelectorAll("a[href]")].map(a => a.getAttribute("href")),
        cdn: [...document.querySelectorAll("script[src],link[href]")].map(e => e.src || e.href).filter(u => /^https?:/.test(u) && !u.startsWith(location.origin)),
        cdnsin: [...document.querySelectorAll("script[src],link[rel=stylesheet]")].map(e => e.getAttribute("src") || e.getAttribute("href")).filter(u => /^(https?:)?\/\//.test(u)),
        lang: document.documentElement.lang,
        h1: document.querySelectorAll("h1").length
      };
    });
    info.hrefs.forEach(hr => enlaces.add(hr));
    const p = [];
    if (errs.length) p.push("errores: " + errs.join(" | "));
    if (info.scroll > 0) p.push("scroll horizontal " + info.scroll + "px");
    if (info.raya) p.push("rayas largas: " + info.raya);
    if (info.marcadores.length) p.push("marcadores sin rellenar: " + info.marcadores.join(","));
    if (info.sinAlt.length) p.push("img sin alt: " + info.sinAlt.join(","));
    if (info.cdnsin.length) p.push("recursos externos: " + info.cdnsin.join(","));
    if (info.lang !== "es") p.push("lang=" + info.lang);
    if (info.h1 !== 1) p.push("h1 count " + info.h1);
    if (p.length) problemas.push(`${nombre} @${ancho}: ${p.join("; ")}`);
    await page.screenshot({ path: `${dirCap}/${nombre}-${ancho}.png`, fullPage: true });
    await page.close();
  }
  await ctx.close();
}

// Enlaces internos y anclas
const ctx = await browser.newContext();
const page = await ctx.newPage();
const cacheIds = {};
for (const hr of enlaces) {
  if (/^(https?:|mailto:)/.test(hr)) continue;
  const [ruta, ancla] = hr.split("#");
  const archivo = (ruta || "").split("?")[0];
  if (!archivo && !ancla) continue;
  if (archivo) {
    const r = await page.request.get(base + archivo);
    if (!r.ok()) { problemas.push(`enlace roto: ${hr} (${r.status()})`); continue; }
  }
  if (ancla && archivo) {
    if (!cacheIds[ruta]) {
      await page.goto(base + ruta, { waitUntil: "networkidle" });
      cacheIds[ruta] = await page.evaluate(() => [...document.querySelectorAll("[id]")].map(e => e.id));
    }
    if (!cacheIds[ruta].includes(ancla)) problemas.push(`ancla inexistente: ${hr}`);
  }
}
await browser.close();
console.log("Enlaces revisados:", enlaces.size);
console.log(problemas.length ? "PROBLEMAS:\n- " + problemas.join("\n- ") : "OK: sin problemas");
if (problemas.length) process.exitCode = 1;
