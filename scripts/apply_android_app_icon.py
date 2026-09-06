#!/usr/bin/env python3
"""Generate Android launcher + splash assets from assets/app-icon."""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
RES = ROOT / "android/app/src/main/res"
SRC = ROOT / "assets/app-icon/icon-512.png"
MASKABLE = ROOT / "assets/app-icon/icon-512-maskable.png"
BG = (10, 32, 40, 255)

LAUNCHER = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}
FOREGROUND = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}
SPLASH = {
    "drawable": (480, 320),
    "drawable-port-mdpi": (320, 480),
    "drawable-port-hdpi": (480, 800),
    "drawable-port-xhdpi": (720, 1280),
    "drawable-port-xxhdpi": (960, 1600),
    "drawable-port-xxxhdpi": (1280, 1920),
    "drawable-land-mdpi": (480, 320),
    "drawable-land-hdpi": (800, 480),
    "drawable-land-xhdpi": (1280, 720),
    "drawable-land-xxhdpi": (1600, 960),
    "drawable-land-xxxhdpi": (1920, 1280),
}


def scale(im, size):
    return im.resize((size, size), Image.Resampling.LANCZOS)


def circle_mask(im):
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0, im.size[0] - 1, im.size[1] - 1), fill=255)
    out.paste(im, (0, 0), mask)
    return out


def splash(icon, size):
    w, h = size
    canvas = Image.new("RGBA", (w, h), BG)
    side = max(64, int(min(w, h) * 0.42))
    mark = scale(icon, side)
    canvas.paste(mark, ((w - side) // 2, (h - side) // 2), mark)
    return canvas.convert("RGB")


def main():
    icon = Image.open(SRC).convert("RGBA")
    maskable = Image.open(MASKABLE).convert("RGBA")

    for folder, size in LAUNCHER.items():
        dest = RES / folder
        dest.mkdir(parents=True, exist_ok=True)
        full = scale(icon, size)
        full.save(dest / "ic_launcher.png", "PNG")
        circle_mask(full).save(dest / "ic_launcher_round.png", "PNG")

    for folder, size in FOREGROUND.items():
        dest = RES / folder
        dest.mkdir(parents=True, exist_ok=True)
        scale(maskable, size).save(dest / "ic_launcher_foreground.png", "PNG")

    icon_xxx = scale(icon, 288)
    (RES / "drawable-xxxhdpi").mkdir(parents=True, exist_ok=True)
    icon_xxx.save(RES / "drawable-xxxhdpi/splash_icon.png", "PNG")

    for folder, size in SPLASH.items():
        dest = RES / folder
        dest.mkdir(parents=True, exist_ok=True)
        splash(icon, size).save(dest / "splash.png", "PNG")

    print("wrote launcher + splash from", SRC.name)


if __name__ == "__main__":
    main()
