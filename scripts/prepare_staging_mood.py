#!/usr/bin/env python3
"""Mood icon sprite staging prep.

GenerateImage 256px → outline-protected flood → fit to game mood REF_BBOX.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CANVAS = 256
FILL = 0.92
MOOD_REF_BBOX = (24, 24, 240, 240)

sys.path.insert(0, str(ROOT / "scripts"))
from prepare_staging_adult import (  # noqa: E402
    close_interior_holes,
    defringe,
    flood_transparent,
    keep_largest_component,
    solidify_alpha,
    validate_after_flood,
    validate_final_output,
)


def fit_to_mood_bbox(im: Image.Image) -> Image.Image:
    ref = MOOD_REF_BBOX
    bbox = im.getbbox()
    if not bbox:
        return Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))

    cropped = im.crop(bbox)
    sw, sh = cropped.size
    rw = ref[2] - ref[0]
    rh = ref[3] - ref[1]
    scale = min((rw * FILL) / sw, (rh * FILL) / sh)
    nw = max(1, int(sw * scale))
    nh = max(1, int(sh * scale))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    x = ref[0] + (rw - nw) // 2
    y = ref[1] + (rh - nh) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas


def prepare_mood(im: Image.Image, *, strict_validation: bool) -> Image.Image:
    flooded = flood_transparent(im)
    validate_after_flood(im, flooded, strict=strict_validation)
    cut = keep_largest_component(flooded)
    cut = solidify_alpha(cut)
    cut = defringe(cut)
    result = fit_to_mood_bbox(cut)
    result = close_interior_holes(result)
    validate_final_output(im, result, strict=strict_validation)
    return result


def parse_mood(path: Path) -> str:
    m = re.search(r"mood-mini-(happy|neutral|sad|sleep|sick)-", path.name)
    if not m:
        raise ValueError(f"Cannot infer mood from filename: {path.name}")
    return m.group(1)


def main() -> None:
    parser = argparse.ArgumentParser(description="Mood icon staging prep")
    parser.add_argument("input", type=Path, help="Generated PNG")
    parser.add_argument("output", type=Path, nargs="?", help="Output path")
    parser.add_argument(
        "--allow-white-loss",
        action="store_true",
        help="Do not exit on >30%% near-white loss",
    )
    args = parser.parse_args()

    src = args.input if args.input.is_absolute() else ROOT / args.input
    if not src.exists():
        raise SystemExit(f"Missing source: {src}")

    out = args.output
    dst = src if out is None else (out if out.is_absolute() else ROOT / out)

    result = prepare_mood(
        Image.open(src).convert("RGBA"),
        strict_validation=not args.allow_white_loss,
    )
    dst.parent.mkdir(parents=True, exist_ok=True)
    result.save(dst, "PNG")
    print(f"Saved {dst} mood={parse_mood(src)} bbox={result.getbbox()}")


if __name__ == "__main__":
    main()
