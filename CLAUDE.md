# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Maqueta 2027 de "Árboles Parlantes" (INIA) para el Concurso Ciencia Pública – Dispositivos 2027. Es un sitio estático (HTML/CSS/JS plano, sin build) que Vercel publica en https://maquetaarbolesciencia.vercel.app desde `main` del repo `rcandiaant/arbolesciencia` (push directo a `main`, sin PR). La fuente de verdad del contenido es `../Postulación 2027/Formulario_postulacion_2027.md` (solo los bloques `>`), y el encargo original está en `../Postulación 2027/Prompt_ClaudeCode_maqueta_2027.md`.

**Alcance:** solo esta carpeta. El Formulario, el guion y los demás documentos de `../Postulación 2027/` los mantiene otro agente: se consultan como fuente de contenido, pero no se editan ni se proponen cambios. La maqueta 2025 vive en `../maqueta/` y no se toca.

## Ejecutar y verificar

```
python -m http.server 8790                    # desde esta carpeta; abrir http://localhost:8790
node herramientas/verificar.mjs               # en otra terminal; antes, una vez: cd herramientas && npm install
```

No hay tests. `herramientas/verificar.mjs` es la verificación: carga cada página a 390 y 1280 px y revisa errores de consola, scroll horizontal, enlaces y anclas internas, rayas largas (—), marcadores `{…}` sin rellenar, `alt`, recursos externos y un solo `h1`; además regenera `capturas/`. Para probar sin tocar las capturas oficiales, pásale otra carpeta como segundo argumento. Después de cada cambio visible se regeneran las capturas y van en un commit aparte (`chore(capturas): …`). Tras el push, el despliegue se confirma con la API de deployments de GitHub (entorno `Production – maquetaarbolesciencia`) y leyendo el archivo cambiado en la URL pública. Las URL con hash de Vercel están protegidas: el evaluador solo puede abrir la URL de producción.

`herramientas/` (excluida del despliegue) también tiene el pipeline de datos climáticos (`cr2met/extraer.py` → `cr2met/unir.py` → `gen_clima.py`) y `gen_lamina.py`; el paso a paso está en `herramientas/LEEME.md`.

## Arquitectura

- **Recorrido de 7 pasos**, definido en `window.PASOS` (`js/comun.js`): Presentación (index) → panel → acceso → arbol → redes → repositorio → Funcionamiento (como-funciona). Cada página tiene `<main id="contenido"><div class="contenedor">` y al final llama a `AP.montar()`, que inserta cabecera, barra de pasos, navegación anterior/siguiente y pie. `?arbol=<id>` selecciona el árbol y `AP.enlace()` lo conserva al navegar.
- **Orden de scripts obligatorio:** (vendor) → `js/datos.js` → `js/clima.js` → `js/comun.js` → script de la página → `AP.montar()`. Todo se comparte por `window`.
- **`js/datos.js`** es la única fuente de contenido:
  - `ARBOLES`: tamarugo, coigue y patagua, con coordenadas, `genero` ("m"/"f"), bio, `nota` opcional, rangos `demo` por variable y `credito` de foto cuando la licencia lo exige.
  - `VARIABLES`: con `unidad` (sigla) y `unidadTexto` (en palabras).
  - `TEMAS`: sus `id` son las anclas de `repositorio.html`.
  - `PUBLICACIONES` e `HILO`.
  - Los textos usan marcadores `{umbral}`, `{base}`, `{reciente}`, `{diferencia}`, `{periodoBase}`, `{periodoReciente}` o `{campo:idArbol}`, que resuelve `AP.rellenar(texto, idArbol)` (días redondeados a entero).
