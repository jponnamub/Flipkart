"""Ultra HD (2160x3840) invitation card built around a high-resolution Blender render of the entrance."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, str(Path(__file__).resolve().parent))
import copy_te as te  # noqa: E402
from typography import draw_line, line_size  # noqa: E402

W, H = 2160, 3840
GOLD = (0.98, 0.80, 0.42)
CREAM = (0.98, 0.95, 0.88)
ROOT = Path(__file__).resolve().parents[1]
G8 = tuple(int(c * 255) for c in GOLD)


def fit(text, size, weight, max_w=1900):
    while line_size(text, size, weight)[0] > max_w and size > 20:
        size -= 2
    return size


def stack(canvas, lines, y, gap=22):
    for text, size, weight, color in lines:
        if weight == "rule":
            r = rule(700)
            canvas.alpha_composite(r, ((W - r.width) // 2, y))
            y += r.height + gap
            continue
        im = draw_line(text, fit(text, size, weight), weight, color)
        canvas.alpha_composite(im, ((W - im.width) // 2, y))
        y += im.height + gap
    return y


def rule(width):
    im = Image.new("RGBA", (width, 50), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx = width // 2
    d.line([(10, 25), (cx - 40, 25)], fill=G8 + (255,), width=4)
    d.line([(cx + 40, 25), (width - 10, 25)], fill=G8 + (255,), width=4)
    d.polygon([(cx, 6), (cx + 20, 25), (cx, 44), (cx - 20, 25)], fill=G8 + (255,))
    for x in (cx - 55, cx + 55):
        d.ellipse([x - 7, 18, x + 7, 32], fill=G8 + (255,))
    return im


def background():
    bg = Image.new("RGB", (W, H), (70, 10, 16))
    grad = Image.linear_gradient("L").resize((W, H))
    dark = Image.new("RGB", (W, H), (34, 5, 9))
    bg = Image.composite(dark, bg, grad.point(lambda v: int(abs(v - 128) * 1.6)))
    bg = bg.convert("RGBA")
    d = ImageDraw.Draw(bg)
    for inset, w, a in ((50, 8, 255), (80, 3, 170)):
        d.rounded_rectangle([inset, inset, W - inset, H - inset], 60, outline=G8 + (a,), width=w)
    for cx, cy in ((130, 130), (W - 130, 130), (130, H - 130), (W - 130, H - 130)):
        for r in (36, 22):
            d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=G8 + (255,), width=4)
        d.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], fill=G8 + (255,))
    return bg


def main(frame: str, out: str):
    card = background()
    y = stack(card, [(te.MANTRA, 64, "bold", GOLD)], 170)
    y = stack(card, [(te.TITLE, 150, "bold", GOLD)], y + 10)
    y = stack(card, [("—", 0, "rule", GOLD)], y + 4)
    y = stack(card, [(te.INVITE_LINE, 74, "regular", CREAM), (te.INVITE_WELCOME, 96, "bold", GOLD)], y)

    shot = Image.open(frame).convert("RGB")
    sw, sh = shot.size
    tw, th = 1900, 1220
    ch = int(sw * th / tw)
    c0 = min(sh - ch, max(0, int(sh * 0.69) - ch // 2))
    crop = shot.crop((0, c0, sw, c0 + ch)).resize((tw, th), Image.LANCZOS)
    top = y + 40
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([(W - tw) // 2 + 10, top + 20, (W + tw) // 2 + 10, top + th + 20], 40,
                                             fill=(0, 0, 0, 160))
    card = Image.alpha_composite(card, shadow.filter(ImageFilter.GaussianBlur(24)))
    mask = Image.new("L", (tw, th), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, tw - 1, th - 1], 40, fill=255)
    card.paste(crop, ((W - tw) // 2, top), mask)
    ImageDraw.Draw(card).rounded_rectangle([(W - tw) // 2 - 6, top - 6, (W + tw) // 2 + 6, top + th + 6], 46,
                                           outline=G8 + (255,), width=8)

    y = top + th + 60
    y = stack(card, [(te.HOSTS, 96, "bold", GOLD)], y)
    y = stack(card, [("—", 0, "rule", GOLD)], y)
    y = stack(card, [(f"{te.CEREMONY}  ·  {te.DAY}", 64, "bold", CREAM),
                     (f"{te.TIME_OF_DAY} {te.TIME_RANGE}", 64, "regular", CREAM),
                     (f"{te.VRATHAM}  ·  {te.VRATHAM_TIME}", 60, "regular", CREAM)], y, gap=16)
    y = stack(card, [("—", 0, "rule", GOLD)], y)
    y = stack(card, [(f"{te.VENUE_LABEL}: {te.VENUE_NAME}", 64, "bold", GOLD),
                     (f"{te.VENUE_AREA}, {te.VENUE_TOWN}", 60, "regular", CREAM)], y, gap=16)
    stack(card, [(te.CLOSING, 92, "bold", GOLD)], y + 30)
    card.convert("RGB").save(out, quality=95)
    print(out, y)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
