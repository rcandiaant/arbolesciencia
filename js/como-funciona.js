// Árboles Parlantes · maqueta 2027 · Cómo funciona
// Rellena el ejemplo "del dato al mensaje" con la publicación t1 del tamarugo.
(function () {
  const pub = (window.PUBLICACIONES || []).find(p => p.id === "t1");
  const texto = document.getElementById("ej-texto");
  if (pub && texto) texto.textContent = AP.rellenar(pub.texto, "tamarugo");

  const dato = document.getElementById("ej-dato");
  if (dato) dato.insertAdjacentHTML("afterbegin", AP.selloDemo());

  const mensaje = document.getElementById("ej-mensaje");
  if (mensaje) mensaje.insertAdjacentHTML("afterbegin", AP.selloClima());

  const mencion = document.getElementById("ej-mencion");
  if (mencion) mencion.textContent = window.MENCION_IA;

  const enlace = document.getElementById("ej-enlace");
  if (enlace && pub) enlace.href = AP.enlace("repositorio.html") + "#" + pub.tema;
})();
