"""Render the Telugu titles as transparent type, separate from any footage."""

from __future__ import annotations

import cairo
import gi

gi.require_version("Pango", "1.0")
gi.require_version("PangoCairo", "1.0")
from gi.repository import Pango, PangoCairo
from PIL import Image

from copy_te import PROOF_LINES

FONT = "Noto Serif Telugu"
INK = (0.965, 0.945, 0.890)
PAPER = (0.16, 0.08, 0.07)


def line_size(text: str, size: int, weight: str = "regular") -> tuple[int, int]:
    surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, 8, 8)
    ctx = cairo.Context(surface)
    layout = PangoCairo.create_layout(ctx)
    style = "Bold" if weight == "bold" else "Regular"
    layout.set_font_description(Pango.font_description_from_string(f"{FONT} {style} {size}"))
    layout.set_text(text, -1)
    return layout.get_pixel_size()


def draw_line(text: str, size: int, weight: str = "regular", color=INK) -> Image.Image:
    width, height = line_size(text, size, weight)
    pad_x, pad_y = 8, 6
    surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, width + pad_x * 2, height + pad_y * 2)
    ctx = cairo.Context(surface)
    ctx.set_source_rgba(0, 0, 0, 0)
    ctx.paint()
    layout = PangoCairo.create_layout(ctx)
    style = "Bold" if weight == "bold" else "Regular"
    layout.set_font_description(Pango.font_description_from_string(f"{FONT} {style} {size}"))
    layout.set_text(text, -1)
    ctx.set_source_rgba(*color, 1)
    ctx.move_to(pad_x, pad_y)
    PangoCairo.show_layout(ctx, layout)
    surface.flush()
    return Image.frombuffer(
        "RGBA",
        (surface.get_width(), surface.get_height()),
        bytes(surface.get_data()),
        "raw",
        "BGRA",
        0,
        1,
    ).convert("RGBA")


def render_proof(path: str, size: int = 64) -> str:
    gap = 28
    rendered = [draw_line(line, size, "bold" if i in (1, 4) else "regular") for i, line in enumerate(PROOF_LINES)]
    width = max(item.width for item in rendered) + 120
    height = sum(item.height for item in rendered) + gap * (len(rendered) + 1)
    sheet = Image.new("RGB", (width, height), tuple(int(c * 255) for c in PAPER))
    y = gap
    for item in rendered:
        sheet.paste(item, ((width - item.width) // 2, y), item)
        y += item.height + gap
    sheet.save(path, "PNG")
    return path
