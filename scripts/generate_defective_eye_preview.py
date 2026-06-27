#!/usr/bin/env python3
"""Stage redesigned defective adults (small eyes) — preview only."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from generate_all_sprites import (
    K,
    OUT,
    SIZE,
    WHITE,
    BLOB,
    BLOB2,
    BONE_SHOW,
    EYE_YELLOW,
    LESION,
    MUCUS,
    PALE,
    PALE2,
    PARASITE,
    RAG,
    RAG2,
    RED,
    ROT,
    SLIME,
    SLIME2,
    blank,
    draw_line,
    draw_poly,
    fill_circle,
    fill_ellipse,
    px,
    sprite_fluffy,
    sprite_golden,
    sprite_grumpy,
    sprite_scruffy,
    sprite_sickly,
    sprite_sparkle,
)

ROOT = Path(__file__).resolve().parent.parent
STAGING = ROOT / ".sprite-staging-defective-eyes"
INK = K
GREY_MAW = (50, 50, 50, 255)
LURE_STEM = (90, 90, 90, 255)


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


def draw_eye_grotesque_small(g, x, y, iris=EYE_YELLOW, pupil=RED, sclera=WHITE):
    """Pretty-scale 3×3 — grotesque palette."""
    for dx in range(3):
        px(g, x + dx, y, sclera)
    px(g, x, y + 1, pupil)
    px(g, x + 1, y + 1, iris)
    px(g, x + 2, y + 1, pupil)
    px(g, x, y + 2, sclera)
    px(g, x + 1, y + 2, iris if iris != WHITE else pupil)
    px(g, x + 2, y + 2, sclera)
    px(g, x + 2, y, pupil)


def draw_empty_socket_small(g, x, y):
    """Pretty-scale missing eye — bone rim + rot."""
    px(g, x, y, K)
    px(g, x + 1, y, K)
    px(g, x, y + 1, ROT)
    px(g, x + 1, y + 1, K)
    px(g, x - 1, y, BONE_SHOW)
    px(g, x + 2, y, BONE_SHOW)
    px(g, x, y - 1, RAG2)


def draw_swollen_eye_small(g, x, y):
    """Pretty-scale bulging eye."""
    for dx in range(3):
        px(g, x + dx, y, WHITE)
        px(g, x + dx, y + 2, WHITE)
    px(g, x, y + 1, EYE_YELLOW)
    px(g, x + 1, y + 1, RED)
    px(g, x + 2, y + 1, EYE_YELLOW)
    px(g, x + 2, y, LESION)


def _eye_disk(g, cx, cy, r_outer, inner_fn):
    """Pixel disk with crisp black rim — same radius as current large eyes."""
    r_inner = r_outer - 1
    for y in range(cy - r_outer, cy + r_outer + 1):
        for x in range(cx - r_outer, cx + r_outer + 1):
            d2 = (x - cx) ** 2 + (y - cy) ** 2
            if d2 > r_outer * r_outer:
                continue
            if d2 >= r_inner * r_inner:
                px(g, x, y, K)
            else:
                inner_fn(g, x, y, cx, cy, d2)


def draw_eye_grotesque_crisp(g, cx, cy, iris=EYE_YELLOW, pupil=RED):
    """Large eye (r=4) — sharp sclera ring, block iris, twin pupils."""

    def inner(gr, x, y, _cx, _cy, d2):
        if d2 >= 4:
            px(gr, x, y, WHITE)
        else:
            px(gr, x, y, iris)

    _eye_disk(g, cx, cy, 4, inner)
    px(g, cx, cy, pupil)
    px(g, cx + 1, cy, pupil)
    px(g, cx - 1, cy + 1, pupil)
    px(g, cx + 2, cy - 1, WHITE)


def draw_empty_socket_crisp(g, cx, cy):
    """Missing eye (r≈2) — bold bone cross + rot pit."""
    fill_circle(g, cx, cy, 2, K, None)
    px(g, cx, cy, ROT)
    px(g, cx - 2, cy, BONE_SHOW)
    px(g, cx + 2, cy, BONE_SHOW)
    px(g, cx, cy - 2, BONE_SHOW)
    px(g, cx - 1, cy - 1, K)
    px(g, cx + 1, cy - 1, K)
    px(g, cx - 1, cy + 1, RAG2)
    px(g, cx + 1, cy + 1, RAG2)


def draw_swollen_eye_crisp(g, cx, cy):
    """Large bulging eye (r=5) — white/yellow/red rings + lesion fleck."""

    def inner(gr, x, y, _cx, _cy, d2):
        if d2 >= 9:
            px(gr, x, y, WHITE)
        elif d2 >= 1:
            px(gr, x, y, EYE_YELLOW)
        else:
            px(gr, x, y, RED)

    _eye_disk(g, cx, cy, 5, inner)
    px(g, cx + 1, cy, RED)
    px(g, cx + 2, cy - 2, WHITE)
    px(g, cx + 2, cy + 1, LESION)


def sprite_scruffy_crisp_eyes():
    """Current scruffy body — crisp large socket + grotesque eye."""
    g = blank()
    fill_ellipse(g, 14, 17, 8, 6, RAG, K)
    fill_ellipse(g, 10, 18, 2, 2, BONE_SHOW, K)
    px(g, 9, 17, ROT)
    draw_line(g, 9, 11, 7, 9, RAG2)
    draw_line(g, 10, 10, 8, 7, K)
    draw_line(g, 8, 12, 5, 11, ROT)
    draw_poly(g, [(20, 17), (25, 14), (24, 20)], RAG2, K)
    draw_line(g, 11, 10, 14, 8, K)
    draw_line(g, 14, 8, 16, 10, LURE_STEM)
    px(g, 16, 10, SLIME2)
    for x, y in ((13, 22), (14, 23), (15, 24), (14, 25)):
        px(g, x, y, SLIME)
    px(g, 12, 19, MUCUS)
    draw_empty_socket_crisp(g, 7, 11)
    draw_eye_grotesque_crisp(g, 11, 11)
    return g


def sprite_grumpy_crisp_eyes():
    """Current grumpy body — crisp twin grotesque eyes."""
    g = blank()
    fill_ellipse(g, 15, 18, 7, 5, BLOB2, K)
    fill_circle(g, 11, 14, 6, BLOB, K)
    fill_ellipse(g, 11, 15, 5, 4, GREY_MAW)
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
    draw_eye_grotesque_crisp(g, 7, 9, iris=WHITE, pupil=RED)
    draw_eye_grotesque_crisp(g, 15, 9, iris=WHITE, pupil=RED)
    return g


def sprite_sickly_crisp_eyes():
    """Current sickly body — crisp swollen eye."""
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
    draw_swollen_eye_crisp(g, 11, 14)
    return g


def sprite_scruffy_redesign():
    """Defective angler — compact head, lure, socket + small eye, no head hole."""
    g = blank()
    fill_ellipse(g, 14, 18, 8, 6, RAG, K)
    fill_ellipse(g, 13, 14, 6, 5, RAG2, K)
    fill_ellipse(g, 12, 13, 4, 3, RAG, K)
    draw_poly(g, [(20, 18), (25, 14), (24, 20)], RAG2, K)
    draw_line(g, 8, 12, 5, 11, ROT)
    draw_line(g, 9, 11, 6, 10, RAG2)
    fill_ellipse(g, 10, 18, 2, 2, BONE_SHOW, K)
    px(g, 9, 17, ROT)
    px(g, 12, 19, MUCUS)
    for x, y in ((13, 22), (14, 23), (15, 24), (14, 25)):
        px(g, x, y, SLIME)
    for x, y in ((11, 15), (15, 14), (13, 16)):
        px(g, x, y, ROT)
    draw_line(g, 13, 9, 13, 6, K)
    draw_line(g, 14, 8, 16, 10, LURE_STEM)
    px(g, 13, 5, SLIME2)
    px(g, 14, 5, SLIME)
    px(g, 12, 6, SLIME2)
    draw_empty_socket_small(g, 6, 11)
    draw_eye_grotesque_small(g, 10, 12)
    return g


def sprite_grumpy_redesign():
    """Defective fangfish — filled brow, small dead eyes above toothy maw."""
    g = blank()
    fill_ellipse(g, 15, 19, 7, 5, BLOB2, K)
    fill_circle(g, 11, 13, 6, BLOB, K)
    fill_ellipse(g, 11, 14, 5, 4, GREY_MAW)
    for x in range(7, 15):
        if x % 2 == 0:
            px(g, x, 14, WHITE)
            px(g, x, 15, K)
    draw_line(g, 7, 11, 10, 12, K)
    draw_line(g, 14, 11, 11, 12, K)
    draw_poly(g, [(18, 18), (24, 15), (23, 20)], BLOB2, K)
    px(g, 24, 14, RED)
    for x, y in ((10, 16), (11, 17), (12, 16)):
        px(g, x, y, SLIME2)
    for x in range(6, 16):
        px(g, x, 9, BLOB2 if x % 2 else BLOB)
    px(g, 8, 10, K)
    px(g, 13, 10, K)
    draw_eye_grotesque_small(g, 6, 10, iris=WHITE, pupil=RED)
    draw_eye_grotesque_small(g, 13, 10, iris=WHITE, pupil=RED)
    return g


def sprite_sickly_redesign():
    """Defective parasite host — pale head fill, small swollen eye, worms."""
    g = blank()
    fill_ellipse(g, 14, 19, 7, 5, PALE, K)
    fill_ellipse(g, 14, 18, 5, 3, PALE2)
    fill_ellipse(g, 13, 14, 5, 4, PALE, K)
    fill_ellipse(g, 13, 13, 3, 2, PALE2)
    draw_line(g, 10, 13, 12, 15, K)
    px(g, 10, 14, K)
    px(g, 10, 15, K)
    for x, y in ((12, 17), (15, 19), (13, 20), (14, 15)):
        px(g, x, y, LESION)
    worms = ((8, 16, 5, 18), (17, 19, 20, 21), (11, 20, 8, 23), (15, 12, 17, 11))
    for x0, y0, x1, y1 in worms:
        draw_line(g, x0, y0, x1, y1, PARASITE)
        px(g, x1, y1, SLIME2)
    draw_poly(g, [(20, 18), (24, 16), (23, 21)], PALE2, K)
    for x, y in ((14, 24), (15, 25), (13, 26)):
        px(g, x, y, MUCUS)
    px(g, 11, 14, PALE2)
    px(g, 15, 13, LESION)
    draw_swollen_eye_small(g, 10, 12)
    return g


PRETTY_REF = [
    ("golden", "golden (pretty)", sprite_golden),
    ("fluffy", "fluffy (pretty)", sprite_fluffy),
    ("sparkle", "sparkle (pretty)", sprite_sparkle),
]

DEFECTIVE_CURRENT = [
    ("scruffy", "scruffy · 현재", sprite_scruffy),
    ("grumpy", "grumpy · 현재", sprite_grumpy),
    ("sickly", "sickly · 현재", sprite_sickly),
]

DEFECTIVE_CRISP = [
    ("scruffy", "scruffy · 또렷", sprite_scruffy_crisp_eyes),
    ("grumpy", "grumpy · 또렷", sprite_grumpy_crisp_eyes),
    ("sickly", "sickly · 또렷", sprite_sickly_crisp_eyes),
]

DEFECTIVE_PROPOSED = [
    ("scruffy", "scruffy · 재디자인", sprite_scruffy_redesign),
    ("grumpy", "grumpy · 재디자인", sprite_grumpy_redesign),
    ("sickly", "sickly · 재디자인", sprite_sickly_redesign),
]


def build_sheet(out_path: Path):
    cell, pad = 100, 16
    cols = 3
    title_h, row_title_h, label_h = 34, 22, 18
    row_h = cell + label_h + 8
    w = cols * (cell + pad) + pad
    h = pad + title_h + (row_h + row_title_h) * 4 + pad
    sheet = Image.new("RGBA", (w, h), (254, 246, 228, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()

    draw.text(
        (pad, 10),
        "Defective adults — crisp large eyes (staging only)",
        fill=INK,
        font=font,
    )

    def draw_row(y0, title, items):
        draw.text((pad, y0), title, fill=(109, 76, 65, 255), font=font)
        y = y0 + row_title_h
        for i, (key, label, fn) in enumerate(items):
            x = pad + i * (cell + pad)
            img = grid_to_image(fn())
            img = img.resize((cell, cell), Image.NEAREST)
            draw.rectangle((x, y, x + cell + 2, y + cell + 2), outline=INK, width=2)
            sheet.paste(img, (x + 1, y + 1), img)
            draw.text((x, y + cell + 6), label, fill=INK, font=font)
        return y + row_h

    y = pad + title_h
    y = draw_row(y, "Defective — 현재", DEFECTIVE_CURRENT)
    y = draw_row(y, "Defective — 또렷한 큰 눈 (크기 유지)", DEFECTIVE_CRISP)
    y = draw_row(y, "Defective — 작은 눈 재디자인 (참고)", DEFECTIVE_PROPOSED)
    draw_row(y, "Pretty 참고", PRETTY_REF)

    sheet.save(out_path, "PNG")
    return out_path


def build_html():
    def cards(items, folder):
        return "\n".join(
            f'    <figure><img src="{folder}/{key}.png" alt=""><figcaption>{label}</figcaption></figure>'
            for key, label, _fn in items
        )

    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Defective Eye Preview</title>
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
    .sheet {{ width: min(100%, 360px); border: 2px solid #2d2a26; display: block; margin-bottom: 20px; }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      max-width: 360px;
    }}
    figure {{
      text-align: center;
      padding: 10px 6px;
      background: #fff;
      border: 2px solid #2d2a26;
      border-radius: 4px;
      box-shadow: 0 3px 0 #6b6560;
    }}
    figure img {{
      width: 88px;
      height: 88px;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }}
    figcaption {{ font-size: 10px; margin-top: 8px; line-height: 1.35; }}
    .compare {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      max-width: 360px;
      margin-bottom: 8px;
    }}
    .compare figure {{ background: #fde8f0; }}
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
  <h1>Defective adult — crisp large eyes</h1>
  <p>눈 <strong>크기는 현재와 동일</strong>하고, 검정 외곽·흰자·홍채·동공 층을 픽셀로 또렷하게 분리한 시안입니다. 게임 미반영.</p>
  <img class="sheet" src="_preview-defective-eyes.png" alt="전체 시트">
  <h2>현재 vs 또렷한 큰 눈</h2>
  <div class="compare">
    <figure><img src="current/scruffy.png" alt=""><figcaption>scruffy · 현재</figcaption></figure>
    <figure><img src="crisp/scruffy.png" alt=""><figcaption>scruffy · 또렷</figcaption></figure>
    <figure><img src="current/grumpy.png" alt=""><figcaption>grumpy · 현재</figcaption></figure>
    <figure><img src="crisp/grumpy.png" alt=""><figcaption>grumpy · 또렷</figcaption></figure>
    <figure><img src="current/sickly.png" alt=""><figcaption>sickly · 현재</figcaption></figure>
    <figure><img src="crisp/sickly.png" alt=""><figcaption>sickly · 또렷</figcaption></figure>
  </div>
  <h2>작은 눈 재디자인 (참고)</h2>
  <div class="compare">
    <figure><img src="current/scruffy.png" alt=""><figcaption>scruffy · 현재</figcaption></figure>
    <figure><img src="proposed/scruffy.png" alt=""><figcaption>scruffy · 재디자인</figcaption></figure>
    <figure><img src="current/grumpy.png" alt=""><figcaption>grumpy · 현재</figcaption></figure>
    <figure><img src="proposed/grumpy.png" alt=""><figcaption>grumpy · 재디자인</figcaption></figure>
    <figure><img src="current/sickly.png" alt=""><figcaption>sickly · 현재</figcaption></figure>
    <figure><img src="proposed/sickly.png" alt=""><figcaption>sickly · 재디자인</figcaption></figure>
  </div>
  <h2>Pretty 참고</h2>
  <div class="grid">
{cards(PRETTY_REF, "pretty")}
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
    for folder, items in (
        ("pretty", PRETTY_REF),
        ("current", DEFECTIVE_CURRENT),
        ("crisp", DEFECTIVE_CRISP),
        ("proposed", DEFECTIVE_PROPOSED),
    ):
        for key, _label, fn in items:
            save_sprite(fn(), STAGING / folder / f"{key}.png")

    sheet = build_sheet(STAGING / "_preview-defective-eyes.png")
    html = build_html()

    print(f"Pretty ref  -> {STAGING / 'pretty'}/")
    print(f"Current     -> {STAGING / 'current'}/")
    print(f"Crisp       -> {STAGING / 'crisp'}/")
    print(f"Proposed    -> {STAGING / 'proposed'}/")
    print(f"Full sheet  -> {sheet}")
    print(f"HTML        -> {html}")
    print(f"Open: file://{html.resolve()}")


if __name__ == "__main__":
    main()
