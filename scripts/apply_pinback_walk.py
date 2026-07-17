#!/usr/bin/env python3
"""Apply pinback (grumpy mermaid) Action B walk as a 3-frame idle animation.

Unlike per-frame REF_BBOX fill (which jitters size), the 3 walk frames share ONE
uniform scale and a common feet baseline so the character stays the same size and
stays grounded across the cycle.

Output (mermaid theme):
  assets/sprites/mermaid/adult/grumpy-frame-1.png  <- actb-1 (contact)
  assets/sprites/mermaid/adult/grumpy.png          <- actb-2 (passing / rest)
  assets/sprites/mermaid/adult/grumpy-frame-3.png  <- actb-3 (opposite contact)
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = Path(
    "/Users/myoungwonkim/.cursor/projects/Users-myoungwonkim-Desktop-kaffeine-tamagotchi/assets"
)
OUT_DIR = ROOT / "assets" / "sprites" / "mermaid" / "adult"

CANVAS = 256
REF_BBOX = (27, 13, 229, 243)  # scruffy alignment box
HFILL = 0.98
VFILL = 0.95

# walk cycle order: frame-1 (contact) -> grumpy (passing/rest) -> frame-3 (contact)
FRAMES = [
    ("pinback-actb-1-raw.png", "grumpy-frame-1.png"),
    ("pinback-actb-2-raw.png", "grumpy.png"),
    ("pinback-actb-3-raw.png", "grumpy-frame-3.png"),
]

sys.path.insert(0, str(ROOT / "scripts"))
from prepare_staging_adult import (  # noqa: E402
    defringe,
    flood_transparent,
    solidify_alpha,
)


def clean(im: Image.Image) -> Image.Image:
    cut = flood_transparent(im)
    cut = solidify_alpha(cut)
    cut = defringe(cut)
    return cut


def main() -> None:
    cleaned = []
    for raw_name, _ in FRAMES:
        raw = RAW_DIR / raw_name
        im = clean(Image.open(raw).convert("RGBA"))
        box = im.getbbox()
        cleaned.append((im, box))

    max_w = max(b[2] - b[0] for _, b in cleaned)
    max_h = max(b[3] - b[1] for _, b in cleaned)

    ref_w = REF_BBOX[2] - REF_BBOX[0]
    ref_h = REF_BBOX[3] - REF_BBOX[1]
    scale = min((ref_w * HFILL) / max_w, (ref_h * VFILL) / max_h)

    center_x = (REF_BBOX[0] + REF_BBOX[2]) / 2
    baseline_y = REF_BBOX[3]  # feet grounded to REF bottom

    for (im, box), (_, out_name) in zip(cleaned, FRAMES):
        w, h = box[2] - box[0], box[3] - box[1]
        nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
        region = im.crop(box).resize((nw, nh), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
        x = round(center_x - nw / 2)
        y = round(baseline_y - nh)
        canvas.paste(region, (x, y), region)
        dst = OUT_DIR / out_name
        canvas.save(dst, "PNG")
        print(f"Saved {out_name} bbox={canvas.getbbox()} scale={scale:.3f}")


if __name__ == "__main__":
    main()