- **`js/clima.js` es un archivo GENERADO** por `herramientas/gen_clima.py` desde la serie diaria CR2MET v2.5 (`data/cr2met_tmax_diaria.csv`, que se publica y se descarga desde el repositorio). No se edita a mano. Trae `real: true`, el umbral de cada árbol (p90 de 1961–1990 redondeado), la base 1961–1990, la reciente 2011–2020 y 6 décadas desde 1961. `js/graficos.js` descarta las décadas incompletas.
- **Ayudantes de `AP` (comun.js) que hay que usar:**
  - `AP.el_ / del_ / al_(arbol)`: artículos según el género ("de la patagua"). Nunca concatenar "del " + nombre.
  - `AP.selloDemo()`, `AP.selloReal()`, `AP.selloClima()` (gráficos y tablas climáticas).
  - `AP.selloPublicacion(textoOriginal)`: las publicaciones siempre llevan "Publicación de ejemplo" y, si traen cifras CR2MET, además "Cifras climáticas reales · CR2MET".
  - `AP.creditoFoto(arbol)`: atribución visible de las fotos con licencia.
- **Estilos:** `css/maqueta.css` (tokens y componentes compartidos) + un CSS por página (`paginas-intro.css` para index/panel/acceso, `ficha.css`, `redes.css`, `repositorio.css`, `como-funciona.css`).
- **`vendor/`:** Leaflet 1.9.4 y D3 7.9.0 locales. Nunca usar CDN ni fuentes web. Los controles del mapa se rotulan en español en `js/ficha.js`.
- **Láminas de `como-funciona.html`:** son dos SVG (horizontal ≥900 px, vertical en móvil) generados por `herramientas/gen_lamina.py`. Para cambiar sus textos se edita el script y se vuelve a correr; no se editan las coordenadas a mano.
- **Coigüe:** su ubicación es referencial (entrada de la reserva, guardería CONAF). Si cambia, hay que volver a extraer su celda CR2MET (ver `herramientas/LEEME.md`).

## Reglas de contenido (no negociables)

- Todo dato simulado lleva su sello en el mismo elemento, nunca como advertencia general. Nada de timestamps, likes, seguidores ni contadores inventados.
- La anomalía climática se calcula solo dentro de CR2MET; nunca se compara el sensor con la grilla ni se escribe "hoy hizo X °C más que lo normal".
- Cada publicación muestra `window.MENCION_IA` y un enlace "¿Qué significa?" a `repositorio.html#<tema>`.
- Sin logos reales de Instagram, X ni del Ministerio (usar `window.ICONOS`). El proyecto no está adjudicado: no se escribe "Financiado por" como hecho. Los nombres de usuario se rotulan como de ejemplo (`.handle-ejemplo`).
- No se inventan dimensiones, cifras, fauna ni fuentes; lo desconocido va con `.pendiente`.
- Fotos solo con licencia verificada (revisar en la ficha de Commons que no diga `Not-PD-US`); las CC BY llevan atribución visible. No se usan imágenes de sensores de terceros.

## Estilo de redacción (acordado con el usuario)

- Español de Chile, lenguaje claro, sin tecnicismos en los mensajes de los árboles ("los poros de mis hojas", no *estomas*).
- Sin rayas largas (—) como inciso y sin frases "no es X, es Y".
- **Títulos y etiquetas como frases nominales, sin interrogativos** ("Mi ubicación", "El cálculo, paso a paso", "Lo que le estamos midiendo"). Los interrogativos solo van dentro de una oración ("explica qué le están midiendo") o en preguntas reales con signos ("¿Qué significa?").
- Unidades en palabras con la sigla entre paréntesis: "litros por hora (L/h)", "grados Celsius (°C)".
- Cifras climáticas con años y umbral explícitos: "entre 1961 y 1990 había N días al año con más de X °C".
- "Simulación" y "nombres de usuario", no *mockup* ni *handles*. Prefijos unidos: "codiseño", "antigrafiti" (con guion solo ante sigla: "anti-UV").
- Accesibilidad: `lang="es"`, `alt` en imágenes, contraste AA, teclado, objetivos táctiles ≥44 px y gráficos con alternativa en tabla.
- Los cambios se presentan como plan y se aplican solo con aprobación. Commits en Conventional Commits, en español.
