"""Extrae la temperatura máxima diaria (tmax) de CR2MET v2.5 (1960–2021) en celdas puntuales,
mes a mes, desde el zip de Zenodo (registro 7529682, CC BY 4.0) sin descargarlo completo.

Uso:
  python -I extraer.py <dir_trabajo> "<celdas>" [hilos]

  <celdas>  lista "nombre=lat,lon;nombre=lat,lon". Cada coordenada se ajusta a la celda
            CR2MET más cercana (malla de 0,05°, centros en x,x25 / x,x75) y se informa.
  hilos     conexiones simultáneas (por defecto 3, máximo recomendado 4).

Ejemplo (celdas publicadas en la maqueta):
  python -I extraer.py trabajo "tamarugo=-20.2783,-69.6508;patagua=-33.5833,-70.6333;coigue=-39.93856,-72.0976"

Reanudable: cada mes deja <dir_trabajo>/parts/AAAA_MM.csv y los meses existentes se omiten.
Si cambian las celdas, usar un <dir_trabajo> nuevo. Tráfico total: ~6,8 GB; tiempo: ~1 h con 4 hilos.
Requiere: numpy, netCDF4.
"""
import sys, os, io, json, time, zlib, struct, zipfile, threading, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
import numpy as np
import netCDF4 as nc

URL = "https://zenodo.org/api/records/7529682/files/CR2MET_txn_v2.5.zip/content"
UA = "Python-urllib/3.12 (CR2MET research extraction)"

def centro_celda(v):
    """Centro de la celda CR2MET (0,05°) más cercana. En un empate exacto se redondea hacia arriba."""
    return round(np.floor((v - 0.025) / 0.05 + 0.5) * 0.05 + 0.025, 3)

def leer_celdas(espec):
    celdas = []
    for item in espec.split(";"):
        item = item.strip()
        if not item: continue
        nombre, coords = item.split("=")
        la, lo = (float(x) for x in coords.split(","))
        celdas.append((nombre.strip(), centro_celda(la), centro_celda(lo)))
    return celdas

if len(sys.argv) < 3:
    sys.exit(__doc__)
RAW = sys.argv[1]
CELLS = leer_celdas(sys.argv[2])
NTH = int(sys.argv[3]) if len(sys.argv) > 3 else 3
PARTS = os.path.join(RAW, "parts"); os.makedirs(PARTS, exist_ok=True)
LOG = os.path.join(RAW, "progress.log")
lock = threading.Lock()
stats = {"bytes": 0}

def log(msg):
    line = time.strftime("%Y-%m-%d %H:%M:%S ") + msg
    with lock:
        with open(LOG, "a", encoding="utf-8") as f: f.write(line + "\n")
        print(line, flush=True)

def fetch(start, end, tries=8):
    wait = 10
    for k in range(tries):
        try:
            req = urllib.request.Request(URL, headers={"User-Agent": UA, "Range": f"bytes={start}-{end}"})
            with urllib.request.urlopen(req, timeout=120) as r:
                if r.status != 206: raise IOError(f"status {r.status}")
                data = r.read()
            if len(data) != end - start + 1: raise IOError(f"short read {len(data)} vs {end-start+1}")
            with lock: stats["bytes"] += len(data)
            return data
        except Exception as e:
            ra = None
            if isinstance(e, urllib.error.HTTPError):
                ra = e.headers.get("Retry-After")
            w = int(ra) if ra and ra.isdigit() else wait
            log(f"  error red ({e}); reintento {k+1}/{tries} en {w}s")
            time.sleep(w); wait = min(wait * 2, 300)
    raise IOError(f"fallo definitivo rango {start}-{end}")

class RF(io.RawIOBase):
    def __init__(self, size): self.size = size; self.pos = 0
    def seekable(self): return True
    def readable(self): return True
    def tell(self): return self.pos
    def seek(self, off, wh=0):
        self.pos = off if wh == 0 else (self.pos + off if wh == 1 else self.size + off); return self.pos
    def readinto(self, b):
        if self.pos >= self.size: return 0
        end = min(self.pos + len(b), self.size) - 1
        d = fetch(self.pos, end); b[:len(d)] = d; self.pos += len(d); return len(d)

