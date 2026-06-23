#!/usr/bin/env python3
"""Stage simplified poop/fly sprite proposals — preview only."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from generate_all_sprites import (
    K,
    OUT,
    SIZE,
    WHITE,
    blank,
    draw_line,
    draw_poly,
    fill_circle,
    fill_ellipse,
    px,
    sprite_fly,
    sprite_poop,
)

ROOT = Path(__file__).resolve().parent.parent
STAGING = ROOT / ".sprite-staging-mess"

INK = K


def grid_to_image(g):
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    pxmap = img.load()
    for y in range(SIZE):
        for x in range(SIZE):
            pxmap[x, y] = g[y][x]
    return img.resize((OUT, OUT), Image.NEAREST)


def save_icon(g, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    grid_to_image(g).save(path, "PNG")


# --- Poop variants ---


def sprite_poop_a():
    """A — single mound."""
    g = blank()
    POOP = (141, 110, 99, 255)
    POOP2 = (109, 76, 65, 255)
    fill_ellipse(g, 16, 18, 7, 5, POOP, K)
    fill_ellipse(g, 15, 19, 4, 3, POOP2)
    px(g, 13, 16, WHITE)
    return g


def sprite_poop_b():
    """B — two-block stack."""
    g = blank()
    POOP = (141, 110, 99, 255)
    POOP2 = (109, 76, 65, 255)
    draw_poly(g, [(9, 20), (23, 20), (22, 26), (10, 26)], POOP, K)
    draw_poly(g, [(12, 14), (20, 14), (19, 20), (13, 20)], POOP2, K)
    px(g, 14, 15, (161, 136, 127, 255))
    return g


def sprite_poop_c():
    """C — comic spiral coil."""
    g = blank()
    POOP = (141, 110, 99, 255)
    POOP2 = (109, 76, 65, 255)
    coil = [
        (14, 24), (15, 24), (16, 24), (17, 24), (18, 23),
        (19, 22), (19, 21), (19, 20), (18, 19), (17, 18),
        (16, 17), (15, 16), (14, 15), (13, 14), (12, 13),
        (12, 12), (13, 11), (14, 11), (15, 12),
    ]
    for x, y in coil:
        px(g, x, y, POOP)
    for x, y in coil[3:10]:
        px(g, x, y, POOP2)
    for x, y in ((11, 11), (16, 11), (18, 20), (13, 23)):
        px(g, x, y, K)
    px(g, 15, 12, WHITE)
    return g


def sprite_poop_d():
    """D — dot cluster."""
    g = blank()
    POOP = (141, 110, 99, 255)
    POOP2 = (109, 76, 65, 255)
    dots = (
        (15, 13), (16, 13), (17, 14), (18, 15), (17, 16),
        (16, 17), (15, 18), (14, 17), (13, 16), (13, 15), (14, 14),
    )
    for x, y in dots:
        px(g, x, y, POOP)
    for x, y in ((16, 15), (15, 16), (16, 16)):
        px(g, x, y, POOP2)
    for x, y in ((13, 13), (18, 14), (14, 18), (17, 17)):
        px(g, x, y, K)
    return g


# --- Fly variants ---


def sprite_fly_a():
    """A — X wings."""
    g = blank()
    WING = (144, 202, 249, 255)
    BODY = (69, 90, 100, 255)
    draw_line(g, 8, 14, 15, 17, WING)
    draw_line(g, 8, 18, 15, 17, WING)
    draw_line(g, 24, 14, 17, 17, WING)
    draw_line(g, 24, 18, 17, 17, WING)
    px(g, 9, 15, K)
    px(g, 23, 15, K)
    fill_ellipse(g, 16, 17, 2, 3, BODY, K)
    px(g, 16, 16, WHITE)
    return g


def sprite_fly_b():
    """B — side silhouette."""
    g = blank()
    WING = (144, 202, 249, 255)
    WING2 = (100, 181, 246, 255)
    BODY = (69, 90, 100, 255)
    draw_poly(g, [(7, 15), (14, 11), (15, 17)], WING, K)
    draw_poly(g, [(25, 15), (18, 11), (17, 17)], WING, K)
    px(g, 10, 13, WING2)
    px(g, 22, 13, WING2)
    fill_ellipse(g, 16, 17, 3, 4, BODY, K)
    return g


def sprite_fly_c():
    """C — dot body + wing lines."""
    g = blank()
    WING = (144, 202, 249, 255)
    BODY = (69, 90, 100, 255)
    draw_line(g, 9, 15, 14, 17, WING)
    draw_line(g, 23, 15, 18, 17, WING)
    px(g, 16, 17, BODY)
    px(g, 15, 16, WHITE)
    px(g, 17, 16, WHITE)
    px(g, 16, 18, K)
    return g


def sprite_fly_d():
    """D — buzz mark."""
    g = blank()
    WING = (144, 202, 249, 255)
    BODY = (109, 76, 65, 255)
    draw_line(g, 8, 14, 12, 16, WING)
    draw_line(g, 8, 18, 12, 16, WING)
    draw_line(g, 24, 14, 20, 16, WING)
    draw_line(g, 24, 18, 20, 16, WING)
    px(g, 16, 16, BODY)
    px(g, 15, 16, K)
    px(g, 17, 16, K)
    return g


POOP_VARIANTS = [
    ("current", "현재", sprite_poop),
    ("a", "A · 한 덩어리", sprite_poop_a),
    ("b", "B · 2단 블록", sprite_poop_b),
    ("c", "C · 소용돌이", sprite_poop_c),
    ("d", "D · 점무리", sprite_poop_d),
]

FLY_VARIANTS = [
    ("current", "현재", sprite_fly),
    ("a", "A · X 날개", sprite_fly_a),
    ("b", "B · 실루엣", sprite_fly_b),
    ("c", "C · 점+날개", sprite_fly_c),
    ("d", "D · 버즈", sprite_fly_d),
]

COMBOS = [
    ("combo-1", "조합 1 · 균형", "b", "a", "B 배변물 + A 파리"),
    ("combo-2", "조합 2 · 귀여움", "c", "d", "C 배변물 + D 파리"),
    ("combo-3", "조합 3 · 최소", "a", "c", "A 배변물 + C 파리"),
]

POOP_BY_KEY = {key: fn for key, _label, fn in POOP_VARIANTS}
FLY_BY_KEY = {key: fn for key, _label, fn in FLY_VARIANTS}


def build_full_sheet(out_path: Path):
    cell, pad = 88, 14
    poop_n, fly_n = len(POOP_VARIANTS), len(FLY_VARIANTS)
    combo_n = len(COMBOS)
    cols = max(poop_n, fly_n, combo_n)
    title_h, row_title_h, label_h = 32, 22, 16
    row_h = cell + label_h + 8
    w = cols * (cell + pad) + pad
    h = pad + title_h + (row_h + row_title_h) * 3 + pad
    sheet = Image.new("RGBA", (w, h), (254, 246, 228, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()

    draw.text((pad, 10), "Mess sprites — simplified proposals (staging only)", fill=INK, font=font)

    def draw_section(y0, section_title, items):
        draw.text((pad, y0), section_title, fill=(109, 76, 65, 255), font=font)
        y = y0 + row_title_h
        for i, (key, label, fn) in enumerate(items):
            x = pad + i * (cell + pad)
            img = grid_to_image(fn())
            img = img.resize((cell, cell), Image.NEAREST)
            frame = Image.new("RGBA", (cell + 4, cell + 4), (255, 255, 255, 255))
            frame_draw = ImageDraw.Draw(frame)
            frame_draw.rectangle((0, 0, cell + 3, cell + 3), outline=INK, width=2)
            sheet.paste(img, (x + 2, y + 2), img)
            draw.text((x, y + cell + 6), label, fill=INK, font=font)
        return y + row_h

    y = pad + title_h
    y = draw_section(y, "배변물 (poop)", POOP_VARIANTS)
    y = draw_section(y, "파리 (fly)", FLY_VARIANTS)

    draw.text((pad, y), "추천 조합", fill=(109, 76, 65, 255), font=font)
    y += row_title_h
    for i, (key, title, poop_key, fly_key, desc) in enumerate(COMBOS):
        x = pad + i * (cell + pad)
        pair = Image.new("RGBA", (cell, cell), (0, 0, 0, 0))
        poop = grid_to_image(POOP_BY_KEY[poop_key]()).resize((cell // 2 - 4, cell // 2 - 4), Image.NEAREST)
        fly = grid_to_image(FLY_BY_KEY[fly_key]()).resize((cell // 2 - 4, cell // 2 - 4), Image.NEAREST)
        pair.paste(poop, (4, cell // 2 + 2), poop)
        pair.paste(fly, (cell // 2 + 2, 4), fly)
        frame_draw = ImageDraw.Draw(sheet)
        frame_draw.rectangle((x, y, x + cell + 2, y + cell + 2), outline=INK, width=2)
        sheet.paste(pair, (x + 1, y + 1), pair)
        draw.text((x, y + cell + 6), title, fill=INK, font=font)
        draw.text((x, y + cell + 18), desc, fill=(109, 76, 65, 255), font=font)

    sheet.save(out_path, "PNG")
    return out_path


def build_preview_html():
    poop_cards = "\n".join(
        f'    <figure><img src="poop/{key}.png" alt=""><figcaption>{label}</figcaption></figure>'
        for key, label, _fn in POOP_VARIANTS
    )
    fly_cards = "\n".join(
        f'    <figure><img src="fly/{key}.png" alt=""><figcaption>{label}</figcaption></figure>'
        for key, label, _fn in FLY_VARIANTS
    )
    combo_cards = "\n".join(
        f'    <figure class="combo"><img src="combos/{key}.png" alt=""><figcaption><strong>{title}</strong><br>{desc}</figcaption></figure>'
        for key, title, poop_key, fly_key, desc in COMBOS
    )
    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mess Sprite Preview</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #fef6e4;
      color: #2d2a26;
      padding: 24px 16px 40px;
    }}
    h1 {{ font-size: 15px; margin-bottom: 6px; }}
    h2 {{ font-size: 12px; margin: 24px 0 10px; border-bottom: 2px solid #2d2a26; padding-bottom: 6px; }}
    p {{ font-size: 11px; color: #6b6560; margin-bottom: 16px; line-height: 1.5; }}
    .sheet {{ width: min(100%, 520px); border: 2px solid #2d2a26; display: block; margin-bottom: 20px; }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
      max-width: 520px;
    }}
    figure {{
      text-align: center;
      padding: 10px 8px;
      background: #fff;
      border: 2px solid #2d2a26;
      border-radius: 4px;
      box-shadow: 0 3px 0 #6b6560;
    }}
    figure img {{
      width: 72px;
      height: 72px;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }}
    figcaption {{ font-size: 10px; margin-top: 8px; line-height: 1.35; }}
    figure.combo img {{ width: 88px; height: 88px; }}
    .tag {{
      display: inline-block;
      margin-top: 20px;
      padding: 4px 8px;
      font-size: 10px;
      background: #2d2a26;
      color: #fef6e4;
    }}
  </style>
</head>
<body>
  <h1>Mess sprites — simplified proposals</h1>
  <p>배변물·파리 단순화 시안입니다. 아직 게임에는 반영되지 않았습니다.</p>
  <img class="sheet" src="_preview-mess-sheet.png" alt="전체 미리보기 시트">
  <h2>배변물</h2>
  <div class="grid">
{poop_cards}
  </div>
  <h2>파리</h2>
  <div class="grid">
{fly_cards}
  </div>
  <h2>추천 조합</h2>
  <div class="grid">
{combo_cards}
  </div>
  <p style="text-align:center"><span class="tag">STAGING ONLY</span></p>
</body>
</html>
"""
    path = STAGING / "preview.html"
    path.write_text(html, encoding="utf-8")
    return path


