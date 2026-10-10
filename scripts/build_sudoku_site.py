#!/usr/bin/env python3
"""Build the standalone Sudoku policy site from its single source."""
from pathlib import Path
root = Path(__file__).resolve().parents[1]
source = (root / "home/sudoku/privacy.html").read_text(encoding="utf-8")
old_url = "https://nolsoopgames.com/sudoku/privacy.html"
new_url = "https://sudoku.nolsoopgames.com/privacy.html"
assert old_url in source, "Review the canonical URL before building."
page = source.replace(old_url, new_url)
# Shared navigation and assets remain on the studio host.
page = page.replace('href="/', 'href="https://nolsoopgames.com/')
page = page.replace('src="/', 'src="https://nolsoopgames.com/')
destination = root / "sudoku-site"
destination.mkdir(exist_ok=True)
(destination / "privacy.html").write_text(page, encoding="utf-8")
(destination / "index.html").write_text(
    '<!doctype html><html lang="ko"><head><meta charset="utf-8">'
    '<meta http-equiv="refresh" content="0;url=/privacy.html">'
    '<title>스도쿠 마스터 개인정보 처리방침</title></head>'
    '<body><a href="/privacy.html">개인정보 처리방침</a></body></html>',
    encoding="utf-8")
(destination / "_redirects").write_text("/ /privacy.html 302\n", encoding="utf-8")
print("Built standalone policy in sudoku-site/")
