#!/usr/bin/env python3
"""Generate all 21 tamagotchi sprites — 90s Famicom deep-sea fish theme."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SIZE = 32
OUT = 256
K = (45, 42, 38, 255)


def blank():
    return [[(0, 0, 0, 0) for _ in range(SIZE)] for _ in range(SIZE)]


def px(g, x, y, c):
    if 0 <= x < SIZE and 0 <= y < SIZE:
        g[y][x] = c


def fill_ellipse(g, cx, cy, rx, ry, fill, outline=None):
    for y in range(SIZE):
        for x in range(SIZE):
            dx = (x - cx) / max(rx, 0.5)
            dy = (y - cy) / max(ry, 0.5)
            inside = dx * dx + dy * dy <= 1.0
            border = False
            if outline:
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < SIZE and 0 <= ny < SIZE:
                        ndx = (nx - cx) / max(rx, 0.5)
                        ndy = (ny - cy) / max(ry, 0.5)
                        if ndx * ndx + ndy * ndy > 1.0:
                            border = True
                            break
            if inside:
                px(g, x, y, outline if border else fill)


def fill_circle(g, cx, cy, r, fill, outline=None):
    fill_ellipse(g, cx, cy, r, r, fill, outline)


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


def draw_poly(g, pts, fill, outline=None):
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    for y in range(max(0, min(ys)), min(SIZE - 1, max(ys)) + 1):
        for x in range(max(0, min(xs)), min(SIZE - 1, max(xs)) + 1):
            if _point_in_poly(x + 0.5, y + 0.5, pts):
                px(g, x, y, fill)
    if outline:
        n = len(pts)
        for i in range(n):
            draw_line(g, pts[i][0], pts[i][1], pts[(i + 1) % n][0], pts[(i + 1) % n][1], outline)


def _point_in_poly(x, y, poly):
    inside = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi + 1e-9) + xi):
            inside = not inside
        j = i
    return inside


def save_grid(g, path):
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    pxmap = img.load()
    for y in range(SIZE):
        for x in range(SIZE):
            pxmap[x, y] = g[y][x]
    img = img.resize((OUT, OUT), Image.NEAREST)
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG")


# ── Deep-sea palette ──────────────────────────────────────────────────
ROE = (255, 183, 160, 255)
ROE2 = (255, 138, 101, 255)
ROE_DOT = (255, 87, 34, 255)
LARVA = (178, 223, 219, 255)
LARVA2 = (128, 203, 196, 255)
FRY = (77, 182, 172, 255)
FRY2 = (38, 166, 154, 255)
TEEN = (38, 139, 210, 255)
TEEN2 = (21, 101, 192, 255)
GHOST = (187, 222, 251, 255)
GHOST2 = (144, 202, 249, 255)

# pretty — bioluminescent
GLOW = (255, 241, 118, 255)
GLOW2 = (255, 213, 79, 255)
JELLY = (206, 147, 216, 255)
JELLY2 = (186, 104, 200, 255)
JELLY3 = (233, 213, 255, 255)
SPARK = (0, 229, 255, 255)
SPARK2 = (124, 77, 255, 255)
SPARK3 = (213, 255, 255, 255)

# normal — reef / common fish
COPPER = (255, 183, 77, 255)
COPPER2 = (230, 126, 34, 255)
REEF = (141, 110, 99, 255)
REEF2 = (109, 76, 65, 255)
ALGAE = (102, 187, 106, 255)
MUD = (120, 144, 156, 255)
MUD2 = (84, 110, 122, 255)

# defective — abyssal ugly
RAG = (141, 127, 124, 255)
RAG2 = (109, 93, 90, 255)
BLOB = (158, 158, 158, 255)
BLOB2 = (117, 117, 117, 255)
PALE = (176, 190, 197, 255)
PALE2 = (144, 164, 174, 255)
RED = (229, 57, 53, 255)
WHITE = (255, 255, 255, 255)


def draw_fish(g, body, fin, cx=14, cy=16, rx=8, ry=6, tail=True, dorsal=True, belly=True, eye_x=-3):
    fill_ellipse(g, cx, cy, rx, ry, body, K)
    if tail:
        draw_poly(g, [(cx + rx, cy), (cx + rx + 6, cy - 4), (cx + rx + 6, cy + 4)], fin, K)
    if dorsal:
        draw_poly(g, [(cx - 2, cy - ry), (cx + 2, cy - ry - 4), (cx + 7, cy - ry + 1)], fin, K)
    if belly:
        draw_poly(g, [(cx - 2, cy + ry - 1), (cx + 4, cy + ry + 3), (cx + 8, cy + ry - 1)], fin, K)
    px(g, cx + eye_x, cy - 2, K)
    px(g, cx + eye_x + 1, cy - 2, WHITE)


def draw_lure(g, cx, cy, color, length=5):
    draw_line(g, cx, cy, cx, cy - length, K)
    px(g, cx, cy - length - 1, color)
    px(g, cx - 1, cy - length - 1, color)


def draw_tentacles(g, cx, cy, color, n=3):
    for i, off in enumerate(range(-2, 3, 2)):
        draw_line(g, cx + off, cy, cx + off + (i - 1), cy + 6, color)


# ── Evolution ─────────────────────────────────────────────────────────
def sprite_egg():
    """Fish roe cluster."""
    g = blank()
    fill_circle(g, 16, 17, 9, ROE, K)
    for p in ((13, 14), (18, 15), (15, 19), (19, 18), (14, 17)):
        px(g, p[0], p[1], ROE_DOT)
    px(g, 12, 13, ROE2)
    px(g, 13, 12, WHITE)
    return g


def sprite_baby():
    """Larva — big head, tiny tail."""
    g = blank()
    fill_circle(g, 14, 15, 6, LARVA, K)
    fill_ellipse(g, 22, 16, 5, 2, LARVA2, K)
    px(g, 11, 14, K)
    px(g, 12, 14, WHITE)
    draw_line(g, 24, 16, 28, 15, LARVA2)
    draw_line(g, 24, 16, 28, 17, LARVA2)
    return g


def sprite_child():
    """Small fry."""
    g = blank()
    draw_fish(g, FRY, FRY2, cx=13, cy=16, rx=7, ry=5)
    return g


def sprite_teen():
    """Juvenile with growing dorsal."""
    g = blank()
    draw_fish(g, TEEN, TEEN2, cx=13, cy=16, rx=8, ry=6)
    draw_poly(g, [(8, 9), (12, 5), (16, 10)], TEEN2, K)
    return g


def sprite_dead():
    """Ghost fish spirit."""
    g = blank()
    fill_ellipse(g, 16, 24, 9, 2, (45, 42, 38, 40))
    for y in range(9, 22):
        for x in range(10, 22):
            if ((x - 15) / 6) ** 2 + ((y - 14) / 7) ** 2 <= 1:
                px(g, x, y, GHOST if (x + y) % 2 else GHOST2)
    draw_poly(g, [(20, 16), (26, 14), (26, 18)], GHOST, K)
    px(g, 13, 13, K)
    px(g, 17, 13, K)
    draw_line(g, 13, 18, 17, 18, K)
    return g


# ── Adult variants ────────────────────────────────────────────────────
def sprite_golden():
    """Lanternfish — golden bioluminescent lure."""
    g = blank()
    draw_fish(g, GLOW2, GLOW, cx=13, cy=17, rx=8, ry=6)
    draw_lure(g, 10, 10, GLOW)
    px(g, 9, 5, GLOW)
    px(g, 10, 4, WHITE)
    return g


def sprite_fluffy():
    """Frilled jellyfish-fish hybrid."""
    g = blank()
    fill_ellipse(g, 16, 14, 8, 7, JELLY, K)
    fill_ellipse(g, 16, 16, 6, 5, JELLY3, K)
    px(g, 13, 13, K)
    px(g, 19, 13, K)
    for x in range(10, 23):
        if (x + 14) % 3 == 0:
            draw_line(g, x, 20, x + (x % 5 - 2), 27, JELLY2)
    return g


def sprite_sparkle():
    """Bioluminescent firefly squid."""
    g = blank()
    draw_fish(g, SPARK2, SPARK, cx=13, cy=16, rx=8, ry=6)
    for p in ((6, 10), (24, 8), (25, 16), (7, 20)):
        px(g, p[0], p[1], SPARK)
        px(g, p[0], p[1] + 1, SPARK3)
    return g


def sprite_standard():
    """Common copper reef fish."""
    g = blank()
    draw_fish(g, COPPER, COPPER2, cx=13, cy=16, rx=8, ry=6)
    return g


def sprite_farm():
    """Coral-dwelling fish with algae."""
    g = blank()
    draw_fish(g, REEF, REEF2, cx=13, cy=16, rx=8, ry=6)
    px(g, 10, 9, ALGAE)
    px(g, 12, 8, ALGAE)
    px(g, 14, 9, ALGAE)
    px(g, 11, 10, (76, 175, 80, 255))
    return g


def sprite_plain():
    """Plain abyssal mudfish."""
    g = blank()
    draw_fish(g, MUD, MUD2, cx=13, cy=16, rx=8, ry=6)
    px(g, 12, 15, MUD2)
    px(g, 14, 17, MUD2)
    return g


def sprite_scruffy():
    """Ragged anglerfish — torn fins."""
    g = blank()
    draw_fish(g, RAG, RAG2, cx=13, cy=16, rx=8, ry=6, dorsal=False)
    draw_line(g, 8, 11, 6, 8, RAG2)
    draw_line(g, 10, 10, 8, 7, K)
    draw_line(g, 20, 22, 18, 25, RAG2)
    draw_lure(g, 9, 11, (120, 120, 120, 255), length=3)
    return g


def sprite_grumpy():
    """Fangtooth — angry brows + fang."""
    g = blank()
    draw_fish(g, BLOB, BLOB2, cx=13, cy=16, rx=8, ry=6)
    draw_line(g, 10, 13, 12, 14, K)
    draw_line(g, 16, 13, 14, 14, K)
    px(g, 11, 17, WHITE)
    px(g, 12, 18, K)
    px(g, 24, 14, RED)
    return g


def sprite_sickly():
    """Pale sick deep fish — spots + droopy."""
    g = blank()
    draw_fish(g, PALE, PALE2, cx=13, cy=17, rx=7, ry=5)
    draw_line(g, 10, 13, 12, 15, K)
    draw_line(g, 16, 13, 14, 15, K)
    px(g, 11, 16, RED)
    px(g, 15, 18, RED)
    fill_circle(g, 16, 10, 3, (239, 83, 80, 100))
    return g


# ── Mood bubbles (ocean-tinted) ───────────────────────────────────────
def sprite_mood(bg, mouth_fn, extra_fn=None):
    g = blank()
    fill_circle(g, 16, 16, 13, bg, K)
    px(g, 12, 13, K)
    px(g, 20, 13, K)
    mouth_fn(g)
    if extra_fn:
        extra_fn(g)
    return g


def mouth_smile(g):
    for x, y in ((12, 19), (13, 20), (14, 20), (15, 21), (16, 21), (17, 21), (18, 20), (19, 20), (20, 19)):
        px(g, x, y, K)


def mouth_neutral(g):
    draw_line(g, 12, 19, 20, 19, K)


def mouth_sad(g):
    for x, y in ((12, 21), (13, 20), (14, 20), (15, 19), (16, 19), (17, 19), (18, 20), (19, 20), (20, 21)):
        px(g, x, y, K)


def mouth_sleep(g):
    draw_line(g, 11, 13, 13, 13, K)
    draw_line(g, 19, 13, 21, 13, K)
    px(g, 22, 18, K)
    px(g, 24, 16, K)


def mouth_sick(g):
    draw_line(g, 12, 20, 20, 20, K)
    fill_circle(g, 16, 10, 3, (239, 83, 80, 90))


# ── UI ────────────────────────────────────────────────────────────────
def sprite_heart_broken():
    g = blank()
    fill_circle(g, 12, 14, 5, (129, 212, 250, 255), K)
    fill_circle(g, 20, 14, 5, (129, 212, 250, 255), K)
    draw_poly(g, [(16, 24), (8, 16), (24, 16)], (129, 212, 250, 255), K)
    draw_line(g, 16, 12, 16, 22, RED)
    draw_line(g, 12, 16, 20, 16, RED)
    return g


def sprite_locked():
    """Abyssal treasure chest lock."""
    g = blank()
    draw_poly(g, [(16, 8), (12, 12), (20, 12)], (0, 0, 0, 0), K)
    fill_ellipse(g, 16, 10, 4, 4, (0, 0, 0, 0), K)
    fill_ellipse(g, 16, 19, 9, 8, (69, 90, 100, 255), K)
    fill_ellipse(g, 16, 20, 5, 5, (38, 50, 56, 255), K)
    px(g, 16, 21, (0, 229, 255, 255))
    return g


SPRITES = {
    "evolution/egg": sprite_egg,
    "evolution/baby": sprite_baby,
    "evolution/child": sprite_child,
    "evolution/teen": sprite_teen,
    "evolution/dead": sprite_dead,
    "adult/golden": sprite_golden,
    "adult/fluffy": sprite_fluffy,
    "adult/sparkle": sprite_sparkle,
    "adult/standard": sprite_standard,
    "adult/farm": sprite_farm,
    "adult/plain": sprite_plain,
    "adult/scruffy": sprite_scruffy,
    "adult/grumpy": sprite_grumpy,
    "adult/sickly": sprite_sickly,
    "mood/happy": lambda: sprite_mood((224, 247, 250, 255), mouth_smile),
    "mood/neutral": lambda: sprite_mood((207, 216, 220, 255), mouth_neutral),
    "mood/sad": lambda: sprite_mood((187, 222, 251, 255), mouth_sad),
    "mood/sleep": lambda: sprite_mood((179, 157, 219, 255), mouth_sleep),
    "mood/sick": lambda: sprite_mood((200, 230, 201, 255), mouth_sick),
    "ui/heart-broken": sprite_heart_broken,
    "ui/locked": sprite_locked,
}


def build_all(base_dir):
    base = Path(base_dir)
    for rel, fn in SPRITES.items():
        save_grid(fn(), base / f"{rel}.png")
    return base


def build_sheet(base_dir, sheet_path, cols=7, cell=128, pad=8, title=""):
    base = Path(base_dir)
    names = list(SPRITES.keys())
    rows = (len(names) + cols - 1) // cols
    title_h = 24 if title else 0
    w = cols * (cell + pad) + pad
    h = title_h + rows * (cell + pad + 20) + pad
    sheet = Image.new("RGBA", (w, h), (12, 20, 38, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    if title:
        draw.text((pad, 6), title, fill=(0, 229, 255), font=font)
    for i, rel in enumerate(names):
        col, row = i % cols, i // cols
        x = pad + col * (cell + pad)
        y = title_h + pad + row * (cell + pad + 20)
        img = Image.open(base / f"{rel}.png").resize((cell, cell), Image.NEAREST)
        sheet.paste(img, (x, y), img)
        label = rel.split("/")[-1]
        draw.text((x, y + cell + 2), label, fill=(144, 202, 249), font=font)
    sheet_path = Path(sheet_path)
    sheet_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(sheet_path, "PNG")
    return sheet_path


if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    staging = root / ".sprite-staging-deepsea"
    build_all(staging)
    sheet = build_sheet(staging, staging / "_preview-sheet.png", title="Deep Sea Fish — 21 sprites")
    print(f"Generated {len(SPRITES)} sprites -> {staging}")
    print(f"Preview sheet -> {sheet}")
