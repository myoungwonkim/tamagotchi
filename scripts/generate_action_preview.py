#!/usr/bin/env python3
"""Stage action-button icons + pixel labels (preview only — not installed to game)."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from generate_all_sprites import (
    ACTION_SPRITES,
    K,
    OUT,
    SIZE,
    save_grid,
)

ROOT = Path(__file__).resolve().parent.parent
STAGING = ROOT / ".sprite-staging-actions"
PIXEL_FONT_TTF = STAGING / "fonts" / "Galmuri14.ttf"
PIXEL_FONT_WOFF2 = STAGING / "fonts" / "Galmuri14.woff2"
PIXEL_FONT_FALLBACK_TTF = STAGING / "fonts" / "Galmuri11.ttf"
BOLD_FONT_TTF = STAGING / "fonts" / "Galmuri11-Bold.ttf"
BOLD_FONT_WOFF2 = STAGING / "fonts" / "Galmuri11-Bold.woff2"
PIXEL_FONT_SIZE = 14
BOLD_FONT_SIZE = 15
UI_LABEL_SIZE = 16

INK = K
SHADOW = (109, 76, 65, 255)

ACTION_META = [
    ("feed", "먹이", (255, 243, 230, 255), (255, 159, 67, 255)),
    ("play", "놀이", (253, 232, 240, 255), (245, 130, 174, 255)),
    ("clean", "청소", (232, 247, 251, 255), (88, 196, 220, 255)),
    ("sleep", "재우기", (232, 238, 248, 255), (121, 134, 203, 255)),
    ("wake", "깨우기", (255, 249, 230, 255), (255, 193, 7, 255)),
]


def load_pixel_font(size=PIXEL_FONT_SIZE):
    """Galmuri14 — larger pixel font for readable Korean labels."""
    for path in (PIXEL_FONT_TTF, PIXEL_FONT_FALLBACK_TTF):
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def load_bold_pixel_font(size=BOLD_FONT_SIZE):
    """Galmuri11 Bold — heavier pixel labels."""
    if BOLD_FONT_TTF.exists():
        return ImageFont.truetype(str(BOLD_FONT_TTF), size)
    return load_pixel_font(size)


def load_ui_font(size=UI_LABEL_SIZE):
    """System UI font — matches in-game action button labels."""
    for path in (
        "/System/Library/Fonts/AppleSDGothicNeo.ttc",
        "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
    ):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def label_font_for_key(variant: str, key: str):
    if variant == "bold":
        return load_bold_pixel_font(BOLD_FONT_SIZE)
    if variant == "ui":
        return load_ui_font(UI_LABEL_SIZE)
    return load_pixel_font(PIXEL_FONT_SIZE)


def draw_label_text(draw, xy, text, font, fill=INK, halo=False):
    x, y = xy
    if halo:
        halo_color = (255, 255, 255, 255)
        for dx, dy in ((-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1)):
            draw.text((x + dx, y + dy), text, font=font, fill=halo_color)
    draw.text((x, y), text, font=font, fill=fill)


def grid_to_image(g):
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    pxmap = img.load()
    for y in range(SIZE):
        for x in range(SIZE):
            pxmap[x, y] = g[y][x]
    return img.resize((OUT, OUT), Image.NEAREST)


def draw_pixel_button(draw, x, y, w, h, bg, accent):
    """Famicom-style chunky button frame."""
    draw.rectangle((x, y, x + w, y + h), fill=bg, outline=INK, width=2)
    draw.rectangle((x + 3, y + 3, x + w - 4, y + 5), fill=accent)
    draw.rectangle((x + 3, y + h - 5, x + w - 4, y + h - 4), fill=SHADOW)


def build_preview_sheet(staging: Path, variant: str, title: str, filename: str):
    cols, pad = 3, 20
    btn_w, btn_h = 150, 190
    icon_sz = 80
    n = len(ACTION_META)
    rows = (n + cols - 1) // cols
    sheet_w = cols * (btn_w + pad) + pad
    sheet_h = rows * (btn_h + pad) + pad + 40
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (254, 246, 228, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    draw.text((pad, 8), title, fill=INK, font=font)
    use_halo = variant in ("pixel", "bold")

    for i, (key, label, bg, accent) in enumerate(ACTION_META):
        col, row = i % cols, i // cols
        bx = pad + col * (btn_w + pad)
        by = 36 + row * (btn_h + pad)
        draw_pixel_button(draw, bx, by, btn_w, btn_h, bg, accent)
        icon = grid_to_image(ACTION_SPRITES[key]())
        icon = icon.resize((icon_sz, icon_sz), Image.NEAREST)
        sheet.paste(icon, (bx + (btn_w - icon_sz) // 2, by + 28), icon)
        btn_label_font = label_font_for_key(variant, key)
        bbox = draw.textbbox((0, 0), label, font=btn_label_font)
        tw = bbox[2] - bbox[0]
        label_y = by + btn_h - 44
        draw_label_text(
            draw,
            (bx + (btn_w - tw) // 2, label_y),
            label,
            btn_label_font,
            halo=use_halo,
        )
        draw.text((bx + 8, by + btn_h - 14), key, fill=accent, font=font)

    out = staging / filename
    sheet.save(out, "PNG")
    return out


def build_icon_sheet(staging: Path):
    cell, pad = 96, 10
    n = len(ACTION_META)
    w = n * (cell + pad) + pad
    h = cell + pad + 28
    sheet = Image.new("RGBA", (w, h), (12, 20, 38, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    draw.text((pad, 6), "Icons only", fill=(0, 229, 255), font=font)
    for i, (key, *_rest) in enumerate(ACTION_META):
        x = pad + i * (cell + pad)
        y = 24
        img = grid_to_image(ACTION_SPRITES[key]())
        img = img.resize((cell, cell), Image.NEAREST)
        sheet.paste(img, (x, y), img)
        draw.text((x, y + cell + 4), key, fill=(144, 202, 249), font=font)
    out = staging / "_preview-icons.png"
    sheet.save(out, "PNG")
    return out


def build_button_grid(variant: str):
    return "\n".join(
        f'    <div class="btn btn--{key}"><img class="icon" src="icons/{key}.png" alt=""><span>{label}</span></div>'
        for key, label, *_rest in ACTION_META
    )


def build_preview_html(staging: Path):
    grid_bold = build_button_grid("bold")
    grid_ui = build_button_grid("ui")
    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Action Button Preview</title>
  <style>
    @font-face {{
      font-family: "Galmuri11Bold";
      src: url("fonts/Galmuri11-Bold.woff2") format("woff2");
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      background: #fef6e4;
      color: #2d2a26;
      min-height: 100dvh;
      padding: 24px 16px 40px;
    }}
    h1 {{
      font-size: 14px;
      letter-spacing: 0.02em;
      margin-bottom: 6px;
      text-transform: uppercase;
    }}
    h2 {{
      font-size: 12px;
      margin: 28px 0 8px;
      padding-bottom: 6px;
      border-bottom: 2px solid #2d2a26;
    }}
    h2:first-of-type {{ margin-top: 0; }}
    p {{ font-size: 11px; color: #6b6560; margin-bottom: 12px; line-height: 1.5; }}
    .sheet {{ width: min(100%, 420px); display: block; margin: 0 auto 16px; border: 2px solid #2d2a26; }}
    .grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      max-width: 420px;
      margin: 0 auto;
    }}
    .btn {{
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 108px;
      padding: 12px 8px 14px;
      border: 2px solid #2d2a26;
      border-radius: 4px;
      background: #fff;
      box-shadow: 0 3px 0 #6b6560;
      cursor: default;
    }}
    .btn:active {{ transform: translateY(2px); box-shadow: 0 1px 0 #6b6560; }}
    .btn--feed {{ background: #fff3e6; }}
    .btn--play {{ background: #fde8f0; }}
    .btn--clean {{ background: #e8f7fb; }}
    .btn--sleep {{ background: #e8eef8; }}
    .btn--wake {{ background: #fff9e6; }}
    .btn img.icon {{
      width: 56px;
      height: 56px;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }}
    .variant--bold .btn span {{
      font-family: "Galmuri11Bold", monospace;
      font-size: 15px;
      line-height: 1.35;
      letter-spacing: 0;
      color: #2d2a26;
      text-align: center;
      padding: 0 2px;
      -webkit-font-smoothing: antialiased;
      text-shadow:
        -1px -1px 0 #fff,
         0    -1px 0 #fff,
         1px -1px 0 #fff,
        -1px  0    0 #fff,
         1px  0    0 #fff,
        -1px  1px 0 #fff,
         0     1px 0 #fff,
         1px  1px 0 #fff;
    }}
    .variant--ui .btn span {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.3;
      color: #2d2a26;
      text-align: center;
      padding: 0 2px;
    }}
    .tag {{
      display: inline-block;
      margin-top: 16px;
      padding: 4px 8px;
      font-size: 10px;
      background: #2d2a26;
      color: #fef6e4;
    }}
  </style>
</head>
<body>
  <h1>Action buttons — label comparison</h1>
  <p>픽셀 아이콘은 동일하고 라벨만 다릅니다. 아직 게임에는 반영되지 않았습니다.</p>

  <section class="variant variant--bold">
    <h2>A · Galmuri11 Bold — 픽셀 라벨 (굵게)</h2>
    <p>도트 느낌을 유지하면서 획을 굵게 한 버전입니다.</p>
    <img class="sheet" src="_preview-buttons-bold.png" alt="굵은 픽셀 라벨 시트">
    <div class="grid">
{grid_bold}
    </div>
  </section>

  <section class="variant variant--ui">
    <h2>B · 일반 고딕 라벨 — 아이콘만 픽셀</h2>
    <p>게임 현재 버튼과 같은 시스템 UI 폰트로 가독성을 우선한 버전입니다.</p>
    <img class="sheet" src="_preview-buttons-ui.png" alt="일반 고딕 라벨 시트">
    <div class="grid">
{grid_ui}
    </div>
  </section>

  <p style="text-align:center;margin-top:20px"><span class="tag">STAGING ONLY</span></p>
</body>
</html>
"""
    path = staging / "preview.html"
    path.write_text(html, encoding="utf-8")
    return path


