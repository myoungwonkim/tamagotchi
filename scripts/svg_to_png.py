#!/usr/bin/env python3
"""Convert tamagotchi SVG sprites to PNG with transparent background."""

import argparse
import math
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

NS = {"svg": "http://www.w3.org/2000/svg"}
VIEWBOX = 128


def parse_color(value, opacity=1.0):
    if not value or value == "none":
        return None
    value = value.strip()
    if value.startswith("#"):
        hexv = value[1:]
        if len(hexv) == 3:
            hexv = "".join(c * 2 for c in hexv)
        r, g, b = int(hexv[0:2], 16), int(hexv[2:4], 16), int(hexv[4:6], 16)
        return (r, g, b, int(max(0, min(1, opacity)) * 255))
    return (0, 0, 0, int(max(0, min(1, opacity)) * 255))


def parse_floats(text):
    return [float(x) for x in re.findall(r"-?\d*\.?\d+(?:e[-+]?\d+)?", text, re.I)]


def parse_points(text):
    nums = parse_floats(text)
    return [(nums[i], nums[i + 1]) for i in range(0, len(nums) - 1, 2)]


def lerp(a, b, t):
    return a + (b - a) * t


def cubic_bezier(p0, p1, p2, p3, steps=24):
    pts = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        x = u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    return pts


def quad_bezier(p0, p1, p2, steps=20):
    pts = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        x = u**2 * p0[0] + 2 * u * t * p1[0] + t**2 * p2[0]
        y = u**2 * p0[1] + 2 * u * t * p1[1] + t**2 * p2[1]
        pts.append((x, y))
    return pts


def parse_path(d):
    tokens = re.findall(r"[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?", d)
    idx = 0
    subpaths = []
    current = []
    start = None
    pos = (0.0, 0.0)

    def read(n):
        nonlocal idx
        vals = [float(tokens[idx + i]) for i in range(n)]
        idx += n
        return vals

    while idx < len(tokens):
        cmd = tokens[idx]
        if cmd.isalpha():
            idx += 1
        else:
            cmd = "L"

        if cmd == "M":
            if current:
                subpaths.append(current)
            x, y = read(2)
            pos = (x, y)
            start = pos
            current = [("move", pos)]
        elif cmd == "L":
            x, y = read(2)
            pos = (x, y)
            current.append(("line", pos))
        elif cmd == "Q":
            x1, y1, x, y = read(4)
            pts = quad_bezier(pos, (x1, y1), (x, y))
            for p in pts[1:]:
                current.append(("line", p))
            pos = (x, y)
        elif cmd == "C":
            x1, y1, x2, y2, x, y = read(6)
            pts = cubic_bezier(pos, (x1, y1), (x2, y2), (x, y))
            for p in pts[1:]:
                current.append(("line", p))
            pos = (x, y)
        elif cmd == "Z":
            if start:
                current.append(("line", start))
            pos = start or pos
        else:
            raise ValueError(f"Unsupported path command: {cmd}")

    if current:
        subpaths.append(current)
    return subpaths


def elem_attr(el, name, default=None):
    return el.get(name, default)


def elem_opacity(el):
    op = elem_attr(el, "opacity")
    return float(op) if op is not None else 1.0


def scale_point(x, y, scale):
    return x * scale, y * scale


def draw_stroked_ellipse(draw, cx, cy, rx, ry, fill, stroke, stroke_w, scale):
    x0, y0 = scale_point(cx - rx, cy - ry, scale)
    x1, y1 = scale_point(cx + rx, cy + ry, scale)
    sw = max(1, stroke_w * scale)
    if stroke and fill:
        draw.ellipse([x0, y0, x1, y1], fill=fill, outline=stroke, width=int(round(sw)))
    elif fill:
        draw.ellipse([x0, y0, x1, y1], fill=fill)
    elif stroke:
        draw.ellipse([x0, y0, x1, y1], outline=stroke, width=int(round(sw)))


def draw_stroked_circle(draw, cx, cy, r, fill, stroke, stroke_w, scale):
    draw_stroked_ellipse(draw, cx, cy, r, r, fill, stroke, stroke_w, scale)


def draw_stroked_polygon(draw, points, fill, stroke, stroke_w, scale):
    scaled = [scale_point(x, y, scale) for x, y in points]
    sw = max(1, stroke_w * scale)
    if stroke and fill:
        draw.polygon(scaled, fill=fill, outline=stroke)
        if sw > 1:
            draw.line(scaled + [scaled[0]], fill=stroke, width=int(round(sw)))
    elif fill:
        draw.polygon(scaled, fill=fill)
    elif stroke:
        draw.line(scaled + [scaled[0]], fill=stroke, width=int(round(sw)))


