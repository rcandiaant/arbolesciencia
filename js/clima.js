// Comparación climática histórica por árbol (CR2MET contra CR2MET).
// La anomalía se calcula solo dentro de la serie CR2MET; el nodo aporta la respuesta del árbol.
// Archivo GENERADO con herramientas/gen_clima.py desde las series diarias CR2MET v2.5: no editar a mano.
window.CLIMA = {
  "real": true,
  "version": "CR2MET v2.5",
  "licencia": "CC BY 4.0",
  "fuente": "Boisier, J. P. (2023). CR2MET: A high-resolution precipitation and temperature dataset for the period 1960-2021 in continental Chile (v2.5). Zenodo. https://doi.org/10.5281/zenodo.7529682",
  "metodo": "Días al año con temperatura máxima diaria sobre el umbral del sitio (estrictamente mayor), en la celda CR2MET de 0,05° más cercana a cada árbol; para el coigüe, la celda más cercana a la entrada de la reserva (guardería CONAF). El umbral de cada sitio es su percentil 90 de temperatura máxima diaria en 1961–1990, redondeado (33 °C en la Pampa del Tamarugal, 30 °C en La Platina y 20 °C en Mocho-Choshuenco). Período de referencia 1961–1990 (las tres primeras décadas) frente a 2011–2020 (la última). Las décadas parten en 1961; la serie CR2MET v2.5 termina en 2021.",
  "fecha_extraccion": "2026-10-06",
  "datos": {
    "url": "data/cr2met_tmax_diaria.csv",
    "descripcion": "Temperatura máxima diaria 1960–2021 (°C) en la celda CR2MET de cada árbol."
  },
  "arboles": {
    "tamarugo": {
      "umbral": 33,
      "base": {
        "periodo": "1961–1990",
        "dias": 30.5
      },
      "reciente": {
        "periodo": "2011–2020",
        "dias": 58.4
      },
      "decadas": [
        {
          "decada": "1961–1970",
          "dias": 31.5
        },
        {
          "decada": "1971–1980",
          "dias": 30.4
        },
        {
          "decada": "1981–1990",
          "dias": 29.6
        },
        {
          "decada": "1991–2000",
          "dias": 40.3
        },
        {
          "decada": "2001–2010",
          "dias": 41.0
        },
        {
          "decada": "2011–2020",
          "dias": 58.4
        }
      ],
      "celda": {
        "lat": -20.275,
        "lon": -69.675
      }
    },
    "coigue": {
      "umbral": 20,
      "base": {
        "periodo": "1961–1990",
        "dias": 35.9
      },
      "reciente": {
        "periodo": "2011–2020",
        "dias": 48.6
      },
      "decadas": [
        {
          "decada": "1961–1970",
          "dias": 33.6
        },
        {
          "decada": "1971–1980",
          "dias": 32.5
        },
        {
          "decada": "1981–1990",
          "dias": 41.6
        },
        {
          "decada": "1991–2000",
          "dias": 37.3
        },
        {
          "decada": "2001–2010",
          "dias": 40.0
        },
        {
          "decada": "2011–2020",
          "dias": 48.6
        }
      ],
      "celda": {
        "lat": -39.925,
        "lon": -72.075
      }
    },
    "patagua": {
      "umbral": 30,
      "base": {
        "periodo": "1961–1990",
        "dias": 29.4
      },
      "reciente": {
        "periodo": "2011–2020",
        "dias": 60.6
      },
      "decadas": [
        {
          "decada": "1961–1970",
          "dias": 30.4
        },
        {
          "decada": "1971–1980",
          "dias": 23.1
        },
        {
          "decada": "1981–1990",
          "dias": 34.7
        },
        {
          "decada": "1991–2000",
          "dias": 46.8
        },
        {
          "decada": "2001–2010",
          "dias": 36.7
        },
        {
          "decada": "2011–2020",
          "dias": 60.6
        }
      ],
      "celda": {
        "lat": -33.575,
        "lon": -70.625
      }
    }
  }
};
