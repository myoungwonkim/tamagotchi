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
GOLD_LIGHT = (255, 249, 196, 255)
JELLY = (206, 147, 216, 255)
JELLY2 = (186, 104, 200, 255)
JELLY3 = (233, 213, 255, 255)
JELLY4 = (255, 220, 245, 255)
SPARK = (0, 229, 255, 255)
SPARK2 = (124, 77, 255, 255)
SPARK3 = (213, 255, 255, 255)
AQUA = (77, 208, 225, 255)

# normal — reef / common fish
COPPER = (255, 183, 77, 255)
COPPER2 = (230, 126, 34, 255)
REEF = (141, 110, 99, 255)
REEF2 = (109, 76, 65, 255)
ALGAE = (102, 187, 106, 255)
MUD = (120, 144, 156, 255)
MUD2 = (84, 110, 122, 255)

# defective — grotesque abyssal
RAG = (110, 98, 92, 255)
RAG2 = (78, 67, 63, 255)
ROT = (84, 66, 54, 255)
BLOB = (130, 130, 130, 255)
BLOB2 = (90, 90, 90, 255)
PALE = (160, 175, 170, 255)
PALE2 = (120, 140, 135, 255)
SLIME = (156, 204, 101, 255)
SLIME2 = (104, 159, 56, 255)
MUCUS = (188, 214, 122, 255)
BONE_SHOW = (228, 218, 198, 255)
PARASITE = (124, 179, 66, 255)
LESION = (183, 28, 28, 255)
EYE_YELLOW = (255, 235, 59, 255)
RED = (229, 57, 53, 255)
WHITE = (255, 255, 255, 255)


def draw_eye(g, x, y, sclera=WHITE, pupil=K, highlight=WHITE, large=False):
    """Draw a readable Famicom-style eye; (x, y) is top-left."""
    if not large:
        px(g, x, y, sclera)
        px(g, x + 1, y, sclera)
        px(g, x, y + 1, pupil)
        px(g, x + 1, y + 1, highlight)
        return

    for dx in range(3):
        px(g, x + dx, y, sclera)
    px(g, x, y + 1, pupil)
    px(g, x + 1, y + 1, pupil)
    px(g, x + 2, y + 1, highlight)
    px(g, x, y + 2, pupil)
    px(g, x + 1, y + 2, sclera)
    px(g, x + 2, y + 2, sclera)


def draw_eye_grotesque(g, cx, cy, iris=EYE_YELLOW, pupil=RED):
    """High-contrast defective eye — bold white sclera on dark bodies."""
    fill_circle(g, cx, cy, 4, WHITE, K)
    fill_circle(g, cx, cy, 2, iris, K)
    px(g, cx + 1, cy, pupil)
    px(g, cx - 1, cy + 1, pupil)
    px(g, cx + 2, cy - 1, WHITE)


def draw_empty_socket(g, cx, cy):
    """Broken/missing eye socket."""
    fill_circle(g, cx, cy, 2, K, None)
    px(g, cx - 1, cy - 1, BONE_SHOW)
    px(g, cx + 1, cy - 1, BONE_SHOW)
    px(g, cx, cy, ROT)
    px(g, cx - 1, cy + 1, K)
    px(g, cx + 1, cy + 1, K)


def draw_swollen_eye(g, cx, cy):
    """Bulging parasitic eye — large white ring, yellow iris, red pupil."""
    fill_circle(g, cx, cy, 5, WHITE, K)
    fill_circle(g, cx, cy, 3, EYE_YELLOW, K)
    fill_circle(g, cx, cy, 1, RED, None)
    px(g, cx + 2, cy - 1, WHITE)
    px(g, cx + 2, cy + 1, LESION)


