"""Genera js/clima.js (real: true), data/cr2met_tmax_diaria.csv, data/cr2met_resumen.json y data/LEEME.txt
a partir de la serie diaria de Tmax CR2MET v2.5 de los tres árboles.

Uso (desde la raíz de maqueta-2027):
  python -I herramientas/gen_clima.py <serie.csv> [--umbrales tamarugo=33,patagua=30,coigue=20]
         [--celdas "tamarugo=-20.275,-69.675;patagua=-33.575,-70.625;coigue=-39.925,-72.075"]

  <serie.csv>  columnas fecha, tamarugo, patagua, coigue (°C), 1960-01-01 a 2021-12-31.
               Sale de cr2met/unir.py (renombrando las columnas) o es el propio data/cr2met_tmax_diaria.csv.
  --umbrales   criterio de la maqueta: percentil 90 de 1961–1990 de cada celda, redondeado (lo informa unir.py).
  --celdas     centros de celda CR2MET usados (solo se documentan; no se recalculan aquí).
Los valores por defecto son los publicados. Décadas desde 1961; base 1961–1990; reciente 2011–2020.
Solo usa la biblioteca estándar.
"""
import argparse, csv, json, os
from collections import defaultdict

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LUGAR = {"tamarugo": "la Pampa del Tamarugal", "patagua": "La Platina", "coigue": "Mocho-Choshuenco"}

ap = argparse.ArgumentParser(description="Genera los datos climáticos de la maqueta desde CR2MET.")
ap.add_argument("serie")
ap.add_argument("--umbrales", default="tamarugo=33,patagua=30,coigue=20")
ap.add_argument("--celdas", default="tamarugo=-20.275,-69.675;patagua=-33.575,-70.625;coigue=-39.925,-72.075")
args = ap.parse_args()
umbral = {k: float(v) for k, v in (x.split("=") for x in args.umbrales.split(","))}
celdas = {}
for x in args.celdas.split(";"):
    k, v = x.split("=")
    la, lo = (float(n) for n in v.split(","))
    celdas[k] = {"lat": la, "lon": lo}
assert set(umbral) == set(celdas) == {"tamarugo", "patagua", "coigue"}, "faltan árboles en --umbrales o --celdas"

serie = defaultdict(dict)  # fecha -> {arbol: tmax}
with open(args.serie, encoding="utf-8") as fh:
    for fila in csv.DictReader(fh):
        for aid in ("tamarugo", "patagua", "coigue"):
            serie[fila["fecha"]][aid] = float(fila[aid])
fechas = sorted(serie)
assert len(fechas) == 22646 and fechas[0] == "1960-01-01" and fechas[-1] == "2021-12-31", "serie incompleta"

def dias_por_anio(aid):
    cuenta = defaultdict(int)
    for d in fechas:
        if serie[d][aid] > umbral[aid]:  # estricto
            cuenta[int(d[:4])] += 1
        else:
            cuenta.setdefault(int(d[:4]), 0)
    return cuenta

def promedio(cuenta, a, b):
    return round(sum(cuenta[y] for y in range(a, b + 1)) / (b - a + 1), 1)

arboles = {}
for aid in ("tamarugo", "coigue", "patagua"):
    c = dias_por_anio(aid)
    decadas = [{"decada": f"{a}–{a + 9}", "dias": promedio(c, a, a + 9)} for a in range(1961, 2012, 10)]
    arboles[aid] = {
        "umbral": int(umbral[aid]) if umbral[aid].is_integer() else umbral[aid],
        "base": {"periodo": "1961–1990", "dias": promedio(c, 1961, 1990)},
        "reciente": {"periodo": "2011–2020", "dias": promedio(c, 2011, 2020)},
        "decadas": decadas,
        "celda": celdas[aid],
    }

