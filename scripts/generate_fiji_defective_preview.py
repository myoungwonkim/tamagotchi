#!/usr/bin/env python3
"""Stage Fiji-mermaid inspired mermaid sprites — preview only."""

from pathlib import Path
import shutil

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "assets" / "custom"
USER_REF = Path(
    "/Users/myoungwonkim/.cursor/projects/Users-myoungwonkim-Desktop-kaffeine-tamagotchi"
    "/assets/images-f72d5cd6-67e8-4a7f-b602-38753c66d375.png"
)

GRID = 64
OUT = 256
INK = (24, 18, 14, 255)


def blank():
    return [[(0, 0, 0, 0) for _ in range(GRID)] for _ in range(GRID)]


def px(g, x, y, c):
    if 0 <= x < GRID and 0 <= y < GRID:
        g[y][x] = c


def hline(g, x0, x1, y, c):
    for x in range(x0, x1 + 1):
        px(g, x, y, c)


def draw_line(g, x0, y0, x1, y1, c):
    dx, dy = abs(x1 - x0), abs(y1 - y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err = dx - dy
    while True:
        px(g, x0, y0, c)
        if x0 == x1 and y0 == y1:
            break
        e2 = err * 2
        if e2 > -dy:
            err -= dy
            x0 += sx
        if e2 < dx:
            err += dx
            y0 += sy


def fill_ellipse(g, cx, cy, rx, ry, fill, shade=None):
    for y in range(GRID):
        for x in range(GRID):
            dx = (x - cx) / max(rx, 0.5)
            dy = (y - cy) / max(ry, 0.5)
            if dx * dx + dy * dy <= 1.0:
                c = shade if shade and y > cy + 0.5 else fill
                px(g, x, y, c)


def save_grid(g, path: Path):
    img = Image.new("RGBA", (GRID, GRID), (0, 0, 0, 0))
    pxmap = img.load()
    for y in range(GRID):
        for x in range(GRID):
            pxmap[x, y] = g[y][x]
    img.resize((OUT, OUT), Image.NEAREST).save(path, "PNG")


def add_outline(g):
    out = [row[:] for row in g]
    for y in range(GRID):
        for x in range(GRID):
            if g[y][x][3] == 0 or g[y][x] == INK:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if not (0 <= nx < GRID and 0 <= ny < GRID) or g[ny][nx][3] == 0:
                    if 0 <= ny < GRID and 0 <= nx < GRID and out[ny][nx][3] == 0:
                        out[ny][nx] = INK
    return out


def draw_scales(g, x0, x1, y0, y1, c1, c2):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if g[y][x][3] == 0:
                px(g, x, y, c1 if (x // 2 + y) % 3 else c2)


def draw_fiji_mermaid(g, pal, variant):
    """Horizontal crawl pose — head left, tail curving up-right (Fiji specimen)."""
    skin, skin2, bone, tooth, scale, scale2, fin, accent = pal

    # ── Fish tail (elongated, curves up at end) ──
    tail_spine = [
        (22, 34), (28, 33), (34, 32), (40, 30), (46, 28), (50, 24),
        (52, 20), (51, 16), (48, 14), (44, 15),
    ]
    for i in range(len(tail_spine) - 1):
        draw_line(g, *tail_spine[i], *tail_spine[i + 1], scale)
    for cx, cy in tail_spine[2:]:
        fill_ellipse(g, cx, cy, 3, 2, scale, scale2)

    draw_scales(g, 24, 50, 28, 36, scale, scale2)

    # dorsal fin (jagged, along tail top)
    dorsal = [(30, 29), (33, 27), (36, 26), (39, 24), (42, 22), (45, 20), (48, 18), (50, 16)]
    for i in range(len(dorsal) - 1):
        draw_line(g, *dorsal[i], *dorsal[i + 1], fin)
    for x, y in dorsal:
        px(g, x, y - 1, fin)

    # caudal fin (fans up)
    draw_line(g, 44, 15, 40, 10, fin)
    draw_line(g, 44, 15, 48, 10, fin)
    draw_line(g, 40, 10, 48, 10, fin)
    draw_line(g, 42, 11, 46, 11, scale2)

    # ── Emaciated torso ──
    fill_ellipse(g, 20, 32, 5, 4, skin, skin2)
    for y in range(28, 36):
        for x in range(16, 24):
            if g[y][x][3] == 0:
                px(g, x, y, skin2 if y > 32 else skin)

    # ribcage (prominent horizontal ribs)
    for y in (28, 30, 32, 34):
        hline(g, 17, 23, y, bone)
        px(g, 16, y, INK)
        px(g, 24, y, INK)

    # ── Arms + claws (prop forward-left) ──
    draw_line(g, 18, 30, 12, 36, skin)
    draw_line(g, 12, 36, 8, 40, skin2)
    draw_line(g, 19, 32, 14, 38, skin)
    draw_line(g, 14, 38, 10, 42, skin2)
    claws = ((7, 41), (8, 42), (9, 43), (6, 43), (10, 44), (11, 45), (9, 40), (12, 44))
    for x, y in claws:
        px(g, x, y, bone if variant != 2 else tooth)

    # ── Skull head (large, grimacing) ──
    fill_ellipse(g, 12, 24, 6, 5, skin, skin2)
    fill_ellipse(g, 12, 25, 5, 4, skin2)

    # sunken eyes
    for cx, cy in ((9, 22), (15, 22)):
        fill_ellipse(g, cx, cy, 2, 2, INK)
        px(g, cx, cy, (0, 0, 0, 255))

    # brow / skull ridge
    hline(g, 7, 17, 19, INK)
    px(g, 6, 20, skin2)
    px(g, 17, 20, skin2)

    # wide grimace + needle teeth
    hline(g, 8, 16, 27, INK)
    for x in range(8, 17):
        if x % 2 == 0:
            px(g, x, 26, tooth)
    hline(g, 9, 15, 28, skin2)

    # accent rot / bioluminescence spots
    if variant == 2:
        for x, y in ((38, 31), (46, 26), (20, 35)):
            px(g, x, y, accent)
    elif variant == 3:
        for x, y in ((36, 30), (44, 24), (30, 33), (50, 18)):
            px(g, x, y, accent)

    # dried skin wrinkles
    if variant == 1:
        for x, y in ((11, 23), (13, 24), (19, 33), (21, 34)):
            px(g, x, y, skin2)


PALETTES = {
    1: {
        "name": "표본 충실형",
        "desc": "참고 표본 그대로 — 미라화 갈색 상체, 갈비뼈, 발톱, 비늘 꼬리·등지느러미.",
        "colors": (
            (88, 62, 42, 255),
            (62, 42, 28, 255),
            (216, 196, 164, 255),
            (236, 228, 206, 255),
            (54, 72, 58, 255),
            (38, 52, 44, 255),
            (44, 58, 48, 255),
            (74, 50, 36, 255),
        ),
    },
    2: {
        "name": "해골 강조형",
        "desc": "빈 안구·흰 갈비뼈·날카로운 발톱. 표본의 macabre 톤 극대화.",
        "colors": (
            (58, 42, 32, 255),
            (36, 26, 20, 255),
            (250, 244, 228, 255),
            (255, 252, 240, 255),
            (40, 44, 48, 255),
            (28, 30, 34, 255),
            (34, 36, 40, 255),
            (140, 48, 36, 255),
        ),
    },
    3: {
        "name": "심연 부패형",
        "desc": "짙은 청록 비늘 + 부패 얼룩. 심해 적응과 미라화가 섞인 변종.",
        "colors": (
            (76, 56, 40, 255),
            (52, 36, 26, 255),
            (204, 188, 158, 255),
            (228, 218, 192, 255),
            (24, 82, 88, 255),
            (16, 58, 64, 255),
            (32, 100, 96, 255),
            (72, 148, 88, 255),
        ),
    },
}


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ref_dst = OUT_DIR / "fiji-defective-reference.png"
    if USER_REF.exists():
        shutil.copy(USER_REF, ref_dst)
    elif not ref_dst.exists():
        print("Warning: reference image missing")

    for idx, spec in PALETTES.items():
        g = blank()
        draw_fiji_mermaid(g, spec["colors"], idx)
        g = add_outline(g)
        save_grid(g, OUT_DIR / f"fiji-defective-{idx}.png")
        print(f"Wrote fiji-defective-{idx}.png ({spec['name']})")


if __name__ == "__main__":
    main()
