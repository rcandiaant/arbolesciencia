# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

Maqueta 2027 de "Árboles Parlantes" (INIA) para el Concurso Ciencia Pública – Dispositivos 2027. Es un sitio estático (HTML/CSS/JS plano, sin build ni dependencias npm) que se publica en Vercel desde `main` del repo `rcandiaant/arbolesciencia`. La fuente de verdad del contenido es `../Postulación 2027/Formulario_postulacion_2027.md` (solo los bloques `>`) y el encargo está en `../Postulación 2027/Prompt_ClaudeCode_maqueta_2027.md`. La maqueta 2025 vive en `../maqueta/` y no se toca.

## Ejecutar y verificar

```
python -m http.server 8080        # desde esta carpeta; abrir http://localhost:8080
```

No hay tests. La verificación se hace con Playwright (instalado global, v1.63): cargar cada página a 390 px y 1280 px y revisar errores de consola, scroll horizontal (`scrollWidth <= innerWidth`), enlaces y anclas internas, ausencia de rayas largas (—) y de marcadores `{…}` sin rellenar. Las capturas oficiales van en `capturas/<nn>-<pagina>-<movil-390|escritorio-1280>.png`.

## Arquitectura

- **Recorrido de 7 pasos**, definido en `window.PASOS` (`js/comun.js`): index → panel → acceso → arbol → redes → repositorio → como-funciona. Cada página tiene `<main id="contenido"><div class="contenedor">` y al final llama a `AP.montar()`, que inserta cabecera, barra de pasos, navegación anterior/siguiente y pie. `?arbol=<id>` selecciona el árbol y `AP.enlace()` lo conserva al navegar.
- **Orden de scripts obligatorio:** (vendor) → `js/datos.js` → `js/clima.js` → `js/comun.js` → script de la página → `AP.montar()`. Todo se comparte por `window`.
- **`js/datos.js`** es la única fuente de contenido: `ARBOLES` (3 árboles: tamarugo, coigue, patagua; coordenadas, bio, rangos `demo` por variable, `credito` de foto si la licencia lo exige), `VARIABLES`, `TEMAS` (sus `id` son las anclas de `repositorio.html`), `PUBLICACIONES` e `HILO`. Los textos usan marcadores `{umbral}`, `{base}`, `{reciente}`, `{periodoBase}`, `{periodoReciente}` o `{campo:idArbol}`, que resuelve `AP.rellenar(texto, idArbol)`.
- **`js/clima.js`** define `window.CLIMA` (comparación CR2MET contra CR2MET por árbol: umbral, base 1961–1990, reciente 2011–2020, días por década). Con `real: false` rellena valores de demostración. Para pasar a datos reales se regenera desde `data/cr2met_resumen.json` con `real: true`; las páginas cambian solas de sello (`AP.selloClima()`). `js/graficos.js` tolera décadas incompletas (`anios`, `incompleta`).
- **Estilos:** `css/maqueta.css` (tokens y componentes compartidos) + un CSS por página (`paginas-intro.css` para index/panel/acceso, `ficha.css`, `redes.css`, `repositorio.css`, `como-funciona.css`).
- **`vendor/`:** Leaflet 1.9.4 y D3 7.9.0 locales. Nunca usar CDN ni fuentes web.
- `como-funciona.html` tiene dos SVG (horizontal ≥900 px, vertical en móvil) escritos a mano con coordenadas fijas.

## Reglas de contenido (no negociables)

- Todo dato simulado lleva `AP.selloDemo()` en el mismo elemento, nunca una advertencia general. Nada de timestamps, likes, seguidores ni contadores inventados.
- La anomalía climática se calcula solo dentro de CR2MET; nunca comparar el sensor con la grilla ni escribir "hoy hizo X °C más que lo normal".
- Cada publicación muestra `window.MENCION_IA` y un enlace "¿Qué significa?" a `repositorio.html#<tema>`.
- Sin logos reales de Instagram, X ni del Ministerio (usar `window.ICONOS`). El proyecto no está adjudicado: no escribir "Financiado por" como hecho. Los handles se rotulan como de ejemplo (`.handle-ejemplo`).
- No inventar dimensiones, cifras, fauna ni fuentes; lo desconocido va con `.pendiente` ("a definir").
- Fotos solo con licencia verificada; las CC BY llevan atribución visible con `AP.creditoFoto(arbol)`. No usar imágenes de sensores de terceros.
- Español de Chile, lenguaje claro. Sin rayas largas (—) como inciso y sin frases "no es X, es Y".
- Accesibilidad: `lang="es"`, `alt` en imágenes, contraste AA, teclado, objetivos táctiles ≥44 px, gráficos con alternativa en tabla.