def draw_fish(g, body, fin, cx=14, cy=16, rx=8, ry=6, tail=True, dorsal=True, belly=True, large_eye=False):
    fill_ellipse(g, cx, cy, rx, ry, body, K)
    if tail:
        draw_poly(g, [(cx + rx, cy), (cx + rx + 6, cy - 4), (cx + rx + 6, cy + 4)], fin, K)
    if dorsal:
        draw_poly(g, [(cx - 2, cy - ry), (cx + 2, cy - ry - 4), (cx + 7, cy - ry + 1)], fin, K)
    if belly:
        draw_poly(g, [(cx - 2, cy + ry - 1), (cx + 4, cy + ry + 3), (cx + 8, cy + ry - 1)], fin, K)
    draw_eye(g, cx - rx + 3, cy - 3, large=large_eye)


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
    """Fish bone skeleton."""
    g = blank()
    BONE = (245, 245, 235, 255)
    fill_circle(g, 9, 16, 4, BONE, K)
    px(g, 8, 15, K)
    px(g, 10, 15, K)
    draw_line(g, 13, 16, 27, 16, K)
    draw_line(g, 13, 16, 27, 16, BONE)
    for x in (15, 17, 19, 21, 23):
        draw_line(g, x, 16, x - 2, 11, K)
        draw_line(g, x, 16, x - 2, 11, BONE)
        draw_line(g, x, 16, x + 2, 11, K)
        draw_line(g, x, 16, x + 2, 11, BONE)
        draw_line(g, x, 16, x - 2, 21, K)
        draw_line(g, x, 16, x - 2, 21, BONE)
        draw_line(g, x, 16, x + 2, 21, K)
        draw_line(g, x, 16, x + 2, 21, BONE)
    draw_line(g, 27, 16, 29, 12, K)
    draw_line(g, 27, 16, 29, 12, BONE)
    draw_line(g, 27, 16, 29, 20, K)
    draw_line(g, 27, 16, 29, 20, BONE)
    draw_line(g, 29, 12, 30, 13, K)
    draw_line(g, 29, 20, 30, 19, K)
    return g


# ── Adult variants ────────────────────────────────────────────────────
def sprite_golden():
    """Pretty — radiant lanternfish queen, sleek + golden halo lure."""
    g = blank()
    fill_ellipse(g, 14, 17, 9, 5, GLOW2, K)
    fill_ellipse(g, 14, 17, 7, 4, GOLD_LIGHT)
    draw_poly(g, [(20, 17), (27, 13), (27, 21)], GLOW, K)
    draw_poly(g, [(8, 14), (11, 8), (14, 13)], GLOW2, K)
    draw_poly(g, [(10, 19), (13, 24), (16, 19)], GLOW, K)
    for x, y in ((11, 16), (17, 16), (18, 15)):
        px(g, x, y, GLOW)
    draw_line(g, 11, 7, 11, 3, K)
    for x, y in ((10, 2), (11, 2), (12, 2), (11, 1), (10, 3), (12, 3)):
        px(g, x, y, GLOW)
    px(g, 11, 1, WHITE)
    draw_eye(g, 8, 13, large=True)
    return g


def sprite_fluffy():
    """Pretty — moon jelly bell, graceful trailing tentacles."""
    g = blank()
    fill_ellipse(g, 16, 12, 9, 6, JELLY3, K)
    fill_ellipse(g, 16, 13, 7, 4, JELLY4)
    for x, y in ((13, 11), (16, 10), (19, 11), (15, 12), (17, 12)):
        px(g, x, y, WHITE)
    draw_eye(g, 13, 12, sclera=WHITE, pupil=K, large=True)
    draw_eye(g, 17, 12, sclera=WHITE, pupil=K, large=True)
    tentacles = [
        (11, 17, 9, 27), (13, 17, 12, 28), (15, 18, 14, 29),
        (17, 18, 18, 29), (19, 17, 21, 28), (21, 17, 23, 27),
    ]
    for x0, y0, x1, y1 in tentacles:
        draw_line(g, x0, y0, x1, y1, JELLY2)
        px(g, x1, y1, JELLY)
    return g


