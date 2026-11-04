"""Genera design/journest-logo.svg: j cursiva punteada cuyos guiones se adelgazan
después de la curva inferior hasta el avión de papel."""
import math, sys

OUT = sys.argv[1]
BG, INK, TERRA, TERRA_D = "#12151B", "#F5F6F8", "#D6523C", "#A93A28"

# Trazo de la j, según el boceto: palo recto y largo, bucle ancho abajo que sube
# y cruza el palo a un tercio de su altura, salida casi horizontal hacia el avión.
# (El conjunto se centra solo en el lienzo: estas coordenadas son relativas.)
SEGS = [  # (p0, c1, c2, p3); el primero es la recta del palo
    ((520, 330), (520, 450), (520, 580), (520, 720)),   # palo recto
    ((520, 720), (520, 840), (480, 905), (400, 905)),   # curva inferior
    ((400, 905), (305, 905), (250, 850), (252, 790)),   # lado izquierdo del bucle
    ((252, 790), (256, 690), (400, 590), (520, 540)),   # sube y llega al palo
    ((520, 540), (620, 498), (720, 470), (810, 452)),   # cruza y sale hacia el avión
]
DOT = (520, 258, 40)
W_MAX, W_MIN = 56, 16          # grosor del trazo: normal → final junto al avión
TAPER_FROM_SEG = 1             # empieza a adelgazar en el fondo del bucle (seg 1, t=1)
# Guiones largos y pocos (se ven bien en chico). Con puntas redondeadas:
# guion visible = DASH*w + w, hueco visible = GAP*w - w
DASH, GAP = 1.0, 1.55
HALO = 18                      # aire alrededor del palo donde la salida pasa por detrás
FADE_FROM = 7                  # desde este guion (contando desde arriba) baja la opacidad
OPACITY_MIN = 0.25             # opacidad del último guion, junto al avión


def bez(s, t):
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = s
    u = 1 - t
    return (u**3 * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t**3 * x3,
            u**3 * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t**3 * y3)


# muestreo por longitud de arco
pts = []
taper_start = None
for i, s in enumerate(SEGS):
    for k in range(400):
        pts.append(bez(s, k / 400))
    if i == TAPER_FROM_SEG:
        taper_start = len(pts)
pts.append(SEGS[-1][3])
acc = [0.0]
for a, b in zip(pts, pts[1:]):
    acc.append(acc[-1] + math.dist(a, b))
L = acc[-1]
L_taper = acc[taper_start]


def at(d):
    """punto y tangente a distancia d"""
    lo, hi = 0, len(acc) - 1
    while lo < hi:
        m = (lo + hi) // 2
        if acc[m] < d: lo = m + 1
        else: hi = m
    i = max(1, lo)
    a, b = pts[i - 1], pts[i]
    seg = acc[i] - acc[i - 1] or 1
    f = (d - acc[i - 1]) / seg
    return (a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)


def width(d):
    if d <= L_taper: return W_MAX
    f = (d - L_taper) / (L - L_taper)
    return W_MAX + (W_MIN - W_MAX) * f ** 0.9


# cruce: altura del palo (x del palo) por donde pasa la salida
STEM_X = SEGS[0][0][0]
L_stem = acc[400]  # fin del palo recto
cross_y = None
for i in range(taper_start, len(pts) - 1):
    (xa, ya), (xb, yb) = pts[i], pts[i + 1]
    if (xa - STEM_X) * (xb - STEM_X) <= 0 and ya < SEGS[0][3][1]:
        cross_y = ya
        break
d_cross = cross_y - SEGS[0][0][1]

# 1) Guiones del palo: alineados para que uno quede centrado en el cruce,
#    así la salida pasa "por detrás" de un guion y no por un hueco.
dash_s, gap_s = DASH * W_MAX, GAP * W_MAX
per = dash_s + gap_s
stem_dashes = []
d = d_cross - dash_s / 2
d -= math.floor(d / per) * per   # primer guion desde arriba del palo con esa misma fase
while d < L_stem:
    d0, d1 = max(d, 0), min(d + dash_s, L_stem)
    if d1 - d0 > dash_s * .5:
        stem_dashes.append((d0, d1, W_MAX))
    d += per

