"""Low-res "Famicom" style shark silhouette for the shark-attack animation.

Side view, facing RIGHT (it swims left->right across the pet viewport). Drawn on
a wide low-res grid scaled 8x with nearest-neighbour, 1px dark outline, flat
palette, transparent background - matching the shipped sprites.

Output: assets/sprites/ui/shark.png
"""

from pathlib import Path

from PIL import Image

W, H = 46, 24
SCALE = 8

OUTLINE = (18, 28, 33, 255)
BODY = (54, 78, 88, 255)
BELLY = (92, 120, 130, 255)
EYE = (245, 250, 252, 255)
PUPIL = (18, 28, 33, 255)
TOOTH = (238, 244, 246, 255)


def ellipse_cells(cx, cy, rx, ry):
    cells = set()
    for y in range(H):
        for x in range(W):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0:
                cells.add((x, y))
    return cells


def tri_cells(p0, p1, p2):
    (x0, y0), (x1, y1), (x2, y2) = p0, p1, p2

    def sign(ax, ay, bx, by, cx, cy):
        return (ax - cx) * (by - cy) - (bx - cx) * (ay - cy)

    cells = set()
    minx, maxx = min(x0, x1, x2), max(x0, x1, x2)
    miny, maxy = min(y0, y1, y2), max(y0, y1, y2)
    for y in range(miny, maxy + 1):
        for x in range(minx, maxx + 1):
            d1 = sign(x, y, x0, y0, x1, y1)
            d2 = sign(x, y, x1, y1, x2, y2)
            d3 = sign(x, y, x2, y2, x0, y0)
            has_neg = (d1 < 0) or (d2 < 0) or (d3 < 0)
            has_pos = (d1 > 0) or (d2 > 0) or (d3 > 0)
            if not (has_neg and has_pos):
                cells.add((x, y))
    return cells


def is_border(cell, sil):
    x, y = cell
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        if (x + dx, y + dy) not in sil:
            return True
    return False


def build():
    body = ellipse_cells(22, 12, 17, 5.6)
    dorsal = tri_cells((17, 8), (27, 8), (19, 1))       # top fin
    pectoral = tri_cells((23, 15), (32, 15), (25, 22))  # bottom fin
    tail_up = tri_cells((9, 12), (1, 3), (10, 10))      # upper tail lobe
    tail_lo = tri_cells((9, 12), (1, 21), (10, 15))     # lower tail lobe

    sil = body | dorsal | pectoral | tail_up | tail_lo

    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = img.load()

    for (x, y) in sil:
        if is_border((x, y), sil):
            px[x, y] = OUTLINE
        else:
            px[x, y] = BELLY if y >= 14 else BODY

    # gill slits
    for gx in (28, 30, 32):
        for gy in (10, 11, 12):
            if (gx, gy) in sil and not is_border((gx, gy), sil):
                px[gx, gy] = OUTLINE

    # mouth line + teeth near the snout (right side)
    for mx in range(33, 39):
        if (mx, 15) in sil:
            px[mx, 15] = OUTLINE
    for tx in (34, 36, 38):
        if (tx, 14) in sil:
            px[tx, 14] = TOOTH

    # eye
    px[35, 10] = EYE
    px[36, 10] = PUPIL

    return img.resize((W * SCALE, H * SCALE), Image.NEAREST)


def main():
    out = Path("assets/sprites/ui/shark.png")
    out.parent.mkdir(parents=True, exist_ok=True)
    build().save(out)
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
