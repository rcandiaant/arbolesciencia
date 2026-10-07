# Árboles Parlantes · Maqueta 2027

Maqueta navegable de **ÁRBOLES PARLANTES: una red social de árboles nativos sensorizados para la divulgación del cambio climático**, presentada por INIA al Concurso Nacional Ciencia Pública – Dispositivos 2027, con CONAF Tarapacá, CONAF Los Ríos y la Universidad de La Serena.

El dispositivo es una red social de árboles con tres elementos que funcionan como una sola experiencia: las **cuentas de los árboles en Instagram y X** (componente central), la **plataforma web** (capa de profundidad) y el **panel interpretativo en terreno** con código QR.

## Orden de lectura sugerido

La maqueta es un recorrido de 7 pasos. Cada página tiene botones "anterior" y "siguiente" y una barra de progreso.

| Paso | Página | Qué muestra |
|---|---|---|
| 1 | `index.html` | Qué es el dispositivo, sus tres elementos y los tres árboles |
| 2 | `panel.html` | El panel junto al árbol, con QR |
| 3 | `acceso.html` | Lo que ve una persona al escanear el QR |
| 4 | `arbol.html` | La ficha del árbol: mapa, variables y "¿Cuántos días como hoy había antes?" |
| 5 | `redes.html` | Las cuentas en Instagram (con carrusel) y X (hilo entre el tamarugo y el coigüe) |
| 6 | `repositorio.html` | Los cuatro niveles de profundidad: mensaje, explicación, cápsula y fuente |
| 7 | `como-funciona.html` | Del sensor al mensaje publicado, con validación del Encargado de contenidos CTCI |

Las páginas 2 a 5 aceptan `?arbol=tamarugo`, `?arbol=coigue` o `?arbol=patagua`.

## Qué es demostración y qué es real

Cada dato lleva su sello en el mismo gráfico o tarjeta.

- **«Dato de demostración»:** valores ilustrativos. Son las series de los sensores (los nodos aún no están instalados) y las publicaciones de ejemplo.
- **«Dato real · CR2MET»:** cifras climáticas extraídas de CR2MET v2.5 (módulo «¿Cuántos días como hoy había antes?», tabla del repositorio y cifras dentro de las publicaciones de ejemplo, que llevan además el sello «Publicación de ejemplo»).
- **Cuentas y handles** (`@tamarugo.pampa`, `@coigue.mocho`, `@patagua.laplatina`): son de ejemplo. Los nombres y la voz definitiva de cada árbol se construyen en talleres de co-diseño.
- **Panel:** la especificación (atril inclinado, cara de 60 × 40 cm, ACM con estructura de acero galvanizado) está sujeta a validación con CONAF y cotización. La URL corta y el audio son de ejemplo.

## Método climático

La comparación histórica se calcula **CR2MET contra CR2MET**: días al año con temperatura máxima sobre un umbral del sitio, en la celda de 0,05° más cercana al árbol, período 1961–1990 frente a 2011–2020. El sensor del nodo no se usa para calcular la anomalía; aporta la respuesta del árbol.

- **Umbral:** el percentil 90 de la temperatura máxima diaria de 1961–1990 en cada celda, redondeado.
- **Décadas:** parten en 1961 (1961–1970 … 2011–2020). La base son las tres primeras y la reciente, la última. CR2MET v2.5 termina en 2021, así que no hay década 2021–2030.
- **Coigüe:** su ubicación es referencial: la entrada de la reserva (guardería CONAF, acceso por Enco, −39,93856; −72,0976 según OpenStreetMap). El ejemplar se define con CONAF Los Ríos.

| Árbol | Celda CR2MET (lat, lon) | Umbral | 1961–1990 | 2011–2020 |
|---|---|---|---|---|
| Tamarugo | −20,275; −69,675 | 33 °C | 30,5 días/año | 58,4 días/año |
| Patagua | −33,575; −70,625 | 30 °C | 29,4 días/año | 60,6 días/año |
| Coigüe | −39,925; −72,075 | 20 °C | 35,9 días/año | 48,6 días/año |

La serie diaria usada (`data/cr2met_tmax_diaria.csv`) y el resumen (`data/cr2met_resumen.json`) se publican con el sitio y se pueden descargar desde el repositorio de contenidos.

## Fuentes

- Garrido M. et al. (2020). *The adjustment of Prosopis tamarugo hydraulic architecture traits has a homeostatic effect over its performance under descent of phreatic level in the Atacama Desert.* Trees 34:89–99. https://doi.org/10.1007/s00468-019-01899-2
- Boisier J. P. (2023). CR2MET v2.5. Zenodo. https://doi.org/10.5281/zenodo.7529682 (CC BY 4.0). Extracción de las celdas: 6 de octubre de 2026.
- Fotos referenciales de cada especie (no son los ejemplares monitoreados), con atribución visible en la maqueta:
  - Tamarugo: Pablo Trincado, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Prosopis_tamarugo.jpg), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).
  - Coigüe: Cesar Ormazabal, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Nothofagus_dombeyi_(Puesco_Bajo,_Araucan%C3%ADa,_Chile).jpg), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), recortada (Puesco Bajo, Araucanía).
  - Patagua: sheriff_woody_pct, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Crinodendron_patagua,_Sendero_Los_Hornos,_Hijuelas,_Valpara%C3%ADso,_Chile_1.jpg), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), recortada (Sendero Los Hornos, Hijuelas).
- Mapa: © colaboradores de OpenStreetMap.

## Ver la maqueta en local

Sitio estático sin build. Desde esta carpeta:

```
python -m http.server 8080
```

y abrir http://localhost:8080. Leaflet y D3 están en `vendor/` (sin CDN). Lo único externo son las teselas del mapa de OpenStreetMap; si no cargan, la ficha muestra la lista de lugares con coordenadas.

## Publicar

Hosting estático en Vercel, conectado al repositorio de GitHub `rcandiaant/arbolesciencia`:

1. En vercel.com, *Add New → Project → Import* el repositorio.
2. Framework preset: **Other**. Sin comando de build. Output directory: la raíz (`.`).
3. Cada push a `main` publica una nueva versión.

Todas las rutas son relativas, así que también funciona en una subcarpeta de cualquier hosting estático.

## Capturas

`capturas/` (excluida del despliegue por `.vercelignore`) tiene cada pantalla a 390 px (móvil) y 1280 px (escritorio), generadas con Playwright.

## Pendientes

- Coordenada del ejemplar de coigüe acordada con CONAF Los Ríos (hoy: entrada de la reserva). Si cambia, hay que volver a extraer su celda CR2MET.
- Fotos de los tres ejemplares monitoreados (hoy hay fotos referenciales de cada especie).
- Foto del nodo de INIA instalado.
- Fuente científica del tema "Por qué el tronco se encoge de día".
- Cápsulas audiovisuales del repositorio y versión en audio del panel.
- Enlace público definitivo (Vercel) para el formulario, sección 2.6.
