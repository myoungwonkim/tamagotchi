#!/usr/bin/env python3
"""Mermaid tier concept — v1 Famicom 32×32. Staging only.

pretty  : human royal upper + fish tail
normal  : ordinary human upper + fish tail
defective: fish upper + human legs (inverted)
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

import generate_mermaid_preview as v1
from generate_all_sprites import (
    K,
    LESION,
    MUCUS,
    OUT,
    PALE,
    PALE2,
    ROT,
    SIZE,
    WHITE,
    blank,
    draw_eye,
    draw_line,
    draw_poly,
    fill_circle,
    fill_ellipse,
    px,
)

ROOT = Path(__file__).resolve().parent.parent
STAGING = ROOT / ".sprite-staging-mermaid"
GAME = ROOT / "assets/sprites/mermaid"

SKIN = v1.SKIN
SKIN2 = v1.SKIN2
SHIRT = (96, 125, 139, 255)
SHIRT2 = (69, 90, 100, 255)
PANTS = (62, 74, 88, 255)
PANTS2 = (45, 52, 64, 255)
SHOE = (84, 68, 56, 255)
SOLE = (62, 52, 44, 255)
PEARL = (255, 248, 240, 255)

# 일반 물고기 (심해어 아님)
FISH_GOLD = (255, 160, 90, 255)
FISH_GOLD2 = (220, 120, 60, 255)
FISH_GREY = (150, 158, 168, 255)
FISH_GREY2 = (110, 118, 128, 255)
FISH_DARK = (72, 88, 108, 255)
FISH_DARK2 = (52, 64, 82, 255)
FISH_PALE = (210, 218, 225, 255)
FISH_PALE2 = (180, 188, 198, 255)
FISH_BELLY = (248, 242, 232, 255)
FISH_FIN = (190, 110, 70, 255)
FISH_MOUTH = (180, 70, 60, 255)

# ── 독창 팔레트 (심해어·기존 인어 v1 색과 무관) ─────────────────────
# pretty · 진주 인어 — 장미 진주 공주
ROSE_SKIN = (255, 222, 210, 255)
ROSE_SKIN2 = (255, 195, 185, 255)
ROSE_HAIR = (255, 228, 175, 255)
ROSE_HAIR2 = (230, 180, 130, 255)
ROSE_TAIL = (235, 130, 150, 255)
ROSE_TAIL2 = (200, 90, 115, 255)
ROSE_FIN = (255, 205, 215, 255)
ROSE_GEM = (255, 150, 170, 255)

# pretty · 달빛 실크 — 은빛 달 왕자
MOON_SKIN = (238, 242, 255, 255)
MOON_SKIN2 = (210, 218, 240, 255)
MOON_HAIR = (225, 230, 250, 255)
MOON_HAIR2 = (185, 195, 225, 255)
MOON_TAIL = (165, 185, 225, 255)
MOON_TAIL2 = (125, 145, 195, 255)
MOON_FIN = (240, 245, 255, 255)
MOON_GEM = (200, 215, 255, 255)

# pretty · 별빛 — 성좌 공주
STAR_SKIN = (250, 245, 255, 255)
STAR_SKIN2 = (225, 215, 245, 255)
STAR_HAIR = (110, 75, 175, 255)
STAR_HAIR2 = (80, 50, 140, 255)
STAR_TAIL = (55, 40, 110, 255)
STAR_TAIL2 = (35, 25, 80, 255)
STAR_FIN = (0, 195, 215, 255)
STAR_DOT = (120, 240, 255, 255)

# normal · 산호 — 해변 소녀
BEACH_SKIN = (255, 210, 175, 255)
BEACH_SKIN2 = (235, 180, 145, 255)
BEACH_HAIR = (115, 70, 45, 255)
BEACH_HAIR2 = (90, 55, 35, 255)
BEACH_TAIL = (255, 115, 95, 255)
BEACH_TAIL2 = (220, 85, 75, 255)
BEACH_FIN = (255, 175, 155, 255)
BEACH_TOP = (255, 245, 235, 255)
BEACH_STRIPE = (220, 80, 90, 255)

# normal · 해초 — 항구 소년
HARBOR_SKIN = (255, 205, 170, 255)
HARBOR_SKIN2 = (230, 175, 140, 255)
HARBOR_HAIR = (70, 55, 45, 255)
HARBOR_CAP = (35, 55, 95, 255)
HARBOR_JACKET = (235, 120, 50, 255)
HARBOR_TAIL = (85, 155, 95, 255)
HARBOR_TAIL2 = (60, 125, 75, 255)
HARBOR_FIN = (130, 195, 130, 255)

# normal · 늪 — 비 오는 날 소녀
RAIN_SKIN = (230, 220, 215, 255)
RAIN_SKIN2 = (200, 195, 190, 255)
RAIN_HAIR = (135, 130, 140, 255)
RAIN_HAIR2 = (100, 98, 108, 255)
RAIN_CARDI = (195, 165, 75, 255)
RAIN_TAIL = (65, 105, 115, 255)
RAIN_TAIL2 = (45, 80, 90, 255)
RAIN_FIN = (95, 140, 150, 255)


def grid_to_image(g):
    from PIL import Image

    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    pxmap = img.load()
    for y in range(SIZE):
        for x in range(SIZE):
            pxmap[x, y] = g[y][x]
    return img.resize((OUT, OUT), Image.NEAREST)


def save_sprite(g, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    grid_to_image(g).save(path, "PNG")


def fish_tail(g, cx, waist, tail, tail2, fin, length=9, dots=None, dot_color=WHITE):
    v1.draw_mermaid_tail(g, cx, waist, tail, tail2, fin, length=length)
    if dots:
        for x, y in dots:
            px(g, x, y, dot_color)


# ── 독창 헤어·장식 ───────────────────────────────────────────────────
def hair_rose_updo(g, cx, hy):
    draw_poly(g, [(cx - 6, hy + 2), (cx - 2, hy - 4), (cx + 3, hy - 1)], ROSE_HAIR, K)
    draw_poly(g, [(cx - 5, hy + 3), (cx - 1, hy), (cx + 2, hy + 4)], ROSE_HAIR2, K)
    px(g, cx - 4, hy - 2, ROSE_HAIR2)
    px(g, cx, hy - 3, ROSE_HAIR)


def hair_moon_prince(g, cx, hy):
    draw_poly(g, [(cx - 7, hy + 3), (cx - 3, hy - 5), (cx + 4, hy)], MOON_HAIR, K)
    for x0, y0, x1, y1 in ((cx - 6, hy + 4, cx - 8, hy + 12), (cx - 3, hy + 5, cx - 2, hy + 14)):
        draw_line(g, x0, y0, x1, y1, MOON_HAIR2)
    px(g, cx - 5, hy - 2, WHITE)


def hair_star_wave(g, cx, hy):
    draw_poly(g, [(cx - 6, hy + 2), (cx - 2, hy - 4), (cx + 3, hy)], STAR_HAIR, K)
    px(g, cx - 5, hy + 5, STAR_HAIR2)
    px(g, cx - 4, hy + 8, STAR_HAIR)
    px(g, cx - 3, hy + 11, STAR_HAIR2)


def hair_beach_pony(g, cx, hy):
    draw_poly(g, [(cx - 5, hy), (cx - 1, hy - 3), (cx + 2, hy + 1)], BEACH_HAIR, K)
    draw_line(g, cx - 5, hy + 2, cx - 6, hy + 9, BEACH_HAIR2)
    px(g, cx - 6, hy + 9, BEACH_STRIPE)


def hair_harbor_cap(g, cx, hy):
    draw_poly(g, [(cx - 6, hy), (cx - 1, hy - 2), (cx + 3, hy + 1)], HARBOR_HAIR, K)
    draw_poly(g, [(cx - 5, hy - 1), (cx + 2, hy - 1), (cx + 1, hy - 3), (cx - 4, hy - 3)], HARBOR_CAP, K)


def hair_rain_braid(g, cx, hy):
    draw_poly(g, [(cx - 5, hy), (cx - 1, hy - 2), (cx + 2, hy + 1)], RAIN_HAIR, K)
    for y in range(hy + 2, hy + 10, 2):
        px(g, cx - 5, y, RAIN_HAIR2 if y % 4 else RAIN_HAIR)


def tiara_rose(g, cx, hy):
    for x, c in ((cx - 2, ROSE_GEM), (cx, ROSE_FIN), (cx + 2, ROSE_GEM)):
        px(g, x, hy - 3, c)
    px(g, cx, hy - 4, WHITE)


def tiara_moon(g, cx, hy):
    px(g, cx - 1, hy - 3, MOON_GEM)
    px(g, cx, hy - 4, WHITE)
    px(g, cx + 1, hy - 3, MOON_TAIL)


def tiara_star(g, cx, hy):
    for x, y in ((cx, hy - 4), (cx - 1, hy - 2), (cx + 1, hy - 2)):
        px(g, x, y, STAR_DOT)
    px(g, cx, hy - 5, WHITE)


def clip_sun(g, cx, hy):
    px(g, cx - 2, hy - 2, BEACH_STRIPE)
    px(g, cx - 1, hy - 3, (255, 220, 80, 255))
    px(g, cx, hy - 2, BEACH_STRIPE)


def collar_cape(g, cx, hy, left, right):
    draw_poly(g, [(cx - 6, hy + 8), (cx - 2, hy + 11), (cx + 2, hy + 11), (cx + 4, hy + 8)], left, K)
    px(g, cx - 1, hy + 9, right)


def top_striped(g, cx, hy):
    for x in range(cx - 3, cx + 2):
        px(g, x, hy + 9, BEACH_TOP if x % 2 == 0 else BEACH_STRIPE)


def jacket_orange(g, cx, hy):
    fill_ellipse(g, cx - 1, hy + 10, 4, 3, HARBOR_JACKET, K)
    px(g, cx - 1, hy + 9, (255, 200, 140, 255))


def cardi_mustard(g, cx, hy):
    fill_ellipse(g, cx - 1, hy + 10, 4, 3, RAIN_CARDI, K)
    for x in (cx - 2, cx + 1):
        px(g, x, hy + 9, RAIN_HAIR2)


def upper_pretty(
    g,
    cx,
    head_y,
    *,
    skin,
    skin2,
    hair_fn,
    crown_fn,
    accent,
    prince=False,
    dress_fn=None,
):
    """공주/왕자 상체."""
    fill_circle(g, cx - 1, head_y + 2, 5, skin, K)
    fill_ellipse(g, cx - 1, head_y + 5, 4, 3, skin2)
    if prince:
        draw_eye(g, cx - 4, head_y + 1, large=True)
        draw_eye(g, cx, head_y + 2, sclera=WHITE, pupil=K, large=False)
    else:
        draw_eye(g, cx - 4, head_y + 1, large=True)
    hair_fn(g, cx, head_y)
    crown_fn(g, cx, head_y)
    for x in (cx - 3, cx - 1, cx + 1):
        px(g, x, head_y + 8, accent)
    if dress_fn:
        dress_fn(g, cx, head_y)
    else:
        fill_ellipse(g, cx - 1, head_y + 10, 5, 3, skin, K)
    px(g, cx - 6, head_y + 9, skin)
    px(g, cx + 4, head_y + 9, skin)
    px(g, cx - 7, head_y + 10, skin2)
    px(g, cx + 5, head_y + 10, skin2)


def upper_normal(
    g,
    cx,
    head_y,
    *,
    skin,
    skin2,
    hair_fn,
    top_fn,
    boy=False,
):
    """일반인 상체."""
    fill_circle(g, cx - 1, head_y + 2, 5, skin, K)
    fill_ellipse(g, cx - 1, head_y + 5, 4, 3, skin2)
    if boy:
        draw_eye(g, cx - 4, head_y + 1, large=True)
        draw_eye(g, cx, head_y + 2, sclera=WHITE, pupil=K, large=False)
        px(g, cx - 2, head_y + 6, skin2)
    else:
        draw_eye(g, cx - 4, head_y + 1, large=True)
    hair_fn(g, cx, head_y)
    top_fn(g, cx, head_y)
    px(g, cx - 5, head_y + 9, skin)
    px(g, cx + 3, head_y + 9, skin)
    px(g, cx - 6, head_y + 10, skin2)
    px(g, cx + 4, head_y + 10, skin2)


def dress_rose_gown(g, cx, hy):
    fill_ellipse(g, cx - 1, hy + 10, 5, 3, ROSE_FIN, K)
    px(g, cx - 4, hy + 10, ROSE_TAIL2)
    px(g, cx + 2, hy + 10, ROSE_TAIL2)


def dress_moon_cape(g, cx, hy):
    collar_cape(g, cx, hy, MOON_TAIL2, WHITE)


def dress_star_shawl(g, cx, hy):
    collar_cape(g, cx, hy, STAR_TAIL, STAR_DOT)


def fish_eye_simple(g, x, y, pupil=K):
    """일반 만화 물고기 눈."""
    px(g, x, y, WHITE)
    px(g, x + 1, y, WHITE)
    px(g, x, y + 1, pupil)
    px(g, x + 1, y + 1, WHITE)


def upper_ordinary_fish(
    g,
    cx,
    head_y,
    body,
    body2,
    belly=FISH_BELLY,
    fin_color=FISH_FIN,
    *,
    dorsal_ragged=False,
    eye_left=True,
    eye_right=True,
    mouth_open=False,
    spots=None,
):
    """일반 물고기 상체 — 금붕어/민물고기 느낌, 심해어 X."""
    hy = head_y
    if dorsal_ragged:
        draw_poly(g, [(cx - 1, hy), (cx + 2, hy - 2), (cx + 4, hy + 1)], body2, K)
        px(g, cx, hy - 1, ROT)
    else:
        draw_poly(g, [(cx - 2, hy), (cx + 1, hy - 2), (cx + 3, hy + 1)], fin_color, K)
    fill_circle(g, cx, hy + 4, 5, body, K)
    fill_ellipse(g, cx - 1, hy + 5, 4, 3, belly)
    if eye_left:
        fish_eye_simple(g, cx - 3, hy + 3)
    else:
        px(g, cx - 3, hy + 3, K)
        px(g, cx - 2, hy + 4, K)
    if eye_right:
        fish_eye_simple(g, cx + 1, hy + 3)
    if mouth_open:
        px(g, cx - 6, hy + 4, FISH_MOUTH)
        px(g, cx - 6, hy + 5, K)
        px(g, cx - 5, hy + 5, WHITE)
    else:
        px(g, cx - 6, hy + 4, K)
        px(g, cx - 5, hy + 4, FISH_MOUTH)
    for y in (hy + 3, hy + 4, hy + 5):
        px(g, cx + 3, y, body2)
    draw_poly(g, [(cx - 5, hy + 9), (cx + 1, hy + 8), (cx - 4, hy + 11)], fin_color, K)
    draw_poly(g, [(cx + 3, hy + 9), (cx + 5, hy + 11), (cx + 2, hy + 10)], fin_color, K)
    fill_ellipse(g, cx, hy + 11, 5, 4, body, K)
    px(g, cx - 1, hy + 12, belly)
    px(g, cx + 1, hy + 11, body2)
    px(g, cx, hy + 13, body2)
    if spots:
        for x, y in spots:
            px(g, x, y, LESION)


def lower_legs_feet(
    g,
    cx,
    waist,
    pants=PANTS,
    pants2=PANTS2,
    skin=SKIN,
    shoe=SHOE,
    sole=SOLE,
    stains=None,
):
    """사람 다리 + 발."""
    px(g, cx - 3, waist, pants2)
    px(g, cx - 2, waist, pants2)
    px(g, cx + 2, waist, pants2)
    px(g, cx + 3, waist, pants2)
    for y in range(waist + 1, waist + 7):
        px(g, cx - 3, y, pants)
        px(g, cx - 2, y, pants)
        px(g, cx + 2, y, pants)
        px(g, cx + 3, y, pants)
    px(g, cx - 3, waist + 7, skin)
    px(g, cx - 2, waist + 7, skin)
    px(g, cx + 2, waist + 7, skin)
    px(g, cx + 3, waist + 7, skin)
    for x in range(cx - 5, cx - 1):
        px(g, x, waist + 8, shoe)
        px(g, x, waist + 9, sole)
    for x in range(cx + 2, cx + 6):
        px(g, x, waist + 8, shoe)
        px(g, x, waist + 9, sole)
    px(g, cx - 2, waist + 8, K)
    px(g, cx + 3, waist + 8, K)
    if stains:
        for x, y in stains:
            px(g, x, y, MUCUS)


def body_defective_fish(g, cx, head_y, fish_kw, legs_kw):
    upper_ordinary_fish(g, cx, head_y, **fish_kw)
    lower_legs_feet(g, cx, head_y + 15, **legs_kw)


def body_pretty(g, cx, head_y, tail, tail2, fin, tail_dots=None, dot_color=WHITE, **upper_kw):
    upper_pretty(g, cx, head_y, **upper_kw)
    fish_tail(g, cx - 1, head_y + 13, tail, tail2, fin, dots=tail_dots, dot_color=dot_color)


def body_normal(g, cx, head_y, tail, tail2, fin, **upper_kw):
    upper_normal(g, cx, head_y, **upper_kw)
    fish_tail(g, cx - 1, head_y + 13, tail, tail2, fin)


# ── Pretty: 독창 공주/왕자 + 물고기 꼬리 ───────────────────────────
def sprite_golden():
    g = blank()
    body_pretty(
        g, 15, 6, ROSE_TAIL, ROSE_TAIL2, ROSE_FIN,
        tail_dots=((12, 20), (15, 22), (17, 19)),
        dot_color=WHITE,
        skin=ROSE_SKIN, skin2=ROSE_SKIN2,
        hair_fn=hair_rose_updo,
        crown_fn=tiara_rose,
        accent=WHITE,
        dress_fn=dress_rose_gown,
    )
    return g


def sprite_fluffy():
    g = blank()
    body_pretty(
        g, 16, 5, MOON_TAIL, MOON_TAIL2, MOON_FIN,
        skin=MOON_SKIN, skin2=MOON_SKIN2,
        hair_fn=hair_moon_prince,
        crown_fn=tiara_moon,
        accent=MOON_GEM,
        prince=True,
        dress_fn=dress_moon_cape,
    )
    for x, y in ((13, 5), (19, 6)):
        px(g, x, y, WHITE)
    return g


def sprite_sparkle():
    g = blank()
    body_pretty(
        g, 15, 6, STAR_TAIL, STAR_TAIL2, STAR_FIN,
        tail_dots=((11, 19), (14, 23), (17, 21), (13, 25)),
        dot_color=STAR_DOT,
        skin=STAR_SKIN, skin2=STAR_SKIN2,
        hair_fn=hair_star_wave,
        crown_fn=tiara_star,
        accent=STAR_DOT,
        dress_fn=dress_star_shawl,
    )
    for x, y in ((8, 7), (24, 8), (10, 17)):
        px(g, x, y, STAR_DOT)
    return g


# ── Normal: 독창 일반인 + 물고기 꼬리 ────────────────────────────────
def sprite_standard():
    g = blank()
    body_normal(
        g, 15, 7, BEACH_TAIL, BEACH_TAIL2, BEACH_FIN,
        skin=BEACH_SKIN, skin2=BEACH_SKIN2,
        hair_fn=hair_beach_pony,
        top_fn=top_striped,
        boy=False,
    )
    clip_sun(g, 15, 7)
    return g


def sprite_farm():
    g = blank()
    body_normal(
        g, 15, 7, HARBOR_TAIL, HARBOR_TAIL2, HARBOR_FIN,
        skin=HARBOR_SKIN, skin2=HARBOR_SKIN2,
        hair_fn=hair_harbor_cap,
        top_fn=jacket_orange,
        boy=True,
    )
    return g


def sprite_plain():
    g = blank()
    body_normal(
        g, 15, 7, RAIN_TAIL, RAIN_TAIL2, RAIN_FIN,
        skin=RAIN_SKIN, skin2=RAIN_SKIN2,
        hair_fn=hair_rain_braid,
        top_fn=cardi_mustard,
        boy=False,
    )
    px(g, 8, 6, (180, 200, 220, 255))
    px(g, 23, 8, (180, 200, 220, 255))
    return g


# ── Defective: 일반 물고기 상체 + 사람 다리·발 ───────────────────────
def sprite_scruffy():
    g = blank()
    cx, hy = 15, 5
    body_defective_fish(
        g, cx, hy,
        dict(
            body=FISH_GREY, body2=FISH_GREY2, belly=FISH_BELLY, fin_color=FISH_FIN,
            dorsal_ragged=True, eye_left=False, eye_right=True, mouth_open=False,
            spots=((cx - 1, hy + 12), (cx + 2, hy + 13)),
        ),
        dict(pants=PANTS2, pants2=K, shoe=SHOE, sole=SOLE, stains=((cx - 2, hy + 18),)),
    )
    return g


def sprite_grumpy():
    g = blank()
    cx, hy = 15, 4
    body_defective_fish(
        g, cx, hy,
        dict(
            body=FISH_DARK, body2=FISH_DARK2, belly=(200, 205, 215, 255), fin_color=FISH_DARK2,
            dorsal_ragged=False, eye_left=True, eye_right=True, mouth_open=True,
        ),
        dict(pants=PANTS, pants2=PANTS2, shoe=SHOE, sole=SOLE),
    )
    return g


def sprite_sickly():
    g = blank()
    cx, hy = 15, 5
    body_defective_fish(
        g, cx, hy,
        dict(
            body=FISH_PALE, body2=FISH_PALE2, belly=WHITE, fin_color=FISH_PALE2,
            dorsal_ragged=False, eye_left=True, eye_right=False, mouth_open=False,
            spots=((cx, hy + 11), (cx - 2, hy + 13), (cx + 1, hy + 12)),
        ),
        dict(
            pants=PALE2, pants2=PALE, skin=PALE, shoe=SHOE, sole=SOLE,
            stains=((cx - 3, hy + 17), (cx + 2, hy + 19)),
        ),
    )
    return g


TIER_SPRITES = {
    "adult/golden": sprite_golden,
    "adult/fluffy": sprite_fluffy,
    "adult/sparkle": sprite_sparkle,
    "adult/standard": sprite_standard,
    "adult/farm": sprite_farm,
    "adult/plain": sprite_plain,
    "adult/scruffy": sprite_scruffy,
    "adult/grumpy": sprite_grumpy,
    "adult/sickly": sprite_sickly,
}

KO = {
    "adult/golden": "진주 인어",
    "adult/fluffy": "달빛 실크 인어",
    "adult/sparkle": "별빛 인어",
    "adult/standard": "산호 인어",
    "adult/farm": "해초 인어",
    "adult/plain": "늪 인어",
    "adult/scruffy": "저주받은 인어",
    "adult/grumpy": "송곳니 인어",
    "adult/sickly": "기생 인어",
}

TIER_RULE = {
    "adult/golden": "pretty · 장미 진주 공주 + 분홍 꼬리",
    "adult/fluffy": "pretty · 은빛 달 왕자 + 달빛 망토",
    "adult/sparkle": "pretty · 성좌 공주 + 보랏빛 꼬리",
    "adult/standard": "normal · 해변 소녀 + 산호빛 꼬리",
    "adult/farm": "normal · 항구 소년 + 해초록 꼬리",
    "adult/plain": "normal · 비 오는 날 소녀 + 잿빛 꼬리",
    "adult/scruffy": "defective · 민물고기 상체 + 사람 다리·발",
    "adult/grumpy": "defective · 민물고기 상체 + 사람 다리·발",
    "adult/sickly": "defective · 민물고기 상체 + 사람 다리·발",
}

SECTIONS = [
    ("pretty — 독창 공주/왕자 + 물고기 꼬리", ["adult/golden", "adult/fluffy", "adult/sparkle"]),
    ("normal — 독창 일반인 + 물고기 꼬리", ["adult/standard", "adult/farm", "adult/plain"]),
    ("defective — 일반 물고기 상체 + 사람 다리·발", ["adult/scruffy", "adult/grumpy", "adult/sickly"]),
]


def load_png(path: Path, cell: int):
    from PIL import Image

    return Image.open(path).convert("RGBA").resize((cell, cell), Image.NEAREST)


def build_compare(path: Path):
    cell, gap, pad = 120, 10, 14
    col_w = cell * 2 + gap
    title_h = 52
    sec_h, row_h = 28, cell + 36
    w = pad * 2 + col_w * 3
    h = pad + title_h + sum(sec_h + row_h + 16 for _ in SECTIONS) + pad
    sheet = Image.new("RGBA", (w, h), (12, 20, 38, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    draw.text((pad, 8), "Tier concept — v1 vs new body rules (32px Famicom)", fill=(0, 229, 255), font=font)
    draw.text((pad, 22), "Left: game v1  |  Right: tier concept", fill=(144, 202, 249), font=font)
    draw.text((pad, 36), "pretty/normal: human top + fish tail | defective: fish top + human legs", fill=(255, 183, 160), font=font)
    y = pad + title_h
    for title, keys in SECTIONS:
        draw.text((pad, y), title, fill=(255, 183, 160), font=font)
        y += sec_h
        for i, rel in enumerate(keys):
            x = pad + i * col_w
            v1_img = load_png(GAME / f"{rel}.png", cell)
            tc = grid_to_image(TIER_SPRITES[rel]()).resize((cell, cell), Image.NEAREST)
            sheet.paste(v1_img, (x, y), v1_img)
            sheet.paste(tc, (x + cell + gap, y), tc)
            draw.text((x, y + cell + 4), KO[rel], fill=(200, 220, 255), font=font)
            draw.text((x, y + cell + 18), TIER_RULE[rel], fill=(144, 202, 249), font=font)
        y += row_h + 16
    sheet.save(path, "PNG")
    return path


def build_pretty_normal_strip(path: Path):
    keys = [
        "adult/golden", "adult/fluffy", "adult/sparkle",
        "adult/standard", "adult/farm", "adult/plain",
    ]
    cell, gap, pad = 140, 10, 12
    col_w = cell * 2 + gap
    w = 3 * col_w + pad
    h = 2 * (cell + 40) + pad + 28
    sheet = Image.new("RGBA", (w, h), (12, 20, 38, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    draw.text((pad, 8), "Pretty & normal — original designs (not deep-sea)", fill=(0, 229, 255), font=font)
    for i, rel in enumerate(keys):
        col, row = i % 3, i // 3
        x = pad + col * col_w
        y = 28 + row * (cell + 40)
        v1_img = load_png(GAME / f"{rel}.png", cell)
        tc = grid_to_image(TIER_SPRITES[rel]()).resize((cell, cell), Image.NEAREST)
        sheet.paste(v1_img, (x, y), v1_img)
        sheet.paste(tc, (x + cell + gap, y), tc)
        draw.text((x, y + cell + 4), TIER_RULE[rel], fill=(255, 183, 160), font=font)
    sheet.save(path, "PNG")
    return path


def build_defective_strip(path: Path):
    keys = ["adult/scruffy", "adult/grumpy", "adult/sickly"]
    cell, gap, pad = 160, 12, 14
    w = len(keys) * (cell * 2 + gap) + pad
    h = cell + 56
    sheet = Image.new("RGBA", (w, h), (12, 20, 38, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    draw.text((pad, 8), "Defective zoom — ordinary fish top + human legs & feet", fill=(0, 229, 255), font=font)
    for i, rel in enumerate(keys):
        x = pad + i * (cell * 2 + gap)
        y = 28
        v1_img = load_png(GAME / f"{rel}.png", cell)
        tc = grid_to_image(TIER_SPRITES[rel]()).resize((cell, cell), Image.NEAREST)
        sheet.paste(v1_img, (x, y), v1_img)
        sheet.paste(tc, (x + cell + gap, y), tc)
        draw.text((x, y + cell + 4), KO[rel], fill=(255, 183, 160), font=font)
    sheet.save(path, "PNG")
    return path


def build_html():
    cards = []
    for title, keys in SECTIONS:
        block = []
        for rel in keys:
            block.append(
                f"""    <figure>
      <div class="row">
        <div><img src="../assets/sprites/mermaid/{rel}.png" alt=""><span>v1</span></div>
        <div class="hl"><img src="tier-concept/{rel}.png" alt=""><span>티어 시안</span></div>
      </div>
      <figcaption><strong>{KO[rel]}</strong><br><span class="sub">{TIER_RULE[rel]}</span></figcaption>
    </figure>"""
            )
        cards.append(f"  <h2>{title}</h2>\n  <div class=\"grid\">\n" + "\n".join(block) + "\n  </div>")
    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>인어 티어 콘셉트 시안</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: -apple-system, sans-serif; background: #0c1426; color: #e3f2fd; padding: 20px 14px 40px; max-width: 720px; margin: 0 auto; }}
    h1 {{ font-size: 16px; color: #00e5ff; margin-bottom: 6px; }}
    h2 {{ font-size: 12px; color: #90caf9; margin: 24px 0 10px; border-bottom: 1px solid #1e3a5f; padding-bottom: 6px; }}
    p {{ font-size: 11px; color: #78909c; line-height: 1.6; margin-bottom: 14px; }}
    .rules {{ background: #152238; border: 1px solid #1e3a5f; border-radius: 6px; padding: 12px 14px; margin-bottom: 16px; font-size: 11px; line-height: 1.7; }}
    .rules strong {{ color: #ffd54f; }}
    .sheet {{ width: 100%; border: 1px solid #1e3a5f; margin-bottom: 16px; border-radius: 4px; }}
    .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }}
    figure {{ background: #152238; border: 1px solid #1e3a5f; border-radius: 6px; padding: 12px; text-align: center; }}
    .row {{ display: flex; gap: 10px; justify-content: center; }}
    .row div {{ display: flex; flex-direction: column; align-items: center; gap: 4px; }}
    .row span {{ font-size: 9px; color: #78909c; }}
    .row .hl img {{ outline: 2px solid #00e5ff; }}
    .row .hl span {{ color: #00e5ff; font-weight: 600; }}
    img {{ width: 80px; height: 80px; image-rendering: pixelated; background: #0a1020; }}
    figcaption {{ font-size: 10px; margin-top: 8px; line-height: 1.45; }}
    .sub {{ color: #80cbc4; font-size: 9px; }}
    .tag {{ display: inline-block; margin-top: 20px; padding: 5px 12px; background: #00e5ff; color: #0c1426; font-size: 10px; font-weight: 700; border-radius: 3px; }}
  </style>
</head>
<body>
  <h1>인어 성체 — 티어별 상·하체 콘셉트</h1>
  <p>v1 페미콘 32×32 유지. <strong>심해어·기존 인어 v1 색과 무관</strong>한 독창 캐릭터입니다. <strong>게임 미반영</strong></p>
  <div class="rules">
    <strong>pretty</strong> — 공주/왕자 상체 + 물고기 꼬리 (장미 진주 / 은빛 달 / 성좌)<br>
    <strong>normal</strong> — 일반인 상체 + 물고기 꼬리 (해변 소녀 / 항구 소년 / 비 오는 날)<br>
    <strong>defective</strong> — 일반 물고기 상체 + 사람 다리·발
  </div>
  <img class="sheet" src="_preview-tier-pretty-normal.png" alt="pretty·normal 확대">
  <img class="sheet" src="_preview-tier-concept.png" alt="비교 시트">
  <img class="sheet" src="_preview-tier-defective.png" alt="defective 확대">
{"".join(cards)}
  <p style="text-align:center">
    <a href="preview-encyclopedia-compare.html" style="color:#00e5ff;font-size:11px;margin-right:12px">도감 설명 비교 →</a>
    <span class="tag">STAGING ONLY</span>
  </p>
</body>
</html>"""
    out = STAGING / "preview-tier-concept.html"
    out.write_text(html, encoding="utf-8")
    return out


def main():
    STAGING.mkdir(parents=True, exist_ok=True)
    out = STAGING / "tier-concept"
    for rel, fn in TIER_SPRITES.items():
        save_sprite(fn(), out / f"{rel}.png")
    sheet = build_compare(STAGING / "_preview-tier-concept.png")
    pretty_normal = build_pretty_normal_strip(STAGING / "_preview-tier-pretty-normal.png")
    defective = build_defective_strip(STAGING / "_preview-tier-defective.png")
    html = build_html()
    print(f"Tier concept -> {out}/ ({len(TIER_SPRITES)} files)")
    print(f"Compare      -> {sheet}")
    print(f"Pretty/normal-> {pretty_normal}")
    print(f"Defective    -> {defective}")
    print(f"HTML         -> {html}")
    print(f"Open: file://{html.resolve()}")


if __name__ == "__main__":
    main()
