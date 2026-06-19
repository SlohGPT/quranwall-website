#!/usr/bin/env python3
"""Generate QuranWall icons + branded placeholder images from the master logo.

App icons / favicon / OG chip use the real logo (public/icon-app-1024.png).
The slideshow images are deliberate placeholders, swap with real screenshots later."""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), "..")
PUB = os.path.join(ROOT, "public")
SLIDE = os.path.join(PUB, "assets", "slideshow")
LOGO_SRC = os.path.join(PUB, "icon-app-1024.png")
os.makedirs(SLIDE, exist_ok=True)

INDIGO = (30, 19, 56)        # #1E1338
INDIGO_2 = (44, 28, 88)      # #2C1C58
ELEVATED = (54, 34, 102)     # #362266
GOLD = (217, 185, 104)       # #D9B968
GOLD_L = (227, 196, 107)     # #E3C46B
WHITE = (255, 255, 255)

LOGO = Image.open(LOGO_SRC).convert("RGBA")

FONT_CANDIDATES = [
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
]

def font(size):
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def vgrad(w, h, top, bottom):
    img = Image.new("RGB", (w, h), top)
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    return img

def logo_at(size):
    return LOGO.resize((size, size), Image.LANCZOS)

def paste_logo(bg, size, cx, cy):
    """Paste the logo (centered at cx, cy) onto an RGB bg using its alpha."""
    lg = logo_at(size)
    bg.paste(lg, (int(cx - size / 2), int(cy - size / 2)), lg)

# ---- App icons / favicon (the real logo, with alpha) ----
for px, name in [(512, "icon-app-512.png"), (180, "icon-app-180.png"), (64, "favicon.png")]:
    logo_at(px).save(os.path.join(PUB, name))
    print("icon", name)

# ---- OG image (1200x630) ----
def og():
    W, H = 1200, 630
    img = vgrad(W, H, INDIGO_2, INDIGO)
    d = ImageDraw.Draw(img)
    paste_logo(img, 300, 250, H / 2)
    d.text((460, 200), "QuranWall", font=font(108), fill=GOLD)
    d.text((464, 330), "Daily Quran on your", font=font(50), fill=WHITE)
    d.text((464, 392), "iPhone lock screen", font=font(50), fill=WHITE)
    d.text((464, 470), "quranwall.com", font=font(34), fill=GOLD_L)
    img.save(os.path.join(PUB, "og-image.png"))
    print("og-image")

og()

# ---- Slideshow phone screenshots (portrait placeholders) ----
LABELS = ["Lock screen", "Widgets & wallpapers", "Loved by believers",
          "Quran verse explorer", "Make it yours"]
VERSES = ['"Indeed, with hardship comes ease."', "Quran 94:6"]

def slide(idx, w, h, path):
    img = vgrad(w, h, INDIGO_2, INDIGO)
    d = ImageDraw.Draw(img)
    m = int(w * 0.06)
    d.rounded_rectangle([m, m, w - m, h - m], radius=int(w * 0.09),
                        outline=GOLD, width=max(2, int(w * 0.006)))
    paste_logo(img, int(w * 0.22), w / 2, h * 0.20)
    d.text((w / 2, h * 0.30), "QuranWall", font=font(int(w * 0.058)), fill=GOLD, anchor="mm")
    d.text((w / 2, h * 0.46), VERSES[0], font=font(int(w * 0.052)), fill=WHITE, anchor="mm")
    d.text((w / 2, h * 0.51), VERSES[1], font=font(int(w * 0.040)), fill=GOLD_L, anchor="mm")
    d.text((w / 2, h * 0.90), LABELS[idx], font=font(int(w * 0.050)), fill=WHITE, anchor="mm")
    d.text((w / 2, h * 0.94), "image placeholder", font=font(int(w * 0.034)), fill=GOLD_L, anchor="mm")
    img.save(path)

for i in range(5):
    slide(i, 1284, 2778, os.path.join(SLIDE, f"slide{i+1}.png"))
    slide(i, 640, 1385, os.path.join(SLIDE, f"slide{i+1}-mobile.png"))
print("slides done")
