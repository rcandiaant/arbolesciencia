"""Genera los dos SVG de la lámina del sistema (horizontal y vertical) de como-funciona.html.

Uso (desde cualquier carpeta):
  python -I herramientas/gen_lamina.py

Edita los textos en CAPAS, PASOS y CHIPS_DATO y vuelve a correrlo: calcula el ajuste de líneas y las
coordenadas, y reemplaza solo los bloques <svg class="lamina lamina-h"> y <svg class="lamina lamina-v">
del como-funciona.html actual. El resto de la página no se toca. Solo usa la biblioteca estándar.
"""
import os, re, sys, textwrap, html

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CAPAS = {
    "soporte": dict(num="1", nombre="SOPORTE", sub="Infraestructura que alimenta el dispositivo",
                    banda="#f1eadc", trazo="#6b5640", texto="#4f3d2a", patron="url(#{ID}-pat-soporte)", dash=None, ancho=2),
    "dato": dict(num="2", nombre="DATO", sub="Respuesta del árbol e historia climática del lugar",
                 banda="#e5eef6", trazo="#1f5f8b", texto="#174a6e", patron="url(#{ID}-pat-dato)", dash="7 4", ancho=2),
    "contenido": dict(num="3", nombre="CONTENIDO", sub="El dispositivo: la red social de árboles",
                      banda="#e2eee4", trazo="#2f6b52", texto="#1f4d3a", patron=None, dash=None, ancho=3.5),
}

PASOS = {
    1: ("soporte", "Sensores en el árbol", "Flujo de savia, dendrómetro (diámetro del tronco), humedad de suelo, temperatura y humedad del aire."),
    2: ("soporte", "Registro local", "Microcontrolador con memoria que guarda cada medición junto al árbol. Funciona con energía solar."),
    3: ("soporte", "Telemetría celular", "El nodo envía sus mediciones por la red de telefonía celular."),
    4: ("soporte", "Servidor", "Recibe y guarda los datos de los tres árboles."),
    5: ("dato", "Condición del árbol y clima del lugar", "Se caracteriza la condición fisiológica del árbol (por ejemplo, cierra estomas porque el aire está seco) y se le suma cuánto ha cambiado el clima de su ubicación."),
    6: ("contenido", "Borrador del mensaje", "Un modelo de lenguaje redacta el texto en primera persona a partir de la condición del árbol y la serie climática."),
    7: ("contenido", "Revisión del Encargado de contenidos CTCI", "Una persona del equipo científico revisa, corrige y aprueba cada borrador."),
    8: ("contenido", "Publicación", None),
}
CHIPS_DATO = {
    "registro": ("Registro del árbol", "Las mediciones del nodo aportan la respuesta del árbol."),
    "cr2met": ("Serie climática CR2MET", "Temperatura y precipitación diarias desde 1960. La comparación histórica es CR2MET contra CR2MET."),
}
SALIDAS = [("foto", "Cuenta en Instagram"), ("mensaje", "Cuenta en X"), ("ficha", "Plataforma web"), ("qr", "Panel en terreno con QR")]
ICON = {
    "foto": '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>',
    "mensaje": '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
    "ficha": '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8M12 18v3"/>',
    "qr": '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v7M14 20h3"/>',
    "persona": '<circle cx="12" cy="7" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
}

E = html.escape
TINTA = "#1d241f"; TINTA2 = "#36403a"; FLECHA = "#4a554d"
INSIGNIA = "Ningún mensaje se publica sin esta revisión."
REVISION = dict(trazo="#8a4b14", fondo="#fbf3ea", texto="#7a3f0e")


def lineas(t, n):
    return textwrap.wrap(t, n) if t else []


def texto(x, y, ls, size, color, peso=None, lh=None, ancla=None):
    lh = lh or size * 1.32
    attrs = f'font-size="{size}" fill="{color}"' + (f' font-weight="{peso}"' if peso else "") + (f' text-anchor="{ancla}"' if ancla else "")
    out = []
    for i, l in enumerate(ls):
        out.append(f'<text x="{x}" y="{y + i * lh:.1f}" {attrs}>{E(l)}</text>')
    return "\n".join(out), len(ls) * lh


def icono(nombre, x, y, s, color):
    k = s / 24
    return f'<g transform="translate({x} {y}) scale({k:.3f})" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" color="{color}">{ICON[nombre]}</g>'


