"""Original rangoli artwork and the framed Satyanarayana patam used as a wall prop."""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

TEX = Path(__file__).resolve().parent / "tex"
TEX.mkdir(exist_ok=True)

def petal(d, cx, cy, ang, r0, r1, w, fill, outline=None):
    pts = []
    for i in range(25):
        t = i / 24
        r = r0 + (r1 - r0) * t
        ww = w * math.sin(math.pi * t) ** 0.8
        pts.append((r, ww))
    pts += [(r, -ww) for r, ww in reversed(pts)]
    poly = [(cx + r * math.cos(ang) - y * math.sin(ang), cy + r * math.sin(ang) + y * math.cos(ang)) for r, y in pts]
    d.polygon(poly, fill=fill, outline=outline)

def rangoli(path, size=2048):
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    c = size / 2
    white = (246, 242, 230, 255)
    mag, yel, grn, org, red, blu = (196, 24, 92, 255), (250, 196, 30, 255), (40, 140, 60, 255), (245, 120, 20, 255), (190, 30, 30, 255), (40, 70, 160, 255)
    d.ellipse([c - 980, c - 980, c + 980, c + 980], fill=white)
    d.ellipse([c - 950, c - 950, c + 950, c + 950], fill=(120, 20, 40, 255))
    for i in range(24):
        petal(d, c, c, 2 * math.pi * i / 24, 560, 940, 120, mag if i % 2 else org, white)
    for i in range(24):
        petal(d, c, c, 2 * math.pi * (i + 0.5) / 24, 620, 860, 50, yel, white)
    d.ellipse([c - 600, c - 600, c + 600, c + 600], fill=white)
    d.ellipse([c - 575, c - 575, c + 575, c + 575], fill=grn)
    for i in range(16):
        petal(d, c, c, 2 * math.pi * i / 16, 260, 570, 105, yel if i % 2 else org, white)
    for i in range(16):
        petal(d, c, c, 2 * math.pi * (i + 0.5) / 16, 300, 520, 45, red, white)
    d.ellipse([c - 270, c - 270, c + 270, c + 270], fill=white)
    d.ellipse([c - 250, c - 250, c + 250, c + 250], fill=blu)
    for i in range(8):
        petal(d, c, c, 2 * math.pi * i / 8, 40, 245, 80, mag, white)
    d.ellipse([c - 70, c - 70, c + 70, c + 70], fill=yel, outline=white, width=8)
    for ring, n, rad in ((965, 96, 11), (590, 64, 9), (262, 32, 7)):
        for i in range(n):
            a = 2 * math.pi * i / n
            x, y = c + ring * math.cos(a), c + ring * math.sin(a)
            d.ellipse([x - rad, y - rad, x + rad, y + rad], fill=white)
    im = im.filter(ImageFilter.GaussianBlur(1.2))
    im.save(path)

def patam(src, path):
    im = Image.open(src).convert("RGB")
    w, h = im.size
    box = (int(w * 0.225), int(h * 0.085), int(w * 0.665), int(h * 0.435))
    im.crop(box).save(path, quality=95)

if __name__ == "__main__":
    rangoli(TEX / "rangoli.png")
    src = Path("/opt/cursor/artifacts/assets/scene_satyanarayana.jpg")
    if src.exists():
        patam(src, TEX / "satyanarayana_patam.jpg")
    print("textures ready")
