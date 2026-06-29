#!/usr/bin/env python3
"""Assemble GRAC submission zip without re-recording video or rebuilding .ait."""

from __future__ import annotations

import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "grac-submission"
PKG = OUT / "abysspet-grac-submission"


def main() -> None:
    if PKG.exists():
        shutil.rmtree(PKG)
    PKG.mkdir(parents=True)
    shots = PKG / "screenshots"
    shots.mkdir()

    shutil.copy2(ROOT / "docs/GRAC-SUBMISSION-PACK.md", PKG / "01-game-description.md")
    shutil.copy2(ROOT / "docs/GRAC-DEMO-SUBMISSION.md", PKG / "02-demo-and-build-guide.md")
    shutil.copy2(ROOT / "docs/privacy.html", PKG / "03-privacy-policy.html")

    store = ROOT / "assets" / "ait-store"
    for pattern in ("screenshot-*.png",):
        for src in sorted(store.glob(pattern)):
            shutil.copy2(src, shots / src.name)

    for name in ("abysspet-grac-demo.mp4", "abysspet-grac-demo.webm"):
        src = OUT / name
        if src.exists():
            ext = src.suffix
            shutil.copy2(src, PKG / f"04-demo-video{ext}")
            break

    ait = OUT / "abysspet-sandbox.ait"
    if ait.exists():
        shutil.copy2(ait, PKG / "05-abysspet-sandbox.ait")

    readme = PKG / "README.txt"
    readme.write_text(
        """어비스펫 (abysspet) — GRAC 등급분류 제출 패키지
================================================

01-game-description.md     게임 설명서 (PDF 변환 후 첨부)
02-demo-and-build-guide.md 시연·빌드·QR 안내
03-privacy-policy.html     개인정보 처리방침
screenshots/               스크린샷
04-demo-video.*            시연 영상
05-abysspet-sandbox.ait    샌드박스 .ait (있는 경우)

문의: nolsoop.games@gmail.com
""",
        encoding="utf-8",
    )

    zip_path = OUT / "abysspet-grac-submission.zip"
    if zip_path.exists():
        zip_path.unlink()

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(PKG.rglob("*")):
            if path.is_file():
                zf.write(path, path.relative_to(OUT))

    print(f"package: {PKG}")
    print(f"zip:     {zip_path}")


if __name__ == "__main__":
    main()
