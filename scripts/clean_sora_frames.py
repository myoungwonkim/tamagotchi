#!/usr/bin/env python3
"""Re-prep sora action frames — close flood-punched shell highlights and install to game."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from prepare_staging_adult import (
    count_shell_highlight_holes,
    prepare,
)

RAW_DIR = ROOT / "assets/custom/sora-raw"
OUT_DIR = ROOT / "assets/custom"
GAME_DIR = ROOT / "assets/sprites/mermaid/adult"

GAME_TARGETS = {
    1: "fluffy-frame-1.png",
    2: "fluffy.png",
    3: "fluffy-frame-3.png",
}


def prepare_sora_frame(src: Path, dst: Path) -> None:
    result = prepare(
        Image.open(src).convert("RGBA"),
        strict_validation=True,
        defringe_output=False,
        repair_shell_holes=True,
    )
    holes = count_shell_highlight_holes(result)
    if holes:
        raise SystemExit(f"{dst.name}: {holes} shell hole(s) remain after prep")
    dst.parent.mkdir(parents=True, exist_ok=True)
    result.save(dst, "PNG")
    print(f"Saved {dst.relative_to(ROOT)} bbox={result.getbbox()} shell_holes={holes}")


def main() -> None:
    install = "--install" in sys.argv
    for concept in ("c",):
        for frame in (1, 2, 3):
            name = f"sora-act{concept}-{frame}.png"
            src = RAW_DIR / name
            if not src.exists():
                src = OUT_DIR / name
            prepare_sora_frame(src, OUT_DIR / name)
            if install:
                prepare_sora_frame(src, GAME_DIR / GAME_TARGETS[frame])


if __name__ == "__main__":
    main()
