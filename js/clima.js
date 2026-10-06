// Comparación climática histórica por árbol (CR2MET contra CR2MET).
// La anomalía se calcula solo dentro de la serie CR2MET; el nodo aporta la respuesta del árbol.
// real: false  -> valores de demostración, se muestran con el sello "Dato de demostración".
// Cuando existan valores extraídos de CR2MET, este archivo se regenera desde data/cr2met_resumen.json.
window.CLIMA = {
  real: false,
  fuente: "Boisier, J. P. (2023). CR2MET: A high-resolution precipitation and temperature dataset for the period 1960-2021 in continental Chile (v2.5). Zenodo. https://doi.org/10.5281/zenodo.7529682",
  metodo: "Días al año con temperatura máxima diaria sobre el umbral del sitio, en la celda CR2MET más cercana al árbol. Período de referencia 1961–1990 (las tres primeras décadas) frente a 2011–2020 (la última). Las décadas parten en 1961; la serie CR2MET v2.5 termina en 2021.",
  arboles: {
    tamarugo: {
      umbral: 30,
      base: { periodo: "1961–1990", dias: 0 },
      reciente: { periodo: "2011–2020", dias: 0 },
      decadas: [
        { decada: "1961–1970", dias: 0 }, { decada: "1971–1980", dias: 0 }, { decada: "1981–1990", dias: 0 },
        { decada: "1991–2000", dias: 0 }, { decada: "2001–2010", dias: 0 }, { decada: "2011–2020", dias: 0 }
      ]
    },
    coigue: {
      umbral: 25,
      base: { periodo: "1961–1990", dias: 0 },
      reciente: { periodo: "2011–2020", dias: 0 },
      decadas: [
        { decada: "1961–1970", dias: 0 }, { decada: "1971–1980", dias: 0 }, { decada: "1981–1990", dias: 0 },
        { decada: "1991–2000", dias: 0 }, { decada: "2001–2010", dias: 0 }, { decada: "2011–2020", dias: 0 }
      ]
    },
    patagua: {
      umbral: 30,
      base: { periodo: "1961–1990", dias: 0 },
      reciente: { periodo: "2011–2020", dias: 0 },
      decadas: [
        { decada: "1961–1970", dias: 0 }, { decada: "1971–1980", dias: 0 }, { decada: "1981–1990", dias: 0 },
        { decada: "1991–2000", dias: 0 }, { decada: "2001–2010", dias: 0 }, { decada: "2011–2020", dias: 0 }
      ]
    }
  }
};

// Valores de demostración (crecientes, plausibles en forma pero NO medidos). Se usan solo si real === false.
(function rellenarDemo() {
  if (window.CLIMA.real) return;
  const demo = {
    tamarugo: [38, 41, 44, 52, 58, 66],
    coigue:   [4, 5, 5, 7, 9, 12],
    patagua:  [22, 24, 27, 33, 39, 46]
  };
  Object.keys(demo).forEach(id => {
    const a = window.CLIMA.arboles[id];
    demo[id].forEach((d, i) => { a.decadas[i].dias = d; });
    a.base.dias = Math.round((demo[id][0] + demo[id][1] + demo[id][2]) / 3);
    a.reciente.dias = demo[id][5];
  });
})();
