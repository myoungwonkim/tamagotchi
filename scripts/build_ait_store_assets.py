#!/usr/bin/env python3
"""Capture real game screenshots and build Apps in Toss store assets."""

from __future__ import annotations

import math
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "ait-store"
SPRITES = ROOT / "assets" / "sprites"
PORT = 8765
BASE_URL = f"http://127.0.0.1:{PORT}"

BG = (26, 40, 56)
BRAND = (88, 184, 200)
BRAND_DEEP = (42, 152, 168)      # logo light — higher contrast than #58b8c8
BRAND_DEEPER = (30, 104, 120)    # logo light gradient edge
BRAND_DARK_BG = (26, 40, 56)
ACCENT_GLOW = (120, 210, 225)
TEXT = (216, 228, 236)
TEXT_MUTED = (180, 200, 210)
PET_VIEWPORT_INNER = (42, 80, 104)
PET_VIEWPORT_OUTER = (20, 32, 48)
BAR_HUNGER = (200, 136, 72)
BAR_HAPPY = (104, 168, 184)
BAR_CLEAN = (72, 160, 192)
BAR_HEALTH = (104, 168, 120)
BAR_TRACK = (20, 28, 40)
BORDER = (74, 104, 120)
FONT_KO = "/System/Library/Fonts/Supplemental/AppleGothic.ttf"

LOGO_SAFE = 480          # circular safe zone diameter in 600×600
LOGO_PET_SIZE = 420        # ~87% of safe zone

CAPTURES = [
    ("main", 636, 1048, "screenshot-portrait-01-main.png"),
    ("evolution", 636, 1048, "screenshot-portrait-02-evolution.png"),
    ("encyclopedia", 636, 1048, "screenshot-portrait-03-encyclopedia.png"),
    ("thumbnail", 636, 1048, "capture-portrait-thumbnail.png"),
]

# 가로형 썸네일 — wide layout CSS, direct 1932×828 capture (no letterbox crop)
LANDSCAPE_CAPTURES = [
    ("thumbnail", 1932, 828, "thumbnail-1932x828.png"),
]


