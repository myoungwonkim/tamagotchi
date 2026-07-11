#!/usr/bin/env python3
"""Minimal lingyu-style adult sprite staging prep.

Workflow: GenerateImage 256px → light flood bg removal → fit to scruffy REF_BBOX.
No pixelize, palette quantization, or interior hole filling.
"""

from __future__ import annotations

import argparse
import sys
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CANVAS = 256
FILL = 0.92
REF_BBOX = (27, 13, 229, 243)
INK = (32, 24, 20)
WHITE_BODY_MIN = 5000  # min neutral near-white px in source to treat as white-body character
WHITE_BODY_MAX_LOSS = 0.30
NEAR_WHITE_MIN = 228
NEAR_WHITE_MAX_SAT = 25


def is_background_pixel(r: int, g: int, b: int) -> bool:
    """Bright neutral canvas — safe to flood from edges."""
    mn = min(r, g, b)
    if mn < 240:
        return False
    sat = max(r, g, b) - mn
    return sat <= 20


def is_outline_barrier(r: int, g: int, b: int) -> bool:
    """Dark outline ink — blocks background flood into character interior."""
    return r + g + b <= 200


def is_halo_pixel(r: int, g: int, b: int) -> bool:
    """Light matte fringe near transparency — not cream/white character fill."""
    if max(r, g, b) < 170:
        return False
    mn = min(r, g, b)
    sat = max(r, g, b) - mn
    if mn >= 248 and sat <= 12:
        return True
    return sat < 48 and max(r, g, b) > 175 and mn >= 240


def character_content_bbox(im: Image.Image) -> tuple[int, int, int, int] | None:
    """Approximate character region on a bright canvas (outline + non-bg pixels)."""
    rgb = im.convert("RGB")
    px = rgb.load()
    w, h = rgb.size
    min_x, min_y, max_x, max_y = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if is_outline_barrier(r, g, b) or not is_background_pixel(r, g, b):
                found = True
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x + 1)
                max_y = max(max_y, y + 1)
    if not found:
        return None
    return (min_x, min_y, max_x, max_y)


def is_near_white_body_pixel(r: int, g: int, b: int) -> bool:
    mn = min(r, g, b)
    sat = max(r, g, b) - mn
    return mn >= NEAR_WHITE_MIN and sat <= NEAR_WHITE_MAX_SAT


def count_near_white_opaque(im: Image.Image, bbox: tuple[int, int, int, int]) -> int:
    px = im.convert("RGBA").load()
    x0, y0, x1, y1 = bbox
    n = 0
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b, a = px[x, y]
            if a >= 240 and is_near_white_body_pixel(r, g, b):
                n += 1
    return n


def count_character_near_white_rgb(im: Image.Image) -> int:
    """Neutral near-white pixels belonging to the character — excludes bright canvas."""
    rgb = im.convert("RGB")
    px = rgb.load()
    w, h = rgb.size
    n = 0
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if is_background_pixel(r, g, b):
                continue
            if is_near_white_body_pixel(r, g, b):
                n += 1
    return n


def count_opaque_near_white(im: Image.Image) -> int:
    bbox = im.getbbox()
    if bbox is None:
        return 0
    return count_near_white_opaque(im, bbox)


def validate_after_flood(im_before: Image.Image, flooded: Image.Image, *, strict: bool) -> None:
    """Same-resolution check right after background flood."""
    before = count_character_near_white_rgb(im_before)
    if before == 0:
        return
    after = count_opaque_near_white(flooded)
    loss = (before - after) / before
    if loss <= WHITE_BODY_MAX_LOSS:
        return
    msg = (
        f"WHITE_BODY_LOSS [flood]: near-white fill loss {loss:.1%} "
        f"({before} -> {after}). White/cream body was likely flood-stripped. "
        f"Use outline-protected flood in prepare_staging_adult.py; do not ship."
    )
    if strict and before >= WHITE_BODY_MIN:
        raise SystemExit(msg)
    print(f"WARNING: {msg}", file=sys.stderr)


FINAL_NEAR_WHITE_MIN = 400  # minimum opaque near-white px on 256×256 for white-body characters


def validate_final_output(im_before: Image.Image, result: Image.Image, *, strict: bool) -> None:
    """256×256 output must retain enough near-white fill for white-body characters."""
    if count_character_near_white_rgb(im_before) < WHITE_BODY_MIN:
        return
    after = count_opaque_near_white(result)
    if after >= FINAL_NEAR_WHITE_MIN:
        return
    msg = (
        f"WHITE_BODY_TOO_THIN [final]: near-white opaque {after} < {FINAL_NEAR_WHITE_MIN}. "
        f"White/cream body likely transparent in game — re-run prep; do not ship."
    )
    if strict:
        raise SystemExit(msg)
    print(f"WARNING: {msg}", file=sys.stderr)