def sprite_sparkle():
    """Pretty — cosmic squid, constellation bioluminescence."""
    g = blank()
    fill_ellipse(g, 13, 14, 7, 8, SPARK2, K)
    fill_ellipse(g, 13, 15, 5, 6, (156, 120, 255, 255))
    draw_poly(g, [(20, 14), (27, 10), (27, 18)], SPARK2, K)
    for x0, y0, x1, y1 in ((11, 22, 8, 28), (13, 23, 13, 29), (15, 22, 18, 28)):
        draw_line(g, x0, y0, x1, y1, SPARK2)
    stars = (
        (8, 8), (9, 9), (24, 7), (25, 8), (6, 16), (7, 17),
        (25, 15), (26, 16), (10, 6), (22, 20), (13, 11), (15, 13),
    )
    for x, y in stars:
        px(g, x, y, SPARK)
        px(g, x, y + 1, SPARK3)
    draw_eye(g, 8, 12, sclera=WHITE, pupil=K, highlight=SPARK3, large=True)
    return g


def sprite_standard():
    """Common copper reef fish."""
    g = blank()
    draw_fish(g, COPPER, COPPER2, cx=13, cy=16, rx=8, ry=6, large_eye=True)
    return g


def sprite_farm():
    """Coral-dwelling fish with algae."""
    g = blank()
    draw_fish(g, REEF, REEF2, cx=13, cy=16, rx=8, ry=6, large_eye=True)
    px(g, 10, 9, ALGAE)
    px(g, 12, 8, ALGAE)
    px(g, 14, 9, ALGAE)
    px(g, 11, 10, (76, 175, 80, 255))
    return g


def sprite_plain():
    """Plain abyssal mudfish."""
    g = blank()
    draw_fish(g, MUD, MUD2, cx=13, cy=16, rx=8, ry=6, large_eye=True)
    px(g, 12, 15, MUD2)
    px(g, 14, 17, MUD2)
    return g


def sprite_scruffy():
    """Defective — rotting angler, missing eye, bone patch, slime."""
    g = blank()
    fill_ellipse(g, 14, 17, 8, 6, RAG, K)
    fill_ellipse(g, 10, 18, 2, 2, BONE_SHOW, K)
    px(g, 9, 17, ROT)
    draw_line(g, 9, 11, 7, 9, RAG2)
    draw_line(g, 10, 10, 8, 7, K)
    draw_line(g, 8, 12, 5, 11, ROT)
    draw_poly(g, [(20, 17), (25, 14), (24, 20)], RAG2, K)
    draw_line(g, 11, 10, 14, 8, K)
    draw_line(g, 14, 8, 16, 10, (90, 90, 90, 255))
    px(g, 16, 10, SLIME2)
    for x, y in ((13, 22), (14, 23), (15, 24), (14, 25)):
        px(g, x, y, SLIME)
    px(g, 12, 19, MUCUS)
    draw_empty_socket(g, 7, 11)
    draw_eye_grotesque(g, 11, 11)
    return g


def sprite_grumpy():
    """Defective — nightmare fangfish, giant maw full of teeth."""
    g = blank()
    fill_ellipse(g, 15, 18, 7, 5, BLOB2, K)
    fill_circle(g, 11, 14, 6, BLOB, K)
    fill_ellipse(g, 11, 15, 5, 4, (50, 50, 50, 255))
    for x in range(7, 15):
        if x % 2 == 0:
            px(g, x, 14, WHITE)
            px(g, x, 15, K)
    draw_line(g, 7, 11, 10, 12, K)
    draw_line(g, 14, 11, 11, 12, K)
    draw_poly(g, [(18, 17), (24, 15), (23, 20)], BLOB2, K)
    px(g, 24, 14, RED)
    for x, y in ((10, 16), (11, 17), (12, 16)):
        px(g, x, y, SLIME2)
    draw_eye_grotesque(g, 7, 9, iris=WHITE, pupil=RED)
    draw_eye_grotesque(g, 15, 9, iris=WHITE, pupil=RED)
    return g


