#!/usr/bin/env python3
"""Build Google Play store listing assets into assets/play-store/.

Play specs: no alpha on icon/feature graphic; 1024×500 feature;
1080×1920 phone screenshots from the Play UI (?play=1), not AIT revive CTAs.
"""

from __future__ import annotations

import subprocess
import sys
import time
import urllib.request
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

PORT = 8766
BASE_URL = f"http://127.0.0.1:{PORT}"
PHONE_W, PHONE_H = 1080, 1920

CAPTURES = [
    ("main", "screenshot-phone-01-main.png"),
    ("evolution", "screenshot-phone-02-evolution.png"),
    ("encyclopedia", "screenshot-phone-03-encyclopedia.png"),
    ("gameover", "screenshot-phone-04-gameover.png"),
]

AIT_FALLBACK = [
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
    out = Image.new("RGB", (512, 512), BG)
    out.paste(img, (0, 0))
    out.save(OUT / "icon-512.png", "PNG")
    print(f"wrote icon-512.png from {src.name}")


def make_feature_1024x500() -> None:
    out_path = OUT / "feature-graphic-1024x500.png"
    if AIT_BANNER.exists():
        src = flatten_rgb(Image.open(AIT_BANNER), BG)
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

    canvas = Image.new("RGB", (1024, 500), BG)
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((0, 0, 1024, 500), fill=BG)
    draw.text((48, 200), "어비스펫: 심해 가상 펫", fill=BRAND, font=font(48))
    draw.text((48, 270), "Abyss Pet", fill=TEXT, font=font(28))
    canvas.save(out_path, "PNG")
    print("wrote feature-graphic-1024x500.png (fallback)")


def upscale_ait_fallback() -> None:
    for src_name, dest_name in AIT_FALLBACK:
        src_path = AIT / src_name
        if not src_path.exists():
            print(f"skip missing {src_name}", file=sys.stderr)
            continue
        src = flatten_rgb(Image.open(src_path), BG)
        scale = max(PHONE_W / src.width, PHONE_H / src.height)
        nw, nh = int(src.width * scale), int(src.height * scale)
        resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
        left = (nw - PHONE_W) // 2
        top = max(0, (nh - PHONE_H) // 2 - int(nh * 0.02))
        cropped = resized.crop((left, top, left + PHONE_W, top + PHONE_H))
        if cropped.size != (PHONE_W, PHONE_H):
            canvas = Image.new("RGB", (PHONE_W, PHONE_H), BG)
            canvas.paste(cropped, ((PHONE_W - cropped.width) // 2, (PHONE_H - cropped.height) // 2))
            cropped = canvas
        cropped.save(OUT / dest_name, "PNG")
        print(f"wrote {dest_name} (AIT fallback — not Play UI)")


def wait_server(timeout: float = 40.0) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"{BASE_URL}/", timeout=1) as resp:
                if resp.status == 200:
                    return
        except Exception:
            time.sleep(0.3)
    raise RuntimeError("Vite did not start in time")


def capture_play_phone_shots() -> None:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright"])
        subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
        from playwright.sync_api import sync_playwright

    log_path = Path("/tmp/abysspet-vite-capture.log")
    vite = subprocess.Popen(
        ["npx", "vite", "--port", str(PORT), "--strictPort", "--host", "127.0.0.1"],
        cwd=ROOT,
        stdout=log_path.open("w"),
        stderr=subprocess.STDOUT,
    )
    try:
        wait_server()
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for scene, filename in CAPTURES:
                context = browser.new_context(
                    viewport={"width": PHONE_W, "height": PHONE_H},
                    device_scale_factor=1,
                )
                page = context.new_page()
                url = f"{BASE_URL}/?play=1&capture={scene}"
                errors = []
                page.on("pageerror", lambda e: errors.append(str(e)))
                page.goto(url, wait_until="domcontentloaded")
                try:
                    page.wait_for_function("window.__STORE_CAPTURE_READY__ === true", timeout=30000)
                except Exception:
                    print("CAPTURE DEBUG scene", scene, "url", url, file=sys.stderr)
                    print("errors", errors, file=sys.stderr)
                    print("ready", page.evaluate("() => window.__STORE_CAPTURE_READY__"), file=sys.stderr)
                    print(page.content()[:800], file=sys.stderr)
                    raise
                page.wait_for_timeout(900)
                if scene == "encyclopedia":
                    page.wait_for_selector("#encyclopedia-overlay:not([hidden])", timeout=10000)
                if scene == "gameover":
                    page.wait_for_selector("#game-over-overlay:not([hidden])", timeout=10000)
                    revive = page.locator("#btn-revive-ad")
                    if revive.count() and revive.is_visible():
                        raise RuntimeError("Play capture still shows revive — abort")
                path = OUT / filename
                page.screenshot(path=str(path), type="png", full_page=False)
                context.close()
                with Image.open(path) as im:
                    rgb = im.convert("RGB")
                    if rgb.size != (PHONE_W, PHONE_H):
                        rgb = rgb.resize((PHONE_W, PHONE_H), Image.Resampling.NEAREST)
                    rgb.save(path, "PNG")
                print(f"capture {filename} {PHONE_W}x{PHONE_H} play=1 {scene}")
            browser.close()
    finally:
        vite.terminate()
        try:
            vite.wait(timeout=8)
        except subprocess.TimeoutExpired:
            vite.kill()


def main() -> None:
    skip_capture = "--skip-capture" in sys.argv
    OUT.mkdir(parents=True, exist_ok=True)
    make_icon_512()
    make_feature_1024x500()
    if skip_capture:
        upscale_ait_fallback()
    else:
        try:
            capture_play_phone_shots()
        except Exception as err:
            print(f"Play capture failed ({err}); not replacing shots with AIT revive UI", file=sys.stderr)
            raise
    print(f"Play store assets → {OUT}")


if __name__ == "__main__":
    main()