def caja(x, y, w, h, capa, especial=False):
    c = CAPAS[capa]
    trazo = REVISION["trazo"] if especial else c["trazo"]
    fondo = REVISION["fondo"] if especial else "#ffffff"
    ancho = 4 if especial else c["ancho"]
    dash = f' stroke-dasharray="{c["dash"]}"' if (c["dash"] and not especial) else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{fondo}" stroke="{trazo}" stroke-width="{ancho}"{dash}/>'


def medir_paso(n, w, t_tit, t_desc, fs_t, fs_d):
    capa, tit, desc = PASOS[n]
    h = 16 + len(lineas(tit, t_tit)) * fs_t * 1.25 + 8 + len(lineas(desc, t_desc)) * fs_d * 1.36 + 14
    if n == 7:
        h += 12 + len(lineas(INSIGNIA, int((w - 74) / 7.6))) * 15 + 16
    if n == 8:
        h += len(SALIDAS) * 34 + 8
    return max(h, 76)


def dibujar_paso(n, x, y, w, h, t_tit, t_desc, fs_t, fs_d):
    capa, tit, desc = PASOS[n]
    c = CAPAS[capa]
    esp = n == 7
    color_num = REVISION["trazo"] if esp else c["trazo"]
    out = [caja(x, y, w, h, capa, esp)]
    out.append(f'<circle cx="{x + 24}" cy="{y + 26}" r="15" fill="{color_num}"/>')
    out.append(f'<text x="{x + 24}" y="{y + 31.5}" font-size="15" font-weight="700" fill="#ffffff" text-anchor="middle">{n}</text>')
    tl = lineas(tit, t_tit)
    s, th = texto(x + 48, y + 31, tl, fs_t, TINTA, "700", fs_t * 1.25)
    out.append(s)
    yy = y + 31 + th + 4
    if desc:
        s, dh = texto(x + 16, yy + fs_d, lineas(desc, t_desc), fs_d, TINTA2, None, fs_d * 1.36)
        out.append(s)
        yy += dh
    if esp:
        by = yy + 12
        bl = lineas(INSIGNIA, int((w - 74) / 7.6))
        bh = len(bl) * 15 + 14
        out.append(f'<rect x="{x + 12}" y="{by}" width="{w - 24}" height="{bh}" rx="8" fill="#ffffff" stroke="{REVISION["trazo"]}" stroke-width="1.5"/>')
        out.append(icono("persona", x + 20, by + bh / 2 - 11, 22, REVISION["texto"]))
        s, _ = texto(x + 50, by + 19, bl, 13, REVISION["texto"], "700", 15)
        out.append(s)
    if n == 8:
        cy = yy + 10
        for ic, lab in SALIDAS:
            qr = ic == "qr"
            out.append(f'<rect x="{x + 12}" y="{cy}" width="{w - 24}" height="28" rx="6" fill="{"#fbf3ea" if qr else "#f0f6f1"}" stroke="{c["trazo"]}" stroke-width="1"{" stroke-dasharray=\"4 3\"" if qr else ""}/>')
            out.append(icono(ic, x + 20, cy + 5, 18, c["texto"]))
            out.append(f'<text x="{x + 46}" y="{cy + 19}" font-size="13.5" fill="{TINTA}" font-weight="600">{E(lab)}</text>')
            cy += 34
    return "\n".join(out)


def dibujar_chip(clave, x, y, w, h, t, fs):
    tit, desc = CHIPS_DATO[clave]
    c = CAPAS["dato"]
    out = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="#ffffff" stroke="{c["trazo"]}" stroke-width="2" stroke-dasharray="{c["dash"]}"/>']
    s, th = texto(x + 14, y + 24, lineas(tit, t), fs + 1, c["texto"], "700", (fs + 1) * 1.25)
    out.append(s)
    s, _ = texto(x + 14, y + 24 + th + 4, lineas(desc, t + 2), fs, TINTA2, None, fs * 1.36)
    out.append(s)
    return "\n".join(out)


def medir_chip(clave, t, fs):
    tit, desc = CHIPS_DATO[clave]
    return 18 + len(lineas(tit, t)) * (fs + 1) * 1.25 + 4 + len(lineas(desc, t + 2)) * fs * 1.36 + 10