def sprite_sickly():
    """Defective — parasite host, lesions, swollen eye, worms."""
    g = blank()
    fill_ellipse(g, 14, 18, 7, 5, PALE, K)
    fill_ellipse(g, 14, 18, 5, 3, PALE2)
    draw_line(g, 10, 13, 12, 15, K)
    px(g, 10, 14, K)
    px(g, 10, 15, K)
    for x, y in ((12, 17), (15, 19), (13, 20)):
        px(g, x, y, LESION)
    worms = ((8, 16, 5, 18), (17, 19, 20, 21), (11, 20, 8, 23))
    for x0, y0, x1, y1 in worms:
        draw_line(g, x0, y0, x1, y1, PARASITE)
        px(g, x1, y1, SLIME2)
    draw_poly(g, [(20, 18), (24, 16), (23, 21)], PALE2, K)
    for x, y in ((14, 24), (15, 25), (13, 26)):
        px(g, x, y, MUCUS)
    draw_swollen_eye(g, 11, 14)
    return g


# ── Mood bubbles (ocean-tinted) ───────────────────────────────────────
HEART_EYE = (229, 57, 53, 255)
TEAR = (100, 181, 246, 255)
DROOL = (129, 212, 250, 255)
MOUTH_IN = (69, 90, 100, 255)


def sprite_mood(bg, mouth_fn, eyes_fn=None, extra_fn=None):
    g = blank()
    fill_circle(g, 16, 16, 13, bg, K)
    if eyes_fn:
        eyes_fn(g)
    else:
        px(g, 12, 13, K)
        px(g, 20, 13, K)
    mouth_fn(g)
    if extra_fn:
        extra_fn(g)
    return g


def draw_mini_heart(g, cx, cy, color):
    """Tiny pixel heart centered near (cx, cy)."""
    for x, y in (
        (cx - 1, cy - 1), (cx + 1, cy - 1),
        (cx - 2, cy), (cx - 1, cy), (cx, cy), (cx + 1, cy), (cx + 2, cy),
        (cx - 1, cy + 1), (cx, cy + 1), (cx + 1, cy + 1),
        (cx, cy + 2),
    ):
        px(g, x, y, color)


def eyes_heart(g):
    draw_mini_heart(g, 12, 13, HEART_EYE)
    draw_mini_heart(g, 20, 13, HEART_EYE)


def eyes_sleep_closed(g):
    draw_line(g, 10, 12, 14, 12, K)
    draw_line(g, 18, 12, 22, 12, K)


def eyes_sick_tears(g):
    px(g, 12, 13, K)
    px(g, 20, 13, K)
    for x, y in (
        (11, 14), (11, 15), (11, 16), (11, 17), (12, 18),
        (21, 14), (21, 15), (21, 16), (21, 17), (20, 18),
    ):
        px(g, x, y, TEAR)


def mouth_smile(g):
    for x, y in ((12, 19), (13, 20), (14, 20), (15, 21), (16, 21), (17, 21), (18, 20), (19, 20), (20, 19)):
        px(g, x, y, K)


def mouth_neutral(g):
    draw_line(g, 12, 19, 20, 19, K)


def mouth_sad(g):
    for x, y in ((12, 21), (13, 20), (14, 20), (15, 19), (16, 19), (17, 19), (18, 20), (19, 20), (20, 21)):
        px(g, x, y, K)


def mouth_sleep_drool(g):
    for x in range(13, 20):
        px(g, x, 18, K)
    for x in range(14, 19):
        px(g, x, 19, MOUTH_IN)
        px(g, x, 20, MOUTH_IN)
    px(g, 13, 19, K)
    px(g, 13, 20, K)
    px(g, 19, 19, K)
    px(g, 19, 20, K)
    px(g, 20, 20, K)
    for x, y in ((17, 21), (17, 22), (17, 23), (16, 24), (18, 24), (17, 25)):
        px(g, x, y, DROOL)