def font(size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(FONT_KO, size)
    except OSError:
        return ImageFont.load_default()


def load_sprite(rel: str, size: int) -> Image.Image:
    return Image.open(SPRITES / rel).convert("RGBA").resize((size, size), Image.NEAREST)


def paste_center(base: Image.Image, sprite: Image.Image, cx: int, cy: int) -> None:
    base.paste(sprite, (cx - sprite.width // 2, cy - sprite.height // 2), sprite)


def radial_bg(size: tuple[int, int], inner: tuple[int, int, int], outer: tuple[int, int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size, outer)
    px = img.load()
    cx, cy = w / 2, h / 2
    max_r = math.hypot(cx, cy)
    for y in range(h):
        for x in range(w):
            t = min(1.0, math.hypot(x - cx, y - cy) / max_r)
            r = int(inner[0] + (outer[0] - inner[0]) * t)
            g = int(inner[1] + (outer[1] - inner[1]) * t)
            b = int(inner[2] + (outer[2] - inner[2]) * t)
            px[x, y] = (r, g, b)
    return img


def brighten_rgba(img: Image.Image, factor: float = 1.12) -> Image.Image:
    r, g, b, a = img.split()
    return Image.merge(
        "RGBA",
        (
            r.point(lambda v: min(255, int(v * factor))),
            g.point(lambda v: min(255, int(v * factor))),
            b.point(lambda v: min(255, int(v * factor))),
            a,
        ),
    )


def draw_bubbles(draw: ImageDraw.ImageDraw, w: int, h: int, seed: int = 0) -> None:
    import random

    rng = random.Random(seed)
    for _ in range(14):
        bx = rng.randint(0, w)
        by = rng.randint(0, h)
        br = rng.randint(6, 28)
        draw.ellipse((bx - br, by - br, bx + br, by + br), outline=(ACCENT_GLOW[0], ACCENT_GLOW[1], ACCENT_GLOW[2], 35))


def draw_pet_glow(base: Image.Image, cx: int, cy: int, radius: int, color: tuple[int, int, int]) -> None:
    glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    for i in range(6, 0, -1):
        alpha = 18 + i * 8
        r = radius + i * 10
        gdraw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*color, alpha))
    base.paste(glow, (0, 0), glow)


def make_logo_light() -> Image.Image:
    img = radial_bg((600, 600), BRAND_DEEP, BRAND_DEEPER)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_bubbles(draw, 600, 600, seed=7)
    cx, cy = 300, 302
    draw_pet_glow(img, cx, cy, 200, ACCENT_GLOW)
    pet = load_sprite("adult/golden.png", LOGO_PET_SIZE)
    paste_center(img, pet, cx, cy)
    return img


def make_logo_dark() -> Image.Image:
    img = radial_bg((600, 600), (34, 58, 78), (14, 22, 32))
    draw = ImageDraw.Draw(img, "RGBA")
    draw_bubbles(draw, 600, 600, seed=11)
    cx, cy = 300, 302
    draw_pet_glow(img, cx, cy, 210, (90, 180, 200))
    pet = brighten_rgba(load_sprite("adult/golden.png", LOGO_PET_SIZE), 1.15)
    paste_center(img, pet, cx, cy)
    return img


def cover_resize(img: Image.Image, tw: int, th: int, *, focal_y: float = 0.5) -> Image.Image:
    """Scale and crop to fill target (object-fit: cover) with a vertical focal point."""
    sw, sh = img.size
    scale = max(tw / sw, th / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    scaled = img.resize((nw, nh), Image.LANCZOS)
    left = (nw - tw) // 2
    focal = max(0.0, min(1.0, focal_y))
    fy = int(sh * focal * scale)
    top = max(0, min(nh - th, fy - th // 2))
    return scaled.crop((left, top, left + tw, top + th))


def polish_thumbnail(img: Image.Image) -> Image.Image:
    img = ImageEnhance.Brightness(img).enhance(1.07)
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img = ImageEnhance.Color(img).enhance(1.08)
    return img


def crop_gameplay_strip(portrait: Image.Image, *, top_ratio: float, bottom_ratio: float) -> Image.Image:
    w, h = portrait.size
    return portrait.crop((0, int(h * top_ratio), w, int(h * bottom_ratio)))


def make_thumbnail_horizontal_from_portrait(portrait: Image.Image) -> Image.Image:
    """Full-bleed gameplay crop — pets, stats, and action buttons."""
    strip = crop_gameplay_strip(portrait, top_ratio=0.06, bottom_ratio=0.97)
    out = cover_resize(strip, 1932, 828, focal_y=0.54)
    return polish_thumbnail(out)


def make_thumbnail_square_from_portrait(portrait: Image.Image) -> Image.Image:
    """Square thumbnail — viewport + stats from gameplay capture."""
    strip = crop_gameplay_strip(portrait, top_ratio=0.08, bottom_ratio=0.78)
    out = cover_resize(strip, 1000, 1000, focal_y=0.48)
    return polish_thumbnail(out)


def draw_stat_bars(draw: ImageDraw.ImageDraw, x: int, y: int, w: int) -> None:
    bars = [("배고픔", 82, BAR_HUNGER), ("행복", 91, BAR_HAPPY), ("청결", 74, BAR_CLEAN)]
    row_h = 28
    for i, (label, value, color) in enumerate(bars):
        by = y + i * row_h
        draw.text((x, by), label, fill=TEXT_MUTED, font=font(18))
        bx = x + 72
        bw = w - 120
        draw.rounded_rectangle((bx, by + 4, bx + bw, by + 16), radius=4, fill=BAR_TRACK)
        fill_w = max(6, int(bw * value / 100))
        draw.rounded_rectangle((bx, by + 4, bx + fill_w, by + 16), radius=4, fill=color)
        draw.text((bx + bw + 10, by), str(value), fill=TEXT, font=font(18))


def make_thumbnail_square() -> Image.Image:
    """Pet close-up + stat bars hint (not a logo duplicate)."""
    size = 1000
    img = radial_bg((size, size), (48, 88, 112), PET_VIEWPORT_OUTER)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_bubbles(draw, size, size, seed=19)

    cx = size // 2
    cy = int(size * 0.42)
    draw_pet_glow(img, cx, cy, 300, ACCENT_GLOW)
    pet = load_sprite("adult/golden.png", 680)
    mood = load_sprite("mood/happy.png", 140)
    paste_center(img, pet, cx, cy + 30)
    paste_center(img, mood, cx + 270, cy - 100)

    # Pet viewport frame hint
    draw = ImageDraw.Draw(img)
    frame_margin = 80
    frame_top = 120
    frame_bottom = int(size * 0.72)
    draw.rounded_rectangle(
        (frame_margin, frame_top, size - frame_margin, frame_bottom),
        radius=16,
        outline=BORDER,
        width=3,
    )

    draw_stat_bars(draw, 100, int(size * 0.76), size - 200)
    return polish_thumbnail(img.convert("RGB"))


def build_marketing_thumbnails() -> None:
    thumb_path = OUT / "thumbnail-1932x828.png"
    if not thumb_path.exists():
        portrait_path = OUT / "capture-portrait-thumbnail.png"
        if portrait_path.exists():
            portrait = Image.open(portrait_path).convert("RGB")
            make_thumbnail_horizontal_from_portrait(portrait).save(thumb_path, "PNG")
        print("build thumbnail-1932x828.png 1932x828 (crop fallback)")
    else:
        polish_thumbnail(Image.open(thumb_path).convert("RGB")).save(thumb_path, "PNG")
        print("build thumbnail-1932x828.png 1932x828 (direct capture)")

    portrait_path = OUT / "capture-portrait-thumbnail.png"
    if portrait_path.exists():
        square = make_thumbnail_square_from_portrait(Image.open(portrait_path).convert("RGB"))
    else:
        square = make_thumbnail_square()

    square.save(OUT / "thumbnail-1000x1000.png", "PNG")
    print("build thumbnail-1000x1000.png 1000x1000 (gameplay capture)")

    drafts = ROOT / "assets" / "ait-store" / "drafts-simple"
    drafts.mkdir(parents=True, exist_ok=True)
    Image.open(thumb_path).save(drafts / "draft-01-compliant.png", "PNG")
    print("build drafts-simple/draft-01-compliant.png")


def build_landscape_screenshot() -> None:
    """Landscape screenshot — crop from horizontal thumbnail."""
    src = OUT / "thumbnail-1932x828.png"
    if not src.exists():
        return
    img = Image.open(src).convert("RGB")
    target_w, target_h = 1504, 741
    scale = target_h / img.height
    scaled = img.resize((int(img.width * scale), target_h), Image.LANCZOS)
    if scaled.width >= target_w:
        left = (scaled.width - target_w) // 2
        out = scaled.crop((left, 0, left + target_w, target_h))
    else:
        out = Image.new("RGB", (target_w, target_h), BG)
        out.paste(scaled, ((target_w - scaled.width) // 2, 0))
    out.save(OUT / "screenshot-landscape-01.png", "PNG")
    print(f"build screenshot-landscape-01.png {target_w}x{target_h}")


def wait_server(timeout: float = 20.0) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"{BASE_URL}/index.html", timeout=1) as resp:
                if resp.status == 200:
                    return
        except Exception:
            time.sleep(0.2)
    raise RuntimeError("Local server did not start in time")


def capture_with_playwright() -> None:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright"])
        subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
        from playwright.sync_api import sync_playwright

    OUT.mkdir(parents=True, exist_ok=True)

    def run_capture(browser, scene: str, width: int, height: int, filename: str) -> None:
        context = browser.new_context(
            viewport={"width": width, "height": height},
            device_scale_factor=2,
        )
        page = context.new_page()
        url = f"{BASE_URL}/index.html?capture={scene}"
        page.goto(url, wait_until="networkidle")
        page.wait_for_function("window.__STORE_CAPTURE_READY__ === true", timeout=15000)
        page.wait_for_timeout(800)
        if scene == "encyclopedia":
            page.wait_for_selector("#encyclopedia-overlay:not([hidden])", timeout=10000)
        path = OUT / filename
        page.screenshot(path=str(path), type="png", full_page=False)
        context.close()
        with Image.open(path) as im:
            if im.size != (width, height):
                im.convert("RGB").resize((width, height), Image.LANCZOS).save(path, "PNG")
        print(f"capture {filename} {width}x{height}")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        for scene, width, height, filename in CAPTURES:
            run_capture(browser, scene, width, height, filename)
        for scene, width, height, filename in LANDSCAPE_CAPTURES:
            run_capture(browser, scene, width, height, filename)
        browser.close()


def save_logo(img: Image.Image, name: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(OUT / name, "PNG")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    save_logo(make_logo_light(), "app-logo-light.png")
    save_logo(make_logo_dark(), "app-logo-dark.png")
    print("logo app-logo-light.png 600x600")
    print("logo app-logo-dark.png 600x600")

    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        wait_server()
        capture_with_playwright()
    finally:
        server.terminate()
        server.wait(timeout=5)

    build_marketing_thumbnails()
    build_landscape_screenshot()
    print("done")


if __name__ == "__main__":
    main()