def draw_stroked_rect(draw, x, y, w, h, rx, fill, stroke, stroke_w, scale):
    x0, y0 = scale_point(x, y, scale)
    x1, y1 = scale_point(x + w, y + h, scale)
    sw = max(1, stroke_w * scale)
    if rx:
        draw.rounded_rectangle([x0, y0, x1, y1], radius=rx * scale, fill=fill, outline=stroke, width=int(round(sw)))
    else:
        draw.rectangle([x0, y0, x1, y1], fill=fill, outline=stroke, width=int(round(sw)))


def draw_path(draw, subpaths, fill, stroke, stroke_w, scale, linecap="round"):
    sw = max(1, stroke_w * scale)
    for sub in subpaths:
        pts = [scale_point(*p[1], scale) for p in sub if p[0] == "line"]
        if not pts:
            continue
        if fill and len(pts) >= 3:
            draw.polygon(pts, fill=fill)
        if stroke:
            draw.line(pts, fill=stroke, width=int(round(sw)))


def draw_text(draw, el, scale):
    x = float(elem_attr(el, "x", "0"))
    y = float(elem_attr(el, "y", "0"))
    text = (el.text or "").strip()
    if not text:
        return
    size = float(elem_attr(el, "font-size", "16"))
    fill = parse_color(elem_attr(el, "fill", "#000"), elem_opacity(el))
    font = ImageFont.load_default()
    px, py = scale_point(x, y, scale)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    anchor = elem_attr(el, "text-anchor", "start")
    if anchor == "middle":
        px -= tw / 2
    draw.text((px, py - th), text, fill=fill, font=font)


def render_element(draw, el, scale):
    tag = el.tag.split("}")[-1]
    op = elem_opacity(el)
    fill = parse_color(elem_attr(el, "fill"), op) if elem_attr(el, "fill") != "none" else None
    stroke = parse_color(elem_attr(el, "stroke"), op) if elem_attr(el, "stroke") else None
    stroke_w = float(elem_attr(el, "stroke-width", "0") or 0)
    linecap = elem_attr(el, "stroke-linecap", "butt")

    if tag == "ellipse":
        cx, cy = float(elem_attr(el, "cx")), float(elem_attr(el, "cy"))
        rx, ry = float(elem_attr(el, "rx")), float(elem_attr(el, "ry"))
        draw_stroked_ellipse(draw, cx, cy, rx, ry, fill, stroke, stroke_w, scale)
    elif tag == "circle":
        cx, cy = float(elem_attr(el, "cx")), float(elem_attr(el, "cy"))
        r = float(elem_attr(el, "r"))
        draw_stroked_circle(draw, cx, cy, r, fill, stroke, stroke_w, scale)
    elif tag == "polygon":
        points = parse_points(elem_attr(el, "points", ""))
        draw_stroked_polygon(draw, points, fill, stroke, stroke_w, scale)
    elif tag == "rect":
        x, y = float(elem_attr(el, "x")), float(elem_attr(el, "y"))
        w, h = float(elem_attr(el, "width")), float(elem_attr(el, "height"))
        rx = float(elem_attr(el, "rx", "0") or 0)
        draw_stroked_rect(draw, x, y, w, h, rx, fill, stroke, stroke_w, scale)
    elif tag == "line":
        x1, y1 = float(elem_attr(el, "x1")), float(elem_attr(el, "y1"))
        x2, y2 = float(elem_attr(el, "x2")), float(elem_attr(el, "y2"))
        sw = max(1, stroke_w * scale)
        draw.line([scale_point(x1, y1, scale), scale_point(x2, y2, scale)], fill=stroke, width=int(round(sw)))
    elif tag == "path":
        subpaths = parse_path(elem_attr(el, "d", ""))
        draw_path(draw, subpaths, fill, stroke, stroke_w, scale, linecap)
    elif tag == "text":
        draw_text(draw, el, scale)


def svg_to_png(svg_path, png_path, size=256):
    tree = ET.parse(svg_path)
    root = tree.getroot()
    scale = size / VIEWBOX
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for el in root:
        render_element(draw, el, scale)
    png_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(png_path, "PNG")
    return png_path


def main():
    parser = argparse.ArgumentParser(description="Convert tamagotchi SVG sprite to PNG")
    parser.add_argument("svg", type=Path)
    parser.add_argument("-o", "--output", type=Path)
    parser.add_argument("-s", "--size", type=int, default=256, choices=[128, 256])
    args = parser.parse_args()
    out = args.output or args.svg.with_suffix(".png")
    svg_to_png(args.svg, out, args.size)
    print(out)


if __name__ == "__main__":
    main()