def main():
    staging = STAGING
    icons_dir = staging / "icons"
    icons_dir.mkdir(parents=True, exist_ok=True)
    (staging / "fonts").mkdir(parents=True, exist_ok=True)

    if not PIXEL_FONT_TTF.exists() and not PIXEL_FONT_FALLBACK_TTF.exists():
        raise SystemExit(
            "Missing Galmuri14.ttf (or Galmuri11.ttf fallback) in .sprite-staging-actions/fonts/."
        )
    if not BOLD_FONT_TTF.exists():
        raise SystemExit(
            "Missing Galmuri11-Bold.ttf in .sprite-staging-actions/fonts/."
        )

    for key, fn in ACTION_SPRITES.items():
        save_grid(fn(), icons_dir / f"{key}.png")

    sheet_bold = build_preview_sheet(
        staging,
        "bold",
        "A — Galmuri11 Bold labels (preview only)",
        "_preview-buttons-bold.png",
    )
    sheet_ui = build_preview_sheet(
        staging,
        "ui",
        "B — UI font labels, pixel icons only (preview only)",
        "_preview-buttons-ui.png",
    )
    icons = build_icon_sheet(staging)
    html = build_preview_html(staging)

    print(f"Icons       -> {icons_dir}/")
    print(f"Bold sheet  -> {sheet_bold}")
    print(f"UI sheet    -> {sheet_ui}")
    print(f"Icon sheet  -> {icons}")
    print(f"HTML preview-> {html}")
    print(f"Open: file://{html.resolve()}")


if __name__ == "__main__":
    main()
