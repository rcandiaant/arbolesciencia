// Árboles Parlantes · maqueta 2027 · utilidades compartidas
// Requiere js/datos.js y js/clima.js cargados antes.

window.PASOS = [
  { archivo: "index.html", titulo: "Presentación" },
  { archivo: "panel.html", titulo: "Panel en terreno" },
  { archivo: "acceso.html", titulo: "Al escanear el QR" },
  { archivo: "arbol.html", titulo: "Ficha del árbol" },
  { archivo: "redes.html", titulo: "Cuentas en redes" },
  { archivo: "repositorio.html", titulo: "Explicación y fuentes" },
  { archivo: "como-funciona.html", titulo: "Funcionamiento" }
];

window.AP = (function () {
  function arbolPorId(id) {
    return window.ARBOLES.find(a => a.id === id) || null;
  }

  // Árbol activo según ?arbol=<id>; por defecto la patagua (nodo de INIA La Platina).
  function arbolActual() {
    const id = new URLSearchParams(location.search).get("arbol");
    return arbolPorId(id) || arbolPorId("patagua");
  }

  // Artículos según el género del nombre común (patagua es femenino).
  function el_(a) { return (a.genero === "f" ? "la " : "el ") + a.comun.toLowerCase(); }
  function del_(a) { return (a.genero === "f" ? "de la " : "del ") + a.comun.toLowerCase(); }
  function al_(a) { return (a.genero === "f" ? "a la " : "al ") + a.comun.toLowerCase(); }

  function escapar(txt) {
    return String(txt).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // Rellena {umbral}, {base}, {reciente}, {periodoBase}, {periodoReciente} (del árbol dado)
  // y {umbral:id}, {base:id}, {reciente:id} (de otro árbol).
  function rellenar(texto, arbolId) {
    const C = window.CLIMA.arboles;
    return texto.replace(/\{(umbral|base|reciente|periodoBase|periodoReciente|diferencia)(?::(\w+))?\}/g, (_, campo, otro) => {
      const c = C[otro || arbolId];
      if (!c) return "";
      switch (campo) {
        case "umbral": return c.umbral;
        case "base": return Math.round(c.base.dias);
        case "reciente": return Math.round(c.reciente.dias);
        case "periodoBase": return c.base.periodo;
        case "periodoReciente": return c.reciente.periodo;
        case "diferencia": return Math.round(c.reciente.dias) - Math.round(c.base.dias);
      }
    });
  }

  function selloDemo(texto) {
    return `<span class="sello-demo" role="note">${escapar(texto || "Dato de demostración")}</span>`;
  }
  function selloReal(texto) {
    return `<span class="sello-real" role="note">${escapar(texto || "Dato real")}</span>`;
  }
  // Sello para cifras climáticas: real si CLIMA.real, si no demostración.
  function selloClima() {
    return window.CLIMA.real ? selloReal("Dato real · CR2MET") : selloDemo("Dato de demostración");
  }
  // Sello para publicaciones de ejemplo: el texto siempre es de ejemplo; si trae cifras climáticas
  // y CLIMA es real, se agrega un segundo sello que lo indica.
  const MARCADOR_CLIMA = /\{(umbral|base|reciente|periodoBase|periodoReciente|diferencia)(?::\w+)?\}/;
  function selloPublicacion(textoOriginal) {
    const ejemplo = selloDemo("Publicación de ejemplo");
    if (MARCADOR_CLIMA.test(textoOriginal || "") && window.CLIMA.real) {
      return ejemplo + " " + selloReal("Cifras climáticas reales · CR2MET");
    }
    return ejemplo;
  }

  function pasoActual() {
    const archivo = location.pathname.split("/").pop() || "index.html";
    const i = window.PASOS.findIndex(p => p.archivo === archivo);
    return i < 0 ? 0 : i;
  }

  // Conserva ?arbol= al navegar entre pasos.
  function enlace(archivo) {
    const id = new URLSearchParams(location.search).get("arbol");
    return id ? `${archivo}?arbol=${encodeURIComponent(id)}` : archivo;
  }

  function cabecera() {
    const i = pasoActual();
    const items = window.PASOS.map((p, k) =>
      `<li class="${k < i ? "hecho" : ""}"><a href="${enlace(p.archivo)}"${k === i ? ' aria-current="step"' : ""}>${k + 1}. ${escapar(p.titulo)}</a></li>`
    ).join("");
    return `
      <a class="salto" href="#contenido">Saltar al contenido</a>
      <header class="cabecera">
        <div class="contenedor">
          <a class="marca" href="${enlace("index.html")}">Árboles Parlantes</a>
          <span class="etiqueta-maqueta">Maqueta 2027</span>
        </div>
      </header>
      <nav class="recorrido" aria-label="Recorrido de la maqueta">
        <div class="contenedor">
          <p class="recorrido-estado">Paso <strong>${i + 1} de ${window.PASOS.length}</strong>: ${escapar(window.PASOS[i].titulo)}</p>
          <ol>${items}</ol>
        </div>
      </nav>`;
  }

  function navegacionPasos() {
    const i = pasoActual();
    const ant = window.PASOS[i - 1], sig = window.PASOS[i + 1];
    return `<nav class="pasos-nav" aria-label="Paso anterior y siguiente">
      ${ant ? `<a class="boton secundario anterior" href="${enlace(ant.archivo)}">← ${escapar(ant.titulo)}</a>` : "<span></span>"}
      ${sig ? `<a class="boton siguiente" href="${enlace(sig.archivo)}">${escapar(sig.titulo)} →</a>` : ""}
    </nav>`;
  }

  function pie() {
    return `<footer class="pie">
      <div class="contenedor">
        <img src="img/inia.png" alt="Logo de INIA, Instituto de Investigaciones Agropecuarias">
        <p><strong>${escapar(window.NOMBRE_PROYECTO)}</strong></p>
        <p>Maqueta presentada al Concurso Nacional Ciencia Pública – Dispositivos 2027. Postulación de INIA con CONAF Tarapacá, CONAF Los Ríos y la Universidad de La Serena.</p>
        <p>Los datos con el sello «Dato de demostración» son ilustrativos. Las cuentas y sus nombres de usuario son de ejemplo.</p>
        ${window.ARBOLES.map(creditoFoto).join("")}
      </div>
    </footer>`;
  }

  // Atribución visible para fotos con licencia (p. ej. CC BY). Devuelve "" si el árbol no la requiere.
  function creditoFoto(a) {
    const c = a && a.credito;
    if (!c) return "";
    return `<p class="credito-foto">${escapar(c.texto)} Foto: ${escapar(c.autor)},
      <a href="${escapar(c.origenUrl)}" rel="noopener">Wikimedia Commons</a>,
      <a href="${escapar(c.licenciaUrl)}" rel="license noopener">${escapar(c.licencia)}</a>${c.cambios ? ` (${escapar(c.cambios)})` : ""}.</p>`;
  }

  // Inserta cabecera, navegación de pasos y pie. La página debe tener <main id="contenido">.
  function montar() {
    document.body.insertAdjacentHTML("afterbegin", cabecera());
    const main = document.getElementById("contenido");
    if (main) {
      const cont = main.querySelector(".contenedor") || main;
      cont.insertAdjacentHTML("beforeend", navegacionPasos());
    }
    document.body.insertAdjacentHTML("beforeend", pie());
  }

  return { arbolPorId, arbolActual, el_, del_, al_, escapar, rellenar, selloDemo, selloReal, selloClima, selloPublicacion, enlace, creditoFoto, montar };
})();

// Íconos genéricos (no son logos de marcas).
window.ICONOS = {
  foto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  mensaje: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
  ficha: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v18M7 8c0-3 2-5 5-5s5 2 5 5-2 6-5 6-5-3-5-6z"/></svg>',
  qr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v7M14 20h3"/></svg>',
  lenguaSenas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 11V5a1.5 1.5 0 0 1 3 0v5M10 10V4a1.5 1.5 0 0 1 3 0v6M13 10V5a1.5 1.5 0 0 1 3 0v7M16 11a1.5 1.5 0 0 1 3 0v3a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-3l-2-4a1.5 1.5 0 0 1 2.6-1.5L7 14"/></svg>',
  audiodescripcion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3z"/><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/></svg>',
  relieve: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><circle cx="7" cy="6" r="2"/><circle cx="7" cy="12" r="2"/><circle cx="7" cy="18" r="2"/><circle cx="15" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="15" cy="18" r="2" opacity="0.35"/></svg>',
  subtitulos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 12h4M12 12h6M6 15h8M16 15h2"/></svg>'
};
