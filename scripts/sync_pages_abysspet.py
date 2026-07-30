#!/usr/bin/env python3
"""Assemble ./abysspet/ for GitHub Pages branch deploy.

Source files stay at the repo root (Vite / AiT). This mirror is what
pages-build-deployment publishes at https://nolsoopgames.com/abysspet/.

Prefer Settings → Pages → Source = GitHub Actions (see pages.yml) so the
root can redirect and this mirror is unnecessary — until then, run this
before pushing when game assets change:

  python3 scripts/sync_pages_abysspet.py
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "abysspet"
IGNORE = shutil.ignore_patterns(".DS_Store", "* 2.*", "* 3.*", "* 4.*")


def main() -> int:
    if DEST.exists():
        shutil.rmtree(DEST)
    DEST.mkdir()

    for name in ("index.html", "privacy.html", "terms-of-service.html"):
        shutil.copy2(ROOT / name, DEST / name)

    for name in ("css", "js"):
        shutil.copytree(ROOT / name, DEST / name, ignore=IGNORE)

    assets = DEST / "assets"
    assets.mkdir()
    shutil.copytree(ROOT / "assets" / "sprites", assets / "sprites", ignore=IGNORE)

    for optional in ("ait-store", "fonts"):
        src = ROOT / "assets" / optional
        if src.is_dir():
            shutil.copytree(src, assets / optional, ignore=IGNORE)

    app_icon_src = ROOT / "assets" / "app-icon"
    if app_icon_src.is_dir():
        app_icon = assets / "app-icon"
        app_icon.mkdir()
        for p in sorted(app_icon_src.iterdir()):
            if p.is_file() and " " not in p.name and not p.name.startswith("."):
                shutil.copy2(p, app_icon / p.name)

    for name in ("favicon.ico", "manifest.webmanifest"):
        src = ROOT / name
        if src.exists():
            shutil.copy2(src, DEST / name)

    (DEST / ".nojekyll").touch()
    print(f"assembled {DEST.relative_to(ROOT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
