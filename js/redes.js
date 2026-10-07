// Árboles Parlantes · maqueta 2027 · mockups de las cuentas en Instagram y X
// Requiere js/datos.js, js/clima.js y js/comun.js. Sin horas, likes, seguidores ni contadores.
(function () {
  const esc = AP.escapar;
  const activo = AP.arbolActual();
  const HILO = window.HILO;

  const sello = t => AP.selloPublicacion(t);
  const texto = (t, arbolId) => esc(AP.rellenar(t, arbolId));

  function tema(id) { return window.TEMAS.find(t => t.id === id) || { id: id, titulo: "" }; }

  function queSignifica(temaId) {
    const t = tema(temaId);
    return `<a class="que-significa" href="${AP.enlace("repositorio.html")}#${encodeURIComponent(t.id)}">¿Qué significa?<span class="visualmente-oculto"> ${esc(t.titulo)}</span></a>`;
  }

  function mencion() { return `<p class="mencion-ia">${esc(window.MENCION_IA)}</p>`; }
  function dia(d) { return `<p class="post-dia">${esc(d)}</p>`; }
  function handle(a) { return `<span class="handle handle-ejemplo">${esc(a.handle)}</span>`; }

  function placeholderTexto(a) { return `Foto del ${a.comun.toLowerCase()} – pendiente`; }

  // Avatar grande (perfil): foto o placeholder visible.
  function avatarGrande(a) {
    if (a.foto) return `<img class="avatar avatar-grande" src="${esc(a.foto)}" alt="${esc(a.fotoAlt)}">`;
    return `<div class="avatar avatar-grande avatar-pendiente" role="img" aria-label="${esc(placeholderTexto(a))}"><span aria-hidden="true">${esc(placeholderTexto(a))}</span></div>`;
  }
  // Avatar chico (hilo): decorativo, el nombre va al lado.
  function avatarChico(a) {
    if (a.foto) return `<img class="avatar avatar-chico" src="${esc(a.foto)}" alt="">`;
    return `<div class="avatar avatar-chico avatar-pendiente" title="${esc(placeholderTexto(a))}"><span aria-hidden="true">${esc(a.comun.charAt(0))}</span><span class="visualmente-oculto">${esc(placeholderTexto(a))}</span></div>`;
  }

  function selector(red, nombreRed) {
    const items = window.ARBOLES.map(a =>
      `<li><a class="selector-opcion tono-${esc(a.id)}" href="redes.html?arbol=${encodeURIComponent(a.id)}#${red}"${a.id === activo.id ? ' aria-current="page"' : ""}>${esc(a.comun)}<span class="selector-handle">${esc(a.handle)}</span></a></li>`
    ).join("");
    return `<nav class="selector-arbol" aria-label="Elegir la cuenta de ejemplo en ${esc(nombreRed)}"><p class="selector-titulo">Ver la cuenta de:</p><ul>${items}</ul></nav>`;
  }

  function enlaceBio(a) {
    return `<p class="enlace-bio"><span class="enlace-bio-rotulo">Enlace en la biografía:</span> <a href="arbol.html?arbol=${encodeURIComponent(a.id)}">Mi ficha en la plataforma Árboles Parlantes</a></p>`;
  }

  function perfil(a, red) {
    return `<div class="perfil perfil-${red}">
      ${avatarGrande(a)}
      <div class="perfil-datos">
        <h3 class="perfil-nombre">${esc(a.comun)} <span class="perfil-especie">${esc(a.especie)}</span></h3>
        <p class="perfil-handle">${handle(a)}</p>
        <p class="perfil-lugar">${esc(a.lugar)} · ${esc(a.region)}</p>
        <p class="perfil-bio">${esc(a.bio)}</p>
        ${enlaceBio(a)}
      </div>
    </div>`;
  }

  // ---------- Instagram ----------
  function postInstagram(p) {
    const a = AP.arbolPorId(p.arbol);
    return `<li class="post-ig">
      <article aria-label="Publicación de ejemplo de ${esc(a.handle)}">
        <div class="lamina tono-${esc(a.id)}">
          <p class="lamina-rotulo">Plantilla gráfica de ejemplo · ${esc(a.handle)}</p>
          <p class="lamina-texto">${texto(p.texto, p.arbol)}</p>
          <div class="lamina-sello">${sello(p.texto)}</div>
        </div>
        <div class="post-meta">
          ${dia(p.dia)}
          ${mencion()}
          ${queSignifica(p.tema)}
        </div>
      </article>
    </li>`;
  }

  function carrusel() {
    const total = HILO.mensajes.length;
    const autores = [...new Set(HILO.mensajes.map(m => m.arbol))].map(id => AP.arbolPorId(id));
    const nombres = autores.map(a => a.handle).join(" y ");
    const laminas = HILO.mensajes.map((m, i) => {
      const a = AP.arbolPorId(m.arbol);
      const resp = m.respondeA ? AP.arbolPorId(m.respondeA) : null;
      return `<div class="lamina lamina-carrusel tono-${esc(a.id)}" role="group" aria-roledescription="lámina" aria-label="${i + 1} de ${total}"${i === 0 ? "" : " hidden"}>
        <p class="lamina-rotulo">Lámina ${i + 1} de ${total} · ${esc(a.comun)} (${esc(a.handle)})${resp ? ` responde a ${esc(resp.comun)}` : ""}</p>
        <p class="lamina-texto">${texto(m.texto, m.arbol)}</p>
        <div class="lamina-sello">${sello(m.texto)}</div>
      </div>`;
    }).join("");

    return `<div class="post-carrusel">
      <h3 class="subtitulo-red">Carrusel: conversación entre ${esc(nombres)}</h3>
      <p class="nota-destacada">En Instagram la conversación entre árboles se presenta como carrusel y el enlace a la explicación va en la biografía.</p>
      <section class="carrusel" aria-roledescription="carrusel" aria-label="Conversación entre ${esc(nombres)}">
        <div class="carrusel-ventana" tabindex="0" aria-label="Láminas del carrusel. Usa las flechas izquierda y derecha para cambiar de lámina.">
          ${laminas}
        </div>
        <div class="carrusel-controles">
          <button type="button" class="boton secundario carrusel-boton" data-dir="-1" aria-label="Lámina anterior"><span aria-hidden="true">←</span></button>
          <p class="carrusel-indicador" aria-live="polite" aria-atomic="true"><span class="visualmente-oculto">Lámina </span>1 de ${total}</p>
          <button type="button" class="boton secundario carrusel-boton" data-dir="1" aria-label="Lámina siguiente"><span aria-hidden="true">→</span></button>
        </div>
      </section>
      <div class="post-meta">
        ${dia(HILO.dia)}
        ${mencion()}
        ${queSignifica(HILO.tema)}
      </div>
    </div>`;
  }

  function activarCarrusel(raiz) {
    const car = raiz.querySelector(".carrusel");
    if (!car) return;
    const laminas = [...car.querySelectorAll(".lamina-carrusel")];
    const indicador = car.querySelector(".carrusel-indicador");
    let i = 0;
    function ir(n) {
      i = (n + laminas.length) % laminas.length;
      laminas.forEach((l, k) => { l.hidden = k !== i; });
      indicador.innerHTML = `<span class="visualmente-oculto">Lámina </span>${i + 1} de ${laminas.length}`;
    }
    car.querySelectorAll(".carrusel-boton").forEach(b =>
      b.addEventListener("click", () => ir(i + Number(b.dataset.dir)))
    );
    car.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") { ir(i + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { ir(i - 1); e.preventDefault(); }
      else if (e.key === "Home") { ir(0); e.preventDefault(); }
      else if (e.key === "End") { ir(laminas.length - 1); e.preventDefault(); }
    });
  }

  function instagram() {
    const posts = window.PUBLICACIONES.filter(p => p.arbol === activo.id);
    return `${selector("instagram", "Instagram")}
      <div class="marco-red">
        ${perfil(activo, "ig")}
        <h3 class="subtitulo-red">Publicaciones de ${esc(activo.handle)}</h3>
        <p class="nota">Instagram no admite publicaciones de solo texto: cada publicación es una imagen con el mensaje del árbol sobre la plantilla gráfica del proyecto.</p>
        <ul class="grilla-ig">${posts.map(postInstagram).join("")}</ul>
        ${carrusel()}
      </div>`;
  }

  // ---------- X ----------
  function postX(p, opciones) {
    const a = AP.arbolPorId(p.arbol);
    const resp = opciones && opciones.respondeA ? AP.arbolPorId(opciones.respondeA) : null;
    return `<article class="post-x" aria-label="Publicación de ejemplo de ${esc(a.handle)}">
      <div class="post-x-avatar">${avatarChico(a)}</div>
      <div class="post-x-cuerpo">
        <p class="post-x-autor"><strong>${esc(a.comun)}</strong> ${handle(a)}</p>
        ${resp ? `<p class="respondiendo">Respondiendo a ${esc(resp.handle)}</p>` : ""}
        <div class="post-x-texto con-sello-linea">
          <p>${texto(p.texto, p.arbol)}</p>
          ${sello(p.texto)}
        </div>
        <div class="post-meta">
          ${dia(p.dia)}
          ${mencion()}
          ${queSignifica(p.tema)}
        </div>
      </div>
    </article>`;
  }

  function hilo() {
    const autores = [...new Set(HILO.mensajes.map(m => m.arbol))].map(id => AP.arbolPorId(id));
    const nombres = autores.map(a => a.handle).join(" y ");
    const items = HILO.mensajes.map(m =>
      `<li>${postX({ arbol: m.arbol, texto: m.texto, dia: HILO.dia, tema: m.tema || HILO.tema }, { respondeA: m.respondeA })}</li>`
    ).join("");
    const participa = autores.some(a => a.id === activo.id);
    return `<h3 class="subtitulo-red">Hilo de respuestas entre ${esc(nombres)}</h3>
      <p class="nota">${participa ? "" : `${esc(activo.comun)} no participa en este hilo; se muestra como ejemplo de conversación entre dos árboles de la red. `}En X la conversación ocurre como respuestas entre cuentas, todas en un mismo día.</p>
      <ol class="hilo" aria-label="Hilo de respuestas entre ${esc(nombres)}">${items}</ol>`;
  }

  function x() {
    const posts = window.PUBLICACIONES.filter(p => p.arbol === activo.id);
    return `${selector("x", "X")}
      <div class="marco-red">
        ${perfil(activo, "x")}
        <h3 class="subtitulo-red">Publicaciones de ${esc(activo.handle)}</h3>
        <ul class="lista-x">${posts.map(p => `<li>${postX(p)}</li>`).join("")}</ul>
        ${hilo()}
      </div>`;
  }

  // ---------- Montaje ----------
  document.getElementById("icono-instagram").innerHTML = window.ICONOS.foto;
  document.getElementById("icono-x").innerHTML = window.ICONOS.mensaje;
  const ig = document.getElementById("contenido-instagram");
  ig.innerHTML = instagram();
  activarCarrusel(ig);
  document.getElementById("contenido-x").innerHTML = x();

  // El contenido se genera con JS: al terminar, vuelve a llevar al ancla pedida (#instagram o #x).
  window.addEventListener("load", () => {
    if (!location.hash) return;
    const destino = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (destino) destino.scrollIntoView();
  });
})();
