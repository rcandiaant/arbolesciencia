# Herramientas de mantenimiento

Scripts para regenerar los datos climáticos, la lámina de `como-funciona.html` y las capturas. No forman parte del sitio publicado (`.vercelignore` excluye esta carpeta).

| Herramienta | Para qué | Requiere |
|---|---|---|
| `cr2met/extraer.py` | Descarga de Zenodo solo las celdas pedidas de CR2MET v2.5 (Tmax diaria 1960–2021) | Python 3, `numpy`, `netCDF4` |
| `cr2met/unir.py` | Une las partes mensuales, valida la serie y sugiere el umbral de cada celda | Python 3, `numpy`, `pandas` |
| `gen_clima.py` | Genera `js/clima.js` y `data/` desde la serie diaria | Python 3 (solo biblioteca estándar) |
| `gen_lamina.py` | Regenera los dos SVG de la lámina del sistema en `como-funciona.html` | Python 3 (solo biblioteca estándar) |
| `verificar.mjs` | Verifica el sitio completo y genera las capturas oficiales | Node 18+ y Playwright (`npm install` en esta carpeta) |

Los comandos de abajo se corren desde la raíz de `maqueta-2027`.

## Actualizar los datos climáticos

Hace falta, por ejemplo, si cambia la ubicación de un árbol (el coigüe hoy está en la entrada de la reserva, a la espera del ejemplar definitivo).

**1. Extraer las celdas** (~6,8 GB de tráfico, ~1 hora con 4 hilos; reanudable si se corta):

```
python -I herramientas/cr2met/extraer.py ../cr2met_trabajo "tamarugo=-20.2783,-69.6508;patagua=-33.5833,-70.6333;coigue=-39.93856,-72.0976" 4
```

Cada coordenada se ajusta a la celda CR2MET más cercana (malla de 0,05°) y el script muestra la celda usada. Usa una carpeta de trabajo **fuera del repo** y una carpeta nueva si cambian las celdas. Si la conexión se cae, vuelve a correr el mismo comando: retoma desde el último mes descargado.

**2. Unir y validar:**

```
python -I herramientas/cr2met/unir.py ../cr2met_trabajo ../cr2met_trabajo/serie.csv
```

Comprueba 744 meses, 22.646 días y la ausencia de faltantes, y muestra por celda la Tmax de enero, julio y anual de 1961–1990 y su percentil 90 redondeado. **Ese percentil es el umbral del sitio** (criterio de la maqueta). Revisa además que la celda sea plausible para el árbol: la primera coordenada del coigüe caía en la cumbre del volcán (Tmax anual de 8,6 °C).

**3. Generar los archivos del sitio:**

```
python -I herramientas/gen_clima.py ../cr2met_trabajo/serie.csv --umbrales tamarugo=33,patagua=30,coigue=20 --celdas "tamarugo=-20.275,-69.675;patagua=-33.575,-70.625;coigue=-39.925,-72.075"
```

La serie debe tener las columnas `fecha,tamarugo,patagua,coigue`, y `unir.py` usa los nombres dados en el paso 1. Escribe `js/clima.js`, `data/cr2met_tmax_diaria.csv`, `data/cr2met_resumen.json` y `data/LEEME.txt`. Si cambias una ubicación, actualiza también `lat`/`lng` del árbol en `js/datos.js` (mapa de la ficha).

Para comprobar que todo es reproducible: `python -I herramientas/gen_clima.py data/cr2met_tmax_diaria.csv` regenera exactamente los archivos publicados.

## Editar la lámina del sistema

Cambia los textos en `CAPAS`, `PASOS` o `CHIPS_DATO` de `gen_lamina.py` y corre:

```
python -I herramientas/gen_lamina.py
```

El script calcula el ajuste de líneas y las coordenadas, y reemplaza solo los dos `<svg class="lamina …">` de `como-funciona.html`. El resto de la página no se toca.

## Verificar y regenerar capturas

Una vez:

```
cd herramientas && npm install && npx playwright install chromium && cd ..
```

Cada vez (con el sitio servido en otra terminal, desde la raíz: `python -m http.server 8790`):

```
node herramientas/verificar.mjs
```

Sin argumentos usa `http://localhost:8790/` y guarda las capturas en una carpeta temporal fuera del repo (la indica al empezar). Termina con código 1 si encuentra problemas.

**Capturas oficiales solo en hitos.** Cada regeneración de `capturas/` suma ~10 MB al historial de git, así que se actualizan y se commitean solo en momentos clave (por ejemplo, antes de enviar la postulación), en un commit aparte `chore(capturas): …`:

```
node herramientas/verificar.mjs http://localhost:8790/ capturas
```
