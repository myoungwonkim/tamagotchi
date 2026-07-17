#!/usr/bin/env python3
"""Batch prep UI icon staging drafts."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = Path(
    "/Users/myoungwonkim/.cursor/projects/Users-myoungwonkim-Desktop-kaffeine-tamagotchi/assets"
)
OUT_DIR = ROOT / "assets" / "custom"
PREP = ROOT / "scripts" / "prepare_staging_ui.py"

ICONS = (
    "feed", "play", "clean", "sleep", "wake",
    "encyclopedia", "sound-on", "sound-off",
)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ok = 0
    for icon in ICONS:
        for n in (1, 2, 3):
            raw = RAW_DIR / f"ui-{icon}-{n}-raw.png"
            dst = OUT_DIR / f"ui-{icon}-{n}.png"
            if not raw.exists():
                print(f"SKIP missing {raw}", file=sys.stderr)
                continue
            cmd = [sys.executable, str(PREP), str(raw), str(dst), "--allow-white-loss"]
            subprocess.run(cmd, check=True)
            ok += 1
    print(f"Prepared {ok} UI staging sprites → {OUT_DIR}")


if __name__ == "__main__":
    main()
