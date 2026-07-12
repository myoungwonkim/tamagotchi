#!/usr/bin/env python3
"""Verify adultSpriteFrames.js registry entries have matching PNG assets."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REGISTRY = ROOT / "js" / "adultSpriteFrames.js"
SPRITE_ROOT = ROOT / "assets" / "sprites"


def sprite_path(theme: str, sprite_id: str) -> Path:
    if theme == "mermaid":
        return SPRITE_ROOT / "mermaid" / "adult" / f"{sprite_id}.png"
    if theme == "vent":
        return SPRITE_ROOT / "vent" / "adult" / f"{sprite_id}.png"
    return SPRITE_ROOT / "adult" / f"{sprite_id}.png"


def parse_registry(path: Path) -> list[tuple[str, str, list[str]]]:
    text = path.read_text(encoding="utf-8")
    entries: list[tuple[str, str, list[str]]] = []
    variant_id: str | None = None
    theme: str | None = None

    for line in text.splitlines():
        variant_match = re.match(r"\s{2}(\w+):\s*\{", line)
        if variant_match and "ids" not in line:
            variant_id = variant_match.group(1)
            continue

        theme_match = re.match(r"\s{4}(\w+):\s*\{", line)
        if theme_match and variant_id:
            theme = theme_match.group(1)
            continue

        ids_match = re.search(r'ids:\s*\[(.*?)\]', line)
        if ids_match and variant_id and theme:
            ids = re.findall(r'"([^"]+)"', ids_match.group(1))
            entries.append((variant_id, theme, ids))
            theme = None

    return entries


def main() -> int:
    if not REGISTRY.is_file():
        print(f"missing registry: {REGISTRY}", file=sys.stderr)
        return 1

    missing: list[str] = []
    for variant_id, theme, ids in parse_registry(REGISTRY):
        for sprite_id in ids:
            path = sprite_path(theme, sprite_id)
            if not path.is_file():
                missing.append(f"{variant_id}/{theme}: {path.relative_to(ROOT)}")

    if missing:
        print("Missing adult sprite frame assets:", file=sys.stderr)
        for item in missing:
            print(f"  - {item}", file=sys.stderr)
        return 1

    print(f"OK: verified {len(parse_registry(REGISTRY))} adult sprite frame configs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
