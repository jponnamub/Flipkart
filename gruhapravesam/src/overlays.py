"""Transparent 1080x1920 Telugu title cards, one per beat of the invitation."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, str(Path(__file__).resolve().parent))
import copy_te as te  # noqa: E402
from typography import draw_line, line_size  # noqa: E402

W, H = 1080, 1920
MAX_W = 900
GOLD = (0.98, 0.80, 0.42)
CREAM = (0.98, 0.95, 0.88)
OUT = Path(__file__).resolve().parents[1] / "build" / "overlays"

# (name, start s, end s, vertical centre px, lines as (text, size, weight, colour))
CARDS = [
    ("01_mantra", 0.9, 4.75, 300, [(te.MANTRA, 66, "bold", GOLD)]),
    ("02_title", 8.4, 12.8, 290, [(te.TITLE, 92, "bold", GOLD)]),
    ("03_hosts", 13.6, 17.8, 430, [
        (te.HOSTS, 70, "bold", GOLD),
        ("—", 0, "rule", GOLD),
        (te.INVITE_LINE, 48, "regular", CREAM),
        (te.INVITE_WELCOME, 66, "bold", GOLD),
    ]),
    ("04_ceremony", 18.6, 24.8, 360, [
        (te.CEREMONY, 84, "bold", GOLD),
        ("—", 0, "rule", GOLD),
        (te.DAY, 54, "regular", CREAM),
        (te.TIME_OF_DAY, 50, "regular", CREAM),
        (te.TIME_RANGE, 68, "bold", GOLD),
    ]),
    ("05_vratham", 25.6, 31.8, 1580, [
        (te.VRATHAM, 64, "bold", GOLD),
        ("—", 0, "rule", GOLD),
        (te.VRATHAM_TIME, 60, "bold", CREAM),
    ]),
    ("06_venue", 32.5, 35.7, 330, [
        (te.VENUE_LABEL, 52, "bold", GOLD),
        ("—", 0, "rule", GOLD),
        (te.VENUE_NAME, 62, "bold", CREAM),
        (te.VENUE_AREA, 54, "regular", CREAM),
        (te.VENUE_TOWN, 54, "regular", CREAM),
    ]),
    ("07_closing", 35.9, 38.0, 330, [(te.CLOSING, 96, "bold", GOLD)]),
]


def fit(text, size, weight):
    while line_size(text, size, weight)[0] > MAX_W and size > 20:
        size -= 2
    return size


def rule(width=360):
    im = Image.new("RGBA", (width, 30), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    g = tuple(int(c * 255) for c in GOLD)
    cx = width // 2
    d.line([(10, 15), (cx - 22, 15)], fill=g + (255,), width=2)
    d.line([(cx + 22, 15), (width - 10, 15)], fill=g + (255,), width=2)
    d.polygon([(cx, 4), (cx + 11, 15), (cx, 26), (cx - 11, 15)], fill=g + (255,))
    for x in (cx - 30, cx + 30):
        d.ellipse([x - 4, 11, x + 4, 19], fill=g + (255,))
    return im


def card(lines, centre_y):
    blocks = []
    for text, size, weight, color in lines:
        if weight == "rule":
            blocks.append(rule())
        else:
            blocks.append(draw_line(text, fit(text, size, weight), weight, color))
    gap = 10
    total = sum(b.height for b in blocks) + gap * (len(blocks) - 1)
    width = max(b.width for b in blocks)
    pw, ph = min(W - 60, width + 120), total + 90
    x0, y0 = (W - pw) // 2, int(centre_y - ph / 2)

    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([x0 + 6, y0 + 12, x0 + pw + 6, y0 + ph + 12], 34, fill=(0, 0, 0, 120))
    canvas = Image.alpha_composite(canvas, shadow.filter(ImageFilter.GaussianBlur(18)))
    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle([x0, y0, x0 + pw, y0 + ph], 30, fill=(58, 10, 14, 178))
    g = tuple(int(c * 255) for c in GOLD)
    d.rounded_rectangle([x0, y0, x0 + pw, y0 + ph], 30, outline=g + (230,), width=3)
    d.rounded_rectangle([x0 + 10, y0 + 10, x0 + pw - 10, y0 + ph - 10], 24, outline=g + (110,), width=1)

    text_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    y = y0 + 45
    for b in blocks:
        text_layer.paste(b, ((W - b.width) // 2, y), b)
        y += b.height + gap
    glow = text_layer.split()[3].filter(ImageFilter.GaussianBlur(5))
    halo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    halo.putalpha(glow.point(lambda v: int(v * 0.6)))
    canvas = Image.alpha_composite(canvas, halo)
    return Image.alpha_composite(canvas, text_layer)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, t0, t1, cy, lines in CARDS:
        card(lines, cy).save(OUT / f"{name}.png")
        print(name, t0, t1)


if __name__ == "__main__":
    main()
