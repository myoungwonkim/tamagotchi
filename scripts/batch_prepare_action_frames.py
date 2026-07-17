#!/usr/bin/env python3
"""Batch prep action animation frames (A/B/C) — staging only.

Per action, all 3 frames share one union bbox and a single uniform scale/offset so
the animation registers cleanly. keep_largest_component is intentionally NOT used
(bounce sparkles, sleep Z's, feed crumbs are separate islands that must survive).
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = Path(
    "/Users/myoungwonkim/.cursor/projects/Users-myoungwonkim-Desktop-kaffeine-tamagotchi/assets"
)
OUT_DIR = ROOT / "assets" / "custom"

CANVAS = 256
# Common target box (motion room); shared by all actions for consistent icon scale.
TARGET = (40, 40, 216, 216)
FILL = 0.9

ACTIONS = ("feed", "play", "clean", "sleep", "wake")
FRAMES = ("a", "b", "c")

sys.path.insert(0, str(ROOT / "scripts"))
from prepare_staging_adult import (  # noqa: E402
    defringe,
    flood_transparent,
    solidify_alpha,
)


def clean_frame(im: Image.Image) -> Image.Image:
    cut = flood_transparent(im)
    cut = solidify_alpha(cut)
    cut = defringe(cut)
    return cut


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ok = 0
    for action in ACTIONS:
        cleaned: dict[str, Image.Image] = {}
        for f in FRAMES:
            raw = RAW_DIR / f"ui-anim-{action}-{f}-raw.png"
            if not raw.exists():
                print(f"SKIP missing {raw}", file=sys.stderr)
                continue
            cleaned[f] = clean_frame(Image.open(raw).convert("RGBA"))
        if not cleaned:
            continue

        # Union content bbox across the action's frames.
        boxes = [im.getbbox() for im in cleaned.values() if im.getbbox()]
        ux0 = min(b[0] for b in boxes)
        uy0 = min(b[1] for b in boxes)
        ux1 = max(b[2] for b in boxes)
        uy1 = max(b[3] for b in boxes)
        uw, uh = ux1 - ux0, uy1 - uy0

        tw = TARGET[2] - TARGET[0]
        th = TARGET[3] - TARGET[1]
        scale = min((tw * FILL) / uw, (th * FILL) / uh)
        nw, nh = max(1, round(uw * scale)), max(1, round(uh * scale))
        off_x = TARGET[0] + (tw - nw) // 2
        off_y = TARGET[1] + (th - nh) // 2

        for f, im in cleaned.items():
            region = im.crop((ux0, uy0, ux1, uy1))
            region = region.resize((nw, nh), Image.Resampling.LANCZOS)
            canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
            canvas.paste(region, (off_x, off_y), region)
            dst = OUT_DIR / f"ui-anim-{action}-{f}.png"
            canvas.save(dst, "PNG")
            print(f"Saved {dst.name} bbox={canvas.getbbox()}")
            ok += 1

    print(f"Prepared {ok} action frame sprites → {OUT_DIR}")


if __name__ == "__main__":
    main()
