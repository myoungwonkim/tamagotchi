#!/usr/bin/env bash
# Sync index.html cache-bust query (?v=) with current git short SHA.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INDEX="$ROOT/index.html"
V="$(git -C "$ROOT" rev-parse --short HEAD)"

python3 - <<PY
from pathlib import Path
import re

index = Path("$INDEX")
text = index.read_text()
v = "$V"

def sub_meta(match):
    return f'{match.group(1)}{v}{match.group(2)}'

def sub_css(match):
    return f'{match.group(1)}{v}{match.group(2)}'

text = re.sub(
    r'(<meta name="app-version" content=")[^"]*(")',
    sub_meta,
    text,
    count=1,
)
text = re.sub(
    r'(href="css/style\.css\?v=)[^"]*(")',
    sub_css,
    text,
    count=1,
)

index.write_text(text)
print(f"index.html app-version -> {v}")
PY
