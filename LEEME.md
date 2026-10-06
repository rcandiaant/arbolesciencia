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
- **«Dato real · CR2MET»:** cifras climáticas extraídas de CR2MET. Aparece solo si `js/clima.js` tiene `real: true`; mientras no haya extracción, el módulo climático muestra valores de demostración.
- **Cuentas y handles** (`@tamarugo.pampa`, `@coigue.mocho`, `@patagua.laplatina`): son de ejemplo. Los nombres y la voz definitiva de cada árbol se construyen en talleres de co-diseño.
- **Panel:** dimensiones, material y anclaje están "a definir".

## Método climático

La comparación histórica se calcula **CR2MET contra CR2MET**: días al año con temperatura máxima sobre un umbral del sitio, en la celda más cercana al árbol, período 1961–1990 frente a 2011–2020. El sensor del nodo no se usa para calcular la anomalía; aporta la respuesta del árbol.

## Fuentes

- Garrido M. et al. (2020). *The adjustment of Prosopis tamarugo hydraulic architecture traits has a homeostatic effect over its performance under descent of phreatic level in the Atacama Desert.* Trees 34:89–99. https://doi.org/10.1007/s00468-019-01899-2
- Boisier J. P. (2023). CR2MET v2.5. Zenodo. https://doi.org/10.5281/zenodo.7529682
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

- Datos reales de CR2MET en `js/clima.js`: hoy son valores de demostración. CR2MET v2.5 está en Zenodo (~6,8 GB de Tmax diaria); se extraen solo las celdas de los tres árboles.
- Fotos de los tres ejemplares monitoreados (hoy hay fotos referenciales de cada especie).
- Foto del nodo de INIA instalado.
- Dimensiones, material y anclaje del panel.
- Fuente científica del tema "Por qué el tronco se encoge de día".
- Cápsulas audiovisuales del repositorio.
- Enlace público definitivo (Vercel) para el formulario, sección 2.6.