# 2) Resto del trazo (curva, bucle y salida), con guiones que se adelgazan
rest_dashes = []
d = stem_dashes[-1][1] + gap_s
while d < L - 4:
    w = width(d)
    d1 = min(d + DASH * w, L)
    rest_dashes.append((d, d1, width((d + d1) / 2)))
    d = d1 + GAP * w


def path_of(d0, d1):
    n = 6
    p = [at(d0 + (d1 - d0) * j / n) for j in range(n + 1)]
    return "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in p)


# Orden de dibujo: primero el bucle y la salida; encima, el palo con un halo del color
# del fondo que "tapa" la salida donde se cruzan (efecto de pasar por detrás).
def opacity(i):
    """i = índice global del guion (1 = el primero del palo, arriba)"""
    first, last = FADE_FROM, len(stem_dashes) + len(rest_dashes)
    if i <= first: return 1.0
    return 1.0 - (1.0 - OPACITY_MIN) * (i - first) / (last - first)


lines = []
for j, (a, b, w) in enumerate(rest_dashes):
    o = opacity(len(stem_dashes) + 1 + j)
    op = f' stroke-opacity="{o:.2f}"' if o < 1 else ""
    lines.append(f'    <path d="{path_of(a, b)}" stroke-width="{w:.1f}"{op}/>')
halos = [f'    <path d="{path_of(a, b)}" stroke="{BG}" stroke-width="{w + 2 * HALO:.1f}"/>'
         for a, b, w in stem_dashes]
stems = [f'    <path d="{path_of(a, b)}" stroke-width="{w:.1f}"/>' for a, b, w in stem_dashes]

# avión de papel (forma de la imagen de Gemini), escalado y orientado con la salida
end = SEGS[-1][3]
c2 = SEGS[-1][2]
ang = math.degrees(math.atan2(end[1] - c2[1], end[0] - c2[0]))
# Avión de papel visto de lado, punta en (0,0) apuntando a +x:
# ala grande arriba y quilla más chica y oscura abajo, separadas por el pliegue.
wing = [(0, 0), (-150, -58), (-98, 2)]
body = [(0, 0), (-90, 14), (-112, 54)]
SC = 0.78
gap_to_plane = 30
tx = end[0] + math.cos(math.radians(ang)) * (gap_to_plane + 120 * SC)
ty = end[1] + math.sin(math.radians(ang)) * (gap_to_plane + 120 * SC)


def poly(p, fill):
    s = " ".join(f"{x * SC:.1f},{y * SC:.1f}" for x, y in p)
    return f'      <polygon points="{s}" fill="{fill}"/>'


# Centrado: caja del dibujo completo (trazo, punto y avión) al centro del lienzo
def plane_pts():
    a = math.radians(ang)
    for x, y in wing + body:
        x, y = x * SC, y * SC
        yield (tx + x * math.cos(a) - y * math.sin(a), ty + x * math.sin(a) + y * math.cos(a))


xs, ys = [], []
for x, y in pts:
    xs += [x - W_MAX / 2, x + W_MAX / 2]
    ys += [y - W_MAX / 2, y + W_MAX / 2]
xs += [DOT[0] - DOT[2], DOT[0] + DOT[2]]
ys += [DOT[1] - DOT[2], DOT[1] + DOT[2]]
for x, y in plane_pts():
    xs.append(x)
    ys.append(y)
offx = 512 - STEM_X               # el eje central baja por el punto y el palo de la j
offy = 512 - (min(ys) + max(ys)) / 2

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <!-- Journest: una "j" cursiva trazada como ruta punteada. El punto de la j es el origen;
       después de la curva inferior los guiones se adelgazan hasta el avión de papel (destino).
       Generado con logo_svg.py: editar el script, no este archivo. -->
  <rect width="1024" height="1024" fill="{BG}"/>
  <g transform="translate({offx:.1f} {offy:.1f})">
    <g fill="none" stroke="{INK}" stroke-linecap="round" stroke-linejoin="round">
{chr(10).join(lines)}
{chr(10).join(halos)}
{chr(10).join(stems)}
    </g>
    <circle cx="{DOT[0]}" cy="{DOT[1]}" r="{DOT[2]}" fill="{TERRA}"/>
    <g transform="translate({tx:.1f} {ty:.1f}) rotate({ang:.1f})">
{poly(wing, TERRA)}
{poly(body, TERRA_D)}
    </g>
  </g>
</svg>
'''
open(OUT, "w").write(svg)
print(OUT, f"dashes={len(lines)} angle={ang:.1f}")
