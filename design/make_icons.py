"""Genera los íconos de la app a partir del logo renderizado a 1024×1024.

Uso (macOS):
  qlmanage -t -s 1024 -o /tmp/logo design/journest-logo.svg
  python3 design/make_icons.py /tmp/logo/journest-logo.svg.png public/icons

Íconos:
  apple-touch-icon.png   180  iPhone (iOS redondea las esquinas solo)
  icon-192.png           192  Android / favicon PNG
  icon-512.png           512  Android, splash
  icon-maskable-512.png  512  Android adaptable: el logo al 80 % para que no lo
                              corte la máscara circular o de "squircle"
El favicon vectorial es el propio SVG (public/icons/icon.svg).
"""
import os, sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
logo = Image.open(src).convert("RGB")
assert logo.size == (1024, 1024), logo.size
bg = logo.getpixel((2, 2))

for name, size in (("apple-touch-icon.png", 180), ("icon-192.png", 192), ("icon-512.png", 512)):
    logo.resize((size, size), Image.LANCZOS).save(os.path.join(out, name), optimize=True)

safe = Image.new("RGB", (1024, 1024), bg)
inner = logo.resize((820, 820), Image.LANCZOS)
safe.paste(inner, ((1024 - 820) // 2, (1024 - 820) // 2))
safe.resize((512, 512), Image.LANCZOS).save(os.path.join(out, "icon-maskable-512.png"), optimize=True)
print("ok:", sorted(os.listdir(out)))