def flood_transparent(im: Image.Image) -> Image.Image:
    """Remove bright canvas background reachable from edges; outline blocks interior."""
    rgb = im.convert("RGB")
    w, h = rgb.size
    px = rgb.load()
    mask = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    def seed(x: int, y: int) -> None:
        if 0 <= x < w and 0 <= y < h and not mask[y][x]:
            r, g, b = px[x, y]
            if is_background_pixel(r, g, b):
                mask[y][x] = True
                q.append((x, y))

    for x in range(w):
        seed(x, 0)
        seed(x, h - 1)
    for y in range(h):
        seed(0, y)
        seed(w - 1, y)

    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not mask[ny][nx]:
                r, g, b = px[nx, ny]
                if is_outline_barrier(r, g, b):
                    continue
                if is_background_pixel(r, g, b):
                    mask[ny][nx] = True
                    q.append((nx, ny))

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for y in range(h):
        for x in range(w):
            if not mask[y][x]:
                opx[x, y] = (*px[x, y], 255)
    return out


def keep_largest_component(im: Image.Image) -> Image.Image:
    w, h = im.size
    px = im.load()
    seen = [[False] * w for _ in range(h)]
    best: list[tuple[int, int]] = []

    for sy in range(h):
        for sx in range(w):
            if seen[sy][sx] or px[sx, sy][3] == 0:
                continue
            stack = [(sx, sy)]
            seen[sy][sx] = True
            comp: list[tuple[int, int]] = []
            while stack:
                x, y = stack.pop()
                comp.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and px[nx, ny][3] > 0:
                        seen[ny][nx] = True
                        stack.append((nx, ny))
            if len(comp) > len(best):
                best = comp

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for x, y in best:
        opx[x, y] = px[x, y]
    return out


def defringe(
    im: Image.Image,
    ink: tuple[int, int, int] = INK,
    max_dist: int = 2,
) -> Image.Image:
    """Remove light matte fringe near transparency."""
    w, h = im.size
    px = im.load()
    out = im.copy()
    opx = out.load()

    void_dist = [[10**9] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in range(h):
            if px[x, y][3] == 0:
                void_dist[y][x] = 0
                q.append((x, y))
    while q:
        x, y = q.popleft()
        nd = void_dist[y][x] + 1
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and void_dist[ny][nx] > nd:
                void_dist[ny][nx] = nd
                q.append((nx, ny))

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0 or void_dist[y][x] > max_dist or not is_halo_pixel(r, g, b):
                continue

            replacement = None
            for radius in range(1, 6):
                for nx in range(x - radius, x + radius + 1):
                    for ny in range(y - radius, y + radius + 1):
                        if nx == x and ny == y:
                            continue
                        if not (0 <= nx < w and 0 <= ny < h):
                            continue
                        nr, ng, nb, na = px[nx, ny]
                        if na > 0 and not is_halo_pixel(nr, ng, nb):
                            replacement = (nr, ng, nb, 255)
                            break
                    if replacement:
                        break
                if replacement:
                    break
            if replacement:
                opx[x, y] = replacement
            elif void_dist[y][x] <= 1:
                opx[x, y] = (*ink, 255)

    return out


def solidify_alpha(im: Image.Image) -> Image.Image:
    out = im.copy().convert("RGBA")
    px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if a < 255:
                r = min(255, int(r * 255 / max(a, 1)))
                g = min(255, int(g * 255 / max(a, 1)))
                b = min(255, int(b * 255 / max(a, 1)))
            px[x, y] = (r, g, b, 255)
    return out


def fit_to_ref_bbox(im: Image.Image) -> Image.Image:
    """Scale content and center within scruffy REF_BBOX on a 256×256 canvas."""
    bbox = im.getbbox()
    if not bbox:
        return Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))

    cropped = im.crop(bbox)
    sw, sh = cropped.size
    rw = REF_BBOX[2] - REF_BBOX[0]
    rh = REF_BBOX[3] - REF_BBOX[1]
    scale = min((rw * FILL) / sw, (rh * FILL) / sh)
    nw = max(1, int(sw * scale))
    nh = max(1, int(sh * scale))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    x = REF_BBOX[0] + (rw - nw) // 2
    y = REF_BBOX[1] + (rh - nh) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas


def prepare(im: Image.Image, *, strict_validation: bool = True) -> Image.Image:
    flooded = flood_transparent(im)
    validate_after_flood(im, flooded, strict=strict_validation)
    cut = keep_largest_component(flooded)
    cut = solidify_alpha(cut)
    cut = defringe(cut)
    result = fit_to_ref_bbox(cut)
    validate_final_output(im, result, strict=strict_validation)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Lingyu-style minimal adult sprite staging prep")
    parser.add_argument("input", type=Path, help="Generated PNG (256px pixel art)")
    parser.add_argument("output", type=Path, nargs="?", help="Output path (default: overwrite input)")
    parser.add_argument(
        "--allow-white-loss",
        action="store_true",
        help="Do not exit on >30%% near-white loss (non-white-body sprites only)",
    )
    args = parser.parse_args()

    src = args.input if args.input.is_absolute() else ROOT / args.input
    if not src.exists():
        raise SystemExit(f"Missing source: {src}")

    out = args.output
    if out is None:
        dst = src
    else:
        dst = out if out.is_absolute() else ROOT / out

    result = prepare(Image.open(src).convert("RGBA"), strict_validation=not args.allow_white_loss)
    dst.parent.mkdir(parents=True, exist_ok=True)
    result.save(dst, "PNG")
    print(f"Saved {dst} bbox={result.getbbox()}")


if __name__ == "__main__":
    main()