def mouth_sick(g):
    draw_line(g, 12, 20, 20, 20, K)


# ── UI ────────────────────────────────────────────────────────────────
def sprite_heart_broken():
    """Heart split in two halves."""
    g = blank()
    PINK = (236, 64, 122, 255)
    fill_circle(g, 10, 14, 5, PINK, K)
    draw_poly(g, [(10, 23), (4, 15), (15, 16)], PINK, K)
    fill_circle(g, 22, 14, 5, PINK, K)
    draw_poly(g, [(22, 23), (17, 16), (28, 15)], PINK, K)
    for x, y in ((16, 11), (15, 13), (16, 15), (17, 17), (16, 19), (15, 21)):
        px(g, x, y, K)
    px(g, 14, 12, (0, 0, 0, 0))
    px(g, 18, 12, (0, 0, 0, 0))
    px(g, 16, 13, (0, 0, 0, 0))
    px(g, 15, 14, (0, 0, 0, 0))
    px(g, 17, 14, (0, 0, 0, 0))
    px(g, 16, 16, (0, 0, 0, 0))
    px(g, 15, 18, (0, 0, 0, 0))
    px(g, 17, 18, (0, 0, 0, 0))
    px(g, 16, 20, (0, 0, 0, 0))
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


def sprite_poop():
    """Comic pixel poop pile — tank grime."""
    g = blank()
    POOP = (141, 110, 99, 255)
    POOP2 = (109, 76, 65, 255)
    POOP3 = (161, 136, 127, 255)
    STINK = (156, 204, 101, 255)
    fill_ellipse(g, 16, 23, 8, 4, POOP, K)
    fill_ellipse(g, 15, 18, 6, 4, POOP2, K)
    fill_ellipse(g, 14, 13, 5, 3, POOP3, K)
    px(g, 12, 12, POOP3)
    px(g, 16, 11, POOP3)
    for x, y in ((11, 21), (18, 22), (14, 24)):
        px(g, x, y, POOP2)
    for x0, y0, x1, y1 in ((9, 9, 8, 7), (11, 8, 10, 6), (13, 7, 12, 5)):
        draw_line(g, x0, y0, x1, y1, K)
        px(g, x1, y1, STINK)
    px(g, 20, 9, K)
    px(g, 21, 8, STINK)
    px(g, 22, 7, K)
    return g


def sprite_fly():
    """Comic buzzing fly — big googly eyes."""
    g = blank()
    WING = (144, 202, 249, 255)
    WING2 = (100, 181, 246, 255)
    BODY = (69, 90, 100, 255)
    draw_poly(g, [(8, 14), (14, 10), (16, 16)], WING, K)
    draw_poly(g, [(24, 14), (18, 10), (16, 16)], WING, K)
    px(g, 10, 12, WING2)
    px(g, 22, 12, WING2)
    fill_ellipse(g, 16, 17, 3, 4, BODY, K)
    draw_line(g, 14, 21, 13, 24, K)
    draw_line(g, 16, 21, 16, 25, K)
    draw_line(g, 18, 21, 19, 24, K)
    fill_circle(g, 12, 14, 4, WHITE, K)
    fill_circle(g, 20, 14, 4, WHITE, K)
    fill_circle(g, 12, 14, 2, K, None)
    fill_circle(g, 20, 14, 2, K, None)
    px(g, 13, 13, WHITE)
    px(g, 21, 13, WHITE)
    for x, y in ((6, 16), (7, 15), (25, 16), (26, 15)):
        px(g, x, y, K)
    return g


