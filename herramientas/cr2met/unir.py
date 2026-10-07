"""Une las partes mensuales de extraer.py en una serie diaria, la valida y sugiere umbrales.

Uso:
  python -I unir.py <dir_trabajo> <salida.csv>

Salida: CSV con columnas fecha + una por celda (°C, 2 decimales), y en pantalla:
  - validaciones (744 meses, 22.646 días, años de 365/366 días, sin faltantes, rango plausible);
  - por celda: Tmax media de enero, julio y anual en 1961–1990 y su percentil 90;
  - días al año sobre el percentil 90 redondeado en 1961–1990 y 2011–2020.
Si alguna validación falla, no escribe el CSV y termina con código 1.
Requiere: numpy, pandas.
"""
import glob, os, sys

import numpy as np
import pandas as pd

if len(sys.argv) < 3:
    sys.exit(__doc__)
RAW, SALIDA = sys.argv[1], sys.argv[2]

partes = sorted(glob.glob(os.path.join(RAW, "parts", "*.csv")))
esperados = [f"{y}_{m:02d}" for y in range(1960, 2022) for m in range(1, 13)]
hechos = {os.path.basename(x)[:7] for x in partes}
faltan = [e for e in esperados if e not in hechos]
print(f"meses: {len(hechos & set(esperados))}/744")
if faltan:
    sys.exit(f"Faltan {len(faltan)} meses (p. ej. {faltan[:5]}): vuelve a correr extraer.py con el mismo directorio.")

# La cabecera de cada parte trae los nombres de las celdas y los faltantes del mes.
cabecera = open(partes[0], encoding="utf-8").readline()
COLS = cabecera.split("cols=")[1].split()[0].split(";")
faltantes = 0
for x in partes:
    h = open(x, encoding="utf-8").readline()
    if "cols=" + ";".join(COLS) not in h:
        sys.exit(f"La parte {x} tiene otras celdas: no mezcles extracciones en un mismo directorio.")
    faltantes += int(h.split("n_missing=")[1].split()[0])

df = pd.concat([pd.read_csv(x, comment="#", header=None, names=["fecha"] + COLS) for x in partes])
df["fecha"] = pd.to_datetime(df["fecha"])
df = df.sort_values("fecha").reset_index(drop=True)

ok = True
completo = pd.date_range("1960-01-01", "2021-12-31", freq="D")
continuo = len(df) == len(completo) and (df["fecha"].values == completo.values).all()
print(f"días: {len(df)} (esperado 22646); continuos y sin duplicados: {continuo}")
ok &= continuo
por_anio = df.groupby(df.fecha.dt.year).size()
malos = {y: n for y, n in por_anio.items() if n != (366 if y % 4 == 0 else 365)}
print(f"años con número de días incorrecto: {malos or 'ninguno'}")
ok &= not malos
nan = int(df[COLS].isna().sum().sum())
print(f"faltantes (-32768) en origen: {faltantes}; NaN tras la lectura: {nan}")
ok &= faltantes == 0 and nan == 0
for c in COLS:
    s = df[c]
    plausible = -30 <= s.min() and s.max() <= 45
    print(f"  {c}: mín {s.min():.2f} °C, máx {s.max():.2f} °C" + ("" if plausible else "  <- FUERA DE RANGO"))
    ok &= plausible
if not ok:
    sys.exit("VALIDACIÓN FALLIDA: no se escribe la salida.")

salida = df[["fecha"] + COLS].copy()
salida["fecha"] = salida["fecha"].dt.strftime("%Y-%m-%d")
salida.to_csv(SALIDA, index=False, float_format="%.2f", encoding="utf-8", lineterminator="\n")
print(f"escrito {SALIDA}")

# Diagnóstico para elegir umbrales (criterio de la maqueta: percentil 90 de 1961–1990, redondeado).
df["anio"], df["mes"] = df.fecha.dt.year, df.fecha.dt.month
base = df[(df.anio >= 1961) & (df.anio <= 1990)]

def dias(col, umbral, a, b):
    sel = df[(df.anio >= a) & (df.anio <= b)]
    return float((sel[col] > umbral).groupby(sel.anio).sum().mean())

print("\nTmax 1961–1990 (°C) y días al año sobre el p90 redondeado")
print(f"{'celda':14s} {'enero':>6s} {'julio':>6s} {'anual':>6s} {'p90':>6s} {'umbral':>6s} {'1961-90':>8s} {'2011-20':>8s}")
for c in COLS:
    p90 = np.percentile(base[c], 90)
    u = int(round(p90))
    print(f"{c:14s} {base[base.mes == 1][c].mean():6.2f} {base[base.mes == 7][c].mean():6.2f} "
          f"{base[c].mean():6.2f} {p90:6.2f} {u:6d} {dias(c, u, 1961, 1990):8.1f} {dias(c, u, 2011, 2020):8.1f}")