def main():
    STAGING.mkdir(parents=True, exist_ok=True)
    (STAGING / "poop").mkdir(exist_ok=True)
    (STAGING / "fly").mkdir(exist_ok=True)
    (STAGING / "combos").mkdir(exist_ok=True)

    for key, _label, fn in POOP_VARIANTS:
        save_icon(fn(), STAGING / "poop" / f"{key}.png")
    for key, _label, fn in FLY_VARIANTS:
        save_icon(fn(), STAGING / "fly" / f"{key}.png")
    for key, _title, poop_key, fly_key, _desc in COMBOS:
        pair = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
        poop = grid_to_image(POOP_BY_KEY[poop_key]())
        fly = grid_to_image(FLY_BY_KEY[fly_key]())
        pair.paste(poop, (2, 18), poop)
        pair.paste(fly, (18, 2), fly)
        pair.resize((OUT, OUT), Image.NEAREST).save(STAGING / "combos" / f"{key}.png", "PNG")

    sheet = build_full_sheet(STAGING / "_preview-mess-sheet.png")
    html = build_preview_html()

    print(f"Poop icons  -> {STAGING / 'poop'}/")
    print(f"Fly icons   -> {STAGING / 'fly'}/")
    print(f"Combos      -> {STAGING / 'combos'}/")
    print(f"Full sheet  -> {sheet}")
    print(f"HTML        -> {html}")
    print(f"Open: file://{html.resolve()}")


if __name__ == "__main__":
    main()