def sprite_action_feed():
    """Red apple — feed."""
    g = blank()
    RED = (229, 57, 53, 255)
    RED2 = (198, 40, 40, 255)
    LEAF = (102, 187, 106, 255)
    LEAF2 = (76, 175, 80, 255)
    fill_circle(g, 16, 18, 8, RED, K)
    fill_circle(g, 15, 19, 6, RED2)
    px(g, 13, 14, RED2)
    px(g, 18, 13, WHITE)
    draw_line(g, 16, 8, 16, 11, (109, 76, 65, 255))
    draw_line(g, 16, 9, 19, 7, LEAF2)
    draw_poly(g, [(17, 7), (21, 6), (20, 9), (17, 9)], LEAF, K)
    px(g, 20, 7, LEAF2)
    return g


def sprite_action_play():
    """Tennis ball — play."""
    g = blank()
    BALL = (196, 214, 52, 255)
    BALL_D = (164, 181, 36, 255)
    SEAM = (250, 250, 250, 255)
    fill_circle(g, 16, 16, 9, BALL, K)
    fill_circle(g, 17, 17, 6, BALL_D)
    draw_line(g, 10, 10, 12, 13, SEAM)
    draw_line(g, 12, 13, 14, 16, SEAM)
    draw_line(g, 14, 16, 15, 19, SEAM)
    draw_line(g, 15, 19, 16, 23, SEAM)
    draw_line(g, 22, 10, 20, 13, SEAM)
    draw_line(g, 20, 13, 18, 16, SEAM)
    draw_line(g, 18, 16, 17, 19, SEAM)
    draw_line(g, 17, 19, 16, 23, SEAM)
    px(g, 13, 12, WHITE)
    return g


def sprite_action_clean():
    """Straw broom — clean (side view)."""
    g = blank()
    WOOD = (141, 110, 99, 255)
    WOOD_D = (109, 76, 65, 255)
    BRISTLE = (255, 213, 79, 255)
    BRISTLE_D = (255, 193, 7, 255)
    METAL = (158, 158, 158, 255)

    for y in range(5, 21):
        px(g, 20, y, WOOD_D)
        px(g, 21, y, WOOD)
    px(g, 20, 6, WHITE)

    draw_line(g, 17, 19, 23, 19, METAL)
    draw_line(g, 17, 20, 23, 20, K)

    draw_poly(g, [(6, 21), (24, 21), (23, 25), (7, 25)], BRISTLE, K)
    for x in range(8, 23):
        if x % 2 == 0:
            draw_line(g, x, 25, x, 29, BRISTLE_D)
        px(g, x, 29, K)
    return g


def sprite_action_sleep():
    """Thin crescent moon — sleep."""
    g = blank()
    MOON = (255, 241, 118, 255)
    MOON2 = (255, 213, 79, 255)
    fill_circle(g, 14, 16, 8, MOON, K)
    fill_circle(g, 17, 14, 7, (0, 0, 0, 0))
    for y in range(SIZE):
        for x in range(SIZE):
            if g[y][x][:3] == MOON[:3]:
                if x < 12:
                    px(g, x, y, MOON2)
    px(g, 11, 13, WHITE)
    px(g, 12, 12, MOON2)
    return g


def sprite_action_wake():
    """Sun — wake."""
    g = blank()
    SUN = (255, 241, 118, 255)
    SUN2 = (255, 213, 79, 255)
    RAY = (255, 193, 7, 255)
    fill_circle(g, 16, 16, 6, SUN, K)
    fill_circle(g, 16, 17, 4, SUN2)
    px(g, 14, 14, WHITE)
    rays = (
        (16, 5), (16, 27), (5, 16), (27, 16),
        (9, 9), (23, 9), (9, 23), (23, 23),
    )
    for x, y in rays:
        px(g, x, y, RAY)
        if x == 16:
            px(g, x, y + (1 if y < 16 else -1), K)
        elif y == 16:
            px(g, x + (1 if x < 16 else -1), y, K)
    for x, y in ((10, 10), (22, 10), (10, 22), (22, 22)):
        px(g, x, y, K)
    return g


