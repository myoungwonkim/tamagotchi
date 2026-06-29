#!/usr/bin/env python3
"""심해인어 측면 v2 — 상체·허리·아래 꼬리. --install 시 게임 assets에 반영."""

from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageFont

from generate_all_sprites import (
    BLOB,
    BLOB2,
    BONE_SHOW,
    COPPER,
    COPPER2,
    GLOW,
    GLOW2,
    GOLD_LIGHT,
    JELLY,
    JELLY2,
    JELLY3,
    JELLY4,
    K,
    LARVA,
    LARVA2,
    LESION,
    MUCUS,
    MUD,
    MUD2,
    PALE,
    PALE2,
    PARASITE,
    RAG,
    RAG2,
    RED,
    REEF,
    REEF2,
    ROT,
    SLIME,
    SLIME2,
    SPARK,
    SPARK2,
    SPARK3,
    TEEN,
    TEEN2,
    WHITE,
    blank,
    draw_empty_socket,
    draw_eye,
    draw_line,
    draw_poly,
    fill_circle,
    fill_ellipse,
    px,
    save_grid,
)
from generate_mermaid_preview import (
    CLAM,
    CLAM2,
    HAIR_CORAL,
    HAIR_COSMIC,
    HAIR_MOON,
    HAIR_MOON2,
    HAIR_MUD,
    HAIR_SEAWEED,
    KO_LABELS,
    PEARL,
    PEARL2,
    PEARL_DOT,
    SCALES_GOLD,
    SCALES_STAR,
    SKIN,
    SKIN2,
    TAIL_A,
    TAIL_B,
    TAIL_C,
    TAIL_D,
    grid_to_image,
    sprite_mood_happy,
    sprite_mood_neutral,
    sprite_mood_sad,
    sprite_mood_sick,
    sprite_mood_sleep,
)

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "mermaid-side-preview"
GAME = ROOT / "assets" / "sprites" / "mermaid"

PET_SPRITES = [
    "evolution/egg", "evolution/baby", "evolution/child", "evolution/teen", "evolution/dead",
    "adult/golden", "adult/fluffy", "adult/sparkle", "adult/standard", "adult/farm",
    "adult/plain", "adult/scruffy", "adult/grumpy", "adult/sickly",
]
MOOD_SPRITES = ["mood/happy", "mood/neutral", "mood/sad", "mood/sleep", "mood/sick"]


