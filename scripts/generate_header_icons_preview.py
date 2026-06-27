#!/usr/bin/env python3
"""Header icon staging — SUB-3 submersible theme. Game sprites live in generate_all_sprites."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from generate_all_sprites import (
    OUT,
    SIZE,
    save_grid,
    sprite_encyclopedia,
    sprite_sound_off,
    sprite_sound_on,
)

ROOT = Path(__file__).resolve().parent.parent
STAGING = ROOT / ".sprite-staging-ui-icons"
DOCS_OUT = ROOT / "docs" / "header-icons-preview"


def grid_to_image(g):
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    pxmap = img.load()
    for y in range(SIZE):
        for x in range(SIZE):
            pxmap[x, y] = g[y][x]
    return img


SPRITES = {
    "encyclopedia": ("도감 · 탐사 일지", sprite_encyclopedia),
    "sound-on": ("스피커 ON · 함체 송출", sprite_sound_on),
    "sound-off": ("스피커 OFF · 음소거", sprite_sound_off),
}


def build_sheet(path: Path):
    cell, gap, pad = 96, 12, 16
    cols = len(SPRITES)
    w = pad * 2 + cols * cell + (cols - 1) * gap
    h = pad + 28 + cell + 36
    sheet = Image.new("RGBA", (w, h), (12, 20, 38, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    draw.text((pad, 8), "Header icons — SUB-3 submersible (32px)", fill=(0, 229, 255), font=font)
    for i, (key, (label, fn)) in enumerate(SPRITES.items()):
        x = pad + i * (cell + gap)
        y = 28
        img = grid_to_image(fn()).resize((cell, cell), Image.NEAREST)
        sheet.paste(img, (x, y), img)
        draw.text((x, y + cell + 6), label, fill=(144, 202, 249), font=font)
    sheet.save(path, "PNG")
    return path


def build_html():
    cards = []
    for key, (label, _) in SPRITES.items():
        cards.append(
            f"""    <figure>
      <img src="{key}.png" width="128" height="128" alt="">
      <figcaption><strong>{label}</strong><br><code>{key}.png</code></figcaption>
    </figure>"""
        )

    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#1a2838">
  <title>헤더 아이콘 — 도감 · 스피커</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
      background: #101820;
      color: #c8d4dc;
      padding: 20px 14px 48px;
      line-height: 1.5;
    }}
    .wrap {{ max-width: 420px; margin: 0 auto; }}
    h1 {{ font-size: 1.0625rem; color: #eef4f8; margin-bottom: 6px; }}
    .lead {{ font-size: 0.75rem; color: #7a8898; margin-bottom: 16px; }}
    .notice {{
      background: #1a2838; border: 1px solid #3a5060; border-radius: 8px;
      padding: 12px 14px; font-size: 0.6875rem; color: #98a8b8; margin-bottom: 20px;
    }}
    .notice strong {{ color: #58b8c8; }}
    .sheet {{ width: 100%; border: 1px solid #2a3848; border-radius: 6px; margin-bottom: 20px; }}
    .grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }}
    figure {{
      background: #1a2838; border: 1px solid #3a5060; border-radius: 8px;
      padding: 12px 8px; text-align: center;
    }}
    figure img {{ image-rendering: pixelated; background: #243040; border-radius: 4px; }}
    figcaption {{ font-size: 0.625rem; margin-top: 8px; line-height: 1.45; color: #88a0b0; }}
    figcaption strong {{ color: #d8e4ec; display: block; margin-bottom: 2px; }}
    h2 {{
      font-size: 0.8125rem; color: #58b8c8; margin: 20px 0 10px;
      border-bottom: 1px solid #2a3848; padding-bottom: 6px;
    }}
    .compare {{ display: flex; flex-direction: column; gap: 16px; }}
    .phone {{
      background: #1a2838; border: 2px solid #3a5060; border-radius: 18px;
      overflow: hidden; box-shadow: 0 8px 28px rgba(0,0,0,0.35);
    }}
    .phone__inner {{ padding: 10px 12px 14px; }}
    .header-mock {{
      position: relative; text-align: center; padding: 4px 52px 12px; min-height: 52px;
    }}
    .icon-btn {{
      position: absolute; top: 0; width: 44px; height: 44px;
      border: 1px solid #3a5060; border-radius: 10px;
      background: #243040; box-shadow: 0 4px 20px rgba(0,0,0,0.28);
      display: flex; align-items: center; justify-content: center;
    }}
    .icon-btn--left {{ left: 0; }}
    .icon-btn--right {{ right: 0; }}
    .icon-btn img {{ width: 28px; height: 28px; image-rendering: pixelated; }}
    .pet-name {{ font-size: 1.125rem; font-weight: 700; color: #d8e4ec; }}
    .pet-meta {{ font-size: 0.6875rem; color: #7a8a98; margin-top: 2px; }}
    .label-row {{
      display: flex; justify-content: space-between; font-size: 0.625rem;
      color: #7a8898; margin-bottom: 6px; padding: 0 4px;
    }}
    .stamp {{
      display: inline-block; margin-top: 16px; padding: 5px 12px;
      background: #58b8c8; color: #0c1426; font-size: 0.625rem; font-weight: 700;
      border-radius: 4px;
    }}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>헤더 아이콘</h1>
    <p class="lead">SUB-3 수압 계기판 · 32×32 픽셀 · <strong>게임 반영됨</strong></p>
    <div class="notice">
      <strong>도감</strong> — 탐사 일지 + 소나 blip ·
      <strong>스피커</strong> — 함체 인터컴 on/off
    </div>
    <img class="sheet" src="_preview-header-icons.png" alt="아이콘 시트">
    <h2>아이콘</h2>
    <div class="grid">
{chr(10).join(cards)}
    </div>
    <h2>헤더 맥락</h2>
    <div class="compare">
      <div>
        <div class="label-row"><span>음소거 OFF</span><span>sound-on</span></div>
        <div class="phone"><div class="phone__inner"><div class="header-mock">
          <button type="button" class="icon-btn icon-btn--left" disabled><img src="encyclopedia.png" alt=""></button>
          <button type="button" class="icon-btn icon-btn--right" disabled><img src="sound-on.png" alt=""></button>
          <p class="pet-name">치치</p><p class="pet-meta">3일째</p>
        </div></div></div>
      </div>
      <div>
        <div class="label-row"><span>음소거 ON</span><span>sound-off</span></div>
        <div class="phone"><div class="phone__inner"><div class="header-mock">
          <button type="button" class="icon-btn icon-btn--left" disabled><img src="encyclopedia.png" alt=""></button>
          <button type="button" class="icon-btn icon-btn--right" disabled><img src="sound-off.png" alt=""></button>
          <p class="pet-name">치치</p><p class="pet-meta">3일째</p>
        </div></div></div>
      </div>
    </div>
    <p style="text-align:center"><span class="stamp">IN GAME</span></p>
  </div>
</body>
</html>"""


def main():
    STAGING.mkdir(parents=True, exist_ok=True)
    DOCS_OUT.mkdir(parents=True, exist_ok=True)
    for key, (_, fn) in SPRITES.items():
        save_grid(fn(), STAGING / f"{key}.png")
        save_grid(fn(), DOCS_OUT / f"{key}.png")
    build_sheet(STAGING / "_preview-header-icons.png")
    build_sheet(DOCS_OUT / "_preview-header-icons.png")
    html = build_html()
    (STAGING / "preview-header-icons.html").write_text(html, encoding="utf-8")
    docs_html = DOCS_OUT / "index.html"
    docs_html.write_text(html, encoding="utf-8")
    print(f"Icons -> {STAGING}/ + {DOCS_OUT}/")
    print(f"HTML  -> {docs_html}")


if __name__ == "__main__":
    main()
