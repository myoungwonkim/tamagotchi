#!/usr/bin/env python3
"""열수구(vent) 테마 시안 v3 — 관충 제거, 새우·해마·게·장어 중심. 스테이징 전용."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from generate_all_sprites import (
    K,
    blank,
    draw_eye,
    draw_line,
    draw_poly,
    fill_circle,
    fill_ellipse,
    px,
    save_grid,
)

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "docs" / "vent-theme-preview" / "sprites"

WHITE = (252, 250, 245, 255)
ROCK2 = (62, 52, 56, 255)
LAVA = (255, 105, 30, 255)
LAVA2 = (210, 70, 18, 255)
SHRIMP = (240, 225, 215, 255)
SHRIMP2 = (210, 190, 175, 255)
SHRIMP3 = (185, 165, 150, 255)
EYESPOT = (255, 120, 150, 255)
EYESPOT2 = (200, 80, 110, 255)
BACTERIA = (235, 240, 210, 255)
BACTERIA2 = (200, 210, 170, 255)
YETI = (245, 230, 200, 255)
YETI_HAIR = (255, 245, 210, 255)
YETI_HAIR2 = (220, 200, 160, 255)
CRAB = (120, 55, 45, 255)
CRAB2 = (90, 40, 32, 255)
CRAB_FLAT = (100, 48, 40, 255)
FISH = (55, 65, 82, 255)
FISH2 = (38, 48, 62, 255)
FISH_PINK = (245, 190, 175, 255)
FISH_PINK2 = (220, 155, 140, 255)
TOOTH = (250, 245, 240, 255)
SEAHORSE = (255, 170, 90, 255)
SEAHORSE2 = (220, 130, 60, 255)
SEAHORSE_FIN = (255, 200, 130, 255)
RUST = (130, 72, 48, 255)
PARASITE = (130, 90, 140, 255)
SICK = (180, 210, 120, 255)


def vent_chimney(g, cx=16, base=27):
    fill_ellipse(g, cx, base, 5, 2, ROCK2, K)
    for x in range(cx - 3, cx + 4):
        px(g, x, base - 1, LAVA2)
        px(g, x, base - 2, LAVA)


def shrimp_body_curve(head_x, body_y, length=11, hump=3):
    """측면 새우 — 등(hump)이 위로 굽은 곡선 좌표."""
    pts = []
    for i in range(length):
        x = head_x - i
        t = i / max(length - 1, 1)
        y = body_y - int(hump * 4 * t * (1 - t))
        pts.append((x, y))
    return pts


def draw_shrimp_side(
    g,
    head_x=22,
    body_y=18,
    length=11,
    hump=3,
    *,
    eyespot=False,
    bacteria=False,
    rust=False,
    sick=False,
    small=False,
    leg_pairs=None,
):
    """측면 새우: 굽은 등 + 아랫다리."""
    pts = shrimp_body_curve(head_x, body_y, length, hump)
    thick = 1 if small else 2
    for i, (x, y) in enumerate(pts):
        col = SHRIMP if i < length // 2 else SHRIMP2
        if rust and i > length // 2:
            col = RUST if i % 2 else SHRIMP3
        for dy in range(-thick, thick + 1):
            px(g, x, y + dy, col)
        px(g, x, y - thick - 1, SHRIMP3 if not rust else RUST)

    hx, hy = pts[0]
    draw_line(g, hx + 1, hy - 1, hx + 3, hy - 3, SHRIMP2)
    draw_line(g, hx + 1, hy, hx + 3, hy + 1, SHRIMP2)
    if not small:
        draw_eye(g, hx, hy - 1, sclera=WHITE, pupil=K)

    if eyespot:
        peak = len(pts) // 2
        ex, ey = pts[peak]
        fill_ellipse(g, ex, ey - 3, 2, 1, EYESPOT)
        px(g, ex, ey - 3, EYESPOT2)

    if leg_pairs is None:
        leg_pairs = [2, 4, 6, 8] if not small else [2, 5]
    for i in leg_pairs:
        if i >= len(pts):
            continue
        x, y = pts[i]
        for leg in range(3):
            px(g, x, y + 2 + leg, SHRIMP3)
            px(g, x - 1, y + 2 + leg, K)

    if bacteria:
        for idx in (3, 5):
            if idx < len(pts):
                bx, by = pts[idx]
                px(g, bx, by + 1, BACTERIA)
                px(g, bx + 1, by, BACTERIA2)

    if sick:
        for x, y in pts[4:8]:
            if (x + y) % 3 == 0:
                px(g, x, y + 1, PARASITE)
                px(g, x + 1, y, SICK)


def draw_crab(g, cx, cy, *, hairy=False, bacteria=False, claw_r=3):
    """게 — 큰 집게 + 작은 다리 8개."""
    fill_ellipse(g, cx, cy, 6, 3, CRAB_FLAT, K)
    fill_ellipse(g, cx, cy, 4, 2, CRAB)
    fill_circle(g, cx - 7, cy - 1, claw_r, CRAB2, K)
    fill_circle(g, cx + 7, cy - 1, claw_r, CRAB2, K)
    px(g, cx - 8, cy - 2, CRAB)
    px(g, cx + 8, cy - 2, CRAB)

    for i, lx in enumerate((cx - 4, cx - 2, cx, cx + 2)):
        draw_line(g, lx, cy + 2, lx - 1 if lx < cx else lx + 1, cy + 5, CRAB2)
        px(g, lx, cy + 5, K)
    for i, lx in enumerate((cx - 3, cx - 1, cx + 1, cx + 3)):
        draw_line(g, lx, cy + 2, lx, cy + 4, CRAB)

    if hairy:
        for claw_x in (cx - 7, cx + 7):
            for dy in range(-4, 3):
                px(g, claw_x, cy + dy, YETI_HAIR)
                px(g, claw_x - 1, cy + dy, YETI_HAIR2)

    if bacteria:
        for x, y in ((cx - 7, cy), (cx + 7, cy), (cx - 6, cy + 1)):
            px(g, x, y, BACTERIA)
            px(g, x, y + 1, BACTERIA2)

    px(g, cx - 1, cy - 2, WHITE)
    px(g, cx + 1, cy - 2, WHITE)


def draw_seahorse(g, cx=14, base_y=24):
    """해마 — S자 몸통, 주둥이, 꼬리 말림 (golden / pretty)."""
    snout = [(cx + 6, base_y - 14), (cx + 8, base_y - 13), (cx + 7, base_y - 12)]
    draw_poly(g, snout, SEAHORSE, K)
    draw_line(g, cx + 5, base_y - 13, cx + 3, base_y - 11, SEAHORSE2)
    draw_line(g, cx + 3, base_y - 11, cx + 2, base_y - 8, SEAHORSE)
    draw_line(g, cx + 2, base_y - 8, cx + 4, base_y - 5, SEAHORSE2)
    draw_line(g, cx + 4, base_y - 5, cx + 2, base_y - 2, SEAHORSE)
    draw_line(g, cx + 2, base_y - 2, cx + 5, base_y, SEAHORSE2)
    for x, y in ((cx + 3, base_y - 10), (cx + 3, base_y - 6), (cx + 3, base_y - 3)):
        px(g, x, y, SEAHORSE_FIN)
    for t in range(6):
        px(g, cx + 5 - t // 2, base_y + t // 2, SEAHORSE2)
    px(g, cx + 6, base_y - 14, K)
    draw_eye(g, cx + 4, base_y - 12, sclera=WHITE, pupil=K)


def draw_eel_long(g, x0=4, y0=16, length=24):
    """뱀처럼 긴 장어 — Thermarces cerberus."""
    for i in range(length):
        x = x0 + i
        wave = (i // 3) % 2
        y = y0 + wave
        w = 2 if i < 8 else (1 if i > length - 5 else 2)
        for dy in range(w):
            col = FISH_PINK if i < length * 0.7 else FISH_PINK2
            px(g, x, y + dy, col)
        if i % 5 == 0:
            px(g, x, y - 1, FISH_PINK2)

    hx, hy = x0, y0
    fill_ellipse(g, hx + 1, hy, 3, 3, FISH_PINK, K)
    for x in range(hx + 2, hx + 5):
        px(g, x, hy + 2, TOOTH)
        px(g, x, hy + 3, TOOTH)
    px(g, hx, hy + 1, K)
    px(g, hx - 1, hy + 1, K)
    tail_x = x0 + length - 1
    px(g, tail_x, y0 + wave, K)


def draw_fish_v1(g, cx=14, cy=17):
    """담수어 v1 — 어두운 zoarcid 실루엣."""
    fill_ellipse(g, cx, cy, 8, 5, FISH, K)
    fill_ellipse(g, cx, cy, 6, 4, FISH2)
    draw_poly(g, [(cx + 6, cy), (cx + 9, cy - 2), (cx + 9, cy + 2)], FISH2, K)
    draw_eye(g, cx - 3, cy - 1, sclera=WHITE, pupil=K, large=True)
    px(g, cx - 1, cy + 1, LAVA)


# ── 진화: 알 → 청년 새우 (열수구 공통 성장선) ─────────────────────────────
def draw_vent_egg(g, cx=16, cy=17):
    """열수 알 — 광물 알집 + 반투명 배아."""
    fill_ellipse(g, cx, cy + 3, 6, 2, ROCK2, K)
    for x in range(cx - 4, cx + 5):
        px(g, x, cy + 2, LAVA2)
    fill_ellipse(g, cx, cy, 5, 6, SHRIMP2, K)
    fill_ellipse(g, cx, cy, 4, 5, SHRIMP)
    for x, y in ((cx - 1, cy - 2), (cx + 1, cy - 1), (cx, cy + 1), (cx - 2, cy)):
        px(g, x, y, LAVA)
    px(g, cx, cy - 3, LAVA)
    for bx, by in ((cx - 6, cy - 4), (cx + 5, cy + 2), (cx + 6, cy - 1)):
        px(g, bx, by, (255, 200, 120, 180))
        px(g, bx, by + 1, (255, 160, 80, 140))


def draw_nauplius(g, cx=17, cy=18):
    """유충 — 3부지(Nauplius)형, 아직 측면 새우 아님."""
    fill_circle(g, cx, cy, 3, SHRIMP, K)
    fill_circle(g, cx, cy, 2, SHRIMP2)
    for dx, dy in ((3, -2), (3, 0), (3, 2)):
        draw_line(g, cx + 2, cy, cx + dx + 2, cy + dy, SHRIMP3)
        px(g, cx + dx + 2, cy + dy, K)
    draw_line(g, cx + 2, cy - 1, cx + 5, cy - 3, SHRIMP2)
    draw_line(g, cx + 2, cy + 1, cx + 5, cy + 3, SHRIMP2)
    px(g, cx + 1, cy, K)


def draw_mysis(g, head_x=21, body_y=18):
    """새우치 — 메이시스: 짧은 측면·등 살짝 굽음·다리 2쌍."""
    draw_shrimp_side(
        g,
        head_x=head_x,
        body_y=body_y,
        length=8,
        hump=1,
        small=True,
        leg_pairs=[2, 5],
    )


def draw_teen_shrimp(g):
    """청년 새우 — 성체 직전: 굽은 등·다리 4쌍·eyespot 막 형성."""
    draw_shrimp_side(
        g,
        head_x=23,
        body_y=17,
        length=11,
        hump=3,
        eyespot=True,
        bacteria=True,
        leg_pairs=[2, 4, 6, 8],
    )
    pts = shrimp_body_curve(23, 17, 11, 3)
    ex, ey = pts[len(pts) // 2]
    fill_ellipse(g, ex, ey - 3, 1, 1, EYESPOT2)


def sprite_egg():
    g = blank()
    draw_vent_egg(g)
    vent_chimney(g, base=28)
    return g


def sprite_baby():
    g = blank()
    draw_nauplius(g)
    vent_chimney(g)
    return g


def sprite_child():
    g = blank()
    draw_mysis(g)
    vent_chimney(g)
    return g


def sprite_teen():
    g = blank()
    draw_teen_shrimp(g)
    vent_chimney(g)
    return g


def sprite_dead():
    g = blank()
    pts = shrimp_body_curve(20, 19, 9, 2)
    for x, y in pts:
        px(g, x, y, ROCK2)
    draw_line(g, 12, 14, 20, 22, ROCK2)
    return g


# ── 성체 9종 ───────────────────────────────────────────────────────────
def sprite_golden():
    """pretty — 열수 해마."""
    g = blank()
    draw_seahorse(g)
    vent_chimney(g)
    return g


def sprite_fluffy():
    """pretty — Rimicaris 측면 새우."""
    g = blank()
    draw_shrimp_side(g, eyespot=True, bacteria=True, hump=3)
    vent_chimney(g)
    return g


def sprite_sparkle():
    """pretty — Kiwa 예티 게."""
    g = blank()
    draw_crab(g, 16, 17, hairy=True, claw_r=3)
    vent_chimney(g)
    return g


def sprite_standard():
    """normal — 담수어 v1."""
    g = blank()
    draw_fish_v1(g)
    vent_chimney(g)
    return g


def sprite_farm():
    """normal — 벤트 게."""
    g = blank()
    draw_crab(g, 16, 17, bacteria=True, claw_r=3)
    vent_chimney(g)
    return g


def sprite_plain():
    """normal — 작은 측면 새우."""
    g = blank()
    draw_shrimp_side(g, head_x=19, body_y=19, length=8, hump=2, small=True)
    vent_chimney(g)
    return g


def sprite_scruffy():
    """defective — 녹슨/낡은 새우."""
    g = blank()
    draw_shrimp_side(g, head_x=22, body_y=18, length=10, hump=2, rust=True)
    vent_chimney(g)
    return g


def sprite_grumpy():
    """defective — 긴 분홍 장어."""
    g = blank()
    draw_eel_long(g, x0=3, y0=15, length=26)
    vent_chimney(g)
    return g


def sprite_sickly():
    """defective — 기생 새우."""
    g = blank()
    draw_shrimp_side(g, head_x=22, body_y=18, length=10, hump=2, sick=True)
    vent_chimney(g)
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
}

SPECIES = {
    "evolution/egg": ("열수 알", "egg", "광물 알집·반투명 배아·열수 기포"),
    "evolution/baby": ("유충", "nauplius", "둥근 3부지·더듬이만·다리 없음"),
    "evolution/child": ("새우치", "mysis", "측면 등 살짝 굽음·다리 2쌍"),
    "evolution/teen": ("청년 새우", "juvenile", "굽은 등·다리 4쌍·eyespot 막 형성"),
    "evolution/dead": ("퇴적", "—", "쓰러진 새우 실루엣"),
    "adult/golden": ("열수 해마", "seahorse (vent)", "S자 몸·주둥이·꼬리 말림"),
    "adult/fluffy": ("눈없는 새우", "Rimicaris exoculata", "측면·굽은 등·등 eyespot·다리"),
    "adult/sparkle": ("예티 게", "Kiwa hirsuta", "큰 집게·작은 다리 8·setae"),
    "adult/standard": ("담수어", "zoarcid", "v1 어두운 어류 실루엣"),
    "adult/farm": ("벤트 게", "Bythograea thermydron", "큰 집게·작은 다리·박테리아"),
    "adult/plain": ("황 새우", "vent shrimp", "작은 측면·굽은 등·다리"),
    "adult/scruffy": ("녹슨 새우", "stressed shrimp", "측면·녹슨 얼룩·다리"),
    "adult/grumpy": ("분홍 장어", "Thermarces cerberus", "뱀형 긴 몸·갈고리 이빨"),
    "adult/sickly": ("기생 새우", "parasitized shrimp", "측면·기생 반점"),
}

LABELS = {k: v[0] for k, v in SPECIES.items()}


def build_sheet(out_dir: Path) -> Path:
    cols = 7
    cell = 128
    pad = 10
    names = list(SPRITES.keys())
    rows = (len(names) + cols - 1) // cols
    title_h = 28
    w = cols * (cell + pad) + pad
    h = title_h + rows * (cell + pad + 36) + pad
    sheet = Image.new("RGBA", (w, h), (14, 10, 12, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    draw.text((pad, 8), "Vent v3 — no tube worms | shrimp seahorse crab eel", fill=(255, 140, 60), font=font)
    for i, rel in enumerate(names):
        col, row = i % cols, i // cols
        x = pad + col * (cell + pad)
        y = title_h + pad + row * (cell + pad + 36)
        img = Image.open(out_dir / f"{rel}.png").resize((cell, cell), Image.NEAREST)
        sheet.paste(img, (x, y), img)
        draw.text((x, y + cell + 2), LABELS[rel], fill=(255, 200, 140), font=font)
        draw.text((x, y + cell + 14), SPECIES[rel][2][:24], fill=(140, 160, 170), font=font)
    path = out_dir.parent / "_sheet.png"
    sheet.save(path, "PNG")
    return path


def build_evolution_sheet(out_dir: Path) -> Path:
    """알 → 청년 새우 진화 전용 시안."""
    stages = [
        ("evolution/egg", "0일 · 열수 알"),
        ("evolution/baby", "유충"),
        ("evolution/child", "새우치"),
        ("evolution/teen", "청년 새우"),
    ]
    cell = 140
    pad = 16
    arrow_w = 28
    label_h = 40
    w = len(stages) * cell + (len(stages) - 1) * arrow_w + pad * 2
    h = 36 + cell + label_h + pad
    sheet = Image.new("RGBA", (w, h), (14, 10, 12, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    draw.text((pad, 8), "Vent evolution — egg to teen (staging)", fill=(255, 140, 60), font=font)
    x = pad
    y = 36
    for i, (rel, stage_label) in enumerate(stages):
        img = Image.open(out_dir / f"{rel}.png").resize((cell, cell), Image.NEAREST)
        sheet.paste(img, (x, y), img)
        ko = SPECIES[rel][0]
        feat = SPECIES[rel][2]
        draw.text((x, y + cell + 4), stage_label, fill=(255, 200, 140), font=font)
        draw.text((x, y + cell + 16), feat[:22], fill=(140, 160, 170), font=font)
        if i < len(stages) - 1:
            ax = x + cell + 6
            ay = y + cell // 2
            draw.text((ax, ay - 4), "→", fill=(255, 120, 60), font=font)
        x += cell + arrow_w
    path = out_dir.parent / "_evolution-sheet.png"
    sheet.save(path, "PNG")
    return path


def build_reference_sketches(out_dir: Path) -> Path:
    adults = [f"adult/{v}" for v in (
        "golden", "fluffy", "sparkle", "standard", "farm", "plain", "scruffy", "grumpy", "sickly",
    )]
    cell = 96
    pad = 12
    label_h = 48
    cols = 3
    rows = 3
    w = cols * (cell + pad) + pad
    h = 32 + rows * (cell + label_h + pad) + pad
    sheet = Image.new("RGBA", (w, h), (20, 14, 16, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    draw.text((pad, 8), "v3 — shrimp side-view | big claws + legs | long eel", fill=(255, 160, 80), font=font)
    for i, rel in enumerate(adults):
        col, row = i % cols, i // cols
        x = pad + col * (cell + pad)
        y = 32 + row * (cell + label_h + pad)
        draw.rectangle((x - 1, y - 1, x + cell, y + cell), outline=(80, 60, 68, 255))
        img = Image.open(out_dir / f"{rel}.png").resize((cell, cell), Image.NEAREST)
        sheet.paste(img, (x, y), img)
        ko, _, feat = SPECIES[rel]
        draw.text((x, y + cell + 4), ko, fill=(255, 220, 180), font=font)
        draw.text((x, y + cell + 18), feat[:26], fill=(150, 140, 135), font=font)
    path = out_dir.parent / "_reference-sketches.png"
    sheet.save(path, "PNG")
    return path


def export_species_json(out_dir: Path):
    import json

    data = {
        rel: {"labelKo": ko, "note": sci, "anatomy": feat, "variantId": rel.split("/")[-1]}
        for rel, (ko, sci, feat) in SPECIES.items()
    }
    path = out_dir.parent / "species.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for rel, fn in SPRITES.items():
        save_grid(fn(), OUT_DIR / f"{rel}.png")
    sheet = build_sheet(OUT_DIR)
    evo_sheet = build_evolution_sheet(OUT_DIR)
    sketches = build_reference_sketches(OUT_DIR)
    species_json = export_species_json(OUT_DIR)
    print(f"Generated {len(SPRITES)} vent v3 sprites -> {OUT_DIR}")
    print(f"Sheet -> {sheet}")
    print(f"Evolution sheet -> {evo_sheet}")
    print(f"Sketches -> {sketches}")
    print(f"JSON -> {species_json}")


if __name__ == "__main__":
    main()
