// Árboles Parlantes · maqueta 2027 · repositorio.html
// Requiere js/datos.js, js/clima.js y js/comun.js.
(function () {
  const esc = AP.escapar;
  const MARCADOR = /\{(umbral|base|reciente|periodoBase|periodoReciente)(?::\w+)?\}/;

  // Fuentes reales permitidas (citadas tal cual).
  const FUENTES = {
    garrido: {
      cita: "Garrido M. et al. (2020). The adjustment of Prosopis tamarugo hydraulic architecture traits has a homeostatic effect over its performance under descent of phreatic level in the Atacama Desert. Trees 34:89–99.",
      url: "https://doi.org/10.1007/s00468-019-01899-2"
    },
    cr2met: {
      cita: "Boisier J. P. (2023). CR2MET v2.5. Zenodo.",
      url: "https://doi.org/10.5281/zenodo.7529682"
    }
  };

  // Índice de temas
  document.getElementById("lista-temas").innerHTML = window.TEMAS.map(t =>
    `<li><a href="#${esc(t.id)}">${esc(t.titulo)}</a></li>`
  ).join("");

  // Nivel 1: mensaje de ejemplo (primera publicación con ese tema)
  document.querySelectorAll(".mensaje-ejemplo").forEach(caja => {
    const tema = caja.dataset.tema;
    const p = window.PUBLICACIONES.find(x => x.tema === tema);
    if (!p) { caja.innerHTML = `<p><span class="pendiente">Mensaje de ejemplo pendiente</span></p>`; return; }
    const a = AP.arbolPorId(p.arbol);
    const sello = MARCADOR.test(p.texto) ? AP.selloClima() : AP.selloDemo("Publicación de ejemplo");
    caja.innerHTML = `<figure class="mensaje tono-${esc(a.id)}">
        <figcaption class="mensaje-autor"><strong>${esc(a.comun)}</strong> <span class="handle handle-ejemplo">${esc(a.handle)}</span></figcaption>
        <p class="mensaje-dia">${esc(p.dia)}</p>
        <blockquote class="mensaje-texto"><p>${esc(AP.rellenar(p.texto, p.arbol))}</p></blockquote>
        <div>${sello}</div>
        <p class="mencion-ia">${esc(window.MENCION_IA)}</p>
      </figure>`;
  });

  // Nivel 3: cápsula audiovisual (placeholder)
  const I = window.ICONOS;
  document.querySelectorAll("[data-capsula]").forEach(c => {
    c.innerHTML = `<div class="capsula-pantalla">
        <p class="capsula-estado">Cápsulas en producción</p>
      </div>
      <ul class="capsula-accesibilidad" aria-label="Accesibilidad de la cápsula">
        <li>${I.lenguaSenas}<span>Lengua de señas</span></li>
        <li>${I.audiodescripcion}<span>Audiodescripción</span></li>
        <li>${I.subtitulos}<span>Subtítulos SRT</span></li>
      </ul>`;
  });

  // Nivel 4: fuentes
  document.querySelectorAll("[data-fuente]").forEach(c => {
    const f = FUENTES[c.dataset.fuente];
    if (!f) return;
    c.innerHTML = `<p class="fuente">${esc(f.cita)} <a href="${esc(f.url)}" rel="noopener">${esc(f.url)}</a></p>`;
  });

  // Tabla de comparación por árbol (CR2MET contra CR2MET), con sello en el mismo elemento
  const C = window.CLIMA;
  const filas = window.ARBOLES.map(a => {
    const c = C.arboles[a.id];
    if (!c) return "";
    return `<tr><th scope="row">${esc(a.comun)}</th><td>${esc(c.umbral)} °C</td><td>${esc(c.base.dias)}</td><td>${esc(c.reciente.dias)}</td></tr>`;
  }).join("");
  const ejB = C.arboles[window.ARBOLES[0].id];
  document.getElementById("tabla-clima").innerHTML = `<div class="tabla-clima">
      <div class="tabla-clima-cabecera"><h3>Días al año sobre el umbral, por árbol</h3>${AP.selloClima()}</div>
      <div class="tabla-envoltura">
        <table>
          <caption class="visualmente-oculto">Promedio de días al año con temperatura máxima sobre el umbral del sitio, celda CR2MET más cercana a cada árbol</caption>
          <thead><tr><th scope="col">Árbol</th><th scope="col">Umbral</th><th scope="col">${esc(ejB.base.periodo)}</th><th scope="col">${esc(ejB.reciente.periodo)}</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
      <p class="nota">${C.real ? "Valores extraídos de CR2MET." : "En esta maqueta las cifras son de demostración; se reemplazarán por los valores extraídos de CR2MET."}</p>
    </div>`;

  // El contenido se completa con JS y la cabecera se inserta arriba: vuelve al ancla pedida.
  window.addEventListener("load", () => {
    if (!location.hash) return;
    const destino = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (destino) destino.scrollIntoView();
  });
})();
