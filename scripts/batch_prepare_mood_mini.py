#!/usr/bin/env python3
"""Batch prep mini mood icon staging drafts."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = Path(
    "/Users/myoungwonkim/.cursor/projects/Users-myoungwonkim-Desktop-kaffeine-tamagotchi/assets"
)
OUT_DIR = ROOT / "assets" / "custom"
PREP = ROOT / "scripts" / "prepare_staging_mood.py"

MOODS = ("happy", "neutral", "sad", "sleep", "sick")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ok = 0
    for mood in MOODS:
        for n in (1, 2, 3):
            raw = RAW_DIR / f"mood-mini-{mood}-{n}-raw.png"
            dst = OUT_DIR / f"mood-mini-{mood}-{n}.png"
            if not raw.exists():
                print(f"SKIP missing {raw}", file=sys.stderr)
                continue
            cmd = [sys.executable, str(PREP), str(raw), str(dst), "--allow-white-loss"]
            subprocess.run(cmd, check=True)
            ok += 1
    print(f"Prepared {ok} mood staging sprites → {OUT_DIR}")


if __name__ == "__main__":
    main()
