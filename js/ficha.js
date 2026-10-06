// Árboles Parlantes · maqueta 2027 · ficha del árbol (plataforma web)
// Requiere datos.js, clima.js, comun.js y graficos.js. Usa AP.escapar al inyectar texto.

(function () {
  const E = s => AP.escapar(s == null ? "" : s);
  const arbol = AP.arbolActual();
  const G = window.GRAFICOS;
  const hayD3 = typeof window.d3 !== "undefined" && G;

  // "1961–1990" -> "1961 y 1990" (para la frase "Entre ... y ...")
  function entre(periodo) {
    return String(periodo || "").replace(/^\s*(\d{4})\s*[–-]\s*(\d{4})\s*$/, "$1 y $2");
  }
  function coordenadas(a) {
    const lat = `${G.num(Math.abs(a.lat), 3)}° ${a.lat < 0 ? "S" : "N"}`;
    const lng = `${G.num(Math.abs(a.lng), 3)}° ${a.lng < 0 ? "O" : "E"}`;
    return `${lat}, ${lng}`;
  }
  // Artículo según el nombre común: "del tamarugo", "de la patagua".
  function del_(a) { return /a$/i.test(a.comun) ? `de la ${a.comun.toLowerCase()}` : `del ${a.comun.toLowerCase()}`; }
  function al_(a) { return /a$/i.test(a.comun) ? `a la ${a.comun.toLowerCase()}` : `al ${a.comun.toLowerCase()}`; }
  function anclaTema(id) {
    const t = (window.TEMAS || []).find(x => x.id === id);
    return t ? t.titulo : "";
  }

  document.title = `${arbol.comun} · Ficha del árbol · Árboles Parlantes (maqueta 2027)`;

  // ---------- Selector de árbol ----------
  document.getElementById("selector-arbol").innerHTML = window.ARBOLES.map(a =>
    `<li><a href="arbol.html?arbol=${encodeURIComponent(a.id)}"${a.id === arbol.id ? ' aria-current="page"' : ""}>
      <span class="punto" style="background:${E(a.color)}" aria-hidden="true"></span>${E(a.comun)}</a></li>`
  ).join("");

  // ---------- 1. Encabezado ----------
  const foto = arbol.foto
    ? `<img class="foto-arbol" src="${E(arbol.foto)}" alt="${E(arbol.fotoAlt || `Foto de ${arbol.comun}`)}">${AP.creditoFoto(arbol)}`
    : `<div class="placeholder-foto foto-arbol" role="img" aria-label="Foto ${E(del_(arbol))} pendiente">Foto ${E(del_(arbol))} – pendiente</div>`;

  document.getElementById("encabezado-arbol").innerHTML = `
    <div class="encabezado-foto">${foto}</div>
    <div class="encabezado-texto">
      <p class="antetitulo">Ficha del árbol</p>
      <h1>${E(arbol.comun)}</h1>
      <p class="especie"><em>${E(arbol.especie)}</em></p>
      <p class="handle handle-ejemplo">${E(arbol.handle)}</p>
      <dl class="datos-arbol">
        <div><dt>Dónde vivo</dt><dd>${E(arbol.lugar)}</dd></div>
        <div><dt>Quién lo administra</dt><dd>${E(arbol.administra)}</dd></div>
        <div><dt>Región</dt><dd>${E(arbol.region)}</dd></div>
        <div><dt>Ecosistema</dt><dd>${E(arbol.ecosistema)}</dd></div>
      </dl>
      ${arbol.nota ? `<p class="nota-arbol">${E(arbol.nota)}</p>` : ""}
      <p class="bio">${E(arbol.bio)}</p>
      <div class="acciones">
        <a class="boton" href="redes.html?arbol=${encodeURIComponent(arbol.id)}">${window.ICONOS.mensaje} Seguir ${E(al_(arbol))} en redes</a>
        <a class="boton secundario" href="acceso.html?arbol=${encodeURIComponent(arbol.id)}">${window.ICONOS.qr} Página de acceso del QR</a>
      </div>
    </div>`;

  // ---------- 2. Mapa ----------
  document.getElementById("lista-lugares").innerHTML = window.ARBOLES.map(a =>
    `<li${a.id === arbol.id ? ' class="actual"' : ""}>
      <span class="punto" style="background:${E(a.color)}" aria-hidden="true"></span>
      <div><strong>${E(a.comun)}</strong>${a.id === arbol.id ? ' <span class="esta-ficha">(esta ficha)</span>' : ""}<br>
      ${E(a.lugar)}, ${E(a.region)}<br>
      <span class="coord">${coordenadas(a)}</span>
      ${a.id === arbol.id ? "" : `<br><a href="arbol.html?arbol=${encodeURIComponent(a.id)}">Ver ficha ${E(del_(a))}</a>`}</div>
    </li>`
  ).join("");

  function iniciarMapa() {
    const cont = document.getElementById("mapa");
    const aviso = document.getElementById("mapa-aviso");
    if (typeof window.L === "undefined") {
      cont.hidden = true;
      aviso.textContent = "El mapa no pudo cargarse. Abajo está la lista de los tres lugares con sus coordenadas.";
      return;
    }
    L.Icon.Default.imagePath = "vendor/leaflet/images/";
    const tactil = L.Browser.mobile || L.Browser.touch && window.matchMedia("(pointer: coarse)").matches;
    const mapa = L.map(cont, {
      scrollWheelZoom: false,
      dragging: !tactil,
      zoomControl: true
    }).setView([arbol.lat, arbol.lng], 6);

    const capa = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">colaboradores de OpenStreetMap</a>'
    }).addTo(mapa);
    let avisado = false;
    capa.on("tileerror", () => {
      if (avisado) return;
      avisado = true;
      aviso.textContent = "No se pudo cargar el fondo del mapa (sin conexión). Los marcadores siguen visibles y abajo está la lista de lugares con coordenadas.";
    });

    window.ARBOLES.forEach(a => {
      const actual = a.id === arbol.id;
      if (actual) {
        L.circleMarker([a.lat, a.lng], { radius: 22, color: a.color, weight: 3, fillColor: a.color, fillOpacity: 0.18, interactive: false }).addTo(mapa);
      }
      const popup = `<strong>${E(a.comun)}</strong> <em>${E(a.especie)}</em><br>${E(a.lugar)}<br>` +
        (actual ? "Estás en esta ficha." : `<a href="arbol.html?arbol=${encodeURIComponent(a.id)}">Ver ficha ${E(del_(a))}</a>`);
      const mk = L.marker([a.lat, a.lng], {
        title: `${a.comun}, ${a.lugar}`, alt: `${a.comun}, ${a.lugar}`,
        zIndexOffset: actual ? 1000 : 0
      }).addTo(mapa).bindPopup(popup, { maxWidth: 230, autoPanPaddingTopLeft: L.point(56, 12), autoPanPaddingBottomRight: L.point(12, 12) });
      if (actual) mapa.whenReady(() => mk.openPopup());
    });

    if (tactil) {
      document.getElementById("mapa-tactil").hidden = false;
    }
  }

  // ---------- 3. Cómo estoy ahora ----------
  const series = {};
  window.VARIABLES.forEach(v => { series[v.id] = hayD3 ? G.serie(arbol, v.id) : []; });

  function formato(v, valor) {
    const dec = G.DECIMALES[v.id] != null ? G.DECIMALES[v.id] : 1;
    return G.num(valor, dec);
  }

  if (hayD3) {
    document.getElementById("tarjetas-variables").innerHTML = window.VARIABLES.map(v => {
      const s = series[v.id];
      const ult = s[s.length - 1].valor;
      return `<li class="tarjeta tarjeta-variable">
        ${AP.selloDemo()}
        <h3>${E(v.nombre)}</h3>
        <p class="valor"><span class="cifra">${E(formato(v, ult))}</span> <span class="unidad">${E(v.unidad)}</span></p>
        <p class="nota">Último valor de la serie. ${E(v.descripcion)}</p>
      </li>`;
    }).join("");
  }

  let variableActiva = "savia";

  function resumenLinea(v, s) {
    const vals = s.map(p => p.valor);
    return `Gráfico de línea con dato de demostración: ${v.nombre} ${del_(arbol)} en los últimos 7 días, valores por hora. ` +
      `Varía entre ${formato(v, d3.min(vals))} y ${formato(v, d3.max(vals))} ${v.unidad}, con un ciclo que se repite cada día. ` +
      `Último valor: ${formato(v, vals[vals.length - 1])} ${v.unidad}.`;
  }

  function dibujarLinea() {
    if (!hayD3) return;
    const v = window.VARIABLES.find(x => x.id === variableActiva);
    const s = series[v.id];
    const resumen = resumenLinea(v, s);
    document.getElementById("titulo-grafico-linea").textContent = `${v.nombre}: últimos 7 días`;
    document.getElementById("desc-grafico-linea").textContent = v.descripcion;
    G.linea(document.getElementById("grafico-linea"), s, {
      variable: v, color: arbol.color, dominio: arbol.demo[v.id], resumen
    });
    const filas = G.resumenDiario(s).map(r =>
      `<tr><th scope="row">${E(r.etiqueta)}</th><td>${E(formato(v, r.min))}</td><td>${E(formato(v, r.max))}</td><td>${E(formato(v, r.media))}</td></tr>`
    ).join("");
    document.getElementById("tabla-linea").innerHTML = `
      <caption>${E(v.nombre)} (${E(v.unidad)}) por día. Dato de demostración.</caption>
      <thead><tr><th scope="col">Día</th><th scope="col">Mínimo</th><th scope="col">Máximo</th><th scope="col">Promedio</th></tr></thead>
      <tbody>${filas}</tbody>`;
  }

  const selloLinea = document.getElementById("sello-linea");
  if (selloLinea) selloLinea.outerHTML = AP.selloDemo();

  if (hayD3) {
    const grupo = document.getElementById("selector-variable");
    grupo.innerHTML = window.VARIABLES.map(v =>
      `<button type="button" class="opcion" data-variable="${E(v.id)}" aria-pressed="${v.id === variableActiva}">${E(v.nombre)}</button>`
    ).join("");
    grupo.addEventListener("click", ev => {
      const b = ev.target.closest("button[data-variable]");
      if (!b) return;
      variableActiva = b.dataset.variable;
      grupo.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      dibujarLinea();
    });
  }

  // ---------- 4. ¿Cuántos días como hoy había antes? ----------
  const C = window.CLIMA;
  const c = C && C.arboles ? C.arboles[arbol.id] : null;

  function dibujarBarras() {
    if (!hayD3 || !c) return;
    const decs = G.decadasCompletas(c);
    const resumen = `Gráfico de barras${C.real ? "" : " con dato de demostración"}: días al año con temperatura máxima sobre ${G.numFlex(c.umbral)} °C ` +
      `en la celda CR2MET más cercana ${al_(arbol)}, por década. ` +
      decs.map(d => `${G.etiquetaDecada(d.decada, false)}: ${G.numFlex(d.dias)}`).join("; ") + ".";
    G.barras(document.getElementById("grafico-barras"), c, { resumen });
  }

  function montarClima() {
    const cont = document.getElementById("modulo-clima");
    if (!c) {
      cont.innerHTML = `<p class="nota">No hay datos climáticos para este árbol.</p>`;
      return;
    }
    const decs = G.decadasCompletas(c);
    const incompletas = decs.filter(G.incompleta);
    const notaIncompleta = incompletas.length
      ? `<p class="nota nota-incompleta">* ${incompletas.map(d => {
          const t = G.textoAnios(d);
          return `La década ${E(G.etiquetaDecada(d.decada, false))} está incompleta${t ? ` (${E(t)})` : ""}: su valor es el promedio de los años disponibles.`;
        }).join(" ")}</p>`
      : "";
    const filas = decs.map(d => {
      const t = G.textoAnios(d);
      return `<tr><th scope="row">${E(G.etiquetaDecada(d.decada, false))}${G.incompleta(d) ? "*" : ""}</th><td>${E(G.numFlex(d.dias))}</td>${t ? `<td>${E(t)}</td>` : "<td></td>"}</tr>`;
    }).join("");

    cont.innerHTML = `
      <figure class="tarjeta figura-grafico">
        <div class="cabeza-grafico">
          <h3 id="titulo-grafico-barras">Días al año sobre ${E(G.numFlex(c.umbral))} °C, por década</h3>
          ${AP.selloClima()}
        </div>
        <p class="frase-clima">Entre ${E(entre(c.base.periodo))} hubo en promedio <strong>${E(G.numFlex(c.base.dias))} días al año</strong> sobre ${E(G.numFlex(c.umbral))} °C; entre ${E(entre(c.reciente.periodo))}, <strong>${E(G.numFlex(c.reciente.dias))}</strong>.</p>
        <div id="grafico-barras" class="grafico"></div>
        <ul class="leyenda" aria-label="Leyenda del gráfico">
          <li><span class="muestra base" aria-hidden="true"></span>Décadas del período de referencia (${E(c.base.periodo)})</li>
          <li><span class="muestra reciente" aria-hidden="true"></span>Década reciente (${E(c.reciente.periodo)})</li>
          <li><span class="muestra linea-promedio" aria-hidden="true"></span>Promedio ${E(c.base.periodo)}: ${E(G.numFlex(c.base.dias))} días al año</li>
        </ul>
        ${notaIncompleta}
        <figcaption class="nota">Celda CR2MET más cercana al árbol (${E(arbol.lugar)}). Umbral del sitio: ${E(G.numFlex(c.umbral))} °C de temperatura máxima diaria.</figcaption>
        <details class="ver-tabla">
          <summary>Ver datos en tabla</summary>
          <table>
            <caption>Días al año sobre ${E(G.numFlex(c.umbral))} °C por década. ${C.real ? "Dato real, CR2MET." : "Dato de demostración."}</caption>
            <thead><tr><th scope="col">Década</th><th scope="col">Días al año</th><th scope="col">Años con datos</th></tr></thead>
            <tbody>${filas}</tbody>
          </table>
        </details>
      </figure>
      <aside class="como-se-calcula" aria-labelledby="titulo-calculo">
        <h3 id="titulo-calculo">Cómo se calcula</h3>
        <ol>
          <li>Usamos CR2MET, una serie climática diaria de temperatura y precipitación para todo Chile continental desde 1960, construida por el Centro de Ciencia del Clima y la Resiliencia (CR2).</li>
          <li>Tomamos la celda de esa grilla más cercana al árbol y contamos, cada año, los días con temperatura máxima sobre ${E(G.numFlex(c.umbral))} °C, el umbral definido para este lugar.</li>
          <li>Comparamos la serie consigo misma: el promedio del período de referencia (${E(c.base.periodo)}) frente a la última década disponible (${E(c.reciente.periodo)}). Así se ve si los días calurosos se volvieron más frecuentes.</li>
          <li>El sensor del nodo no entra en este cálculo. Lo que aporta es la respuesta del árbol en esos días: su flujo de savia y la variación de su tronco.</li>
        </ol>
        <p>Un solo día caluroso no dice nada sobre el clima. Lo que muestra el cambio climático es la frecuencia de esos días a lo largo de décadas.</p>
        <p class="fuente"><strong>Fuente:</strong> ${E(C.fuente)}</p>
        <p class="enlaces-tema">
          <a href="repositorio.html#dias-como-hoy">Más sobre cómo se calcula</a>
          <a href="repositorio.html#tiempo-y-clima">Tiempo y clima: por qué un día caluroso no es el cambio climático</a>
        </p>
      </aside>`;
    dibujarBarras();
  }

  // ---------- 5. Lo que he publicado ----------
  function montarPublicaciones() {
    const pubs = (window.PUBLICACIONES || []).filter(p => p.arbol === arbol.id);
    const lista = document.getElementById("lista-publicaciones");
    if (!pubs.length) {
      lista.outerHTML = `<p class="nota">Este árbol aún no tiene publicaciones de ejemplo.</p>`;
      return;
    }
    lista.innerHTML = pubs.map(p => `
      <li>
        <article class="tarjeta publicacion" aria-label="Publicación de ${E(arbol.comun)}, ${E(p.dia)}">
          <header class="publicacion-cabeza">
            <span class="punto grande" style="background:${E(arbol.color)}" aria-hidden="true"></span>
            <div>
              <p class="publicacion-autor"><strong>${E(arbol.comun)}</strong> <span class="handle handle-ejemplo">${E(arbol.handle)}</span></p>
              <p class="publicacion-dia">${E(p.dia)}</p>
            </div>
          </header>
          <p class="publicacion-sello">${p.tipo === "cambio" ? AP.selloClima() : AP.selloDemo("Publicación de ejemplo")}</p>
          <p class="publicacion-texto">${E(AP.rellenar(p.texto, arbol.id))}</p>
          <p class="mencion-ia">${E(window.MENCION_IA)}</p>
          <p class="publicacion-enlace"><a href="repositorio.html#${encodeURIComponent(p.tema)}">¿Qué significa?<span class="visualmente-oculto"> ${E(anclaTema(p.tema))}</span></a></p>
        </article>
      </li>`).join("");
  }

  // ---------- Montaje ----------
  try { iniciarMapa(); } catch (e) { console.warn("Mapa:", e); }
  if (hayD3) {
    dibujarLinea();
  } else {
    document.getElementById("grafico-linea").innerHTML = `<p class="nota">El gráfico no pudo cargarse.</p>`;
  }
  montarClima();
  montarPublicaciones();

  // Redibujar al cambiar el ancho (sin animaciones ni actualizaciones periódicas).
  let anchoPrevio = window.innerWidth, espera;
  window.addEventListener("resize", () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      if (window.innerWidth === anchoPrevio) return;
      anchoPrevio = window.innerWidth;
      dibujarLinea();
      dibujarBarras();
    }, 150);
  });
})();
