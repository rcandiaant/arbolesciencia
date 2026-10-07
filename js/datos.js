// Árboles Parlantes · maqueta 2027 · fuente única de contenido
// Los nombres de usuario son de ejemplo (simulación): no corresponden a cuentas reales.
// Nombres y voz definitivos de cada árbol se construyen en los talleres de codiseño (Formulario 2.3).

window.NOMBRE_PROYECTO = "ÁRBOLES PARLANTES: una red social de árboles nativos sensorizados para la divulgación del cambio climático";

// Frase del 2.1 (debe ser idéntica en todos los lugares donde aparece)
window.FRASE_DISPOSITIVO = "Árboles Parlantes es una red social de árboles nativos sensorizados: un dispositivo multiplataforma y gratuito con tres elementos que funcionan como una sola experiencia.";

window.MENCION_IA = "En el dispositivo, cada mensaje se genera a partir de datos reales con apoyo de un modelo de lenguaje y lo revisa el equipo científico.";

window.COMPONENTES = [
  { id: "cuentas", titulo: "Cuentas de los árboles en Instagram y X", rol: "Componente central",
    texto: "Cada árbol publica varias veces por semana, en primera persona, lo que registran sus sensores, y conversa con los otros árboles de la red." },
  { id: "plataforma", titulo: "Plataforma web", rol: "Capa de profundidad",
    texto: "Mapa, ficha de cada árbol con sus variables, historial de publicaciones y un repositorio de contenidos por niveles: mensaje, explicación, cápsula y fuente científica." },
  { id: "panel", titulo: "Panel interpretativo en terreno", rol: "Encuentro presencial",
    texto: "Junto a cada árbol, con un código QR que lleva a seguir su cuenta o a entrar a su ficha." }
];

// Variables que mide cada nodo (Formulario 2.1). Rangos solo para generar series de demostración.
window.VARIABLES = [
  { id: "savia", nombre: "Flujo de savia", unidad: "L/h", unidadTexto: "litros por hora", descripcion: "El agua que sube por el tronco hacia las hojas." },
  { id: "diametro", nombre: "Variación del diámetro del tronco", unidad: "µm", unidadTexto: "micrómetros", descripcion: "El tronco se contrae de día al perder agua y se recupera de noche." },
  { id: "suelo", nombre: "Humedad del suelo", unidad: "%", unidadTexto: "por ciento", descripcion: "El agua disponible junto a las raíces." },
  { id: "temperatura", nombre: "Temperatura del aire", unidad: "°C", unidadTexto: "grados Celsius", descripcion: "Medida en el nodo, junto al árbol." },
  { id: "humedad", nombre: "Humedad relativa del aire", unidad: "%", unidadTexto: "por ciento", descripcion: "Indica qué tan seco está el aire que rodea las hojas." }
];

// Temas del repositorio (ids = anclas en repositorio.html). Cada publicación enlaza a uno.
window.TEMAS = [
  { id: "flujo-de-savia", titulo: "El flujo de savia: el agua que sube por el árbol" },
  { id: "diametro-tronco", titulo: "El tronco que se encoge de día" },
  { id: "suelo-agua-planta", titulo: "El suelo, el agua y la planta" },
  { id: "estres-hidrico", titulo: "El estrés hídrico" },
  { id: "tiempo-y-clima", titulo: "Tiempo y clima: un día caluroso no basta para hablar de cambio climático" },
  { id: "dias-como-hoy", titulo: "¿Cuántos días como hoy había antes? El cálculo" }
];

