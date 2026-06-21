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

text = re.sub(
    r'(<meta name="app-version" content=")[^"]*(")',
    rf"\1{v}\2",
    text,
    count=1,
)
text = re.sub(
    r'(href="css/style\.css\?v=)[^"]*(")',
    rf"\1{v}\2",
    text,
    count=1,
)

index.write_text(text)
print(f"index.html app-version -> {v}")
PY
