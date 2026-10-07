// Árboles Parlantes · maqueta 2027 · gráficos de la ficha del árbol (D3 v7)
// Series de demostración DETERMINISTAS: misma semilla (árbol + variable) => misma serie en cada visita.
// No hay setInterval ni simulación de "tiempo real".

window.GRAFICOS = (function () {
  // ---------- Formato numérico (es-CL) ----------
  function num(n, dec) {
    return Number(n).toLocaleString("es-CL", { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/^-/, "−");
  }
  function numFlex(n) {
    return Number(n).toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 1 }).replace(/^-/, "−");
  }
  const DECIMALES = { savia: 2, diametro: 0, suelo: 1, temperatura: 1, humedad: 0 };
  const locale = d3.formatLocale({ decimal: ",", thousands: ".", grouping: [3], currency: ["$", ""], minus: "−" });

  // ---------- Generador determinista ----------
  function hash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const DIAS = 7;
  const HORA_FINAL_HOY = 15; // la serie de "hoy" llega hasta media tarde (índice horario, no una hora real)
  const N = (DIAS - 1) * 24 + HORA_FINAL_HOY + 1;
  const ETIQUETAS_DIA = ["hace 6 días", "hace 5 días", "hace 4 días", "hace 3 días", "hace 2 días", "ayer", "hoy"];

  // Factor de cada día (nubosidad, viento): compartido por todas las variables de un mismo árbol.
  function factoresDia(arbolId) {
    const r = mulberry32(hash(arbolId + ":dias"));
    return Array.from({ length: DIAS }, () => 0.72 + 0.28 * r());
  }

  // Devuelve [{i, dia, hora, valor}] con 7 días horarios dentro de arbol.demo[variable].
  function serie(arbol, variableId) {
    const rango = (arbol.demo && arbol.demo[variableId]) || [0, 1];
    const lo = rango[0], hi = rango[1], r = hi - lo;
    const rnd = mulberry32(hash(arbol.id + ":" + variableId));
    const fd = factoresDia(arbol.id);
    const gauss = (h, c, s) => Math.exp(-0.5 * Math.pow((h - c) / s, 2));
    const datos = [];
    for (let i = 0; i < N; i++) {
      const dia = Math.floor(i / 24), h = i % 24, f = fd[dia];
      const ciclo = 0.5 + 0.5 * Math.sin(2 * Math.PI * (h - 9) / 24); // mínimo ~3 h, máximo ~15 h
      const ruido = rnd() - 0.5;
      let v;
      switch (variableId) {
        case "temperatura":
          v = lo + r * (0.05 + 0.9 * ciclo * f) + ruido * 0.03 * r; break;
        case "humedad": // en oposición de fase con la temperatura
          v = hi - r * (0.05 + 0.9 * ciclo * f) + ruido * 0.04 * r; break;
        case "savia": // cero de noche, máximo a media tarde
          v = (h >= 7 && h <= 20) ? hi * 0.97 * f * gauss(h, 14, 2.6) * (1 + ruido * 0.1) : 0;
          if (v < 0.02 * hi) v = 0;
          break;
        case "diametro": // se contrae de día, se recupera de noche
          v = hi - r * (0.08 + 0.85 * f * gauss(h, 15, 3.5)) + ruido * 0.02 * r; break;
        case "suelo": // cambia lento: desciende poco a poco con el consumo diurno
          v = hi - r * (0.1 + 0.55 * (i / N)) - r * 0.04 * gauss(h, 14, 3) + ruido * 0.01 * r; break;
        default:
          v = lo + r * ciclo;
      }
      v = Math.max(lo, Math.min(hi, v));
      datos.push({ i, dia, hora: h, valor: v });
    }
    return datos;
  }

  // Resumen por día para la tabla alternativa.
  function resumenDiario(datos) {
    return ETIQUETAS_DIA.map((etq, d) => {
      const vs = datos.filter(p => p.dia === d).map(p => p.valor);
      return { etiqueta: etq, min: d3.min(vs), max: d3.max(vs), media: d3.mean(vs) };
    });
  }

  function crearSvg(cont, ancho, alto) {
    d3.select(cont).selectAll("svg").remove();
    return d3.select(cont).append("svg")
      .attr("viewBox", `0 0 ${ancho} ${alto}`)
      .attr("width", "100%")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("role", "img");
  }

  // ---------- Gráfico de línea (7 días horarios) ----------
  function linea(cont, datos, opc) {
    const ancho = Math.max(280, Math.round(cont.clientWidth || 600));
    const estrecho = ancho < 520;
    const alto = estrecho ? 260 : 320;
    const m = { top: 30, right: 20, bottom: 40, left: estrecho ? 46 : 56 };
    const dec = DECIMALES[opc.variable.id] != null ? DECIMALES[opc.variable.id] : 1;

    const svg = crearSvg(cont, ancho, alto).attr("aria-label", opc.resumen);
    const x = d3.scaleLinear().domain([0, N - 1]).range([m.left, ancho - m.right]);
    const y = d3.scaleLinear().domain(opc.dominio).nice().range([alto - m.bottom, m.top]);

    // Divisiones entre días y etiquetas relativas
    const g = svg.append("g").attr("class", "eje-x").attr("aria-hidden", "true");
    for (let d = 0; d < DIAS; d++) {
      const ini = d * 24, fin = Math.min(d * 24 + 23, N - 1);
      if (d > 0) g.append("line").attr("class", "division-dia").attr("x1", x(ini)).attr("x2", x(ini)).attr("y1", m.top).attr("y2", alto - m.bottom);
      const mostrar = !estrecho || d % 2 === 0;
      if (mostrar) {
        g.append("text").attr("x", x((ini + fin) / 2)).attr("y", alto - m.bottom + 22)
          .attr("text-anchor", "middle").text(ETIQUETAS_DIA[d]);
      }
    }
    g.append("line").attr("class", "linea-base").attr("x1", m.left).attr("x2", ancho - m.right)
      .attr("y1", alto - m.bottom).attr("y2", alto - m.bottom);

    const ejeY = svg.append("g").attr("class", "eje-y").attr("aria-hidden", "true")
      .attr("transform", `translate(${m.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(-(ancho - m.left - m.right)).tickFormat(locale.format(dec > 0 && (opc.dominio[1] - opc.dominio[0]) < 10 ? ",.1f" : ",d")));
    ejeY.select(".domain").remove();
    ejeY.selectAll(".tick line").attr("class", "rejilla-y");
    ejeY.selectAll("text").attr("x", -6);

    svg.append("text").attr("class", "unidad-eje").attr("aria-hidden", "true")
      .attr("x", 4).attr("y", 16).text(`${opc.variable.nombre} (${opc.variable.unidad})`);

    const linea = d3.line().x(p => x(p.i)).y(p => y(p.valor)).curve(d3.curveMonotoneX);
    svg.append("path").datum(datos).attr("class", "trazo").attr("fill", "none")
      .attr("stroke", opc.color).attr("stroke-width", 2.2).attr("stroke-linejoin", "round").attr("d", linea);

    const ult = datos[datos.length - 1];
    svg.append("circle").attr("cx", x(ult.i)).attr("cy", y(ult.valor)).attr("r", 4.5)
      .attr("fill", opc.color).attr("stroke", "#fff").attr("stroke-width", 2);
    return { decimales: dec };
  }

  // ---------- Barras por década ----------
  // Década incluida en un período si al menos 5 de sus años caen dentro.
  function anios(periodo) {
    const m = String(periodo || "").match(/(\d{4})\D+(\d{4})/);
    return m ? [Number(m[1]), Number(m[2])] : null;
  }
  function inicioDecada(etq) {
    const m = String(etq).match(/(\d{4})/);
    return m ? Number(m[1]) : null;
  }
  function dentro(decada, periodo) {
    const p = anios(periodo), s = inicioDecada(decada);
    if (!p || s == null) return false;
    const solape = Math.min(s + 9, p[1]) - Math.max(s, p[0]) + 1;
    return solape >= 5;
  }
  // Tolerante a distintas formas de marcar una década incompleta.
  function incompleta(d) {
    if (d.incompleta || d.parcial || d.completa === false) return true;
    if (typeof d.anios === "number" && d.anios < 10) return true;
    if (Array.isArray(d.anios) && d.anios.length > 0 && d.anios.length < 10) return true;
    if (typeof d.anios === "string") {
      const p = anios(d.anios);
      if (p && p[1] - p[0] + 1 < 10) return true;
    }
    return false;
  }
  function textoAnios(d) {
    if (typeof d.anios === "string") return d.anios;
    if (Array.isArray(d.anios) && d.anios.length) return d.anios.length > 1 ? `${d.anios[0]}–${d.anios[d.anios.length - 1]}` : String(d.anios[0]);
    if (typeof d.anios === "number") return `${d.anios} ${d.anios === 1 ? "año" : "años"}`;
    return "";
  }
  // Acepta "1960s" (década de calendario) o "1961–1970" (década que parte en 1961).
  function etiquetaDecada(etq, corta) {
    const p = anios(etq);
    if (p) return corta ? `${String(p[0]).slice(2)}–${String(p[1]).slice(2)}` : `${p[0]}–${String(p[1]).slice(2)}`;
    const s = inicioDecada(etq);
    if (s == null) return String(etq);
    return corta ? String(s) : `${s}–${String(s + 9).slice(2)}`;
  }
  // Solo décadas completas: la serie CR2MET v2.5 termina en 2021, así que 2020–29 no se muestra.
  function decadasCompletas(c) {
    return (c.decadas || []).filter(d => !incompleta(d));
  }

  function barras(cont, c, opc) {
    const ancho = Math.max(280, Math.round(cont.clientWidth || 600));
    const estrecho = ancho < 520;
    const alto = estrecho ? 270 : 320;
    const m = { top: 30, right: 12, bottom: 40, left: 44 };
    const datos = decadasCompletas(c);

    const svg = crearSvg(cont, ancho, alto).attr("aria-label", opc.resumen);
    const x = d3.scaleBand().domain(datos.map(d => d.decada)).range([m.left, ancho - m.right]).padding(0.22);
    const maximo = d3.max(datos, d => Number(d.dias)) || 1;
    const y = d3.scaleLinear().domain([0, Math.max(maximo, c.base ? c.base.dias : 0) * 1.18]).nice().range([alto - m.bottom, m.top]);

    const defs = svg.append("defs");
    defs.append("pattern").attr("id", "rayado-incompleta").attr("patternUnits", "userSpaceOnUse")
      .attr("width", 8).attr("height", 8).attr("patternTransform", "rotate(45)")
      .append("rect").attr("width", 4).attr("height", 8).attr("fill", "#8a4b14");

    const ejeY = svg.append("g").attr("class", "eje-y").attr("aria-hidden", "true")
      .attr("transform", `translate(${m.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(-(ancho - m.left - m.right)).tickFormat(locale.format(",d")));
    ejeY.select(".domain").remove();
    ejeY.selectAll(".tick line").attr("class", "rejilla-y");
    ejeY.selectAll("text").attr("x", -6);

    svg.append("text").attr("class", "unidad-eje").attr("aria-hidden", "true").attr("x", 4).attr("y", 16)
      .text(`Días al año sobre ${numFlex(c.umbral)} °C`);

    const clase = d => {
      if (c.reciente && dentro(d.decada, c.reciente.periodo)) return "barra reciente";
      if (c.base && dentro(d.decada, c.base.periodo)) return "barra base";
      return "barra";
    };

    const grupo = svg.append("g").attr("aria-hidden", "true");
    // Línea del promedio del período de referencia
    if (c.base && c.base.dias != null) {
      const yb = y(Number(c.base.dias));
      grupo.append("line").attr("class", "promedio-base").attr("aria-hidden", "true")
        .attr("x1", m.left).attr("x2", ancho - m.right).attr("y1", yb).attr("y2", yb);
    }
    grupo.selectAll("rect.barra").data(datos).join("rect")
      .attr("class", clase)
      .attr("x", d => x(d.decada)).attr("width", x.bandwidth())
      .attr("y", d => y(Number(d.dias))).attr("height", d => y(0) - y(Number(d.dias)))
      .attr("rx", 3);
    grupo.selectAll("rect.rayado").data(datos.filter(incompleta)).join("rect")
      .attr("class", "rayado").attr("fill", "url(#rayado-incompleta)").attr("opacity", 0.55)
      .attr("x", d => x(d.decada)).attr("width", x.bandwidth())
      .attr("y", d => y(Number(d.dias))).attr("height", d => y(0) - y(Number(d.dias)));
    grupo.selectAll("text.valor").data(datos).join("text")
      .attr("class", "valor").attr("text-anchor", "middle")
      .attr("x", d => x(d.decada) + x.bandwidth() / 2).attr("y", d => y(Number(d.dias)) - 6)
      .text(d => numFlex(d.dias));
    grupo.selectAll("text.decada").data(datos).join("text")
      .attr("class", "decada").attr("text-anchor", "middle")
      .attr("x", d => x(d.decada) + x.bandwidth() / 2).attr("y", alto - m.bottom + 20)
      .text(d => etiquetaDecada(d.decada, estrecho) + (incompleta(d) ? "*" : ""));
    svg.append("line").attr("class", "linea-base").attr("x1", m.left).attr("x2", ancho - m.right)
      .attr("y1", y(0)).attr("y2", y(0));

  }

  return { serie, resumenDiario, linea, barras, incompleta, decadasCompletas, textoAnios, etiquetaDecada, dentro, num, numFlex, DECIMALES, ETIQUETAS_DIA };
})();
