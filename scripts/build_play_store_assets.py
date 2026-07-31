#!/usr/bin/env python3
"""Build Google Play store listing assets into assets/play-store/.

Play specs differ from AIT (no alpha on icon/feature graphic; 1024×500 feature;
preferred 1080×1920 phone screenshots). Sources: existing captures / app icon.
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
AIT = ROOT / "assets" / "ait-store"
OUT = ROOT / "assets" / "play-store"
APP_ICON = ROOT / "assets" / "app-icon" / "icon-512.png"
AIT_ICON = AIT / "app-icon-600x600.png"
AIT_BANNER = AIT / "thumbnail-1932x828.png"
FONT_KO = "/System/Library/Fonts/Supplemental/AppleGothic.ttf"

BG = (10, 32, 40)
BRAND = (88, 184, 200)
TEXT = (216, 228, 236)

SHOTS = [
    ("screenshot-portrait-01-main.png", "screenshot-phone-01-main.png"),
    ("screenshot-portrait-02-evolution.png", "screenshot-phone-02-evolution.png"),
    ("screenshot-portrait-03-encyclopedia.png", "screenshot-phone-03-encyclopedia.png"),
    ("screenshot-portrait-04-gameover.png", "screenshot-phone-04-gameover.png"),
]


def font(size: int):
    try:
        return ImageFont.truetype(FONT_KO, size)
    except OSError:
        return ImageFont.load_default()


def flatten_rgb(img: Image.Image, bg=(10, 32, 40)) -> Image.Image:
    rgba = img.convert("RGBA")
    base = Image.new("RGB", rgba.size, bg)
    base.paste(rgba, mask=rgba.split()[3])
    return base


def make_icon_512() -> None:
    src = APP_ICON if APP_ICON.exists() else AIT_ICON
    if not src.exists():
        raise SystemExit(f"Missing icon source: {src}")
    img = flatten_rgb(Image.open(src), BG)
    img = img.resize((512, 512), Image.Resampling.LANCZOS)
    # Ensure no alpha
    out = Image.new("RGB", (512, 512), BG)
    out.paste(img, (0, 0))
    out.save(OUT / "icon-512.png", "PNG")
    print(f"wrote icon-512.png from {src.name}")


def make_feature_1024x500() -> None:
    out_path = OUT / "feature-graphic-1024x500.png"
    if AIT_BANNER.exists():
        src = flatten_rgb(Image.open(AIT_BANNER), BG)
        # Cover-crop to 1024×500
        tw, th = 1024, 500
        scale = max(tw / src.width, th / src.height)
        nw, nh = int(src.width * scale), int(src.height * scale)
        resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
        left = (nw - tw) // 2
        top = (nh - th) // 2
        cropped = resized.crop((left, top, left + tw, top + th))
        cropped.save(out_path, "PNG")
        print("wrote feature-graphic-1024x500.png from AIT banner")
        return

    # Fallback: solid brand panel
    canvas = Image.new("RGB", (1024, 500), BG)
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((0, 0, 1024, 500), fill=BG)
    draw.text((48, 200), "어비스펫: 심해 가상 펫", fill=BRAND, font=font(48))
    draw.text((48, 270), "Abyss Pet", fill=TEXT, font=font(28))
    canvas.save(out_path, "PNG")
    print("wrote feature-graphic-1024x500.png (fallback)")


def make_phone_shots() -> None:
    tw, th = 1080, 1920
    for src_name, dest_name in SHOTS:
        src_path = AIT / src_name
        if not src_path.exists():
            print(f"skip missing {src_name}", file=sys.stderr)
            continue
        src = flatten_rgb(Image.open(src_path), BG)
        scale = max(tw / src.width, th / src.height)
        nw, nh = int(src.width * scale), int(src.height * scale)
        resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
        left = (nw - tw) // 2
        top = max(0, (nh - th) // 2 - int(nh * 0.02))
        cropped = resized.crop((left, top, left + tw, top + th))
        if cropped.size != (tw, th):
            canvas = Image.new("RGB", (tw, th), BG)
            canvas.paste(cropped, ((tw - cropped.width) // 2, (th - cropped.height) // 2))
            cropped = canvas
        cropped.save(OUT / dest_name, "PNG")
        print(f"wrote {dest_name}")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    make_icon_512()
    make_feature_1024x500()
    make_phone_shots()
    print(f"Play store assets → {OUT}")


if __name__ == "__main__":
    main()
