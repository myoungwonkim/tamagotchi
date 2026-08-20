#!/usr/bin/env bash
# Assemble GitHub Pages artifact for https://nolsoopgames.com/
# Canonical studio source: apex/  (this machine = source of truth)
# Used by .github/workflows/pages.yml and scripts/verify-apex-deploy.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-"$ROOT/_site"}"
cd "$ROOT"

# Prefer a clean DEST. If Finder .DS_Store blocks rm, fall back to a sibling dir.
if [ -d "$DEST" ]; then
  find "$DEST" -name .DS_Store -delete 2>/dev/null || true
  if ! rm -rf "$DEST" 2>/dev/null; then
    ALT="${DEST}.new-$$"
    echo "warn: could not remove $DEST; assembling into $ALT" >&2
    DEST="$ALT"
  fi
fi
mkdir -p "$DEST/abysspet"

cp apex/index.html "$DEST/index.html"
cp apex/about.html "$DEST/about.html"
cp apex/privacy.html "$DEST/privacy.html"
cp apex/terms.html "$DEST/terms.html"
cp apex/terms.html "$DEST/terms-of-service.html"
cp apex/robots.txt "$DEST/robots.txt"
cp apex/sitemap.xml "$DEST/sitemap.xml"
cp ads.txt "$DEST/ads.txt"
cp app-ads.txt "$DEST/app-ads.txt"
cp CNAME "$DEST/CNAME"
touch "$DEST/.nojekyll"

# Brand favicon for apex (pine "n") — from apex tree (synced by build-brand-icons.py)
if [ -f apex/favicon.ico ]; then
  cp apex/favicon.ico "$DEST/favicon.ico"
fi
if [ -d apex/assets ]; then
  mkdir -p "$DEST/assets"
  cp -R apex/assets/. "$DEST/assets/"
fi

if [ -d notion ]; then
  mkdir -p "$DEST/notion"
  cp -R notion/. "$DEST/notion/"
  touch "$DEST/notion/.nojekyll"
fi

APEX_DEST="$DEST" python3 - <<'PY'
import os
from pathlib import Path

dest = Path(os.environ["APEX_DEST"])

def redirect(target: str, rel: str) -> None:
    p = dest / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(
        "<!DOCTYPE html>\n<html lang=\"ko\"><head>\n"
        "<meta charset=\"UTF-8\">\n<title>Moved</title>\n"
        f"<link rel=\"canonical\" href=\"{target}\">\n"
        f"<meta http-equiv=\"refresh\" content=\"0; url={target}\">\n"
        "<meta name=\"robots\" content=\"noindex,follow\">\n"
        f"<script>location.replace({target!r});</script>\n"
        f"</head><body><p><a href=\"{target}\">{target}</a></p></body></html>\n",
        encoding="utf-8",
    )

base = "https://abysspet.nolsoopgames.com"
redirect(base + "/", "abysspet/index.html")
redirect(base + "/privacy.html", "abysspet/privacy.html")
redirect(base + "/terms-of-service.html", "abysspet/terms-of-service.html")
PY

echo "Apex site assembled at $DEST"