ACTION_SPRITES = {
    "feed": sprite_action_feed,
    "play": sprite_action_play,
    "clean": sprite_action_clean,
    "sleep": sprite_action_sleep,
    "wake": sprite_action_wake,
}


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
    "mood/happy": lambda: sprite_mood((224, 247, 250, 255), mouth_smile, eyes_heart),
    "mood/neutral": lambda: sprite_mood((207, 216, 220, 255), mouth_neutral),
    "mood/sad": lambda: sprite_mood((187, 222, 251, 255), mouth_sad),
    "mood/sleep": lambda: sprite_mood((179, 157, 219, 255), mouth_sleep_drool, eyes_sleep_closed),
    "mood/sick": lambda: sprite_mood((200, 230, 201, 255), mouth_sick, eyes_sick_tears),
    "ui/heart-broken": sprite_heart_broken,
    "ui/locked": sprite_locked,
    "ui/poop": sprite_poop,
    "ui/fly": sprite_fly,
    "ui/feed": sprite_action_feed,
    "ui/play": sprite_action_play,
    "ui/clean": sprite_action_clean,
    "ui/sleep": sprite_action_sleep,
    "ui/wake": sprite_action_wake,
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
    import sys

    root = Path(__file__).resolve().parent.parent
    install = "--install" in sys.argv
    staging = root / "assets/sprites" if install else root / ".sprite-staging-deepsea"
    build_all(staging)
    if not install:
        sheet = build_sheet(staging, staging / "_preview-sheet.png", title="Deep Sea Fish — 28 sprites")
        changed = ["evolution/dead", "mood/happy", "mood/sleep", "mood/sick", "ui/heart-broken"]
        cols, cell, pad = 5, 160, 12
        title_h = 24
        w = cols * (cell + pad) + pad
        h = title_h + cell + pad + 24
        comp = Image.new("RGBA", (w, h), (12, 20, 38, 255))
        draw = ImageDraw.Draw(comp)
        font = ImageFont.load_default()
        draw.text((pad, 6), "Updated: dead | happy | sleep | sick | heart-broken", fill=(0, 229, 255), font=font)
        for i, rel in enumerate(changed):
            x = pad + i * (cell + pad)
            y = title_h + pad
            img = Image.open(staging / f"{rel}.png").resize((cell, cell), Image.NEAREST)
            comp.paste(img, (x, y), img)
            draw.text((x, y + cell + 4), rel.split("/")[-1], fill=(144, 202, 249), font=font)
        comp.save(staging / "_preview-changed.png", "PNG")
        tiers = ["adult/golden", "adult/fluffy", "adult/sparkle", "adult/scruffy", "adult/grumpy", "adult/sickly"]
        cols, cell, pad = 6, 140, 10
        title_h = 24
        w = cols * (cell + pad) + pad
        h = title_h + cell + pad + 28
        tier_img = Image.new("RGBA", (w, h), (12, 20, 38, 255))
        draw = ImageDraw.Draw(tier_img)
        draw.text((pad, 6), "Pretty vs Defective adult tiers", fill=(0, 229, 255), font=font)
        for i, rel in enumerate(tiers):
            x = pad + i * (cell + pad)
            y = title_h + pad
            img = Image.open(staging / f"{rel}.png").resize((cell, cell), Image.NEAREST)
            tier_img.paste(img, (x, y), img)
            color = (255, 213, 79) if i < 3 else (156, 204, 101)
            draw.text((x, y + cell + 4), rel.split("/")[-1], fill=color, font=font)
        tier_img.save(staging / "_preview-tiers.png", "PNG")
        print(f"Preview sheet -> {sheet}")
        print(f"Changed sprites -> {staging / '_preview-changed.png'}")
        print(f"Tier comparison -> {staging / '_preview-tiers.png'}")
    print(f"Generated {len(SPRITES)} sprites -> {staging}")
