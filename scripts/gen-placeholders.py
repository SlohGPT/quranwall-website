#!/usr/bin/env python3
"""Generate branded QuranWall placeholder images (indigo + gold).
These are deliberate placeholders, swap with real art later."""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), "..")
PUB = os.path.join(ROOT, "public")
SLIDE = os.path.join(PUB, "assets", "slideshow")
os.makedirs(SLIDE, exist_ok=True)

INDIGO = (30, 19, 56)        # #1E1338
INDIGO_2 = (44, 28, 88)      # #2C1C58
ELEVATED = (54, 34, 102)     # #362266
GOLD = (217, 185, 104)       # #D9B968
GOLD_L = (227, 196, 107)     # #E3C46B
WHITE = (255, 255, 255)

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

def center_text(d, cx, cy, text, fnt, fill):
    l, t, r, b = d.textbbox((0, 0), text, font=fnt)
    d.text((cx - (r - l) / 2, cy - (b - t) / 2 - t), text, font=fnt, fill=fill)

# ---- App icon (square, indigo with gold Q) ----
def icon(size, path):
    img = vgrad(size, size, INDIGO_2, INDIGO)
    d = ImageDraw.Draw(img)
    center_text(d, size / 2, size / 2 - size * 0.02, "Q", font(int(size * 0.62)), GOLD)
    img.save(path)
    print("icon", path)

icon(512, os.path.join(PUB, "icon-app-512.png"))
icon(180, os.path.join(PUB, "icon-app-180.png"))
icon(64, os.path.join(PUB, "favicon.png"))

# ---- OG image (1200x630) ----
def og():
    W, H = 1200, 630
    img = vgrad(W, H, INDIGO_2, INDIGO)
    d = ImageDraw.Draw(img)
    # icon chip
    chip = 120
    cx, cy = 90, 90
    d.rounded_rectangle([cx, cy, cx + chip, cy + chip], radius=28, fill=ELEVATED, outline=GOLD, width=3)
    center_text(d, cx + chip / 2, cy + chip / 2, "Q", font(74), GOLD)
    d.text((90, 250), "QuranWall", font=font(110), fill=GOLD)
    d.text((94, 380), "Daily Quran on your iPhone lock screen", font=font(46), fill=WHITE)
    d.text((94, 540), "quranwall.com", font=font(34), fill=GOLD_L)
    img.save(os.path.join(PUB, "og-image.png"))
    print("og-image")

og()

# ---- Slideshow phone screenshots (portrait) ----
LABELS = ["Lock screen", "Widgets & wallpapers", "Loved by believers",
          "Quran verse explorer", "Make it yours"]
VERSES = ['"Indeed, with hardship comes ease."', "Quran 94:6"]

def slide(idx, w, h, path):
    img = vgrad(w, h, INDIGO_2, INDIGO)
    d = ImageDraw.Draw(img)
    m = int(w * 0.06)
    # screen frame
    d.rounded_rectangle([m, m, w - m, h - m], radius=int(w * 0.09),
                        outline=GOLD, width=max(2, int(w * 0.006)))
    # verse card centered
    label = LABELS[idx]
    d.text((w / 2, h * 0.40), VERSES[0], font=font(int(w * 0.052)), fill=WHITE, anchor="mm")
    d.text((w / 2, h * 0.46), VERSES[1], font=font(int(w * 0.040)), fill=GOLD_L, anchor="mm")
    # brand + label
    d.text((w / 2, h * 0.085), "QuranWall", font=font(int(w * 0.060)), fill=GOLD, anchor="mm")
    d.text((w / 2, h * 0.90), label, font=font(int(w * 0.050)), fill=WHITE, anchor="mm")
    d.text((w / 2, h * 0.94), "image placeholder", font=font(int(w * 0.034)),
           fill=(255, 255, 255, 120), anchor="mm")
    img.save(path)

for i in range(5):
    slide(i, 1284, 2778, os.path.join(SLIDE, f"slide{i+1}.png"))
    slide(i, 640, 1385, os.path.join(SLIDE, f"slide{i+1}-mobile.png"))
print("slides done")