def banda(capa, x, y, w, h, modo="una"):
    c = CAPAS[capa]
    out = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="{c["banda"]}"/>']
    if c["patron"]:
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="{c["patron"]}"/>')
    dash = f' stroke-dasharray="{c["dash"]}"' if c["dash"] else ""
    out.append(f'<rect x="{x + 1}" y="{y + 1}" width="{w - 2}" height="{h - 2}" rx="13" fill="none" stroke="{c["trazo"]}" stroke-width="{c["ancho"] if capa != "contenido" else 3}"{dash}/>')
    # rótulo sobre fondo sólido para mantener contraste sobre el patrón
    etiqueta = f'CAPA {c["num"]} · {c["nombre"]}'
    if modo == "etiqueta":
        out.append(f'<rect x="{x + 10}" y="{y + 10}" width="{26 + len(etiqueta) * 9:.0f}" height="30" rx="15" fill="{c["banda"]}" stroke="{c["trazo"]}" stroke-width="1"/>')
        out.append(f'<text x="{x + 24}" y="{y + 30}" font-size="14" font-weight="700" letter-spacing="0.6" fill="{c["texto"]}">{E(etiqueta)}</text>')
        return "\n".join(out), 48
    if modo == "una":
        ancho_pill = 26 + len(etiqueta) * 9 + len(c["sub"]) * 7.3
        out.append(f'<rect x="{x + 10}" y="{y + 10}" width="{min(ancho_pill, w - 20):.0f}" height="30" rx="15" fill="{c["banda"]}" stroke="{c["trazo"]}" stroke-width="1"/>')
        out.append(f'<text x="{x + 24}" y="{y + 30}" font-size="14" fill="{c["texto"]}"><tspan font-weight="700" letter-spacing="0.6">{E(etiqueta)}</tspan><tspan dx="10">{E(c["sub"])}</tspan></text>')
        return "\n".join(out), 48
    # modo vertical: rótulo desplazado a la derecha para dejar libre el carril de flechas
    sl = lineas(c["sub"], 36)
    ph = 30 + len(sl) * 18
    out.append(f'<rect x="{x + 50}" y="{y + 10}" width="{w - 62}" height="{ph}" rx="12" fill="{c["banda"]}" stroke="{c["trazo"]}" stroke-width="1"/>')
    out.append(f'<text x="{x + 62}" y="{y + 30}" font-size="14" font-weight="700" letter-spacing="0.6" fill="{c["texto"]}">{E(etiqueta)}</text>')
    s2, _ = texto(x + 62, y + 49, sl, 13.5, c["texto"], None, 18)
    out.append(s2)
    return "\n".join(out), ph + 22