metodo = ("Días al año con temperatura máxima diaria sobre el umbral del sitio (estrictamente mayor), en la celda CR2MET "
          "de 0,05° más cercana a cada árbol; para el coigüe, la celda más cercana a la entrada de la reserva (guardería CONAF). "
          "El umbral de cada sitio es su percentil 90 de temperatura máxima diaria en 1961–1990, redondeado "
          "(" + ", ".join(f"{int(umbral[a]) if umbral[a].is_integer() else umbral[a]} °C en {LUGAR[a]}" for a in ("tamarugo", "patagua")) + f" y {int(umbral['coigue']) if umbral['coigue'].is_integer() else umbral['coigue']} °C en {LUGAR['coigue']}). "
          "Período de referencia 1961–1990 (las tres primeras décadas) frente a 2011–2020 (la última). "
          "Las décadas parten en 1961; la serie CR2MET v2.5 termina en 2021.")
fuente = ("Boisier, J. P. (2023). CR2MET: A high-resolution precipitation and temperature dataset for the period 1960-2021 "
          "in continental Chile (v2.5). Zenodo. https://doi.org/10.5281/zenodo.7529682")
clima = {
    "real": True,
    "version": "CR2MET v2.5",
    "licencia": "CC BY 4.0",
    "fuente": fuente,
    "metodo": metodo,
    "fecha_extraccion": "2026-10-06",
    "datos": {
        "url": "data/cr2met_tmax_diaria.csv",
        "descripcion": "Temperatura máxima diaria 1960–2021 (°C) en la celda CR2MET de cada árbol.",
    },
    "arboles": arboles,
}

os.makedirs(os.path.join(RAIZ, "data"), exist_ok=True)
with open(os.path.join(RAIZ, "js", "clima.js"), "w", encoding="utf-8", newline="\n") as fh:
    fh.write("// Comparación climática histórica por árbol (CR2MET contra CR2MET).\n"
             "// La anomalía se calcula solo dentro de la serie CR2MET; el nodo aporta la respuesta del árbol.\n"
             "// Archivo GENERADO con herramientas/gen_clima.py desde las series diarias CR2MET v2.5: no editar a mano.\n"
             "window.CLIMA = " + json.dumps(clima, ensure_ascii=False, indent=2) + ";\n")
with open(os.path.join(RAIZ, "data", "cr2met_resumen.json"), "w", encoding="utf-8", newline="\n") as fh:
    json.dump(clima, fh, ensure_ascii=False, indent=2)
with open(os.path.join(RAIZ, "data", "cr2met_tmax_diaria.csv"), "w", encoding="utf-8", newline="\n") as fh:
    fh.write("fecha,tamarugo,patagua,coigue\n")
    for d in fechas:
        s = serie[d]
        fh.write(f"{d},{s['tamarugo']:.2f},{s['patagua']:.2f},{s['coigue']:.2f}\n")

with open(os.path.join(RAIZ, "data", "LEEME.txt"), "w", encoding="utf-8", newline="\n") as fh:
    fh.write("cr2met_tmax_diaria.csv: temperatura máxima diaria (°C), 1960-01-01 a 2021-12-31.\n"
             "Columnas: fecha, tamarugo, patagua, coigue. Celdas CR2MET (lat, lon): "
             + "; ".join(f"{k} ({v['lat']}, {v['lon']})" for k, v in celdas.items()) + ".\n"
             "cr2met_resumen.json: días al año sobre el umbral de cada sitio, por década (1961-2020).\n\n"
             "Fuente: " + fuente + "\nLicencia: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). "
             "Datos extraídos sin modificar los valores; solo se seleccionaron las celdas.\n")

for aid, a in arboles.items():
    print(f"{aid}: umbral {a['umbral']} °C | base {a['base']['dias']} | reciente {a['reciente']['dias']} | "
          f"décadas {[d['dias'] for d in a['decadas']]}")
print("csv KB:", os.path.getsize(os.path.join(RAIZ, "data", "cr2met_tmax_diaria.csv")) // 1024)
