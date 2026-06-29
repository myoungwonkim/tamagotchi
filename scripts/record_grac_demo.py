#!/usr/bin/env python3
"""Record a GRAC review demo video with full gameplay automation."""

from __future__ import annotations

import shutil
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "grac-submission"
RAW_DIR = OUT / "_video_raw"
PORT = 8777
BASE_URL = f"http://127.0.0.1:{PORT}"
OUTPUT_NAME = "abysspet-grac-demo.webm"

# Automated demo: growth, care actions, encyclopedia, sleep, game over, mock revive ad
DEMO_URL = f"{BASE_URL}/index.html?gracDemo=1&toss=1&mockAds=1"
DEMO_TIMEOUT_MS = 120_000


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


def convert_to_mp4(webm: Path, mp4: Path) -> bool:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        return False
    subprocess.run(
        [ffmpeg, "-y", "-i", str(webm), "-c:v", "libx264", "-pix_fmt", "yuv420p", str(mp4)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return True


def record() -> Path:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright"])
        subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
        from playwright.sync_api import sync_playwright

    OUT.mkdir(parents=True, exist_ok=True)
    if RAW_DIR.exists():
        shutil.rmtree(RAW_DIR)
    RAW_DIR.mkdir(parents=True)

    viewport_w, viewport_h = 390, 844

    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(
            viewport={"width": viewport_w, "height": viewport_h},
            device_scale_factor=2,
            record_video_dir=str(RAW_DIR),
            record_video_size={"width": viewport_w, "height": viewport_h},
        )
        page = context.new_page()

        page.goto(DEMO_URL, wait_until="networkidle")
        page.wait_for_function("window.__GRAC_DEMO_STARTED__ === true", timeout=20000)
        page.wait_for_function(
            "window.__GRAC_DEMO_DONE__ === true",
            timeout=DEMO_TIMEOUT_MS,
        )
        page.wait_for_timeout(800)

        page.close()
        context.close()
        browser.close()

    webm_files = sorted(RAW_DIR.glob("*.webm"), key=lambda p: p.stat().st_mtime)
    if not webm_files:
        raise RuntimeError("No Playwright video file was created")

    dest = OUT / OUTPUT_NAME
    shutil.copy2(webm_files[-1], dest)
    print(f"recorded {dest} ({dest.stat().st_size // 1024} KiB)")

    mp4 = OUT / "abysspet-grac-demo.mp4"
    if convert_to_mp4(dest, mp4):
        print(f"converted {mp4} ({mp4.stat().st_size // 1024} KiB)")
    else:
        print(
            "ffmpeg not found — submit .webm or convert manually:\n"
            "  ffmpeg -i abysspet-grac-demo.webm -c:v libx264 -pix_fmt yuv420p abysspet-grac-demo.mp4"
        )

    return dest


def main() -> None:
    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        wait_server()
        record()
    finally:
        server.terminate()
        server.wait(timeout=5)
        if RAW_DIR.exists():
            shutil.rmtree(RAW_DIR, ignore_errors=True)
    print("done")


if __name__ == "__main__":
    main()