def flecha(x1, y1, x2, y2):
    return f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{FLECHA}" stroke-width="2.5" fill="none" marker-end="url(#{{ID}}-punta)"/>'


def flecha_codo(pts):
    d = "M" + " L".join(f"{a} {b}" for a, b in pts)
    return f'<path d="{d}" stroke="{FLECHA}" stroke-width="2.5" fill="none" marker-end="url(#{{ID}}-punta)"/>'


def defs(ID):
    return f'''<defs>
<marker id="{ID}-punta" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="{FLECHA}"/></marker>
<pattern id="{ID}-pat-soporte" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="12" stroke="#dccfb5" stroke-width="3"/></pattern>
<pattern id="{ID}-pat-dato" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="1.6" fill="#b9cfe2"/></pattern>
</defs>'''


TITULO = "Lámina del sistema Árboles Parlantes: del árbol al mensaje"
DESC = ("Flujo en ocho pasos agrupados en tres capas. Capa 1, Soporte, la infraestructura que alimenta el dispositivo: "
        "paso 1, sensores en el árbol (flujo de savia, dendrómetro, humedad de suelo, temperatura y humedad del aire); "
        "paso 2, registro local en un microcontrolador con memoria y alimentación solar; paso 3, telemetría celular; paso 4, servidor. "
        "Capa 2, Dato: el registro de mediciones del árbol y la serie climática histórica CR2MET desde 1960 alimentan el paso 5, "
        "la caracterización de la condición fisiológica del árbol y la comparación climática, calculada CR2MET contra CR2MET; el nodo aporta la respuesta del árbol. "
        "Capa 3, Contenido, el dispositivo que ve la ciudadanía: paso 6, un modelo de lenguaje redacta un borrador del mensaje; "
        "paso 7, el Encargado de contenidos CTCI revisa y aprueba; ningún mensaje se publica sin esta revisión; "
        "paso 8, publicación en la cuenta del árbol en Instagram, en X y en la plataforma web, con el panel en terreno y su código QR como puerta de entrada.")


def svg_abierto(ID, w, h, clase):
    return (f'<svg class="{clase}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="{ID}-t {ID}-d" '
            f'font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif">\n'
            f'<title id="{ID}-t">{E(TITULO)}</title>\n<desc id="{ID}-d">{E(DESC)}</desc>\n{defs(ID)}')


# ---------------- Horizontal (escritorio) ----------------
def horizontal():
    ID = "lh"
    W = 1040; bw = 230; gap = 30; X0 = 20
    cols = [X0 + i * (bw + gap) for i in range(4)]
    TT, TD, FT, FD = 21, 30, 15, 13.5
    out = []
    y = 0
    # banda 1
    h1 = max(medir_paso(n, bw, TT, TD, FT, FD) for n in (1, 2, 3, 4))
    hb1 = 48 + h1 + 18
    s, top = banda("soporte", 0, y, W, hb1)
    out.append(s)
    ry1 = y + top
    for i, n in enumerate((1, 2, 3, 4)):
        out.append(dibujar_paso(n, cols[i], ry1, bw, h1, TT, TD, FT, FD))
        if i < 3:
            out.append(flecha(cols[i] + bw + 2, ry1 + h1 / 2, cols[i + 1] - 3, ry1 + h1 / 2))
    y += hb1 + 26
    # banda 2
    w5 = bw * 2 + gap
    h2 = max(medir_paso(5, w5, 42, 62, FT, FD), medir_chip("registro", 27, 13.5), medir_chip("cr2met", 27, 13.5))
    hb2 = 48 + h2 + 18
    s, top = banda("dato", 0, y, W, hb2)
    out.append(s)
    ry2 = y + top
    out.append(dibujar_chip("cr2met", cols[0], ry2, bw, h2, 27, 13.5))
    out.append(dibujar_paso(5, cols[1], ry2, w5, h2, 42, 62, FT, FD))
    out.append(dibujar_chip("registro", cols[3], ry2, bw, h2, 27, 13.5))
    out.append(flecha(cols[3] + bw / 2, ry1 + h1 + 2, cols[3] + bw / 2, ry2 - 3))
    out.append(flecha(cols[3] - 2, ry2 + h2 / 2, cols[1] + w5 + 3, ry2 + h2 / 2))
    out.append(flecha(cols[0] + bw + 2, ry2 + h2 / 2, cols[1] - 3, ry2 + h2 / 2))
    y += hb2 + 26
    # banda 3
    h3 = max(medir_paso(n, bw, TT, TD, FT, FD) for n in (6, 7, 8))
    hb3 = 48 + h3 + 18
    s, top = banda("contenido", 0, y, W, hb3, "etiqueta")
    out.append(s)
    ry3 = y + top
    for i, n in enumerate((6, 7, 8)):
        out.append(dibujar_paso(n, cols[i + 1], ry3, bw, h3, TT, TD, FT, FD))
        if i < 2:
            out.append(flecha(cols[i + 1] + bw + 2, ry3 + h3 / 2, cols[i + 2] - 3, ry3 + h3 / 2))
    out.append(flecha(cols[1] + bw / 2, ry2 + h2 + 2, cols[1] + bw / 2, ry3 - 3))
    # nota del dispositivo en la columna 1
    c = CAPAS["contenido"]
    s, _ = texto(cols[0] + 6, ry3 + 22, ["El dispositivo:", "la red social de árboles"], 17, c["texto"], "700", 22)
    out.append(s)
    nota = "Lo que la ciudadanía ve y sigue: las cuentas de cada árbol, la plataforma web y el panel junto al árbol. Las capas de soporte y de dato lo alimentan."
    s, _ = texto(cols[0] + 6, ry3 + 72, lineas(nota, 31), 13.5, TINTA, None, 19)
    out.append(s)
    H = y + hb3 + 2
    body = "\n".join(out).replace("{ID}", ID)
    return svg_abierto(ID, W, H, "lamina lamina-h") + "\n" + body + "\n</svg>"


# ---------------- Vertical (móvil) ----------------
def vertical():
    ID = "lv"
    W = 360; X = 14; bw = W - 2 * X - 0; bw = 332 - 4
    X = (W - bw) / 2
    TT, TD, FT, FD = 30, 42, 15, 14
    out = []
    y = 0
    sep = 30

    def cab(capa):
        return 30 + len(lineas(CAPAS[capa]["sub"], 36)) * 18 + 22

    def bloque(capa, items):
        nonlocal y
        # items: lista de funciones (medir, dibujar)
        pass

    # banda 1
    alturas = {n: medir_paso(n, bw, TT, TD, FT, FD) for n in range(1, 9) if n != 5}
    alturas[5] = medir_paso(5, bw, TT, TD, FT, FD)
    contenido1 = sum(alturas[n] for n in (1, 2, 3, 4)) + 3 * sep
    hb1 = cab("soporte") + contenido1 + 16
    s, top = banda("soporte", 0, y, W, hb1, "dos")
    out.append(s)
    yy = y + top
    pos = {}
    for n in (1, 2, 3, 4):
        out.append(dibujar_paso(n, X, yy, bw, alturas[n], TT, TD, FT, FD))
        pos[n] = (yy, alturas[n])
        if n < 4:
            out.append(flecha(X + 24, yy + alturas[n] + 2, X + 24, yy + alturas[n] + sep - 3))
        yy += alturas[n] + sep
    y += hb1 + 22
    # banda 2
    cw = (bw - 12) / 2
    hc = max(medir_chip("registro", 18, 13), medir_chip("cr2met", 18, 13))
    contenido2 = hc + sep + alturas[5]
    hb2 = cab("dato") + contenido2 + 16
    s, top = banda("dato", 0, y, W, hb2, "dos")
    out.append(s)
    yy = y + top
    out.append(dibujar_chip("registro", X, yy, cw, hc, 18, 13))
    out.append(dibujar_chip("cr2met", X + cw + 12, yy, cw, hc, 18, 13))
    y4, h4 = pos[4]
    out.append(flecha(X + 24, y4 + h4 + 2, X + 24, yy - 3))
    out.append(flecha(X + 24, yy + hc + 2, X + 24, yy + hc + sep - 3))
    out.append(flecha(X + cw + 12 + cw / 2, yy + hc + 2, X + cw + 12 + cw / 2, yy + hc + sep - 3))
    yy += hc + sep
    out.append(dibujar_paso(5, X, yy, bw, alturas[5], TT, TD, FT, FD))
    y5 = yy
    y += hb2 + 22
    # banda 3
    contenido3 = sum(alturas[n] for n in (6, 7, 8)) + 2 * sep
    hb3 = cab("contenido") + contenido3 + 16
    s, top = banda("contenido", 0, y, W, hb3, "dos")
    out.append(s)
    yy = y + top
    out.append(flecha(X + 24, y5 + alturas[5] + 2, X + 24, yy - 3))
    for n in (6, 7, 8):
        out.append(dibujar_paso(n, X, yy, bw, alturas[n], TT, TD, FT, FD))
        if n < 8:
            out.append(flecha(X + 24, yy + alturas[n] + 2, X + 24, yy + alturas[n] + sep - 3))
        yy += alturas[n] + sep
    H = y + hb3 + 2
    body = "\n".join(out).replace("{ID}", ID)
    return svg_abierto(ID, W, H, "lamina lamina-v") + "\n" + body + "\n</svg>"


if __name__ == "__main__":
    ruta = os.path.join(RAIZ, "como-funciona.html")
    pagina = open(ruta, encoding="utf-8").read()
    for clase, svg in (("lamina-h", horizontal()), ("lamina-v", vertical())):
        patron = re.compile(r'<svg class="lamina ' + clase + r'".*?</svg>', re.S)
        if len(patron.findall(pagina)) != 1:
            sys.exit(f'No encontré exactamente un <svg class="lamina {clase}"> en como-funciona.html')
        pagina = patron.sub(lambda _m: svg, pagina)
    open(ruta, "w", encoding="utf-8", newline="\n").write(pagina)
    print("lámina actualizada en", ruta)