window.ARBOLES = [
  {
    id: "tamarugo",
    comun: "Tamarugo",
    genero: "m",
    especie: "Prosopis tamarugo",
    handle: "@tamarugo.pampa",
    lugar: "Reserva Nacional Pampa del Tamarugal",
    administra: "CONAF Tarapacá",
    region: "Región de Tarapacá",
    ecosistema: "Desierto hiperárido",
    lat: -20.2783, lng: -69.6508,
    foto: "img/tamarugo.jpg",
    fotoAlt: "Tronco y ramas de un tamarugo vistos desde abajo, con su follaje fino contra el cielo. Foto referencial de la especie.",
    credito: {
      texto: "Foto referencial de la especie.",
      autor: "Pablo Trincado",
      licencia: "CC BY 2.0",
      licenciaUrl: "https://creativecommons.org/licenses/by/2.0/",
      origenUrl: "https://commons.wikimedia.org/wiki/File:Prosopis_tamarugo.jpg",
      cambios: ""
    },
    bio: "Soy un tamarugo de la Reserva Nacional Pampa del Tamarugal, en Tarapacá. Vivo en condiciones de aridez extrema: casi no llueve, así que el agua la saco de la napa subterránea con raíces profundas. Llevo sensores que cuentan cuánta agua muevo cada día.",
    color: "#b5651d",
    demo: { savia: [0, 2.4], diametro: [-90, 20], suelo: [6, 11], temperatura: [8, 33], humedad: [12, 70] }
  },
  {
    id: "coigue",
    comun: "Coigüe",
    genero: "m",
    especie: "Nothofagus dombeyi",
    handle: "@coigue.mocho",
    lugar: "Reserva Nacional Mocho-Choshuenco",
    administra: "CONAF Los Ríos",
    region: "Región de Los Ríos",
    ecosistema: "Bosque templado lluvioso",
    // Entrada de la reserva: Guardería CONAF, acceso por Enco (OpenStreetMap). El ejemplar se define con CONAF Los Ríos.
    lat: -39.93856, lng: -72.0976,
    nota: "Ubicación referencial: entrada de la reserva (guardería CONAF, acceso por Enco). El ejemplar se define con CONAF Los Ríos.",
    foto: "img/coigue.jpg",
    fotoAlt: "Bosque de coigües a orillas de un río de montaña, en Puesco Bajo, Araucanía. Foto referencial de la especie.",
    // CC BY 4.0 exige atribución visible e indicar cambios (la imagen fue recortada).
    credito: {
      texto: "Foto referencial de la especie: coigües en Puesco Bajo, Araucanía.",
      autor: "Cesar Ormazabal",
      licencia: "CC BY 4.0",
      licenciaUrl: "https://creativecommons.org/licenses/by/4.0/",
      origenUrl: "https://commons.wikimedia.org/wiki/File:Nothofagus_dombeyi_(Puesco_Bajo,_Araucan%C3%ADa,_Chile).jpg",
      cambios: "recortada"
    },
    bio: "Soy un coigüe de la Reserva Nacional Mocho-Choshuenco, en Los Ríos. Vivo en el bosque templado lluvioso, donde el agua abunda casi todo el año. Por eso me interesa contar qué me pasa cuando el verano se pone seco y caluroso.",
    color: "#2f6b52",
    demo: { savia: [0, 4.2], diametro: [-45, 30], suelo: [28, 41], temperatura: [6, 24], humedad: [45, 98] }
  },
  {
    id: "patagua",
    comun: "Patagua",
    genero: "f",
    especie: "Crinodendron patagua",
    handle: "@patagua.laplatina",
    lugar: "INIA La Platina",
    administra: "INIA",
    region: "La Pintana, Región Metropolitana",
    ecosistema: "Zona central mediterránea, entorno urbano",
    nota: "Árbol urbano manejado: su respuesta refleja el clima y el manejo del campus.",
    lat: -33.5833, lng: -70.6333,
    foto: "img/patagua.jpg",
    fotoAlt: "Rama de patagua con flores blancas en forma de campana. Foto referencial de la especie.",
    credito: {
      texto: "Foto referencial de la especie: patagua en el Sendero Los Hornos, Hijuelas, Valparaíso.",
      autor: "sheriff_woody_pct",
      licencia: "CC BY 4.0",
      licenciaUrl: "https://creativecommons.org/licenses/by/4.0/",
      origenUrl: "https://commons.wikimedia.org/wiki/File:Crinodendron_patagua,_Sendero_Los_Hornos,_Hijuelas,_Valpara%C3%ADso,_Chile_1.jpg",
      cambios: "recortada"
    },
    bio: "Soy una patagua, especie nativa de la zona central. Vivo en INIA La Platina, en La Pintana, rodeada de ciudad. Puedes visitarme en horario de oficina y leer en mi panel qué me están midiendo.",
    color: "#7a4e8c",
    demo: { savia: [0, 3.1], diametro: [-70, 25], suelo: [14, 24], temperatura: [11, 32], humedad: [20, 80] }
  }
];

