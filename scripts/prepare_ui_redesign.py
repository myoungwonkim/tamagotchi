#!/usr/bin/env python3
"""Staging prep for UI icon REDESIGN drafts (sound-on/off, encyclopedia).

Differs from prepare_staging_ui.py in two ways the redesigns need:
  1. keep_largest_component is NOT used — these icons have detached parts
     (sound waves, red X / no-entry, bookmark ribbon, grid tiles) that must survive.
  2. A single larger square target box + higher fill, so icons read bigger on the
     tiny header buttons (the user's main complaint: "too small").

Output: assets/custom/{icon}-redesign-{n}.png (staging only).
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
TARGET = (24, 24, 232, 232)  # near-full square → bigger than legacy short bboxes
FILL = 0.95

ICONS = ("sound-on", "sound-off", "encyclopedia")
VARIANTS = (1, 2, 3)

sys.path.insert(0, str(ROOT / "scripts"))
from prepare_staging_adult import (  # noqa: E402
    defringe,
    flood_transparent,
    solidify_alpha,
)


def fit(im: Image.Image) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    cropped = im.crop(bbox)
    sw, sh = cropped.size
    rw = TARGET[2] - TARGET[0]
    rh = TARGET[3] - TARGET[1]
    scale = min((rw * FILL) / sw, (rh * FILL) / sh)
    nw, nh = max(1, round(sw * scale)), max(1, round(sh * scale))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    x = TARGET[0] + (rw - nw) // 2
    y = TARGET[1] + (rh - nh) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ok = 0
    for icon in ICONS:
        for n in VARIANTS:
            raw = RAW_DIR / f"ui-{icon}-{n}-raw.png"
            if not raw.exists():
                print(f"SKIP missing {raw}", file=sys.stderr)
                continue
            im = Image.open(raw).convert("RGBA")
            cut = flood_transparent(im)
            cut = solidify_alpha(cut)
            cut = defringe(cut)
            out = fit(cut)
            dst = OUT_DIR / f"{icon}-redesign-{n}.png"
            out.save(dst, "PNG")
            print(f"Saved {dst.name} bbox={out.getbbox()}")
            ok += 1
    print(f"Prepared {ok} UI redesign icons → {OUT_DIR}")


if __name__ == "__main__":
    main()