def draw_hair_long(g, hx, hy, c1, c2, length=12):
    """등 뒤로 흘러내리는 긴 머리."""
    for i in range(length):
        y = hy + i
        x = hx - 4 - (i // 4)
        px(g, x, y, c1 if i % 2 else c2)
        if i > 2:
            px(g, x - 1, y, c2)


def draw_hair_short(g, hx, hy, c1, c2):
    draw_poly(g, [(hx - 4, hy), (hx - 2, hy - 2), (hx, hy)], c1, K)
    px(g, hx - 3, hy + 1, c2)


def draw_hair_veil(g, hx, hy, c1, c2):
    draw_poly(g, [(hx - 5, hy + 2), (hx - 3, hy - 3), (hx, hy)], c1, K)
    for x0, y0, x1, y1 in ((hx - 4, hy + 3, hx - 6, hy + 10), (hx - 3, hy + 4, hx - 4, hy + 12)):
        draw_line(g, x0, y0, x1, y1, c2)


def draw_hair_messy(g, hx, hy, c1, c2):
    draw_line(g, hx - 4, hy, hx - 6, hy - 2, c2)
    draw_line(g, hx - 3, hy + 1, hx - 5, hy + 4, c1)
    px(g, hx - 2, hy - 1, c2)


def draw_profile_face(g, hx, hy, skin, skin2, *, eye=True, fang=False, tired=False):
    """오른쪽 프로필 — 인간형 얼굴."""
    draw_poly(
        g,
        [(hx - 4, hy + 2), (hx - 5, hy + 6), (hx - 2, hy + 8), (hx + 3, hy + 7), (hx + 4, hy + 4), (hx + 2, hy + 1), (hx - 3, hy)],
        skin,
        K,
    )
    px(g, hx + 3, hy + 6, skin2)
    px(g, hx + 2, hy + 7, K if not fang else WHITE)
    if fang:
        px(g, hx + 3, hy + 7, WHITE)
    if not eye:
        draw_line(g, hx + 1, hy + 3, hx + 4, hy + 4, K)
    elif tired:
        draw_line(g, hx + 1, hy + 4, hx + 4, hy + 3, K)
        px(g, hx + 2, hy + 4, WHITE)
    else:
        draw_eye(g, hx + 1, hy + 3)


def draw_upper_body(g, hx, hy, skin, skin2, *, arm=True):
    """목·가슴·허리 — 얼굴과 이어지는 넓은 상체."""
    top = hy + 8
    for y in range(top, top + 5):
        w = 4 if y < top + 3 else 3
        for dx in range(w):
            px(g, hx - 2 + dx, y, skin if dx < 2 else skin2)
    if arm:
        draw_line(g, hx + 2, top + 1, hx + 4, top + 3, skin)
        px(g, hx + 4, top + 3, skin2)


def draw_tail_down(g, wx, wy, seg_len, tail, tail2, fin, *, bend=3):
    """가는 꼬리 — 아래·오른쪽 대각선으로 약하게 휨."""
    pts = []
    for i in range(seg_len):
        t = i / max(seg_len - 1, 1)
        y = wy + i
        cx = wx + int(bend * t * t + bend * 0.35 * math.sin(t * math.pi))
        pts.append((cx, y))

    for i, (cx, y) in enumerate(pts):
        t = i / max(seg_len - 1, 1)
        col = tail if t < 0.5 else tail2
        px(g, cx, y, col)
        if t < 0.18:
            px(g, cx - 1, y, tail2 if t < 0.5 else tail)
        elif t < 0.32 and i % 2 == 0:
            px(g, cx + 1, y, tail2 if t < 0.5 else tail)

    tip_x, tip_y = pts[-1]
    if tip_y < 31:
        draw_poly(g, [(tip_x, tip_y), (tip_x + 2, tip_y - 1), (tip_x + 1, tip_y + 1)], fin, K)
        draw_poly(g, [(tip_x, tip_y), (tip_x + 5, tip_y + 2), (tip_x + 2, tip_y + 1)], fin, K)


def draw_mermaid_v2(
    g,
    *,
    hx=11,
    hy=5,
    skin=SKIN,
    skin2=SKIN2,
    tail=TAIL_A,
    tail2=TAIL_B,
    fin=TAIL_C,
    tail_seg=9,
    hair=None,
    eye=True,
    fang=False,
    tired=False,
    arm=True,
    extras=None,
):
    if hair:
        hair(g, hx, hy)
    waist_y = hy + 13
    draw_tail_down(g, hx - 1, waist_y, tail_seg, tail, tail2, fin)
    draw_upper_body(g, hx, hy, skin, skin2, arm=arm)
    draw_profile_face(g, hx, hy, skin, skin2, eye=eye, fang=fang, tired=tired)
    if extras:
        extras(g, hx, hy)


# ── Evolution ─────────────────────────────────────────────────────────
def sprite_egg():
    g = blank()
    draw_poly(g, [(8, 20), (16, 26), (24, 20)], CLAM2, K)
    draw_poly(g, [(9, 19), (16, 24), (23, 19)], CLAM, K)
    fill_circle(g, 16, 17, 5, PEARL, K)
    fill_circle(g, 15, 18, 3, PEARL2)
    px(g, 13, 15, PEARL_DOT)
    px(g, 18, 16, WHITE)
    return g


def sprite_baby():
    g = blank()
    fill_circle(g, 12, 12, 5, SKIN, K)
    fill_ellipse(g, 12, 13, 4, 4, SKIN2)
    draw_eye(g, 13, 10)
    px(g, 15, 12, SKIN2)
    draw_poly(g, [(12, 18), (13, 19), (14, 21), (12, 21)], LARVA2, K)
    px(g, 12, 20, TAIL_B)
    return g


def sprite_child():
    g = blank()
    draw_mermaid_v2(
        g, hx=11, hy=5, tail_seg=6,
        hair=lambda gr, x, y: draw_hair_short(gr, x, y, HAIR_CORAL, COPPER2),
    )
    return g


def sprite_teen():
    g = blank()
    draw_mermaid_v2(
        g, hx=11, hy=4, tail_seg=11, tail=TAIL_C, tail2=TAIL_D, fin=TEEN2,
        hair=lambda gr, x, y: draw_hair_long(gr, x, y, TEEN, TEEN2, length=11),
    )
    return g


def sprite_dead():
    g = blank()
    BONE = (245, 245, 235, 255)
    GHOST = (187, 222, 251, 200)
    draw_poly(g, [(8, 10), (8, 16), (12, 17), (14, 14), (13, 9), (10, 8)], GHOST, K)
    px(g, 11, 11, K)
    draw_line(g, 11, 16, 12, 22, BONE)
    draw_line(g, 12, 22, 16, 24, BONE)
    draw_poly(g, [(16, 24), (20, 23), (20, 25)], BONE, K)
    return g


# ── Adults ────────────────────────────────────────────────────────────
def sprite_golden():
    g = blank()

    def extras(gr, hx, hy):
        for x, y in ((hx - 2, hy - 3), (hx, hy - 4), (hx + 1, hy - 3)):
            px(gr, x, y, SCALES_GOLD)

    draw_mermaid_v2(
        g, hx=11, hy=5, skin=GOLD_LIGHT, skin2=GLOW,
        tail=GLOW2, tail2=GLOW, fin=SCALES_GOLD, tail_seg=10,
        hair=lambda gr, x, y: draw_hair_long(gr, x, y, GLOW2, GLOW, length=10),
        extras=extras,
    )
    return g


def sprite_fluffy():
    g = blank()
    draw_mermaid_v2(
        g, hx=11, hy=5, skin=JELLY4, skin2=JELLY3,
        tail=JELLY2, tail2=JELLY, fin=HAIR_MOON, tail_seg=9,
        hair=lambda gr, x, y: draw_hair_veil(gr, x, y, HAIR_MOON, HAIR_MOON2),
    )
    return g


def sprite_sparkle():
    g = blank()

    def extras(gr, hx, hy):
        for x, y in ((4, 8), (26, 10), (5, 22)):
            px(gr, x, y, SCALES_STAR)

    draw_mermaid_v2(
        g, hx=11, hy=5, skin=SPARK3, skin2=(220, 210, 255, 255),
        tail=SPARK2, tail2=HAIR_COSMIC, fin=SPARK, tail_seg=10,
        hair=lambda gr, x, y: draw_hair_long(gr, x, y, HAIR_COSMIC, SPARK2, length=10),
        extras=extras,
    )
    return g


def sprite_standard():
    g = blank()
    draw_mermaid_v2(
        g, hx=11, hy=5, tail=COPPER, tail2=COPPER2, fin=REEF, tail_seg=9,
        hair=lambda gr, x, y: draw_hair_long(gr, x, y, HAIR_CORAL, COPPER2, length=8),
    )
    return g


def sprite_farm():
    g = blank()
    draw_mermaid_v2(
        g, hx=11, hy=5, tail=REEF, tail2=REEF2, fin=HAIR_SEAWEED, tail_seg=8,
        hair=lambda gr, x, y: draw_hair_short(gr, x, y, REEF, REEF2),
        extras=lambda gr, hx, hy: px(gr, hx - 5, hy + 2, HAIR_SEAWEED),
    )
    return g


def sprite_plain():
    g = blank()
    draw_mermaid_v2(
        g, hx=11, hy=5, skin=MUD, skin2=MUD2, tail=MUD, tail2=MUD2,
        fin=(84, 110, 122, 255), tail_seg=7,
        hair=lambda gr, x, y: draw_hair_short(gr, x, y, HAIR_MUD, MUD2),
    )
    return g


def sprite_scruffy():
    g = blank()
    draw_mermaid_v2(
        g, hx=11, hy=5, skin=RAG, skin2=RAG2, tail=RAG2, tail2=ROT, fin=SLIME2, tail_seg=8,
        hair=lambda gr, x, y: draw_hair_messy(gr, x, y, RAG, ROT),
        eye=False,
        extras=lambda gr, hx, hy: (px(gr, hx + 2, hy + 8, BONE_SHOW), px(gr, 12, 22, SLIME)),
    )
    return g


def sprite_grumpy():
    g = blank()
    draw_mermaid_v2(
        g, hx=11, hy=5, skin=BLOB2, skin2=BLOB, tail=BLOB2, tail2=BLOB, fin=RED, tail_seg=8,
        hair=lambda gr, x, y: draw_hair_messy(gr, x, y, BLOB2, BLOB),
        fang=True,
        extras=lambda gr, hx, hy: px(gr, hx + 2, hy + 2, RED),
    )
    return g


def sprite_sickly():
    g = blank()
    draw_mermaid_v2(
        g, hx=11, hy=5, skin=PALE, skin2=PALE2, tail=PALE2, tail2=PALE, fin=SLIME2, tail_seg=8,
        hair=lambda gr, x, y: draw_hair_messy(gr, x, y, PALE2, PALE),
        tired=True,
        extras=lambda gr, hx, hy: (
            px(gr, hx + 3, hy + 8, LESION),
            draw_line(gr, hx - 5, hy + 10, hx - 7, hy + 12, PARASITE),
        ),
    )
    return g


SIDE_SPRITES = {
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
}


def build_evolution_sheet(out_path: Path):
    stages = ["evolution/egg", "evolution/baby", "evolution/child", "evolution/teen"]
    cell, pad, arrow = 96, 14, 24
    w = len(stages) * cell + (len(stages) - 1) * arrow + pad * 2
    h = 40 + cell + 36
    sheet = Image.new("RGBA", (w, h), (12, 20, 38, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    draw.text((pad, 8), "Mermaid side v2 — slender diagonal tail", fill=(0, 229, 255), font=font)
    x = pad
    y = 36
    for i, rel in enumerate(stages):
        img = grid_to_image(SIDE_SPRITES[rel]()).resize((cell, cell), Image.NEAREST)
        sheet.paste(img, (x, y), img)
        ko, _ = KO_LABELS[rel]
        draw.text((x, y + cell + 4), ko, fill=(255, 183, 160), font=font)
        if i < len(stages) - 1:
            draw.text((x + cell + 8, y + cell // 2 - 4), "→", fill=(144, 202, 249), font=font)
        x += cell + arrow
    sheet.save(out_path, "PNG")
    return out_path


def build_compare_sheet(out_path: Path):
    cell, pad = 80, 10
    label_h = 22
    cols = 2
    w = pad + cols * (cell * 2 + 12) + pad
    h = pad + 28 + ((len(PET_SPRITES) + 1) // 2) * (cell + label_h + 8) + pad
    sheet = Image.new("RGBA", (w, h), (12, 20, 38, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    draw.text((pad, 8), "Side v2 draft vs current game mermaid", fill=(0, 229, 255), font=font)
    y = pad + 28
    for i, rel in enumerate(PET_SPRITES):
        col = i % cols
        row = i // cols
        x = pad + col * (cell * 2 + 12)
        yy = y + row * (cell + label_h + 8)
        side = grid_to_image(SIDE_SPRITES[rel]()).resize((cell, cell), Image.NEAREST)
        sheet.paste(side, (x, yy), side)
        game_path = GAME / f"{rel}.png"
        if game_path.exists():
            cur = Image.open(game_path).convert("RGBA").resize((cell, cell), Image.NEAREST)
            sheet.paste(cur, (x + cell + 12, yy), cur)
        ko, _ = KO_LABELS[rel]
        draw.text((x, yy + cell + 2), f"v2 · {ko}", fill=(255, 183, 160), font=font)
        draw.text((x + cell + 12, yy + cell + 2), "현재", fill=(128, 203, 196), font=font)
    sheet.save(out_path, "PNG")
    return out_path


def build_html():
    def cards(keys, *, show_current=True):
        out = []
        for rel in keys:
            ko, sub = KO_LABELS[rel]
            cur_col = ""
            if show_current:
                cur_col = f'<div class="col"><img src="../../assets/sprites/mermaid/{rel.split("/", 1)[1]}.png" alt=""><span>현재 게임</span></div>'
            out.append(f"""
      <figure class="pair">
        <div class="pair-row">
          <div class="col"><img src="sprites/{rel}.png" alt=""><span>측면 v2</span></div>
          {cur_col}
        </div>
        <figcaption><strong>{ko}</strong><br><span class="sub">{sub}</span></figcaption>
      </figure>""")
        return "\n".join(out)

    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0c1426">
  <title>심해인어 측면 시안 v2</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
      background: #0c1426; color: #c8d4dc; padding: 20px 14px 48px; line-height: 1.5;
    }}
    .wrap {{ max-width: 720px; margin: 0 auto; }}
    h1 {{ font-size: 1.0625rem; color: #80deea; margin-bottom: 6px; }}
    .lead {{ font-size: 0.75rem; color: #7a8898; margin-bottom: 14px; }}
    .notice {{
      background: #1a2838; border: 1px solid #3a5060; border-radius: 8px;
      padding: 12px 14px; font-size: 0.6875rem; color: #98a8b8; margin-bottom: 18px;
    }}
    .notice strong {{ color: #58b8c8; }}
  .notice a {{ color: #80deea; }}
    .sheet {{ width: 100%; border: 1px solid #2a3848; border-radius: 8px; margin-bottom: 18px; image-rendering: pixelated; }}
    h2 {{
      font-size: 0.8125rem; color: #58b8c8; margin: 22px 0 10px;
      border-bottom: 1px solid #2a3848; padding-bottom: 6px;
    }}
    .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }}
    .pair {{ background: #1a2838; border: 1px solid #3a5060; border-radius: 10px; padding: 10px 8px; }}
    .pair-row {{ display: flex; gap: 8px; justify-content: center; margin-bottom: 6px; }}
    .col {{ text-align: center; }}
    .col img {{
      width: 80px; height: 80px; image-rendering: pixelated;
      background: #243040; border-radius: 6px; display: block; margin: 0 auto 4px;
    }}
    .col span {{ font-size: 0.5625rem; color: #6a7888; }}
    figcaption {{ font-size: 0.625rem; text-align: center; color: #88a0b0; line-height: 1.4; }}
    figcaption strong {{ color: #d8e4ec; }}
    .sub {{ color: #6a7888; }}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>심해인어 · 측면 시안 v2</h1>
    <p class="lead">32×32 픽셀 · 상체+허리+아래 꼬리 · <strong>게임 반영됨</strong></p>
    <div class="notice">
      <strong>v2</strong> — <a href="../mermaid-side-sketch-preview.html">손그림 스케치</a>와 동일. 날씬한 꼬리가 <strong>↘ 대각선으로 약하게 휨</strong>.
    </div>
    <img class="sheet" src="_evolution-sheet.png" alt="진화">
    <img class="sheet" src="_compare-sheet.png" alt="비교">
    <h2>진화</h2>
    <div class="grid">{cards(PET_SPRITES[:5])}</div>
    <h2>성체 · pretty</h2>
    <div class="grid">{cards(PET_SPRITES[5:8])}</div>
    <h2>성체 · normal</h2>
    <div class="grid">{cards(PET_SPRITES[8:11])}</div>
    <h2>성체 · defective</h2>
    <div class="grid">{cards(PET_SPRITES[11:14])}</div>
    <h2>기분 버블</h2>
    <div class="grid">{cards(MOOD_SPRITES, show_current=False)}</div>
    <p style="text-align:center;margin-top:20px;font-size:0.625rem;color:#6a7888">
      <code>python3 scripts/generate_mermaid_side_preview.py</code>
    </p>
  </div>
</body>
</html>"""


def main():
    import sys

    install = "--install" in sys.argv
    targets = [GAME] if install else [OUT / "sprites"]
    if not install:
        targets[0].mkdir(parents=True, exist_ok=True)

    for rel, fn in SIDE_SPRITES.items():
        for base in targets:
            path = base / f"{rel}.png"
            path.parent.mkdir(parents=True, exist_ok=True)
            save_grid(fn(), path)

    if install:
        print(f"Installed {len(SIDE_SPRITES)} mermaid side v2 sprites -> {GAME}")
        return

    build_evolution_sheet(OUT / "_evolution-sheet.png")
    build_compare_sheet(OUT / "_compare-sheet.png")
    (OUT / "index.html").write_text(build_html(), encoding="utf-8")
    print(f"Generated {len(SIDE_SPRITES)} mermaid side v2 sprites -> {OUT / 'sprites'}")
    print(f"Preview -> {OUT / 'index.html'}")


if __name__ == "__main__":
    main()