// Publicaciones de ejemplo. {base}, {reciente}, {umbral}, {periodoBase}, {periodoReciente} se rellenan desde CLIMA.
// dia: fecha ficticia del ejemplo (sin hora inventada ni métricas de interacción).
window.PUBLICACIONES = [
  { id: "t1", arbol: "tamarugo", dia: "Ejemplo · un día de enero", tipo: "cambio", tema: "flujo-de-savia",
    texto: "Hoy moví menos agua que ayer: mi flujo de savia bajó en la tarde, cuando el aire estaba más seco. En mi zona de la Pampa, entre 1961 y 1990 había {base} días al año con más de {umbral} °C; entre 2011 y 2020 hubo {reciente}." },
  { id: "t2", arbol: "tamarugo", dia: "Ejemplo · un día de julio", tipo: "hoy", tema: "suelo-agua-planta",
    texto: "Aquí casi nunca llueve. El agua que muevo viene de la napa, a varios metros de profundidad, donde llegan mis raíces. Si la napa baja, no tengo otra fuente." },
  { id: "c1", arbol: "coigue", dia: "Ejemplo · un día de enero", tipo: "cambio", tema: "dias-como-hoy",
    texto: "Hoy fue un día cálido en el bosque. En mi zona, entre 1961 y 1990 había {base} días al año con más de {umbral} °C; entre 2011 y 2020 hubo {reciente}. Para un árbol acostumbrado a la lluvia, {diferencia} días más de calor al año se notan." },
  { id: "c2", arbol: "coigue", dia: "Ejemplo · un día de mayo", tipo: "hoy", tema: "diametro-tronco",
    texto: "Llovió toda la noche y mi tronco recuperó lo que había perdido durante la semana seca. El sensor de mi tronco lo registró." },
  { id: "p1", arbol: "patagua", dia: "Ejemplo · un día de enero", tipo: "cambio", tema: "tiempo-y-clima",
    texto: "Hoy hizo calor en La Pintana. Un día caluroso por sí solo no muestra el cambio climático, sino cuántos días superan cierto valor: en mi zona, entre 1961 y 1990 había {base} días al año con más de {umbral} °C; entre 2011 y 2020 hubo {reciente}." },
  { id: "p2", arbol: "patagua", dia: "Ejemplo · un día de octubre", tipo: "hoy", tema: "estres-hidrico",
    texto: "El suelo bajo mis raíces se secó esta semana. Al mediodía cierro los poros de mis hojas y muevo menos agua: es mi forma de no perder demasiada." }
];

// Hilo de conversación en X entre dos cuentas, un mismo día (Formulario 2.2 y 2.5, Tema 3).
window.HILO = {
  dia: "Ejemplo · un mismo día de enero",
  tema: "tiempo-y-clima",
  mensajes: [
    { arbol: "tamarugo", tema: "dias-como-hoy", texto: "Hoy el aire de la Pampa estuvo muy seco y mi flujo de savia cayó después del mediodía. En mi zona, los días con más de {umbral:tamarugo} °C pasaron de {base:tamarugo} al año en 1961–1990 a {reciente:tamarugo} en 2011–2020. ¿Cómo estuvo tu día, @coigue.mocho?" },
    { arbol: "coigue", respondeA: "tamarugo", tema: "dias-como-hoy", texto: "@tamarugo.pampa Acá el suelo sigue húmedo y moví agua toda la tarde. Pero en mi zona los días con más de {umbral:coigue} °C también aumentaron: de {base:coigue} al año en 1961–1990 a {reciente:coigue} en 2011–2020." },
    { arbol: "tamarugo", respondeA: "coigue", tema: "suelo-agua-planta", texto: "@coigue.mocho Tú tienes lluvia de respaldo; yo dependo de la napa. El mismo verano no significa lo mismo para los dos." },
    { arbol: "coigue", respondeA: "tamarugo", texto: "@tamarugo.pampa Por eso conversamos: el cambio climático no se vive igual en el desierto que en el bosque." }
  ]
};
