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
INTERIOR_HOLE_MAX = 0  # enclosed transparent pixels inside silhouette — shell highlights must not punch through


def count_enclosed_transparent_pixels(im: Image.Image) -> int:
    """Transparent pixels touching opaque neighbors — visible holes in the sprite."""
    w, h = im.size
    px = im.load()
    n = 0
    for y in range(h):
        for x in range(w):
            if px[x, y][3] != 0:
                continue
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] > 128:
                    n += 1
                    break
    return n


def validate_no_interior_holes(im: Image.Image, *, strict: bool) -> None:
    holes = count_enclosed_transparent_pixels(im)
    if holes <= INTERIOR_HOLE_MAX:
        return
    msg = (
        f"INTERIOR_HOLES: {holes} enclosed transparent pixel(s) inside silhouette. "
        f"Bright shell/body highlights were likely defringed or white-flooded — re-run prep; do not ship."
    )
    if strict:
        raise SystemExit(msg)
    print(f"WARNING: {msg}", file=sys.stderr)


def exterior_transparent_mask(im: Image.Image) -> list[list[bool]]:
    w, h = im.size
    px = im.load()
    ext = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        for y in (0, h - 1):
            if px[x, y][3] == 0:
                ext[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if px[x, y][3] == 0 and not ext[y][x]:
                ext[y][x] = True
                q.append((x, y))

    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not ext[ny][nx] and px[nx, ny][3] == 0:
                ext[ny][nx] = True
                q.append((nx, ny))
    return ext


def restore_enclosed_highlights(src: Image.Image, out: Image.Image, min_non_bg_neighbors: int = 6) -> Image.Image:
    """Put back near-white shell/body highlights removed by background flood."""
    if src.size != out.size:
        raise ValueError("restore_enclosed_highlights requires matching dimensions")
    src_px = src.convert("RGBA").load()
    out = out.copy()
    opx = out.load()
    w, h = out.size
    dirs = (
        (1, 0), (-1, 0), (0, 1), (0, -1),
        (1, 1), (1, -1), (-1, 1), (-1, -1),
    )
    for y in range(h):
        for x in range(w):
            if opx[x, y][3] != 0:
                continue
            sr, sg, sb, sa = src_px[x, y]
            if sa <= 128 or not is_background_pixel(sr, sg, sb):
                continue
            non_bg = 0
            for dx, dy in dirs:
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and opx[nx, ny][3] > 128:
                    nr, ng, nb = opx[nx, ny][:3]
                    if not is_background_pixel(nr, ng, nb):
                        non_bg += 1
            if non_bg >= min_non_bg_neighbors:
                opx[x, y] = (sr, sg, sb, 255)
    return out


def close_interior_holes(im: Image.Image, max_passes: int = 16) -> Image.Image:
    """Fill transparent pockets fully enclosed by the sprite silhouette."""
    out = im.copy()
    px = out.load()
    w, h = out.size
    dirs = (
        (1, 0), (-1, 0), (0, 1), (0, -1),
        (1, 1), (1, -1), (-1, 1), (-1, -1),
    )

    for _ in range(max_passes):
        ext = exterior_transparent_mask(out)
        pending: list[tuple[int, int, tuple[int, int, int, int]]] = []
        for y in range(h):
            for x in range(w):
                if px[x, y][3] != 0 or ext[y][x]:
                    continue
                neighbors = [
                    px[x + dx, y + dy]
                    for dx, dy in dirs
                    if 0 <= x + dx < w and 0 <= y + dy < h and px[x + dx, y + dy][3] > 128
                ]
                if not neighbors:
                    continue
                bright = sum(1 for c in neighbors if min(c[:3]) >= 230)
                if bright >= max(1, len(neighbors) // 2):
                    color = (252, 252, 252, 255)
                else:
                    r = sum(c[0] for c in neighbors) // len(neighbors)
                    g = sum(c[1] for c in neighbors) // len(neighbors)
                    b = sum(c[2] for c in neighbors) // len(neighbors)
                    color = (r, g, b, 255)
                pending.append((x, y, color))
        if not pending:
            break
        for x, y, color in pending:
            px[x, y] = color

    out = close_interior_transparent_components(out)
    return out


def is_shell_tone_pixel(r: int, g: int, b: int, a: int = 255) -> bool:
    """Warm brown conch shell — matches visible flood-punch artifacts in game."""
    if a < 200:
        return False
    mn = min(r, g, b)
    if mn <= 30:
        return False
    return r > b


def count_shell_highlight_holes(im: Image.Image) -> int:
    """Transparent pixels touching opaque shell-toned neighbors (visible shell piercing)."""
    w, h = im.size
    px = im.load()
    n = 0
    for y in range(h):
        for x in range(w):
            if px[x, y][3] != 0:
                continue
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h:
                    nr, ng, nb, na = px[nx, ny]
                    if is_shell_tone_pixel(nr, ng, nb, na):
                        n += 1
                        break
    return n


def patch_shell_highlight_holes(im: Image.Image) -> Image.Image:
    """Fill flood-punched shell highlights with near-white (matches source highlight intent)."""
    out = im.copy()
    px = out.load()
    w, h = out.size
    dirs = ((1, 0), (-1, 0), (0, 1), (0, -1))
    pending: list[tuple[int, int]] = []

    for y in range(h):
        for x in range(w):
            if px[x, y][3] != 0:
                continue
            if not any(
                0 <= x + dx < w
                and 0 <= y + dy < h
                and is_shell_tone_pixel(*px[x + dx, y + dy])
                for dx, dy in dirs
            ):
                continue
            pending.append((x, y))

    for x, y in pending:
        px[x, y] = (252, 252, 252, 255)
    return out


def validate_no_shell_holes(im: Image.Image, *, strict: bool) -> None:
    holes = count_shell_highlight_holes(im)
    if holes == 0:
        return
    msg = (
        f"SHELL_HOLES: {holes} transparent pixel(s) inside conch shell tones. "
        f"Bright highlights were likely white-flooded — re-run prep; do not ship."
    )
    if strict:
        raise SystemExit(msg)
    print(f"WARNING: {msg}", file=sys.stderr)


def close_interior_transparent_components(im: Image.Image) -> Image.Image:
    """Fill interior transparent components using colors from their opaque boundary."""
    out = im.copy()
    px = out.load()
    w, h = out.size
    ext = exterior_transparent_mask(out)
    seen = [[False] * w for _ in range(h)]

    for sy in range(h):
        for sx in range(w):
            if seen[sy][sx] or px[sx, sy][3] != 0 or ext[sy][sx]:
                continue
            stack = [(sx, sy)]
            comp: list[tuple[int, int]] = []
            seen[sy][sx] = True
            boundary: list[tuple[int, int, int, int]] = []
            while stack:
                x, y = stack.pop()
                comp.append((x, y))
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if not (0 <= nx < w and 0 <= ny < h):
                        continue
                    if px[nx, ny][3] > 128:
                        boundary.append(px[nx, ny])
                    elif not seen[ny][nx] and not ext[ny][nx] and px[nx, ny][3] == 0:
                        seen[ny][nx] = True
                        stack.append((nx, ny))
            if not boundary:
                continue
            bright = sum(1 for c in boundary if min(c[:3]) >= 230)
            if bright >= len(boundary) // 2:
                color = (252, 252, 252, 255)
            else:
                r = sum(c[0] for c in boundary) // len(boundary)
                g = sum(c[1] for c in boundary) // len(boundary)
                b = sum(c[2] for c in boundary) // len(boundary)
                color = (r, g, b, 255)
            for x, y in comp:
                px[x, y] = color
    return out


def count_opaque_non_halo_neighbors(
    px,
    w: int,
    h: int,
    x: int,
    y: int,
) -> int:
    n = 0
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < w and 0 <= ny < h:
            nr, ng, nb, na = px[nx, ny]
            if na > 0 and not is_halo_pixel(nr, ng, nb):
                n += 1
    return n


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
            # Interior shell/body highlights — not matte fringe.
            if count_opaque_non_halo_neighbors(px, w, h, x, y) >= 2:
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


def prepare(
    im: Image.Image,
    *,
    strict_validation: bool = True,
    defringe_output: bool = True,
    repair_shell_holes: bool = False,
) -> Image.Image:
    flooded = flood_transparent(im)
    validate_after_flood(im, flooded, strict=strict_validation)
    if repair_shell_holes:
        flooded = restore_enclosed_highlights(im, flooded, min_non_bg_neighbors=6)
    cut = keep_largest_component(flooded)
    cut = solidify_alpha(cut)
    if defringe_output:
        cut = defringe(cut)
    result = fit_to_ref_bbox(cut)
    result = close_interior_holes(result)
    if repair_shell_holes:
        result = patch_shell_highlight_holes(result)
        validate_no_shell_holes(result, strict=strict_validation)
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