def get_index():
    p = os.path.join(RAW, "index.json")
    if os.path.exists(p): return json.load(open(p))
    req = urllib.request.Request(URL, headers={"User-Agent": UA, "Range": "bytes=0-0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        size = int(r.headers["Content-Range"].split("/")[1])
    z = zipfile.ZipFile(io.BufferedReader(RF(size), buffer_size=1 << 20))
    L = [dict(name=i.filename, off=i.header_offset, csize=i.compress_size, size=i.file_size,
              crc=i.CRC, ct=i.compress_type) for i in z.infolist() if i.filename.endswith(".nc")]
    idx = dict(size=size, members=L)
    json.dump(idx, open(p, "w"))
    return idx

def process(m):
    name = m["name"]; ym = name.split("_day_")[1][:7]  # AAAA_MM
    out = os.path.join(PARTS, ym + ".csv")
    if os.path.exists(out): return ym, 0
    t0 = time.time()
    off, cs = m["off"], m["csize"]
    blob = fetch(off, off + 30 + len(name.encode()) + 512 + cs - 1)
    if blob[:4] != b"PK\x03\x04": raise IOError(f"{ym}: cabecera local inválida")
    n, e = struct.unpack("<HH", blob[26:30])
    ds = 30 + n + e
    if ds + cs > len(blob):
        blob += fetch(off + len(blob), off + ds + cs - 1)
    comp = blob[ds:ds + cs]
    data = zlib.decompressobj(-15).decompress(comp) if m["ct"] == 8 else comp
    if len(data) != m["size"] or (zlib.crc32(data) & 0xffffffff) != m["crc"]:
        raise IOError(f"{ym}: CRC/tamaño no coincide")
    d = nc.Dataset("mem", memory=data)
    v = d["tmax"]
    sf, ao, mv = float(v.scale_factor), float(getattr(v, "add_offset", 0.0)), int(v.missing_value)
    v.set_auto_maskandscale(False)
    lat, lon = d["lat"][:], d["lon"][:]
    tunits = d["time"].units; tt = d["time"][:]
    if not tunits.startswith("days since "): raise IOError(f"{ym}: unidades de tiempo inesperadas {tunits}")
    base = np.datetime64(tunits[len("days since "):].strip()[:10])
    cols = []
    for nm, la, lo in CELLS:
        i = int(np.argmin(abs(lat - la))); j = int(np.argmin(abs(lon - lo)))
        if abs(lat[i] - la) > 1e-6 or abs(lon[j] - lo) > 1e-6: raise IOError(f"{ym}: celda {nm} no encontrada")
        raw = v[:, i, j].astype(np.int64)
        val = np.where(raw == mv, np.nan, raw * sf + ao)
        cols.append(val)
    d.close()
    dates = [str(base + np.timedelta64(int(round(x)), "D")) for x in tt]
    if any(dt[:7].replace("-", "_") != ym for dt in dates): raise IOError(f"{ym}: fechas no corresponden al mes")
    tmp = out + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        nmiss = sum(int(np.isnan(c).sum()) for c in cols)
        f.write(f"# scale_factor={sf!r} add_offset={ao!r} missing={mv} n_missing={nmiss} cols=" + ";".join(c[0] for c in CELLS) + "\n")
        for k, dt in enumerate(dates):
            f.write(dt + "," + ",".join("" if np.isnan(c[k]) else f"{c[k]:.4f}" for c in cols) + "\n")
    os.replace(tmp, out)
    log(f"OK {ym} ({len(dates)} días, {cs/1e6:.1f} MB, {time.time()-t0:.1f}s)")
    return ym, cs

if __name__ == "__main__":
    T0 = time.time()
    for nm, la, lo in CELLS:
        print(f"celda {nm}: lat {la}, lon {lo}")
    idx = get_index()
    mem = sorted(idx["members"], key=lambda m: m["name"])
    log(f"INICIO: {len(mem)} miembros en índice; hechos previos: {len(os.listdir(PARTS))}")
    todo = [m for m in mem if not os.path.exists(os.path.join(PARTS, m["name"].split('_day_')[1][:7] + '.csv'))]
    fails = []
    with ThreadPoolExecutor(NTH) as ex:
        futs = {ex.submit(process, m): m["name"] for m in todo}
        for fu in as_completed(futs):
            try: fu.result()
            except Exception as e:
                fails.append(futs[fu]); log(f"FALLO {futs[fu]}: {e}")
    log(f"FIN: bytes descargados esta corrida={stats['bytes']} ({stats['bytes']/1e9:.3f} GB), "
        f"tiempo={time.time()-T0:.0f}s, fallos={len(fails)}, partes={len([p for p in os.listdir(PARTS) if p.endswith('.csv')])}")
