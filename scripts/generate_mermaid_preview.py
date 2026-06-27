#!/usr/bin/env python3
"""Stage mermaid-themed pet sprites — preview only (not installed to game)."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from generate_all_sprites import (
    ACTION_SPRITES,
    BLOB,
    BLOB2,
    BONE_SHOW,
    COPPER,
    COPPER2,
    DROOL,
    EYE_YELLOW,
    GLOW,
    GLOW2,
    GOLD_LIGHT,
    HEART_EYE,
    JELLY,
    JELLY2,
    JELLY3,
    JELLY4,
    K,
    LARVA,
    LARVA2,
    LESION,
    MOUTH_IN,
    MUD,
    MUD2,
    MUCUS,
    OUT,
    PALE,
    PALE2,
    PARASITE,
    RAG,
    RAG2,
    RED,
    REEF,
    REEF2,
    ROT,
    SIZE,
    SLIME,
    SLIME2,
    SPARK,
    SPARK2,
    SPARK3,
    TEAR,
    TEEN,
    TEEN2,
    WHITE,
    blank,
    draw_empty_socket,
    draw_eye,
    draw_eye_grotesque,
    draw_line,
    draw_mini_heart,
    draw_poly,
    draw_swollen_eye,
    eyes_heart,
    eyes_sick_tears,
    eyes_sleep_closed,
    fill_circle,
    fill_ellipse,
    mouth_neutral,
    mouth_sad,
    mouth_sick,
    mouth_sleep_drool,
    mouth_smile,
    px,
    sprite_fly,
    sprite_heart_broken,
    sprite_locked,
    sprite_mood,
    sprite_poop,
)

ROOT = Path(__file__).resolve().parent.parent
STAGING = ROOT / ".sprite-staging-mermaid"
DEEPSEA = ROOT / "assets/sprites"

# ── Mermaid palette ─────────────────────────────────────────────────
SKIN = (255, 204, 188, 255)
SKIN2 = (244, 180, 160, 255)
PEARL = (255, 248, 240, 255)
PEARL2 = (255, 236, 220, 255)
PEARL_DOT = (255, 213, 180, 255)
CLAM = (188, 170, 164, 255)
CLAM2 = (141, 110, 99, 255)

TAIL_A = (77, 182, 172, 255)
TAIL_B = (38, 166, 154, 255)
TAIL_C = (38, 139, 210, 255)
TAIL_D = (21, 101, 192, 255)

HAIR_MOON = (233, 213, 255, 255)
HAIR_MOON2 = (206, 147, 216, 255)
HAIR_COSMIC = (156, 120, 255, 255)
HAIR_CORAL = (255, 183, 77, 255)
HAIR_SEAWEED = (102, 187, 106, 255)
HAIR_MUD = (120, 144, 156, 255)

SCALES_GOLD = (255, 213, 79, 255)
SCALES_STAR = (0, 229, 255, 255)


def grid_to_image(g):
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    pxmap = img.load()
    for y in range(SIZE):
        for x in range(SIZE):
            pxmap[x, y] = g[y][x]
    return img.resize((OUT, OUT), Image.NEAREST)


def save_sprite(g, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    grid_to_image(g).save(path, "PNG")


def draw_hair_block(g, pts, fill, outline=K):
    draw_poly(g, pts, fill, outline)


def draw_mermaid_tail(g, cx, top_y, tail, tail2, fin, length=9, curve=2):
    """Simple curved fish tail from waist."""
    draw_poly(g, [(cx - 3, top_y), (cx + 3, top_y), (cx + 1, top_y + length)], tail, K)
    draw_poly(g, [(cx - 1, top_y + 2), (cx + 2, top_y + length - 1), (cx + 4, top_y + length + 3)], tail2, K)
    draw_poly(g, [(cx - 4, top_y + length + 1), (cx - 1, top_y + length + 4), (cx + 2, top_y + length)], fin, K)


def draw_mermaid_body(g, skin=SKIN, skin2=SKIN2, cx=16, head_y=9, hair_fn=None, tail=TAIL_A, tail2=TAIL_B, fin=TAIL_C):
    """Chibi mermaid facing left — head, torso, arms, tail."""
    fill_circle(g, cx - 1, head_y + 2, 5, skin, K)
    fill_ellipse(g, cx - 1, head_y + 5, 4, 3, skin2)
    draw_eye(g, cx - 4, head_y + 1, large=True)
    if hair_fn:
        hair_fn(g, cx, head_y)
    fill_ellipse(g, cx - 1, head_y + 9, 4, 3, skin, K)
    px(g, cx - 5, head_y + 9, skin)
    px(g, cx + 3, head_y + 9, skin)
    px(g, cx - 6, head_y + 10, skin2)
    px(g, cx + 4, head_y + 10, skin2)
    waist = head_y + 11
    draw_mermaid_tail(g, cx - 1, waist, tail, tail2, fin)


def hair_long(g, cx, head_y, c1, c2):
    draw_poly(g, [(cx - 6, head_y + 1), (cx - 2, head_y - 3), (cx + 2, head_y)], c1, K)
    draw_poly(g, [(cx - 5, head_y + 2), (cx - 1, head_y + 1), (cx + 1, head_y + 4)], c2, K)
    for x, y in ((cx - 6, head_y + 5), (cx - 5, head_y + 8), (cx - 4, head_y + 11)):
        px(g, x, y, c2)


def hair_short(g, cx, head_y, c1, c2):
    draw_poly(g, [(cx - 5, head_y), (cx - 1, head_y - 2), (cx + 2, head_y + 1)], c1, K)
    px(g, cx - 5, head_y + 2, c2)
    px(g, cx - 4, head_y + 3, c2)


def hair_veil(g, cx, head_y, c1, c2):
    """Flowing jellyfish-like veil hair."""
    draw_poly(g, [(cx - 7, head_y + 2), (cx - 2, head_y - 4), (cx + 3, head_y)], c1, K)
    for x0, y0, x1, y1 in (
        (cx - 6, head_y + 4, cx - 8, head_y + 12),
        (cx - 4, head_y + 5, cx - 5, head_y + 14),
        (cx - 2, head_y + 5, cx - 1, head_y + 15),
        (cx, head_y + 4, cx + 2, head_y + 13),
    ):
        draw_line(g, x0, y0, x1, y1, c2)
        px(g, x1, y1, c1)


def hair_messy(g, cx, head_y, c1, c2):
    draw_poly(g, [(cx - 6, head_y + 1), (cx - 3, head_y - 2), (cx + 1, head_y)], c1, K)
    draw_line(g, cx - 6, head_y + 2, cx - 7, head_y + 6, c2)
    draw_line(g, cx - 4, head_y + 1, cx - 5, head_y + 7, ROT)
    px(g, cx - 2, head_y - 1, c2)


def add_scale_sparkles(g, pts, color=SCALES_STAR):
    for x, y in pts:
        px(g, x, y, color)
        px(g, x, y + 1, SPARK3)


def add_crown_pearl(g, cx, head_y):
    for x, y in ((cx - 3, head_y - 3), (cx - 1, head_y - 4), (cx + 1, head_y - 3)):
        px(g, x, y, SCALES_GOLD)
    px(g, cx - 1, head_y - 4, WHITE)


# ── Evolution (5) ───────────────────────────────────────────────────
def sprite_egg():
    """Pearl in open clam."""
    g = blank()
    draw_poly(g, [(8, 20), (16, 26), (24, 20)], CLAM2, K)
    draw_poly(g, [(9, 19), (16, 24), (23, 19)], CLAM, K)
    fill_circle(g, 16, 17, 5, PEARL, K)
    fill_circle(g, 15, 18, 3, PEARL2)
    px(g, 13, 15, PEARL_DOT)
    px(g, 18, 16, WHITE)
    px(g, 10, 18, CLAM2)
    px(g, 22, 18, CLAM2)
    return g


def sprite_baby():
    """Tadpole mermaid larva — big head, tiny tail."""
    g = blank()
    fill_circle(g, 14, 14, 6, LARVA, K)
    fill_ellipse(g, 14, 15, 4, 3, SKIN2)
    draw_eye(g, 11, 12)
    draw_eye(g, 15, 12)
    draw_poly(g, [(12, 18), (16, 18), (18, 26), (10, 26)], LARVA2, K)
    px(g, 14, 22, TAIL_B)
    return g


def sprite_child():
    """Young mermaid with bob hair."""
    g = blank()
    draw_mermaid_body(
        g,
        cx=15,
        head_y=8,
        hair_fn=lambda gr, cx, hy: hair_short(gr, cx, hy, HAIR_CORAL, COPPER2),
        tail=TAIL_A,
        tail2=TAIL_B,
        fin=TAIL_C,
    )
    return g


def sprite_teen():
    """Teen mermaid — longer hair, taller tail."""
    g = blank()
    draw_mermaid_body(
        g,
        cx=15,
        head_y=6,
        hair_fn=lambda gr, cx, hy: hair_long(gr, cx, hy, TEEN, TEEN2),
        tail=TAIL_C,
        tail2=TAIL_D,
        fin=TEEN2,
    )
    draw_poly(g, [(10, 8), (13, 4), (16, 9)], TEEN2, K)
    return g


def sprite_dead():
    """Ghost mermaid skeleton."""
    g = blank()
    BONE = (245, 245, 235, 255)
    GHOST = (187, 222, 251, 200)
    fill_circle(g, 14, 10, 5, GHOST, K)
    px(g, 11, 9, K)
    px(g, 17, 9, K)
    draw_line(g, 14, 15, 14, 19, BONE)
    draw_line(g, 10, 16, 18, 16, BONE)
    draw_line(g, 12, 19, 10, 24, K)
    draw_line(g, 12, 19, 10, 24, BONE)
    draw_line(g, 16, 19, 18, 24, K)
    draw_line(g, 16, 19, 18, 24, BONE)
    draw_poly(g, [(10, 24), (14, 28), (18, 24), (16, 22), (12, 22)], BONE, K)
    px(g, 8, 11, (0, 0, 0, 0))
    px(g, 20, 11, (0, 0, 0, 0))
    return g


# ── Adult pretty (3) ──────────────────────────────────────────────────
def sprite_golden():
    """Pretty — golden pearl princess, glowing crown."""
    g = blank()
    draw_mermaid_body(
        g,
        skin=GOLD_LIGHT,
        skin2=GLOW,
        cx=15,
        head_y=7,
        hair_fn=lambda gr, cx, hy: (
            hair_long(gr, cx, hy, GLOW2, GLOW),
            add_crown_pearl(gr, cx, hy),
        ),
        tail=GLOW2,
        tail2=GLOW,
        fin=SCALES_GOLD,
    )
    for x, y in ((11, 20), (14, 22), (17, 21)):
        px(g, x, y, SCALES_GOLD)
    draw_line(g, 14, 3, 14, 6, K)
    for x, y in ((13, 2), (14, 2), (15, 2), (14, 1)):
        px(g, x, y, GLOW)
    px(g, 14, 1, WHITE)
    return g


def sprite_fluffy():
    """Pretty — moonlit silk veil mermaid."""
    g = blank()
    draw_mermaid_body(
        g,
        skin=JELLY4,
        skin2=JELLY3,
        cx=16,
        head_y=6,
        hair_fn=lambda gr, cx, hy: hair_veil(gr, cx, hy, HAIR_MOON, HAIR_MOON2),
        tail=JELLY2,
        tail2=JELLY,
        fin=HAIR_MOON,
    )
    draw_eye(g, 12, 7, sclera=WHITE, pupil=K, large=True)
    draw_eye(g, 17, 7, sclera=WHITE, pupil=K, large=True)
    for x, y in ((13, 6), (16, 5), (19, 6)):
        px(g, x, y, WHITE)
    return g


def sprite_sparkle():
    """Pretty — starlit cosmic mermaid."""
    g = blank()
    draw_mermaid_body(
        g,
        skin=SPARK3,
        skin2=(220, 210, 255, 255),
        cx=15,
        head_y=7,
        hair_fn=lambda gr, cx, hy: hair_long(gr, cx, hy, HAIR_COSMIC, SPARK2),
        tail=SPARK2,
        tail2=HAIR_COSMIC,
        fin=SPARK,
    )
    stars = ((8, 8), (24, 7), (7, 18), (25, 20), (12, 5), (20, 14), (14, 24))
    add_scale_sparkles(g, stars)
    draw_eye(g, 11, 8, sclera=WHITE, pupil=K, highlight=SPARK3, large=True)
    return g


# ── Adult normal (3) ──────────────────────────────────────────────────
def sprite_standard():
    """Coral reef mermaid."""
    g = blank()
    draw_mermaid_body(
        g,
        cx=15,
        head_y=8,
        hair_fn=lambda gr, cx, hy: hair_long(gr, cx, hy, HAIR_CORAL, COPPER2),
        tail=COPPER,
        tail2=COPPER2,
        fin=REEF,
    )
    px(g, 10, 9, REEF2)
    px(g, 12, 7, REEF)
    return g


def sprite_farm():
    """Seaweed-wrapped lagoon mermaid."""
    g = blank()
    draw_mermaid_body(
        g,
        cx=15,
        head_y=8,
        hair_fn=lambda gr, cx, hy: hair_short(gr, cx, hy, REEF, REEF2),
        tail=REEF,
        tail2=REEF2,
        fin=HAIR_SEAWEED,
    )
    for x, y in ((10, 7), (11, 6), (13, 5), (12, 8)):
        px(g, x, y, HAIR_SEAWEED)
    px(g, 11, 9, (76, 175, 80, 255))
    return g


def sprite_plain():
    """Dull lagoon mud mermaid."""
    g = blank()
    draw_mermaid_body(
        g,
        skin=MUD,
        skin2=MUD2,
        cx=15,
        head_y=8,
        hair_fn=lambda gr, cx, hy: hair_short(gr, cx, hy, HAIR_MUD, MUD2),
        tail=MUD,
        tail2=MUD2,
        fin=(84, 110, 122, 255),
    )
    px(g, 13, 14, MUD2)
    px(g, 15, 20, MUD2)
    return g


# ── Adult defective (3) ─────────────────────────────────────────────────
def sprite_scruffy():
    """Defective — cursed rotting mermaid, missing eye."""
    g = blank()
    fill_circle(g, 14, 10, 5, RAG, K)
    fill_ellipse(g, 14, 11, 4, 3, RAG2)
    hair_messy(g, 14, 8, RAG, ROT)
    draw_empty_socket(g, 10, 9)
    draw_eye_grotesque(g, 14, 9)
    fill_ellipse(g, 14, 15, 4, 3, RAG, K)
    px(g, 10, 15, BONE_SHOW)
    px(g, 9, 14, ROT)
    draw_mermaid_tail(g, 14, 17, RAG2, ROT, SLIME2, length=8)
    for x, y in ((13, 24), (14, 25), (15, 26)):
        px(g, x, y, SLIME)
    px(g, 12, 18, MUCUS)
    return g


def sprite_grumpy():
    """Defective — fang horror mermaid."""
    g = blank()
    fill_circle(g, 14, 11, 6, BLOB, K)
    fill_ellipse(g, 14, 13, 5, 4, (50, 50, 50, 255))
    for x in range(10, 18):
        if x % 2 == 0:
            px(g, x, 12, WHITE)
            px(g, x, 13, K)
    draw_line(g, 10, 10, 13, 11, K)
    draw_line(g, 17, 10, 14, 11, K)
    hair_messy(g, 14, 7, BLOB2, BLOB)
    draw_eye_grotesque(g, 9, 8, iris=WHITE, pupil=RED)
    draw_eye_grotesque(g, 17, 8, iris=WHITE, pupil=RED)
    fill_ellipse(g, 14, 17, 4, 3, BLOB2, K)
    draw_mermaid_tail(g, 14, 19, BLOB2, BLOB, RED, length=7)
    for x, y in ((12, 15), (13, 16), (14, 15)):
        px(g, x, y, SLIME2)
    return g


def sprite_sickly():
    """Defective — parasite host mermaid."""
    g = blank()
    fill_circle(g, 14, 11, 5, PALE, K)
    fill_ellipse(g, 14, 12, 4, 3, PALE2)
    hair_messy(g, 14, 8, PALE2, PALE)
    draw_swollen_eye(g, 12, 10)
    for x, y in ((13, 15), (15, 17), (14, 18)):
        px(g, x, y, LESION)
    worms = ((9, 14, 6, 16), (17, 17, 21, 19), (12, 19, 9, 22))
    for x0, y0, x1, y1 in worms:
        draw_line(g, x0, y0, x1, y1, PARASITE)
        px(g, x1, y1, SLIME2)
    fill_ellipse(g, 14, 17, 4, 3, PALE, K)
    draw_mermaid_tail(g, 14, 19, PALE2, PALE, SLIME2, length=7)
    for x, y in ((14, 26), (15, 27), (13, 28)):
        px(g, x, y, MUCUS)
    return g


# ── Mood (5) — mermaid-tinted bubbles ─────────────────────────────────
def sprite_mood_happy():
    return sprite_mood((255, 228, 240, 255), mouth_smile, eyes_heart)


def sprite_mood_neutral():
    return sprite_mood((230, 220, 245, 255), mouth_neutral)


def sprite_mood_sad():
    return sprite_mood((200, 220, 255, 255), mouth_sad)


def sprite_mood_sleep():
    return sprite_mood((210, 195, 235, 255), mouth_sleep_drool, eyes_sleep_closed)


def sprite_mood_sick():
    return sprite_mood((220, 245, 220, 255), mouth_sick, eyes_sick_tears)


# ── Sprite registry (28 — mirrors deep-sea) ───────────────────────────
MERMAID_SPRITES = {
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
    "mood/happy": sprite_mood_happy,
    "mood/neutral": sprite_mood_neutral,
    "mood/sad": sprite_mood_sad,
    "mood/sleep": sprite_mood_sleep,
    "mood/sick": sprite_mood_sick,
    "ui/heart-broken": sprite_heart_broken,
    "ui/locked": sprite_locked,
    "ui/poop": sprite_poop,
    "ui/fly": sprite_fly,
    "ui/feed": ACTION_SPRITES["feed"],
    "ui/play": ACTION_SPRITES["play"],
    "ui/clean": ACTION_SPRITES["clean"],
    "ui/sleep": ACTION_SPRITES["sleep"],
    "ui/wake": ACTION_SPRITES["wake"],
}

KO_LABELS = {
    "evolution/egg": ("진주 알", "egg"),
    "evolution/baby": ("꼬물 인어", "baby"),
    "evolution/child": ("어린 인어", "child"),
    "evolution/teen": ("청소년 인어", "teen"),
    "evolution/dead": ("망자 인어", "dead"),
    "adult/golden": ("진주 인어", "golden · pretty"),
    "adult/fluffy": ("달빛 실크 인어", "fluffy · pretty"),
    "adult/sparkle": ("별빛 인어", "sparkle · pretty"),
    "adult/standard": ("산호 인어", "standard · normal"),
    "adult/farm": ("해초 인어", "farm · normal"),
    "adult/plain": ("늪 인어", "plain · normal"),
    "adult/scruffy": ("저주받은 인어", "scruffy · defective"),
    "adult/grumpy": ("송곳니 인어", "grumpy · defective"),
    "adult/sickly": ("기생 인어", "sickly · defective"),
    "mood/happy": ("기분 · 행복", "happy"),
    "mood/neutral": ("기분 · 보통", "neutral"),
    "mood/sad": ("기분 · 슬픔", "sad"),
    "mood/sleep": ("기분 · 수면", "sleep"),
    "mood/sick": ("기분 · 아픔", "sick"),
    "ui/heart-broken": ("UI · 깨진 하트", "shared"),
    "ui/locked": ("UI · 잠금", "shared"),
    "ui/poop": ("UI · 배변물", "shared"),
    "ui/fly": ("UI · 파리", "shared"),
    "ui/feed": ("UI · 먹이", "shared"),
    "ui/play": ("UI · 놀이", "shared"),
    "ui/clean": ("UI · 청소", "shared"),
    "ui/sleep": ("UI · 재우기", "shared"),
    "ui/wake": ("UI · 깨우기", "shared"),
}

SECTIONS = [
    ("진화 단계 (5)", [f"evolution/{k}" for k in ("egg", "baby", "child", "teen", "dead")]),
    ("빛나는 인어 · pretty (3)", [f"adult/{k}" for k in ("golden", "fluffy", "sparkle")]),
    ("보통 인어 · normal (3)", [f"adult/{k}" for k in ("standard", "farm", "plain")]),
    ("불량 인어 · defective (3)", [f"adult/{k}" for k in ("scruffy", "grumpy", "sickly")]),
    ("기분 버블 (5)", [f"mood/{k}" for k in ("happy", "neutral", "sad", "sleep", "sick")]),
    ("UI 아이콘 (9) — 심해어와 공용", [
        "ui/heart-broken", "ui/locked", "ui/poop", "ui/fly",
        "ui/feed", "ui/play", "ui/clean", "ui/sleep", "ui/wake",
    ]),
]


def build_comparison_sheet(out_path: Path):
    cell, pad = 96, 10
    label_h = 28
    title_h, row_h = 28, cell + label_h + 6
    cols = 5
    rows = len(SECTIONS)
    w = pad + cols * (cell * 2 + pad + 8) + pad
    h = pad + title_h + sum(row_h + 22 for _ in SECTIONS) + pad
    sheet = Image.new("RGBA", (w, h), (12, 20, 38, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    draw.text((pad, 8), "Mermaid theme — 28 sprites (staging only, not in game)", fill=(0, 229, 255), font=font)

    y = pad + title_h
    for section_title, keys in SECTIONS:
        draw.text((pad, y), section_title, fill=(144, 202, 249), font=font)
        y += 20
        for i, rel in enumerate(keys):
            col = i % cols
            row_off = i // cols
            if col == 0 and row_off > 0:
                y += row_h
            x = pad + col * (cell * 2 + pad + 8)
            yy = y + row_off * 0

            ko, sub = KO_LABELS[rel]
            m_img = grid_to_image(MERMAID_SPRITES[rel]()).resize((cell, cell), Image.NEAREST)
            sheet.paste(m_img, (x, y), m_img)
            draw.text((x, y + cell + 2), f"인어 · {ko}", fill=(255, 183, 160), font=font)

            ds_path = DEEPSEA / f"{rel}.png"
            if ds_path.exists():
                ds_img = Image.open(ds_path).convert("RGBA").resize((cell, cell), Image.NEAREST)
                sheet.paste(ds_img, (x + cell + 8, y), ds_img)
            draw.text((x + cell + 8, y + cell + 2), f"심해어 · {sub}", fill=(128, 203, 196), font=font)

        y += row_h + 22

    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path, "PNG")
    return out_path


def build_full_sheet(out_path: Path):
    cols, cell, pad = 7, 128, 8
    names = list(MERMAID_SPRITES.keys())
    rows = (len(names) + cols - 1) // cols
    title_h = 24
    w = cols * (cell + pad) + pad
    h = title_h + rows * (cell + pad + 20) + pad
    sheet = Image.new("RGBA", (w, h), (12, 20, 38, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    draw.text((pad, 6), "Mermaid — all 28 sprites", fill=(0, 229, 255), font=font)
    for i, rel in enumerate(names):
        col, row = i % cols, i // cols
        x = pad + col * (cell + pad)
        y = title_h + pad + row * (cell + pad + 20)
        img = grid_to_image(MERMAID_SPRITES[rel]()).resize((cell, cell), Image.NEAREST)
        sheet.paste(img, (x, y), img)
        ko, _ = KO_LABELS[rel]
        draw.text((x, y + cell + 2), ko, fill=(255, 183, 160), font=font)
    sheet.save(out_path, "PNG")
    return out_path


def build_preview_html():
    def section_cards(keys):
        cards = []
        for rel in keys:
            ko, sub = KO_LABELS[rel]
            cat, name = rel.split("/")
            cards.append(
                f"""    <figure class="pair">
      <div class="pair-row">
        <img src="mermaid/{rel}.png" alt="">
        <img src="../assets/sprites/{rel}.png" alt="">
      </div>
      <figcaption><strong>{ko}</strong><br><span class="sub">인어 ↔ 심해어 · {sub}</span></figcaption>
    </figure>"""
            )
        return "\n".join(cards)

    sections_html = "\n".join(
        f'  <h2>{title}</h2>\n  <div class="grid">\n{section_cards(keys)}\n  </div>'
        for title, keys in SECTIONS
    )

    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>인어 테마 펫 시안</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #0c1426;
      color: #e3f2fd;
      padding: 24px 16px 48px;
      max-width: 720px;
      margin: 0 auto;
    }}
    h1 {{ font-size: 16px; margin-bottom: 6px; color: #00e5ff; }}
    h2 {{
      font-size: 12px;
      margin: 28px 0 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #1e3a5f;
      color: #90caf9;
    }}
    p {{ font-size: 11px; color: #78909c; margin-bottom: 16px; line-height: 1.55; }}
    .sheet {{
      width: 100%;
      border: 1px solid #1e3a5f;
      display: block;
      margin-bottom: 20px;
      border-radius: 4px;
    }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
    }}
    figure {{
      background: #152238;
      border: 1px solid #1e3a5f;
      border-radius: 6px;
      padding: 10px;
      text-align: center;
    }}
    .pair-row {{
      display: flex;
      gap: 6px;
      justify-content: center;
      align-items: center;
    }}
    figure img {{
      width: 64px;
      height: 64px;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      background: #0a1020;
      border-radius: 2px;
    }}
    figcaption {{ font-size: 10px; margin-top: 8px; line-height: 1.4; }}
    .sub {{ color: #78909c; font-size: 9px; }}
    .legend {{
      display: flex;
      gap: 16px;
      font-size: 10px;
      margin-bottom: 12px;
      color: #b0bec5;
    }}
    .legend span::before {{
      content: "";
      display: inline-block;
      width: 10px;
      height: 10px;
      margin-right: 4px;
      vertical-align: -1px;
      border-radius: 1px;
    }}
    .legend .m::before {{ background: #ffb7a0; }}
    .legend .d::before {{ background: #80cbc4; }}
    .tag {{
      display: inline-block;
      margin-top: 24px;
      padding: 4px 10px;
      font-size: 10px;
      background: #00e5ff;
      color: #0c1426;
      border-radius: 2px;
      font-weight: 600;
    }}
  </style>
</head>
<body>
  <h1>인어 테마 펫 디자인 시안</h1>
  <p>심해어 28종과 동일한 구조·티어(pretty / normal / defective)로 만든 인어 버전입니다. <strong>게임 미반영</strong> · 스테이징 전용.</p>
  <div class="legend">
    <span class="m">왼쪽 = 인어 시안</span>
    <span class="d">오른쪽 = 현재 심해어</span>
  </div>
  <img class="sheet" src="_preview-mermaid-compare.png" alt="전체 비교 시트">
  <img class="sheet" src="_preview-mermaid-sheet.png" alt="인어 전체 시트">
{sections_html}
  <p style="text-align:center"><span class="tag">STAGING ONLY</span></p>
</body>
</html>
"""
    path = STAGING / "preview.html"
    path.write_text(html, encoding="utf-8")
    return path


if __name__ == "__main__":
    import sys

    root = Path(__file__).resolve().parent.parent
    install = "--install" in sys.argv
    out_base = root / "assets/sprites/mermaid" if install else STAGING / "mermaid"
    for rel, fn in MERMAID_SPRITES.items():
        if rel.startswith("ui/"):
            continue
        save_sprite(fn(), out_base / f"{rel}.png")

    if install:
        print(f"Installed {sum(1 for r in MERMAID_SPRITES if not r.startswith('ui/'))} mermaid sprites -> {out_base}")
    else:
        STAGING.mkdir(parents=True, exist_ok=True)
        for rel, fn in MERMAID_SPRITES.items():
            save_sprite(fn(), STAGING / "mermaid" / f"{rel}.png")
        compare = build_comparison_sheet(STAGING / "_preview-mermaid-compare.png")
        sheet = build_full_sheet(STAGING / "_preview-mermaid-sheet.png")
        html = build_preview_html()
        print(f"Mermaid PNGs -> {STAGING / 'mermaid'}/ ({len(MERMAID_SPRITES)} files)")
        print(f"Compare sheet -> {compare}")
        print(f"Full sheet    -> {sheet}")
        print(f"HTML          -> {html}")
        print(f"Open: file://{html.resolve()}")
