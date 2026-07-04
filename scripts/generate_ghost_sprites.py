"""Finalized shark-death GHOST sprites (design "C3": small Casper silhouette,
big pleading eyes, worried brows, no mouth, single tear, left-curling tail).

Rendered in the same low-res "Famicom" style as the shipped sprites: 32x32
logical grid scaled 8x with nearest-neighbour, 1-logical-pixel charcoal outline
(#2d2a26), flat palette, transparent background.

Outputs one ghost per species theme, at the paths the sprite loader expects
(getSpriteUrl("evolution", "ghost", theme)):
  assets/sprites/evolution/ghost.png          (deepsea, cream)
  assets/sprites/mermaid/evolution/ghost.png  (mermaid, light blue)
  assets/sprites/vent/evolution/ghost.png     (vent, coral)
"""

from pathlib import Path

from PIL import Image

GRID = 32
SCALE = 8  # -> 256px, identical to the shipped sprites

OUTLINE = (45, 42, 38, 255)
GLINT = (255, 255, 255, 255)
TEAR = (127, 200, 232, 255)
TEAR_HI = (176, 224, 245, 255)

THEMES = {
    "assets/sprites/evolution/ghost.png": (243, 239, 228, 255),          # deepsea cream
    "assets/sprites/mermaid/evolution/ghost.png": (191, 224, 245, 255),  # mermaid blue
    "assets/sprites/vent/evolution/ghost.png": (244, 176, 166, 255),     # vent coral
}


def sil_from_rows(*row_dicts, extra=None):
    cells = set()
    for rows in row_dicts:
        for y, ranges in rows.items():
            for x0, x1 in ranges:
                for x in range(x0, x1 + 1):
                    cells.add((x, y))
    if extra:
        cells.update(extra)
    return cells


def is_border(cell, sil):
    x, y = cell
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        if (x + dx, y + dy) not in sil:
            return True
    return False


def mirror_rows(rows):
    out = {}
    for y, ranges in rows.items():
        out[y] = sorted((31 - x1, 31 - x0) for (x0, x1) in ranges)
    return out


# Top-heavy rounded Casper head (small footprint, y6..16).
HEAD = {
    6: [(13, 18)],
    7: [(11, 20)],
    8: [(10, 21)],
    9: [(9, 22)],
    10: [(9, 22)],
    11: [(9, 22)],
    12: [(10, 21)],
    13: [(10, 21)],
    14: [(11, 20)],
    15: [(11, 20)],
    16: [(12, 19)],
}

# Single wisp curling to the LEFT (mirror of the right-curling wisp).
TAIL_RIGHT = {
    17: [(12, 18)],
    18: [(13, 18)],
    19: [(14, 19)],
    20: [(15, 19)],
    21: [(16, 19)],
    22: [(17, 19)],
}
TAIL = mirror_rows(TAIL_RIGHT)

# Little rounded nub arms.
ARMS = [
    (8, 12), (9, 12), (8, 13), (9, 13), (8, 14), (9, 14),
    (22, 12), (23, 12), (22, 13), (23, 13), (22, 14), (23, 14),
]

# Big friendly rounded eyes, worried brows, tear on the right. No mouth.
EYES = [
    (12, 9), (13, 9), (12, 10), (13, 10), (12, 11), (13, 11),
    (18, 9), (19, 9), (18, 10), (19, 10), (18, 11), (19, 11),
]
GLINT_TOP = [(12, 9), (18, 9)]
BROWS = [(13, 6), (12, 7), (18, 6), (19, 7)]
TEAR_R_HI = [(19, 12)]
TEAR_R = [(19, 13), (19, 14)]


def render(body_color):
    sil = sil_from_rows(HEAD, TAIL, extra=ARMS)
    img = Image.new("RGBA", (GRID, GRID), (0, 0, 0, 0))
    px = img.load()

    for (x, y) in sil:
        px[x, y] = OUTLINE if is_border((x, y), sil) else body_color

    for (x, y) in BROWS + EYES:
        px[x, y] = OUTLINE
    for (x, y) in GLINT_TOP:
        px[x, y] = GLINT
    for (x, y) in TEAR_R_HI:
        px[x, y] = TEAR_HI
    for (x, y) in TEAR_R:
        px[x, y] = TEAR

    return img.resize((GRID * SCALE, GRID * SCALE), Image.NEAREST)


def main():
    for rel_path, body in THEMES.items():
        out = Path(rel_path)
        out.parent.mkdir(parents=True, exist_ok=True)
        render(body).save(out)
        print(f"wrote {out}")


if __name__ == "__main__":
    main()
