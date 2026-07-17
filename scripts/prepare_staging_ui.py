#!/usr/bin/env python3
"""UI icon sprite staging prep."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CANVAS = 256
FILL = 0.92

ICON_REF_BBOX: dict[str, tuple[int, int, int, int]] = {
    "feed": (64, 48, 200, 216),
    "play": (56, 56, 208, 208),
    "clean": (48, 40, 200, 240),
    "sleep": (48, 72, 168, 200),
    "wake": (40, 40, 224, 224),
    "encyclopedia": (64, 40, 200, 216),
    "sound-on": (40, 80, 216, 184),
    "sound-off": (40, 72, 232, 192),
    "heart-broken": (32, 72, 232, 192),
}

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


def fit_to_icon_bbox(im: Image.Image, icon: str) -> Image.Image:
    ref = ICON_REF_BBOX[icon]
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


def parse_icon(path: Path) -> str:
    m = re.search(
        r"ui-(feed|play|clean|sleep|wake|encyclopedia|sound-on|sound-off|heartbroken)-",
        path.name,
    )
    if m and m.group(1) == "heartbroken":
        return "heart-broken"
    if not m:
        raise ValueError(f"Cannot infer icon from filename: {path.name}")
    return m.group(1)


def prepare_ui(im: Image.Image, icon: str, *, strict_validation: bool) -> Image.Image:
    flooded = flood_transparent(im)
    validate_after_flood(im, flooded, strict=strict_validation)
    cut = keep_largest_component(flooded)
    cut = solidify_alpha(cut)
    cut = defringe(cut)
    result = fit_to_icon_bbox(cut, icon)
    result = close_interior_holes(result)
    validate_final_output(im, result, strict=strict_validation)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="UI icon staging prep")
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path, nargs="?")
    parser.add_argument("--allow-white-loss", action="store_true")
    args = parser.parse_args()

    src = args.input if args.input.is_absolute() else ROOT / args.input
    if not src.exists():
        raise SystemExit(f"Missing source: {src}")

    icon = parse_icon(src)
    dst = src if args.output is None else (
        args.output if args.output.is_absolute() else ROOT / args.output
    )

    result = prepare_ui(
        Image.open(src).convert("RGBA"),
        icon,
        strict_validation=not args.allow_white_loss,
    )
    dst.parent.mkdir(parents=True, exist_ok=True)
    result.save(dst, "PNG")
    print(f"Saved {dst} icon={icon} bbox={result.getbbox()}")


if __name__ == "__main__":
    main()
